import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props { clientId: number; }

const TREND_CONFIG = {
  up:     { icon: TrendingUp,   color: "#4eba8a", label: "SUBIENDO" },
  down:   { icon: TrendingDown, color: "#ef4444", label: "BAJANDO"  },
  stable: { icon: Minus,        color: "#888",    label: "ESTABLE"  },
};

export default function SectionMetrics({ clientId }: Props) {
  const { data: metrics = [], isLoading } = trpc.metrics.list.useQuery({ clientId });

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">MÉTRICAS</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Indicadores del Negocio
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Seguimiento de los KPIs clave del proyecto.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading && (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      )}

      {!isLoading && metrics.length === 0 && (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Aún no hay métricas registradas.
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--gris)" }}>
            Tu consultor irá actualizando los indicadores del proyecto.
          </p>
        </div>
      )}

      {!isLoading && metrics.length > 0 && (
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {metrics.map((m) => {
            const trend = (m.trend ?? "stable") as "up" | "down" | "stable";
            const cfg = TREND_CONFIG[trend];
            const Icon = cfg.icon;

            return (
              <div
                key={m.id}
                className="sdt-card p-6"
                style={{ borderTop: `3px solid ${cfg.color}` }}
              >
                {/* Name + trend */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <p
                    className="font-label text-xs tracking-widest"
                    style={{ color: "var(--gris)", letterSpacing: "2px", lineHeight: 1.4 }}
                  >
                    {m.name.toUpperCase()}
                  </p>
                  <span
                    className="flex items-center gap-1 text-xs font-label"
                    style={{ color: cfg.color, letterSpacing: "1px", flexShrink: 0 }}
                  >
                    <Icon size={13} />
                    {cfg.label}
                  </span>
                </div>

                {/* Main value */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="font-display"
                    style={{ fontSize: "clamp(2rem, 5vw, 2.8rem)", fontWeight: 700, color: cfg.color, lineHeight: 1 }}
                  >
                    {m.value}
                  </span>
                  {m.unit && (
                    <span className="font-label text-sm" style={{ color: "var(--gris)" }}>
                      {m.unit}
                    </span>
                  )}
                </div>

                {/* Previous value comparison */}
                {m.previousValue && (
                  <p className="text-xs mb-1" style={{ color: "var(--gris)" }}>
                    Anterior: <span style={{ color: "var(--oro-pale)" }}>{m.previousValue}{m.unit ? ` ${m.unit}` : ""}</span>
                  </p>
                )}

                {/* Period */}
                {m.period && (
                  <p
                    className="font-label text-xs tracking-widest mt-3"
                    style={{ color: "rgba(138,128,130,0.5)", letterSpacing: "2px" }}
                  >
                    {m.period.toUpperCase()}
                  </p>
                )}

                {/* Description */}
                {m.description && (
                  <p className="text-xs mt-2" style={{ color: "var(--gris)", fontStyle: "italic" }}>
                    {m.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
