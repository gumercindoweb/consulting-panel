import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { verifyPassword } from "./_core/password";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createClient,
  createLearning,
  createMetric,
  createMilestone,
  createOkr,
  createPhase,
  createResource,
  createScopeItem,
  createUpdate,
  deleteLearning,
  deleteMetric,
  deleteMilestone,
  deleteOkr,
  deletePhase,
  deleteResource,
  deleteScopeItem,
  deleteUpdate,
  getAllClients,
  getClientAccessForUser,
  getClientById,
  getUserByEmail,
  getLearningsByClient,
  getMetricsByClient,
  getMilestonesByClient,
  getOkrsByClient,
  getPhasesByClient,
  getResourcesByClient,
  getScopeByClient,
  getUpdatesByClient,
  grantClientAccess,
  reorderLearnings,
  reorderMilestones,
  reorderOkrs,
  updateClient,
  updateLearning,
  updateMetric,
  updateMilestone,
  updateOkr,
  updatePhase,
  updateResource,
  updateScopeItem,
  updateUpdate,
} from "./db";

// ─── ADMIN GUARD ──────────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Solo el consultor puede acceder a esta área." });
  }
  return next({ ctx });
});

// ─── CLIENT GUARD ─────────────────────────────────────────────────────────────
// Returns the clientId the current user is allowed to access
async function assertClientAccess(userId: number, clientId: number) {
  const accesses = await getClientAccessForUser(userId);
  const allowed = accesses.some((a) => a.clientId === clientId);
  if (!allowed) {
    throw new TRPCError({ code: "FORBIDDEN", message: "No tenés acceso a este cliente." });
  }
}

// ─── ROUTERS ──────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),

    // Login por email + contraseña. Crea la sesión (cookie firmada) si las
    // credenciales son válidas. Mensaje genérico ante cualquier fallo para no
    // revelar si el email existe.
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email("Email inválido"),
          password: z.string().min(1, "Ingresá tu contraseña"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const invalid = new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email o contraseña incorrectos.",
        });

        const user = await getUserByEmail(input.email);
        if (!user || !user.passwordHash) throw invalid;

        const ok = await verifyPassword(input.password, user.passwordHash);
        if (!ok) throw invalid;

        // appId debe ser no-vacío para que verifySession acepte el token.
        // En local (sin OAuth) ENV.appId está vacío, usamos un fallback.
        const sessionToken = await sdk.signSession(
          {
            openId: user.openId,
            appId: ENV.appId || "consulting-panel",
            name: user.name || "",
          },
          { expiresInMs: ONE_YEAR_MS }
        );

        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, {
          ...cookieOptions,
          maxAge: ONE_YEAR_MS,
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── CLIENTS (admin only) ────────────────────────────────────────────────
  clients: router({
    list: adminProcedure.query(() => getAllClients()),

    get: adminProcedure.input(z.object({ id: z.number() })).query(({ input }) =>
      getClientById(input.id)
    ),

    create: adminProcedure
      .input(
        z.object({
          slug: z.string().min(2).max(64),
          name: z.string().min(2).max(255),
          description: z.string().optional(),
          logoUrl: z.string().optional(),
          branding: z
            .object({
              primaryColor: z.string(),
              accentColor: z.string(),
              backgroundColor: z.string(),
              textColor: z.string(),
              fontDisplay: z.string(),
              fontBody: z.string(),
              fontAccent: z.string().optional(),
            })
            .optional(),
          consultorName: z.string().optional(),
          startDate: z.date().optional(),
        })
      )
      .mutation(({ input }) => createClient(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          logoUrl: z.string().optional(),
          branding: z.any().optional(),
          consultorName: z.string().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updateClient(id, data);
      }),

    grantAccess: adminProcedure
      .input(z.object({ userId: z.number(), clientId: z.number() }))
      .mutation(({ input }) => grantClientAccess(input.userId, input.clientId)),

    // For the current logged-in client user: get their accessible clients
    myClients: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllClients();
      const accesses = await getClientAccessForUser(ctx.user.id);
      const clientIds = accesses.map((a) => a.clientId);
      const all = await getAllClients();
      return all.filter((c) => clientIds.includes(c.id));
    }),
  }),

  // ─── PHASES ──────────────────────────────────────────────────────────────
  phases: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        return getPhasesByClient(input.clientId);
      }),

    create: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          status: z.enum(["completed", "in_progress", "pending"]).default("pending"),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          order: z.number().default(0),
          color: z.string().optional(),
        })
      )
      .mutation(({ input }) => createPhase(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(["completed", "in_progress", "pending"]).optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          order: z.number().optional(),
          color: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return updatePhase(id, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePhase(input.id)),
  }),

  // ─── OKRs ────────────────────────────────────────────────────────────────
  okrs: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        return getOkrsByClient(input.clientId);
      }),

    create: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          phaseId: z.number().optional(),
          objective: z.string(),
          keyResult: z.string(),
          targetValue: z.string().optional(),
          currentValue: z.string().optional(),
          unit: z.string().optional(),
          progressPct: z.number().min(0).max(100).default(0),
          status: z.enum(["on_track", "at_risk", "off_track", "completed"]).default("on_track"),
          period: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) => createOkr(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number(),
          objective: z.string().optional(),
          keyResult: z.string().optional(),
          targetValue: z.string().optional(),
          currentValue: z.string().optional(),
          progressPct: z.number().min(0).max(100).optional(),
          status: z.enum(["on_track", "at_risk", "off_track", "completed"]).optional(),
          period: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, clientId, ...data } = input;
        return updateOkr(id, clientId, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number(), clientId: z.number() }))
      .mutation(({ input }) => deleteOkr(input.id, input.clientId)),

    reorder: adminProcedure
      .input(z.object({ clientId: z.number(), ids: z.array(z.number()) }))
      .mutation(({ input }) => reorderOkrs(input.clientId, input.ids)),
  }),

  // ─── MILESTONES ──────────────────────────────────────────────────────────
  milestones: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        return getMilestonesByClient(input.clientId);
      }),

    create: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          phaseId: z.number().optional(),
          title: z.string(),
          description: z.string().optional(),
          date: z.date(),
          status: z.enum(["completed", "in_progress", "pending"]).default("pending"),
          category: z
            .enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"])
            .default("other"),
          impact: z.enum(["high", "medium", "low"]).default("medium"),
        })
      )
      .mutation(({ input }) => createMilestone(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          date: z.date().optional(),
          status: z.enum(["completed", "in_progress", "pending"]).optional(),
          category: z
            .enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"])
            .optional(),
          impact: z.enum(["high", "medium", "low"]).optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, clientId, ...data } = input;
        return updateMilestone(id, clientId, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number(), clientId: z.number() }))
      .mutation(({ input }) => deleteMilestone(input.id, input.clientId)),

    reorder: adminProcedure
      .input(z.object({ clientId: z.number(), ids: z.array(z.number()) }))
      .mutation(({ input }) => reorderMilestones(input.clientId, input.ids)),
  }),

  // ─── LEARNINGS ───────────────────────────────────────────────────────────
  learnings: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        return getLearningsByClient(input.clientId);
      }),

    create: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          phaseId: z.number().optional(),
          type: z.enum(["learning", "obstacle", "win"]).default("learning"),
          title: z.string(),
          description: z.string(),
          resolution: z.string().optional(),
          date: z.date(),
          isResolved: z.boolean().default(false),
        })
      )
      .mutation(({ input }) => createLearning(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number(),
          type: z.enum(["learning", "obstacle", "win"]).optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          resolution: z.string().optional(),
          date: z.date().optional(),
          isResolved: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, clientId, ...data } = input;
        return updateLearning(id, clientId, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number(), clientId: z.number() }))
      .mutation(({ input }) => deleteLearning(input.id, input.clientId)),

    reorder: adminProcedure
      .input(z.object({ clientId: z.number(), ids: z.array(z.number()) }))
      .mutation(({ input }) => reorderLearnings(input.clientId, input.ids)),
  }),

  // ─── SCOPE ───────────────────────────────────────────────────────────────
  scope: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        return getScopeByClient(input.clientId);
      }),

    create: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          inScope: z.boolean().default(true),
          category: z.string().optional(),
          order: z.number().default(0),
        })
      )
      .mutation(({ input }) => createScopeItem(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          inScope: z.boolean().optional(),
          category: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, clientId, ...data } = input;
        return updateScopeItem(id, clientId, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number(), clientId: z.number() }))
      .mutation(({ input }) => deleteScopeItem(input.id, input.clientId)),
  }),

  // ─── RESOURCES ───────────────────────────────────────────────────────────
  resources: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        return getResourcesByClient(input.clientId);
      }),

    create: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          title: z.string(),
          description: z.string().optional(),
          category: z
            .enum(["document", "template", "script", "training", "guide", "other"])
            .default("other"),
          fileUrl: z.string().optional(),
          externalUrl: z.string().optional(),
          content: z.string().optional(),
          isPublic: z.boolean().default(true),
          order: z.number().default(0),
        })
      )
      .mutation(({ input }) => createResource(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          category: z
            .enum(["document", "template", "script", "training", "guide", "other"])
            .optional(),
          fileUrl: z.string().optional(),
          externalUrl: z.string().optional(),
          content: z.string().optional(),
          isPublic: z.boolean().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, clientId, ...data } = input;
        return updateResource(id, clientId, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number(), clientId: z.number() }))
      .mutation(({ input }) => deleteResource(input.id, input.clientId)),
  }),

  // ─── METRICS ─────────────────────────────────────────────────────────────
  metrics: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        return getMetricsByClient(input.clientId);
      }),

    create: adminProcedure
      .input(
        z.object({
          clientId: z.number(),
          name: z.string(),
          value: z.string(),
          previousValue: z.string().optional(),
          unit: z.string().optional(),
          trend: z.enum(["up", "down", "stable"]).default("stable"),
          description: z.string().optional(),
          period: z.string().optional(),
          order: z.number().default(0),
        })
      )
      .mutation(({ input }) => createMetric(input)),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          clientId: z.number(),
          name: z.string().optional(),
          value: z.string().optional(),
          previousValue: z.string().optional(),
          unit: z.string().optional(),
          trend: z.enum(["up", "down", "stable"]).optional(),
          description: z.string().optional(),
          period: z.string().optional(),
          order: z.number().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, clientId, ...data } = input;
        return updateMetric(id, clientId, data);
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number(), clientId: z.number() }))
      .mutation(({ input }) => deleteMetric(input.id, input.clientId)),
  }),

  // ─── UPDATES (Actualizaciones) ───────────────────────────────────────────
  updates: router({
    list: protectedProcedure
      .input(z.object({ clientId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
        const all = await getUpdatesByClient(input.clientId);
        if (ctx.user.role !== "admin") return all.filter((u) => u.isPublic === true);
        return all;
      }),

    create: adminProcedure
      .input(z.object({
        clientId: z.number(),
        phaseId: z.number().optional(),
        title: z.string().min(1).max(255),
        body: z.string().min(1),
        category: z.enum(["session", "result", "delivery", "insight", "blocker", "win", "general"]).default("general"),
        status: z.enum(["on_track", "at_risk", "blocked"]).default("on_track"),
        impact: z.enum(["high", "medium", "low"]).default("medium"),
        isPublic: z.boolean().default(true),
        date: z.string(),
      }))
      .mutation(({ input }) => {
        const { date, ...rest } = input;
        return createUpdate({ ...rest, date: new Date(date) });
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number(),
        title: z.string().optional(),
        body: z.string().optional(),
        category: z.enum(["session", "result", "delivery", "insight", "blocker", "win", "general"]).optional(),
        status: z.enum(["on_track", "at_risk", "blocked"]).optional(),
        impact: z.enum(["high", "medium", "low"]).optional(),
        isPublic: z.boolean().optional(),
        phaseId: z.number().optional(),
        date: z.string().optional(),
      }))
      .mutation(({ input }) => {
        const { id, clientId, date, ...rest } = input;
        return updateUpdate(id, clientId, { ...rest, ...(date ? { date: new Date(date) } : {}) });
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number(), clientId: z.number() }))
      .mutation(({ input }) => deleteUpdate(input.id, input.clientId)),
  }),
});

export type AppRouter = typeof appRouter;
