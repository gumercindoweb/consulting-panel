import { trpc } from "@/lib/trpc";
import { useState } from "react";

type Category = "session" | "result" | "delivery" | "insight" | "blocker" | "win" | "general";
type Status = "on_track" | "at_risk" | "blocked";
type Impact = "high" | "medium" | "low";

const CATEGORY_LABELS: Record<Category, string> = {
  session: "SESIÓN",
  result: "RESULTADO",
  delivery: "ENTREGABLE",
  insight: "INSIGHT",
  blocker: "BLOQUEADOR",
  win: "LOGRO",
  general: "ACTUALIZACIÓN",
};

const CATEGORY_COLORS: Record<Category, string> = {
  session:  "#4db6e8",
  result:   "#4eba8a",
  delivery: "#E0913F",
  insight:  "#b87fd4",
  blocker:  "#B32825",
  win:      "#4eba8a",
  general:  "#8a8082",
};

const STATUS_LABELS: Record<Status, string> = {
  on_track: "EN CURSO",
  at_risk:  "EN RIESGO",
  blocked:  "BLOQUEADO",
};

const STATUS_COLORS: Record<Status, string> = {
  on_track: "#4eba8a",
  at_risk:  "#E0913F",
  blocked:  "#B32825",
};

const IMPACT_LABELS: Record<Impact, string> = {
  high:   "ALTO",
  medium: "MEDIO",
  low:    "BAJO",
};

export default function SectionFeed({ clientId }: { clientId: number }) {
  const { data: updates = [], isLoading } = trpc.updates.list.useQuery({ clientId });
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);

  const filtered = updates.filter((u) => !filterCategory || u.category === filterCategory);

  return (
    <div>
      {/* Header */}
      <p className="font-label" style={{ fontSize: "10px", letterSpacing: "4px", color: "var(--rojo)", marginBottom: "6px" }}>
        ACTUALIZACIONES
      </p>
      <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "var(--creme)", lineHeight: 1.1, marginBottom: "8px" }}>
        Bitácora del Proyecto
      </h2>
      <p style={{ fontSize: "14px", color: "var(--gris)", marginBottom: "24px", fontFamily: "var(--font-body)" }}>
        Registro cronológico de avances, sesiones y decisiones del proyecto.
      </p>
      <div className="sdt-divider" style={{ marginBottom: "28px" }} />

      {/* Filtros por categoría */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "24px" }}>
        <button
          onClick={() => setFilterCategory(null)}
          style={{ fontSize: "10px", letterSpacing: "2px", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(245,240,232,0.15)", background: !filterCategory ? "rgba(179,40,37,0.2)" : "transparent", color: !filterCategory ? "var(--creme)" : "var(--gris)", cursor: "pointer", fontFamily: "var(--font-label)" }}
        >
          TODAS
        </button>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <button key={c} onClick={() => setFilterCategory(filterCategory === c ? null : c)}
            style={{ fontSize: "10px", letterSpacing: "2px", padding: "4px 10px", borderRadius: "20px", border: `1px solid ${CATEGORY_COLORS[c]}44`, background: filterCategory === c ? `${CATEGORY_COLORS[c]}22` : "transparent", color: filterCategory === c ? CATEGORY_COLORS[c] : "var(--gris)", cursor: "pointer", fontFamily: "var(--font-label)" }}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {isLoading && (
        <p style={{ color: "var(--gris)", fontSize: "13px", fontFamily: "var(--font-body)" }}>Cargando actualizaciones…</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 0", color: "var(--gris)" }}>
          <p className="font-label" style={{ fontSize: "10px", letterSpacing: "3px" }}>SIN ACTUALIZACIONES</p>
          <p style={{ fontSize: "13px", marginTop: "8px", fontFamily: "var(--font-body)" }}>
            Las actualizaciones del proyecto aparecerán aquí.
          </p>
        </div>
      )}

      {/* Feed — solo lectura */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((update) => {
          const cat = update.category as Category;
          const sta = update.status as Status;
          const imp = update.impact as Impact;
          const isExpanded = expandedId === update.id;
          const dateStr = new Date(update.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

          return (
            <div
              key={update.id}
              onClick={() => setExpandedId(isExpanded ? null : update.id)}
              style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderLeft: `3px solid ${CATEGORY_COLORS[cat]}`, borderRadius: "4px", padding: "18px 20px", cursor: "pointer", transition: "background 0.2s" }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "9px", letterSpacing: "2px", padding: "2px 8px", borderRadius: "20px", background: `${CATEGORY_COLORS[cat]}22`, color: CATEGORY_COLORS[cat], fontFamily: "var(--font-label)" }}>
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span style={{ fontSize: "9px", letterSpacing: "2px", padding: "2px 8px", borderRadius: "20px", background: `${STATUS_COLORS[sta]}18`, color: STATUS_COLORS[sta], fontFamily: "var(--font-label)" }}>
                      {STATUS_LABELS[sta]}
                    </span>
                  </div>
                  <h3 className="font-display" style={{ fontSize: "1.15rem", color: "var(--creme)", marginBottom: "4px", lineHeight: 1.2 }}>
                    {update.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--gris)", fontFamily: "var(--font-body)" }}>{dateStr}</p>
                  {isExpanded && (
                    <p style={{ fontSize: "13px", color: "var(--creme)", fontFamily: "var(--font-body)", marginTop: "14px", lineHeight: 1.7, opacity: 0.85 }}>
                      {update.body}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <span style={{ fontSize: "10px", letterSpacing: "1px", color: imp === "high" ? "var(--rojo)" : imp === "medium" ? "var(--ambar)" : "var(--gris)", fontFamily: "var(--font-label)" }}>
                    ↑ {IMPACT_LABELS[imp]}
                  </span>
                  <span style={{ color: "var(--gris)", fontSize: "12px" }}>{isExpanded ? "▲" : "▼"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
