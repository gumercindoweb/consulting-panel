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
} from "lucide-react";

interface Props {
  client: Client;
  activeSection: DashboardSection;
  onSectionChange: (s: DashboardSection) => void;
  user: User | null | undefined;
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

export default function DashboardSidebar({ client, activeSection, onSectionChange, user }: Props) {
  const branding = client.branding as any;
  const primaryColor = branding?.primaryColor || "var(--rojo)";
  const isNMRoller = branding?.fontDisplay === "Futura Std";

  const visibleSections = (client as any).visibleSections as string[] | null | undefined;
  const filteredNav = visibleSections?.length
    ? NAV_ITEMS.filter(item => visibleSections.includes(item.id))
    : NAV_ITEMS;

  return (
    <aside
      className="w-72 flex-shrink-0 flex flex-col"
      style={{
        background: "rgb(12,8,10)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        minHeight: "100vh",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}
    >
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

        {isNMRoller ? (
          <h2
            style={{
              fontFamily: FUTURA,
              fontWeight: 800,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#ffffff",
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
          isNMRoller ? (
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
        {isNMRoller ? (
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
                  onClick={() => onSectionChange(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-150"
                  style={{
                    background: isActive
                      ? isNMRoller ? "rgba(208,28,31,0.10)" : "rgba(179,40,37,0.12)"
                      : "transparent",
                    borderLeft: isActive ? `2px solid ${primaryColor}` : "2px solid transparent",
                    color: isActive ? "#ffffff" : isNMRoller ? "#767676" : "var(--gris)",
                    cursor: "pointer",
                    border: "none",
                    borderRadius: isNMRoller ? 0 : 4,
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
                      (e.currentTarget as HTMLElement).style.color = isNMRoller ? "#767676" : "var(--gris)";
                    }
                  }}
                >
                  <Icon
                    size={14}
                    style={{ color: isActive ? primaryColor : "inherit", flexShrink: 0 }}
                  />
                  {isNMRoller ? (
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
              fontFamily: isNMRoller ? FUTURA_CONDENSED : undefined,
              fontSize: 10,
              letterSpacing: isNMRoller ? "0.08em" : undefined,
              color: isNMRoller ? "#404040" : "var(--gris)",
              marginBottom: 4,
              textTransform: isNMRoller ? "uppercase" : undefined,
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
            fontFamily: isNMRoller ? FUTURA_CONDENSED : undefined,
            fontSize: 10,
            letterSpacing: isNMRoller ? "0.08em" : undefined,
            color: "rgba(138,128,130,0.4)",
            textTransform: isNMRoller ? "uppercase" : undefined,
          }}
        >
          © Consultoría Estratégica
        </p>
      </div>
    </aside>
  );
}
