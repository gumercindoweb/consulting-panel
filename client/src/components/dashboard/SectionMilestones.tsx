import { trpc } from "@/lib/trpc";
import { CheckCircle2, Circle, Clock, Zap, BookOpen, Settings, Megaphone, BarChart2, Users } from "lucide-react";

interface Props { clientId: number; }

const CATEGORY_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  strategy: { label: "Estrategia", color: "var(--rojo)", Icon: Zap },
  implementation: { label: "Implementación", color: "var(--ambar)", Icon: Settings },
  training: { label: "Capacitación", color: "#4eba8a", Icon: Users },
  automation: { label: "Automatización", color: "#7c6fcd", Icon: Settings },
  content: { label: "Contenido", color: "var(--oro)", Icon: Megaphone },
  analytics: { label: "Analítica", color: "#4db6e8", Icon: BarChart2 },
  other: { label: "Otro", color: "var(--gris)", Icon: Circle },
};

const STATUS_CONFIG = {
  completed: { label: "COMPLETADO", color: "#4eba8a", Icon: CheckCircle2 },
  in_progress: { label: "EN CURSO", color: "var(--ambar)", Icon: Clock },
  pending: { label: "PENDIENTE", color: "var(--gris)", Icon: Circle },
};

const IMPACT_CONFIG = {
  high: { label: "ALTO IMPACTO", color: "var(--rojo)" },
  medium: { label: "IMPACTO MEDIO", color: "var(--ambar)" },
  low: { label: "IMPACTO BAJO", color: "var(--gris)" },
};

export default function SectionMilestones({ clientId }: Props) {
  const { data: milestones = [], isLoading } = trpc.milestones.list.useQuery({ clientId });

  // Group by year-month
  const grouped = milestones.reduce<Record<string, typeof milestones>>((acc, m) => {
    const key = new Date(m.date).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">HITOS E IMPLEMENTACIONES</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Registro Cronológico
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Cada estrategia implementada, cada logro alcanzado, documentado en el tiempo.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      ) : milestones.length === 0 ? (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Los hitos del proyecto se irán registrando aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([period, items]) => (
            <div key={period}>
              <div className="flex items-center gap-4 mb-6">
                <span
                  className="font-label text-xs tracking-widest px-3 py-1 rounded"
                  style={{
                    color: "var(--ambar)",
                    background: "rgba(224,145,63,0.1)",
                    border: "1px solid rgba(224,145,63,0.25)",
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                  }}
                >
                  {period}
                </span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
              </div>

              <div className="space-y-3">
                {items.map((m) => {
                  const cat = CATEGORY_CONFIG[m.category] || CATEGORY_CONFIG.other;
                  const status = STATUS_CONFIG[m.status];
                  const impact = IMPACT_CONFIG[m.impact];
                  const CatIcon = cat.Icon;
                  const StatusIcon = status.Icon;

                  return (
                    <div
                      key={m.id}
                      className="sdt-card p-5 flex gap-4"
                      style={{
                        borderLeft: m.status === "completed"
                          ? "3px solid #4eba8a"
                          : m.status === "in_progress"
                          ? "3px solid var(--ambar)"
                          : "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${cat.color}15`, border: `1px solid ${cat.color}30` }}
                      >
                        <CatIcon size={16} style={{ color: cat.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-1">
                          <h4 className="font-body text-sm font-medium" style={{ color: "var(--creme)" }}>
                            {m.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="font-label text-xs px-2 py-0.5 rounded"
                              style={{
                                color: impact.color,
                                background: `${impact.color}12`,
                                border: `1px solid ${impact.color}30`,
                                letterSpacing: "1px",
                              }}
                            >
                              {impact.label}
                            </span>
                            <span
                              className="font-label text-xs px-2 py-0.5 rounded flex items-center gap-1"
                              style={{
                                color: status.color,
                                background: `${status.color}12`,
                                border: `1px solid ${status.color}30`,
                                letterSpacing: "1px",
                              }}
                            >
                              <StatusIcon size={10} />
                              {status.label}
                            </span>
                          </div>
                        </div>
                        {m.description && (
                          <p className="text-xs leading-relaxed" style={{ color: "rgba(138,128,130,0.8)" }}>
                            {m.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className="font-label text-xs"
                            style={{ color: cat.color, letterSpacing: "2px" }}
                          >
                            {cat.label.toUpperCase()}
                          </span>
                          <span className="text-xs" style={{ color: "var(--gris)" }}>
                            {new Date(m.date).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
