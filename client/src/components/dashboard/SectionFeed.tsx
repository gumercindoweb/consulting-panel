import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
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

const EMPTY_FORM = {
  title: "",
  body: "",
  category: "general" as Category,
  status: "on_track" as Status,
  impact: "medium" as Impact,
  isPublic: true,
  date: new Date().toISOString().split("T")[0],
};

export default function SectionFeed({ clientId }: { clientId: number }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const utils = trpc.useUtils();

  const { data: updates = [], isLoading } = trpc.updates.list.useQuery({ clientId });

  const createMutation = trpc.updates.create.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); setShowForm(false); setForm(EMPTY_FORM); },
  });
  const updateMutation = trpc.updates.update.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); setEditingId(null); },
  });
  const deleteMutation = trpc.updates.delete.useMutation({
    onSuccess: () => utils.updates.list.invalidate({ clientId }),
  });

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [filterCategory, setFilterCategory] = useState<Category | null>(null);
  const [filterStatus, setFilterStatus] = useState<Status | null>(null);

  const filtered = updates.filter((u) => {
    if (filterCategory && u.category !== filterCategory) return false;
    if (filterStatus && u.status !== filterStatus) return false;
    return true;
  });

  const inputStyle = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(245,240,232,0.12)",
    borderRadius: "3px",
    color: "var(--creme)",
    fontFamily: "var(--font-body)",
    fontSize: "13px",
    padding: "8px 12px",
    width: "100%",
    outline: "none",
  };

  const selectStyle = { ...inputStyle };

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

      {/* Admin: botón nueva actualización */}
      {isAdmin && (
        <div style={{ marginBottom: "24px" }}>
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", borderRadius: "3px", padding: "10px 20px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--font-label)" }}
            >
              + NUEVA ACTUALIZACIÓN
            </button>
          ) : (
            <div style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.1)", borderRadius: "6px", padding: "20px" }}>
              <p className="font-label" style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--rojo)", marginBottom: "16px" }}>NUEVA ACTUALIZACIÓN</p>
              <div style={{ display: "grid", gap: "10px" }}>
                <input style={inputStyle} placeholder="Título *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                <textarea style={{ ...inputStyle, minHeight: "90px", resize: "vertical" }} placeholder="Descripción *" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                  <select style={selectStyle} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}>
                    {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                      <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                  <select style={selectStyle} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}>
                    {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <select style={selectStyle} value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value as Impact }))}>
                    <option value="high">IMPACTO ALTO</option>
                    <option value="medium">IMPACTO MEDIO</option>
                    <option value="low">IMPACTO BAJO</option>
                  </select>
                  <input type="date" style={selectStyle} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--gris)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                  <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} />
                  Visible para el cliente
                </label>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                <button
                  onClick={() => { if (form.title && form.body) createMutation.mutate({ clientId, ...form }); }}
                  disabled={!form.title || !form.body || createMutation.isPending}
                  style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", borderRadius: "3px", padding: "8px 18px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--font-label)", opacity: (!form.title || !form.body) ? 0.5 : 1 }}
                >
                  PUBLICAR
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={{ background: "none", border: "1px solid rgba(245,240,232,0.15)", color: "var(--gris)", borderRadius: "3px", padding: "8px 18px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--font-label)" }}>
                  CANCELAR
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
        <button onClick={() => setFilterCategory(null)} style={{ fontSize: "10px", letterSpacing: "2px", padding: "4px 10px", borderRadius: "20px", border: "1px solid rgba(245,240,232,0.15)", background: !filterCategory ? "rgba(179,40,37,0.2)" : "transparent", color: !filterCategory ? "var(--creme)" : "var(--gris)", cursor: "pointer", fontFamily: "var(--font-label)" }}>
          TODAS
        </button>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <button key={c} onClick={() => setFilterCategory(filterCategory === c ? null : c)}
            style={{ fontSize: "10px", letterSpacing: "2px", padding: "4px 10px", borderRadius: "20px", border: `1px solid ${CATEGORY_COLORS[c]}44`, background: filterCategory === c ? `${CATEGORY_COLORS[c]}22` : "transparent", color: filterCategory === c ? CATEGORY_COLORS[c] : "var(--gris)", cursor: "pointer", fontFamily: "var(--font-label)" }}>
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Feed */}
      {isLoading && (
        <p style={{ color: "var(--gris)", fontSize: "13px", fontFamily: "var(--font-body)" }}>Cargando actualizaciones…</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gris)" }}>
          <p className="font-label" style={{ fontSize: "10px", letterSpacing: "3px" }}>SIN ACTUALIZACIONES</p>
          {isAdmin && <p style={{ fontSize: "13px", marginTop: "8px", fontFamily: "var(--font-body)" }}>Publicá la primera actualización del proyecto.</p>}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {filtered.map((update) => {
          const cat = update.category as Category;
          const sta = update.status as Status;
          const imp = update.impact as Impact;
          const isExpanded = expandedId === update.id;
          const isEditing = editingId === update.id;
          const dateStr = new Date(update.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });

          if (isEditing) {
            return (
              <div key={update.id} style={{ background: "rgba(245,240,232,0.04)", border: "1px solid rgba(245,240,232,0.1)", borderRadius: "6px", padding: "20px" }}>
                <div style={{ display: "grid", gap: "10px" }}>
                  <input style={inputStyle} value={editData.title ?? update.title} onChange={(e) => setEditData((d: any) => ({ ...d, title: e.target.value }))} />
                  <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} value={editData.body ?? update.body} onChange={(e) => setEditData((d: any) => ({ ...d, body: e.target.value }))} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px" }}>
                    <select style={selectStyle} value={editData.category ?? update.category} onChange={(e) => setEditData((d: any) => ({ ...d, category: e.target.value }))}>
                      {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                    </select>
                    <select style={selectStyle} value={editData.status ?? update.status} onChange={(e) => setEditData((d: any) => ({ ...d, status: e.target.value }))}>
                      {(Object.keys(STATUS_LABELS) as Status[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                    <select style={selectStyle} value={editData.impact ?? update.impact} onChange={(e) => setEditData((d: any) => ({ ...d, impact: e.target.value }))}>
                      <option value="high">ALTO</option><option value="medium">MEDIO</option><option value="low">BAJO</option>
                    </select>
                    <input type="date" style={selectStyle} value={editData.date ?? new Date(update.date).toISOString().split("T")[0]} onChange={(e) => setEditData((d: any) => ({ ...d, date: e.target.value }))} />
                  </div>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "var(--gris)", cursor: "pointer", fontFamily: "var(--font-body)" }}>
                    <input type="checkbox" checked={editData.isPublic ?? update.isPublic} onChange={(e) => setEditData((d: any) => ({ ...d, isPublic: e.target.checked }))} />
                    Visible para el cliente
                  </label>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
                  <button onClick={() => updateMutation.mutate({ id: update.id, clientId, ...editData })}
                    style={{ background: "var(--rojo)", color: "var(--creme)", border: "none", borderRadius: "3px", padding: "8px 18px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--font-label)" }}>
                    GUARDAR
                  </button>
                  <button onClick={() => { setEditingId(null); setEditData({}); }}
                    style={{ background: "none", border: "1px solid rgba(245,240,232,0.15)", color: "var(--gris)", borderRadius: "3px", padding: "8px 18px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--font-label)" }}>
                    CANCELAR
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div key={update.id} style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderLeft: `3px solid ${CATEGORY_COLORS[cat]}`, borderRadius: "4px", padding: "16px 20px", cursor: "pointer", transition: "background 0.2s" }}
              onClick={() => setExpandedId(isExpanded ? null : update.id)}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "9px", letterSpacing: "2px", padding: "2px 8px", borderRadius: "20px", background: `${CATEGORY_COLORS[cat]}22`, color: CATEGORY_COLORS[cat], fontFamily: "var(--font-label)" }}>
                      {CATEGORY_LABELS[cat]}
                    </span>
                    <span style={{ fontSize: "9px", letterSpacing: "2px", padding: "2px 8px", borderRadius: "20px", background: `${STATUS_COLORS[sta]}18`, color: STATUS_COLORS[sta], fontFamily: "var(--font-label)" }}>
                      {STATUS_LABELS[sta]}
                    </span>
                    {!update.isPublic && isAdmin && (
                      <span style={{ fontSize: "9px", letterSpacing: "2px", padding: "2px 8px", borderRadius: "20px", background: "rgba(138,128,130,0.15)", color: "var(--gris)", fontFamily: "var(--font-label)" }}>
                        PRIVADO
                      </span>
                    )}
                  </div>
                  <h3 className="font-display" style={{ fontSize: "1.15rem", color: "var(--creme)", marginBottom: "4px", lineHeight: 1.2 }}>
                    {update.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "var(--gris)", fontFamily: "var(--font-body)" }}>{dateStr}</p>
                  {isExpanded && (
                    <p style={{ fontSize: "13px", color: "var(--creme)", fontFamily: "var(--font-body)", marginTop: "12px", lineHeight: 1.6, opacity: 0.85 }}>
                      {update.body}
                    </p>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  <span style={{ fontSize: "10px", letterSpacing: "1px", color: imp === "high" ? "var(--rojo)" : imp === "medium" ? "var(--ambar)" : "var(--gris)", fontFamily: "var(--font-label)" }}>
                    ↑ {IMPACT_LABELS[imp]}
                  </span>
                  {isAdmin && (
                    <div style={{ display: "flex", gap: "4px" }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => { setEditingId(update.id); setEditData({}); }}
                        style={{ background: "none", border: "none", color: "var(--gris)", cursor: "pointer", padding: "4px", fontSize: "11px" }}>✏</button>
                      <button onClick={() => { if (confirm("¿Eliminar esta actualización?")) deleteMutation.mutate({ id: update.id, clientId }); }}
                        style={{ background: "none", border: "none", color: "var(--rojo)", cursor: "pointer", padding: "4px", fontSize: "11px" }}>✕</button>
                    </div>
                  )}
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
