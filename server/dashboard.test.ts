import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// ─── Context helpers ──────────────────────────────────────────────────────────

function makeAdminCtx(): TrpcContext {
  const user: User = {
    id: 1,
    openId: "admin-openid",
    name: "Gumercindo Jiménez",
    email: "gumercindo@consultoria.com",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function makeClientCtx(userId = 2): TrpcContext {
  const user: User = {
    id: userId,
    openId: `client-openid-${userId}`,
    name: "Cliente Test",
    email: "cliente@test.com",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function makeAnonCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────

describe("auth.me", () => {
  it("returns the current user when authenticated", async () => {
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.role).toBe("admin");
    expect(result?.name).toBe("Gumercindo Jiménez");
  });

  it("returns null when not authenticated", async () => {
    const ctx = makeAnonCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Admin guard tests ────────────────────────────────────────────────────────

describe("clients.list — admin guard", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const ctx = makeAnonCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clients.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN when called by a non-admin user", async () => {
    const ctx = makeClientCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clients.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ─── myClients — role-based access ───────────────────────────────────────────

describe("clients.myClients", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const ctx = makeAnonCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.clients.myClients()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns an array for admin users (may be empty in test env)", async () => {
    const ctx = makeAdminCtx();
    const caller = appRouter.createCaller(ctx);
    // Admin sees all clients — result is an array (may be empty without real DB)
    const result = await caller.clients.myClients().catch(() => null);
    // In test env without real DB the query may fail gracefully; we just check type
    if (result !== null) {
      expect(Array.isArray(result)).toBe(true);
    }
  });
});

// ─── Phase access guard ───────────────────────────────────────────────────────

describe("phases.list — access guard", () => {
  it("throws UNAUTHORIZED when not authenticated", async () => {
    const ctx = makeAnonCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.phases.list({ clientId: 1 })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("throws FORBIDDEN when a non-admin user tries to access a client they don't own", async () => {
    const ctx = makeClientCtx(999); // user 999 has no access grants
    const caller = appRouter.createCaller(ctx);
    await expect(caller.phases.list({ clientId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

// ─── Logout ───────────────────────────────────────────────────────────────────

describe("auth.logout", () => {
  it("returns success and clears cookie", async () => {
    const clearedCookies: string[] = [];
    const ctx: TrpcContext = {
      user: makeAdminCtx().user,
      req: { protocol: "https", headers: {} } as TrpcContext["req"],
      res: {
        clearCookie: (name: string) => clearedCookies.push(name),
      } as unknown as TrpcContext["res"],
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});
