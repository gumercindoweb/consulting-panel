import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Props { clientId: number; }

const STATUS_CONFIG = {
  completed: { label: "COMPLETADA", color: "#4eba8a", Icon: CheckCircle2 },
  in_progress: { label: "EN CURSO", color: "var(--ambar)", Icon: Clock },
  pending: { label: "PENDIENTE", color: "var(--gris)", Icon: Circle },
};

export default function SectionTimeline({ clientId }: Props) {
  const { data: phases = [], isLoading: phasesLoading } = trpc.phases.list.useQuery({ clientId });
  const { data: milestones = [], isLoading: milestonesLoading } = trpc.milestones.list.useQuery({ clientId });

  const isLoading = phasesLoading || milestonesLoading;

  const getMilestonesByPhase = (phaseId: number) => milestones.filter(m => m.phaseId === phaseId);

  const getMonthsSpanned = (start: Date, end: Date) => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24 * 30));
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">LÍNEA DE TIEMPO</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Cronología del Proyecto
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Visualización completa de fases, hitos y progreso temporal.
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
            No hay fases configuradas aún.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main timeline track */}
          <div className="relative">
            {/* Background track */}
            <div
              className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2"
              style={{
                background: "linear-gradient(to right, #4eba8a 0%, #4eba8a 33%, var(--ambar) 33%, var(--ambar) 66%, var(--gris) 66%)",
              }}
            />

            {/* Phases container */}
            <div className="relative grid grid-cols-3 gap-4 py-8">
              {phases.map((phase) => {
                const cfg = STATUS_CONFIG[phase.status];
                const Icon = cfg.Icon;
                const phaseMilestones = getMilestonesByPhase(phase.id);
                const monthSpan = phase.startDate && phase.endDate
                  ? getMonthsSpanned(new Date(phase.startDate), new Date(phase.endDate))
                  : 0;

                return (
                  <div key={phase.id} className="space-y-4">
                    {/* Phase block */}
                    <div
                      className="sdt-card p-6 border-l-4 transition-all hover:shadow-lg"
                      style={{ borderColor: cfg.color }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon size={16} style={{ color: cfg.color }} />
                            <span className="font-label text-xs tracking-widest" style={{ color: cfg.color, letterSpacing: "2px" }}>
                              {cfg.label}
                            </span>
                          </div>
                          <h3 className="font-display text-lg font-bold" style={{ color: "var(--creme)" }}>
                            {phase.name}
                          </h3>
                        </div>
                      </div>

                      {/* Dates */}
                      {phase.startDate && phase.endDate && (
                        <div className="text-xs mb-3" style={{ color: "var(--gris)" }}>
                          <div>{new Date(phase.startDate).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}</div>
                          <div>→</div>
                          <div>{new Date(phase.endDate).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}</div>
                          <div className="text-xs mt-1" style={{ color: "var(--oro-pale)" }}>
                            {monthSpan} meses
                          </div>
                        </div>
                      )}

                      {/* Milestones count */}
                      <div className="text-xs tracking-widest" style={{ color: "var(--oro-pale)" }}>
                        {phaseMilestones.length} {phaseMilestones.length === 1 ? "HITO" : "HITOS"}
                      </div>
                    </div>

                    {/* Milestones list */}
                    {phaseMilestones.length > 0 && (
                      <div className="space-y-2 pl-4 border-l border-dashed" style={{ borderColor: `${cfg.color}40` }}>
                        {phaseMilestones.map((m) => {
                          const mCfg = STATUS_CONFIG[m.status];
                          return (
                            <div
                              key={m.id}
                              className="text-xs p-3 rounded"
                              style={{
                                background: `${mCfg.color}15`,
                                borderLeft: `2px solid ${mCfg.color}`,
                                color: "var(--creme)",
                              }}
                            >
                              <div className="font-semibold">{m.title}</div>
                              {m.date && (
                                <div style={{ color: "var(--gris)" }}>
                                  {new Date(m.date).toLocaleDateString("es-AR", { month: "short", day: "numeric" })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          <div
            className="sdt-card p-6 border-t-4"
            style={{ borderColor: "var(--ambar)" }}
          >
            <p className="font-label text-xs tracking-widest mb-2" style={{ color: "var(--ambar)", letterSpacing: "2px" }}>PROGRESO GENERAL</p>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold" style={{ color: "var(--creme)" }}>
                {phases.filter(p => p.status === "completed").length}/{phases.length}
              </span>
              <span className="font-serif text-lg" style={{ color: "var(--gris)" }}>
                fases completadas
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
