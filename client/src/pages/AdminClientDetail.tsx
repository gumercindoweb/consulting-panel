import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, Rss, CheckSquare, BarChart3, Target, BookOpen, FileText, FolderOpen, LayoutDashboard, GripVertical, PauseCircle, PlayCircle } from "lucide-react";
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

type Tab = "phases" | "milestones" | "okrs" | "learnings" | "scope" | "resources" | "metrics" | "updates";

const TABS: { id: Tab; label: string; icon: React.FC<any>; title: string; subtitle: string }[] = [
  { id: "updates", label: "ACTUALIZACIONES", icon: Rss, title: "Actualizaciones del Proyecto", subtitle: "Publicá avances diarios que el cliente puede ver en su portal." },
  { id: "phases", label: "ETAPAS", icon: CheckSquare, title: "Etapas del Proyecto", subtitle: "Fases estratégicas con fechas, estado y progreso." },
  { id: "milestones", label: "HITOS", icon: BarChart3, title: "Hitos e Implementaciones", subtitle: "Logros y entregas clave del proyecto." },
  { id: "okrs", label: "OKRs", icon: Target, title: "OKRs y Resultados Clave", subtitle: "Objetivos medibles y su progreso actual." },
  { id: "learnings", label: "APRENDIZAJES", icon: BookOpen, title: "Aprendizajes y Obstáculos", subtitle: "Registro de aprendizajes, obstáculos y logros." },
  { id: "scope", label: "ALCANCE", icon: FileText, title: "Alcance del Proyecto", subtitle: "Qué está incluido y qué queda fuera del proyecto." },
  { id: "resources", label: "RECURSOS", icon: FolderOpen, title: "Recursos del Equipo", subtitle: "Documentos, guías y materiales compartidos." },
  { id: "metrics", label: "MÉTRICAS", icon: LayoutDashboard, title: "Métricas del Negocio", subtitle: "Indicadores clave de performance del cliente." },
];

// ─── UPDATES TAB ──────────────────────────────────────────────────────────────
function UpdatesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: updates = [] } = trpc.updates.list.useQuery({ clientId });
  const createUpdate = trpc.updates.create.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); toast.success("Actualización publicada."); setShowForm(false); setForm(EMPTY); },
    onError: (e) => toast.error(e.message),
  });
  const deleteUpdate = trpc.updates.delete.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); toast.success("Eliminada."); },
    onError: (e) => toast.error(e.message),
  });
  const updateUpdate = trpc.updates.update.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); toast.success("Guardada."); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });

  const EMPTY = { title: "", body: "", category: "general" as const, status: "on_track" as const, impact: "medium" as const, isPublic: true, date: new Date().toISOString().split("T")[0] };
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const inp = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: "13px", padding: "7px 10px", width: "100%", outline: "none" };

  const CAT_LABELS: Record<string, string> = { session: "SESIÓN", result: "RESULTADO", delivery: "ENTREGABLE", insight: "INSIGHT", blocker: "BLOQUEADOR", win: "LOGRO", general: "ACTUALIZACIÓN" };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
          <Plus size={14} /> NUEVA ACTUALIZACIÓN
        </button>
      ) : (
        <div className="gj-card p-5 space-y-3">
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "3px" }}>NUEVA ACTUALIZACIÓN</p>
          <input style={inp} placeholder="Título *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <textarea style={{ ...inp, minHeight: "80px", resize: "vertical" }} placeholder="Descripción *" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <select style={inp} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}>
              {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select style={inp} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
              <option value="on_track">EN CURSO</option><option value="at_risk">EN RIESGO</option><option value="blocked">BLOQUEADO</option><option value="completed">COMPLETADO</option>
            </select>
            <select style={inp} value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value as any }))}>
              <option value="high">IMPACTO ALTO</option><option value="medium">IMPACTO MEDIO</option><option value="low">IMPACTO BAJO</option>
            </select>
            <input type="date" style={inp} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--gj-muted)", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} />
            Visible para el cliente
          </label>
          <div className="flex gap-2">
            <button onClick={() => { if (form.title && form.body) createUpdate.mutate({ clientId, ...form }); }} disabled={!form.title || !form.body} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px", opacity: (!form.title || !form.body) ? 0.5 : 1 }}>
              <Save size={14} /> PUBLICAR
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="text-xs px-4 py-2 rounded" style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gj-muted)", cursor: "pointer", letterSpacing: "2px" }}>
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {updates.map((u) => (
        <div key={u.id} style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "16px" }}>
          {editingId === u.id ? (
            <div className="space-y-3">
              <input style={inp} value={editData.title ?? u.title} onChange={(e) => setEditData((d: any) => ({ ...d, title: e.target.value }))} />
              <textarea style={{ ...inp, minHeight: "70px", resize: "vertical" }} value={editData.body ?? u.body} onChange={(e) => setEditData((d: any) => ({ ...d, body: e.target.value }))} />
              <div className="grid grid-cols-2 gap-2">
                <select style={inp} value={editData.category ?? u.category} onChange={(e) => setEditData((d: any) => ({ ...d, category: e.target.value }))}>
                  {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select style={inp} value={editData.status ?? u.status} onChange={(e) => setEditData((d: any) => ({ ...d, status: e.target.value }))}>
                  <option value="on_track">EN CURSO</option><option value="at_risk">EN RIESGO</option><option value="blocked">BLOQUEADO</option><option value="completed">COMPLETADO</option>
                </select>
                <input type="date" style={inp} value={editData.date ?? new Date(u.date).toISOString().split("T")[0]} onChange={(e) => setEditData((d: any) => ({ ...d, date: e.target.value }))} />
                <label className="flex items-center gap-2 text-xs" style={{ color: "var(--gj-muted)", cursor: "pointer" }}>
                  <input type="checkbox" checked={editData.isPublic ?? u.isPublic} onChange={(e) => setEditData((d: any) => ({ ...d, isPublic: e.target.checked }))} />
                  Visible para el cliente
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateUpdate.mutate({ id: u.id, clientId, ...editData })} className="flex items-center gap-1 text-xs px-3 py-1 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}><Save size={12} /> GUARDAR</button>
                <button onClick={() => { setEditingId(null); setEditData({}); }} className="text-xs px-3 py-1 rounded" style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gj-muted)", cursor: "pointer", letterSpacing: "2px" }}>CANCELAR</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px" }}>{CAT_LABELS[u.category]}</span>
                  <span className="text-xs" style={{ color: "var(--gj-muted)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--gj-muted)" }}>{new Date(u.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {!u.isPublic && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(138,128,130,0.15)", color: "var(--gj-muted)", letterSpacing: "1px" }}>PRIVADO</span>}
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{u.title}</p>
                <p className="text-xs mt-1" style={{ color: "var(--gj-muted)", lineHeight: 1.5 }}>{u.body.slice(0, 120)}{u.body.length > 120 ? "…" : ""}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditingId(u.id); setEditData({}); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}><Edit3 size={13} /></button>
                <button onClick={() => { if (confirm("¿Eliminar?")) deleteUpdate.mutate({ id: u.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}><Trash2 size={13} /></button>
              </div>
            </div>
          )}
        </div>
      ))}

      {updates.length === 0 && !showForm && (
        <p className="text-xs" style={{ color: "var(--gj-muted)" }}>Sin actualizaciones publicadas todavía.</p>
      )}
    </div>
  );
}

// ─── PHASES TAB ───────────────────────────────────────────────────────────────
function PhasesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: phases = [] } = trpc.phases.list.useQuery({ clientId });
  const createPhase = trpc.phases.create.useMutation({
    onSuccess: () => { utils.phases.list.invalidate({ clientId }); toast.success("Etapa creada."); },
    onError: (e) => toast.error(e.message),
  });
  const updatePhase = trpc.phases.update.useMutation({
    onSuccess: () => { utils.phases.list.invalidate({ clientId }); toast.success("Etapa actualizada."); },
    onError: (e) => toast.error(e.message),
  });
  const deletePhase = trpc.phases.delete.useMutation({
    onSuccess: () => { utils.phases.list.invalidate({ clientId }); toast.success("Etapa eliminada."); },
    onError: (e) => toast.error(e.message),
  });

  const [newPhase, setNewPhase] = useState({ name: "", description: "", status: "pending" as const, order: phases.length });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const SDT_PHASES = [
    "Diagnóstico",
    "Q1 Optimización",
    "Plan 2026 Fase 1",
    "Plan 2026 Fase 2",
    "Plan 2026 Fase 3",
  ];

  return (
    <div className="space-y-6">
      {/* Quick-add SDT phases */}
      {phases.length === 0 && (
        <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
          <p className="text-xs tracking-widest mb-3" style={{ color: "var(--gj-mint)", letterSpacing: "3px" }}>
            CARGA RÁPIDA — FASES SDT
          </p>
          <div className="flex flex-wrap gap-2">
            {SDT_PHASES.map((name, i) => (
              <button
                key={name}
                onClick={() => createPhase.mutate({ clientId, name, order: i, status: i === 0 ? "completed" : i === 1 ? "completed" : i === 2 ? "in_progress" : "pending" })}
                className="text-xs px-3 py-2 rounded"
                style={{
                  background: "rgba(224,145,63,0.1)",
                  border: "1px solid rgba(224,145,63,0.25)",
                  color: "var(--gj-mint)",
                  cursor: "pointer",
                  letterSpacing: "2px",
                }}
              >
                + {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Existing phases */}
      <div className="space-y-2">
        {phases.map((phase) => (
          <div key={phase.id} style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "16px" }}>
            {editingId === phase.id ? (
              <div className="space-y-3">
                <input
                  value={editData.name ?? phase.name}
                  onChange={(e) => setEditData((d: any) => ({ ...d, name: e.target.value }))}
                  className="w-full px-3 py-2 text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}
                />
                <textarea
                  value={editData.description ?? phase.description ?? ""}
                  onChange={(e) => setEditData((d: any) => ({ ...d, description: e.target.value }))}
                  placeholder="Descripción..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}
                />
                <select
                  value={editData.status ?? phase.status}
                  onChange={(e) => setEditData((d: any) => ({ ...d, status: e.target.value }))}
                  className="px-3 py-2 text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En curso</option>
                  <option value="completed">Completada</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => { updatePhase.mutate({ id: phase.id, ...editData }); setEditingId(null); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                    <Save size={12} /> GUARDAR
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--gj-muted)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                    <X size={12} /> CANCELAR
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{phase.name}</p>
                  {phase.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{phase.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded" style={{ color: phase.status === "completed" ? "#4eba8a" : phase.status === "in_progress" ? "var(--gj-mint)" : "var(--gj-muted)", background: "rgba(255,255,255,0.05)", letterSpacing: "2px" }}>
                    {phase.status === "completed" ? "COMPLETADA" : phase.status === "in_progress" ? "EN CURSO" : "PENDIENTE"}
                  </span>
                  <button onClick={() => { setEditingId(phase.id); setEditData({}); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "4px" }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deletePhase.mutate({ id: phase.id })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add new */}
      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-3" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR ETAPA</p>
        <div className="flex gap-3">
          <input
            value={newPhase.name}
            onChange={(e) => setNewPhase((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nombre de la etapa..."
            className="flex-1 px-3 py-2 text-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}
          />
          <select
            value={newPhase.status}
            onChange={(e) => setNewPhase((f) => ({ ...f, status: e.target.value as any }))}
            className="px-3 py-2 text-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
          </select>
          <button
            onClick={() => { if (newPhase.name) { createPhase.mutate({ clientId, ...newPhase, order: phases.length }); setNewPhase({ name: "", description: "", status: "pending", order: phases.length + 1 }); } }}
            className="flex items-center gap-1 text-xs px-4 py-2 rounded"
            style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
          >
            <Plus size={14} /> AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MILESTONES TAB ───────────────────────────────────────────────────────────
const M_CAT: Record<string, { label: string; color: string }> = {
  strategy:       { label: "ESTRATEGIA",      color: "var(--gj-green)" },
  implementation: { label: "IMPLEMENTACIÓN",  color: "#E0913F" },
  training:       { label: "CAPACITACIÓN",    color: "#4eba8a" },
  automation:     { label: "AUTOMATIZACIÓN",  color: "#7c6fcd" },
  content:        { label: "CONTENIDO",       color: "#4db6e8" },
  analytics:      { label: "ANALÍTICA",       color: "var(--gj-mint)" },
  other:          { label: "OTRO",            color: "var(--gj-muted)" },
};
const M_STATUS: Record<string, { label: string; color: string }> = {
  completed:   { label: "COMPLETADO",  color: "#4eba8a" },
  in_progress: { label: "EN CURSO",   color: "#E0913F" },
  pending:     { label: "PENDIENTE",  color: "var(--gj-muted)" },
};
const M_IMPACT: Record<string, { label: string; color: string }> = {
  high:   { label: "ALTO IMPACTO",   color: "var(--gj-green)" },
  medium: { label: "IMPACTO MEDIO",  color: "#E0913F" },
  low:    { label: "IMPACTO BAJO",   color: "var(--gj-muted)" },
};

const INP = { background: "rgba(154,230,180,0.05)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: "13px", padding: "7px 10px", width: "100%", outline: "none" };

// ─── SORTABLE CARD WRAPPER ────────────────────────────────────────────────────
function SortableItem({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: "relative" }}>
      <div {...attributes} {...listeners} style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", cursor: "grab", color: "rgba(154,230,180,0.3)", zIndex: 1, padding: "4px", touchAction: "none" }}>
        <GripVertical size={14} />
      </div>
      {children}
    </div>
  );
}

function MilestonesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: serverMilestones = [] } = trpc.milestones.list.useQuery({ clientId });
  const [items, setItems] = useState(serverMilestones);

  // Sync local state when server data changes (after create/delete)
  useEffect(() => { setItems(serverMilestones); }, [serverMilestones]);

  const createMilestone = trpc.milestones.create.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito creado."); setShowForm(false); setForm(EMPTY_M); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMilestone = trpc.milestones.delete.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito eliminado."); },
    onError: (e) => toast.error(e.message),
  });
  const pauseMilestone = trpc.milestones.pause.useMutation({
    onSuccess: () => utils.milestones.list.invalidate({ clientId }),
    onError: (e) => toast.error(e.message),
  });
  const updateMilestone = trpc.milestones.update.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito actualizado."); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });
  const reorder = trpc.milestones.reorder.useMutation({ onError: (e) => toast.error(e.message) });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(m => m.id === active.id);
    const newIndex = items.findIndex(m => m.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorder.mutate({ clientId, ids: newItems.map(m => m.id) });
  }

  const EMPTY_M = { title: "", description: "", date: new Date().toISOString().split("T")[0], status: "completed" as const, category: "strategy" as const, impact: "medium" as const, resultType: null as any };
  const RESULT_TYPES: Record<string, { label: string; color: string }> = {
    result: { label: "RESULTADO", color: "var(--ambar)" },
    delivery: { label: "ENTREGABLE", color: "#E0913F" },
    win: { label: "LOGRO", color: "#4eba8a" },
    insight: { label: "INSIGHT", color: "#b87fd4" },
    blocker: { label: "BLOQUEADOR", color: "#B32825" },
  };
  const [form, setForm] = useState(EMPTY_M);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_M);

  return (
    <div className="space-y-6">
      {/* Botón agregar */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>
          <Plus size={13} /> AGREGAR HITO
        </button>
      ) : (
        <div style={{ background: "rgba(154,230,180,0.04)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-mint)", marginBottom: "14px", fontFamily: "var(--gj-font)" }}>NUEVO HITO</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Título del hito *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Descripción..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            <input type="date" style={INP} value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            <select style={INP} value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
              <option value="completed">Completado</option><option value="in_progress">En curso</option><option value="pending">Pendiente</option>
            </select>
            <select style={INP} value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as any }))}>
              <option value="strategy">Estrategia</option><option value="implementation">Implementación</option><option value="training">Capacitación</option>
              <option value="automation">Automatización</option><option value="content">Contenido</option><option value="analytics">Analítica</option><option value="other">Otro</option>
            </select>
            <select style={INP} value={form.impact} onChange={(e) => setForm(f => ({ ...f, impact: e.target.value as any }))}>
              <option value="high">Alto impacto</option><option value="medium">Impacto medio</option><option value="low">Bajo impacto</option>
            </select>
            {form.status === "completed" && (
              <select style={INP} value={form.resultType || ""} onChange={(e) => setForm(f => ({ ...f, resultType: e.target.value || null }))}>
                <option value="">Sin clasificar</option>
                <option value="result">Resultado</option>
                <option value="delivery">Entregable</option>
                <option value="win">Logro</option>
                <option value="insight">Insight</option>
                <option value="blocker">Bloqueador</option>
              </select>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { if (form.title) createMilestone.mutate({ clientId, ...form, date: new Date(form.date) }); }} disabled={!form.title} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", opacity: form.title ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_M); }} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Lista agrupada por mes con drag-and-drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {(() => {
            const grouped = items.reduce<Record<string, typeof items>>((acc, m) => {
              const key = new Date(m.date).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
              if (!acc[key]) acc[key] = [];
              acc[key].push(m);
              return acc;
            }, {});
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {Object.entries(grouped).map(([period, monthItems]) => (
                  <div key={period}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "10px", letterSpacing: "3px", padding: "4px 10px", borderRadius: "3px", background: "rgba(154,230,180,0.1)", border: "1px solid rgba(154,230,180,0.25)", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", textTransform: "uppercase" }}>
                        {period}
                      </span>
                      <div style={{ flex: 1, height: "1px", background: "rgba(154,230,180,0.1)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {monthItems.map((m) => {
                        const cat = M_CAT[m.category] || M_CAT.other;
                        const status = M_STATUS[m.status];
                        const impact = M_IMPACT[m.impact];
                        return (
                          <SortableItem key={m.id} id={m.id}>
                            <div style={{ background: m.isPaused ? "rgba(224,145,63,0.12)" : "rgba(154,230,180,0.03)", border: m.isPaused ? "1px solid rgba(224,145,63,0.4)" : "1px solid rgba(154,230,180,0.08)", borderLeft: `3px solid ${m.isPaused ? "rgba(224,145,63,0.6)" : status.color}`, borderRadius: "6px", padding: "14px 16px 14px 32px", display: "flex", gap: "14px", alignItems: "flex-start", opacity: m.isPaused ? 0.7 : 1, transition: "opacity 0.2s" }}>
                              <div style={{ width: 34, height: 34, borderRadius: "6px", background: `${cat.color}18`, border: `1px solid ${cat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                <span style={{ fontSize: "11px", color: cat.color, fontFamily: "var(--gj-font)" }}>{m.category.slice(0,2).toUpperCase()}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.3 }}>{m.title}</p>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                    {m.isPaused && (
                                      <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: "rgba(143,169,163,0.12)", border: "1px solid rgba(143,169,163,0.3)", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PAUSADO</span>
                                    )}
                                    {!m.isPaused && m.status === "completed" && m.resultType && (() => {
                                      const rt = RESULT_TYPES[m.resultType];
                                      return (
                                        <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${rt.color}22`, border: `1px solid ${rt.color}50`, color: rt.color, fontFamily: "var(--gj-font)", fontWeight: 600 }}>
                                          {m.resultType === "win" ? "⭐ " : ""}{rt.label}
                                        </span>
                                      );
                                    })()}
                                    {!m.isPaused && <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${impact.color}12`, border: `1px solid ${impact.color}30`, color: impact.color, fontFamily: "var(--gj-font)" }}>{impact.label}</span>}
                                    {!m.isPaused && <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${status.color}12`, border: `1px solid ${status.color}30`, color: status.color, fontFamily: "var(--gj-font)" }}>{status.label}</span>}
                                    <button
                                      title="Editar"
                                      onClick={() => { setEditingId(m.id); setEditForm({ title: m.title, description: m.description || "", date: m.date.split("T")[0], status: m.status, category: m.category, impact: m.impact, resultType: m.resultType }); }}
                                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      title={m.isPaused ? "Reactivar" : "Pausar"}
                                      onClick={() => pauseMilestone.mutate({ id: m.id, clientId, isPaused: !m.isPaused })}
                                      style={{ background: "none", border: "none", cursor: "pointer", color: m.isPaused ? "#4eba8a" : "var(--gj-muted)", padding: "2px" }}
                                    >
                                      {m.isPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                                    </button>
                                    <button onClick={() => { if (confirm("¿Eliminar hito?")) deleteMilestone.mutate({ id: m.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                                {editingId === m.id ? (
                                  <div style={{ background: "rgba(154,230,180,0.05)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "6px", padding: "12px", marginTop: "8px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                                      <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Título *" value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                                      <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Descripción..." value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
                                      <input type="date" style={INP} value={editForm.date} onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))} />
                                      <select style={INP} value={editForm.status} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as any }))}>
                                        <option value="completed">Completado</option><option value="in_progress">En curso</option><option value="pending">Pendiente</option>
                                      </select>
                                      <select style={INP} value={editForm.category} onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value as any }))}>
                                        <option value="strategy">Estrategia</option><option value="implementation">Implementación</option><option value="training">Capacitación</option>
                                        <option value="automation">Automatización</option><option value="content">Contenido</option><option value="analytics">Analítica</option><option value="other">Otro</option>
                                      </select>
                                      <select style={INP} value={editForm.impact} onChange={(e) => setEditForm(f => ({ ...f, impact: e.target.value as any }))}>
                                        <option value="high">Alto impacto</option><option value="medium">Impacto medio</option><option value="low">Bajo impacto</option>
                                      </select>
                                      {editForm.status === "completed" && (
                                        <select style={INP} value={editForm.resultType || ""} onChange={(e) => setEditForm(f => ({ ...f, resultType: e.target.value || null }))}>
                                          <option value="">Sin clasificar</option>
                                          <option value="result">Resultado</option>
                                          <option value="delivery">Entregable</option>
                                          <option value="win">Logro</option>
                                          <option value="insight">Insight</option>
                                          <option value="blocker">Bloqueador</option>
                                        </select>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <button onClick={() => { if (editForm.title) updateMilestone.mutate({ id: m.id, clientId, ...editForm, date: new Date(editForm.date) }); }} disabled={!editForm.title} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "6px 12px", fontSize: "10px", letterSpacing: "1px", cursor: "pointer", opacity: editForm.title ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
                                      <button onClick={() => setEditingId(null)} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "6px 12px", fontSize: "10px", letterSpacing: "1px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {m.description && <p style={{ fontSize: "12px", color: "var(--gj-muted)", lineHeight: 1.5, marginBottom: "6px" }}>{m.description}</p>}
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                      <span style={{ fontSize: "9px", letterSpacing: "2px", color: cat.color, fontFamily: "var(--gj-font)" }}>{cat.label}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(143,169,163,0.5)", fontFamily: "var(--gj-font)" }}>
                                        {new Date(m.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showForm && (
        <p style={{ fontSize: "13px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>No hay hitos registrados todavía.</p>
      )}
    </div>
  );
}

// ─── OKRs TAB ─────────────────────────────────────────────────────────────────
const OKR_STATUS: Record<string, { label: string; color: string }> = {
  on_track:  { label: "EN CURSO",   color: "#4eba8a" },
  at_risk:   { label: "EN RIESGO",  color: "#E0913F" },
  off_track: { label: "DESVIADO",   color: "#B32825" },
  completed: { label: "COMPLETADO", color: "var(--gj-mint)" },
};

function OKRsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: serverOkrs = [] } = trpc.okrs.list.useQuery({ clientId });
  const [items, setItems] = useState(serverOkrs);
  useEffect(() => { setItems(serverOkrs); }, [serverOkrs]);

  const createOkr = trpc.okrs.create.useMutation({
    onSuccess: () => { utils.okrs.list.invalidate({ clientId }); toast.success("OKR creado."); setShowForm(false); setForm(EMPTY_OKR); },
    onError: (e) => toast.error(e.message),
  });
  const deleteOkr = trpc.okrs.delete.useMutation({
    onSuccess: () => { utils.okrs.list.invalidate({ clientId }); toast.success("OKR eliminado."); },
    onError: (e) => toast.error(e.message),
  });
  const pauseOkr = trpc.okrs.pause.useMutation({
    onSuccess: () => utils.okrs.list.invalidate({ clientId }),
    onError: (e) => toast.error(e.message),
  });
  const updateOkr = trpc.okrs.update.useMutation({ onError: (e) => toast.error(e.message) });
  const reorder = trpc.okrs.reorder.useMutation({ onError: (e) => toast.error(e.message) });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(o => o.id === active.id);
    const newIndex = items.findIndex(o => o.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorder.mutate({ clientId, ids: newItems.map(o => o.id) });
  }

  const EMPTY_OKR = { objective: "", keyResult: "", targetValue: "", currentValue: "", unit: "", progressPct: 0, status: "on_track" as const, period: "", notes: "" };
  const [form, setForm] = useState(EMPTY_OKR);
  const [showForm, setShowForm] = useState(false);

  // Agrupar por objetivo (preservando el orden de items)
  const grouped = items.reduce<Record<string, typeof items>>((acc, okr) => {
    if (!acc[okr.objective]) acc[okr.objective] = [];
    acc[okr.objective].push(okr);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>
          <Plus size={13} /> AGREGAR OKR
        </button>
      ) : (
        <div style={{ background: "rgba(154,230,180,0.04)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-mint)", marginBottom: "14px", fontFamily: "var(--gj-font)" }}>NUEVO OKR</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Objetivo estratégico *" value={form.objective} onChange={(e) => setForm(f => ({ ...f, objective: e.target.value }))} />
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Resultado clave *" value={form.keyResult} onChange={(e) => setForm(f => ({ ...f, keyResult: e.target.value }))} />
            <input style={INP} placeholder="Meta (ej: 80)" value={form.targetValue} onChange={(e) => setForm(f => ({ ...f, targetValue: e.target.value }))} />
            <input style={INP} placeholder="Unidad (ej: personas/función)" value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))} />
            <input style={INP} placeholder="Período (ej: Q3 2025)" value={form.period} onChange={(e) => setForm(f => ({ ...f, period: e.target.value }))} />
            <select style={INP} value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
              <option value="on_track">En curso</option><option value="at_risk">En riesgo</option><option value="off_track">Desviado</option><option value="completed">Completado</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { if (form.objective && form.keyResult) createOkr.mutate({ clientId, ...form }); }} disabled={!form.objective || !form.keyResult} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", opacity: (form.objective && form.keyResult) ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_OKR); }} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* OKRs agrupados por objetivo */}
      {Object.entries(grouped).map(([objective, keyResults]) => {
        const avgProgress = Math.round(keyResults.reduce((s, kr) => s + kr.progressPct, 0) / keyResults.length);
        return (
          <div key={objective} style={{ background: "rgba(154,230,180,0.03)", border: "1px solid rgba(154,230,180,0.1)", borderRadius: "8px", padding: "22px" }}>
            {/* Objetivo header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", marginBottom: "6px" }}>OBJETIVO</p>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.3 }}>{objective}</p>
                {keyResults[0]?.period && (
                  <p style={{ fontSize: "10px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginTop: "4px" }}>{keyResults[0].period}</p>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--gj-mint)", fontFamily: "var(--gj-font)", lineHeight: 1 }}>{avgProgress}%</p>
                <p style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PROGRESO</p>
              </div>
            </div>
            {/* Barra de progreso */}
            <div style={{ height: "4px", background: "rgba(154,230,180,0.1)", borderRadius: "2px", marginBottom: "18px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${avgProgress}%`, background: "var(--gj-green)", borderRadius: "2px", transition: "width 0.4s" }} />
            </div>
            {/* Key results */}
            <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: "12px" }}>RESULTADOS CLAVE</p>
            {keyResults.map((kr) => {
              const st = OKR_STATUS[kr.status];
              return (
                <div key={kr.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0", borderTop: "1px solid rgba(154,230,180,0.07)" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.4, marginBottom: "6px" }}>{kr.keyResult}</p>
                    {(kr.targetValue || kr.currentValue) && (
                      <div style={{ display: "flex", gap: "12px" }}>
                        {kr.targetValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Meta: <strong style={{ color: "var(--gj-cream)" }}>{kr.targetValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                        {kr.currentValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Actual: <strong style={{ color: "var(--gj-mint)" }}>{kr.currentValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${st.color}12`, border: `1px solid ${st.color}30`, color: st.color, fontFamily: "var(--gj-font)" }}>{st.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <input type="number" min="0" max="100" value={kr.progressPct}
                        onChange={(e) => updateOkr.mutate({ id: kr.id, clientId, progressPct: parseInt(e.target.value) || 0 })}
                        style={{ width: "48px", background: "rgba(154,230,180,0.08)", border: "1px solid rgba(154,230,180,0.2)", borderRadius: "3px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", fontSize: "12px", padding: "3px 6px", textAlign: "center" }} />
                      <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>%</span>
                    </div>
                    <button onClick={() => { if (confirm("¿Eliminar OKR?")) deleteOkr.mutate({ id: kr.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Wrap entire grouped view in DnD (reorders across objetivos también) */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(o => o.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
            {Object.entries(grouped).map(([objective, keyResults]) => {
              const avgProgress = Math.round(keyResults.reduce((s, kr) => s + kr.progressPct, 0) / keyResults.length);
              return (
                <div key={objective} style={{ background: "rgba(154,230,180,0.03)", border: "1px solid rgba(154,230,180,0.1)", borderRadius: "8px", padding: "22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", marginBottom: "6px" }}>OBJETIVO</p>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.3 }}>{objective}</p>
                      {keyResults[0]?.period && <p style={{ fontSize: "10px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginTop: "4px" }}>{keyResults[0].period}</p>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--gj-mint)", fontFamily: "var(--gj-font)", lineHeight: 1 }}>{avgProgress}%</p>
                      <p style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PROGRESO</p>
                    </div>
                  </div>
                  <div style={{ height: "4px", background: "rgba(154,230,180,0.1)", borderRadius: "2px", marginBottom: "18px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${avgProgress}%`, background: "var(--gj-green)", borderRadius: "2px" }} />
                  </div>
                  <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: "12px" }}>RESULTADOS CLAVE</p>
                  {keyResults.map((kr) => {
                    const st = OKR_STATUS[kr.status];
                    return (
                      <SortableItem key={kr.id} id={kr.id}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 12px 12px 32px", borderTop: "1px solid rgba(154,230,180,0.07)", opacity: kr.isPaused ? 0.5 : 1, transition: "opacity 0.2s" }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "13px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.4, marginBottom: "6px" }}>{kr.keyResult}</p>
                            {(kr.targetValue || kr.currentValue) && (
                              <div style={{ display: "flex", gap: "12px" }}>
                                {kr.targetValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Meta: <strong style={{ color: "var(--gj-cream)" }}>{kr.targetValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                                {kr.currentValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Actual: <strong style={{ color: "var(--gj-mint)" }}>{kr.currentValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            {kr.isPaused
                              ? <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: "rgba(143,169,163,0.12)", border: "1px solid rgba(143,169,163,0.3)", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PAUSADO</span>
                              : <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${st.color}12`, border: `1px solid ${st.color}30`, color: st.color, fontFamily: "var(--gj-font)" }}>{st.label}</span>
                            }
                            {!kr.isPaused && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <input type="number" min="0" max="100" value={kr.progressPct}
                                  onChange={(e) => updateOkr.mutate({ id: kr.id, clientId, progressPct: parseInt(e.target.value) || 0 })}
                                  style={{ width: "48px", background: "rgba(154,230,180,0.08)", border: "1px solid rgba(154,230,180,0.2)", borderRadius: "3px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", fontSize: "12px", padding: "3px 6px", textAlign: "center" }} />
                                <span style={{ fontSize: "11px", color: "var(--gj-muted)" }}>%</span>
                              </div>
                            )}
                            <button
                              title={kr.isPaused ? "Reactivar" : "Pausar"}
                              onClick={() => pauseOkr.mutate({ id: kr.id, clientId, isPaused: !kr.isPaused })}
                              style={{ background: "none", border: "none", cursor: "pointer", color: kr.isPaused ? "#4eba8a" : "var(--gj-muted)", padding: "2px" }}
                            >
                              {kr.isPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                            </button>
                            <button onClick={() => { if (confirm("¿Eliminar OKR?")) deleteOkr.mutate({ id: kr.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </SortableItem>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showForm && (
        <p style={{ fontSize: "13px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>No hay OKRs registrados todavía.</p>
      )}
    </div>
  );
}

// ─── LEARNINGS TAB ────────────────────────────────────────────────────────────
const L_TYPE: Record<string, { label: string; plural: string; color: string; bg: string }> = {
  win:      { label: "LOGRO",        plural: "LOGROS",        color: "#4eba8a", bg: "rgba(78,186,138,0.06)" },
  learning: { label: "APRENDIZAJE",  plural: "APRENDIZAJES",  color: "#4db6e8", bg: "rgba(77,182,232,0.06)" },
  obstacle: { label: "OBSTÁCULO",    plural: "OBSTÁCULOS",    color: "#E0913F", bg: "rgba(224,145,63,0.06)" },
};

function LearningsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: serverLearnings = [] } = trpc.learnings.list.useQuery({ clientId });
  const [items, setItems] = useState(serverLearnings);
  useEffect(() => { setItems(serverLearnings); }, [serverLearnings]);

  const reorder = trpc.learnings.reorder.useMutation({ onError: (e) => toast.error(e.message) });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(l => l.id === active.id);
    const newIndex = items.findIndex(l => l.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorder.mutate({ clientId, ids: newItems.map(l => l.id) });
  }

  const createLearning = trpc.learnings.create.useMutation({
    onSuccess: () => { utils.learnings.list.invalidate({ clientId }); toast.success("Registro creado."); setShowForm(false); setForm(EMPTY_L); },
    onError: (e) => toast.error(e.message),
  });
  const deleteLearning = trpc.learnings.delete.useMutation({
    onSuccess: () => { utils.learnings.list.invalidate({ clientId }); toast.success("Registro eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const EMPTY_L = { type: "learning" as "learning" | "obstacle" | "win", title: "", description: "", resolution: "", date: new Date().toISOString().split("T")[0], isResolved: false };
  const [form, setForm] = useState(EMPTY_L);
  const [showForm, setShowForm] = useState(false);

  const wins = items.filter(l => l.type === "win");
  const learningItems = items.filter(l => l.type === "learning");
  const obstacles = items.filter(l => l.type === "obstacle");

  return (
    <div className="space-y-8">
      {/* Botón agregar */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>
          <Plus size={13} /> AGREGAR REGISTRO
        </button>
      ) : (
        <div style={{ background: "rgba(154,230,180,0.04)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-mint)", marginBottom: "14px", fontFamily: "var(--gj-font)" }}>NUEVO REGISTRO</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <select style={INP} value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}>
              <option value="win">Logro</option><option value="learning">Aprendizaje</option><option value="obstacle">Obstáculo</option>
            </select>
            <input type="date" style={INP} value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Título *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea style={{ ...INP, gridColumn: "1/-1", resize: "none" } as any} placeholder="Descripción..." rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            {form.type === "obstacle" && (
              <textarea style={{ ...INP, gridColumn: "1/-1", resize: "none" } as any} placeholder="Resolución (si aplica)..." rows={2} value={form.resolution} onChange={(e) => setForm(f => ({ ...f, resolution: e.target.value }))} />
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { if (form.title) createLearning.mutate({ clientId, ...form, date: new Date(form.date) }); }} disabled={!form.title} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", opacity: form.title ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_L); }} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Contador resumen */}
      {items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[{ label: "LOGROS", count: wins.length, color: "#4eba8a" }, { label: "APRENDIZAJES", count: learningItems.length, color: "#4db6e8" }, { label: "OBSTÁCULOS", count: obstacles.length, color: "#E0913F" }].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: "6px", padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "26px", fontWeight: 700, color: s.color, fontFamily: "var(--gj-font)", lineHeight: 1 }}>{s.count}</p>
              <p style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grupos por tipo con drag-and-drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {(["win", "learning", "obstacle"] as const).map((type) => {
            const typeItems = items.filter(l => l.type === type);
            if (typeItems.length === 0) return null;
            const cfg = L_TYPE[type];
            return (
              <div key={type}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "6px", background: cfg.bg, border: `1px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "10px", color: cfg.color, fontFamily: "var(--gj-font)" }}>{type === "win" ? "★" : type === "obstacle" ? "!" : "○"}</span>
                  </div>
                  <span style={{ fontSize: "9px", letterSpacing: "4px", color: cfg.color, fontFamily: "var(--gj-font)" }}>{cfg.plural}</span>
                  <div style={{ flex: 1, height: "1px", background: `${cfg.color}20` }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {typeItems.map(item => (
                    <SortableItem key={item.id} id={item.id}>
                      <div style={{ background: cfg.bg, border: "1px solid rgba(154,230,180,0.08)", borderLeft: `3px solid ${cfg.color}60`, borderRadius: "6px", padding: "14px 16px 14px 32px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>{item.title}</p>
                            {item.type === "obstacle" && (
                              <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 6px", borderRadius: "3px", marginTop: "4px", display: "inline-block", background: item.isResolved ? "rgba(78,186,138,0.12)" : "rgba(224,145,63,0.12)", border: `1px solid ${item.isResolved ? "#4eba8a" : "#E0913F"}40`, color: item.isResolved ? "#4eba8a" : "#E0913F", fontFamily: "var(--gj-font)" }}>
                                {item.isResolved ? "RESUELTO" : "ACTIVO"}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>{new Date(item.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                            <button onClick={() => { if (confirm("¿Eliminar?")) deleteLearning.mutate({ id: item.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--gj-muted)", lineHeight: 1.6 }}>{item.description}</p>
                        {item.resolution && (
                          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(154,230,180,0.08)" }}>
                            <p style={{ fontSize: "9px", letterSpacing: "3px", color: "#4eba8a", fontFamily: "var(--gj-font)", marginBottom: "4px" }}>RESOLUCIÓN</p>
                            <p style={{ fontSize: "12px", color: "rgba(154,230,180,0.7)" }}>{item.resolution}</p>
                          </div>
                        )}
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </div>
            );
          })}
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showForm && (
        <p style={{ fontSize: "13px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>No hay registros todavía.</p>
      )}
    </div>
  );
}

// ─── SCOPE TAB ────────────────────────────────────────────────────────────────
function ScopeTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: items = [] } = trpc.scope.list.useQuery({ clientId });
  const createScope = trpc.scope.create.useMutation({
    onSuccess: () => { utils.scope.list.invalidate({ clientId }); toast.success("Ítem de alcance creado."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteScope = trpc.scope.delete.useMutation({
    onSuccess: () => { utils.scope.list.invalidate({ clientId }); toast.success("Ítem eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ title: "", description: "", inScope: true, category: "" });

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="gj-card p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xs px-2 py-1 rounded" style={{ color: item.inScope ? "#4eba8a" : "#C77D54", background: item.inScope ? "rgba(78,186,138,0.1)" : "rgba(199,125,84,0.12)", letterSpacing: "2px" }}>
              {item.inScope ? "INCLUIDO" : "EXCLUIDO"}
            </span>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{item.title}</p>
              {item.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{item.description}</p>}
            </div>
          </div>
          <button onClick={() => deleteScope.mutate({ id: item.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR ÍTEM DE ALCANCE</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del ítem..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Categoría (opcional)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <select value={form.inScope ? "in" : "out"} onChange={(e) => setForm((f) => ({ ...f, inScope: e.target.value === "in" }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="in">Incluido en alcance</option>
            <option value="out">Fuera de alcance</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.title) { createScope.mutate({ clientId, ...form, order: items.length }); setForm({ title: "", description: "", inScope: true, category: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR
        </button>
      </div>
    </div>
  );
}

// ─── RESOURCES TAB ────────────────────────────────────────────────────────────
function ResourcesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: resources = [] } = trpc.resources.list.useQuery({ clientId });
  const createResource = trpc.resources.create.useMutation({
    onSuccess: () => { utils.resources.list.invalidate({ clientId }); toast.success("Recurso creado."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteResource = trpc.resources.delete.useMutation({
    onSuccess: () => { utils.resources.list.invalidate({ clientId }); toast.success("Recurso eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ title: "", description: "", category: "document" as const, externalUrl: "", content: "" });

  return (
    <div className="space-y-4">
      {resources.map((r) => (
        <div key={r.id} className="gj-card p-4 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px" }}>{r.category.toUpperCase()}</span>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--gj-cream)" }}>{r.title}</p>
            {r.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{r.description}</p>}
            {r.externalUrl && <a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 block" style={{ color: "var(--gj-green)" }}>{r.externalUrl}</a>}
          </div>
          <button onClick={() => deleteResource.mutate({ id: r.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR RECURSO</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del recurso..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} placeholder="URL (opcional)" className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Contenido de texto (opcional)..." rows={3} className="col-span-2 px-3 py-2 text-sm resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))} className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="document">Documento</option>
            <option value="template">Plantilla</option>
            <option value="script">Guión</option>
            <option value="training">Capacitación</option>
            <option value="guide">Guía</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.title) { createResource.mutate({ clientId, ...form, order: resources.length }); setForm({ title: "", description: "", category: "document", externalUrl: "", content: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR RECURSO
        </button>
      </div>
    </div>
  );
}

// ─── METRICS TAB ──────────────────────────────────────────────────────────────
function MetricsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: metrics = [] } = trpc.metrics.list.useQuery({ clientId });
  const createMetric = trpc.metrics.create.useMutation({
    onSuccess: () => { utils.metrics.list.invalidate({ clientId }); toast.success("Métrica creada."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMetric = trpc.metrics.delete.useMutation({
    onSuccess: () => { utils.metrics.list.invalidate({ clientId }); toast.success("Métrica eliminada."); },
    onError: (e) => toast.error(e.message),
  });
  const updateMetric = trpc.metrics.update.useMutation({
    onSuccess: () => { utils.metrics.list.invalidate({ clientId }); toast.success("Métrica actualizada."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ name: "", value: "", previousValue: "", unit: "", trend: "stable" as const, description: "", period: "" });

  return (
    <div className="space-y-4">
      {metrics.map((m) => (
        <div key={m.id} className="gj-card p-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs tracking-widest" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>{m.name.toUpperCase()}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <input
                value={m.value}
                onChange={(e) => updateMetric.mutate({ id: m.id, clientId, value: e.target.value })}
                className="text-2xl font-bold w-28 bg-transparent border-b"
                style={{ color: "var(--gj-mint)", borderColor: "rgba(255,255,255,0.1)", outline: "none", fontFamily: "var(--gj-font)" }}
              />
              {m.unit && <span className="text-sm" style={{ color: "var(--gj-muted)" }}>{m.unit}</span>}
            </div>
            {m.period && <p className="text-xs mt-1" style={{ color: "rgba(138,128,130,0.6)" }}>{m.period}</p>}
          </div>
          <button onClick={() => deleteMetric.mutate({ id: m.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR MÉTRICA</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre (ej: Reservas/mes)" className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="Valor actual (ej: 120)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Unidad (ej: reservas)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.previousValue} onChange={(e) => setForm((f) => ({ ...f, previousValue: e.target.value }))} placeholder="Valor anterior" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="Período (ej: Mayo 2026)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <select value={form.trend} onChange={(e) => setForm((f) => ({ ...f, trend: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="up">↑ Subiendo</option>
            <option value="down">↓ Bajando</option>
            <option value="stable">→ Estable</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.name && form.value) { createMetric.mutate({ clientId, ...form, order: metrics.length }); setForm({ name: "", value: "", previousValue: "", unit: "", trend: "stable", description: "", period: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR MÉTRICA
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminClientDetail() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ clientId: string }>();
  const clientId = parseInt(params.clientId || "0");
  const [activeTab, setActiveTab] = useState<Tab>("updates");

  const { data: client } = trpc.clients.get.useQuery({ id: clientId }, { enabled: !!clientId && isAuthenticated });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
    if (!loading && isAuthenticated && user?.role !== "admin") navigate("/dashboard");
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gj-petrol-ink)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gj-green)" }} />
      </div>
    );
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const branding = (client as any).branding as any;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gj-petrol-ink)" }}>
      {/* ── SIDEBAR ────────────────────────────────────────── */}
      <aside
        className="w-72 flex-shrink-0 flex flex-col"
        style={{
          background: "rgb(12,8,10)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          minHeight: "100vh",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Back + GJ brand */}
        <div className="px-6 pt-6 pb-2">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 mb-6"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: 0 }}
          >
            <ArrowLeft size={14} />
            <span style={{ fontSize: "10px", letterSpacing: "2px", fontFamily: "var(--gj-font)" }}>VOLVER</span>
          </button>
          {/* Logo GJ — siempre, no el del cliente */}
          <img src="/gj-logo.png" alt="Gumercindo Jiménez" style={{ height: 40, width: "auto", marginBottom: 16, objectFit: "contain" }} />
          <p style={{ fontSize: "10px", letterSpacing: "4px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", marginBottom: 4 }}>
            CONSULTOR
          </p>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", letterSpacing: "0.02em" }}>
            Gumercindo Jiménez
          </p>
          {/* Cliente como contexto, no como marca */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(154,230,180,0.1)" }}>
            <p style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: 4 }}>
              CLIENTE ACTIVO
            </p>
            <p style={{ fontSize: "13px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontWeight: 500 }}>
              {client.name}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="font-label text-xs tracking-widest px-3 mb-3" style={{ color: "var(--gj-muted)", letterSpacing: "4px", fontSize: "9px" }}>
            SECCIONES
          </p>
          <ul className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-200 rounded"
                    style={{
                      background: isActive ? "rgba(10,135,105,0.12)" : "transparent",
                      borderLeft: isActive ? "2px solid var(--gj-green)" : "2px solid transparent",
                      color: isActive ? "var(--gj-cream)" : "var(--gj-muted)",
                      cursor: "pointer",
                      border: "none",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.color = "var(--gj-cream)"; } }}
                    onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--gj-muted)"; } }}
                  >
                    <Icon size={14} style={{ color: isActive ? "var(--gj-green)" : "inherit", flexShrink: 0 }} />
                    <span className="font-label text-xs tracking-wider" style={{ letterSpacing: "2px", lineHeight: 1.3 }}>
                      {tab.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-6 py-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <a
            href={`/dashboard/${clientId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-xs py-2 rounded w-full"
            style={{ background: "rgba(10,135,105,0.1)", color: "var(--gj-green)", border: "1px solid rgba(10,135,105,0.2)", textDecoration: "none", letterSpacing: "2px", fontFamily: "var(--font-label)" }}
          >
            VER COMO CLIENTE →
          </a>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 overflow-auto" style={{ minWidth: 0 }}>
        {/* Topbar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-8 py-4"
          style={{ background: "rgba(8,5,7,0.95)", borderBottom: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
        >
          <div>
            <p className="font-label text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "5px" }}>
              {client.name.toUpperCase()}
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>
              Gestión de consultoría estratégica
            </p>
          </div>
          <img src="/gj-logo.png" alt="GJ" style={{ height: 24, width: "auto", opacity: 0.6 }} />
        </div>

        {/* Section content */}
        <div className="p-8">
          {/* Section header */}
          <p className="font-label" style={{ fontSize: "10px", letterSpacing: "4px", color: "var(--gj-green)", marginBottom: "6px" }}>
            {activeTabDef.label}
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--gj-cream)", lineHeight: 1.1, marginBottom: "8px" }}>
            {activeTabDef.title}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--gj-muted)", marginBottom: "24px", fontFamily: "var(--gj-font)" }}>
            {activeTabDef.subtitle}
          </p>
          <div className="sdt-divider" style={{ marginBottom: "28px" }} />

          {activeTab === "updates" && <UpdatesTab clientId={clientId} />}
          {activeTab === "phases" && <PhasesTab clientId={clientId} />}
          {activeTab === "milestones" && <MilestonesTab clientId={clientId} />}
          {activeTab === "okrs" && <OKRsTab clientId={clientId} />}
          {activeTab === "learnings" && <LearningsTab clientId={clientId} />}
          {activeTab === "scope" && <ScopeTab clientId={clientId} />}
          {activeTab === "resources" && <ResourcesTab clientId={clientId} />}
          {activeTab === "metrics" && <MetricsTab clientId={clientId} />}
        </div>
      </main>
    </div>
  );
}
