import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation, useParams } from "wouter";
import { getLoginUrl } from "@/const";
import DashboardSidebar from "@/components/DashboardSidebar";
import SectionOverview from "@/components/dashboard/SectionOverview";
import SectionFeed from "@/components/dashboard/SectionFeed";
import SectionPhases from "@/components/dashboard/SectionPhases";
import SectionMilestones from "@/components/dashboard/SectionMilestones";
import SectionOKRs from "@/components/dashboard/SectionOKRs";
import SectionLearnings from "@/components/dashboard/SectionLearnings";
import SectionScope from "@/components/dashboard/SectionScope";
import SectionResources from "@/components/dashboard/SectionResources";
import SectionDigitalAssets from "@/components/dashboard/SectionDigitalAssets";
import SectionBacklog from "@/components/dashboard/SectionBacklog";

export type DashboardSection =
  | "overview"
  | "updates"
  | "phases"
  | "milestones"
  | "okrs"
  | "learnings"
  | "scope"
  | "resources"
  | "digital_assets"
  | "backlog";

export default function ClientDashboard() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ clientId?: string }>();
  const [activeSection, setActiveSection] = useState<DashboardSection>("overview");

  const { data: myClients, isLoading: clientsLoading } = trpc.clients.myClients.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Determine which client to show
  const clientId = params.clientId
    ? parseInt(params.clientId)
    : myClients?.[0]?.id;

  const activeClient = myClients?.find((c) => c.id === clientId) ?? myClients?.[0];

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
    if (!loading && isAuthenticated && user?.role === "admin" && !params.clientId) {
      navigate("/admin");
    }
  }, [loading, isAuthenticated, user, navigate, params.clientId]);

  // If active section gets hidden, reset to overview
  useEffect(() => {
    if (!activeClient) return;
    const visibleSections = (activeClient as any).visibleSections as string[] | null | undefined;
    if (visibleSections?.length && !visibleSections.includes(activeSection)) {
      setActiveSection("overview");
    }
  }, [activeClient, activeSection]);

  if (loading || clientsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--noir)" }}>
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--rojo)" }}
          />
          <p className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "4px" }}>
            CARGANDO PANEL
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--noir)" }}>
        <div className="text-center">
          <p className="font-serif text-xl mb-6" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Necesitás iniciar sesión para acceder a tu panel.
          </p>
          <a
            href={getLoginUrl()}
            className="font-label text-sm tracking-widest px-8 py-3 inline-block"
            style={{ background: "var(--rojo)", color: "var(--creme)", borderRadius: "3px", textDecoration: "none", letterSpacing: "3px" }}
          >
            INICIAR SESIÓN
          </a>
        </div>
      </div>
    );
  }

  if (!activeClient) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--noir)" }}>
        <div className="text-center max-w-md px-8">
          <p className="font-label text-xs tracking-widest mb-4" style={{ color: "var(--ambar)", letterSpacing: "5px" }}>
            SIN ACCESO
          </p>
          <p className="font-serif text-xl mb-3" style={{ color: "var(--creme)", fontStyle: "italic" }}>
            Tu cuenta no tiene proyectos asignados aún.
          </p>
          <p className="text-sm" style={{ color: "var(--gris)" }}>
            Contactá a tu consultor para que configure tu acceso.
          </p>
        </div>
      </div>
    );
  }

  const branding = activeClient.branding as any;

  // Override CSS variables per-client based on their branding JSON
  const brandVars = branding ? {
    '--rojo':     branding.primaryColor  || undefined,
    '--rojo-vivo': branding.primaryColor || undefined,
    '--ambar':    branding.accentColor   || undefined,
    '--creme':    branding.textColor     || undefined,
    '--noir':     branding.backgroundColor || undefined,
    '--noir-deep': branding.backgroundColor || undefined,
    '--oro-pale': branding.textColor ? 'rgba(255,255,255,0.55)' : undefined,
    ...(branding.fontDisplay === 'Futura Std' ? {
      '--font-display': "'Futura Std', 'Futura', sans-serif",
      '--font-body':    "'Futura Std', 'Futura', sans-serif",
      '--font-label':   "'Futura Std Condensed', 'Futura Std', sans-serif",
      '--font-accent':  "'Futura Std', 'Futura', sans-serif",
      '--font-serif':   "'Futura Std', 'Futura', sans-serif",
    } : {}),
  } as React.CSSProperties : {};

  return (
    <div className="min-h-screen flex" style={{ background: "var(--noir)", ...brandVars }}>
      {/* Sidebar */}
      <DashboardSidebar
        client={activeClient}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        user={user}
      />

      {/* Main content */}
      <main className="flex-1 overflow-auto" style={{ minWidth: 0 }}>
        {/* Top bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-8 py-4"
          style={{
            background: "rgba(8,5,7,0.95)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <p className="font-label text-xs tracking-widest" style={{ color: "var(--ambar)", letterSpacing: "5px" }}>
              {activeClient.name.toUpperCase()}
            </p>
            <p className="font-body text-xs mt-0.5" style={{ color: "var(--gris)" }}>
              Panel de seguimiento estratégico
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs" style={{ color: "var(--gris)" }}>
              {user?.name || user?.email}
            </span>
            <button
              onClick={async () => {
                await logout();
                navigate("/login");
              }}
              className="font-label text-xs tracking-widest px-4 py-2 transition-all"
              style={{
                border: "1px solid rgba(255,255,255,0.1)",
                color: "var(--gris)",
                borderRadius: "3px",
                letterSpacing: "2px",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              SALIR
            </button>
          </div>
        </div>

        {/* Section content */}
        <div className="p-8">
          {activeSection === "overview" && (
            <SectionOverview clientId={activeClient.id} client={activeClient} />
          )}
          {activeSection === "updates" && (
            <SectionFeed clientId={activeClient.id} />
          )}
          {activeSection === "phases" && (
            <SectionPhases clientId={activeClient.id} />
          )}
          {activeSection === "milestones" && (
            <SectionMilestones clientId={activeClient.id} />
          )}
          {activeSection === "okrs" && (
            <SectionOKRs clientId={activeClient.id} />
          )}
          {activeSection === "learnings" && (
            <SectionLearnings clientId={activeClient.id} />
          )}
          {activeSection === "scope" && (
            <SectionScope clientId={activeClient.id} />
          )}
          {activeSection === "resources" && (
            <SectionResources clientId={activeClient.id} />
          )}
          {activeSection === "digital_assets" && (
            <SectionDigitalAssets clientId={activeClient.id} />
          )}
          {activeSection === "backlog" && (
            <SectionBacklog clientId={activeClient.id} />
          )}
        </div>
      </main>
    </div>
  );
}
