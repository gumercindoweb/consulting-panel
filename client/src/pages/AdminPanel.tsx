import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { Plus, Users, BarChart3, Settings, ExternalLink, ChevronRight } from "lucide-react";
import { toast } from "sonner";

function ClientCard({ client, onManage }: { client: any; onManage: () => void }) {
  const branding = client.branding as any;
  const primaryColor = branding?.primaryColor || "var(--gj-green)";

  return (
    <div
      className="gj-card p-6 cursor-pointer"
      onClick={onManage}
      style={{ borderLeft: `3px solid ${primaryColor}`, fontFamily: "var(--gj-font)" }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs tracking-widest mb-1" style={{ color: primaryColor, letterSpacing: "3px", fontWeight: 600 }}>
            CLIENTE
          </p>
          <h3 className="text-xl mb-1" style={{ color: "var(--gj-cream)", fontWeight: 700 }}>
            {client.name}
          </h3>
          {client.description && (
            <p className="text-sm" style={{ color: "var(--gj-muted)" }}>
              {client.description}
            </p>
          )}
          {client.startDate && (
            <p className="text-xs mt-2" style={{ color: "rgba(143,169,163,0.6)" }}>
              Desde {new Date(client.startDate).toLocaleDateString("es-AR", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
        <ChevronRight size={20} style={{ color: "var(--gj-muted)", flexShrink: 0 }} />
      </div>
    </div>
  );
}

function CreateClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    consultorName: "",
  });
  const createClient = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente creado correctamente.");
      onCreated();
      onClose();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md p-8"
        style={{
          background: "var(--gj-petrol-deep)",
          border: "1px solid rgba(154,230,180,0.14)",
          borderRadius: "10px",
          fontFamily: "var(--gj-font)",
        }}
      >
        <p className="gj-section-label mb-4">NUEVO CLIENTE</p>
        <h2 className="text-2xl mb-6" style={{ color: "var(--gj-cream)", fontWeight: 700 }}>
          Crear Cliente
        </h2>

        <div className="space-y-4">
          {[
            { key: "name", label: "NOMBRE DEL CLIENTE", placeholder: "Ej: Sensaciones de Tango" },
            { key: "slug", label: "IDENTIFICADOR (slug)", placeholder: "Ej: sensaciones-de-tango" },
            { key: "consultorName", label: "NOMBRE DEL CONSULTOR", placeholder: "Tu nombre" },
            { key: "description", label: "DESCRIPCIÓN", placeholder: "Breve descripción del proyecto" },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs tracking-widest block mb-2" style={{ color: "var(--gj-muted)", letterSpacing: "3px", fontWeight: 600 }}>
                {label}
              </label>
              <input
                type="text"
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-4 py-3 text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(154,230,180,0.14)",
                  borderRadius: "6px",
                  color: "var(--gj-cream)",
                  outline: "none",
                  fontFamily: "var(--gj-font)",
                }}
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-xs tracking-widest"
            style={{
              border: "1px solid rgba(154,230,180,0.16)",
              color: "var(--gj-muted)",
              borderRadius: "6px",
              background: "transparent",
              cursor: "pointer",
              letterSpacing: "3px",
              fontWeight: 600,
            }}
          >
            CANCELAR
          </button>
          <button
            onClick={() =>
              createClient.mutate({
                slug: form.slug || form.name.toLowerCase().replace(/\s+/g, "-"),
                name: form.name,
                description: form.description || undefined,
                consultorName: form.consultorName || undefined,
                branding: {
                  // Branding neutral por defecto — se personaliza luego por cliente.
                  primaryColor: "#3B6EA5",
                  accentColor: "#7FB2D9",
                  backgroundColor: "#0E1116",
                  textColor: "#F4F7F5",
                  fontDisplay: "Poppins",
                  fontBody: "Poppins",
                },
              })
            }
            disabled={!form.name || createClient.isPending}
            className="flex-1 py-3 text-xs tracking-widest"
            style={{
              background: form.name ? "var(--gj-green)" : "rgba(10,135,105,0.3)",
              color: "var(--gj-cream)",
              borderRadius: "6px",
              border: "none",
              cursor: form.name ? "pointer" : "not-allowed",
              letterSpacing: "3px",
              fontWeight: 600,
            }}
          >
            {createClient.isPending ? "CREANDO..." : "CREAR CLIENTE"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [showCreate, setShowCreate] = useState(false);

  const { data: clients = [], isLoading, refetch } = trpc.clients.list.useQuery(
    undefined,
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/login");
    if (!loading && isAuthenticated && user?.role !== "admin") navigate("/dashboard");
  }, [loading, isAuthenticated, user, navigate]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gj-petrol-ink)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gj-green)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--gj-petrol-ink)", fontFamily: "var(--gj-font)" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-8 py-5"
        style={{
          background: "rgba(6,26,25,0.97)",
          borderBottom: "1px solid rgba(154,230,180,0.10)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-4">
          <img src="/gj-logo.png" alt="Gumercindo Jiménez" style={{ height: 34, width: "auto" }} />
          <div style={{ borderLeft: "1px solid rgba(154,230,180,0.15)", paddingLeft: 16 }}>
            <p className="text-xs tracking-widest" style={{ color: "var(--gj-mint)", letterSpacing: "5px", fontWeight: 600 }}>
              PANEL DE ADMINISTRACIÓN
            </p>
            <h1 className="text-lg" style={{ color: "var(--gj-cream)", fontWeight: 700 }}>
              Gumercindo Jiménez · Consultoría
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs" style={{ color: "var(--gj-muted)" }}>
            {user?.name || user?.email}
          </span>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 text-xs tracking-widest px-5 py-2.5"
            style={{
              background: "var(--gj-green)",
              color: "var(--gj-cream)",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              letterSpacing: "3px",
              fontWeight: 600,
            }}
          >
            <Plus size={14} />
            NUEVO CLIENTE
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "CLIENTES ACTIVOS", value: clients.length, color: "var(--gj-green)", Icon: Users },
            { label: "PROYECTOS EN CURSO", value: clients.length, color: "var(--gj-mint)", Icon: BarChart3 },
            { label: "PANEL ACTIVO", value: "2026", color: "#7FB2D9", Icon: Settings },
          ].map((s) => {
            const Icon = s.Icon;
            return (
              <div key={s.label} className="gj-card p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Icon size={18} style={{ color: s.color }} />
                  <p className="text-xs tracking-widest" style={{ color: "var(--gj-muted)", letterSpacing: "3px", fontWeight: 600 }}>
                    {s.label}
                  </p>
                </div>
                <p className="text-3xl" style={{ color: s.color, fontWeight: 700 }}>
                  {s.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* Clients list */}
        <div>
          <p className="gj-section-label mb-6">CLIENTES</p>
          {clients.length === 0 ? (
            <div className="gj-card p-12 text-center">
              <p className="text-xl mb-3" style={{ color: "var(--gj-cream)", fontStyle: "italic" }}>
                Aún no hay clientes registrados.
              </p>
              <button
                onClick={() => setShowCreate(true)}
                className="text-xs tracking-widest px-6 py-3 mt-2"
                style={{
                  background: "var(--gj-green)",
                  color: "var(--gj-cream)",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  letterSpacing: "3px",
                  fontWeight: 600,
                }}
              >
                CREAR PRIMER CLIENTE
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onManage={() => navigate(`/admin/clients/${client.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
}
