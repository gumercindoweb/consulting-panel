import { trpc } from "@/lib/trpc";

interface Props { clientId: number; }

const STATUS_CONFIG = {
  on_track: { label: "EN CURSO", color: "#4eba8a" },
  at_risk: { label: "EN RIESGO", color: "var(--ambar)" },
  off_track: { label: "DESVIADO", color: "var(--rojo-vivo)" },
  completed: { label: "COMPLETADO", color: "#4eba8a" },
};

export default function SectionOKRs({ clientId }: Props) {
  const { data: okrs = [], isLoading } = trpc.okrs.list.useQuery({ clientId });

  // Group by objective
  const grouped = okrs.reduce<Record<string, typeof okrs>>((acc, okr) => {
    const key = okr.objective;
    if (!acc[key]) acc[key] = [];
    acc[key].push(okr);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">OKRs Y MÉTRICAS</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Objetivos y Resultados Clave
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          El norte estratégico del proyecto, medido en resultados concretos.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      ) : okrs.length === 0 ? (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Los OKRs del proyecto se configurarán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([objective, keyResults]) => {
            const avgProgress = Math.round(
              keyResults.reduce((s, kr) => s + kr.progressPct, 0) / keyResults.length
            );
            return (
              <div key={objective} className="sdt-card p-6">
                {/* Objective header */}
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <p className="font-label text-xs tracking-widest mb-2" style={{ color: "var(--rojo)", letterSpacing: "4px" }}>
                      OBJETIVO
                    </p>
                    <h3 className="font-display text-xl font-bold" style={{ color: "var(--creme)" }}>
                      {objective}
                    </h3>
                    {keyResults[0]?.period && (
                      <p className="font-label text-xs mt-1" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
                        {keyResults[0].period}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-display text-3xl font-bold" style={{ color: "var(--ambar)" }}>
                      {avgProgress}%
                    </p>
                    <p className="font-label text-xs" style={{ color: "var(--gris)", letterSpacing: "2px" }}>
                      PROGRESO
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="progress-bar-track mb-6">
                  <div className="progress-bar-fill" style={{ width: `${avgProgress}%` }} />
                </div>

                {/* Key results */}
                <div className="space-y-4">
                  <p className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "4px" }}>
                    RESULTADOS CLAVE
                  </p>
                  {keyResults.map((kr) => {
                    const status = STATUS_CONFIG[kr.status];
                    return (
                      <div
                        key={kr.id}
                        className="flex items-start gap-4 py-4"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex-1">
                          <p className="font-body text-sm" style={{ color: "var(--creme)" }}>
                            {kr.keyResult}
                          </p>
                          {(kr.targetValue || kr.currentValue) && (
                            <div className="flex items-center gap-4 mt-2">
                              {kr.targetValue && (
                                <span className="text-xs" style={{ color: "var(--gris)" }}>
                                  Meta:{" "}
                                  <strong style={{ color: "var(--creme)" }}>
                                    {kr.targetValue}{kr.unit ? ` ${kr.unit}` : ""}
                                  </strong>
                                </span>
                              )}
                              {kr.currentValue && (
                                <span className="text-xs" style={{ color: "var(--gris)" }}>
                                  Actual:{" "}
                                  <strong style={{ color: "var(--ambar)" }}>
                                    {kr.currentValue}{kr.unit ? ` ${kr.unit}` : ""}
                                  </strong>
                                </span>
                              )}
                            </div>
                          )}
                          {kr.notes && (
                            <p className="text-xs mt-2" style={{ color: "rgba(138,128,130,0.7)" }}>
                              {kr.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <p className="font-display text-xl font-bold" style={{ color: "var(--oro)" }}>
                              {kr.progressPct}%
                            </p>
                          </div>
                          <span
                            className="font-label text-xs px-2 py-1 rounded"
                            style={{
                              color: status.color,
                              background: `${status.color}15`,
                              border: `1px solid ${status.color}35`,
                              letterSpacing: "2px",
                            }}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
