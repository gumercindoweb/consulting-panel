import { trpc } from "@/lib/trpc";
import { FileText, BookOpen, Video, FileCode, HelpCircle, ExternalLink, Download, Bookmark } from "lucide-react";

interface Props { clientId: number; }

const CATEGORY_CONFIG: Record<string, { label: string; color: string; Icon: any }> = {
  script:   { label: "Videotutorial",     color: "#e05252", Icon: Video },
  training: { label: "Curso",             color: "#b87fd4", Icon: BookOpen },
  document: { label: "Presentación",      color: "var(--ambar)", Icon: FileText },
  guide:    { label: "Referencia",        color: "#4db6e8", Icon: Bookmark },
  template: { label: "Material de Apoyo", color: "#7c6fcd", Icon: FileCode },
  other:    { label: "Otro",              color: "var(--gris)", Icon: HelpCircle },
};

export default function SectionResources({ clientId }: Props) {
  const { data: resources = [], isLoading } = trpc.resources.list.useQuery({ clientId });

  const grouped = resources.reduce<Record<string, typeof resources>>((acc, r) => {
    const key = r.category;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">RECURSOS DEL EQUIPO</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Biblioteca de Formación
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Videotutoriales, cursos, referencias y presentaciones para que el equipo entienda y aplique cada etapa del proyecto.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      ) : resources.length === 0 ? (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Los materiales de formación se irán agregando aquí.
          </p>
          <p className="text-sm mt-2" style={{ color: "var(--gris)" }}>
            Videotutoriales, cursos, referencias y presentaciones de capacitación.
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
                    {cfg.label.toUpperCase()}S
                  </p>
                  <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <span className="font-label text-xs" style={{ color: "var(--gris)", letterSpacing: "2px" }}>
                    {items.length} {items.length === 1 ? "ÍTEM" : "ÍTEMS"}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((resource) => (
                    <div key={resource.id} className="sdt-card p-5">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
                          style={{ background: `${cfg.color}12`, border: `1px solid ${cfg.color}25` }}
                        >
                          <Icon size={16} style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-body text-sm font-medium mb-1" style={{ color: "var(--creme)" }}>
                            {resource.title}
                          </h4>
                          {resource.description && (
                            <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(138,128,130,0.8)" }}>
                              {resource.description}
                            </p>
                          )}
                          {resource.content && !resource.fileUrl && !resource.externalUrl && (
                            <div
                              className="text-xs p-3 rounded mt-2"
                              style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid rgba(255,255,255,0.06)",
                                color: "rgba(245,240,232,0.7)",
                                whiteSpace: "pre-wrap",
                                maxHeight: "120px",
                                overflow: "auto",
                              }}
                            >
                              {resource.content}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            {resource.fileUrl && (
                              <a
                                href={resource.fileUrl}
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
                            {resource.externalUrl && (
                              <a
                                href={resource.externalUrl}
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
                                ABRIR ENLACE
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
