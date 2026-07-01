import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { useLocation, useParams } from "wouter";

export default function AcceptInvite() {
  const params = useParams<{ token: string }>();
  const token = params.token ?? "";
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const { data: invite, isLoading } = trpc.invitations.getByToken.useQuery({ token }, { enabled: !!token });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ alreadyHadAccount: boolean } | null>(null);

  const acceptMutation = trpc.invitations.accept.useMutation({
    onSuccess: async (data) => {
      setResult(data);
      if (!data.alreadyHadAccount) {
        await utils.auth.me.invalidate();
        navigate("/dashboard");
      }
    },
    onError: (err) => setError(err.message || "No se pudo crear la cuenta."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    acceptMutation.mutate({ token, name: name.trim(), email: email.trim(), password });
  };

  const shellStyle: React.CSSProperties = {
    minHeight: "100vh",
    background: "radial-gradient(ellipse 90% 70% at 50% 30%, var(--gj-petrol) 0%, var(--gj-petrol-deep) 50%, var(--gj-petrol-ink) 100%)",
    fontFamily: "var(--gj-font)",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(154,230,180,0.12)",
    borderRadius: "10px",
    backdropFilter: "blur(8px)",
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(154,230,180,0.15)",
    borderRadius: "8px",
    color: "var(--gj-cream)",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center" style={shellStyle}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "var(--gj-green)" }} />
      </div>
    );
  }

  if (!invite?.valid) {
    const reasonText: Record<string, string> = {
      accepted: "Este link de invitación ya fue usado.",
      revoked: "Este link de invitación fue revocado.",
      not_found: "Este link de invitación no es válido.",
    };
    return (
      <div className="flex flex-col items-center justify-center px-6" style={shellStyle}>
        <div className="relative z-10 w-full max-w-md px-8 py-12 text-center animate-fade-up" style={cardStyle}>
          <img src="/gj-logo.png" alt="Gumercindo Jiménez" className="mx-auto mb-6" style={{ width: 180, height: "auto" }} />
          <p className="text-base" style={{ color: "var(--gj-cream)" }}>
            {reasonText[invite?.reason ?? "not_found"] ?? reasonText.not_found}
          </p>
          <p className="text-xs mt-3" style={{ color: "var(--gj-muted)" }}>
            Pedile a tu consultor que te genere un link nuevo.
          </p>
        </div>
      </div>
    );
  }

  if (result?.alreadyHadAccount) {
    return (
      <div className="flex flex-col items-center justify-center px-6" style={shellStyle}>
        <div className="relative z-10 w-full max-w-md px-8 py-12 text-center animate-fade-up" style={cardStyle}>
          <img src="/gj-logo.png" alt="Gumercindo Jiménez" className="mx-auto mb-6" style={{ width: 180, height: "auto" }} />
          <p className="text-base" style={{ color: "var(--gj-cream)" }}>
            Ya tenías una cuenta con ese correo — te dimos acceso a <b>{invite.clientName}</b>.
          </p>
          <p className="text-xs mt-3" style={{ color: "var(--gj-muted)" }}>
            Iniciá sesión con tu contraseña habitual.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 py-3 px-6 text-sm"
            style={{ background: "var(--gj-green)", color: "var(--gj-cream)", borderRadius: "8px", letterSpacing: "2px", border: "none", cursor: "pointer" }}
          >
            IR AL LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center relative overflow-hidden" style={shellStyle}>
      <div className="relative z-10 w-full max-w-md px-8 py-12 animate-fade-up" style={cardStyle}>
        <div className="text-center mb-8">
          <img src="/gj-logo.png" alt="Gumercindo Jiménez" className="mx-auto mb-6" style={{ width: 180, height: "auto" }} />
          <p className="text-xs mb-3" style={{ color: "var(--gj-mint)", letterSpacing: "6px", fontWeight: 500 }}>
            TE INVITARON A
          </p>
          <p className="text-lg" style={{ color: "var(--gj-cream)", fontWeight: 600 }}>
            {invite.clientName}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--gj-muted)" }}>
            Como {invite.accessLevel === "owner" ? "Dueño" : "Miembro del equipo"} — creá tu usuario para entrar.
          </p>
        </div>

        <div className="mb-8" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(154,230,180,0.25), transparent)" }} />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px", fontWeight: 500 }}>NOMBRE</label>
            <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" className="w-full py-3 px-4 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px", fontWeight: 500 }}>CORREO</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@correo.com" className="w-full py-3 px-4 text-sm outline-none" style={inputStyle} />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs" style={{ color: "var(--gj-mint)", letterSpacing: "2px", fontWeight: 500 }}>CONTRASEÑA</label>
            <input id="password" type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="w-full py-3 px-4 text-sm outline-none" style={inputStyle} />
          </div>

          {error && (
            <p className="text-xs text-center" style={{ color: "#f8a4a0", marginTop: 2 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={acceptMutation.isPending}
            className="flex items-center justify-center gap-3 w-full py-4 px-6 text-sm transition-all duration-300 mt-2"
            style={{
              background: "var(--gj-green)", color: "var(--gj-cream)", borderRadius: "8px",
              letterSpacing: "3px", fontWeight: 600, border: "none",
              cursor: acceptMutation.isPending ? "wait" : "pointer", opacity: acceptMutation.isPending ? 0.7 : 1,
            }}
          >
            {acceptMutation.isPending ? "CREANDO CUENTA…" : "CREAR MI CUENTA"}
          </button>
        </form>
      </div>
    </div>
  );
}
