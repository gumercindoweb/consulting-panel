import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, Clock, Flag } from "lucide-react";

interface Props { clientId: number; }

const PHASE_STATUS = {
  completed: { label: "COMPLETADA", color: "#4eba8a", Icon: CheckCircle2 },
  in_progress: { label: "EN CURSO", color: "var(--ambar)", Icon: Clock },
  pending: { label: "PENDIENTE", color: "var(--gris)", Icon: Circle },
};

const MILESTONE_STATUS = {
  completed: { label: "COMPLETADO", color: "#4eba8a" },
  in_progress: { label: "EN CURSO", color: "var(--ambar)" },
  pending: { label: "PENDIENTE", color: "var(--gris)" },
};

const CAT_COLORS: Record<string, string> = {
  session: "var(--ambar)",
  result: "#4eba8a",
  delivery: "var(--rojo)",
  insight: "#9b8af0",
  blocker: "#e05252",
  win: "#4eba8a",
  general: "var(--gris)",
};

const CAT_LABELS: Record<string, string> = {
  session: "SESIÓN",
  result: "RESULTADO",
  delivery: "ENTREGABLE",
  insight: "INSIGHT",
  blocker: "BLOQUEADOR",
  win: "LOGRO",
  general: "ACTUALIZACIÓN",
};

export default function SectionTimeline({ clientId }: Props) {
  const { data: phases = [], isLoading: phasesLoading } = trpc.phases.list.useQuery({ clientId });
  const { data: milestones = [], isLoading: milestonesLoading } = trpc.milestones.list.useQuery({ clientId });
  const { data: updates = [], isLoading: updatesLoading } = trpc.updates.list.useQuery({ clientId });

  const isLoading = phasesLoading || milestonesLoading || updatesLoading;

  const milestonesByPhase = (phaseId: number) => milestones.filter((m) => m.phaseId === phaseId);
  const updatesByMilestone = (milestoneId: number) => updates.filter((u) => u.milestoneId === milestoneId);
  const updatesWithPhaseOnly = (phaseId: number) => updates.filter((u) => u.phaseId === phaseId && !u.milestoneId);

  const totalCompleted = phases.filter((p) => p.status === "completed").length;

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">HOJA DE RUTA</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Mapa Estratégico
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Etapas, hitos y el trabajo táctico que los construye.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      ) : phases.length === 0 ? (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            No hay etapas configuradas aún.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {phases.map((phase, idx) => {
            const cfg = PHASE_STATUS[phase.status];
            const Icon = cfg.Icon;
            const phaseMilestones = milestonesByPhase(phase.id);
            const phaseOnlyUpdates = updatesWithPhaseOnly(phase.id);

            return (
              <div key={phase.id}>
                {/* ── Etapa header ── */}
                <div
                  className="sdt-card p-5 border-l-4"
                  style={{ borderColor: cfg.color }}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "2px" }}>ETAPA {idx + 1}</span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: cfg.color }}>
                      <Icon size={12} /> {cfg.label}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "var(--creme)" }}>{phase.name}</h2>
                  {phase.description && (
                    <p className="text-sm" style={{ color: "var(--gris)", lineHeight: 1.5 }}>{phase.description}</p>
                  )}
                  {(phase.startDate || phase.endDate) && (
                    <p className="text-xs mt-2" style={{ color: "var(--oro-pale)" }}>
                      {phase.startDate && new Date(phase.startDate).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}
                      {phase.startDate && phase.endDate && " → "}
                      {phase.endDate && new Date(phase.endDate).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}
                    </p>
                  )}
                </div>

                {/* ── Hitos de la etapa ── */}
                {phaseMilestones.length > 0 && (
                  <div className="ml-6 mt-3 space-y-3 border-l-2 pl-4" style={{ borderColor: `${cfg.color}30` }}>
                    {phaseMilestones.map((milestone) => {
                      const mCfg = MILESTONE_STATUS[milestone.status];
                      const mUpdates = updatesByMilestone(milestone.id);

                      return (
                        <div key={milestone.id}>
                          {/* Hito */}
                          <div
                            className="flex items-start gap-3 p-3 rounded"
                            style={{ background: `${mCfg.color}10`, borderLeft: `2px solid ${mCfg.color}` }}
                          >
                            <Flag size={13} style={{ color: mCfg.color, flexShrink: 0, marginTop: 2 }} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold" style={{ color: "var(--creme)" }}>{milestone.title}</span>
                                <span className="text-xs" style={{ color: mCfg.color, letterSpacing: "1px" }}>{mCfg.label}</span>
                                {milestone.date && (
                                  <span className="text-xs" style={{ color: "var(--gris)" }}>
                                    {new Date(milestone.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                                  </span>
                                )}
                              </div>
                              {milestone.description && (
                                <p className="text-xs mt-1" style={{ color: "var(--gris)", lineHeight: 1.4 }}>{milestone.description}</p>
                              )}
                            </div>
                          </div>

                          {/* Actualizaciones del hito */}
                          {mUpdates.length > 0 && (
                            <div className="ml-5 mt-2 space-y-1 border-l border-dashed pl-3" style={{ borderColor: `${mCfg.color}30` }}>
                              {mUpdates.map((u) => (
                                <div key={u.id} className="py-2">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <span className="text-xs" style={{ color: CAT_COLORS[u.category] ?? "var(--gris)", letterSpacing: "1px" }}>
                                      {CAT_LABELS[u.category] ?? u.category}
                                    </span>
                                    <span className="text-xs" style={{ color: "var(--gris)" }}>
                                      {new Date(u.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                                    </span>
                                  </div>
                                  <p className="text-xs font-medium" style={{ color: "var(--creme)" }}>{u.title}</p>
                                  {u.body && (
                                    <p className="text-xs mt-0.5" style={{ color: "var(--gris)", lineHeight: 1.4 }}>
                                      {u.body.slice(0, 140)}{u.body.length > 140 ? "…" : ""}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Actualizaciones sin hito pero con esta etapa */}
                {phaseOnlyUpdates.length > 0 && (
                  <div className="ml-6 mt-3 border-l-2 pl-4 space-y-1" style={{ borderColor: `${cfg.color}20` }}>
                    <p className="text-xs mb-2" style={{ color: "var(--gris)", letterSpacing: "2px" }}>ACTUALIZACIONES GENERALES</p>
                    {phaseOnlyUpdates.map((u) => (
                      <div key={u.id} className="py-2">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-xs" style={{ color: CAT_COLORS[u.category] ?? "var(--gris)", letterSpacing: "1px" }}>
                            {CAT_LABELS[u.category] ?? u.category}
                          </span>
                          <span className="text-xs" style={{ color: "var(--gris)" }}>
                            {new Date(u.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <p className="text-xs font-medium" style={{ color: "var(--creme)" }}>{u.title}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Resumen */}
          <div className="sdt-card p-5 border-t-4" style={{ borderColor: "var(--ambar)" }}>
            <p className="font-label text-xs tracking-widest mb-2" style={{ color: "var(--ambar)", letterSpacing: "2px" }}>PROGRESO GENERAL</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: "var(--creme)" }}>
                {totalCompleted}/{phases.length}
              </span>
              <span className="font-serif text-lg" style={{ color: "var(--gris)" }}>etapas completadas</span>
            </div>
            <div className="mt-3 h-1 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${phases.length ? (totalCompleted / phases.length) * 100 : 0}%`, background: "#4eba8a" }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
