import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, Plus, Trash2, Edit3, Save, X, Rss, CheckSquare, BarChart3, Target, BookOpen, FileText, FolderOpen, LayoutDashboard, GripVertical, PauseCircle, PlayCircle, Package, Lightbulb, Menu, Users, Eye, EyeOff, Upload, Paperclip, Sparkles, Send, Check, Copy, Lock, Shield, Link2, Ban } from "lucide-react";
import { MEMBER_GATED_SECTIONS, CLIENT_PORTAL_SECTIONS } from "@shared/const";
import TimelineTab from "@/components/admin/TimelineTab";
import SectionFeed from "@/components/dashboard/SectionFeed";
import SectionMilestones from "@/components/dashboard/SectionMilestones";
import SectionOKRs from "@/components/dashboard/SectionOKRs";
import SectionMetrics from "@/components/dashboard/SectionMetrics";
import SectionLearnings from "@/components/dashboard/SectionLearnings";
import SectionScope from "@/components/dashboard/SectionScope";
import SectionResources from "@/components/dashboard/SectionResources";
import SectionDigitalAssets from "@/components/dashboard/SectionDigitalAssets";
import { FilePreviewButton, isPreviewable } from "@/components/FilePreview";
import SectionBacklog from "@/components/dashboard/SectionBacklog";
import SectionTimeline from "@/components/dashboard/SectionTimeline";
import { useIsMobile } from "@/hooks/useMobile";
import { uploadClientFile } from "@/lib/storage";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Tab = "timeline" | "milestones" | "okrs" | "learnings" | "scope" | "resources" | "metrics" | "updates" | "digital_assets" | "backlog" | "users";

// Los labels coinciden 1:1 con las secciones del portal del cliente (ver
// DashboardSidebar NAV_ITEMS y PORTAL_SECTIONS). El orden también espeja al portal.
// Única pestaña admin-only: ACCESOS (gestión de usuarios, el cliente no la ve).
const TABS: { id: Tab; label: string; icon: React.FC<any>; title: string; subtitle: string }[] = [
  { id: "updates", label: "ACTUALIZACIONES", icon: Rss, title: "Actualizaciones del Proyecto", subtitle: "Publicá avances diarios que el cliente puede ver en su portal." },
  { id: "timeline", label: "HOJA DE RUTA", icon: CheckSquare, title: "Hoja de Ruta", subtitle: "Etapas, hitos y actualizaciones en la misma jerarquía que ve el cliente. Usá 'VISTA PREVIA' para confirmar cómo se ve en el portal." },
  { id: "milestones", label: "HITOS E IMPLEMENTACIONES", icon: BarChart3, title: "Hitos e Implementaciones", subtitle: "Logros y entregas clave que cuelgan de cada etapa." },
  { id: "okrs", label: "OBJETIVOS", icon: Target, title: "Objetivos", subtitle: "Objetivos medibles y su progreso actual." },
  { id: "metrics", label: "MÉTRICAS DEL NEGOCIO", icon: LayoutDashboard, title: "Métricas del Negocio", subtitle: "Indicadores clave de performance del cliente." },
  { id: "learnings", label: "APRENDIZAJES Y OBSTÁCULOS", icon: BookOpen, title: "Aprendizajes y Obstáculos", subtitle: "Registro de aprendizajes, obstáculos y logros." },
  { id: "scope", label: "ALCANCE DEL PROYECTO", icon: FileText, title: "Alcance del Proyecto", subtitle: "Qué está incluido y qué queda fuera del proyecto." },
  { id: "resources", label: "BIBLIOTECA DE FORMACIÓN", icon: FolderOpen, title: "Biblioteca de Formación", subtitle: "Videotutoriales, cursos, referencias y presentaciones para el equipo." },
  { id: "digital_assets", label: "ACTIVOS DIGITALES", icon: Package, title: "Activos Digitales", subtitle: "Las piezas del engranaje que sostienen la cadena de valor del marketing." },
  { id: "backlog", label: "BACKLOG DE IDEAS", icon: Lightbulb, title: "Backlog de Ideas", subtitle: "Registrá ideas, mejoras y oportunidades para el proyecto del cliente." },
  { id: "users", label: "ACCESOS", icon: Users, title: "Gestión de Accesos", subtitle: "Creá y administrá los usuarios que tienen acceso al portal de este cliente." },
];

// ─── FILE UPLOAD BUTTON ───────────────────────────────────────────────────────
function FileUploadButton({ clientId, onUploaded, label = "SUBIR ARCHIVO" }: {
  clientId: number;
  onUploaded: (publicUrl: string, filename: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl } = await uploadClientFile(clientId, file);
      onUploaded(publicUrl, file.name);
      toast.success("Archivo subido correctamente.");
    } catch (err: any) {
      toast.error(err?.message ?? "Error al subir el archivo.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.2)",
        borderRadius: "4px", cursor: uploading ? "wait" : "pointer",
        padding: "6px 12px", fontSize: "11px", letterSpacing: "2px", color: "var(--gj-muted)",
        opacity: uploading ? 0.6 : 1, transition: "all 0.2s",
      }}
    >
      {uploading ? <Upload size={12} className="animate-spin" /> : <Paperclip size={12} />}
      {uploading ? "SUBIENDO..." : label}
      <input type="file" style={{ display: "none" }} onChange={handleFile} disabled={uploading} />
    </label>
  );
}

// Variante que acepta varios archivos a la vez: los sube uno por uno y
// llama onUploaded por cada uno (el caller se encarga de acumularlos).
function MultiFileUploadButton({ clientId, onUploaded, label = "SUBIR ARCHIVOS" }: {
  clientId: number;
  onUploaded: (publicUrl: string, filename: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    let okCount = 0;
    try {
      for (const file of files) {
        try {
          const { publicUrl } = await uploadClientFile(clientId, file);
          onUploaded(publicUrl, file.name);
          okCount++;
        } catch (err: any) {
          toast.error(`${file.name}: ${err?.message ?? "error al subir"}`);
        }
      }
      if (okCount > 0) toast.success(`${okCount} archivo${okCount === 1 ? "" : "s"} subido${okCount === 1 ? "" : "s"} correctamente.`);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.2)",
        borderRadius: "4px", cursor: uploading ? "wait" : "pointer",
        padding: "6px 12px", fontSize: "11px", letterSpacing: "2px", color: "var(--gj-muted)",
        opacity: uploading ? 0.6 : 1, transition: "all 0.2s",
      }}
    >
      {uploading ? <Upload size={12} className="animate-spin" /> : <Paperclip size={12} />}
      {uploading ? "SUBIENDO..." : label}
      <input type="file" multiple style={{ display: "none" }} onChange={handleFiles} disabled={uploading} />
    </label>
  );
}

// ─── UPDATES TAB ──────────────────────────────────────────────────────────────
function UpdatesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: updates = [] } = trpc.updates.list.useQuery({ clientId });
  const { data: phases = [] } = trpc.phases.list.useQuery({ clientId });
  const { data: milestones = [] } = trpc.milestones.list.useQuery({ clientId });
  const createUpdate = trpc.updates.create.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); toast.success("Actualización publicada."); setShowForm(false); setForm(EMPTY); },
    onError: (e) => toast.error(e.message),
  });
  const deleteUpdate = trpc.updates.delete.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); toast.success("Eliminada."); },
    onError: (e) => toast.error(e.message),
  });
  const updateUpdate = trpc.updates.update.useMutation({
    onSuccess: () => { utils.updates.list.invalidate({ clientId }); toast.success("Guardada."); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });

  const EMPTY = { title: "", body: "", category: "general" as const, status: "on_track" as const, impact: "medium" as const, url: "", fileUrls: [] as { url: string; name: string }[], isPublic: true, date: new Date().toISOString().split("T")[0], phaseId: undefined as number | undefined, milestoneId: undefined as number | undefined };

  const uFiles = (u: any): { url: string; name: string }[] =>
    Array.isArray(u?.fileUrls) && u.fileUrls.length
      ? u.fileUrls
      : (u?.fileUrl ? [{ url: u.fileUrl, name: u.fileUrl.split("/").pop() ?? "archivo" }] : []);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});

  const inp = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: "13px", padding: "7px 10px", width: "100%", outline: "none" };

  const CAT_LABELS: Record<string, string> = { session: "SESIÓN", result: "RESULTADO", delivery: "ENTREGABLE", insight: "INSIGHT", blocker: "BLOQUEADOR", win: "LOGRO", general: "ACTUALIZACIÓN" };

  const milestonesForPhase = (phaseId: number | undefined) =>
    phaseId ? milestones.filter((m) => m.phaseId === phaseId) : milestones;

  const getMilestoneName = (milestoneId: number | null | undefined) =>
    milestones.find((m) => m.id === milestoneId)?.title;

  const getPhaseName = (phaseId: number | null | undefined) =>
    phases.find((p) => p.id === phaseId)?.name;

  return (
    <div className="space-y-4">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
          <Plus size={14} /> NUEVA ACTUALIZACIÓN
        </button>
      ) : (
        <div className="gj-card p-5 space-y-3">
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "3px" }}>NUEVA ACTUALIZACIÓN</p>
          <input style={inp} placeholder="Título *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          <textarea style={{ ...inp, minHeight: "80px", resize: "vertical" }} placeholder="Descripción *" value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <select style={inp} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))}>
              {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select style={inp} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}>
              <option value="on_track">EN CURSO</option><option value="at_risk">EN RIESGO</option><option value="blocked">BLOQUEADO</option><option value="completed">COMPLETADO</option>
            </select>
            <select style={inp} value={form.impact} onChange={(e) => setForm((f) => ({ ...f, impact: e.target.value as any }))}>
              <option value="high">IMPACTO ALTO</option><option value="medium">IMPACTO MEDIO</option><option value="low">IMPACTO BAJO</option>
            </select>
            <input type="date" style={inp} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
            <select style={inp} value={form.phaseId ?? ""} onChange={(e) => setForm((f) => ({ ...f, phaseId: e.target.value ? Number(e.target.value) : undefined, milestoneId: undefined }))}>
              <option value="">— Etapa (opcional) —</option>
              {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select style={inp} value={form.milestoneId ?? ""} onChange={(e) => { const mid = e.target.value ? Number(e.target.value) : undefined; const m = milestones.find((x) => x.id === mid); setForm((f) => ({ ...f, milestoneId: mid, phaseId: m?.phaseId ?? f.phaseId })); }}>
              <option value="">— Hito (opcional) —</option>
              {milestonesForPhase(form.phaseId).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
            </select>
          </div>
          <input style={inp} placeholder="URL de referencia (opcional) — ej. publicación, entregable, documento" value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} />
          <div className="flex flex-wrap items-center gap-2">
            {form.fileUrls.map((f, i) => (
              <span key={f.url} className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}>
                <Paperclip size={12} /> {f.name}
                <button type="button" onClick={() => setForm((cf) => ({ ...cf, fileUrls: cf.fileUrls.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button>
              </span>
            ))}
            <MultiFileUploadButton clientId={clientId} onUploaded={(url, name) => setForm((cf) => ({ ...cf, fileUrls: [...cf.fileUrls, { url, name }] }))} label="SUBIR ARCHIVOS (PDF, IMAGEN, ETC.)" />
          </div>
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--gj-muted)", cursor: "pointer" }}>
            <input type="checkbox" checked={form.isPublic} onChange={(e) => setForm((f) => ({ ...f, isPublic: e.target.checked }))} />
            Visible para el cliente
          </label>
          <div className="flex gap-2">
            <button onClick={() => { if (form.title && form.body) createUpdate.mutate({ clientId, ...form }); }} disabled={!form.title || !form.body} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px", opacity: (!form.title || !form.body) ? 0.5 : 1 }}>
              <Save size={14} /> PUBLICAR
            </button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="text-xs px-4 py-2 rounded" style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gj-muted)", cursor: "pointer", letterSpacing: "2px" }}>
              CANCELAR
            </button>
          </div>
        </div>
      )}

      {updates.map((u) => {
        const milestoneName = getMilestoneName(u.milestoneId);
        const phaseName = getPhaseName(u.phaseId);
        const editPhaseId = editData.phaseId !== undefined ? editData.phaseId : u.phaseId;
        return (
          <div key={u.id} style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "16px" }}>
            {editingId === u.id ? (
              <div className="space-y-3">
                <input style={inp} value={editData.title ?? u.title} onChange={(e) => setEditData((d: any) => ({ ...d, title: e.target.value }))} />
                <textarea style={{ ...inp, minHeight: "70px", resize: "vertical" }} value={editData.body ?? u.body} onChange={(e) => setEditData((d: any) => ({ ...d, body: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <select style={inp} value={editData.category ?? u.category} onChange={(e) => setEditData((d: any) => ({ ...d, category: e.target.value }))}>
                    {Object.entries(CAT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                  <select style={inp} value={editData.status ?? u.status} onChange={(e) => setEditData((d: any) => ({ ...d, status: e.target.value }))}>
                    <option value="on_track">EN CURSO</option><option value="at_risk">EN RIESGO</option><option value="blocked">BLOQUEADO</option><option value="completed">COMPLETADO</option>
                  </select>
                  <input type="date" style={inp} value={editData.date ?? new Date(u.date).toISOString().split("T")[0]} onChange={(e) => setEditData((d: any) => ({ ...d, date: e.target.value }))} />
                  <label className="flex items-center gap-2 text-xs" style={{ color: "var(--gj-muted)", cursor: "pointer" }}>
                    <input type="checkbox" checked={editData.isPublic ?? u.isPublic} onChange={(e) => setEditData((d: any) => ({ ...d, isPublic: e.target.checked }))} />
                    Visible para el cliente
                  </label>
                  <select style={inp} value={editPhaseId ?? ""} onChange={(e) => setEditData((d: any) => ({ ...d, phaseId: e.target.value ? Number(e.target.value) : null, milestoneId: null }))}>
                    <option value="">— Etapa (opcional) —</option>
                    {phases.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select style={inp} value={editData.milestoneId !== undefined ? (editData.milestoneId ?? "") : (u.milestoneId ?? "")} onChange={(e) => { const mid = e.target.value ? Number(e.target.value) : null; const m = milestones.find((x) => x.id === mid); setEditData((d: any) => ({ ...d, milestoneId: mid, phaseId: m?.phaseId ?? d.phaseId })); }}>
                    <option value="">— Hito (opcional) —</option>
                    {milestonesForPhase(editPhaseId).map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select>
                </div>
                <input style={inp} placeholder="URL de referencia (opcional)" value={editData.url ?? u.url ?? ""} onChange={(e) => setEditData((d: any) => ({ ...d, url: e.target.value }))} />
                <div className="flex flex-wrap items-center gap-2">
                  {(editData.fileUrls ?? uFiles(u)).map((f: { url: string; name: string }, i: number) => (
                    <span key={f.url} className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}>
                      <Paperclip size={12} /> {f.name}
                      <button type="button" onClick={() => setEditData((d: any) => ({ ...d, fileUrls: (d.fileUrls ?? uFiles(u)).filter((_: any, idx: number) => idx !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button>
                    </span>
                  ))}
                  <MultiFileUploadButton clientId={clientId} onUploaded={(url, name) => setEditData((d: any) => ({ ...d, fileUrls: [...(d.fileUrls ?? uFiles(u)), { url, name }] }))} label="SUBIR ARCHIVOS (PDF, IMAGEN, ETC.)" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => updateUpdate.mutate({ id: u.id, clientId, ...editData })} className="flex items-center gap-1 text-xs px-3 py-1 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}><Save size={12} /> GUARDAR</button>
                  <button onClick={() => { setEditingId(null); setEditData({}); }} className="text-xs px-3 py-1 rounded" style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gj-muted)", cursor: "pointer", letterSpacing: "2px" }}>CANCELAR</button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px" }}>{CAT_LABELS[u.category]}</span>
                    <span className="text-xs" style={{ color: "var(--gj-muted)" }}>·</span>
                    <span className="text-xs" style={{ color: "var(--gj-muted)" }}>{new Date(u.date).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {milestoneName && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(100,180,120,0.15)", color: "var(--gj-mint)", letterSpacing: "1px" }}>→ {milestoneName}</span>}
                    {!milestoneName && phaseName && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(245,240,232,0.06)", color: "var(--gj-muted)", letterSpacing: "1px" }}>{phaseName}</span>}
                    {!u.isPublic && <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(138,128,130,0.15)", color: "var(--gj-muted)", letterSpacing: "1px" }}>PRIVADO</span>}
                  </div>
                  <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{u.title}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--gj-muted)", lineHeight: 1.5 }}>{u.body.slice(0, 120)}{u.body.length > 120 ? "…" : ""}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {uFiles(u).map((f) => (
                      <div key={f.url} className="flex items-center gap-1.5 flex-wrap">
                        {isPreviewable(f.name) && (
                          <FilePreviewButton
                            url={f.url}
                            name={f.name}
                            buttonStyle={{ color: "var(--gj-mint)", background: "rgba(154,230,180,0.08)", border: "1px solid rgba(154,230,180,0.2)" }}
                          />
                        )}
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--gj-mint)" }}>↓ {uFiles(u).length > 1 ? f.name : "Archivo"}</a>
                      </div>
                    ))}
                    {(u as any).url && <a href={(u as any).url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--gj-mint)", wordBreak: "break-all" }}>🔗 {(u as any).url}</a>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditingId(u.id); setEditData({}); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}><Edit3 size={13} /></button>
                  <button onClick={() => { if (confirm("¿Eliminar?")) deleteUpdate.mutate({ id: u.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}><Trash2 size={13} /></button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {updates.length === 0 && !showForm && (
        <p className="text-xs" style={{ color: "var(--gj-muted)" }}>Sin actualizaciones publicadas todavía.</p>
      )}
    </div>
  );
}

// ─── MILESTONES TAB ───────────────────────────────────────────────────────────
const M_CAT: Record<string, { label: string; color: string }> = {
  strategy:       { label: "ESTRATEGIA",      color: "var(--gj-green)" },
  implementation: { label: "IMPLEMENTACIÓN",  color: "#E0913F" },
  training:       { label: "CAPACITACIÓN",    color: "#4eba8a" },
  automation:     { label: "AUTOMATIZACIÓN",  color: "#7c6fcd" },
  content:        { label: "CONTENIDO",       color: "#4db6e8" },
  analytics:      { label: "ANALÍTICA",       color: "var(--gj-mint)" },
  other:          { label: "OTRO",            color: "var(--gj-muted)" },
};
const M_STATUS: Record<string, { label: string; color: string }> = {
  completed:   { label: "COMPLETADO",  color: "#4eba8a" },
  in_progress: { label: "EN CURSO",   color: "#E0913F" },
  pending:     { label: "PENDIENTE",  color: "var(--gj-muted)" },
};
const M_IMPACT: Record<string, { label: string; color: string }> = {
  high:   { label: "ALTO IMPACTO",   color: "var(--gj-green)" },
  medium: { label: "IMPACTO MEDIO",  color: "#E0913F" },
  low:    { label: "IMPACTO BAJO",   color: "var(--gj-muted)" },
};

const INP = { background: "rgba(154,230,180,0.05)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: "13px", padding: "7px 10px", width: "100%", outline: "none" };

// ─── SORTABLE CARD WRAPPER ────────────────────────────────────────────────────
function SortableItem({ id, children }: { id: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, position: "relative" }}>
      <div {...attributes} {...listeners} style={{ position: "absolute", left: 6, top: "50%", transform: "translateY(-50%)", cursor: "grab", color: "rgba(154,230,180,0.3)", zIndex: 1, padding: "4px", touchAction: "none" }}>
        <GripVertical size={14} />
      </div>
      {children}
    </div>
  );
}

function MilestonesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: phases = [] } = trpc.phases.list.useQuery({ clientId });
  const { data: serverMilestones = [] } = trpc.milestones.list.useQuery({ clientId });
  const [items, setItems] = useState(serverMilestones);

  // Sync local state when server data changes (after create/delete)
  useEffect(() => { setItems(serverMilestones); }, [serverMilestones]);

  const createMilestone = trpc.milestones.create.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito creado."); setShowForm(false); setForm(EMPTY_M); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMilestone = trpc.milestones.delete.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito eliminado."); },
    onError: (e) => toast.error(e.message),
  });
  const pauseMilestone = trpc.milestones.pause.useMutation({
    onSuccess: () => utils.milestones.list.invalidate({ clientId }),
    onError: (e) => toast.error(e.message),
  });
  const updateMilestone = trpc.milestones.update.useMutation({
    onSuccess: () => { utils.milestones.list.invalidate({ clientId }); toast.success("Hito actualizado."); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });
  const reorder = trpc.milestones.reorder.useMutation({ onError: (e) => toast.error(e.message) });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(m => m.id === active.id);
    const newIndex = items.findIndex(m => m.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorder.mutate({ clientId, ids: newItems.map(m => m.id) });
  }

  const EMPTY_M = {
    title: "", description: "", date: new Date().toISOString().split("T")[0],
    status: "completed" as "completed" | "in_progress" | "pending",
    category: "strategy" as "strategy" | "implementation" | "training" | "automation" | "content" | "analytics" | "other",
    impact: "medium" as "high" | "medium" | "low",
    resultType: null as any, phaseId: null as number | null,
  };
  const RESULT_TYPES: Record<string, { label: string; color: string }> = {
    result: { label: "RESULTADO", color: "var(--ambar)" },
    delivery: { label: "ENTREGABLE", color: "#E0913F" },
    win: { label: "LOGRO", color: "#4eba8a" },
    insight: { label: "INSIGHT", color: "#b87fd4" },
    blocker: { label: "BLOQUEADOR", color: "#B32825" },
  };
  const [form, setForm] = useState(EMPTY_M);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_M);

  return (
    <div className="space-y-6">
      {/* Botón agregar */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>
          <Plus size={13} /> AGREGAR HITO
        </button>
      ) : (
        <div style={{ background: "rgba(154,230,180,0.04)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-mint)", marginBottom: "14px", fontFamily: "var(--gj-font)" }}>NUEVO HITO</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Título del hito *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Descripción..." value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            <input type="date" style={INP} value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            <select style={INP} value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
              <option value="completed">Completado</option><option value="in_progress">En curso</option><option value="pending">Pendiente</option>
            </select>
            <select style={INP} value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value as any }))}>
              <option value="strategy">Estrategia</option><option value="implementation">Implementación</option><option value="training">Capacitación</option>
              <option value="automation">Automatización</option><option value="content">Contenido</option><option value="analytics">Analítica</option><option value="other">Otro</option>
            </select>
            <select style={INP} value={form.impact} onChange={(e) => setForm(f => ({ ...f, impact: e.target.value as any }))}>
              <option value="high">Alto impacto</option><option value="medium">Impacto medio</option><option value="low">Bajo impacto</option>
            </select>
            <select style={{ ...INP, gridColumn: "1/-1" }} value={form.phaseId ?? ""} onChange={(e) => setForm(f => ({ ...f, phaseId: e.target.value ? Number(e.target.value) : null }))}>
              <option value="">Sin etapa asignada (no aparece en Hoja de Ruta)</option>
              {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {form.status === "completed" && (
              <select style={INP} value={form.resultType || ""} onChange={(e) => setForm(f => ({ ...f, resultType: e.target.value || null }))}>
                <option value="">Sin clasificar</option>
                <option value="result">Resultado</option>
                <option value="delivery">Entregable</option>
                <option value="win">Logro</option>
                <option value="insight">Insight</option>
                <option value="blocker">Bloqueador</option>
              </select>
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { if (form.title) createMilestone.mutate({ clientId, ...form, phaseId: form.phaseId ?? undefined, date: new Date(form.date) }); }} disabled={!form.title} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", opacity: form.title ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_M); }} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Lista agrupada por mes con drag-and-drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(m => m.id)} strategy={verticalListSortingStrategy}>
          {(() => {
            const grouped = items.reduce<Record<string, typeof items>>((acc, m) => {
              const key = new Date(m.date).toLocaleDateString("es-AR", { month: "long", year: "numeric" });
              if (!acc[key]) acc[key] = [];
              acc[key].push(m);
              return acc;
            }, {});
            return (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                {Object.entries(grouped).map(([period, monthItems]) => (
                  <div key={period}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "10px", letterSpacing: "3px", padding: "4px 10px", borderRadius: "3px", background: "rgba(154,230,180,0.1)", border: "1px solid rgba(154,230,180,0.25)", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", textTransform: "uppercase" }}>
                        {period}
                      </span>
                      <div style={{ flex: 1, height: "1px", background: "rgba(154,230,180,0.1)" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {monthItems.map((m) => {
                        const cat = M_CAT[m.category] || M_CAT.other;
                        const status = M_STATUS[m.status];
                        const impact = M_IMPACT[m.impact];
                        return (
                          <SortableItem key={m.id} id={m.id}>
                            <div style={{ background: m.isPaused ? "rgba(224,145,63,0.12)" : "rgba(154,230,180,0.03)", border: m.isPaused ? "1px solid rgba(224,145,63,0.4)" : "1px solid rgba(154,230,180,0.08)", borderLeft: `3px solid ${m.isPaused ? "rgba(224,145,63,0.6)" : status.color}`, borderRadius: "6px", padding: "14px 16px 14px 32px", display: "flex", gap: "14px", alignItems: "flex-start", opacity: m.isPaused ? 0.7 : 1, transition: "opacity 0.2s" }}>
                              <div style={{ width: 34, height: 34, borderRadius: "6px", background: `${cat.color}18`, border: `1px solid ${cat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                                <span style={{ fontSize: "11px", color: cat.color, fontFamily: "var(--gj-font)" }}>{m.category.slice(0,2).toUpperCase()}</span>
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "4px" }}>
                                  <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.3 }}>{m.title}</p>
                                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexShrink: 0 }}>
                                    {m.isPaused && (
                                      <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: "rgba(143,169,163,0.12)", border: "1px solid rgba(143,169,163,0.3)", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PAUSADO</span>
                                    )}
                                    {!m.isPaused && m.status === "completed" && m.resultType && (() => {
                                      const rt = RESULT_TYPES[m.resultType];
                                      return (
                                        <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${rt.color}22`, border: `1px solid ${rt.color}50`, color: rt.color, fontFamily: "var(--gj-font)", fontWeight: 600 }}>
                                          {m.resultType === "win" ? "⭐ " : ""}{rt.label}
                                        </span>
                                      );
                                    })()}
                                    {!m.isPaused && <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${impact.color}12`, border: `1px solid ${impact.color}30`, color: impact.color, fontFamily: "var(--gj-font)" }}>{impact.label}</span>}
                                    {!m.isPaused && <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${status.color}12`, border: `1px solid ${status.color}30`, color: status.color, fontFamily: "var(--gj-font)" }}>{status.label}</span>}
                                    <button
                                      title="Editar"
                                      onClick={() => { setEditingId(m.id); setEditForm({ title: m.title, description: m.description || "", date: new Date(m.date).toISOString().split("T")[0], status: m.status, category: m.category, impact: m.impact, resultType: m.resultType, phaseId: (m as any).phaseId ?? null }); }}
                                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}
                                    >
                                      <Edit3 size={14} />
                                    </button>
                                    <button
                                      title={m.isPaused ? "Reactivar" : "Pausar"}
                                      onClick={() => pauseMilestone.mutate({ id: m.id, clientId, isPaused: !m.isPaused })}
                                      style={{ background: "none", border: "none", cursor: "pointer", color: m.isPaused ? "#4eba8a" : "var(--gj-muted)", padding: "2px" }}
                                    >
                                      {m.isPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                                    </button>
                                    <button onClick={() => { if (confirm("¿Eliminar hito?")) deleteMilestone.mutate({ id: m.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>
                                {editingId === m.id ? (
                                  <div style={{ background: "rgba(154,230,180,0.05)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "6px", padding: "12px", marginTop: "8px" }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                                      <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Título *" value={editForm.title} onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))} />
                                      <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Descripción..." value={editForm.description} onChange={(e) => setEditForm(f => ({ ...f, description: e.target.value }))} />
                                      <input type="date" style={INP} value={editForm.date} onChange={(e) => setEditForm(f => ({ ...f, date: e.target.value }))} />
                                      <select style={INP} value={editForm.status} onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value as any }))}>
                                        <option value="completed">Completado</option><option value="in_progress">En curso</option><option value="pending">Pendiente</option>
                                      </select>
                                      <select style={INP} value={editForm.category} onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value as any }))}>
                                        <option value="strategy">Estrategia</option><option value="implementation">Implementación</option><option value="training">Capacitación</option>
                                        <option value="automation">Automatización</option><option value="content">Contenido</option><option value="analytics">Analítica</option><option value="other">Otro</option>
                                      </select>
                                      <select style={INP} value={editForm.impact} onChange={(e) => setEditForm(f => ({ ...f, impact: e.target.value as any }))}>
                                        <option value="high">Alto impacto</option><option value="medium">Impacto medio</option><option value="low">Bajo impacto</option>
                                      </select>
                                      <select style={{ ...INP, gridColumn: "1/-1" }} value={editForm.phaseId ?? ""} onChange={(e) => setEditForm(f => ({ ...f, phaseId: e.target.value ? Number(e.target.value) : null }))}>
                                        <option value="">Sin etapa asignada (no aparece en Hoja de Ruta)</option>
                                        {phases.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                      </select>
                                      {editForm.status === "completed" && (
                                        <select style={INP} value={editForm.resultType || ""} onChange={(e) => setEditForm(f => ({ ...f, resultType: e.target.value || null }))}>
                                          <option value="">Sin clasificar</option>
                                          <option value="result">Resultado</option>
                                          <option value="delivery">Entregable</option>
                                          <option value="win">Logro</option>
                                          <option value="insight">Insight</option>
                                          <option value="blocker">Bloqueador</option>
                                        </select>
                                      )}
                                    </div>
                                    <div style={{ display: "flex", gap: "6px" }}>
                                      <button onClick={() => { if (editForm.title) updateMilestone.mutate({ id: m.id, clientId, ...editForm, phaseId: editForm.phaseId ?? undefined, date: new Date(editForm.date) }); }} disabled={!editForm.title} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "6px 12px", fontSize: "10px", letterSpacing: "1px", cursor: "pointer", opacity: editForm.title ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
                                      <button onClick={() => setEditingId(null)} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "6px 12px", fontSize: "10px", letterSpacing: "1px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {m.description && <p style={{ fontSize: "12px", color: "var(--gj-muted)", lineHeight: 1.5, marginBottom: "6px" }}>{m.description}</p>}
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                      <span style={{ fontSize: "9px", letterSpacing: "2px", color: cat.color, fontFamily: "var(--gj-font)" }}>{cat.label}</span>
                                      <span style={{ fontSize: "11px", color: "rgba(143,169,163,0.5)", fontFamily: "var(--gj-font)" }}>
                                        {new Date(m.date).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </SortableItem>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showForm && (
        <p style={{ fontSize: "13px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>No hay hitos registrados todavía.</p>
      )}
    </div>
  );
}

// ─── OKRs TAB ─────────────────────────────────────────────────────────────────
const OKR_STATUS: Record<string, { label: string; color: string }> = {
  on_track:  { label: "EN CURSO",   color: "#4eba8a" },
  at_risk:   { label: "EN RIESGO",  color: "#E0913F" },
  off_track: { label: "DESVIADO",   color: "#B32825" },
  completed: { label: "COMPLETADO", color: "var(--gj-mint)" },
};

function OKRsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: serverOkrs = [] } = trpc.okrs.list.useQuery({ clientId });
  const [items, setItems] = useState(serverOkrs);
  useEffect(() => { setItems(serverOkrs); }, [serverOkrs]);

  const createOkr = trpc.okrs.create.useMutation({
    onSuccess: () => { utils.okrs.list.invalidate({ clientId }); toast.success("OKR creado."); setShowForm(false); setForm(EMPTY_OKR); },
    onError: (e) => toast.error(e.message),
  });
  const deleteOkr = trpc.okrs.delete.useMutation({
    onSuccess: () => { utils.okrs.list.invalidate({ clientId }); toast.success("OKR eliminado."); },
    onError: (e) => toast.error(e.message),
  });
  const pauseOkr = trpc.okrs.pause.useMutation({
    onSuccess: () => utils.okrs.list.invalidate({ clientId }),
    onError: (e) => toast.error(e.message),
  });
  const updateOkr = trpc.okrs.update.useMutation({ onError: (e) => toast.error(e.message) });
  const reorder = trpc.okrs.reorder.useMutation({ onError: (e) => toast.error(e.message) });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(o => o.id === active.id);
    const newIndex = items.findIndex(o => o.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorder.mutate({ clientId, ids: newItems.map(o => o.id) });
  }

  const EMPTY_OKR = { objective: "", keyResult: "", targetValue: "", currentValue: "", unit: "", progressPct: 0, status: "on_track" as const, period: "", notes: "" };
  const [form, setForm] = useState(EMPTY_OKR);
  const [showForm, setShowForm] = useState(false);

  // Agrupar por objetivo (preservando el orden de items)
  const grouped = items.reduce<Record<string, typeof items>>((acc, okr) => {
    if (!acc[okr.objective]) acc[okr.objective] = [];
    acc[okr.objective].push(okr);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>
          <Plus size={13} /> AGREGAR OKR
        </button>
      ) : (
        <div style={{ background: "rgba(154,230,180,0.04)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-mint)", marginBottom: "14px", fontFamily: "var(--gj-font)" }}>NUEVO OKR</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Objetivo estratégico *" value={form.objective} onChange={(e) => setForm(f => ({ ...f, objective: e.target.value }))} />
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Resultado clave *" value={form.keyResult} onChange={(e) => setForm(f => ({ ...f, keyResult: e.target.value }))} />
            <input style={INP} placeholder="Meta (ej: 80)" value={form.targetValue} onChange={(e) => setForm(f => ({ ...f, targetValue: e.target.value }))} />
            <input style={INP} placeholder="Unidad (ej: personas/función)" value={form.unit} onChange={(e) => setForm(f => ({ ...f, unit: e.target.value }))} />
            <input style={INP} placeholder="Período (ej: Q3 2025)" value={form.period} onChange={(e) => setForm(f => ({ ...f, period: e.target.value }))} />
            <select style={INP} value={form.status} onChange={(e) => setForm(f => ({ ...f, status: e.target.value as any }))}>
              <option value="on_track">En curso</option><option value="at_risk">En riesgo</option><option value="off_track">Desviado</option><option value="completed">Completado</option>
            </select>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { if (form.objective && form.keyResult) createOkr.mutate({ clientId, ...form }); }} disabled={!form.objective || !form.keyResult} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", opacity: (form.objective && form.keyResult) ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_OKR); }} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* OKRs agrupados por objetivo */}
      {Object.entries(grouped).map(([objective, keyResults]) => {
        const avgProgress = Math.round(keyResults.reduce((s, kr) => s + kr.progressPct, 0) / keyResults.length);
        return (
          <div key={objective} style={{ background: "rgba(154,230,180,0.03)", border: "1px solid rgba(154,230,180,0.1)", borderRadius: "8px", padding: "22px" }}>
            {/* Objetivo header */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", marginBottom: "6px" }}>OBJETIVO</p>
                <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.3 }}>{objective}</p>
                {keyResults[0]?.period && (
                  <p style={{ fontSize: "10px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginTop: "4px" }}>{keyResults[0].period}</p>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--gj-mint)", fontFamily: "var(--gj-font)", lineHeight: 1 }}>{avgProgress}%</p>
                <p style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PROGRESO</p>
              </div>
            </div>
            {/* Barra de progreso */}
            <div style={{ height: "4px", background: "rgba(154,230,180,0.1)", borderRadius: "2px", marginBottom: "18px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${avgProgress}%`, background: "var(--gj-green)", borderRadius: "2px", transition: "width 0.4s" }} />
            </div>
            {/* Key results */}
            <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: "12px" }}>RESULTADOS CLAVE</p>
            {keyResults.map((kr) => {
              const st = OKR_STATUS[kr.status];
              return (
                <div key={kr.id} style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 0", borderTop: "1px solid rgba(154,230,180,0.07)" }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: "13px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.4, marginBottom: "6px" }}>{kr.keyResult}</p>
                    {(kr.targetValue || kr.currentValue) && (
                      <div style={{ display: "flex", gap: "12px" }}>
                        {kr.targetValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Meta: <strong style={{ color: "var(--gj-cream)" }}>{kr.targetValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                        {kr.currentValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Actual: <strong style={{ color: "var(--gj-mint)" }}>{kr.currentValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                    <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${st.color}12`, border: `1px solid ${st.color}30`, color: st.color, fontFamily: "var(--gj-font)" }}>{st.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <input type="number" min="0" max="100" value={kr.progressPct}
                        onChange={(e) => updateOkr.mutate({ id: kr.id, clientId, progressPct: parseInt(e.target.value) || 0 })}
                        style={{ width: "48px", background: "rgba(154,230,180,0.08)", border: "1px solid rgba(154,230,180,0.2)", borderRadius: "3px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", fontSize: "12px", padding: "3px 6px", textAlign: "center" }} />
                      <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>%</span>
                    </div>
                    <button onClick={() => { if (confirm("¿Eliminar OKR?")) deleteOkr.mutate({ id: kr.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Wrap entire grouped view in DnD (reorders across objetivos también) */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(o => o.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-8">
            {Object.entries(grouped).map(([objective, keyResults]) => {
              const avgProgress = Math.round(keyResults.reduce((s, kr) => s + kr.progressPct, 0) / keyResults.length);
              return (
                <div key={objective} style={{ background: "rgba(154,230,180,0.03)", border: "1px solid rgba(154,230,180,0.1)", borderRadius: "8px", padding: "22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", marginBottom: "6px" }}>OBJETIVO</p>
                      <p style={{ fontSize: "16px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.3 }}>{objective}</p>
                      {keyResults[0]?.period && <p style={{ fontSize: "10px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginTop: "4px" }}>{keyResults[0].period}</p>}
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: "28px", fontWeight: 700, color: "var(--gj-mint)", fontFamily: "var(--gj-font)", lineHeight: 1 }}>{avgProgress}%</p>
                      <p style={{ fontSize: "9px", letterSpacing: "2px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PROGRESO</p>
                    </div>
                  </div>
                  <div style={{ height: "4px", background: "rgba(154,230,180,0.1)", borderRadius: "2px", marginBottom: "18px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${avgProgress}%`, background: "var(--gj-green)", borderRadius: "2px" }} />
                  </div>
                  <p style={{ fontSize: "9px", letterSpacing: "4px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: "12px" }}>RESULTADOS CLAVE</p>
                  {keyResults.map((kr) => {
                    const st = OKR_STATUS[kr.status];
                    return (
                      <SortableItem key={kr.id} id={kr.id}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "12px 12px 12px 32px", borderTop: "1px solid rgba(154,230,180,0.07)", opacity: kr.isPaused ? 0.5 : 1, transition: "opacity 0.2s" }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "13px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", lineHeight: 1.4, marginBottom: "6px" }}>{kr.keyResult}</p>
                            {(kr.targetValue || kr.currentValue) && (
                              <div style={{ display: "flex", gap: "12px" }}>
                                {kr.targetValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Meta: <strong style={{ color: "var(--gj-cream)" }}>{kr.targetValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                                {kr.currentValue && <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>Actual: <strong style={{ color: "var(--gj-mint)" }}>{kr.currentValue}{kr.unit ? ` ${kr.unit}` : ""}</strong></span>}
                              </div>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            {kr.isPaused
                              ? <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: "rgba(143,169,163,0.12)", border: "1px solid rgba(143,169,163,0.3)", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>PAUSADO</span>
                              : <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 7px", borderRadius: "3px", background: `${st.color}12`, border: `1px solid ${st.color}30`, color: st.color, fontFamily: "var(--gj-font)" }}>{st.label}</span>
                            }
                            {!kr.isPaused && (
                              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                <input type="number" min="0" max="100" value={kr.progressPct}
                                  onChange={(e) => updateOkr.mutate({ id: kr.id, clientId, progressPct: parseInt(e.target.value) || 0 })}
                                  style={{ width: "48px", background: "rgba(154,230,180,0.08)", border: "1px solid rgba(154,230,180,0.2)", borderRadius: "3px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", fontSize: "12px", padding: "3px 6px", textAlign: "center" }} />
                                <span style={{ fontSize: "11px", color: "var(--gj-muted)" }}>%</span>
                              </div>
                            )}
                            <button
                              title={kr.isPaused ? "Reactivar" : "Pausar"}
                              onClick={() => pauseOkr.mutate({ id: kr.id, clientId, isPaused: !kr.isPaused })}
                              style={{ background: "none", border: "none", cursor: "pointer", color: kr.isPaused ? "#4eba8a" : "var(--gj-muted)", padding: "2px" }}
                            >
                              {kr.isPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
                            </button>
                            <button onClick={() => { if (confirm("¿Eliminar OKR?")) deleteOkr.mutate({ id: kr.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </SortableItem>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showForm && (
        <p style={{ fontSize: "13px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>No hay OKRs registrados todavía.</p>
      )}
    </div>
  );
}

// ─── LEARNINGS TAB ────────────────────────────────────────────────────────────
const L_TYPE: Record<string, { label: string; plural: string; color: string; bg: string }> = {
  win:      { label: "LOGRO",        plural: "LOGROS",        color: "#4eba8a", bg: "rgba(78,186,138,0.06)" },
  learning: { label: "APRENDIZAJE",  plural: "APRENDIZAJES",  color: "#4db6e8", bg: "rgba(77,182,232,0.06)" },
  obstacle: { label: "OBSTÁCULO",    plural: "OBSTÁCULOS",    color: "#E0913F", bg: "rgba(224,145,63,0.06)" },
};

function LearningsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: serverLearnings = [] } = trpc.learnings.list.useQuery({ clientId });
  const [items, setItems] = useState(serverLearnings);
  useEffect(() => { setItems(serverLearnings); }, [serverLearnings]);

  const reorder = trpc.learnings.reorder.useMutation({ onError: (e) => toast.error(e.message) });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(l => l.id === active.id);
    const newIndex = items.findIndex(l => l.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);
    reorder.mutate({ clientId, ids: newItems.map(l => l.id) });
  }

  const createLearning = trpc.learnings.create.useMutation({
    onSuccess: () => { utils.learnings.list.invalidate({ clientId }); toast.success("Registro creado."); setShowForm(false); setForm(EMPTY_L); },
    onError: (e) => toast.error(e.message),
  });
  const deleteLearning = trpc.learnings.delete.useMutation({
    onSuccess: () => { utils.learnings.list.invalidate({ clientId }); toast.success("Registro eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const EMPTY_L = { type: "learning" as "learning" | "obstacle" | "win", title: "", description: "", resolution: "", date: new Date().toISOString().split("T")[0], isResolved: false };
  const [form, setForm] = useState(EMPTY_L);
  const [showForm, setShowForm] = useState(false);

  const wins = items.filter(l => l.type === "win");
  const learningItems = items.filter(l => l.type === "learning");
  const obstacles = items.filter(l => l.type === "obstacle");

  return (
    <div className="space-y-8">
      {/* Botón agregar */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: "6px", background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>
          <Plus size={13} /> AGREGAR REGISTRO
        </button>
      ) : (
        <div style={{ background: "rgba(154,230,180,0.04)", border: "1px solid rgba(154,230,180,0.15)", borderRadius: "8px", padding: "20px" }}>
          <p style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-mint)", marginBottom: "14px", fontFamily: "var(--gj-font)" }}>NUEVO REGISTRO</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <select style={INP} value={form.type} onChange={(e) => setForm(f => ({ ...f, type: e.target.value as any }))}>
              <option value="win">Logro</option><option value="learning">Aprendizaje</option><option value="obstacle">Obstáculo</option>
            </select>
            <input type="date" style={INP} value={form.date} onChange={(e) => setForm(f => ({ ...f, date: e.target.value }))} />
            <input style={{ ...INP, gridColumn: "1/-1" }} placeholder="Título *" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            <textarea style={{ ...INP, gridColumn: "1/-1", resize: "none" } as any} placeholder="Descripción..." rows={2} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            {form.type === "obstacle" && (
              <textarea style={{ ...INP, gridColumn: "1/-1", resize: "none" } as any} placeholder="Resolución (si aplica)..." rows={2} value={form.resolution} onChange={(e) => setForm(f => ({ ...f, resolution: e.target.value }))} />
            )}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => { if (form.title) createLearning.mutate({ clientId, ...form, date: new Date(form.date) }); }} disabled={!form.title} style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", opacity: form.title ? 1 : 0.5, fontFamily: "var(--gj-font)" }}>GUARDAR</button>
            <button onClick={() => { setShowForm(false); setForm(EMPTY_L); }} style={{ background: "none", border: "1px solid rgba(154,230,180,0.2)", color: "var(--gj-muted)", borderRadius: "3px", padding: "8px 16px", fontSize: "11px", letterSpacing: "2px", cursor: "pointer", fontFamily: "var(--gj-font)" }}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Contador resumen */}
      {items.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
          {[{ label: "LOGROS", count: wins.length, color: "#4eba8a" }, { label: "APRENDIZAJES", count: learningItems.length, color: "#4db6e8" }, { label: "OBSTÁCULOS", count: obstacles.length, color: "#E0913F" }].map(s => (
            <div key={s.label} style={{ background: `${s.color}08`, border: `1px solid ${s.color}25`, borderRadius: "6px", padding: "16px", textAlign: "center" }}>
              <p style={{ fontSize: "26px", fontWeight: 700, color: s.color, fontFamily: "var(--gj-font)", lineHeight: 1 }}>{s.count}</p>
              <p style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Grupos por tipo con drag-and-drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {(["win", "learning", "obstacle"] as const).map((type) => {
            const typeItems = items.filter(l => l.type === type);
            if (typeItems.length === 0) return null;
            const cfg = L_TYPE[type];
            return (
              <div key={type}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "6px", background: cfg.bg, border: `1px solid ${cfg.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: "10px", color: cfg.color, fontFamily: "var(--gj-font)" }}>{type === "win" ? "★" : type === "obstacle" ? "!" : "○"}</span>
                  </div>
                  <span style={{ fontSize: "9px", letterSpacing: "4px", color: cfg.color, fontFamily: "var(--gj-font)" }}>{cfg.plural}</span>
                  <div style={{ flex: 1, height: "1px", background: `${cfg.color}20` }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {typeItems.map(item => (
                    <SortableItem key={item.id} id={item.id}>
                      <div style={{ background: cfg.bg, border: "1px solid rgba(154,230,180,0.08)", borderLeft: `3px solid ${cfg.color}60`, borderRadius: "6px", padding: "14px 16px 14px 32px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "6px" }}>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: "14px", fontWeight: 500, color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>{item.title}</p>
                            {item.type === "obstacle" && (
                              <span style={{ fontSize: "9px", letterSpacing: "1px", padding: "2px 6px", borderRadius: "3px", marginTop: "4px", display: "inline-block", background: item.isResolved ? "rgba(78,186,138,0.12)" : "rgba(224,145,63,0.12)", border: `1px solid ${item.isResolved ? "#4eba8a" : "#E0913F"}40`, color: item.isResolved ? "#4eba8a" : "#E0913F", fontFamily: "var(--gj-font)" }}>
                                {item.isResolved ? "RESUELTO" : "ACTIVO"}
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                            <span style={{ fontSize: "11px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>{new Date(item.date).toLocaleDateString("es-AR", { day: "numeric", month: "short" })}</span>
                            <button onClick={() => { if (confirm("¿Eliminar?")) deleteLearning.mutate({ id: item.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "2px" }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--gj-muted)", lineHeight: 1.6 }}>{item.description}</p>
                        {item.resolution && (
                          <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid rgba(154,230,180,0.08)" }}>
                            <p style={{ fontSize: "9px", letterSpacing: "3px", color: "#4eba8a", fontFamily: "var(--gj-font)", marginBottom: "4px" }}>RESOLUCIÓN</p>
                            <p style={{ fontSize: "12px", color: "rgba(154,230,180,0.7)" }}>{item.resolution}</p>
                          </div>
                        )}
                      </div>
                    </SortableItem>
                  ))}
                </div>
              </div>
            );
          })}
        </SortableContext>
      </DndContext>

      {items.length === 0 && !showForm && (
        <p style={{ fontSize: "13px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)" }}>No hay registros todavía.</p>
      )}
    </div>
  );
}

// ─── SCOPE TAB ────────────────────────────────────────────────────────────────
function ScopeTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: items = [] } = trpc.scope.list.useQuery({ clientId });
  const createScope = trpc.scope.create.useMutation({
    onSuccess: () => { utils.scope.list.invalidate({ clientId }); toast.success("Ítem de alcance creado."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteScope = trpc.scope.delete.useMutation({
    onSuccess: () => { utils.scope.list.invalidate({ clientId }); toast.success("Ítem eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ title: "", description: "", inScope: true, category: "" });

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id} className="gj-card p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-xs px-2 py-1 rounded" style={{ color: item.inScope ? "#4eba8a" : "#C77D54", background: item.inScope ? "rgba(78,186,138,0.1)" : "rgba(199,125,84,0.12)", letterSpacing: "2px" }}>
              {item.inScope ? "INCLUIDO" : "EXCLUIDO"}
            </span>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{item.title}</p>
              {item.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{item.description}</p>}
            </div>
          </div>
          <button onClick={() => deleteScope.mutate({ id: item.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR ÍTEM DE ALCANCE</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del ítem..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Categoría (opcional)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <select value={form.inScope ? "in" : "out"} onChange={(e) => setForm((f) => ({ ...f, inScope: e.target.value === "in" }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="in">Incluido en alcance</option>
            <option value="out">Fuera de alcance</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.title) { createScope.mutate({ clientId, ...form, order: items.length }); setForm({ title: "", description: "", inScope: true, category: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR
        </button>
      </div>
    </div>
  );
}

// ─── RESOURCES TAB ────────────────────────────────────────────────────────────
const RESOURCE_AREAS = ["Ventas", "Operaciones", "Atención al Cliente / Soporte", "Social Media"];
const rAreas = (r: any): string[] => (Array.isArray(r?.areas) && r.areas.length ? r.areas : (r?.area ? [r.area] : []));
const rFiles = (r: any): { url: string; name: string }[] =>
  Array.isArray(r?.fileUrls) && r.fileUrls.length
    ? r.fileUrls
    : (r?.fileUrl ? [{ url: r.fileUrl, name: r.fileUrl.split("/").pop() ?? "archivo" }] : []);

// Selector de áreas con checkboxes (multi-selección) + agregar área nueva.
function AreaPicker({ value, onChange, available, onAddCustom, inputStyle }: { value: string[]; onChange: (v: string[]) => void; available: string[]; onAddCustom: (a: string) => void; inputStyle: any }) {
  const [custom, setCustom] = useState("");
  const toggle = (a: string) => onChange(value.includes(a) ? value.filter((x) => x !== a) : [...value, a]);
  const add = () => { const v = custom.trim(); if (!v) return; onAddCustom(v); if (!value.includes(v)) onChange([...value, v]); setCustom(""); };
  return (
    <div className="col-span-2">
      <p className="text-xs mb-2" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>ÁREAS / DEPARTAMENTOS (podés elegir varias)</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {available.map((a) => {
          const on = value.includes(a);
          return (
            <button key={a} type="button" onClick={() => toggle(a)} className="text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
              style={{ background: on ? "rgba(77,182,232,0.18)" : "rgba(255,255,255,0.05)", color: on ? "#4db6e8" : "var(--gj-muted)", border: on ? "1px solid rgba(77,182,232,0.45)" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
              {on && <Check size={12} />} {a}
            </button>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} placeholder="Agregar área nueva..." className="px-3 py-1.5 text-xs flex-1" style={inputStyle} />
        <button type="button" onClick={add} className="text-xs px-3 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--gj-cream)", border: "none", cursor: "pointer" }}>+ Agregar</button>
      </div>
    </div>
  );
}

function ResourcesTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: resources = [] } = trpc.resources.list.useQuery({ clientId });
  const { data: allClients = [] } = trpc.clients.list.useQuery();
  const createResource = trpc.resources.create.useMutation({
    onSuccess: () => { utils.resources.list.invalidate({ clientId }); toast.success("Recurso creado."); },
    onError: (e) => toast.error(e.message),
  });
  const createForClients = trpc.resources.createForClients.useMutation({
    onSuccess: (res) => { utils.resources.list.invalidate({ clientId }); toast.success(`Recurso creado en ${res.created} cliente(s).`); },
    onError: (e) => toast.error(e.message),
  });
  const updateResource = trpc.resources.update.useMutation({
    onSuccess: () => { utils.resources.list.invalidate({ clientId }); toast.success("Recurso actualizado."); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteResource = trpc.resources.delete.useMutation({
    onSuccess: () => { utils.resources.list.invalidate({ clientId }); toast.success("Recurso eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const EMPTY_R = { title: "", description: "", category: "script" as const, areas: [] as string[], externalUrl: "", fileUrls: [] as { url: string; name: string }[], content: "" };
  const [form, setForm] = useState(EMPTY_R);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_R);
  const [extraAreas, setExtraAreas] = useState<string[]>([]);
  const [targetClientIds, setTargetClientIds] = useState<number[]>([]);
  const [copyingId, setCopyingId] = useState<number | null>(null);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);

  const usedAreas = Array.from(new Set(resources.flatMap((r) => rAreas(r))));
  const availableAreas = Array.from(new Set([...RESOURCE_AREAS, ...usedAreas, ...extraAreas])).filter(Boolean);
  const otherClients = allClients.filter((c) => c.id !== clientId);
  const addCustom = (a: string) => setExtraAreas((p) => (p.includes(a) ? p : [...p, a]));

  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" };

  return (
    <div className="space-y-4">
      {resources.map((r) => (
        <div key={r.id}>
          {editingId === r.id ? (
            <div style={{ background: "rgba(154,230,180,0.05)", border: "1px solid rgba(154,230,180,0.2)", borderRadius: "6px", padding: "20px" }}>
              <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-mint)", letterSpacing: "3px" }}>EDITANDO RECURSO</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
                <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
                <input value={editForm.externalUrl} onChange={(e) => setEditForm((f) => ({ ...f, externalUrl: e.target.value }))} placeholder="URL externa (opcional)" className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
                <div className="col-span-2 flex flex-wrap items-center gap-2">
                  {editForm.fileUrls.map((f, i) => (
                    <span key={f.url} className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}>
                      <Paperclip size={12} /> {f.name}
                      <button type="button" onClick={() => setEditForm((ef) => ({ ...ef, fileUrls: ef.fileUrls.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button>
                    </span>
                  ))}
                  <MultiFileUploadButton clientId={clientId} onUploaded={(url, name) => setEditForm((ef) => ({ ...ef, fileUrls: [...ef.fileUrls, { url, name }] }))} />
                </div>
                <textarea value={editForm.content} onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))} placeholder="Contenido de texto (opcional)..." rows={3} className="col-span-2 px-3 py-2 text-sm resize-none" style={inputStyle} />
                <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value as any }))} className="col-span-2 px-3 py-2 text-sm" style={inputStyle}>
                  <option value="script">Videotutorial</option>
                  <option value="training">Curso</option>
                  <option value="document">Presentación</option>
                  <option value="guide">Referencia</option>
                  <option value="template">Material de Apoyo</option>
                  <option value="other">Otro</option>
                </select>
                <AreaPicker value={editForm.areas} onChange={(v) => setEditForm((f) => ({ ...f, areas: v }))} available={availableAreas} onAddCustom={addCustom} inputStyle={inputStyle} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (editForm.title) updateResource.mutate({ id: r.id, clientId, title: editForm.title, description: editForm.description, category: editForm.category, areas: editForm.areas, externalUrl: editForm.externalUrl || undefined, fileUrls: editForm.fileUrls, content: editForm.content || undefined }); }} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                  <Save size={13} /> GUARDAR
                </button>
                <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--gj-muted)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                  <X size={13} /> CANCELAR
                </button>
              </div>
            </div>
          ) : (
            <div className="gj-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px" }}>{r.category.toUpperCase()}</span>
                  {rAreas(r).map((a) => <span key={a} className="text-xs ml-2 px-2 py-0.5 rounded" style={{ background: "rgba(77,182,232,0.15)", color: "#4db6e8", letterSpacing: "1px" }}>{a}</span>)}
                  <p className="text-sm font-medium mt-1" style={{ color: "var(--gj-cream)" }}>{r.title}</p>
                  {r.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{r.description}</p>}
                  {r.externalUrl && <a href={r.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 block" style={{ color: "var(--gj-green)" }}>{r.externalUrl}</a>}
                  {rFiles(r).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {rFiles(r).map((f) => (
                        <span key={f.url} className="text-xs flex items-center gap-1" style={{ color: "var(--gj-muted)" }}>
                          <Paperclip size={11} /> {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {otherClients.length > 0 && (
                    <button title="Copiar a otros clientes" onClick={() => { setCopyingId(copyingId === r.id ? null : r.id); setCopyTargets([]); }} style={{ background: "none", border: "none", cursor: "pointer", color: copyingId === r.id ? "var(--gj-green)" : "var(--gj-muted)", padding: "4px" }}>
                    <Copy size={14} />
                  </button>
                  )}
                  <button onClick={() => { setEditingId(r.id); setEditForm({ title: r.title, description: r.description || "", category: r.category as any, areas: rAreas(r), externalUrl: r.externalUrl || "", fileUrls: rFiles(r), content: (r as any).content || "" }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-mint)", padding: "4px" }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deleteResource.mutate({ id: r.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {copyingId === r.id && otherClients.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-xs mb-2" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>COPIAR "{r.title}" A OTROS CLIENTES</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {otherClients.map((c) => {
                      const on = copyTargets.includes(c.id);
                      return (
                        <button key={c.id} type="button" onClick={() => setCopyTargets((p) => (on ? p.filter((x) => x !== c.id) : [...p, c.id]))} className="text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
                          style={{ background: on ? "rgba(154,230,180,0.18)" : "rgba(255,255,255,0.05)", color: on ? "var(--gj-mint)" : "var(--gj-muted)", border: on ? "1px solid rgba(154,230,180,0.45)" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                          {on && <Check size={12} />} {c.name}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => {
                      if (copyTargets.length === 0) { toast.error("Elegí al menos un cliente."); return; }
                      createForClients.mutate({ clientIds: copyTargets, title: r.title, description: r.description || undefined, category: r.category, areas: rAreas(r).length ? rAreas(r) : undefined, externalUrl: r.externalUrl || undefined, fileUrls: rFiles(r).length ? rFiles(r) : undefined, content: (r as any).content || undefined });
                      setCopyingId(null); setCopyTargets([]);
                    }}
                    className="flex items-center gap-1 text-xs px-4 py-2 rounded"
                    style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px", opacity: copyTargets.length === 0 ? 0.5 : 1 }}
                  >
                    <Copy size={13} /> COPIAR A {copyTargets.length || 0} CLIENTE{copyTargets.length === 1 ? "" : "S"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR RECURSO</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título del recurso..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
          <input value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} placeholder="URL externa (opcional)" className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
          <div className="col-span-2 flex flex-wrap items-center gap-2">
            {form.fileUrls.map((f, i) => (
              <span key={f.url} className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}>
                <Paperclip size={12} /> {f.name}
                <button type="button" onClick={() => setForm((cf) => ({ ...cf, fileUrls: cf.fileUrls.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button>
              </span>
            ))}
            <MultiFileUploadButton clientId={clientId} onUploaded={(url, name) => setForm((cf) => ({ ...cf, fileUrls: [...cf.fileUrls, { url, name }] }))} />
          </div>
          <textarea value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} placeholder="Contenido de texto (opcional)..." rows={3} className="col-span-2 px-3 py-2 text-sm resize-none" style={inputStyle} />
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as any }))} className="col-span-2 px-3 py-2 text-sm" style={inputStyle}>
            <option value="script">Videotutorial</option>
            <option value="training">Curso</option>
            <option value="document">Presentación</option>
            <option value="guide">Referencia</option>
            <option value="template">Material de Apoyo</option>
            <option value="other">Otro</option>
          </select>
          <AreaPicker value={form.areas} onChange={(v) => setForm((f) => ({ ...f, areas: v }))} available={availableAreas} onAddCustom={addCustom} inputStyle={inputStyle} />

          {otherClients.length > 0 && (
            <div className="col-span-2" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12 }}>
              <p className="text-xs mb-2" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>AGREGAR TAMBIÉN A OTROS CLIENTES (opcional)</p>
              <div className="flex flex-wrap gap-2">
                {otherClients.map((c) => {
                  const on = targetClientIds.includes(c.id);
                  return (
                    <button key={c.id} type="button" onClick={() => setTargetClientIds((p) => (on ? p.filter((x) => x !== c.id) : [...p, c.id]))} className="text-xs px-3 py-1.5 rounded flex items-center gap-1.5"
                      style={{ background: on ? "rgba(154,230,180,0.18)" : "rgba(255,255,255,0.05)", color: on ? "var(--gj-mint)" : "var(--gj-muted)", border: on ? "1px solid rgba(154,230,180,0.45)" : "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                      {on && <Check size={12} />} {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => {
            if (!form.title.trim()) { toast.error("Poné un título al recurso."); return; }
            const base = { title: form.title, description: form.description || undefined, category: form.category, areas: form.areas.length ? form.areas : undefined, externalUrl: form.externalUrl || undefined, fileUrls: form.fileUrls.length ? form.fileUrls : undefined, content: form.content || undefined };
            if (targetClientIds.length > 0) {
              createForClients.mutate({ clientIds: [clientId, ...targetClientIds], ...base });
            } else {
              createResource.mutate({ clientId, ...base, order: resources.length });
            }
            setForm(EMPTY_R); setTargetClientIds([]);
          }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> {targetClientIds.length > 0 ? `AGREGAR A ${targetClientIds.length + 1} CLIENTES` : "AGREGAR RECURSO"}
        </button>
      </div>
    </div>
  );
}

// ─── DIGITAL ASSETS TAB ───────────────────────────────────────────────────────
function DigitalAssetsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: assets = [] } = trpc.digitalAssets.list.useQuery({ clientId });
  const createAsset = trpc.digitalAssets.create.useMutation({
    onSuccess: () => { utils.digitalAssets.list.invalidate({ clientId }); toast.success("Activo creado."); },
    onError: (e) => toast.error(e.message),
  });
  const updateAsset = trpc.digitalAssets.update.useMutation({
    onSuccess: () => { utils.digitalAssets.list.invalidate({ clientId }); toast.success("Activo actualizado."); setEditingId(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteAsset = trpc.digitalAssets.delete.useMutation({
    onSuccess: () => { utils.digitalAssets.list.invalidate({ clientId }); toast.success("Activo eliminado."); },
    onError: (e) => toast.error(e.message),
  });

  const EMPTY = { title: "", description: "", category: "webpage" as const, externalUrl: "", fileUrl: "", notes: "" };
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(EMPTY);

  const CATEGORY_LABELS: Record<string, string> = {
    webpage: "Página Web", design_system: "Design System", tool: "Herramienta Digital",
    document: "Documento", brand_asset: "Activo de Marca", other: "Otro",
  };

  const inputStyle = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" };

  const CategorySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className="col-span-2 px-3 py-2 text-sm" style={inputStyle}>
      <option value="webpage">Página Web</option>
      <option value="design_system">Design System</option>
      <option value="tool">Herramienta Digital</option>
      <option value="document">Documento</option>
      <option value="brand_asset">Activo de Marca</option>
      <option value="other">Otro</option>
    </select>
  );

  return (
    <div className="space-y-4">
      {assets.map((a) => (
        <div key={a.id}>
          {editingId === a.id ? (
            <div style={{ background: "rgba(154,230,180,0.05)", border: "1px solid rgba(154,230,180,0.2)", borderRadius: "6px", padding: "20px" }}>
              <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-mint)", letterSpacing: "3px" }}>EDITANDO ACTIVO</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
                <input value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
                <input value={editForm.externalUrl} onChange={(e) => setEditForm((f) => ({ ...f, externalUrl: e.target.value }))} placeholder="URL externa (página, herramienta, Drive...)" className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
                <div className="col-span-2 flex items-center gap-3">
                  {editForm.fileUrl
                    ? <span className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}><Paperclip size={12} /> {editForm.fileUrl.split("/").pop()}<button type="button" onClick={() => setEditForm(f => ({ ...f, fileUrl: "" }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button></span>
                    : <FileUploadButton clientId={clientId} onUploaded={(url) => setEditForm(f => ({ ...f, fileUrl: url }))} label="SUBIR ARCHIVO / PDF" />
                  }
                </div>
                <input value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notas internas..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
                <CategorySelect value={editForm.category} onChange={(v) => setEditForm((f) => ({ ...f, category: v as any }))} />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { if (editForm.title) updateAsset.mutate({ id: a.id, clientId, ...editForm }); }} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                  <Save size={13} /> GUARDAR
                </button>
                <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-xs px-4 py-2 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--gj-muted)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                  <X size={13} /> CANCELAR
                </button>
              </div>
            </div>
          ) : (
            <div className="gj-card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <span className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px" }}>{CATEGORY_LABELS[a.category]?.toUpperCase()}</span>
                <p className="text-sm font-medium mt-1" style={{ color: "var(--gj-cream)" }}>{a.title}</p>
                {a.description && <p className="text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>{a.description}</p>}
                {a.notes && <p className="text-xs mt-0.5 italic" style={{ color: "rgba(138,128,130,0.6)" }}>{a.notes}</p>}
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  {a.externalUrl && <a href={a.externalUrl} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--gj-green)" }}>↗ {a.externalUrl}</a>}
                  {a.fileUrl && isPreviewable(a.fileUrl) && (
                    <FilePreviewButton
                      url={a.fileUrl}
                      name={a.fileUrl.split("/").pop() ?? "archivo"}
                      buttonStyle={{ color: "var(--gj-mint)", background: "rgba(154,230,180,0.08)", border: "1px solid rgba(154,230,180,0.2)" }}
                    />
                  )}
                  {a.fileUrl && <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--gj-mint)" }}>↓ Archivo</a>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={() => { setEditingId(a.id); setEditForm({ title: a.title, description: a.description || "", category: a.category as any, externalUrl: a.externalUrl || "", fileUrl: a.fileUrl || "", notes: a.notes || "" }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-mint)", padding: "4px" }}>
                  <Edit3 size={14} />
                </button>
                <button onClick={() => deleteAsset.mutate({ id: a.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR ACTIVO DIGITAL</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Título..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
          <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descripción..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
          <input value={form.externalUrl} onChange={(e) => setForm((f) => ({ ...f, externalUrl: e.target.value }))} placeholder="URL externa (página, herramienta, Drive...)" className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
          <div className="col-span-2 flex items-center gap-3">
            {form.fileUrl
              ? <span className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}><Paperclip size={12} /> {form.fileUrl.split("/").pop()}<button type="button" onClick={() => setForm(f => ({ ...f, fileUrl: "" }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button></span>
              : <FileUploadButton clientId={clientId} onUploaded={(url) => setForm(f => ({ ...f, fileUrl: url }))} label="SUBIR ARCHIVO / PDF" />
            }
          </div>
          <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Notas internas..." className="col-span-2 px-3 py-2 text-sm" style={inputStyle} />
          <CategorySelect value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v as any }))} />
        </div>
        <button
          onClick={() => { if (form.title) { createAsset.mutate({ clientId, ...form, order: assets.length }); setForm(EMPTY); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR ACTIVO
        </button>
      </div>
    </div>
  );
}

// ─── METRICS TAB ──────────────────────────────────────────────────────────────
function MetricsTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: metrics = [] } = trpc.metrics.list.useQuery({ clientId });
  const createMetric = trpc.metrics.create.useMutation({
    onSuccess: () => { utils.metrics.list.invalidate({ clientId }); toast.success("Métrica creada."); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMetric = trpc.metrics.delete.useMutation({
    onSuccess: () => { utils.metrics.list.invalidate({ clientId }); toast.success("Métrica eliminada."); },
    onError: (e) => toast.error(e.message),
  });
  const updateMetric = trpc.metrics.update.useMutation({
    onSuccess: () => { utils.metrics.list.invalidate({ clientId }); toast.success("Métrica actualizada."); },
    onError: (e) => toast.error(e.message),
  });

  const [form, setForm] = useState({ name: "", value: "", previousValue: "", unit: "", trend: "stable" as const, description: "", period: "" });

  return (
    <div className="space-y-4">
      {metrics.map((m) => (
        <div key={m.id} className="gj-card p-4 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-xs tracking-widest" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>{m.name.toUpperCase()}</p>
            <div className="flex items-baseline gap-2 mt-1">
              <input
                value={m.value}
                onChange={(e) => updateMetric.mutate({ id: m.id, clientId, value: e.target.value })}
                className="text-2xl font-bold w-28 bg-transparent border-b"
                style={{ color: "var(--gj-mint)", borderColor: "rgba(255,255,255,0.1)", outline: "none", fontFamily: "var(--gj-font)" }}
              />
              {m.unit && <span className="text-sm" style={{ color: "var(--gj-muted)" }}>{m.unit}</span>}
            </div>
            {m.period && <p className="text-xs mt-1" style={{ color: "rgba(138,128,130,0.6)" }}>{m.period}</p>}
          </div>
          <button onClick={() => deleteMetric.mutate({ id: m.id, clientId })} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px", flexShrink: 0 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      <div style={{ background: "rgba(245,240,232,0.03)", border: "1px solid rgba(245,240,232,0.08)", borderRadius: "6px", padding: "20px" }}>
        <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>AGREGAR MÉTRICA</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre (ej: Reservas/mes)" className="col-span-2 px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.value} onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))} placeholder="Valor actual (ej: 120)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))} placeholder="Unidad (ej: reservas)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.previousValue} onChange={(e) => setForm((f) => ({ ...f, previousValue: e.target.value }))} placeholder="Valor anterior" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <input value={form.period} onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))} placeholder="Período (ej: Mayo 2026)" className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }} />
          <select value={form.trend} onChange={(e) => setForm((f) => ({ ...f, trend: e.target.value as any }))} className="px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)" }}>
            <option value="up">↑ Subiendo</option>
            <option value="down">↓ Bajando</option>
            <option value="stable">→ Estable</option>
          </select>
        </div>
        <button
          onClick={() => { if (form.name && form.value) { createMetric.mutate({ clientId, ...form, order: metrics.length }); setForm({ name: "", value: "", previousValue: "", unit: "", trend: "stable", description: "", period: "" }); } }}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={14} /> AGREGAR MÉTRICA
        </button>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// ─── BACKLOG TAB ──────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; color: string }> = {
  idea:         { label: "IDEA",         color: "var(--gj-muted)" },
  en_revision:  { label: "EN REVISIÓN",  color: "#E0913F" },
  aprobada:     { label: "APROBADA",     color: "#4eba8a" },
  en_progreso:  { label: "EN PROGRESO",  color: "#4db6e8" },
  descartada:   { label: "DESCARTADA",   color: "var(--rojo-vivo)" },
};
const PRIORITY_META: Record<string, { label: string; color: string }> = {
  alta:  { label: "ALTA",  color: "var(--rojo-vivo)" },
  media: { label: "MEDIA", color: "#E0913F" },
  baja:  { label: "BAJA",  color: "var(--gj-muted)" },
};
const EMPTY_BACKLOG = { title: "", description: "", status: "idea" as const, priority: "media" as const, url: "", fileUrls: [] as { url: string; name: string }[], ideaDate: new Date().toISOString().split("T")[0], startDate: "", endDate: "" };

const fmtDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("es-AR", { day: "numeric", month: "short", year: "numeric" }) : null;
const toDateInput = (d: string | Date | null | undefined) =>
  d ? new Date(d).toISOString().split("T")[0] : "";

const bFiles = (b: any): { url: string; name: string }[] =>
  Array.isArray(b?.fileUrls) ? b.fileUrls : [];

function BacklogTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: items = [] } = trpc.backlog.list.useQuery({ clientId });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_BACKLOG);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<typeof EMPTY_BACKLOG>>({});

  const createItem = trpc.backlog.create.useMutation({
    onSuccess: () => { utils.backlog.list.invalidate({ clientId }); toast.success("Idea agregada."); setShowForm(false); setForm(EMPTY_BACKLOG); },
    onError: (e) => toast.error(e.message),
  });
  const updateItem = trpc.backlog.update.useMutation({
    onSuccess: () => { utils.backlog.list.invalidate({ clientId }); toast.success("Idea actualizada."); setEditingId(null); setEditData({}); },
    onError: (e) => toast.error(e.message),
  });
  const deleteItem = trpc.backlog.delete.useMutation({
    onSuccess: () => { utils.backlog.list.invalidate({ clientId }); toast.success("Idea eliminada."); },
    onError: (e) => toast.error(e.message),
  });

  const inp = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "3px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: "13px", padding: "7px 10px", width: "100%", outline: "none" };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "3px" }}>
          {items.length} IDEA{items.length !== 1 ? "S" : ""}
        </p>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs px-4 py-2 rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
        >
          <Plus size={12} /> NUEVA IDEA
        </button>
      </div>

      {showForm && (
        <div className="gj-card p-5 mb-6">
          <p className="text-xs tracking-widest mb-4" style={{ color: "var(--gj-mint)", letterSpacing: "3px" }}>NUEVA IDEA</p>
          <div className="space-y-3">
            <input placeholder="Título de la idea *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={inp} />
            <textarea placeholder="Descripción (opcional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />
            <input placeholder="URL de referencia (opcional) — ej. app o producto de inspiración" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} style={inp} />
            <div className="flex flex-wrap items-center gap-2">
              {form.fileUrls.map((f, i) => (
                <span key={f.url} className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}>
                  <Paperclip size={12} /> {f.name}
                  <button type="button" onClick={() => setForm(cf => ({ ...cf, fileUrls: cf.fileUrls.filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button>
                </span>
              ))}
              <MultiFileUploadButton clientId={clientId} onUploaded={(url, name) => setForm(cf => ({ ...cf, fileUrls: [...cf.fileUrls, { url, name }] }))} label="SUBIR IMÁGENES / PDF DE REFERENCIA" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>ESTADO</p>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} style={inp}>
                  {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>PRIORIDAD</p>
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as any }))} style={inp}>
                  {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>SURGIÓ EL</p>
                <input type="date" value={form.ideaDate} onChange={e => setForm(f => ({ ...f, ideaDate: e.target.value }))} style={inp} />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>INICIO (opcional)</p>
                <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inp} />
              </div>
              <div>
                <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>FIN (opcional)</p>
                <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inp} />
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => { if (form.title) createItem.mutate({ clientId, ...form, ideaDate: form.ideaDate || undefined, startDate: form.startDate || undefined, endDate: form.endDate || undefined }); }}
                disabled={!form.title}
                className="flex items-center gap-1 text-xs px-4 py-2 rounded"
                style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px", opacity: form.title ? 1 : 0.5 }}
              >
                <Save size={12} /> GUARDAR
              </button>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_BACKLOG); }} className="text-xs px-4 py-2 rounded" style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "var(--gj-muted)", cursor: "pointer", letterSpacing: "2px" }}>
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => {
          const st = STATUS_META[item.status] ?? STATUS_META.idea;
          const pr = PRIORITY_META[item.priority] ?? PRIORITY_META.media;
          const isEditing = editingId === item.id;
          return (
            <div key={item.id} className="gj-card p-4">
              {isEditing ? (
                <div className="space-y-3">
                  <input value={editData.title ?? item.title} onChange={e => setEditData(d => ({ ...d, title: e.target.value }))} style={inp} />
                  <textarea value={editData.description ?? item.description ?? ""} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} rows={3} style={{ ...inp, resize: "vertical" }} />
                  <input placeholder="URL de referencia (opcional)" value={editData.url ?? (item as any).url ?? ""} onChange={e => setEditData(d => ({ ...d, url: e.target.value }))} style={inp} />
                  <div className="flex flex-wrap items-center gap-2">
                    {(editData.fileUrls ?? bFiles(item)).map((f, i) => (
                      <span key={f.url} className="text-xs flex items-center gap-1" style={{ color: "var(--gj-mint)" }}>
                        <Paperclip size={12} /> {f.name}
                        <button type="button" onClick={() => setEditData(d => ({ ...d, fileUrls: (d.fileUrls ?? bFiles(item)).filter((_, idx) => idx !== i) }))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", marginLeft: 4 }}><X size={11} /></button>
                      </span>
                    ))}
                    <MultiFileUploadButton clientId={clientId} onUploaded={(url, name) => setEditData(d => ({ ...d, fileUrls: [...(d.fileUrls ?? bFiles(item)), { url, name }] }))} label="SUBIR IMÁGENES / PDF DE REFERENCIA" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={editData.status ?? item.status} onChange={e => setEditData(d => ({ ...d, status: e.target.value as any }))} style={inp}>
                      {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select value={editData.priority ?? item.priority} onChange={e => setEditData(d => ({ ...d, priority: e.target.value as any }))} style={inp}>
                      {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>SURGIÓ EL</p>
                      <input type="date" value={editData.ideaDate ?? toDateInput((item as any).ideaDate)} onChange={e => setEditData(d => ({ ...d, ideaDate: e.target.value }))} style={inp} />
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>INICIO</p>
                      <input type="date" value={editData.startDate ?? toDateInput((item as any).startDate)} onChange={e => setEditData(d => ({ ...d, startDate: e.target.value }))} style={inp} />
                    </div>
                    <div>
                      <p className="text-xs mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>FIN</p>
                      <input type="date" value={editData.endDate ?? toDateInput((item as any).endDate)} onChange={e => setEditData(d => ({ ...d, endDate: e.target.value }))} style={inp} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => updateItem.mutate({ id: item.id, clientId, ...editData })} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded" style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                      <Save size={12} /> GUARDAR
                    </button>
                    <button onClick={() => { setEditingId(null); setEditData({}); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded" style={{ background: "rgba(255,255,255,0.06)", color: "var(--gj-muted)", border: "none", cursor: "pointer", letterSpacing: "2px" }}>
                      <X size={12} /> CANCELAR
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs px-2 py-0.5 rounded" style={{ color: st.color, background: `${st.color}18`, border: `1px solid ${st.color}40`, letterSpacing: "1px" }}>{st.label}</span>
                      <span className="text-xs px-2 py-0.5 rounded" style={{ color: pr.color, background: `${pr.color}18`, border: `1px solid ${pr.color}40`, letterSpacing: "1px" }}>{pr.label}</span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: "var(--gj-cream)" }}>{item.title}</p>
                    {item.description && <p className="text-xs mt-1" style={{ color: "var(--gj-muted)", lineHeight: 1.5 }}>{item.description}</p>}
                    {(fmtDate((item as any).ideaDate) || fmtDate((item as any).startDate) || fmtDate((item as any).endDate)) && (
                      <p className="text-xs mt-1" style={{ color: "var(--gj-muted)" }}>
                        {fmtDate((item as any).ideaDate) && <>💡 Surgió: {fmtDate((item as any).ideaDate)}</>}
                        {fmtDate((item as any).startDate) && <>{fmtDate((item as any).ideaDate) ? "  ·  " : ""}▶ Inicio: {fmtDate((item as any).startDate)}</>}
                        {fmtDate((item as any).endDate) && <>{(fmtDate((item as any).ideaDate) || fmtDate((item as any).startDate)) ? "  ·  " : ""}✓ Fin: {fmtDate((item as any).endDate)}</>}
                      </p>
                    )}
                    {(bFiles(item).length > 0 || (item as any).url) && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {bFiles(item).map((f) => (
                          <div key={f.url} className="flex items-center gap-1.5 flex-wrap">
                            {isPreviewable(f.name) && (
                              <FilePreviewButton
                                url={f.url}
                                name={f.name}
                                buttonStyle={{ color: "var(--gj-mint)", background: "rgba(154,230,180,0.08)", border: "1px solid rgba(154,230,180,0.2)" }}
                              />
                            )}
                            <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--gj-mint)" }}>↓ {f.name}</a>
                          </div>
                        ))}
                        {(item as any).url && <a href={(item as any).url} target="_blank" rel="noopener noreferrer" className="text-xs" style={{ color: "var(--gj-mint)", wordBreak: "break-all" }}>🔗 {(item as any).url}</a>}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => { setEditingId(item.id); setEditData({}); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-green)", padding: "4px" }}><Edit3 size={13} /></button>
                    <button onClick={() => { if (confirm("¿Eliminar esta idea?")) deleteItem.mutate({ id: item.id, clientId }); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: "4px" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <p className="text-xs" style={{ color: "var(--gj-muted)" }}>Sin ideas en el backlog todavía.</p>
        )}
      </div>
    </div>
  );
}

// ─── USERS TAB ────────────────────────────────────────────────────────────────
const MEMBER_SECTION_LABELS: Record<string, string> = Object.fromEntries(
  CLIENT_PORTAL_SECTIONS.map((s) => [s.id, s.label])
);

function UsersTab({ clientId }: { clientId: number }) {
  const utils = trpc.useUtils();
  const { data: client } = trpc.clients.get.useQuery({ id: clientId });
  const { data: userList = [], isLoading } = trpc.users.listByClient.useQuery({ clientId });
  const createUser = trpc.users.createWithAccess.useMutation({
    onSuccess: (res) => {
      utils.users.listByClient.invalidate({ clientId });
      toast.success(res.created ? "Usuario creado y acceso otorgado." : "Acceso otorgado al usuario existente.");
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: (e) => toast.error(e.message),
  });
  const revokeAccess = trpc.users.revokeAccess.useMutation({
    onSuccess: () => { utils.users.listByClient.invalidate({ clientId }); toast.success("Acceso revocado."); },
    onError: (e) => toast.error(e.message),
  });
  const setLevel = trpc.users.setAccessLevel.useMutation({
    onSuccess: () => { utils.users.listByClient.invalidate({ clientId }); toast.success("Nivel de acceso actualizado."); },
    onError: (e) => toast.error(e.message),
  });
  const updateMemberSections = trpc.clients.update.useMutation({
    onSuccess: () => { utils.clients.get.invalidate({ id: clientId }); toast.success("Secciones para miembros actualizadas."); },
    onError: (e) => toast.error(e.message),
  });
  const { data: invitationList = [] } = trpc.invitations.listByClient.useQuery({ clientId });
  const createInvitation = trpc.invitations.create.useMutation({
    onSuccess: (inv) => {
      utils.invitations.listByClient.invalidate({ clientId });
      setGeneratedToken(inv.token);
      setInviteForm(EMPTY_INVITE);
    },
    onError: (e) => toast.error(e.message),
  });
  const revokeInvitation = trpc.invitations.revoke.useMutation({
    onSuccess: () => { utils.invitations.listByClient.invalidate({ clientId }); toast.success("Invitación revocada."); },
    onError: (e) => toast.error(e.message),
  });

  const EMPTY_FORM = { name: "", email: "", password: "", accessLevel: "owner" as "owner" | "member" };
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const EMPTY_INVITE = { accessLevel: "member" as "owner" | "member", note: "" };
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState(EMPTY_INVITE);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  function copyInviteLink(token: string) {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado al portapapeles.");
  }

  const inp = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: "13px", padding: "8px 12px", width: "100%", outline: "none" };

  const memberSections = ((client as any)?.memberVisibleSections as string[] | null) ?? [];
  function toggleMemberSection(sectionId: string) {
    const next = memberSections.includes(sectionId)
      ? memberSections.filter((s) => s !== sectionId)
      : [...memberSections, sectionId];
    updateMemberSections.mutate({ id: clientId, memberVisibleSections: next });
  }

  return (
    <div className="space-y-6">
      {/* Visibilidad por sección para usuarios "Miembro del equipo" */}
      <div className="gj-card p-5 space-y-3" style={{ borderLeft: "3px solid #E0913F" }}>
        <div className="flex items-center gap-2">
          <Shield size={14} style={{ color: "#E0913F" }} />
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-cream)", letterSpacing: "2px", fontWeight: 600 }}>
            SECCIONES PARA MIEMBROS DEL EQUIPO
          </p>
        </div>
        <p className="text-xs" style={{ color: "var(--gj-muted)", lineHeight: 1.5 }}>
          Los usuarios "Miembro del equipo" (empleados del cliente) NO ven ninguna sección por defecto, salvo el
          Resumen ejecutivo. Habilitá acá (ojito = visible, candado = oculto) cuáles puede ver — aplica a todos
          los miembros de este cliente. Esto es independiente del toggle "Dueño" general, que ya controla qué ve
          el cliente principal.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          {MEMBER_GATED_SECTIONS.map((id) => {
            const active = memberSections.includes(id);
            return (
              <button
                key={id}
                onClick={() => toggleMemberSection(id)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  background: active ? "rgba(10,135,105,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(10,135,105,0.4)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: "4px", padding: "6px 12px", cursor: "pointer",
                  color: active ? "var(--gj-mint)" : "var(--gj-muted)", fontSize: "11px", letterSpacing: "1px",
                }}
              >
                {active ? <Eye size={12} /> : <Lock size={12} />}
                {MEMBER_SECTION_LABELS[id] ?? id}
              </button>
            );
          })}
        </div>
      </div>

      {!showForm && !showInviteForm && (
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded"
            style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px" }}
          >
            <Plus size={14} /> NUEVO ACCESO
          </button>
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center gap-2 text-xs px-4 py-2 rounded"
            style={{ background: "transparent", color: "var(--gj-mint)", border: "1px solid rgba(10,135,105,0.4)", cursor: "pointer", letterSpacing: "2px" }}
          >
            <Link2 size={14} /> INVITAR POR LINK
          </button>
        </div>
      )}

      {showInviteForm && (
        <div className="gj-card p-5 space-y-4" style={{ maxWidth: 480 }}>
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "3px", fontWeight: 600 }}>INVITAR POR LINK</p>
          <p className="text-xs" style={{ color: "var(--gj-muted)", lineHeight: 1.5 }}>
            Generá un link único, mandaselo por WhatsApp o mail, y la persona elige su propio nombre y contraseña al abrirlo.
          </p>
          <div className="space-y-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>PARA QUIÉN (opcional, solo para tu referencia)</label>
              <input style={inp} placeholder="Ej. Juan - Recepción" value={inviteForm.note} onChange={(e) => setInviteForm(f => ({ ...f, note: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>NIVEL DE ACCESO</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setInviteForm((f) => ({ ...f, accessLevel: "owner" }))}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer",
                    background: inviteForm.accessLevel === "owner" ? "rgba(10,135,105,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${inviteForm.accessLevel === "owner" ? "rgba(10,135,105,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: inviteForm.accessLevel === "owner" ? "var(--gj-mint)" : "var(--gj-muted)",
                  }}
                >
                  DUEÑO
                </button>
                <button
                  type="button"
                  onClick={() => setInviteForm((f) => ({ ...f, accessLevel: "member" }))}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer",
                    background: inviteForm.accessLevel === "member" ? "rgba(224,145,63,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${inviteForm.accessLevel === "member" ? "rgba(224,145,63,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: inviteForm.accessLevel === "member" ? "#E0913F" : "var(--gj-muted)",
                  }}
                >
                  MIEMBRO DEL EQUIPO
                </button>
              </div>
            </div>
          </div>
          {generatedToken && (
            <div style={{ background: "rgba(10,135,105,0.08)", border: "1px solid rgba(10,135,105,0.3)", borderRadius: "4px", padding: "12px" }}>
              <p className="text-xs mb-2" style={{ color: "var(--gj-mint)", letterSpacing: "1px" }}>LINK GENERADO — copialo y mandaselo a la persona:</p>
              <div className="flex items-center gap-2">
                <input readOnly value={`${window.location.origin}/invite/${generatedToken}`} style={{ ...inp, fontSize: "11px", color: "var(--gj-muted)" }} onFocus={(e) => e.target.select()} />
                <button onClick={() => copyInviteLink(generatedToken)} style={{ flexShrink: 0, background: "var(--gj-green)", border: "none", borderRadius: "4px", padding: "8px 12px", cursor: "pointer", color: "var(--gj-cream)" }}>
                  <Copy size={14} />
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowInviteForm(false); setInviteForm(EMPTY_INVITE); setGeneratedToken(null); }} style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "var(--gj-muted)", cursor: "pointer", fontSize: "12px", letterSpacing: "2px" }}>
              CERRAR
            </button>
            <button
              onClick={() => createInvitation.mutate({ clientId, ...inviteForm })}
              disabled={createInvitation.isPending}
              style={{ flex: 1, padding: "8px", background: "var(--gj-green)", border: "none", borderRadius: "4px", color: "var(--gj-cream)", cursor: "pointer", fontSize: "12px", letterSpacing: "2px", opacity: createInvitation.isPending ? 0.6 : 1 }}
            >
              {createInvitation.isPending ? "GENERANDO..." : "GENERAR LINK"}
            </button>
          </div>
        </div>
      )}

      {invitationList.filter((i) => i.status === "pending").length > 0 && (
        <div className="space-y-2">
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>INVITACIONES PENDIENTES</p>
          {invitationList.filter((i) => i.status === "pending").map((inv) => (
            <div key={inv.id} className="gj-card p-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex items-center gap-2">
                <span style={{
                  fontSize: "9px", letterSpacing: "1px", padding: "2px 6px", borderRadius: "3px", flexShrink: 0,
                  background: inv.accessLevel === "member" ? "rgba(224,145,63,0.15)" : "rgba(10,135,105,0.15)",
                  color: inv.accessLevel === "member" ? "#E0913F" : "var(--gj-mint)",
                  border: `1px solid ${inv.accessLevel === "member" ? "rgba(224,145,63,0.35)" : "rgba(10,135,105,0.35)"}`,
                }}>
                  {inv.accessLevel === "member" ? "MIEMBRO" : "DUEÑO"}
                </span>
                <p className="text-xs truncate" style={{ color: "var(--gj-cream)" }}>{inv.note || "Sin nota"}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => copyInviteLink(inv.token)} title="Copiar link" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer", padding: "6px 8px", color: "var(--gj-muted)" }}>
                  <Copy size={13} />
                </button>
                <button onClick={() => { if (confirm("¿Revocar esta invitación? El link dejará de funcionar.")) revokeInvitation.mutate({ id: inv.id, clientId }); }} title="Revocar" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", cursor: "pointer", padding: "6px 8px", color: "#ef4444" }}>
                  <Ban size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="gj-card p-5 space-y-4" style={{ maxWidth: 480 }}>
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "3px", fontWeight: 600 }}>CREAR ACCESO</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs block mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>NOMBRE</label>
              <input style={inp} placeholder="Nombre del usuario" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>EMAIL</label>
              <input style={inp} type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>CONTRASEÑA</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inp, paddingRight: 40 }}
                  type={showPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs block mb-1" style={{ color: "var(--gj-muted)", letterSpacing: "2px" }}>NIVEL DE ACCESO</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, accessLevel: "owner" }))}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer",
                    background: form.accessLevel === "owner" ? "rgba(10,135,105,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.accessLevel === "owner" ? "rgba(10,135,105,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: form.accessLevel === "owner" ? "var(--gj-mint)" : "var(--gj-muted)",
                  }}
                >
                  DUEÑO
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, accessLevel: "member" }))}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "4px", fontSize: "12px", letterSpacing: "1px", cursor: "pointer",
                    background: form.accessLevel === "member" ? "rgba(224,145,63,0.15)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.accessLevel === "member" ? "rgba(224,145,63,0.4)" : "rgba(255,255,255,0.1)"}`,
                    color: form.accessLevel === "member" ? "#E0913F" : "var(--gj-muted)",
                  }}
                >
                  MIEMBRO DEL EQUIPO
                </button>
              </div>
              {form.accessLevel === "member" && (
                <p className="text-xs mt-2" style={{ color: "var(--gj-muted)", lineHeight: 1.4, fontStyle: "italic" }}>
                  Solo va a ver las secciones confidenciales que hayas habilitado arriba.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} style={{ flex: 1, padding: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px", color: "var(--gj-muted)", cursor: "pointer", fontSize: "12px", letterSpacing: "2px" }}>
              CANCELAR
            </button>
            <button
              onClick={() => { if (form.name && form.email && form.password) createUser.mutate({ clientId, ...form }); }}
              disabled={!form.name || !form.email || form.password.length < 6 || createUser.isPending}
              style={{ flex: 1, padding: "8px", background: "var(--gj-green)", border: "none", borderRadius: "4px", color: "var(--gj-cream)", cursor: "pointer", fontSize: "12px", letterSpacing: "2px", opacity: (!form.name || !form.email || form.password.length < 6) ? 0.5 : 1 }}
            >
              {createUser.isPending ? "CREANDO..." : "CREAR ACCESO"}
            </button>
          </div>
        </div>
      )}

      {/* Users list */}
      <div className="space-y-2">
        {isLoading && <p className="text-xs" style={{ color: "var(--gj-muted)" }}>Cargando...</p>}
        {!isLoading && userList.length === 0 && (
          <div className="gj-card p-8 text-center">
            <p className="text-sm" style={{ color: "var(--gj-muted)", fontStyle: "italic" }}>
              Este cliente no tiene usuarios con acceso todavía.
            </p>
          </div>
        )}
        {userList.map((u) => {
          const level = ((u as any).accessLevel as "owner" | "member" | undefined) ?? "owner";
          const isMember = level === "member";
          return (
            <div key={u.id} className="gj-card p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(10,135,105,0.15)", border: "1px solid rgba(10,135,105,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={16} style={{ color: "var(--gj-green)" }} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm truncate" style={{ color: "var(--gj-cream)", fontWeight: 600 }}>{u.name || "—"}</p>
                    <span style={{
                      fontSize: "9px", letterSpacing: "1px", padding: "2px 6px", borderRadius: "3px", flexShrink: 0,
                      background: isMember ? "rgba(224,145,63,0.15)" : "rgba(10,135,105,0.15)",
                      color: isMember ? "#E0913F" : "var(--gj-mint)",
                      border: `1px solid ${isMember ? "rgba(224,145,63,0.35)" : "rgba(10,135,105,0.35)"}`,
                    }}>
                      {isMember ? "MIEMBRO" : "DUEÑO"}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: "var(--gj-muted)" }}>{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  title={isMember ? "Cambiar a Dueño" : "Cambiar a Miembro del equipo"}
                  onClick={() => setLevel.mutate({ userId: u.id, clientId, accessLevel: isMember ? "owner" : "member" })}
                  style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px",
                    cursor: "pointer", padding: "6px 10px", color: "var(--gj-muted)", fontSize: "11px", letterSpacing: "1px",
                  }}
                >
                  {isMember ? "HACER DUEÑO" : "HACER MIEMBRO"}
                </button>
                <button
                  onClick={() => {
                    if (revokingId === u.id) {
                      revokeAccess.mutate({ userId: u.id, clientId });
                      setRevokingId(null);
                    } else {
                      setRevokingId(u.id);
                      setTimeout(() => setRevokingId(null), 3000);
                    }
                  }}
                  style={{
                    background: revokingId === u.id ? "rgba(220,38,38,0.15)" : "transparent",
                    border: `1px solid ${revokingId === u.id ? "rgba(220,38,38,0.4)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: "4px", cursor: "pointer", padding: "6px 12px", flexShrink: 0,
                    color: revokingId === u.id ? "#ef4444" : "var(--gj-muted)", fontSize: "11px", letterSpacing: "1px",
                  }}
                >
                  {revokingId === u.id ? "¿CONFIRMAR?" : "REVOCAR"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ASISTENTE IA TAB ─────────────────────────────────────────────────────────
const ACTION_BADGE: Record<string, { label: string; color: string }> = {
  create_phase:     { label: "ETAPA",         color: "#4db6e8" },
  update_phase:     { label: "ETAPA",         color: "#4db6e8" },
  create_milestone: { label: "HITO",          color: "#E0913F" },
  update_milestone: { label: "HITO",          color: "#E0913F" },
  create_update:    { label: "ACTUALIZACIÓN", color: "#9ae6b4" },
  create_okr:       { label: "OBJETIVO",      color: "#b87fd4" },
  update_okr:       { label: "OBJETIVO",      color: "#b87fd4" },
  create_metric:    { label: "MÉTRICA",       color: "#4eba8a" },
  create_learning:  { label: "APRENDIZAJE",   color: "#E0913F" },
  create_resource:  { label: "RECURSO",       color: "#4db6e8" },
  create_backlog:   { label: "IDEA",          color: "#b87fd4" },
};

function AsistenteWidget({ clientId }: { clientId: number }) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const utils = trpc.useUtils();
  const [thread, setThread] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<any[]>([]);
  const [included, setIncluded] = useState<boolean[]>([]);
  const [results, setResults] = useState<{ label: string; ok: boolean; error?: string }[] | null>(null);

  const interpret = trpc.ai.interpret.useMutation({
    onSuccess: (res) => {
      setThread((t) => [...t, { role: "assistant", content: res.reply }]);
      setPending(res.actions ?? []);
      setIncluded((res.actions ?? []).map(() => true));
      setResults(null);
    },
    onError: (e) => setThread((t) => [...t, { role: "assistant", content: `⚠️ ${e.message}` }]),
  });

  const execute = trpc.ai.execute.useMutation({
    onSuccess: (res) => {
      setResults(res);
      setPending([]);
      setIncluded([]);
      utils.invalidate();
      const ok = res.filter((r) => r.ok).length;
      setThread((t) => [...t, { role: "assistant", content: `✅ Apliqué ${ok} de ${res.length} ${res.length === 1 ? "acción" : "acciones"} al panel.` }]);
    },
    onError: (e) => toast.error(e.message),
  });

  function send(text: string) {
    const msg = text.trim();
    if (!msg || interpret.isPending) return;
    const history = thread;
    setThread((t) => [...t, { role: "user", content: msg }]);
    setInput("");
    setPending([]);
    setIncluded([]);
    interpret.mutate({ clientId, message: msg, history });
  }

  function confirmActions() {
    const actions = pending.filter((_, i) => included[i]);
    if (actions.length === 0) return;
    execute.mutate({ clientId, actions });
  }

  const inp = { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "6px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontSize: "14px", padding: "12px 14px", width: "100%", outline: "none", resize: "none" as const };

  const SUGGESTIONS = [
    "Tuvimos sesión hoy y definimos los pilares de contenido orgánico.",
    "Marcá el hito del Lead Magnet como completado.",
    "Subió la métrica de leads a 120 este mes.",
  ];

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Abrir Asistente IA"
          style={{ position: "fixed", bottom: 24, right: 24, zIndex: 55, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
          <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: 9999, background: "rgba(77,182,232,0.30)" }} />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderRadius: 9999, background: "linear-gradient(135deg, #0a8769 0%, #4db6e8 100%)", color: "#fff", fontWeight: 700, fontSize: 13, letterSpacing: 0.3, boxShadow: "0 10px 30px rgba(10,135,105,0.55)", fontFamily: "var(--gj-font)" }}>
            <Sparkles size={18} /> Asistente IA
          </span>
        </button>
      )}

      {open && (
        <div style={{ position: "fixed", bottom: isMobile ? 12 : 24, right: isMobile ? 12 : 24, left: isMobile ? 12 : "auto", width: isMobile ? "auto" : 400, height: isMobile ? "78vh" : 600, maxHeight: "calc(100vh - 40px)", display: "flex", flexDirection: "column", background: "rgb(14,10,12)", border: "1px solid rgba(154,230,180,0.2)", borderRadius: 16, overflow: "hidden", zIndex: 60, boxShadow: "0 24px 60px rgba(0,0,0,0.55)", fontFamily: "var(--gj-font)" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: "linear-gradient(135deg, #0a8769 0%, #4db6e8 100%)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={18} style={{ color: "#fff" }} />
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>Asistente IA</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Cerrar" style={{ background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, cursor: "pointer", color: "#fff", width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={16} />
            </button>
          </div>

          {/* Cuerpo scrollable */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Hilo de conversación */}
      <div className="space-y-3">
        {thread.length === 0 && (
          <div className="gj-card p-6" style={{ textAlign: "center" }}>
            <Sparkles size={28} style={{ color: "var(--gj-green)", margin: "0 auto 10px" }} />
            <p className="text-sm" style={{ color: "var(--gj-cream)", marginBottom: 4, fontWeight: 600 }}>
              Contale a la IA qué pasó en el proyecto
            </p>
            <p className="text-xs" style={{ color: "var(--gj-muted)", marginBottom: 16 }}>
              Propone las acciones (crear etapas, hitos, actualizaciones, objetivos…) y vos confirmás antes de guardar.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)}
                  style={{ textAlign: "left", fontSize: 12, padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(154,230,180,0.2)", background: "transparent", color: "var(--gj-muted)", cursor: "pointer" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {thread.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px", borderRadius: 10, fontSize: 13, lineHeight: 1.5,
              whiteSpace: "pre-wrap", fontFamily: "var(--gj-font)", color: "var(--gj-cream)",
              background: m.role === "user" ? "var(--gj-green)" : "rgba(255,255,255,0.05)",
              border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)",
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {interpret.isPending && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--gj-muted)" }}>
            <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gj-green)" }} />
            <span className="text-xs">La IA está pensando…</span>
          </div>
        )}
      </div>

      {/* Acciones propuestas */}
      {pending.length > 0 && (
        <div className="gj-card p-5 space-y-3" style={{ border: "1px solid rgba(154,230,180,0.25)" }}>
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "3px", fontWeight: 600 }}>
            ACCIONES PROPUESTAS — REVISÁ Y CONFIRMÁ
          </p>
          {pending.map((a, i) => {
            const badge = ACTION_BADGE[a.type] ?? { label: a.type, color: "var(--gj-muted)" };
            return (
              <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", padding: "8px 0", borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.06)" }}>
                <input type="checkbox" checked={included[i] ?? true}
                  onChange={(e) => setIncluded((arr) => arr.map((v, j) => (j === i ? e.target.checked : v)))}
                  style={{ marginTop: 3, accentColor: "var(--gj-green)" }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 9, letterSpacing: 2, padding: "2px 8px", borderRadius: 20, background: `${badge.color}22`, color: badge.color, fontFamily: "var(--gj-font)" }}>
                    {badge.label}
                  </span>
                  <p className="text-sm" style={{ color: "var(--gj-cream)", marginTop: 6 }}>{a.label}</p>
                </div>
              </label>
            );
          })}
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={confirmActions} disabled={execute.isPending || included.every((v) => !v)}
              className="flex items-center gap-2 text-xs px-4 py-2 rounded"
              style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", letterSpacing: "2px", opacity: (execute.isPending || included.every((v) => !v)) ? 0.5 : 1 }}>
              <Check size={14} /> {execute.isPending ? "GUARDANDO..." : "CONFIRMAR Y GUARDAR"}
            </button>
            <button onClick={() => { setPending([]); setIncluded([]); }}
              className="text-xs px-4 py-2 rounded"
              style={{ background: "transparent", color: "var(--gj-muted)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", letterSpacing: "2px" }}>
              DESCARTAR
            </button>
          </div>
        </div>
      )}

      {/* Resultados de ejecución */}
      {results && results.length > 0 && (
        <div className="gj-card p-4 space-y-2">
          <p className="text-xs tracking-widest" style={{ color: "var(--gj-muted)", letterSpacing: "3px" }}>RESULTADO</p>
          {results.map((r, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span style={{ color: r.ok ? "#4eba8a" : "var(--rojo-vivo)" }}>{r.ok ? "✓" : "✕"}</span>
              <span style={{ color: "var(--gj-cream)" }}>{r.label}{r.error ? ` — ${r.error}` : ""}</span>
            </div>
          ))}
        </div>
      )}

          </div>

          {/* Input (footer) */}
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end", padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          placeholder="Ej: Hoy tuvimos sesión y lanzamos la primera serie de Instagram…"
          rows={2}
          style={inp}
        />
        <button onClick={() => send(input)} disabled={!input.trim() || interpret.isPending}
          className="flex items-center justify-center rounded"
          style={{ background: "var(--gj-green)", color: "var(--gj-cream)", border: "none", cursor: "pointer", width: 44, height: 44, flexShrink: 0, opacity: (!input.trim() || interpret.isPending) ? 0.5 : 1 }}>
          <Send size={16} />
        </button>
      </div>
        </div>
      )}
    </>
  );
}

export default function AdminClientDetail() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ clientId: string }>();
  const clientId = parseInt(params.clientId || "0");
  const [activeTab, setActiveTab] = useState<Tab>("updates");

  const utils = trpc.useUtils();
  const { data: client } = trpc.clients.get.useQuery({ id: clientId }, { enabled: !!clientId && isAuthenticated });
  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => utils.clients.get.invalidate({ id: clientId }),
  });

  const PORTAL_SECTIONS = CLIENT_PORTAL_SECTIONS;

  function toggleSection(sectionId: string) {
    if (!client) return;
    const current: string[] = (client as any).visibleSections ?? PORTAL_SECTIONS.map(s => s.id);
    const next = current.includes(sectionId)
      ? current.filter(s => s !== sectionId)
      : [...current, sectionId];
    // Always keep at least "overview" visible
    const safe = next.includes("overview") ? next : ["overview", ...next];
    updateClientMutation.mutate({ id: clientId, visibleSections: safe });
  }

  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Mapa tab → componente portal para vista previa
  const PREVIEW_COMPONENT: Partial<Record<Tab, React.FC<{ clientId: number }>>> = {
    timeline:      SectionTimeline,
    updates:       SectionFeed,
    milestones:    SectionMilestones,
    okrs:          SectionOKRs,
    metrics:       SectionMetrics,
    learnings:     SectionLearnings,
    scope:         SectionScope,
    resources:     SectionResources,
    digital_assets: SectionDigitalAssets,
    backlog:       SectionBacklog,
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
    if (!loading && isAuthenticated && user?.role !== "admin") navigate("/dashboard");
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gj-petrol-ink)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gj-green)" }} />
      </div>
    );
  }

  const activeTabDef = TABS.find((t) => t.id === activeTab)!;
  const branding = (client as any).branding as any;

  return (
    <div className="min-h-screen flex" style={{ background: "var(--gj-petrol-ink)" }}>
      {/* ── SIDEBAR OVERLAY BACKDROP (mobile) ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        />
      )}

      {/* ── SIDEBAR ────────────────────────────────────────── */}
      {(!isMobile || sidebarOpen) && (
      <aside
        className="flex-shrink-0 flex flex-col"
        style={{
          background: "rgb(12,8,10)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          minHeight: "100vh",
          height: "100vh",
          overflowY: "auto",
          width: 288,
          ...(isMobile ? {
            position: "fixed", top: 0, left: 0, zIndex: 50,
          } : {
            position: "sticky", top: 0,
          }),
        }}
      >
        {/* Back + GJ brand */}
        <div className="px-6 pt-6 pb-2">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 mb-6"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", padding: 0 }}
          >
            <ArrowLeft size={14} />
            <span style={{ fontSize: "10px", letterSpacing: "2px", fontFamily: "var(--gj-font)" }}>VOLVER</span>
          </button>
          {/* Logo GJ — siempre, no el del cliente */}
          <img src="/gj-logo.png" alt="Gumercindo Jiménez" style={{ height: 40, width: "auto", marginBottom: 16, objectFit: "contain" }} />
          <p style={{ fontSize: "10px", letterSpacing: "4px", color: "var(--gj-mint)", fontFamily: "var(--gj-font)", marginBottom: 4 }}>
            CONSULTOR
          </p>
          <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--gj-cream)", fontFamily: "var(--gj-font)", letterSpacing: "0.02em" }}>
            Gumercindo Jiménez
          </p>
          {/* Cliente como contexto, no como marca */}
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(154,230,180,0.1)" }}>
            <p style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: 4 }}>
              CLIENTE ACTIVO
            </p>
            <p style={{ fontSize: "13px", color: "var(--gj-cream)", fontFamily: "var(--gj-font)", fontWeight: 500 }}>
              {client.name}
            </p>
          </div>
        </div>

        {/* Portal visibility toggles */}
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(154,230,180,0.08)", borderBottom: "1px solid rgba(154,230,180,0.08)" }}>
          <p style={{ fontSize: "9px", letterSpacing: "3px", color: "var(--gj-muted)", fontFamily: "var(--gj-font)", marginBottom: "10px" }}>
            PORTAL DEL CLIENTE
          </p>
          {PORTAL_SECTIONS.map((sec) => {
            const visible: string[] = (client as any).visibleSections ?? PORTAL_SECTIONS.map(s => s.id);
            const isOn = visible.includes(sec.id);
            const isOverview = sec.id === "overview";
            return (
              <div key={sec.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", color: isOn ? "var(--gj-cream)" : "var(--gj-muted)", fontFamily: "var(--gj-font)", transition: "color 0.2s" }}>
                  {sec.label}
                </span>
                <button
                  title={isOverview ? "El resumen siempre está visible" : isOn ? "Ocultar al cliente" : "Mostrar al cliente"}
                  disabled={isOverview}
                  onClick={() => toggleSection(sec.id)}
                  style={{
                    width: 32, height: 18, borderRadius: 9, border: "none", cursor: isOverview ? "default" : "pointer",
                    background: isOn ? "var(--gj-green)" : "rgba(154,230,180,0.15)",
                    position: "relative", transition: "background 0.2s", flexShrink: 0,
                    opacity: isOverview ? 0.4 : 1,
                  }}
                >
                  <span style={{
                    position: "absolute", top: 2, left: isOn ? 16 : 2, width: 14, height: 14,
                    borderRadius: "50%", background: "var(--gj-cream)", transition: "left 0.2s",
                  }} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="font-label text-xs tracking-widest px-3 mb-3" style={{ color: "var(--gj-muted)", letterSpacing: "4px", fontSize: "9px" }}>
            SECCIONES
          </p>
          <ul className="space-y-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => { setActiveTab(tab.id); setPreviewMode(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-200 rounded"
                    style={{
                      background: isActive ? "rgba(10,135,105,0.12)" : "transparent",
                      borderLeft: isActive ? "2px solid var(--gj-green)" : "2px solid transparent",
                      color: isActive ? "var(--gj-cream)" : "var(--gj-muted)",
                      cursor: "pointer",
                      border: "none",
                    }}
                    onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.color = "var(--gj-cream)"; } }}
                    onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--gj-muted)"; } }}
                  >
                    <Icon size={14} style={{ color: isActive ? "var(--gj-green)" : "inherit", flexShrink: 0 }} />
                    <span className="font-label text-xs tracking-wider" style={{ letterSpacing: "2px", lineHeight: 1.3 }}>
                      {tab.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

      </aside>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <main className="flex-1 overflow-auto" style={{ minWidth: 0 }}>
        {/* Topbar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between"
          style={{
            padding: isMobile ? "10px 14px" : "16px 32px",
            background: "rgba(8,5,7,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2">
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", padding: 4 }}>
                <Menu size={18} />
              </button>
            )}
            <div>
            <p className="font-label text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: isMobile ? "2px" : "5px", fontSize: isMobile ? 9 : 11 }}>
              {client.name.toUpperCase()}
            </p>
            {!isMobile && (
              <p className="font-body text-xs mt-0.5" style={{ color: "var(--gj-muted)" }}>
                Gestión de consultoría estratégica
              </p>
            )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {PREVIEW_COMPONENT[activeTab] && (
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 text-xs py-2 px-3 rounded"
                style={{
                  background: previewMode ? "rgba(10,135,105,0.25)" : "rgba(10,135,105,0.07)",
                  color: "var(--gj-green)",
                  border: `1px solid ${previewMode ? "rgba(10,135,105,0.5)" : "rgba(10,135,105,0.2)"}`,
                  cursor: "pointer", letterSpacing: isMobile ? "1px" : "2px",
                  fontFamily: "var(--font-label)", fontSize: isMobile ? 9 : 11,
                  transition: "all 0.15s",
                }}
              >
                {previewMode ? <EyeOff size={12} /> : <Eye size={12} />}
                {isMobile ? (previewMode ? "EDITAR" : "PREVIEW") : (previewMode ? "EDITAR" : "VISTA PREVIA")}
              </button>
            )}
            <a
              href={`/dashboard/${clientId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs py-2 px-3 rounded"
              style={{ background: "rgba(10,135,105,0.1)", color: "var(--gj-green)", border: "1px solid rgba(10,135,105,0.2)", textDecoration: "none", letterSpacing: isMobile ? "1px" : "2px", fontFamily: "var(--font-label)", fontSize: isMobile ? 9 : 11 }}
            >
              {isMobile ? "VER →" : "VER COMO CLIENTE →"}
            </a>
            {!isMobile && <img src="/gj-logo.png" alt="GJ" style={{ height: 24, width: "auto", opacity: 0.6 }} />}
          </div>
        </div>

        {/* Section content */}
        <div style={{ padding: isMobile ? "16px" : "32px" }}>
          {/* Section header */}
          <p className="font-label" style={{ fontSize: "10px", letterSpacing: "4px", color: "var(--gj-green)", marginBottom: "6px" }}>
            {activeTabDef.label}
          </p>
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", color: "var(--gj-cream)", lineHeight: 1.1, marginBottom: "8px" }}>
            {activeTabDef.title}
          </h2>
          <p style={{ fontSize: "14px", color: "var(--gj-muted)", marginBottom: "24px", fontFamily: "var(--gj-font)" }}>
            {activeTabDef.subtitle}
          </p>
          <div className="sdt-divider" style={{ marginBottom: "28px" }} />

          {(() => {
            const PreviewComp = PREVIEW_COMPONENT[activeTab];
            if (previewMode && PreviewComp) {
              return (
                <div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    marginBottom: "16px", padding: "8px 14px",
                    background: "rgba(10,135,105,0.08)", border: "1px dashed rgba(10,135,105,0.3)",
                    borderRadius: "5px",
                  }}>
                    <Eye size={12} style={{ color: "var(--gj-green)" }} />
                    <span style={{ fontSize: "10px", letterSpacing: "3px", color: "var(--gj-green)", fontFamily: "var(--gj-font)" }}>
                      ASÍ LO VE EL CLIENTE — solo lectura
                    </span>
                    <button
                      onClick={() => setPreviewMode(false)}
                      style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "var(--gj-muted)", fontSize: "10px", letterSpacing: "2px", fontFamily: "var(--gj-font)" }}
                    >
                      ✕ VOLVER A EDITAR
                    </button>
                  </div>
                  <div style={{ background: "rgb(12,8,10)", borderRadius: "8px", padding: "28px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <PreviewComp clientId={clientId} />
                  </div>
                </div>
              );
            }
            return (
              <>
                {activeTab === "updates" && <UpdatesTab clientId={clientId} />}
                {activeTab === "timeline" && <TimelineTab clientId={clientId} />}
                {activeTab === "milestones" && <MilestonesTab clientId={clientId} />}
                {activeTab === "okrs" && <OKRsTab clientId={clientId} />}
                {activeTab === "learnings" && <LearningsTab clientId={clientId} />}
                {activeTab === "scope" && <ScopeTab clientId={clientId} />}
                {activeTab === "resources" && <ResourcesTab clientId={clientId} />}
                {activeTab === "digital_assets" && <DigitalAssetsTab clientId={clientId} />}
                {activeTab === "metrics" && <MetricsTab clientId={clientId} />}
                {activeTab === "backlog" && <BacklogTab clientId={clientId} />}
                {activeTab === "users" && <UsersTab clientId={clientId} />}
              </>
            );
          })()}
        </div>
      </main>
      <AsistenteWidget clientId={clientId} />
    </div>
  );
}
