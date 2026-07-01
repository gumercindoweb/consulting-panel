import { trpc } from "@/lib/trpc";
import { Globe, Layers, Wrench, FileText, Star, Box, ExternalLink, Download } from "lucide-react";
import { FilePreviewButton, isPreviewable } from "@/components/FilePreview";

interface Props { clientId: number; }

const CATEGORY_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  webpage:      { label: "Página Web",        color: "#4db6e8", Icon: Globe },
  design_system:{ label: "Design System",     color: "#b87fd4", Icon: Layers },
  tool:         { label: "Herramienta Digital",color: "#4eba8a", Icon: Wrench },
  document:     { label: "Documento",          color: "var(--ambar)", Icon: FileText },
  brand_asset:  { label: "Activo de Marca",    color: "var(--rojo)", Icon: Star },
  other:        { label: "Otro",               color: "var(--gris)", Icon: Box },
};

export default function SectionDigitalAssets({ clientId }: Props) {
  const { data: assets = [], isLoading } = trpc.digitalAssets.list.useQuery({ clientId });

  const grouped = assets.reduce<Record<string, typeof assets>>((acc, a) => {
    const key = a.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">ACTIVOS DIGITALES</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Activos Digitales
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Las piezas del engranaje que sostienen la cadena de valor de tu marketing. Cada activo es una palanca esencial que hace posible que todo el sistema funcione.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      ) : assets.length === 0 ? (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Los activos digitales se irán agregando aquí.
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--gris)" }}>
            Páginas web, design system, herramientas, documentos y activos de marca.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => {
            const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.other;
            const Icon = cfg.Icon;
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}
                  >
                    <Icon size={14} style={{ color: cfg.color }} />
                  </div>
                  <p className="font-label text-xs tracking-widest" style={{ color: cfg.color, letterSpacing: "4px" }}>
                    {cfg.label.toUpperCase()}
                  </p>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <span className="font-label text-xs" style={{ color: "var(--gris)", letterSpacing: "2px" }}>
                    {items.length} {items.length === 1 ? "ÍTEM" : "ÍTEMS"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((asset) => (
                    <div key={asset.id} className="sdt-card p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}25` }}
                        >
                          <Icon size={16} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body text-sm font-medium mb-1" style={{ color: "var(--creme)" }}>
                            {asset.title}
                          </h4>
                          {asset.description && (
                            <p className="text-xs leading-relaxed mb-2" style={{ color: "rgba(138,128,130,0.8)" }}>
                              {asset.description}
                            </p>
                          )}
                          {asset.notes && (
                            <p className="text-xs leading-relaxed mb-3 italic" style={{ color: "rgba(138,128,130,0.6)" }}>
                              {asset.notes}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            {asset.externalUrl && (
                              <a
                                href={asset.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 font-label text-xs px-3 py-1.5 rounded transition-all"
                                style={{
                                  color: cfg.color,
                                  background: `${cfg.color}12`,
                                  border: `1px solid ${cfg.color}30`,
                                  textDecoration: "none",
                                  letterSpacing: "2px",
                                }}
                              >
                                <ExternalLink size={11} />
                                ABRIR
                              </a>
                            )}
                            {asset.fileUrl && isPreviewable(asset.fileUrl) && (
                              <FilePreviewButton
                                url={asset.fileUrl}
                                name={asset.fileUrl.split("/").pop() ?? "archivo"}
                                buttonStyle={{
                                  color: cfg.color,
                                  background: `${cfg.color}12`,
                                  border: `1px solid ${cfg.color}30`,
                                }}
                              />
                            )}
                            {asset.fileUrl && (
                              <a
                                href={asset.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 font-label text-xs px-3 py-1.5 rounded transition-all"
                                style={{
                                  color: "var(--creme)",
                                  background: "var(--rojo)",
                                  textDecoration: "none",
                                  letterSpacing: "2px",
                                }}
                              >
                                <Download size={11} />
                                DESCARGAR
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
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
