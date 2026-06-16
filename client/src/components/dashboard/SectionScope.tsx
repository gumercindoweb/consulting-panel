import { trpc } from "@/lib/trpc";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props { clientId: number; }

export default function SectionScope({ clientId }: Props) {
  const { data: items = [], isLoading } = trpc.scope.list.useQuery({ clientId });

  const inScope = items.filter((i) => i.inScope);
  const outScope = items.filter((i) => !i.inScope);

  // Group by category
  const groupInScope = inScope.reduce<Record<string, typeof inScope>>((acc, i) => {
    const key = i.category || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(i);
    return acc;
  }, {});

  const groupOutScope = outScope.reduce<Record<string, typeof outScope>>((acc, i) => {
    const key = i.category || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(i);
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <p className="sdt-section-label mb-3">ALCANCE DEL PROYECTO</p>
        <h1 className="font-display text-4xl font-bold mb-2" style={{ color: "var(--creme)" }}>
          Scope del Proyecto
        </h1>
        <p className="font-serif text-lg" style={{ color: "var(--oro-pale)", fontStyle: "italic" }}>
          Qué cubre y qué no cubre la consultoría. Claridad total sobre los límites del trabajo.
        </p>
      </div>
      <div className="sdt-divider" />

      {isLoading ? (
        <div className="flex items-center gap-3 py-8">
          <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
          <span className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "3px" }}>CARGANDO...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="sdt-card p-12 text-center">
          <p className="font-serif text-xl" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            El alcance del proyecto se definirá aquí.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* In scope */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <CheckCircle2 size={18} style={{ color: "#4eba8a" }} />
              <p className="font-label text-sm tracking-widest" style={{ color: "#4eba8a", letterSpacing: "4px" }}>
                INCLUIDO EN EL PROYECTO
              </p>
            </div>
            <div className="space-y-6">
              {Object.entries(groupInScope).map(([category, scopeItems]) => (
                <div key={category}>
                  {Object.keys(groupInScope).length > 1 && (
                    <p className="font-label text-xs tracking-widest mb-3" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
                      {category.toUpperCase()}
                    </p>
                  )}
                  <div className="space-y-2">
                    {scopeItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-4 rounded"
                        style={{
                          background: "rgba(78,186,138,0.05)",
                          border: "1px solid rgba(78,186,138,0.15)",
                        }}
                      >
                        <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" style={{ color: "#4eba8a" }} />
                        <div>
                          <p className="font-body text-sm font-medium" style={{ color: "var(--creme)" }}>
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs mt-1" style={{ color: "rgba(138,128,130,0.8)" }}>
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Out of scope */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <XCircle size={18} style={{ color: "var(--rojo)" }} />
              <p className="font-label text-sm tracking-widest" style={{ color: "var(--rojo)", letterSpacing: "4px" }}>
                FUERA DEL ALCANCE
              </p>
            </div>
            {outScope.length === 0 ? (
              <div className="sdt-card p-6 text-center">
                <p className="text-sm" style={{ color: "var(--gris)" }}>
                  No hay ítems fuera de alcance definidos.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupOutScope).map(([category, scopeItems]) => (
                  <div key={category}>
                    {Object.keys(groupOutScope).length > 1 && (
                      <p className="font-label text-xs tracking-widest mb-3" style={{ color: "var(--gris)", letterSpacing: "3px" }}>
                        {category.toUpperCase()}
                      </p>
                    )}
                    <div className="space-y-2">
                      {scopeItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3 p-4 rounded"
                          style={{
                            background: "rgba(179,40,37,0.05)",
                            border: "1px solid rgba(179,40,37,0.15)",
                          }}
                        >
                          <XCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: "var(--rojo)" }} />
                          <div>
                            <p className="font-body text-sm font-medium" style={{ color: "var(--creme)" }}>
                              {item.title}
                            </p>
                            {item.description && (
                              <p className="text-xs mt-1" style={{ color: "rgba(138,128,130,0.8)" }}>
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
