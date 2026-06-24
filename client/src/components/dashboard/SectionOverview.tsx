import { trpc } from "@/lib/trpc";
import type { Client } from "../../../../drizzle/schema";

interface Props {
  clientId: number;
  client: Client;
}

export default function SectionOverview({ clientId, client }: Props) {
  const { data: metrics = [] } = trpc.metrics.list.useQuery({ clientId });
  const { data: okrs = [] } = trpc.okrs.list.useQuery({ clientId });
  const { data: phases = [] } = trpc.phases.list.useQuery({ clientId });
  const { data: milestones = [] } = trpc.milestones.list.useQuery({ clientId });

  const completedPhases = phases.filter((p) => p.status === "completed").length;
  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const avgOkrProgress = okrs.length > 0 ? Math.round(okrs.reduce((s, o) => s + o.progressPct, 0) / okrs.length) : 0;

  const branding = (client as any).branding as any;
  const isPrimaryRed = branding?.primaryColor === "#D01C1F";

  if (!isPrimaryRed) {
    return (
      <div className="space-y-8 animate-fade-up">
        <div>
          <p className="sdt-section-label mb-3">RESUMEN EJECUTIVO</p>
          <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
            Estado del Proyecto
          </h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="sdt-card p-4">
            <p className="font-label text-xs mb-2" style={{ color: "var(--gris)", letterSpacing: "2px" }}>FASES</p>
            <p className="font-display text-3xl font-bold">{completedPhases}/{phases.length}</p>
          </div>
          <div className="sdt-card p-4">
            <p className="font-label text-xs mb-2" style={{ color: "var(--gris)", letterSpacing: "2px" }}>HITOS</p>
            <p className="font-display text-3xl font-bold">{completedMilestones}/{milestones.length}</p>
          </div>
          <div className="sdt-card p-4">
            <p className="font-label text-xs mb-2" style={{ color: "var(--gris)", letterSpacing: "2px" }}>OKRs</p>
            <p className="font-display text-3xl font-bold">{avgOkrProgress}%</p>
          </div>
          <div className="sdt-card p-4">
            <p className="font-label text-xs mb-2" style={{ color: "var(--gris)", letterSpacing: "2px" }}>RECURSOS</p>
            <p className="font-display text-3xl font-bold">{metrics.length}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "-1.5rem", marginLeft: "-1.5rem", marginRight: "-1.5rem" }}>
      {/* RED STATEMENT HERO */}
      <div
        style={{
          background: "linear-gradient(135deg, var(--rojo) 0%, #7C2F2A 100%)",
          padding: "48px 32px",
          marginBottom: "2px",
        }}
      >
        <h1
          style={{
            fontSize: "44px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "-0.02em",
            color: "#fff",
            lineHeight: 1,
            marginBottom: "12px",
            fontFamily: "'Futura Std', 'Futura', sans-serif",
          }}
        >
          {client.name}
        </h1>
        <p
          style={{
            fontSize: "13px",
            color: "rgba(255,255,255,0.85)",
            fontFamily: "'Futura Std', 'Futura', sans-serif",
            fontWeight: 400,
          }}
        >
          Patinamos juntos. Crecemos juntos. — Tu panel de progreso estratégico.
        </p>
      </div>

      {/* GRID 2x2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {/* ETAPAS */}
        <div
          style={{
            padding: "24px",
            background: "#111",
            border: "1px solid #222",
            borderRight: "1px solid #222",
            borderBottom: "1px solid #222",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--rojo)",
              marginBottom: "12px",
              fontWeight: 700,
              fontFamily: "'Futura Std Condensed', 'Futura Std', sans-serif",
            }}
          >
            📍 ETAPAS
          </p>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "8px",
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            {completedPhases} de {phases.length}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#888",
              lineHeight: 1.5,
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            {phases.length === 0
              ? "Sin fases definidas"
              : `${phases.length - completedPhases} pendiente${phases.length - completedPhases !== 1 ? "s" : ""}`}
          </p>
        </div>

        {/* HITOS */}
        <div
          style={{
            padding: "24px",
            background: "#1a1a1a",
            border: "1px solid #222",
            borderBottom: "1px solid #222",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--rojo)",
              marginBottom: "12px",
              fontWeight: 700,
              fontFamily: "'Futura Std Condensed', 'Futura Std', sans-serif",
            }}
          >
            🗓️ HITOS
          </p>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "8px",
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            {completedMilestones} logrado{completedMilestones !== 1 ? "s" : ""}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#888",
              lineHeight: 1.5,
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            {milestones.length === 0 ? "Sin hitos" : `${milestones.length} total en timeline`}
          </p>
        </div>

        {/* OKRs */}
        <div
          style={{
            padding: "24px",
            background: "#1a1a1a",
            border: "1px solid #222",
            borderRight: "1px solid #222",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--rojo)",
              marginBottom: "12px",
              fontWeight: 700,
              fontFamily: "'Futura Std Condensed', 'Futura Std', sans-serif",
            }}
          >
            📊 OKRs
          </p>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "8px",
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            {avgOkrProgress}% progreso
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#888",
              lineHeight: 1.5,
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            {okrs.length === 0 ? "Sin OKRs" : `${okrs.length} key results en track`}
          </p>
        </div>

        {/* BIBLIOTECA */}
        <div
          style={{
            padding: "24px",
            background: "#111",
            border: "1px solid #222",
          }}
        >
          <p
            style={{
              fontSize: "9px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--rojo)",
              marginBottom: "12px",
              fontWeight: 700,
              fontFamily: "'Futura Std Condensed', 'Futura Std', sans-serif",
            }}
          >
            📚 BIBLIOTECA
          </p>
          <p
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "8px",
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            {metrics.length} recurso{metrics.length !== 1 ? "s" : ""}
          </p>
          <p
            style={{
              fontSize: "12px",
              color: "#888",
              lineHeight: 1.5,
              fontFamily: "'Futura Std', 'Futura', sans-serif",
            }}
          >
            Videotutoriales, guías, referencias
          </p>
        </div>
      </div>
    </div>
  );
}
