import type { DashboardSection } from "@/pages/ClientDashboard";
import type { Client, User } from "../../../drizzle/schema";
import {
  BarChart3,
  BookOpen,
  CheckSquare,
  FileText,
  FolderOpen,
  LayoutDashboard,
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
];

export default function DashboardSidebar({ client, activeSection, onSectionChange, user }: Props) {
  const branding = client.branding as any;
  const primaryColor = branding?.primaryColor || "var(--rojo)";
  const accentColor = branding?.accentColor || "var(--ambar)";

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
        <h2
          className="font-accent leading-tight"
          style={{ color: "var(--creme)", fontSize: 26 }}
        >
          {client.name}
        </h2>
        {client.consultorName && (
          <p className="font-body text-xs mt-1" style={{ color: "var(--gris)", letterSpacing: "0.04em" }}>
            Consultor: {client.consultorName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        <p
          className="font-label text-xs tracking-widest px-3 mb-4"
          style={{ color: "var(--gris)", letterSpacing: "4px" }}
        >
          NAVEGACIÓN
        </p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className="w-full flex items-center gap-3 px-3 py-3 text-left transition-all duration-200 rounded"
                  style={{
                    background: isActive
                      ? `rgba(179,40,37,0.12)`
                      : "transparent",
                    borderLeft: isActive ? `2px solid ${primaryColor}` : "2px solid transparent",
                    color: isActive ? "var(--creme)" : "var(--gris)",
                    cursor: "pointer",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                      (e.currentTarget as HTMLElement).style.color = "var(--creme)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "var(--gris)";
                    }
                  }}
                >
                  <Icon
                    size={15}
                    style={{ color: isActive ? primaryColor : "inherit", flexShrink: 0 }}
                  />
                  <span
                    className="font-label text-xs tracking-wider"
                    style={{ letterSpacing: "2px", lineHeight: 1.3 }}
                  >
                    {item.label}
                  </span>
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
          <p className="text-xs mb-1" style={{ color: "var(--gris)" }}>
            Proyecto desde:{" "}
            {new Date(client.startDate).toLocaleDateString("es-AR", {
              month: "long",
              year: "numeric",
            })}
          </p>
        )}
        <p className="text-xs" style={{ color: "rgba(138,128,130,0.5)" }}>
          © Consultoría Estratégica
        </p>
      </div>
    </aside>
  );
}
