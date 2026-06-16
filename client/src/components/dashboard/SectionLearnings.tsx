import { trpc } from "@/lib/trpc";
import { BookOpen, AlertTriangle, Trophy, CheckCircle2 } from "lucide-react";

interface Props { clientId: number; }

const TYPE_CONFIG = {
  learning: { label: "APRENDIZAJE", color: "#4db6e8", Icon: BookOpen, bg: "rgba(77,182,232,0.08)" },
  obstacle: { label: "OBSTÁCULO", color: "var(--ambar)", Icon: AlertTriangle, bg: "rgba(224,145,63,0.08)" },
  win: { label: "LOGRO", color: "#4eba8a", Icon: Trophy, bg: "rgba(78,186,138,0.08)" },
};

export default function SectionLearnings({ clientId }: Props) {
  const { data: learnings = [], isLoading } = trpc.learnings.list.useQuery({ clientId });

  const wins = learnings.filter((l) => l.type === "win");
  const obstacles = learnings.filter((l) => l.type === "obstacle");
  const learningItems = learnings.filter((l) => l.type === "learning");

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">APRENDIZAJES Y OBSTÁCULOS</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Registro de Experiencias
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Lo que aprendimos, los obstáculos que superamos y los logros que celebramos.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      ) : learnings.length === 0 ? (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Los aprendizajes y obstáculos del proyecto se documentarán aquí.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "LOGROS", count: wins.length, color: "#4eba8a" },
              { label: "APRENDIZAJES", count: learningItems.length, color: "#4db6e8" },
              { label: "OBSTÁCULOS", count: obstacles.length, color: "var(--ambar)" },
            ].map((s) => (
              <div key={s.label} className="sdt-card p-5 text-center">
                <p className="font-display text-3xl font-bold mb-1" style={{ color: s.color }}>
                  {s.count}
                </p>
                <p className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Items by type */}
          {(["win", "learning", "obstacle"] as const).map((type) => {
            const items = learnings.filter((l) => l.type === type);
            if (items.length === 0) return null;
            const cfg = TYPE_CONFIG[type];
            const Icon = cfg.Icon;
            return (
              <div key={type}>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.color}30` }}
                  >
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <p className="font-label text-xs tracking-widest" style={{ color: cfg.color, letterSpacing: "4px" }}>
                    {cfg.label}S
                  </p>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="sdt-card p-5"
                      style={{
                        borderLeft: `3px solid ${cfg.color}60`,
                        background: cfg.bg,
                      }}
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-body text-sm font-medium" style={{ color: "var(--creme)" }}>
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {item.type === "obstacle" && (
                            <span
                              className="font-label text-xs px-2 py-0.5 rounded flex items-center gap-1"
                              style={{
                                color: item.isResolved ? "#4eba8a" : "var(--ambar)",
                                background: item.isResolved ? "rgba(78,186,138,0.12)" : "rgba(224,145,63,0.12)",
                                border: `1px solid ${item.isResolved ? "#4eba8a" : "var(--ambar)"}40`,
                                letterSpacing: "2px",
                              }}
                            >
                              {item.isResolved ? (
                                <><CheckCircle2 size={10} /> RESUELTO</>
                              ) : (
                                <><AlertTriangle size={10} /> ACTIVO</>
                              )}
                            </span>
                          )}
                          <span className="text-xs" style={{ color: "var(--gris)" }}>
                            {new Date(item.date).toLocaleDateString("es-AR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "rgba(245,240,232,0.7)" }}>
                        {item.description}
                      </p>
                      {item.resolution && (
                        <div
                          className="mt-3 pt-3"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <p className="font-label text-xs tracking-widest mb-1" style={{ color: "#4eba8a", letterSpacing: "3px" }}>
                            RESOLUCIÓN
                          </p>
                          <p className="text-sm" style={{ color: "rgba(245,240,232,0.6)" }}>
                            {item.resolution}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
