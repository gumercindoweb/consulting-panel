import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Login() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [loading, isAuthenticated, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--noir)" }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--rojo)" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "var(--noir)" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(43,10,18,0.8) 0%, transparent 70%)",
        }}
      />

      {/* Decorative circles */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="absolute w-[600px] h-[600px] rounded-full" style={{ border: "1px solid rgba(217,164,65,0.06)" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full" style={{ border: "1px solid rgba(179,40,37,0.08)" }} />
        <div className="absolute w-[200px] h-[200px] rounded-full" style={{ border: "1px solid rgba(217,164,65,0.1)" }} />
      </div>

      {/* Login card */}
      <div
        className="relative z-10 w-full max-w-md px-8 py-12 animate-fade-up"
        style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "4px",
        }}
      >
        {/* Header */}
        <div className="text-center mb-10">
          <p
            className="font-label text-xs tracking-widest mb-4"
            style={{ color: "var(--ambar)", letterSpacing: "6px" }}
          >
            PORTAL DE CLIENTES
          </p>
          <h1
            className="font-display text-4xl font-bold mb-3"
            style={{ color: "var(--creme)", lineHeight: 1.1 }}
          >
            Consultoría
            <br />
            <em style={{ color: "var(--rojo-vivo)", fontStyle: "italic" }}>Estratégica</em>
          </h1>
          <p
            className="font-serif text-base"
            style={{ color: "var(--oro-pale)", fontStyle: "italic" }}
          >
            Tu proyecto, en tiempo real.
          </p>
        </div>

        {/* Divider */}
        <div className="sdt-divider mb-10" />

        {/* Login button */}
        <div className="flex flex-col gap-4">
          <a
            href={getLoginUrl()}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 font-label tracking-widest text-sm transition-all duration-300"
            style={{
              background: "var(--rojo)",
              color: "var(--creme)",
              borderRadius: "3px",
              letterSpacing: "3px",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--rojo-vivo)";
              (e.currentTarget as HTMLElement).style.boxShadow = "var(--glow-red)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "var(--rojo)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            ACCEDER AL PORTAL
          </a>
        </div>

        {/* Footer note */}
        <p
          className="text-center text-xs mt-8"
          style={{ color: "var(--gris)", fontFamily: "var(--font-body)" }}
        >
          Acceso exclusivo para clientes y colaboradores.
          <br />
          Si no tenés acceso, contactá a tu consultor.
        </p>
      </div>

      {/* Bottom line */}
      <div className="relative z-10 mt-8 text-center">
        <p className="font-label text-xs tracking-widest" style={{ color: "var(--gris)", letterSpacing: "4px" }}>
          GUMERCINDO JIMÉNEZ · CONSULTORÍA ESTRATÉGICA
        </p>
      </div>
    </div>
  );
}
