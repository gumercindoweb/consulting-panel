import type { DashboardSection } from "@/pages/ClientDashboard";
import type { Client, User } from "../../../drizzle/schema";
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  FileText,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Package,
  Rss,
  Target,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useMobile";

interface Props {
  client: Client;
  activeSection: DashboardSection;
  onSectionChange: (s: DashboardSection) => void;
  user: User | null | undefined;
  isOpen?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS: { id: DashboardSection; label: string; icon: React.FC<any> }[] = [
  { id: "overview", label: "RESUMEN EJECUTIVO", icon: LayoutDashboard },
  { id: "updates", label: "ACTUALIZACIONES", icon: Rss },
  { id: "phases", label: "ETAPAS DEL PROYECTO", icon: CheckSquare },
  { id: "milestones", label: "HITOS E IMPLEMENTACIONES", icon: BarChart3 },
  { id: "okrs", label: "OKRs Y MÉTRICAS", icon: Target },
  { id: "learnings", label: "APRENDIZAJES Y OBSTÁCULOS", icon: BookOpen },
  { id: "scope", label: "ALCANCE DEL PROYECTO", icon: FileText },
  { id: "resources", label: "RECURSOS DEL EQUIPO", icon: FolderOpen },
  { id: "digital_assets", label: "ACTIVOS DIGITALES", icon: Package },
  { id: "backlog", label: "BACKLOG DE IDEAS", icon: Lightbulb },
];

const FUTURA = "'Futura Std', 'Futura', sans-serif";
const FUTURA_CONDENSED = "'Futura Std Condensed', 'Futura Std', 'Futura', sans-serif";

export default function DashboardSidebar({ client, activeSection, onSectionChange, user, isOpen = true, onClose }: Props) {
  const isMobile = useIsMobile();
  const branding = client.branding as any;
  const primaryColor = branding?.primaryColor || "var(--rojo)";
  const isNMRoller = branding?.primaryColor === "#D01C1F";
  const isFlyFree = branding?.primaryColor === "#FFD100";
  const isFuturaBrand = isNMRoller || isFlyFree;

  const visibleSections = (client as any).visibleSections as string[] | null | undefined;
  const filteredNav = visibleSections?.length
    ? NAV_ITEMS.filter(item => visibleSections.includes(item.id))
    : NAV_ITEMS;

  const handleSectionChange = (s: DashboardSection) => {
    onSectionChange(s);
    if (isMobile && onClose) onClose();
  };

  if (isMobile && !isOpen) return null;

  return (
    <>
      {/* Overlay backdrop on mobile */}
      {isMobile && (
        <div
          onClick={onClose}
          style={{
            position: "fixed", inset: 0, zIndex: 40,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)",
          }}
        />
      )}

      <aside
        style={{
          background: "rgb(12,8,10)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          minHeight: "100vh",
          height: "100vh",
          overflowY: "auto",
          width: 280,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          ...(isMobile ? {
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 50,
          } : {
            position: "sticky",
            top: 0,
          }),
        }}
      >
        {/* Close button on mobile */}
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "none", border: "none", cursor: "pointer",
              color: "rgba(255,255,255,0.4)", padding: 4, zIndex: 1,
            }}
          >
            <X size={18} />
          </button>
        )}

        {/* Brand header */}
        <div
          className="px-6 py-8"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {(client as any).logoUrl && (
            <img
              src={(client as any).logoUrl}
              alt={client.name}
              style={{ height: 72, width: "auto", marginBottom: 14, objectFit: "contain" }}
            />
          )}

          {isFuturaBrand ? (
            <h2
              style={{
                fontFamily: FUTURA,
                fontWeight: 800,
                fontSize: 20,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: isFlyFree ? "#FFD100" : "#ffffff",
                lineHeight: 1.2,
              }}
            >
              {client.name}
            </h2>
          ) : (
            <h2
              className="font-accent leading-tight"
              style={{ color: "var(--creme)", fontSize: 26 }}
            >
              {client.name}
            </h2>
          )}

          {client.consultorName && (
            isFuturaBrand ? (
              <p
                style={{
                  fontFamily: FUTURA_CONDENSED,
                  fontSize: 10,
                  fontWeight: 400,
                  letterSpacing: "0.15em",
                  color: "#5A5A5A",
                  marginTop: 6,
                  textTransform: "uppercase",
                }}
              >
                CONSULTOR: {client.consultorName}
              </p>
            ) : (
              <p className="font-body text-xs mt-1" style={{ color: "var(--gris)", letterSpacing: "0.04em" }}>
                Consultor: {client.consultorName}
              </p>
            )
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6">
          {isFuturaBrand ? (
            <p
              style={{
                fontFamily: FUTURA_CONDENSED,
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.25em",
                color: "#404040",
                textTransform: "uppercase",
                paddingLeft: 12,
                marginBottom: 16,
              }}
            >
              NAVEGACIÓN
            </p>
          ) : (
            <p
              className="font-label text-xs tracking-widest px-3 mb-4"
              style={{ color: "var(--gris)", letterSpacing: "4px" }}
            >
              NAVEGACIÓN
            </p>
          )}

          <ul className="space-y-1">
            {filteredNav.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSectionChange(item.id)}
                    className="w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-150"
                    style={{
                      background: isActive
                        ? isNMRoller ? "rgba(208,28,31,0.10)" : isFlyFree ? "rgba(255,209,0,0.10)" : "rgba(179,40,37,0.12)"
                        : "transparent",
                      borderLeft: isActive ? `2px solid ${primaryColor}` : "2px solid transparent",
                      color: isActive ? "#ffffff" : isFuturaBrand ? "#767676" : "var(--gris)",
                      cursor: "pointer",
                      border: "none",
                      borderRadius: isFuturaBrand ? 0 : 4,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.color = "#ffffff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                        (e.currentTarget as HTMLElement).style.color = isFuturaBrand ? "#767676" : "var(--gris)";
                      }
                    }}
                  >
                    <Icon
                      size={14}
                      style={{ color: isActive ? primaryColor : "inherit", flexShrink: 0 }}
                    />
                    {isFuturaBrand ? (
                      <span
                        style={{
                          fontFamily: FUTURA_CONDENSED,
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          lineHeight: 1.3,
                          textTransform: "uppercase",
                        }}
                      >
                        {item.label}
                      </span>
                    ) : (
                      <span
                        className="font-label text-xs tracking-wider"
                        style={{ letterSpacing: "2px", lineHeight: 1.3 }}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div
          className="px-6 py-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {client.startDate && (
            <p
              style={{
                fontFamily: isFuturaBrand ? FUTURA_CONDENSED : undefined,
                fontSize: 10,
                letterSpacing: isFuturaBrand ? "0.08em" : undefined,
                color: isFuturaBrand ? "#404040" : "var(--gris)",
                marginBottom: 4,
                textTransform: isFuturaBrand ? "uppercase" : undefined,
              }}
            >
              Desde:{" "}
              {new Date(client.startDate).toLocaleDateString("es-AR", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <p
            style={{
              fontFamily: isFuturaBrand ? FUTURA_CONDENSED : undefined,
              fontSize: 10,
              letterSpacing: isFuturaBrand ? "0.08em" : undefined,
              color: "rgba(138,128,130,0.4)",
              textTransform: isFuturaBrand ? "uppercase" : undefined,
            }}
          >
            © Consultoría Estratégica
          </p>
        </div>
      </aside>
    </>
  );
}
