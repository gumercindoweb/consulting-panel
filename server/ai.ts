import { z } from "zod";
import { invokeChat, type ChatMessage } from "./_core/anthropic";
import {
  getPhasesByClient,
  getMilestonesByClient,
  getOkrsByClient,
  getMetricsByClient,
  getUpdatesByClient,
  getLearningsByClient,
  createPhase,
  updatePhase,
  createMilestone,
  updateMilestone,
  createUpdate,
  createOkr,
  updateOkr,
  createMetric,
  createLearning,
} from "./db";

// ─── ESQUEMA DE ACCIONES ─────────────────────────────────────────────────────
// Cada acción que la IA puede proponer. El campo `label` es texto legible en
// español que se muestra al admin en el panel de revisión antes de guardar.

const dateStr = z.string().min(4); // "YYYY-MM-DD"

const createPhaseData = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["completed", "in_progress", "pending"]).optional(),
  startDate: dateStr.optional(),
  endDate: dateStr.optional(),
});

const updatePhaseData = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["completed", "in_progress", "pending"]).optional(),
  startDate: dateStr.optional(),
  endDate: dateStr.optional(),
});

const createMilestoneData = z.object({
  phaseId: z.number().nullable().optional(),
  title: z.string().min(1),
  description: z.string().optional(),
  date: dateStr,
  status: z.enum(["completed", "in_progress", "pending"]).optional(),
  category: z
    .enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"])
    .optional(),
  impact: z.enum(["high", "medium", "low"]).optional(),
});

const updateMilestoneData = z.object({
  id: z.number(),
  phaseId: z.number().nullable().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  date: dateStr.optional(),
  status: z.enum(["completed", "in_progress", "pending"]).optional(),
  category: z
    .enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"])
    .optional(),
  impact: z.enum(["high", "medium", "low"]).optional(),
});

const createUpdateData = z.object({
  phaseId: z.number().nullable().optional(),
  milestoneId: z.number().nullable().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
  category: z.enum(["session", "result", "delivery", "insight", "blocker", "win", "general"]).optional(),
  status: z.enum(["on_track", "at_risk", "blocked", "completed"]).optional(),
  impact: z.enum(["high", "medium", "low"]).optional(),
  date: dateStr,
  isPublic: z.boolean().optional(),
});

const createOkrData = z.object({
  phaseId: z.number().nullable().optional(),
  objective: z.string().min(1),
  keyResult: z.string().min(1),
  targetValue: z.string().optional(),
  currentValue: z.string().optional(),
  unit: z.string().optional(),
  progressPct: z.number().min(0).max(100).optional(),
  status: z.enum(["on_track", "at_risk", "off_track", "completed"]).optional(),
  period: z.string().optional(),
  notes: z.string().optional(),
});

const updateOkrData = z.object({
  id: z.number(),
  objective: z.string().optional(),
  keyResult: z.string().optional(),
  targetValue: z.string().optional(),
  currentValue: z.string().optional(),
  progressPct: z.number().min(0).max(100).optional(),
  status: z.enum(["on_track", "at_risk", "off_track", "completed"]).optional(),
  period: z.string().optional(),
  notes: z.string().optional(),
});

const createMetricData = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  previousValue: z.string().optional(),
  unit: z.string().optional(),
  trend: z.enum(["up", "down", "stable"]).optional(),
  description: z.string().optional(),
  period: z.string().optional(),
});

const createLearningData = z.object({
  phaseId: z.number().nullable().optional(),
  type: z.enum(["learning", "obstacle", "win"]).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  resolution: z.string().optional(),
  date: dateStr,
  isResolved: z.boolean().optional(),
});

export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("create_phase"), label: z.string(), data: createPhaseData }),
  z.object({ type: z.literal("update_phase"), label: z.string(), data: updatePhaseData }),
  z.object({ type: z.literal("create_milestone"), label: z.string(), data: createMilestoneData }),
  z.object({ type: z.literal("update_milestone"), label: z.string(), data: updateMilestoneData }),
  z.object({ type: z.literal("create_update"), label: z.string(), data: createUpdateData }),
  z.object({ type: z.literal("create_okr"), label: z.string(), data: createOkrData }),
  z.object({ type: z.literal("update_okr"), label: z.string(), data: updateOkrData }),
  z.object({ type: z.literal("create_metric"), label: z.string(), data: createMetricData }),
  z.object({ type: z.literal("create_learning"), label: z.string(), data: createLearningData }),
]);

export type AIAction = z.infer<typeof actionSchema>;

export const interpretResultSchema = z.object({
  reply: z.string(),
  needsClarification: z.boolean().optional(),
  actions: z.array(actionSchema).default([]),
});

export type InterpretResult = z.infer<typeof interpretResultSchema>;

// ─── CONTEXTO DEL CLIENTE ────────────────────────────────────────────────────
// Carga el estado actual del cliente y lo serializa compacto para el prompt.
async function loadClientContext(clientId: number) {
  const [phases, milestones, okrs, metrics, updates, learnings] = await Promise.all([
    getPhasesByClient(clientId),
    getMilestonesByClient(clientId, true),
    getOkrsByClient(clientId, true),
    getMetricsByClient(clientId),
    getUpdatesByClient(clientId),
    getLearningsByClient(clientId),
  ]);

  const fmt = (d: Date | string | null | undefined) =>
    d ? new Date(d).toISOString().split("T")[0] : null;

  return {
    phaseIds: new Set(phases.map((p) => p.id)),
    okrIds: new Set(okrs.map((o) => o.id)),
    milestoneIds: new Set(milestones.map((m) => m.id)),
    snapshot: {
      etapas: phases.map((p) => ({ id: p.id, nombre: p.name, estado: p.status })),
      hitos: milestones.map((m) => ({
        id: m.id,
        titulo: m.title,
        etapaId: m.phaseId,
        estado: m.status,
        fecha: fmt(m.date),
      })),
      objetivos: okrs.map((o) => ({
        id: o.id,
        objetivo: o.objective,
        keyResult: o.keyResult,
        progreso: o.progressPct,
        estado: o.status,
      })),
      metricas: metrics.map((m) => ({ nombre: m.name, valor: m.value })),
      ultimasActualizaciones: updates.slice(0, 8).map((u) => ({
        titulo: u.title,
        categoria: u.category,
        fecha: fmt(u.date),
      })),
      aprendizajes: learnings.map((l) => ({ id: l.id, tipo: l.type, titulo: l.title })),
    },
  };
}

// ─── SYSTEM PROMPT ───────────────────────────────────────────────────────────
function buildSystemPrompt(clientName: string, snapshot: unknown): string {
  const today = new Date().toISOString().split("T")[0];
  return `Sos el asistente de carga del panel de consultoría de Gumercindo Jiménez. Tu trabajo es ayudar al consultor (el ADMINISTRADOR, no el cliente) a cargar y actualizar la información del proyecto del cliente "${clientName}" hablando en lenguaje natural en español.

El consultor te cuenta qué pasó en el proyecto y vos interpretás esa información y la traducís en ACCIONES concretas sobre las secciones del panel. NO ejecutás nada todavía: solo PROPONÉS las acciones para que el consultor las revise y confirme.

La fecha de hoy es ${today}.

## Estructura del panel (entidades que podés crear/actualizar)

1. **Etapas** (fases del proyecto): name, description, status (completed | in_progress | pending), startDate, endDate.
2. **Hitos** (milestones, entregables clave): title, description, date (obligatoria), status (completed | in_progress | pending), category (strategy | implementation | training | automation | content | analytics | other), impact (high | medium | low). Un hito puede colgar de una etapa vía phaseId.
3. **Actualizaciones** (novedades/sesiones): title, body, category (session | result | delivery | insight | blocker | win | general), status (on_track | at_risk | blocked | completed), date. Puede vincularse a una etapa (phaseId) y/o a un hito (milestoneId).
4. **Objetivos (OKRs)**: objective, keyResult, targetValue, currentValue, unit, progressPct (0-100), status (on_track | at_risk | off_track | completed), period.
5. **Métricas (KPIs)**: name, value, previousValue, unit, trend (up | down | stable), period.
6. **Aprendizajes**: type (learning | obstacle | win), title, description, resolution, date.

## Estado ACTUAL del cliente "${clientName}"

Usá estos IDs reales cuando necesites ACTUALIZAR algo existente (ej. marcar un hito como completado, cambiar el estado de una etapa). NO inventes IDs.

${JSON.stringify(snapshot, null, 2)}

## Reglas

- Vinculá hitos, actualizaciones y objetivos a la etapa correcta usando phaseId cuando el contexto lo permita.
- Para ACTUALIZAR algo existente usá su id real del estado de arriba (update_phase, update_milestone, update_okr). Para crear algo nuevo usá las acciones create_*.
- Las fechas SIEMPRE en formato "YYYY-MM-DD". Si el consultor no da fecha, usá la de hoy (${today}).
- NO inventes datos que el consultor no mencionó. Si falta información esencial (ej. a qué etapa pertenece un hito y hay varias posibles), poné needsClarification en true y preguntá en "reply" en vez de adivinar.
- Si el consultor solo charla o pregunta algo sin pedir cargar nada, devolvé actions vacío y respondé en "reply".
- El campo "label" de cada acción debe ser una frase corta y clara en español describiendo qué se va a hacer (ej. "Marcar hito 'Lanzamiento web' como completado").
- "reply" es tu mensaje conversacional al consultor, en español, resumiendo qué entendiste.

## Formato de salida (OBLIGATORIO)

Respondé ÚNICAMENTE con un objeto JSON válido, sin texto antes ni después, sin bloques de código markdown. Estructura:

{
  "reply": "string — tu mensaje al consultor en español",
  "needsClarification": false,
  "actions": [
    { "type": "create_milestone", "label": "Crear hito ... ", "data": { ... } }
  ]
}`;
}

// Extrae el primer objeto JSON de la respuesta del modelo, tolerando que venga
// envuelto en ```json ... ``` o con texto alrededor.
function extractJson(text: string): unknown {
  const trimmed = text.trim();
  // Quitar fences markdown si los hay.
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    // Buscar el primer { ... último } como fallback.
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("La IA no devolvió un JSON válido.");
  }
}

// ─── INTERPRET ───────────────────────────────────────────────────────────────
export async function interpretMessage(opts: {
  clientId: number;
  clientName: string;
  message: string;
  history: ChatMessage[];
}): Promise<InterpretResult> {
  const ctx = await loadClientContext(opts.clientId);
  const system = buildSystemPrompt(opts.clientName, ctx.snapshot);

  const messages: ChatMessage[] = [
    ...opts.history,
    { role: "user", content: opts.message },
  ];

  const raw = await invokeChat({ system, messages, maxTokens: 4096 });
  const parsed = interpretResultSchema.safeParse(extractJson(raw));
  if (!parsed.success) {
    // Si el modelo se desvió del formato, devolvemos su texto como charla.
    return { reply: raw.slice(0, 2000), actions: [] };
  }

  // Filtrar referencias a IDs que no pertenecen a este cliente (seguridad).
  const safeActions = parsed.data.actions.filter((a) => {
    if (a.type === "update_phase") return ctx.phaseIds.has(a.data.id);
    if (a.type === "update_milestone") return ctx.milestoneIds.has(a.data.id);
    if (a.type === "update_okr") return ctx.okrIds.has(a.data.id);
    return true;
  });

  return { ...parsed.data, actions: safeActions };
}

// ─── EXECUTE ─────────────────────────────────────────────────────────────────
export type ExecuteResult = { label: string; ok: boolean; error?: string };

const toDate = (s?: string | null) => (s ? new Date(s) : undefined);

export async function executeActions(opts: {
  clientId: number;
  actions: AIAction[];
}): Promise<ExecuteResult[]> {
  const { clientId } = opts;

  // Cargar etapas existentes una vez para validar phaseId y calcular orden.
  const existingPhases = await getPhasesByClient(clientId);
  const validPhaseIds = new Set(existingPhases.map((p) => p.id));
  let phaseOrder = existingPhases.length;

  // Saneamos phaseId: si apunta a una etapa que no existe en este cliente, lo
  // descartamos para no romper la integridad referencial.
  const validPhase = (id?: number | null) =>
    id != null && validPhaseIds.has(id) ? id : undefined;

  const results: ExecuteResult[] = [];

  for (const action of opts.actions) {
    try {
      switch (action.type) {
        case "create_phase": {
          await createPhase({
            clientId,
            name: action.data.name,
            description: action.data.description,
            status: action.data.status ?? "pending",
            startDate: toDate(action.data.startDate),
            endDate: toDate(action.data.endDate),
            order: phaseOrder++,
          } as any);
          break;
        }
        case "update_phase": {
          if (!validPhaseIds.has(action.data.id)) {
            throw new Error("La etapa no pertenece a este cliente.");
          }
          await updatePhase(action.data.id, {
            name: action.data.name,
            description: action.data.description,
            status: action.data.status,
            startDate: toDate(action.data.startDate),
            endDate: toDate(action.data.endDate),
          } as any);
          break;
        }
        case "create_milestone": {
          await createMilestone({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            title: action.data.title,
            description: action.data.description,
            date: new Date(action.data.date),
            status: action.data.status ?? "pending",
            category: action.data.category ?? "other",
            impact: action.data.impact ?? "medium",
          } as any);
          break;
        }
        case "update_milestone": {
          await updateMilestone(action.data.id, clientId, {
            phaseId: action.data.phaseId === undefined ? undefined : validPhase(action.data.phaseId) ?? null,
            title: action.data.title,
            description: action.data.description,
            date: toDate(action.data.date),
            status: action.data.status,
            category: action.data.category,
            impact: action.data.impact,
          } as any);
          break;
        }
        case "create_update": {
          await createUpdate({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            milestoneId: action.data.milestoneId ?? undefined,
            title: action.data.title,
            body: action.data.body,
            category: action.data.category ?? "general",
            status: action.data.status ?? "on_track",
            impact: action.data.impact ?? "medium",
            isPublic: action.data.isPublic ?? true,
            date: new Date(action.data.date),
          } as any);
          break;
        }
        case "create_okr": {
          await createOkr({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            objective: action.data.objective,
            keyResult: action.data.keyResult,
            targetValue: action.data.targetValue,
            currentValue: action.data.currentValue,
            unit: action.data.unit,
            progressPct: action.data.progressPct ?? 0,
            status: action.data.status ?? "on_track",
            period: action.data.period,
            notes: action.data.notes,
          } as any);
          break;
        }
        case "update_okr": {
          await updateOkr(action.data.id, clientId, {
            objective: action.data.objective,
            keyResult: action.data.keyResult,
            targetValue: action.data.targetValue,
            currentValue: action.data.currentValue,
            progressPct: action.data.progressPct,
            status: action.data.status,
            period: action.data.period,
            notes: action.data.notes,
          } as any);
          break;
        }
        case "create_metric": {
          await createMetric({
            clientId,
            name: action.data.name,
            value: action.data.value,
            previousValue: action.data.previousValue,
            unit: action.data.unit,
            trend: action.data.trend ?? "stable",
            description: action.data.description,
            period: action.data.period,
            order: 0,
          } as any);
          break;
        }
        case "create_learning": {
          await createLearning({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            type: action.data.type ?? "learning",
            title: action.data.title,
            description: action.data.description,
            resolution: action.data.resolution,
            date: new Date(action.data.date),
            isResolved: action.data.isResolved ?? false,
          } as any);
          break;
        }
      }
      results.push({ label: action.label, ok: true });
    } catch (error) {
      results.push({
        label: action.label,
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return results;
}
