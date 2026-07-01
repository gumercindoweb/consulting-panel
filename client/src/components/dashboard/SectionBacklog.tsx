import { trpc } from "@/lib/trpc";
import { FilePreviewButton, isPreviewable } from "@/components/FilePreview";

interface Props {
  clientId: number;
}

const bFiles = (b: any): { url: string; name: string }[] =>
  Array.isArray(b?.fileUrls) ? b.fileUrls : [];

const STATUS_META: Record<string, { label: string; color: string }> = {
  idea:        { label: "IDEA",        color: "#9A9A9A" },
  en_revision: { label: "EN REVISIÓN", color: "var(--ambar)" },
  aprobada:    { label: "APROBADA",    color: "#4eba8a" },
  en_progreso: { label: "EN PROGRESO", color: "#4db6e8" },
  descartada:  { label: "DESCARTADA",  color: "var(--rojo-vivo)" },
};

const PRIORITY_META: Record<string, { label: string; color: string }> = {
  alta:  { label: "ALTA",  color: "var(--rojo-vivo)" },
  media: { label: "MEDIA", color: "var(--ambar)" },
  baja:  { label: "BAJA",  color: "var(--gris)" },
};

export default function SectionBacklog({ clientId }: Props) {
  const { data: items = [], isLoading } = trpc.backlog.list.useQuery({ clientId });

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">BACKLOG DE IDEAS</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Ideas y Oportunidades
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--gris)", fontStyle: "italic" }}>
          Propuestas, mejoras y oportunidades que estamos evaluando para el proyecto.
        </p>
      </div>

      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8" style={{ color: "var(--gris)" }}>
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest">CARGANDO IDEAS</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-12 text-center">
          <p className="font-label text-xs tracking-widest mb-2" style={{ color: "var(--gris)", letterSpacing: "4px" }}>
            SIN IDEAS AÚN
          </p>
          <p className="font-body text-sm" style={{ color: "rgba(138,128,130,0.6)" }}>
            El consultor irá agregando ideas y oportunidades para el proyecto.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            const st = STATUS_META[item.status] ?? STATUS_META.idea;
            const pr = PRIORITY_META[item.priority] ?? PRIORITY_META.media;
            return (
              <div key={item.id} className="sdt-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="font-label text-xs"
                        style={{
                          color: st.color,
                          background: `${st.color}18`,
                          border: `1px solid ${st.color}40`,
                          padding: "2px 8px",
                          letterSpacing: "1.5px",
                        }}
                      >
                        {st.label}
                      </span>
                      <span
                        className="font-label text-xs"
                        style={{
                          color: pr.color,
                          background: `${pr.color}18`,
                          border: `1px solid ${pr.color}40`,
                          padding: "2px 8px",
                          letterSpacing: "1.5px",
                        }}
                      >
                        {pr.label}
                      </span>
                    </div>
                    <p className="font-body text-sm font-medium" style={{ color: "var(--creme)" }}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="font-body text-xs mt-2" style={{ color: "var(--gris)", lineHeight: 1.6 }}>
                        {item.description}
                      </p>
                    )}
                    {(bFiles(item).length > 0 || (item as any).url) && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {bFiles(item).map((f) => (
                          <div key={f.url} className="flex items-center gap-1.5 flex-wrap">
                            {isPreviewable(f.name) && (
                              <FilePreviewButton
                                url={f.url}
                                name={f.name}
                                buttonStyle={{ color: "var(--creme)", background: "rgba(245,240,232,0.06)", border: "1px solid rgba(245,240,232,0.15)" }}
                              />
                            )}
                          </div>
                        ))}
                        {(item as any).url && (
                          <a
                            href={(item as any).url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 font-label text-xs px-3 py-1.5 rounded"
                            style={{ color: "var(--creme)", background: "rgba(245,240,232,0.06)", border: "1px solid rgba(245,240,232,0.15)", textDecoration: "none", letterSpacing: "2px" }}
                          >
                            🔗 VER REFERENCIA
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
