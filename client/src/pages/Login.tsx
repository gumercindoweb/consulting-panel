import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  // Modo preview: con ?preview=1 NO redirige al dashboard/admin, para poder
  // diseñar la pantalla de login en vivo aunque el dev bypass autentique.
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("preview");

  useEffect(() => {
    if (isPreview) return;
    if (!loading && isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
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

        {/* Botón de acceso */}
        <div className="flex flex-col gap-4">
          <a
            href={getLoginUrl()}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 text-sm transition-all duration-300"
            style={{
              background: "var(--gj-green)",
              color: "var(--gj-cream)",
              borderRadius: "8px",
              letterSpacing: "3px",
              fontWeight: 600,
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--gj-green-bright)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 28px rgba(10,135,105,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--gj-green)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            ACCEDER AL PORTAL
          </a>
        </div>

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
