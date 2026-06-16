import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X } from "lucide-react";
import { toast } from "sonner";

type Tab = "phases" | "milestones" | "okrs" | "learnings" | "scope" | "resources" | "metrics";

const TABS: { id: Tab; label: string }[] = [
  { id: "phases", label: "ETAPAS" },
  { id: "milestones", label: "HITOS" },
  { id: "okrs", label: "OKRs" },
  { id: "learnings", label: "APRENDIZAJES" },
  { id: "scope", label: "ALCANCE" },
  { id: "resources", label: "RECURSOS" },
  { id: "metrics", label: "MÉTRICAS" },
];

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
        <div className="gj-card p-5">
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
          <div key={phase.id} className="gj-card p-4">
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
                  <button onClick={() => { updatePhase.mutate({ id: phase.id, ...editData }); setEditingId(null); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded" style={{ background: "#4eba8a", color: "#0B0807", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
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
      <div className="gj-card p-5">
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
            <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{m.title}</p>
            {m.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{m.description}</p>}
            <p className="text-xs mt-1" style={{ color: "rgba(138,128,130,0.6)" }}>{new Date(m.date).toLocaleDateString("es-AR")} · {m.category} · {m.impact}</p>
          </div>
          <button onClick={() => deleteMilestone.mutate({ id: m.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div className="gj-card p-5">
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR HITO</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del hito..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="completed">Completado</option>
            <option value="in_progress">En curso</option>
            <option value="pending">Pendiente</option>
          </select>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="strategy">Estrategia</option>
            <option value="implementation">Implementación</option>
            <option value="training">Capacitación</option>
            <option value="automation">Automatización</option>
            <option value="content">Contenido</option>
            <option value="analytics">Analítica</option>
            <option value="other">Otro</option>
          </select>
          <select value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="high">Alto impacto</option>
            <option value="medium">Impacto medio</option>
            <option value="low">Bajo impacto</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.title) { createMilestone.mutate({ clientId, ...form, date: new Date(form.date) }); setForm({ title: "", description: "", date: new Date().toISOString().split("T")[0], status: "completed", category: "strategy", impact: "medium" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
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
        <div key={okr.id} className="gj-card p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <p className="text-xs" style={{ color: "var(--gj-muted)" }}>{okr.objective}</p>
              <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{okr.keyResult}</p>
            </div>
            <button onClick={() => deleteOkr.mutate({ id: okr.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
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
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)" }}
            />
            <span className="text-xs" style={{ color: "var(--gj-muted)" }}>%</span>
          </div>
        </div>
      ))}

      <div className="gj-card p-5">
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR OKR</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.objective} onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))} placeholder="Objetivo..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.keyResult} onChange={(e) => setForm((f) => ({ ...f, keyResult: e.target.value }))} placeholder="Resultado clave..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.targetValue} onChange={(e) => setForm((f) => ({ ...f, targetValue: e.target.value }))} placeholder="Meta (ej: 100)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Unidad (ej: reservas)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="Período (ej: Q2 2026)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="on_track">En curso</option>
            <option value="at_risk">En riesgo</option>
            <option value="off_track">Desviado</option>
            <option value="completed">Completado</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.objective && form.keyResult) { createOkr.mutate({ clientId, ...form }); setForm({ objective: "", keyResult: "", targetValue: "", currentValue: "", unit: "", progressPct: 0, status: "on_track", period: "", notes: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
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
            <span className="text-xs" style={{ color: l.type === "win" ? "#4eba8a" : l.type === "obstacle" ? "var(--gj-mint)" : "#4db6e8", letterSpacing: "2px" }}>
              {l.type === "win" ? "LOGRO" : l.type === "obstacle" ? "OBSTÁCULO" : "APRENDIZAJE"}
            </span>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--gj-cream)" }}>{l.title}</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{l.description}</p>
          </div>
          <button onClick={() => deleteLearning.mutate({ id: l.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div className="gj-card p-5">
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR REGISTRO</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="learning">Aprendizaje</option>
            <option value="obstacle">Obstáculo</option>
            <option value="win">Logro</option>
          </select>
          <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." rows={2} className="col-span-2 px-3 py-2 text-sm resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          {form.type === "obstacle" && (
            <textarea value={form.resolution} onChange={(e) => setForm((f) => ({ ...f, resolution: e.target.value }))} placeholder="Resolución (si aplica)..." rows={2} className="col-span-2 px-3 py-2 text-sm resize-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          )}
        </div>
        <button
          onClick={() => { if (form.title && form.description) { createLearning.mutate({ clientId, ...form, date: new Date(form.date) }); setForm({ type: "learning", title: "", description: "", resolution: "", date: new Date().toISOString().split("T")[0], isResolved: false }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
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
              <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{item.title}</p>
              {item.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{item.description}</p>}
            </div>
          </div>
          <button onClick={() => deleteScope.mutate({ id: item.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div className="gj-card p-5">
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

      <div className="gj-card p-5">
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

      <div className="gj-card p-5">
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
  const [activeTab, setActiveTab] = useState<Tab>("phases");

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

  return (
    <div className="min-h-screen" style={{ background: "var(--gj-petrol-ink)", fontFamily: "var(--gj-font)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center gap-4 px-8 py-5"
        style={{
          background: "rgba(6,26,25,0.97)",
          borderBottom: "1px solid rgba(154,230,180,0.10)",
          backdropFilter: "blur(12px)",
        }}
      >
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center gap-2 text-sm"
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)" }}
        >
          <ArrowLeft size={16} />
          <span className="text-xs tracking-widest" style={{ letterSpacing: "2px" }}>VOLVER</span>
        </button>
        <img src="/gj-logo.png" alt="Gumercindo Jiménez" style={{ height: 28, width: "auto" }} />
        <div className="w-px h-6" style={{ background: "rgba(154,230,180,0.15)" }} />
        <div>
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "4px", fontWeight: 600 }}>
            GESTIÓN DE CLIENTE
          </p>
          <h1 className="text-xl" style={{ color: "var(--gj-cream)", fontWeight: 700 }}>
            {client.name}
          </h1>
        </div>
        <div className="ml-auto">
          <a
            href={`/dashboard/${clientId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs px-4 py-2 rounded"
            style={{ background: "rgba(255,255,255,0.05)", color: "var(--gj-muted)", border: "1px solid rgba(255,255,255,0.1)", textDecoration: "none", letterSpacing: "2px" }}
          >
            VER COMO CLIENTE
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-10">
        {/* Tabs */}
        <div
          className="flex gap-1 mb-8 overflow-x-auto"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="text-xs tracking-widest px-4 py-3 whitespace-nowrap"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: activeTab === tab.id ? "var(--gj-cream)" : "var(--gj-muted)",
                borderBottom: activeTab === tab.id ? "2px solid var(--gj-green)" : "2px solid transparent",
                letterSpacing: "3px",
                marginBottom: "-1px",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === "phases" && <PhasesTab clientId={clientId} />}
        {activeTab === "milestones" && <MilestonesTab clientId={clientId} />}
        {activeTab === "okrs" && <OKRsTab clientId={clientId} />}
        {activeTab === "learnings" && <LearningsTab clientId={clientId} />}
        {activeTab === "scope" && <ScopeTab clientId={clientId} />}
        {activeTab === "resources" && <ResourcesTab clientId={clientId} />}
        {activeTab === "metrics" && <MetricsTab clientId={clientId} />}
      </main>
    </div>
  );
}
