import { trpc } from "@/lib/trpc";
import { useState, useEffect, useRef } from "react";
import { Plus, Edit3, Trash2, Flag, AlertTriangle, ChevronDown, ChevronRight, GripVertical, Eye, EyeOff, Circle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props { clientId: number }

const PHASE_STATUS: Record<string, { label: string; color: string }> = {
  completed:   { label: "COMPLETADA",  color: "#4eba8a" },
  in_progress: { label: "EN CURSO",    color: "#E0913F" },
  pending:     { label: "PENDIENTE",   color: "rgba(143,169,163,0.5)" },
};

const M_STATUS: Record<string, { label: string; color: string }> = {
  completed:   { label: "COMPLETADO",  color: "#4eba8a" },
  in_progress: { label: "EN CURSO",   color: "#E0913F" },
  pending:     { label: "PENDIENTE",  color: "rgba(143,169,163,0.5)" },
};

const CAT_COLORS: Record<string, string> = {
  session: "#E0913F", result: "#4eba8a", delivery: "#B32825",
  insight: "#9b8af0", blocker: "#e05252", win: "#4eba8a", general: "rgba(143,169,163,0.5)",
};
const CAT_LABELS: Record<string, string> = {
  session: "SESIÓN", result: "RESULTADO", delivery: "ENTREGABLE",
  insight: "INSIGHT", blocker: "BLOQUEADOR", win: "LOGRO", general: "ACTUALIZACIÓN",
};

const INP: React.CSSProperties = {
  background: "rgba(154,230,180,0.05)", border: "1px solid rgba(154,230,180,0.15)",
  borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)",
  fontSize: "13px", padding: "7px 10px", width: "100%", outline: "none",
};
const BTN_SAVE: React.CSSProperties = {
  background: "var(--gj-green)", color: "var(--gj-cream)", border: "none",
  borderRadius: "3px", padding: "6px 14px", fontSize: "10px", letterSpacing: "2px",
  cursor: "pointer", fontFamily: "var(--gj-font)",
};
const BTN_CANCEL: React.CSSProperties = {
  background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)",
  borderRadius: "3px", padding: "6px 14px", fontSize: "10px", letterSpacing: "2px",
  cursor: "pointer", fontFamily: "var(--gj-font)",
};
const ICON_BTN: React.CSSProperties = {
  background: "none", border: "none", cursor: "pointer",
  color: "var(--gj-muted)", padding: "3px", flexShrink: 0,
};

const EMPTY_M = {
  title: "", description: "",
  date: new Date().toISOString().split("T")[0],
  status: "completed" as const,
  category: "strategy" as const,
  impact: "medium" as const,
};

// Wrapper con drag handle para reordenar hitos dentro de una etapa.
function SortableMilestone({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const [hover, setHover] = useState(false);
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: "relative" }}>
      <div
        {...attributes}
        {...listeners}
        title="Arrastrá para reordenar este hito"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          position: "absolute", left: 2, top: "50%", transform: "translateY(-50%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          width: 20, height: 28, borderRadius: 4,
          cursor: isDragging ? "grabbing" : "grab",
          color: hover || isDragging ? "var(--gj-mint)" : "rgba(154,230,180,0.65)",
          background: hover || isDragging ? "rgba(154,230,180,0.14)" : "rgba(154,230,180,0.05)",
          border: "1px solid rgba(154,230,180,0.15)",
          zIndex: 2, touchAction: "none",
        }}
      >
        <GripVertical size={14} />
      </div>
      {children}
    </div>
  );
}

// ── Checklist de Onboarding / Outboarding ──────────────────────────────────
export type StageChecklist = { visible: boolean; items: { id: string; text: string; done: boolean }[] };
const EMPTY_CHECKLIST: StageChecklist = { visible: false, items: [] };
const newChecklistItemId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

function StageChecklistEditor({ title, subtitle, accent, value, onSave }: {
  title: string; subtitle: string; accent: string; value: StageChecklist; onSave: (c: StageChecklist) => void;
}) {
  const [state, setState] = useState<StageChecklist>(value);
  const [draft, setDraft] = useState("");
  // Resync solo cuando cambia el contenido real del server (no en cada render).
  useEffect(() => { setState(value); }, [JSON.stringify(value)]);
  const dirty = JSON.stringify(state) !== JSON.stringify(value);
  const items = state.items ?? [];
  const setItems = (its: StageChecklist["items"]) => setState((s) => ({ ...s, items: its }));
  const addItem = () => { const t = draft.trim(); if (!t) return; setItems([...items, { id: newChecklistItemId(), text: t, done: false }]); setDraft(""); };

  const fieldStyle = { flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: 13, padding: "6px 10px", outline: "none" as const };

  return (
    <div style={{ border: `1px solid ${accent}33`, borderRadius: 8, padding: 16, background: `${accent}0a` }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: 3, color: accent, fontWeight: 700, fontFamily: "var(--gj-font)" }}>{title}</p>
          <p style={{ fontSize: 11, color: "var(--gj-muted)", marginTop: 2 }}>{subtitle}</p>
        </div>
        <button type="button" onClick={() => setState((s) => ({ ...s, visible: !s.visible }))} title="Mostrar u ocultar al cliente"
          style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 6, fontSize: 10, letterSpacing: 1, padding: "6px 10px", borderRadius: 6, cursor: "pointer",
            background: state.visible ? "rgba(78,186,138,0.15)" : "rgba(255,255,255,0.05)", color: state.visible ? "#4eba8a" : "var(--gj-muted)", border: `1px solid ${state.visible ? "rgba(78,186,138,0.4)" : "rgba(255,255,255,0.12)"}`, fontFamily: "var(--gj-font)" }}>
          {state.visible ? <Eye size={13} /> : <EyeOff size={13} />} {state.visible ? "VISIBLE AL CLIENTE" : "OCULTO AL CLIENTE"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((it) => (
          <div key={it.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button type="button" onClick={() => setItems(items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)))} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: it.done ? "#4eba8a" : "var(--gj-muted)", display: "flex", flexShrink: 0 }}>
              {it.done ? <CheckCircle2 size={16} /> : <Circle size={16} />}
            </button>
            <input value={it.text} onChange={(e) => setItems(items.map((x) => (x.id === it.id ? { ...x, text: e.target.value } : x)))} style={{ ...fieldStyle, textDecoration: it.done ? "line-through" : "none", opacity: it.done ? 0.6 : 1 }} />
            <button type="button" onClick={() => setItems(items.filter((x) => x.id !== it.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: 4, flexShrink: 0 }}><Trash2 size={13} /></button>
          </div>
        ))}
        {items.length === 0 && <p style={{ fontSize: 12, color: "var(--gj-muted)", fontStyle: "italic" }}>Sin pasos todavía.</p>}
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} placeholder="Agregar paso..." style={fieldStyle} />
        <button type="button" onClick={addItem} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, letterSpacing: 1, padding: "6px 12px", borderRadius: 6, cursor: "pointer", background: "rgba(255,255,255,0.06)", color: "var(--gj-cream)", border: "none", fontFamily: "var(--gj-font)" }}><Plus size={13} /> PASO</button>
      </div>

      {dirty && (
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button type="button" onClick={() => onSave(state)} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, letterSpacing: 2, padding: "7px 14px", borderRadius: 6, cursor: "pointer", background: accent, color: "#0d0a0c", border: "none", fontWeight: 700, fontFamily: "var(--gj-font)" }}>GUARDAR CAMBIOS</button>
          <button type="button" onClick={() => setState(value)} style={{ fontSize: 11, letterSpacing: 2, padding: "7px 14px", borderRadius: 6, cursor: "pointer", background: "transparent", color: "var(--gj-muted)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "var(--gj-font)" }}>DESCARTAR</button>
        </div>
      )}
    </div>
  );
}

export default function TimelineTab({ clientId }: Props) {
  const utils = trpc.useUtils();
  const { data: client } = trpc.clients.get.useQuery({ id: clientId });
  const updateClient = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.get.invalidate({ id: clientId }); toast.success("Guardado."); },
    onError: (e) => toast.error(e.message),
  });
  const { data: phases = [] } = trpc.phases.list.useQuery({ clientId });
  const { data: serverMilestones = [] } = trpc.milestones.list.useQuery({ clientId });
  const { data: updates = [] } = trpc.updates.list.useQuery({ clientId });

  // Estado local optimista para poder reordenar con drag-and-drop sin esperar
  // el round-trip del server; se resincroniza cuando cambia la query.
  const [milestones, setMilestones] = useState(serverMilestones);
  useEffect(() => { setMilestones(serverMilestones); }, [serverMilestones]);

  // Phase mutations
  const createPhase = trpc.phases.create.useMutation({
    onSuccess: () => { utils.phases.list.invalidate({ clientId }); toast.success("Etapa creada."); setNewPhase({ name: "", description: "", status: "pending" }); },
    onError: (e) => toast.error(e.message),
  });
  const updatePhase = trpc.phases.update.useMutation({
    onSuccess: () => { utils.phases.list.invalidate({ clientId }); toast.success("Etapa actualizada."); setEditingPhaseId(null); setEditPhaseData({}); },
    onError: (e) => toast.error(e.message),
  });
  const deletePhase = trpc.phases.delete.useMutation({
    onSuccess: () => { utils.phases.list.invalidate({ clientId }); toast.success("Etapa eliminada."); },
    onError: (e) => toast.error(e.message),
  });

  // Milestone mutations
  const createMilestone = trpc.milestones.create.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito creado."); setAddingToPhase(null); setNewMilestone(EMPTY_M); },
    onError: (e) => toast.error(e.message),
  });
  const updateMilestone = trpc.milestones.update.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito actualizado."); setEditingMilestoneId(null); setEditMilestoneData({}); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMilestone = trpc.milestones.delete.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito eliminado."); },
    onError: (e) => toast.error(e.message),
  });
  const reorderMilestones = trpc.milestones.reorder.useMutation({ onError: (e) => toast.error(e.message) });
  const dndSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Reordena los hitos DENTRO de una etapa, preservando la posición relativa
  // de los hitos de las demás etapas (mismo mecanismo que MilestonesTab: un
  // único sortOrder global, pero acá el drag queda acotado a una sola etapa
  // para que mover un hito sea cómodo aunque tenga fechas lejanas entre sí).
  function handleMilestoneDragEnd(phaseId: number, event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const phaseSubset = milestones.filter((m) => (m as any).phaseId === phaseId);
    const oldIdx = phaseSubset.findIndex((m) => m.id === active.id);
    const newIdx = phaseSubset.findIndex((m) => m.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const reorderedSubset = arrayMove(phaseSubset, oldIdx, newIdx);
    let cursor = 0;
    const newItems = milestones.map((m) =>
      (m as any).phaseId === phaseId ? reorderedSubset[cursor++] : m
    );
    setMilestones(newItems);
    reorderMilestones.mutate({ clientId, ids: newItems.map((m) => m.id) });
  }

  // Phase editing state
  const [editingPhaseId, setEditingPhaseId] = useState<number | null>(null);
  const [editPhaseData, setEditPhaseData] = useState<any>({});
  const [newPhase, setNewPhase] = useState({ name: "", description: "", status: "pending" as const });

  // Milestone add per-phase
  const [addingToPhase, setAddingToPhase] = useState<number | null>(null);
  const [newMilestone, setNewMilestone] = useState(EMPTY_M);

  // Milestone editing state
  const [editingMilestoneId, setEditingMilestoneId] = useState<number | null>(null);
  const [editMilestoneData, setEditMilestoneData] = useState<any>({});

  // Collapse state: set of phase IDs that are collapsed
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const initializedRef = useRef(false);
  useEffect(() => {
    if (phases.length > 0 && !initializedRef.current) {
      initializedRef.current = true;
      // Auto-collapse completed phases on first load
      setCollapsed(new Set(phases.filter((p) => p.status === "completed").map((p) => p.id)));
    }
  }, [phases]);

  const toggleCollapse = (id: number) =>
    setCollapsed((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const allCollapsed = phases.length > 0 && phases.every((p) => collapsed.has(p.id));
  const toggleAll = () =>
    setCollapsed(allCollapsed ? new Set() : new Set(phases.map((p) => p.id)));

  // Helpers
  const milestonesByPhase = (phaseId: number) =>
    milestones.filter((m) => (m as any).phaseId === phaseId);
  const updatesByMilestone = (milestoneId: number) =>
    updates.filter((u) => (u as any).milestoneId === milestoneId);
  const updatesWithPhaseOnly = (phaseId: number) =>
    updates.filter((u) => (u as any).phaseId === phaseId && !(u as any).milestoneId);
  const orphanedMilestones = milestones.filter((m) => !(m as any).phaseId);
  const totalCompleted = phases.filter((p) => p.status === "completed").length;

  // Map original index (for "ETAPA N" label) by id
  const phaseOriginalIndex = Object.fromEntries(phases.map((p, i) => [p.id, i + 1]));
  // Orden: la etapa vigente (en curso) primero; el resto descendente (3, 2, 1).
  const sortedPhases = [...phases].sort((a, b) => {
    const rank: Record<string, number> = { in_progress: 0, pending: 1, completed: 2 };
    const r = (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
    if (r !== 0) return r;
    return ((phaseOriginalIndex[b.id] as number) ?? 0) - ((phaseOriginalIndex[a.id] as number) ?? 0);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

      {/* Global collapse toggle */}
      {phases.length > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={toggleAll}
            style={{
              background: "none", border: "1px solid rgba(154,230,180,0.2)",
              color: "var(--gj-muted)", borderRadius: "3px",
              padding: "4px 12px", fontSize: "10px", letterSpacing: "2px",
              cursor: "pointer", fontFamily: "var(--gj-font)",
              display: "flex", alignItems: "center", gap: "5px",
            }}
          >
            {allCollapsed ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
            {allCollapsed ? "EXPANDIR TODO" : "COLAPSAR TODO"}
          </button>
        </div>
      )}

      {/* ── ONBOARDING (entrada del cliente) — arriba de las etapas ── */}
      <StageChecklistEditor
        title="ONBOARDING · ENTRADA DEL CLIENTE"
        subtitle="Pasos para integrar al cliente antes de arrancar las etapas."
        accent="#4db6e8"
        value={((client as any)?.onboarding as StageChecklist) ?? EMPTY_CHECKLIST}
        onSave={(c) => updateClient.mutate({ id: clientId, onboarding: c })}
      />

      {sortedPhases.map((phase) => {
        const cfg = PHASE_STATUS[phase.status] ?? PHASE_STATUS.pending;
        const phaseMilestones = milestonesByPhase(phase.id);
        const phaseOnlyUpdates = updatesWithPhaseOnly(phase.id);
        const isEditingPhase = editingPhaseId === phase.id;
        const isCollapsed = collapsed.has(phase.id);
        const phaseNum = phaseOriginalIndex[phase.id];

        return (
          <div
            key={phase.id}
            style={{
              background: "rgba(154,230,180,0.03)",
              border: "1px solid rgba(154,230,180,0.08)",
              borderLeft: `3px solid ${cfg.color}`,
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            {/* ── Phase header ── */}
            <div style={{ padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
              {/* Chevron toggle */}
              <button
                onClick={() => toggleCollapse(phase.id)}
                title={isCollapsed ? "Expandir" : "Colapsar"}
                style={{ background: "none", border: "none", cursor: "pointer", color: cfg.color, padding: "2px 4px 0 0", flexShrink: 0, marginTop: 2 }}
              >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                  <span style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>
                    ETAPA {phaseNum}
                  </span>
                  <span style={{
                    fontSize: "9px", letterSpacing: "1px", padding: "2px 6px", borderRadius: "3px",
                    background: `${cfg.color}15`, border: `1px solid ${cfg.color}35`,
                    color: cfg.color, fontFamily: "var(--gj-font)",
                  }}>
                    {cfg.label}
                  </span>
                </div>

                {isEditingPhase ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                      style={INP}
                      placeholder="Nombre de la etapa..."
                      value={editPhaseData.name ?? phase.name}
                      onChange={(e) => setEditPhaseData((d: any) => ({ ...d, name: e.target.value }))}
                    />
                    <textarea
                      style={{ ...INP, resize: "none" }}
                      rows={2}
                      placeholder="Descripción..."
                      value={editPhaseData.description ?? phase.description ?? ""}
                      onChange={(e) => setEditPhaseData((d: any) => ({ ...d, description: e.target.value }))}
                    />
                    <select
                      style={INP}
                      value={editPhaseData.status ?? phase.status}
                      onChange={(e) => setEditPhaseData((d: any) => ({ ...d, status: e.target.value }))}
                    >
                      <option value="pending">Pendiente</option>
                      <option value="in_progress">En curso</option>
                      <option value="completed">Completada</option>
                    </select>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        style={BTN_SAVE}
                        onClick={() => updatePhase.mutate({ id: phase.id, ...editPhaseData })}
                      >GUARDAR</button>
                      <button
                        style={BTN_CANCEL}
                        onClick={() => { setEditingPhaseId(null); setEditPhaseData({}); }}
                      >CANCELAR</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.3 }}>
                      {phase.name}
                    </p>
                    {phase.description && (
                      <p style={{ fontSize: "12px", color: "var(--gj-muted)", marginTop: "3px", lineHeight: 1.4 }}>
                        {phase.description}
                      </p>
                    )}
                  </>
                )}
              </div>

              {!isEditingPhase && (
                <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                  <button
                    title="Editar etapa"
                    style={ICON_BTN}
                    onClick={() => { setEditingPhaseId(phase.id); setEditPhaseData({}); }}
                  ><Edit3 size={13} /></button>
                  <button
                    title="Eliminar etapa"
                    style={ICON_BTN}
                    onClick={() => { if (confirm(`¿Eliminar la etapa "${phase.name}"?`)) deletePhase.mutate({ id: phase.id }); }}
                  ><Trash2 size={13} /></button>
                </div>
              )}
            </div>

            {!isCollapsed && (
            <>
            {/* ── Milestones ── */}
            {phaseMilestones.length > 0 && (
              <div style={{ marginLeft: "24px", paddingLeft: "14px", paddingBottom: "4px", borderLeft: `2px solid ${cfg.color}25` }}>
                <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={(e) => handleMilestoneDragEnd(phase.id, e)}>
                <SortableContext items={phaseMilestones.map((m) => m.id)} strategy={verticalListSortingStrategy}>
                {phaseMilestones.map((m) => {
                  const ms = M_STATUS[m.status] ?? M_STATUS.pending;
                  const mUpdates = updatesByMilestone(m.id);
                  const isEditingM = editingMilestoneId === m.id;

                  return (
                    <SortableMilestone key={m.id} id={m.id}>
                    <div style={{ marginBottom: "8px" }}>
                      <div style={{
                        padding: "8px 10px 8px 26px",
                        background: `${ms.color}08`,
                        borderLeft: `2px solid ${ms.color}55`,
                        borderRadius: "4px",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <Flag size={12} style={{ color: ms.color, flexShrink: 0, marginTop: 3 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {isEditingM ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <input
                                  style={INP}
                                  placeholder="Título del hito..."
                                  value={editMilestoneData.title ?? m.title}
                                  onChange={(e) => setEditMilestoneData((d: any) => ({ ...d, title: e.target.value }))}
                                />
                                <input
                                  style={INP}
                                  placeholder="Descripción..."
                                  value={editMilestoneData.description ?? m.description ?? ""}
                                  onChange={(e) => setEditMilestoneData((d: any) => ({ ...d, description: e.target.value }))}
                                />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                                  <input
                                    type="date"
                                    style={INP}
                                    value={editMilestoneData.date ?? new Date(m.date).toISOString().split("T")[0]}
                                    onChange={(e) => setEditMilestoneData((d: any) => ({ ...d, date: e.target.value }))}
                                  />
                                  <select
                                    style={INP}
                                    value={editMilestoneData.status ?? m.status}
                                    onChange={(e) => setEditMilestoneData((d: any) => ({ ...d, status: e.target.value }))}
                                  >
                                    <option value="completed">Completado</option>
                                    <option value="in_progress">En curso</option>
                                    <option value="pending">Pendiente</option>
                                  </select>
                                </div>
                                <div style={{ display: "flex", gap: "6px" }}>
                                  <button
                                    style={BTN_SAVE}
                                    onClick={() => {
                                      const d = editMilestoneData;
                                      updateMilestone.mutate({
                                        id: m.id, clientId,
                                        ...d,
                                        date: d.date ? new Date(d.date) : undefined,
                                      });
                                    }}
                                  >GUARDAR</button>
                                  <button
                                    style={BTN_CANCEL}
                                    onClick={() => { setEditingMilestoneId(null); setEditMilestoneData({}); }}
                                  >CANCELAR</button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                                <div>
                                  <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
                                    {m.title}
                                  </span>
                                  <span style={{ fontSize: "9px", letterSpacing: "1px", marginLeft: "8px", color: ms.color }}>
                                    {ms.label}
                                  </span>
                                  {m.date && (
                                    <span style={{ fontSize: "10px", marginLeft: "8px", color: "var(--gj-muted)" }}>
                                      {new Date(m.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                                    </span>
                                  )}
                                  {m.description && (
                                    <p style={{ fontSize: "11px", color: "var(--gj-muted)", marginTop: "2px", lineHeight: 1.4 }}>
                                      {m.description}
                                    </p>
                                  )}
                                </div>
                                <div style={{ display: "flex", gap: "2px", flexShrink: 0 }}>
                                  <button
                                    title="Editar hito"
                                    style={ICON_BTN}
                                    onClick={() => { setEditingMilestoneId(m.id); setEditMilestoneData({}); }}
                                  ><Edit3 size={12} /></button>
                                  <button
                                    title="Eliminar hito"
                                    style={ICON_BTN}
                                    onClick={() => { if (confirm(`¿Eliminar "${m.title}"?`)) deleteMilestone.mutate({ id: m.id, clientId }); }}
                                  ><Trash2 size={12} /></button>
                                </div>
                              </div>
                            )}

                            {/* Updates under milestone */}
                            {!isEditingM && mUpdates.length > 0 && (
                              <div style={{ marginTop: "6px", marginLeft: "4px", paddingLeft: "10px", borderLeft: `1px dashed ${ms.color}30` }}>
                                {mUpdates.map((u) => (
                                  <div key={(u as any).id} style={{ padding: "3px 0" }}>
                                    <span style={{ fontSize: "9px", letterSpacing: "1px", color: CAT_COLORS[(u as any).category] ?? "var(--gj-muted)" }}>
                                      {CAT_LABELS[(u as any).category] ?? (u as any).category}
                                    </span>
                                    <span style={{ fontSize: "9px", color: "var(--gj-muted)", marginLeft: "6px" }}>
                                      {new Date((u as any).date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                                    </span>
                                    <p style={{ fontSize: "11px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", marginTop: "1px" }}>
                                      {(u as any).title}
                                    </p>
                                    {(u as any).url && (
                                      <a href={(u as any).url} target="_blank" rel="noopener noreferrer" style={{ fontSize: "10px", color: "var(--gj-mint)", letterSpacing: "1px" }}>
                                        🔗 Ver referencia
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    </SortableMilestone>
                  );
                })}
                </SortableContext>
                </DndContext>
              </div>
            )}

            {/* ── Phase-only updates (without milestone) ── */}
            {phaseOnlyUpdates.length > 0 && (
              <div style={{ marginLeft: "24px", paddingLeft: "14px", paddingBottom: "4px", borderLeft: `2px dashed ${cfg.color}18` }}>
                <p style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--gj-muted)", marginBottom: "4px", fontFamily: "var(--gj-font)" }}>
                  ACTUALIZACIONES GENERALES
                </p>
                {phaseOnlyUpdates.map((u) => (
                  <div key={(u as any).id} style={{ padding: "3px 0" }}>
                    <span style={{ fontSize: "9px", letterSpacing: "1px", color: CAT_COLORS[(u as any).category] ?? "var(--gj-muted)" }}>
                      {CAT_LABELS[(u as any).category] ?? (u as any).category}
                    </span>
                    <span style={{ fontSize: "9px", color: "var(--gj-muted)", marginLeft: "6px" }}>
                      {new Date((u as any).date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                    </span>
                    <p style={{ fontSize: "11px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", marginTop: "1px" }}>
                      {(u as any).title}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Add milestone inline ── */}
            <div style={{ padding: "8px 16px 14px" }}>
              {addingToPhase === phase.id ? (
                <div style={{ background: "rgba(154,230,180,0.04)", border: "1px solid rgba(154,230,180,0.12)", borderRadius: "6px", padding: "14px" }}>
                  <p style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gj-mint)", marginBottom: "10px", fontFamily: "var(--gj-font)" }}>
                    NUEVO HITO EN ESTA ETAPA
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    <input
                      style={INP}
                      placeholder="Título del hito *"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone((f) => ({ ...f, title: e.target.value }))}
                    />
                    <input
                      style={INP}
                      placeholder="Descripción..."
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone((f) => ({ ...f, description: e.target.value }))}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                      <input
                        type="date"
                        style={INP}
                        value={newMilestone.date}
                        onChange={(e) => setNewMilestone((f) => ({ ...f, date: e.target.value }))}
                      />
                      <select
                        style={INP}
                        value={newMilestone.status}
                        onChange={(e) => setNewMilestone((f) => ({ ...f, status: e.target.value as any }))}
                      >
                        <option value="completed">Completado</option>
                        <option value="in_progress">En curso</option>
                        <option value="pending">Pendiente</option>
                      </select>
                      <select
                        style={INP}
                        value={newMilestone.category}
                        onChange={(e) => setNewMilestone((f) => ({ ...f, category: e.target.value as any }))}
                      >
                        <option value="strategy">Estrategia</option>
                        <option value="implementation">Implementación</option>
                        <option value="training">Capacitación</option>
                        <option value="automation">Automatización</option>
                        <option value="content">Contenido</option>
                        <option value="analytics">Analítica</option>
                        <option value="other">Otro</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        style={{ ...BTN_SAVE, opacity: newMilestone.title ? 1 : 0.5 }}
                        disabled={!newMilestone.title}
                        onClick={() => createMilestone.mutate({
                          clientId,
                          phaseId: phase.id,
                          ...newMilestone,
                          date: new Date(newMilestone.date),
                        })}
                      >GUARDAR HITO</button>
                      <button
                        style={BTN_CANCEL}
                        onClick={() => { setAddingToPhase(null); setNewMilestone(EMPTY_M); }}
                      >CANCELAR</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  style={{
                    display: "flex", alignItems: "center", gap: "5px",
                    background: "none", border: `1px dashed ${cfg.color}40`,
                    color: cfg.color, borderRadius: "3px",
                    padding: "5px 12px", fontSize: "10px", letterSpacing: "2px",
                    cursor: "pointer", fontFamily: "var(--gj-font)",
                  }}
                  onClick={() => { setAddingToPhase(phase.id); setNewMilestone(EMPTY_M); }}
                >
                  <Plus size={11} /> AGREGAR HITO A ESTA ETAPA
                </button>
              )}
            </div>
            </>
            )}
          </div>
        );
      })}

      {/* ── Orphaned milestones warning ── */}
      {orphanedMilestones.length > 0 && (
        <div style={{
          background: "rgba(224,145,63,0.06)", border: "1px solid rgba(224,145,63,0.25)",
          borderLeft: "3px solid #E0913F", borderRadius: "6px", padding: "14px 16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <AlertTriangle size={13} style={{ color: "#E0913F" }} />
            <span style={{ fontSize: "10px", letterSpacing: "3px", color: "#E0913F", fontFamily: "var(--gj-font)" }}>
              HITOS SIN ETAPA ({orphanedMilestones.length})
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "var(--gj-muted)", marginBottom: "10px", lineHeight: 1.5 }}>
            Estos hitos no aparecen en la Hoja de Ruta del cliente porque no están vinculados a ninguna etapa.
            Podés asignarlos desde la pestaña <strong style={{ color: "var(--gj-cream)" }}>HITOS E IMPLEMENTACIONES</strong>.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {orphanedMilestones.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 8px", background: "rgba(255,255,255,0.03)", borderRadius: "3px" }}>
                <Flag size={10} style={{ color: "#E0913F", flexShrink: 0 }} />
                <span style={{ fontSize: "12px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>{m.title}</span>
                <span style={{ fontSize: "10px", color: "var(--gj-muted)", marginLeft: "auto" }}>
                  {new Date(m.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Progress bar ── */}
      {phases.length > 0 && (
        <div style={{
          padding: "14px 16px",
          background: "rgba(224,145,63,0.05)", border: "1px solid rgba(224,145,63,0.18)",
          borderRadius: "6px",
        }}>
          <p style={{ fontSize: "9px", letterSpacing: "3px", color: "#E0913F", fontFamily: "var(--gj-font)", marginBottom: "6px" }}>
            PROGRESO GENERAL
          </p>
          <p style={{ fontSize: "20px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            {totalCompleted}<span style={{ fontSize: "14px", color: "var(--gj-muted)", marginLeft: "4px" }}>/ {phases.length} etapas completadas</span>
          </p>
          <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: "2px", marginTop: "10px" }}>
            <div style={{
              height: "100%",
              width: `${phases.length ? (totalCompleted / phases.length) * 100 : 0}%`,
              background: "#4eba8a", borderRadius: "2px", transition: "width 0.5s",
            }} />
          </div>
        </div>
      )}

      {/* ── OUTBOARDING (cierre / salida del cliente) — abajo de las etapas ── */}
      <StageChecklistEditor
        title="OUTBOARDING · CIERRE DEL CLIENTE"
        subtitle="Pasos de cierre / handoff al terminar las etapas."
        accent="#E0913F"
        value={((client as any)?.outboarding as StageChecklist) ?? EMPTY_CHECKLIST}
        onSave={(c) => updateClient.mutate({ id: clientId, outboarding: c })}
      />

      {/* ── Add phase form ── */}
      <div style={{
        background: "rgba(154,230,180,0.03)", border: "1px solid rgba(154,230,180,0.08)",
        borderRadius: "6px", padding: "16px 18px",
      }}>
        <p style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: "12px" }}>
          AGREGAR ETAPA
        </p>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <input
            style={{ ...INP, flex: "1 1 200px" }}
            placeholder="Nombre de la etapa..."
            value={newPhase.name}
            onChange={(e) => setNewPhase((f) => ({ ...f, name: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newPhase.name) {
                createPhase.mutate({ clientId, ...newPhase, order: phases.length });
              }
            }}
          />
          <select
            style={{ ...INP, flex: "0 0 auto", width: "auto" }}
            value={newPhase.status}
            onChange={(e) => setNewPhase((f) => ({ ...f, status: e.target.value as any }))}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
          </select>
          <button
            style={{ ...BTN_SAVE, opacity: newPhase.name ? 1 : 0.5, display: "flex", alignItems: "center", gap: "5px" }}
            disabled={!newPhase.name}
            onClick={() => { if (newPhase.name) createPhase.mutate({ clientId, ...newPhase, order: phases.length }); }}
          >
            <Plus size={12} /> AGREGAR
          </button>
        </div>
        {newPhase.name && (
          <input
            style={{ ...INP, marginTop: "8px" }}
            placeholder="Descripción (opcional)..."
            value={newPhase.description}
            onChange={(e) => setNewPhase((f) => ({ ...f, description: e.target.value }))}
          />
        )}
      </div>

      {phases.length === 0 && (
        <p style={{ fontSize: "13px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>
          No hay etapas aún. Agregá la primera para empezar a construir la Hoja de Ruta.
        </p>
      )}
    </div>
  );
}
