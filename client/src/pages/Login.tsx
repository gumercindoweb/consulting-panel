import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Modo preview: con ?preview=1 NO redirige al dashboard/admin, para poder
  // diseñar la pantalla de login en vivo aunque haya sesión activa.
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("preview");

  const goToPanel = (role?: string) =>
    navigate(role === "admin" ? "/admin" : "/dashboard");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      await utils.auth.me.invalidate();
      goToPanel(data.role);
    },
    onError: (err) => {
      setError(err.message || "No se pudo iniciar sesión.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    loginMutation.mutate({ email: email.trim(), password });
  };

  useEffect(() => {
    if (isPreview) return;
    if (!loading && isAuthenticated) {
      goToPanel(user?.role);
    }
  }, [loading, isAuthenticated, user, navigate, isPreview]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--gj-petrol-ink)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gj-green)" }} />
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(ellipse 90% 70% at 50% 30%, var(--gj-petrol) 0%, var(--gj-petrol-deep) 50%, var(--gj-petrol-ink) 100%)",
        fontFamily: "var(--gj-font)",
      }}
    >
      {/* Glow de acento */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 35%, rgba(10,135,105,0.18) 0%, transparent 70%)",
        }}
      />

      {/* Círculos decorativos */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-[640px] h-[640px] rounded-full" style={{ border: "1px solid rgba(154,230,180,0.05)" }} />
        <div className="absolute w-[440px] h-[440px] rounded-full" style={{ border: "1px solid rgba(10,135,105,0.10)" }} />
        <div className="absolute w-[240px] h-[240px] rounded-full" style={{ border: "1px solid rgba(154,230,180,0.08)" }} />
      </div>

      {/* Tarjeta de login */}
      <div
        className="relative z-10 w-full max-w-md px-8 py-12 animate-fade-up"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(154,230,180,0.12)",
          borderRadius: "10px",
          backdropFilter: "blur(8px)",
        }}
      >
        {/* Logo (monograma GJ + nombre) */}
        <div className="text-center mb-10">
          <img
            src="/gj-logo.png"
            alt="Gumercindo Jiménez"
            className="mx-auto mb-6"
            style={{ width: 210, height: "auto" }}
          />

          <p
            className="text-xs mb-3"
            style={{ color: "var(--gj-mint)", letterSpacing: "6px", fontWeight: 500 }}
          >
            PORTAL DE CLIENTES
          </p>
          <p
            className="text-base"
            style={{ color: "var(--gj-muted)", fontWeight: 400 }}
          >
            El caos me busca.{" "}
            <span style={{ color: "var(--gj-mint)", fontStyle: "italic" }}>
              Yo lo convierto en método.
            </span>
          </p>
        </div>

        {/* Divisor */}
        <div
          className="mb-10"
          style={{
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(154,230,180,0.25), transparent)",
          }}
        />

        {/* Formulario de acceso */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-xs"
              style={{ color: "var(--gj-mint)", letterSpacing: "2px", fontWeight: 500 }}
            >
              CORREO
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full py-3 px-4 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(154,230,180,0.15)",
                borderRadius: "8px",
                color: "var(--gj-cream)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--gj-green)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(154,230,180,0.15)";
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-xs"
              style={{ color: "var(--gj-mint)", letterSpacing: "2px", fontWeight: 500 }}
            >
              CONTRASEÑA
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full py-3 px-4 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(154,230,180,0.15)",
                borderRadius: "8px",
                color: "var(--gj-cream)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--gj-green)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(154,230,180,0.15)";
              }}
            />
          </div>

          {error && (
            <p
              className="text-xs text-center"
              style={{ color: "#f8a4a0", marginTop: 2 }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 text-sm transition-all duration-300 mt-2"
            style={{
              background: "var(--gj-green)",
              color: "var(--gj-cream)",
              borderRadius: "8px",
              letterSpacing: "3px",
              fontWeight: 600,
              border: "none",
              cursor: loginMutation.isPending ? "wait" : "pointer",
              opacity: loginMutation.isPending ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (loginMutation.isPending) return;
              (e.currentTarget as HTMLElement).style.background = "var(--gj-green-bright)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(10,135,105,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--gj-green)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            {loginMutation.isPending ? "INGRESANDO…" : "ACCEDER AL PORTAL"}
          </button>
        </form>

        {/* Nota al pie */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: "var(--gj-muted)", lineHeight: 1.6 }}
        >
          Acceso exclusivo para clientes y colaboradores.
          <br />
          Si no tenés acceso, contactá a tu consultor.
        </p>
      </div>

      {/* Firma inferior */}
      <div className="relative z-10 mt-8 text-center">
        <p className="text-xs" style={{ color: "var(--gj-muted)", letterSpacing: "4px", fontWeight: 500 }}>
          GUMERCINDO JIMÉNEZ · CONSULTORÍA
        </p>
      </div>
    </div>
  );
}
