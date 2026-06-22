import { trpc } from "@/lib/trpc";
import type { Client } from "../../../../drizzle/schema";
import { TrendingDown, TrendingUp, Minus, CheckCircle2, Clock, Circle } from "lucide-react";

interface Props {
  clientId: number;
  client: Client;
}

function MetricCard({ metric }: { metric: any }) {
  const TrendIcon =
    metric.trend === "up" ? TrendingUp : metric.trend === "down" ? TrendingDown : Minus;
  const trendColor =
    metric.trend === "up" ? "#4eba8a" : metric.trend === "down" ? "var(--rojo-vivo)" : "var(--gris)";

  return (
    <div className="sdt-card p-6">
      <p className="font-label text-xs tracking-widest mb-3" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
        {metric.name.toUpperCase()}
      </p>
      <div className="flex items-end gap-3 mb-2">
        <span className="font-display text-4xl font-bold" style={{ color: "var(--creme)", lineHeight: 1 }}>
          {metric.value}
        </span>
        {metric.unit && (
          <span className="font-body text-sm mb-1" style={{ color: "var(--gris)" }}>
            {metric.unit}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <TrendIcon size={14} style={{ color: trendColor }} />
        {metric.previousValue && (
          <span className="text-xs" style={{ color: "var(--gris)" }}>
            Anterior: {metric.previousValue}
            {metric.unit ? ` ${metric.unit}` : ""}
          </span>
        )}
        {metric.period && (
          <span className="text-xs ml-auto" style={{ color: "var(--gris)" }}>
            {metric.period}
          </span>
        )}
      </div>
      {metric.description && (
        <p className="text-xs mt-3" style={{ color: "rgba(138,128,130,0.7)" }}>
          {metric.description}
        </p>
      )}
    </div>
  );
}

function OkrCard({ okr }: { okr: any }) {
  const statusColors: Record<string, string> = {
    on_track: "#4eba8a",
    at_risk: "var(--ambar)",
    off_track: "var(--rojo-vivo)",
    completed: "#4eba8a",
  };
  const statusLabels: Record<string, string> = {
    on_track: "EN CURSO",
    at_risk: "EN RIESGO",
    off_track: "DESVIADO",
    completed: "COMPLETADO",
  };

  return (
    <div className="sdt-card p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <p className="font-body text-xs mb-1" style={{ color: "var(--gris)" }}>
            {okr.objective}
          </p>
          <p className="font-body text-sm font-medium" style={{ color: "var(--creme)" }}>
            {okr.keyResult}
          </p>
        </div>
        <span
          className="font-label text-xs px-2 py-1 rounded flex-shrink-0"
          style={{
            color: statusColors[okr.status],
            background: `${statusColors[okr.status]}18`,
            border: `1px solid ${statusColors[okr.status]}40`,
            letterSpacing: "2px",
          }}
        >
          {statusLabels[okr.status]}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <div className="progress-bar-track flex-1">
          <div
            className="progress-bar-fill"
            style={{ width: `${okr.progressPct}%` }}
          />
        </div>
        <span className="font-label text-xs" style={{ color: "var(--ambar)", letterSpacing: "1px" }}>
          {okr.progressPct}%
        </span>
      </div>
      {okr.targetValue && (
        <div className="flex items-center gap-4 mt-2">
          <span className="text-xs" style={{ color: "var(--gris)" }}>
            Meta: <strong style={{ color: "var(--creme)" }}>{okr.targetValue}</strong>
            {okr.unit ? ` ${okr.unit}` : ""}
          </span>
          {okr.currentValue && (
            <span className="text-xs" style={{ color: "var(--gris)" }}>
              Actual: <strong style={{ color: "var(--ambar)" }}>{okr.currentValue}</strong>
              {okr.unit ? ` ${okr.unit}` : ""}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function PhaseRow({ phase }: { phase: any }) {
  const StatusIcon =
    phase.status === "completed"
      ? CheckCircle2
      : phase.status === "in_progress"
      ? Clock
      : Circle;
  const statusColor =
    phase.status === "completed"
      ? "#4eba8a"
      : phase.status === "in_progress"
      ? "var(--ambar)"
      : "var(--gris)";
  const statusLabel =
    phase.status === "completed"
      ? "COMPLETADA"
      : phase.status === "in_progress"
      ? "EN CURSO"
      : "PENDIENTE";

  return (
    <div
      className="flex items-center gap-4 py-4"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: `${statusColor}18`,
          border: `1px solid ${statusColor}40`,
        }}
      >
        <StatusIcon size={16} style={{ color: statusColor }} />
      </div>
      <div className="flex-1">
        <p className="font-body text-sm font-medium" style={{ color: "var(--creme)" }}>
          {phase.name}
        </p>
        {phase.description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--gris)" }}>
            {phase.description}
          </p>
        )}
      </div>
      <div className="text-right">
        <span
          className="font-label text-xs px-2 py-1 rounded"
          style={{
            color: statusColor,
            background: `${statusColor}15`,
            border: `1px solid ${statusColor}35`,
            letterSpacing: "2px",
          }}
        >
          {statusLabel}
        </span>
        {phase.startDate && (
          <p className="text-xs mt-1" style={{ color: "var(--gris)" }}>
            {new Date(phase.startDate).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}
            {phase.endDate
              ? ` — ${new Date(phase.endDate).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}`
              : ""}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SectionOverview({ clientId, client }: Props) {
  const { data: metrics = [], isLoading: metricsLoading } = trpc.metrics.list.useQuery({ clientId });
  const { data: okrs = [], isLoading: okrsLoading } = trpc.okrs.list.useQuery({ clientId });
  const { data: phases = [], isLoading: phasesLoading } = trpc.phases.list.useQuery({ clientId });
  const { data: milestones = [] } = trpc.milestones.list.useQuery({ clientId });

  const completedPhases = phases.filter((p) => p.status === "completed").length;
  const inProgressPhases = phases.filter((p) => p.status === "in_progress").length;
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const avgOkrProgress =
    okrs.length > 0 ? Math.round(okrs.reduce((s, o) => s + o.progressPct, 0) / okrs.length) : 0;

  const coverUrl = (client as any).coverImageUrl;

  return (
    <div className="space-y-10 animate-fade-up">
      {/* Cover image */}
      {coverUrl && (
        <div
          className="relative w-full overflow-hidden"
          style={{ height: 280, borderRadius: 12, marginBottom: 8 }}
        >
          <img
            src={coverUrl}
            alt={client.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center 20%",
            }}
          />
          {/* Scrim gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(11,8,7,0.95) 0%, rgba(11,8,7,0.3) 50%, transparent 100%)",
            }}
          />
          {/* Title over cover */}
          <div style={{ position: "absolute", bottom: 24, left: 28 }}>
            <p className="sdt-section-label mb-1" style={{ letterSpacing: "5px" }}>RESUMEN EJECUTIVO</p>
            <h1 className="font-display text-4xl font-bold" style={{ color: "var(--creme)" }}>
              Estado del Proyecto
            </h1>
          </div>
        </div>
      )}

      {/* Header (when no cover) */}
      {!coverUrl && (
        <div>
          <p className="sdt-section-label mb-3">RESUMEN EJECUTIVO</p>
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
            Estado del Proyecto
          </h1>
          <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
            {client.description || "Seguimiento estratégico en tiempo real."}
          </p>
        </div>
      )}

      {coverUrl && (
        <p className="font-serif text-lg -mt-4" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          {client.description || "Seguimiento estratégico en tiempo real."}
        </p>
      )}

      <div className="sdt-divider" />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "FASES COMPLETADAS", value: completedPhases, total: phases.length, color: "#4eba8a" },
          { label: "EN CURSO", value: inProgressPhases, total: phases.length, color: "var(--ambar)" },
          { label: "HITOS LOGRADOS", value: completedMilestones, total: milestones.length, color: "var(--rojo)" },
          { label: "PROGRESO OKRs", value: `${avgOkrProgress}%`, total: null, color: "var(--oro)" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="sdt-card p-5 text-center"
          >
            <p
              className="font-display text-3xl font-bold mb-1"
              style={{ color: stat.color }}
            >
              {stat.value}
              {stat.total !== null && (
                <span className="text-base font-normal" style={{ color: "var(--gris)" }}>
                  /{stat.total}
                </span>
              )}
            </p>
            <p className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Metrics */}
      {metrics.length > 0 && (
        <div>
          <p className="sdt-section-label mb-6">MÉTRICAS CLAVE</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((m) => (
              <MetricCard key={m.id} metric={m} />
            ))}
          </div>
        </div>
      )}

      {/* Phases overview */}
      {phases.length > 0 && (
        <div>
          <p className="sdt-section-label mb-6">ETAPAS DEL PROYECTO</p>
          <div className="sdt-card px-6">
            {phases.map((phase) => (
              <PhaseRow key={phase.id} phase={phase} />
            ))}
          </div>
        </div>
      )}

      {/* OKRs */}
      {okrs.length > 0 && (
        <div>
          <p className="sdt-section-label mb-6">OKRs ACTIVOS</p>
          <div className="space-y-3">
            {okrs.slice(0, 4).map((okr) => (
              <OkrCard key={okr.id} okr={okr} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {metrics.length === 0 && okrs.length === 0 && phases.length === 0 && (
        <div
          className="sdt-card p-12 text-center"
        >
          <p className="font-label text-xs tracking-widest mb-3" style={{ color: "var(--ambar)", letterSpacing: "5px" }}>
            EN CONFIGURACIÓN
          </p>
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Tu consultor está cargando los datos del proyecto.
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--gris)" }}>
            Pronto verás aquí el resumen completo de tu estrategia.
          </p>
        </div>
      )}
    </div>
  );
}
