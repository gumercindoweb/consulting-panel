import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface Props { clientId: number; }

const STATUS_CONFIG = {
  completed: { label: "COMPLETADA", color: "#4eba8a", Icon: CheckCircle2 },
  in_progress: { label: "EN CURSO", color: "var(--ambar)", Icon: Clock },
  pending: { label: "PENDIENTE", color: "var(--gris)", Icon: Circle },
};

export default function SectionPhases({ clientId }: Props) {
  const { data: phases = [], isLoading } = trpc.phases.list.useQuery({ clientId });

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">ETAPAS DEL PROYECTO</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Fases Estratégicas
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          El recorrido completo del proyecto, desde el diagnóstico hasta la ejecución.
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
            Las etapas del proyecto aún no están configuradas.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-6 top-8 bottom-8 w-0.5"
            style={{ background: "linear-gradient(to bottom, #4eba8a 0%, #4eba8a 60%, var(--ambar) 60%, var(--ambar) 80%, var(--gris) 80%)" }}
          />
          <div className="space-y-6">
            {phases.map((phase, idx) => {
              const cfg = STATUS_CONFIG[phase.status];
              const Icon = cfg.Icon;
              return (
                <div key={phase.id} className="relative flex gap-8 pl-16">
                  {/* Dot */}
                  <div
                    className="absolute left-4 top-5 w-5 h-5 rounded-full flex items-center justify-center z-10"
                    style={{
                      background: `${cfg.color}20`,
                      border: `2px solid ${cfg.color}`,
                      boxShadow: phase.status === "in_progress" ? `0 0 16px ${cfg.color}60` : "none",
                    }}
                  >
                    <Icon size={11} style={{ color: cfg.color }} />
                  </div>

                  {/* Card */}
                  <div
                    className="flex-1 sdt-card p-6"
                    style={{
                      borderLeft: phase.status === "in_progress" ? `3px solid ${cfg.color}` : "1px solid rgba(255,255,255,0.07)",
                      background: phase.status === "in_progress" ? "rgba(224,145,63,0.04)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-label text-xs tracking-widest mb-1" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
                          FASE {idx + 1}
                        </p>
                        <h3 className="font-display text-xl font-bold" style={{ color: "var(--creme)" }}>
                          {phase.name}
                        </h3>
                      </div>
                      <span
                        className="font-label text-xs px-3 py-1 rounded flex-shrink-0"
                        style={{
                          color: cfg.color,
                          background: `${cfg.color}15`,
                          border: `1px solid ${cfg.color}35`,
                          letterSpacing: "2px",
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>

                    {phase.description && (
                      <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(245,240,232,0.7)" }}>
                        {phase.description}
                      </p>
                    )}

                    {(phase.startDate || phase.endDate) && (
                      <div className="flex items-center gap-2">
                        <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
                          PERÍODO:
                        </span>
                        <span className="text-xs" style={{ color: "var(--ambar)" }}>
                          {phase.startDate
                            ? new Date(phase.startDate).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
                            : "—"}
                          {phase.endDate
                            ? ` → ${new Date(phase.endDate).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}`
                            : phase.status === "in_progress" ? " → Presente" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
