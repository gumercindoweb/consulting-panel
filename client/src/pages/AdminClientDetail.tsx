import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, Rss, CheckSquare, BarChart3, Target, BookOpen, FileText, FolderOpen, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";

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

  const inp = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)", fontSize: "13px", padding: "7px 10px", width: "100%", outline: "none" };

  const CAT_LABELS: Record<string, string> = { session: "SESIÓN", result: "RESULTADO", delivery: "ENTREGABLE", insight: "INSIGHT", blocker: "BLOQUEADOR", win: "LOGRO", general: "ACTUALIZACIÓN" };

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
          <Plus size={14} /> NUEVA ACTUALIZACIÓN
        </button>
      ) : (
        <div className="gj-card p-5 space-y-3">
          <p className="text-xs tracking-widest" style={{ color: "var(--ambar)", letterSpacing: "3px" }}>NUEVA ACTUALIZACIÓN</p>
          <input style={inp} placeholder="Título *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <textarea style={{ ...inp, minHeight: "80px", resize: "vertical" }} placeholder="Descripción *" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <select style={inp} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}>
              {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select style={inp} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
              <option value="on_track">EN CURSO</option><option value="at_risk">EN RIESGO</option><option value="blocked">BLOQUEADO</option>
            </select>
            <select style={inp} value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value as any }))}>
              <option value="high">IMPACTO ALTO</option><option value="medium">IMPACTO MEDIO</option><option value="low">IMPACTO BAJO</option>
            </select>
            <input type="date" style={inp} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--gris)", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} />
            Visible para el cliente
          </label>
          <div className="flex gap-2">
            <button onClick={() => { if (form.title && form.body) createUpdate.mutate({ clientId, ...form }); }} disabled={!form.title || !form.body} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px", opacity: (!form.title || !form.body) ? 0.5 : 1 }}>
              <Save size={14} /> PUBLICAR
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="text-xs px-4 py-2 rounded" style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gris)", cursor: "pointer", letterSpacing: "2px" }}>
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
                  <option value="on_track">EN CURSO</option><option value="at_risk">EN RIESGO</option><option value="blocked">BLOQUEADO</option>
                </select>
                <input type="date" style={inp} value={editData.date ?? new Date(u.date).toISOString().split("T")[0]} onChange={(e) => setEditData((d: any) => ({ ...d, date: e.target.value }))} />
                <label className="flex items-center gap-2 text-xs" style={{ color: "var(--gris)", cursor: "pointer" }}>
                  <input type="checkbox" checked={editData.isPublic ?? u.isPublic} onChange={(e) => setEditData((d: any) => ({ ...d, isPublic: e.target.checked }))} />
                  Visible para el cliente
                </label>
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateUpdate.mutate({ id: u.id, clientId, ...editData })} className="flex items-center gap-1 text-xs px-3 py-1 rounded" style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}><Save size={12} /> GUARDAR</button>
                <button onClick={() => { setEditingId(null); setEditData({}); }} className="text-xs px-3 py-1 rounded" style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gris)", cursor: "pointer", letterSpacing: "2px" }}>CANCELAR</button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--ambar)", letterSpacing: "2px" }}>{CAT_LABELS[u.category]}</span>
                  <span className="text-xs" style={{ color: "var(--gris)" }}>·</span>
                  <span className="text-xs" style={{ color: "var(--gris)" }}>{new Date(u.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</span>
                  {!u.isPublic && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(138,128,130,0.15)", color: "var(--gris)", letterSpacing: "1px" }}>PRIVADO</span>}
                </div>
                <p className="text-sm font-medium" style={{ color: "var(--creme)" }}>{u.title}</p>
                <p className="text-xs mt-1" style={{ color: "var(--gris)", lineHeight: 1.5 }}>{u.body.slice(0, 120)}{u.body.length > 120 ? "…" : ""}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditingId(u.id); setEditData({}); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px" }}><Edit3 size={13} /></button>
                <button onClick={() => { if (confirm("¿Eliminar?")) deleteUpdate.mutate({ id: u.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px" }}><Trash2 size={13} /></button>
              </div>
            </div>
          )}
        </div>
      ))}

      {updates.length === 0 && !showForm && (
        <p className="text-xs" style={{ color: "var(--gris)" }}>Sin actualizaciones publicadas todavía.</p>
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
          <p className="text-xs tracking-widest mb-3" style={{ color: "var(--ambar)", letterSpacing: "3px" }}>
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
                  color: "var(--ambar)",
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
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}
                />
                <textarea
                  value={editData.description ?? phase.description ?? ""}
                  onChange={(e) => setEditData((d: any) => ({ ...d, description: e.target.value }))}
                  placeholder="Descripción..."
                  rows={2}
                  className="w-full px-3 py-2 text-sm resize-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}
                />
                <select
                  value={editData.status ?? phase.status}
                  onChange={(e) => setEditData((d: any) => ({ ...d, status: e.target.value }))}
                  className="px-3 py-2 text-sm"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En curso</option>
                  <option value="completed">Completada</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={() => { updatePhase.mutate({ id: phase.id, ...editData }); setEditingId(null); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded" style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                    <Save size={12} /> GUARDAR
                  </button>
                  <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--gris)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                    <X size={12} /> CANCELAR
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium" style={{ color: "var(--creme)" }}>{phase.name}</p>
                  {phase.description && <p className="text-xs mt-0.5" style={{ color: "var(--gris)" }}>{phase.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-1 rounded" style={{ color: phase.status === "completed" ? "#4eba8a" : phase.status === "in_progress" ? "var(--ambar)" : "var(--gris)", background: "rgba(255,255,255,0.05)", letterSpacing: "2px" }}>
                    {phase.status === "completed" ? "COMPLETADA" : phase.status === "in_progress" ? "EN CURSO" : "PENDIENTE"}
                  </span>
                  <button onClick={() => { setEditingId(phase.id); setEditData({}); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gris)", padding: "4px" }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deletePhase.mutate({ id: phase.id })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px" }}>
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
        <p className="text-xs tracking-widest mb-3" style={{ color: "var(--gris)", letterSpacing: "3px" }}>AGREGAR ETAPA</p>
        <div className="flex gap-3">
          <input
            value={newPhase.name}
            onChange={(e) => setNewPhase((f) => ({ ...f, name: e.target.value }))}
            placeholder="Nombre de la etapa..."
            className="flex-1 px-3 py-2 text-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}
          />
          <select
            value={newPhase.status}
            onChange={(e) => setNewPhase((f) => ({ ...f, status: e.target.value as any }))}
            className="px-3 py-2 text-sm"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}
          >
            <option value="pending">Pendiente</option>
            <option value="in_progress">En curso</option>
            <option value="completed">Completada</option>
          </select>
          <button
            onClick={() => { if (newPhase.name) { createPhase.mutate({ clientId, ...newPhase, order: phases.length }); setNewPhase({ name: "", description: "", status: "pending", order: phases.length + 1 }); } }}
            className="flex items-center gap-1 text-xs px-4 py-2 rounded"
            style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
          >
            <Plus size={14} /> AGREGAR
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MILESTONES TAB ───────────────────────────────────────────────────────────
function MilestonesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: milestones = [] } = trpc.milestones.list.useQuery({ clientId });
  const createMilestone = trpc.milestones.create.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito creado."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMilestone = trpc.milestones.delete.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ title: "", description: "", date: new Date().toISOString().split("T")[0], status: "completed" as const, category: "strategy" as const, impact: "medium" as const });

  return (
    <div className="space-y-4">
      {milestones.map((m) => (
        <div key={m.id} className="gj-card p-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--creme)" }}>{m.title}</p>
            {m.description && <p className="text-xs mt-0.5" style={{ color: "var(--gris)" }}>{m.description}</p>}
            <p className="text-xs mt-1" style={{ color: "rgba(138,128,130,0.6)" }}>{new Date(m.date).toLocaleDateString("es-AR")} · {m.category} · {m.impact}</p>
          </div>
          <button onClick={() => deleteMilestone.mutate({ id: m.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gris)", letterSpacing: "3px" }}>AGREGAR HITO</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del hito..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            <option value="completed">Completado</option>
            <option value="in_progress">En curso</option>
            <option value="pending">Pendiente</option>
          </select>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            <option value="strategy">Estrategia</option>
            <option value="implementation">Implementación</option>
            <option value="training">Capacitación</option>
            <option value="automation">Automatización</option>
            <option value="content">Contenido</option>
            <option value="analytics">Analítica</option>
            <option value="other">Otro</option>
          </select>
          <select value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            <option value="high">Alto impacto</option>
            <option value="medium">Impacto medio</option>
            <option value="low">Bajo impacto</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.title) { createMilestone.mutate({ clientId, ...form, date: new Date(form.date) }); setForm({ title: "", description: "", date: new Date().toISOString().split("T")[0], status: "completed", category: "strategy", impact: "medium" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR HITO
        </button>
      </div>
    </div>
  );
}

// ─── OKRs TAB ─────────────────────────────────────────────────────────────────
function OKRsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: okrs = [] } = trpc.okrs.list.useQuery({ clientId });
  const createOkr = trpc.okrs.create.useMutation({
    onSuccess: () => { utils.okrs.list.invalidate({ clientId }); toast.success("OKR creado."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteOkr = trpc.okrs.delete.useMutation({
    onSuccess: () => { utils.okrs.list.invalidate({ clientId }); toast.success("OKR eliminado."); },
    onError: (e) => toast.error(e.message),
  });
  const updateOkr = trpc.okrs.update.useMutation({
    onSuccess: () => { utils.okrs.list.invalidate({ clientId }); toast.success("OKR actualizado."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ objective: "", keyResult: "", targetValue: "", currentValue: "", unit: "", progressPct: 0, status: "on_track" as const, period: "", notes: "" });

  return (
    <div className="space-y-4">
      {okrs.map((okr) => (
        <div key={okr.id} style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "16px" }}>
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="text-xs" style={{ color: "var(--gris)" }}>{okr.objective}</p>
              <p className="text-sm font-medium" style={{ color: "var(--creme)" }}>{okr.keyResult}</p>
            </div>
            <button onClick={() => deleteOkr.mutate({ id: okr.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px", flexShrink: 0 }}>
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="progress-bar-track flex-1">
              <div className="progress-bar-fill" style={{ width: `${okr.progressPct}%` }} />
            </div>
            <input
              type="number"
              min="0"
              max="100"
              value={okr.progressPct}
              onChange={(e) => updateOkr.mutate({ id: okr.id, clientId, progressPct: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-xs text-center"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--ambar)", fontFamily: "var(--font-body)" }}
            />
            <span className="text-xs" style={{ color: "var(--gris)" }}>%</span>
          </div>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gris)", letterSpacing: "3px" }}>AGREGAR OKR</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.objective} onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))} placeholder="Objetivo..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.keyResult} onChange={(e) => setForm((f) => ({ ...f, keyResult: e.target.value }))} placeholder="Resultado clave..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.targetValue} onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))} placeholder="Meta (ej: 100)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Unidad (ej: reservas)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="Período (ej: Q2 2026)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            <option value="on_track">En curso</option>
            <option value="at_risk">En riesgo</option>
            <option value="off_track">Desviado</option>
            <option value="completed">Completado</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.objective && form.keyResult) { createOkr.mutate({ clientId, ...form }); setForm({ objective: "", keyResult: "", targetValue: "", currentValue: "", unit: "", progressPct: 0, status: "on_track", period: "", notes: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR OKR
        </button>
      </div>
    </div>
  );
}

// ─── LEARNINGS TAB ────────────────────────────────────────────────────────────
function LearningsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: learnings = [] } = trpc.learnings.list.useQuery({ clientId });
  const createLearning = trpc.learnings.create.useMutation({
    onSuccess: () => { utils.learnings.list.invalidate({ clientId }); toast.success("Registro creado."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteLearning = trpc.learnings.delete.useMutation({
    onSuccess: () => { utils.learnings.list.invalidate({ clientId }); toast.success("Registro eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState<{ type: "learning" | "obstacle" | "win"; title: string; description: string; resolution: string; date: string; isResolved: boolean }>({ type: "learning", title: "", description: "", resolution: "", date: new Date().toISOString().split("T")[0], isResolved: false });

  return (
    <div className="space-y-4">
      {learnings.map((l) => (
        <div key={l.id} className="gj-card p-4 flex items-start justify-between gap-4">
          <div>
            <span className="text-xs" style={{ color: l.type === "win" ? "#4eba8a" : l.type === "obstacle" ? "var(--ambar)" : "#4db6e8", letterSpacing: "2px" }}>
              {l.type === "win" ? "LOGRO" : l.type === "obstacle" ? "OBSTÁCULO" : "APRENDIZAJE"}
            </span>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--creme)" }}>{l.title}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gris)" }}>{l.description}</p>
          </div>
          <button onClick={() => deleteLearning.mutate({ id: l.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gris)", letterSpacing: "3px" }}>AGREGAR REGISTRO</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            <option value="learning">Aprendizaje</option>
            <option value="obstacle">Obstáculo</option>
            <option value="win">Logro</option>
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." rows={2} className="col-span-2 px-3 py-2 text-sm resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          {form.type === "obstacle" && (
            <textarea value={form.resolution} onChange={(e) => setForm((f) => ({ ...f, resolution: e.target.value }))} placeholder="Resolución (si aplica)..." rows={2} className="col-span-2 px-3 py-2 text-sm resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          )}
        </div>
        <button
          onClick={() => { if (form.title && form.description) { createLearning.mutate({ clientId, ...form, date: new Date(form.date) }); setForm({ type: "learning", title: "", description: "", resolution: "", date: new Date().toISOString().split("T")[0], isResolved: false }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR
        </button>
      </div>
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
              <p className="text-sm font-medium" style={{ color: "var(--creme)" }}>{item.title}</p>
              {item.description && <p className="text-xs mt-0.5" style={{ color: "var(--gris)" }}>{item.description}</p>}
            </div>
          </div>
          <button onClick={() => deleteScope.mutate({ id: item.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gris)", letterSpacing: "3px" }}>AGREGAR ÍTEM DE ALCANCE</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del ítem..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Categoría (opcional)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <select value={form.inScope ? "in" : "out"} onChange={(e) => setForm((f) => ({ ...f, inScope: e.target.value === "in" }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            <option value="in">Incluido en alcance</option>
            <option value="out">Fuera de alcance</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.title) { createScope.mutate({ clientId, ...form, order: items.length }); setForm({ title: "", description: "", inScope: true, category: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
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
            <span className="text-xs" style={{ color: "var(--ambar)", letterSpacing: "2px" }}>{r.category.toUpperCase()}</span>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--creme)" }}>{r.title}</p>
            {r.description && <p className="text-xs mt-0.5" style={{ color: "var(--gris)" }}>{r.description}</p>}
            {r.externalUrl && <a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 block" style={{ color: "var(--rojo)" }}>{r.externalUrl}</a>}
          </div>
          <button onClick={() => deleteResource.mutate({ id: r.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gris)", letterSpacing: "3px" }}>AGREGAR RECURSO</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del recurso..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} placeholder="URL (opcional)" className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Contenido de texto (opcional)..." rows={3} className="col-span-2 px-3 py-2 text-sm resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))} className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
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
          style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
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
            <p className="text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>{m.name.toUpperCase()}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <input
                value={m.value}
                onChange={(e) => updateMetric.mutate({ id: m.id, clientId, value: e.target.value })}
                className="text-2xl font-bold w-28 bg-transparent border-b"
                style={{ color: "var(--ambar)", borderColor: "rgba(255,255,255,0.1)", outline: "none", fontFamily: "var(--font-body)" }}
              />
              {m.unit && <span className="text-sm" style={{ color: "var(--gris)" }}>{m.unit}</span>}
            </div>
            {m.period && <p className="text-xs mt-1" style={{ color: "rgba(138,128,130,0.6)" }}>{m.period}</p>}
          </div>
          <button onClick={() => deleteMetric.mutate({ id: m.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--rojo)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gris)", letterSpacing: "3px" }}>AGREGAR MÉTRICA</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre (ej: Reservas/mes)" className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="Valor actual (ej: 120)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Unidad (ej: reservas)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.previousValue} onChange={(e) => setForm((f) => ({ ...f, previousValue: e.target.value }))} placeholder="Valor anterior" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="Período (ej: Mayo 2026)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }} />
          <select value={form.trend} onChange={(e) => setForm((f) => ({ ...f, trend: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--creme)", fontFamily: "var(--font-body)" }}>
            <option value="up">↑ Subiendo</option>
            <option value="down">↓ Bajando</option>
            <option value="stable">→ Estable</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.name && form.value) { createMetric.mutate({ clientId, ...form, order: metrics.length }); setForm({ name: "", value: "", previousValue: "", unit: "", trend: "stable", description: "", period: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--noir)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
      </div>
    );
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const branding = (client as any).branding as any;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--noir)" }}>
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
        {/* Back + brand */}
        <div className="px-6 pt-6 pb-2">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 mb-6"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gris)", padding: 0 }}
          >
            <ArrowLeft size={14} />
            <span style={{ fontSize: "10px", letterSpacing: "2px", fontFamily: "var(--font-label)" }}>VOLVER</span>
          </button>
          {(client as any).logoUrl && (
            <img src={(client as any).logoUrl} alt={client.name} style={{ height: 64, width: "auto", marginBottom: 12, objectFit: "contain" }} />
          )}
          <h2 className="font-accent leading-tight" style={{ color: "var(--creme)", fontSize: 22 }}>
            {client.name}
          </h2>
          <p className="font-body text-xs mt-1" style={{ color: "var(--gris)", letterSpacing: "0.04em" }}>
            Panel de administración
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="font-label text-xs tracking-widest px-3 mb-3" style={{ color: "var(--gris)", letterSpacing: "4px", fontSize: "9px" }}>
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
                      background: isActive ? "rgba(179,40,37,0.12)" : "transparent",
                      borderLeft: isActive ? "2px solid var(--rojo)" : "2px solid transparent",
                      color: isActive ? "var(--creme)" : "var(--gris)",
                      cursor: "pointer",
                      border: "none",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.color = "var(--creme)"; } }}
                    onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--gris)"; } }}
                  >
                    <Icon size={14} style={{ color: isActive ? "var(--rojo)" : "inherit", flexShrink: 0 }} />
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
            style={{ background: "rgba(179,40,37,0.1)", color: "var(--rojo)", border: "1px solid rgba(179,40,37,0.2)", textDecoration: "none", letterSpacing: "2px", fontFamily: "var(--font-label)" }}
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
            <p className="font-label text-xs tracking-widest" style={{ color: "var(--ambar)", letterSpacing: "5px" }}>
              {client.name.toUpperCase()}
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: "var(--gris)" }}>
              Gestión de consultoría estratégica
            </p>
          </div>
          <img src="/gj-logo.png" alt="GJ" style={{ height: 24, width: "auto", opacity: 0.6 }} />
        </div>

        {/* Section content */}
        <div className="p-8">
          {/* Section header */}
          <p className="font-label" style={{ fontSize: "10px", letterSpacing: "4px", color: "var(--rojo)", marginBottom: "6px" }}>
            {activeTabDef.label}
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--creme)", lineHeight: 1.1, marginBottom: "8px" }}>
            {activeTabDef.title}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--gris)", marginBottom: "24px", fontFamily: "var(--font-body)" }}>
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
