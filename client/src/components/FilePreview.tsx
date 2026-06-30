import { useState } from "react";
import { Eye, Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FileKind = "pdf" | "image" | "video" | "office" | null;

function getFileKind(name: string): FileKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "pdf") return "pdf";
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "webm", "mov", "m4v"].includes(ext)) return "video";
  if (["doc", "docx", "ppt", "pptx", "xls", "xlsx"].includes(ext)) return "office";
  return null;
}

export function isPreviewable(name: string): boolean {
  return getFileKind(name) !== null;
}

// Botón "VISTA PREVIA" que abre el archivo en un modal sin forzar la descarga.
// PDF/imagen/video se renderizan nativos; Office (doc/ppt/xls) usa el visor
// embebido de Microsoft, que solo necesita que la URL sea pública (ya lo es:
// bucket panel-assets de Supabase es público por diseño).
export function FilePreviewButton({
  url,
  name,
  buttonStyle,
}: {
  url: string;
  name: string;
  buttonStyle?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  const kind = getFileKind(name);
  if (!kind) return null;

  const embedSrc =
    kind === "office"
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`
      : url;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 font-label text-xs px-3 py-1.5 rounded transition-all"
        style={{
          cursor: "pointer",
          border: "none",
          textDecoration: "none",
          letterSpacing: "2px",
          ...buttonStyle,
        }}
      >
        <Eye size={11} />
        VISTA PREVIA
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="!max-w-4xl w-[92vw] p-4">
          <DialogHeader>
            <DialogTitle className="text-sm pr-6">{name}</DialogTitle>
          </DialogHeader>
          <div className="rounded overflow-hidden" style={{ background: "#111" }}>
            {kind === "image" && (
              <img src={url} alt={name} className="w-full max-h-[75vh] object-contain mx-auto" />
            )}
            {kind === "video" && (
              <video src={url} controls className="w-full max-h-[75vh]" />
            )}
            {(kind === "pdf" || kind === "office") && (
              <iframe src={embedSrc} title={name} className="w-full h-[75vh] border-0" />
            )}
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs justify-center py-2"
            style={{ color: "var(--gris, #888)" }}
          >
            <Download size={11} /> Descargar archivo original
          </a>
        </DialogContent>
      </Dialog>
    </>
  );
}
