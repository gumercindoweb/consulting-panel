var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      // Auto-login como admin de desarrollo (sin pasar por el login real).
      // Apagado por defecto: así se puede probar el acceso por email+clave.
      // Activar con DEV_AUTOLOGIN=1 en .env si querés la comodidad del bypass.
      devAutoLogin: process.env.DEV_AUTOLOGIN === "1",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      // Asistente IA — proveedor compatible con OpenAI (Groq, Google Gemini, OpenRouter…).
      // Gratuito: se crea una API key en el proveedor y se setean estas 3 variables en
      // Vercel. AI_API_URL es la base hasta antes de /chat/completions.
      //   Groq:   AI_API_URL=https://api.groq.com/openai/v1   AI_MODEL=llama-3.3-70b-versatile
      //   Gemini: AI_API_URL=https://generativelanguage.googleapis.com/v1beta/openai   AI_MODEL=gemini-2.0-flash
      aiApiUrl: process.env.AI_API_URL ?? "",
      aiApiKey: process.env.AI_API_KEY ?? "",
      aiModel: process.env.AI_MODEL ?? "llama-3.3-70b-versatile",
      supabaseUrl: process.env.SUPABASE_URL ?? "",
      supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? ""
    };
  }
});

// drizzle/schema.ts
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core";
var roleEnum, phaseStatusEnum, okrStatusEnum, milestoneStatusEnum, milestoneCategoryEnum, impactEnum, learningTypeEnum, resourceCategoryEnum, digitalAssetCategoryEnum, trendEnum, updateCategoryEnum, updateStatusEnum, users, clients, clientAccess, projectPhases, okrs, milestones, learnings, scopeItems, resources, digitalAssets, metrics, projectUpdates, backlogItems;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["user", "admin"]);
    phaseStatusEnum = pgEnum("phase_status", ["completed", "in_progress", "pending"]);
    okrStatusEnum = pgEnum("okr_status", ["on_track", "at_risk", "off_track", "completed"]);
    milestoneStatusEnum = pgEnum("milestone_status", ["completed", "in_progress", "pending"]);
    milestoneCategoryEnum = pgEnum("milestone_category", ["strategy", "implementation", "training", "automation", "content", "analytics", "other"]);
    impactEnum = pgEnum("impact", ["high", "medium", "low"]);
    learningTypeEnum = pgEnum("learning_type", ["learning", "obstacle", "win"]);
    resourceCategoryEnum = pgEnum("resource_category", ["document", "template", "script", "training", "guide", "other"]);
    digitalAssetCategoryEnum = pgEnum("digital_asset_category", ["webpage", "design_system", "tool", "document", "brand_asset", "other"]);
    trendEnum = pgEnum("trend", ["up", "down", "stable"]);
    updateCategoryEnum = pgEnum("update_category", ["session", "result", "delivery", "insight", "blocker", "win", "general"]);
    updateStatusEnum = pgEnum("update_status", ["on_track", "at_risk", "blocked", "completed"]);
    users = pgTable("users", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      passwordHash: varchar("passwordHash", { length: 255 }),
      role: roleEnum("role").default("user").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
    });
    clients = pgTable("clients", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      slug: varchar("slug", { length: 64 }).notNull().unique(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      logoUrl: text("logoUrl"),
      coverImageUrl: text("coverImageUrl"),
      branding: json("branding").$type(),
      consultorName: varchar("consultorName", { length: 255 }),
      startDate: timestamp("startDate"),
      isActive: boolean("isActive").default(true).notNull(),
      visibleSections: json("visibleSections").$type(),
      // Secciones "confidenciales" habilitadas para los usuarios nivel "member"
      // (empleados del cliente) de este cliente. Compartido por todos los
      // miembros — no es 1x1 todavía (queda como evolución futura: ver
      // clientAccess.accessLevel para el campo que ya distingue cada usuario).
      memberVisibleSections: json("memberVisibleSections").$type(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    clientAccess = pgTable("client_access", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      userId: integer("userId").notNull(),
      clientId: integer("clientId").notNull(),
      // "owner": el cliente principal, ve todo lo habilitado para el cliente.
      // "member": empleado del cliente, además filtrado por memberVisibleSections.
      accessLevel: varchar("accessLevel", { length: 16 }).default("owner").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    projectPhases = pgTable("project_phases", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      description: text("description"),
      status: phaseStatusEnum("status").default("pending").notNull(),
      startDate: timestamp("startDate"),
      endDate: timestamp("endDate"),
      order: integer("order").default(0).notNull(),
      color: varchar("color", { length: 32 }),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    okrs = pgTable("okrs", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      phaseId: integer("phaseId"),
      objective: text("objective").notNull(),
      keyResult: text("keyResult").notNull(),
      targetValue: varchar("targetValue", { length: 128 }),
      currentValue: varchar("currentValue", { length: 128 }),
      unit: varchar("unit", { length: 64 }),
      progressPct: integer("progressPct").default(0).notNull(),
      status: okrStatusEnum("status").default("on_track").notNull(),
      period: varchar("period", { length: 64 }),
      notes: text("notes"),
      sortOrder: integer("sortOrder"),
      isPaused: boolean("isPaused").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    milestones = pgTable("milestones", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      phaseId: integer("phaseId"),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      date: timestamp("date").notNull(),
      status: milestoneStatusEnum("status").default("pending").notNull(),
      category: milestoneCategoryEnum("category").default("other").notNull(),
      impact: impactEnum("impact").default("medium").notNull(),
      resultType: updateCategoryEnum("resultType"),
      sortOrder: integer("sortOrder"),
      isPaused: boolean("isPaused").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    learnings = pgTable("learnings", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      phaseId: integer("phaseId"),
      type: learningTypeEnum("type").default("learning").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description").notNull(),
      resolution: text("resolution"),
      date: timestamp("date").notNull(),
      isResolved: boolean("isResolved").default(false).notNull(),
      sortOrder: integer("sortOrder"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    scopeItems = pgTable("scope_items", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      inScope: boolean("inScope").default(true).notNull(),
      category: varchar("category", { length: 128 }),
      order: integer("order").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    resources = pgTable("resources", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      category: resourceCategoryEnum("category").default("other").notNull(),
      area: varchar("area", { length: 64 }),
      areas: text("areas").array(),
      fileUrl: text("fileUrl"),
      // Varios archivos por recurso (ej. slides + handout + video de una misma
      // capacitación). fileUrl queda solo por compat de lectura — los recursos
      // nuevos escriben acá.
      fileUrls: json("fileUrls").$type(),
      externalUrl: text("externalUrl"),
      content: text("content"),
      isPublic: boolean("isPublic").default(true).notNull(),
      order: integer("order").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    digitalAssets = pgTable("digital_assets", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      category: digitalAssetCategoryEnum("category").default("other").notNull(),
      externalUrl: text("externalUrl"),
      fileUrl: text("fileUrl"),
      notes: text("notes"),
      isPublic: boolean("isPublic").default(true).notNull(),
      order: integer("order").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    metrics = pgTable("metrics", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      name: varchar("name", { length: 255 }).notNull(),
      value: varchar("value", { length: 128 }).notNull(),
      previousValue: varchar("previousValue", { length: 128 }),
      unit: varchar("unit", { length: 64 }),
      trend: trendEnum("trend").default("stable").notNull(),
      description: text("description"),
      period: varchar("period", { length: 64 }),
      order: integer("order").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    projectUpdates = pgTable("project_updates", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      phaseId: integer("phaseId"),
      milestoneId: integer("milestoneId"),
      title: varchar("title", { length: 255 }).notNull(),
      body: text("body").notNull(),
      category: updateCategoryEnum("category").default("general").notNull(),
      status: updateStatusEnum("status").default("on_track").notNull(),
      impact: impactEnum("impact").default("medium").notNull(),
      isPublic: boolean("isPublic").default(true).notNull(),
      date: timestamp("date").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
    backlogItems = pgTable("backlog_items", {
      id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
      clientId: integer("clientId").notNull(),
      title: varchar("title", { length: 255 }).notNull(),
      description: text("description"),
      status: varchar("status", { length: 32 }).notNull().default("idea"),
      priority: varchar("priority", { length: 16 }).notNull().default("media"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().notNull()
    });
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  createBacklogItem: () => createBacklogItem,
  createClient: () => createClient,
  createDigitalAsset: () => createDigitalAsset,
  createLearning: () => createLearning,
  createMetric: () => createMetric,
  createMilestone: () => createMilestone,
  createOkr: () => createOkr,
  createPhase: () => createPhase,
  createResource: () => createResource,
  createScopeItem: () => createScopeItem,
  createUpdate: () => createUpdate,
  createUserWithPassword: () => createUserWithPassword,
  deleteBacklogItem: () => deleteBacklogItem,
  deleteDigitalAsset: () => deleteDigitalAsset,
  deleteLearning: () => deleteLearning,
  deleteMetric: () => deleteMetric,
  deleteMilestone: () => deleteMilestone,
  deleteOkr: () => deleteOkr,
  deletePhase: () => deletePhase,
  deleteResource: () => deleteResource,
  deleteScopeItem: () => deleteScopeItem,
  deleteUpdate: () => deleteUpdate,
  getAllClients: () => getAllClients,
  getBacklogByClient: () => getBacklogByClient,
  getClientAccessForUser: () => getClientAccessForUser,
  getClientById: () => getClientById,
  getClientBySlug: () => getClientBySlug,
  getDb: () => getDb,
  getDigitalAssetsByClient: () => getDigitalAssetsByClient,
  getLearningsByClient: () => getLearningsByClient,
  getMetricsByClient: () => getMetricsByClient,
  getMilestonesByClient: () => getMilestonesByClient,
  getOkrsByClient: () => getOkrsByClient,
  getPhasesByClient: () => getPhasesByClient,
  getResourcesByClient: () => getResourcesByClient,
  getScopeByClient: () => getScopeByClient,
  getUpdatesByClient: () => getUpdatesByClient,
  getUserByEmail: () => getUserByEmail,
  getUserByOpenId: () => getUserByOpenId,
  getUsersWithAccessToClient: () => getUsersWithAccessToClient,
  grantClientAccess: () => grantClientAccess,
  pauseMilestone: () => pauseMilestone,
  pauseOkr: () => pauseOkr,
  reorderLearnings: () => reorderLearnings,
  reorderMilestones: () => reorderMilestones,
  reorderOkrs: () => reorderOkrs,
  revokeClientAccess: () => revokeClientAccess,
  setAccessLevel: () => setAccessLevel,
  updateBacklogItem: () => updateBacklogItem,
  updateClient: () => updateClient,
  updateDigitalAsset: () => updateDigitalAsset,
  updateLearning: () => updateLearning,
  updateMetric: () => updateMetric,
  updateMilestone: () => updateMilestone,
  updateOkr: () => updateOkr,
  updatePhase: () => updatePhase,
  updateResource: () => updateResource,
  updateScopeItem: () => updateScopeItem,
  updateUpdate: () => updateUpdate,
  upsertUser: () => upsertUser
});
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { randomBytes as randomBytes2 } from "node:crypto";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, {
        ssl: "require",
        max: 1
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  textFields.forEach((field) => {
    const value = user[field];
    if (value === void 0) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });
  if (user.lastSignedIn !== void 0) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  const existing = await db.select().from(users).where(eq(users.openId, values.openId)).limit(1);
  if (existing.length > 0) {
    await db.update(users).set(updateSet).where(eq(users.openId, values.openId));
  } else {
    await db.insert(users).values(values);
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getUserByEmail(email) {
  const db = await getDb();
  if (!db) return void 0;
  const normalized = email.trim().toLowerCase();
  const result = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllClients() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.isActive, true)).orderBy(asc(clients.name));
}
async function getClientById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}
async function getClientBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
  return result[0];
}
async function createClient(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(clients).values(data).returning();
  return result[0]?.id || 0;
}
async function updateClient(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(clients).set(data).where(eq(clients.id, id));
}
async function getClientAccessForUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientAccess).where(eq(clientAccess.userId, userId));
}
async function grantClientAccess(userId, clientId, accessLevel = "owner") {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(clientAccess).where(and(eq(clientAccess.userId, userId), eq(clientAccess.clientId, clientId))).limit(1);
  if (existing.length === 0) {
    await db.insert(clientAccess).values({ userId, clientId, accessLevel });
  }
}
async function setAccessLevel(userId, clientId, accessLevel) {
  const db = await getDb();
  if (!db) return;
  await db.update(clientAccess).set({ accessLevel }).where(and(eq(clientAccess.userId, userId), eq(clientAccess.clientId, clientId)));
}
async function getUsersWithAccessToClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  const accesses = await db.select().from(clientAccess).where(eq(clientAccess.clientId, clientId));
  if (accesses.length === 0) return [];
  const userIds = accesses.map((a) => a.userId);
  const userRows = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    role: users.role,
    createdAt: users.createdAt,
    accessId: clientAccess.id,
    accessLevel: clientAccess.accessLevel
  }).from(users).innerJoin(clientAccess, and(eq(clientAccess.userId, users.id), eq(clientAccess.clientId, clientId))).where(inArray(users.id, userIds));
  return userRows;
}
async function createUserWithPassword(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const openId = `pwd_${randomBytes2(16).toString("hex")}`;
  const result = await db.insert(users).values({
    openId,
    email: data.email.trim().toLowerCase(),
    passwordHash: data.passwordHash,
    name: data.name,
    loginMethod: "password",
    role: "user"
  }).returning();
  return result[0].id;
}
async function revokeClientAccess(userId, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(clientAccess).where(and(eq(clientAccess.userId, userId), eq(clientAccess.clientId, clientId)));
}
async function getPhasesByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectPhases).where(eq(projectPhases.clientId, clientId)).orderBy(asc(projectPhases.order));
}
async function createPhase(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(projectPhases).values(data).returning();
  return result[0]?.id || 0;
}
async function updatePhase(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(projectPhases).set(data).where(eq(projectPhases.id, id));
}
async function deletePhase(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectPhases).where(eq(projectPhases.id, id));
}
async function getOkrsByClient(clientId, includePaused = false) {
  const db = await getDb();
  if (!db) return [];
  const where = includePaused ? eq(okrs.clientId, clientId) : and(eq(okrs.clientId, clientId), eq(okrs.isPaused, false));
  return db.select().from(okrs).where(where).orderBy(asc(okrs.sortOrder), asc(okrs.createdAt));
}
async function pauseOkr(id, clientId, isPaused) {
  const db = await getDb();
  if (!db) return;
  await db.update(okrs).set({ isPaused }).where(and(eq(okrs.id, id), eq(okrs.clientId, clientId)));
}
async function reorderOkrs(clientId, ids) {
  const db = await getDb();
  if (!db) return;
  await Promise.all(ids.map(
    (id, index) => db.update(okrs).set({ sortOrder: index }).where(and(eq(okrs.id, id), eq(okrs.clientId, clientId)))
  ));
}
async function createOkr(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(okrs).values(data).returning();
  return result[0]?.id || 0;
}
async function updateOkr(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(okrs).set(data).where(and(eq(okrs.id, id), eq(okrs.clientId, clientId)));
}
async function deleteOkr(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(okrs).where(and(eq(okrs.id, id), eq(okrs.clientId, clientId)));
}
async function getMilestonesByClient(clientId, includePaused = false) {
  const db = await getDb();
  if (!db) return [];
  const where = includePaused ? eq(milestones.clientId, clientId) : and(eq(milestones.clientId, clientId), eq(milestones.isPaused, false));
  return db.select().from(milestones).where(where).orderBy(asc(milestones.sortOrder), asc(milestones.date));
}
async function pauseMilestone(id, clientId, isPaused) {
  const db = await getDb();
  if (!db) return;
  await db.update(milestones).set({ isPaused }).where(and(eq(milestones.id, id), eq(milestones.clientId, clientId)));
}
async function reorderMilestones(clientId, ids) {
  const db = await getDb();
  if (!db) return;
  await Promise.all(ids.map(
    (id, index) => db.update(milestones).set({ sortOrder: index }).where(and(eq(milestones.id, id), eq(milestones.clientId, clientId)))
  ));
}
async function createMilestone(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(milestones).values(data).returning();
  return result[0]?.id || 0;
}
async function updateMilestone(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(milestones).set(data).where(and(eq(milestones.id, id), eq(milestones.clientId, clientId)));
}
async function deleteMilestone(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(milestones).where(and(eq(milestones.id, id), eq(milestones.clientId, clientId)));
}
async function getLearningsByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(learnings).where(eq(learnings.clientId, clientId)).orderBy(asc(learnings.sortOrder), asc(learnings.date));
}
async function reorderLearnings(clientId, ids) {
  const db = await getDb();
  if (!db) return;
  await Promise.all(ids.map(
    (id, index) => db.update(learnings).set({ sortOrder: index }).where(and(eq(learnings.id, id), eq(learnings.clientId, clientId)))
  ));
}
async function createLearning(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(learnings).values(data).returning();
  return result[0]?.id || 0;
}
async function updateLearning(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(learnings).set(data).where(and(eq(learnings.id, id), eq(learnings.clientId, clientId)));
}
async function deleteLearning(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(learnings).where(and(eq(learnings.id, id), eq(learnings.clientId, clientId)));
}
async function getScopeByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scopeItems).where(eq(scopeItems.clientId, clientId)).orderBy(asc(scopeItems.order));
}
async function createScopeItem(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(scopeItems).values(data).returning();
  return result[0]?.id || 0;
}
async function updateScopeItem(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(scopeItems).set(data).where(and(eq(scopeItems.id, id), eq(scopeItems.clientId, clientId)));
}
async function deleteScopeItem(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(scopeItems).where(and(eq(scopeItems.id, id), eq(scopeItems.clientId, clientId)));
}
async function getResourcesByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).where(eq(resources.clientId, clientId)).orderBy(asc(resources.order));
}
async function createResource(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(resources).values(data).returning();
  return result[0]?.id || 0;
}
async function updateResource(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(resources).set(data).where(and(eq(resources.id, id), eq(resources.clientId, clientId)));
}
async function deleteResource(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(resources).where(and(eq(resources.id, id), eq(resources.clientId, clientId)));
}
async function getDigitalAssetsByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(digitalAssets).where(eq(digitalAssets.clientId, clientId)).orderBy(asc(digitalAssets.order));
}
async function createDigitalAsset(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(digitalAssets).values(data).returning();
  return result[0]?.id || 0;
}
async function updateDigitalAsset(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(digitalAssets).set(data).where(and(eq(digitalAssets.id, id), eq(digitalAssets.clientId, clientId)));
}
async function deleteDigitalAsset(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(digitalAssets).where(and(eq(digitalAssets.id, id), eq(digitalAssets.clientId, clientId)));
}
async function getMetricsByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(metrics).where(eq(metrics.clientId, clientId)).orderBy(asc(metrics.order));
}
async function createMetric(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(metrics).values(data).returning();
  return result[0]?.id || 0;
}
async function updateMetric(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(metrics).set(data).where(and(eq(metrics.id, id), eq(metrics.clientId, clientId)));
}
async function deleteMetric(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(metrics).where(and(eq(metrics.id, id), eq(metrics.clientId, clientId)));
}
async function getUpdatesByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectUpdates).where(eq(projectUpdates.clientId, clientId)).orderBy(desc(projectUpdates.date));
}
async function createUpdate(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(projectUpdates).values(data).returning();
  return result[0]?.id || 0;
}
async function updateUpdate(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(projectUpdates).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(projectUpdates.id, id), eq(projectUpdates.clientId, clientId)));
}
async function deleteUpdate(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectUpdates).where(and(eq(projectUpdates.id, id), eq(projectUpdates.clientId, clientId)));
}
async function getBacklogByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(backlogItems).where(eq(backlogItems.clientId, clientId)).orderBy(desc(backlogItems.createdAt));
}
async function createBacklogItem(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(backlogItems).values(data).returning();
  return result[0]?.id || 0;
}
async function updateBacklogItem(id, clientId, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(backlogItems).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(and(eq(backlogItems.id, id), eq(backlogItems.clientId, clientId)));
}
async function deleteBacklogItem(id, clientId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(backlogItems).where(and(eq(backlogItems.id, id), eq(backlogItems.clientId, clientId)));
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/serverless.ts
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z3 } from "zod";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
var MEMBER_GATED_SECTIONS = [
  "resources",
  "digital_assets",
  "backlog",
  "okrs",
  "updates"
];

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: secure ? "none" : "lax",
    secure
  };
}

// server/routers.ts
init_env();

// server/_core/password.ts
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
var scryptAsync = promisify(scrypt);
var KEYLEN = 64;
var SALT_BYTES = 16;
async function hashPassword(plain) {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scryptAsync(plain, salt, KEYLEN);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}
async function verifyPassword(plain, stored) {
  if (!stored) return false;
  const parts = stored.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEYLEN) return false;
  const derived = await scryptAsync(plain, salt, KEYLEN);
  return timingSafeEqual(derived, expected);
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    if (session.openId.startsWith(CRON_OPEN_ID_PREFIX)) {
      const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
      const taskUid = userInfo.taskUid ?? null;
      if (!taskUid) {
        throw ForbiddenError("Cron session missing task_uid");
      }
      return buildCronUser(userInfo);
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var CRON_OPEN_ID_PREFIX = "cron_";
function buildCronUser(userInfo) {
  const now = /* @__PURE__ */ new Date();
  return {
    id: -1,
    openId: userInfo.openId,
    name: userInfo.name || "Manus Scheduled Task",
    email: null,
    loginMethod: null,
    role: "user",
    createdAt: now,
    updatedAt: now,
    lastSignedIn: now,
    taskUid: userInfo.taskUid ?? void 0,
    isCron: true
  };
}
var sdk = new SDKServer();

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/ai.ts
import { z as z2 } from "zod";

// server/_core/anthropic.ts
init_env();
var resolveBaseUrl = () => (ENV.aiApiUrl ?? "").trim().replace(/\/$/, "");
var sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function invokeChat(params) {
  const base = resolveBaseUrl();
  if (!base) {
    throw new Error(
      "El asistente IA no est\xE1 configurado. Falta la variable AI_API_URL en Vercel."
    );
  }
  if (!ENV.aiApiKey) {
    throw new Error(
      "El asistente IA no est\xE1 configurado. Falta la variable AI_API_KEY en Vercel."
    );
  }
  const body = JSON.stringify({
    model: params.model ?? ENV.aiModel,
    max_tokens: params.maxTokens ?? 4096,
    messages: [
      { role: "system", content: params.system },
      ...params.messages
    ],
    response_format: { type: "json_object" }
  });
  const url = `${base}/chat/completions`;
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${ENV.aiApiKey}`
  };
  let lastError;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content ?? "";
      }
      if (res.status !== 429 && res.status < 500) {
        const errText = await res.text();
        throw new Error(`IA API ${res.status}: ${errText}`);
      }
      if (attempt === 3) {
        const errText = await res.text();
        throw new Error(`IA API ${res.status} tras reintentos: ${errText}`);
      }
      await sleep(500 * 2 ** attempt + Math.random() * 250);
    } catch (error) {
      lastError = error;
      if (error instanceof Error && error.message.startsWith("IA API 4")) {
        throw error;
      }
      if (attempt === 3) break;
      await sleep(500 * 2 ** attempt + Math.random() * 250);
    }
  }
  throw lastError instanceof Error ? lastError : new Error("La llamada a la IA fall\xF3 tras varios reintentos.");
}

// server/ai.ts
init_db();
var dateStr = z2.string().min(4);
var createPhaseData = z2.object({
  name: z2.string().min(1),
  description: z2.string().optional(),
  status: z2.enum(["completed", "in_progress", "pending"]).optional(),
  startDate: dateStr.optional(),
  endDate: dateStr.optional()
});
var updatePhaseData = z2.object({
  id: z2.number(),
  name: z2.string().optional(),
  description: z2.string().optional(),
  status: z2.enum(["completed", "in_progress", "pending"]).optional(),
  startDate: dateStr.optional(),
  endDate: dateStr.optional()
});
var createMilestoneData = z2.object({
  phaseId: z2.number().nullable().optional(),
  title: z2.string().min(1),
  description: z2.string().optional(),
  date: dateStr,
  status: z2.enum(["completed", "in_progress", "pending"]).optional(),
  category: z2.enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"]).optional(),
  impact: z2.enum(["high", "medium", "low"]).optional()
});
var updateMilestoneData = z2.object({
  id: z2.number(),
  phaseId: z2.number().nullable().optional(),
  title: z2.string().optional(),
  description: z2.string().optional(),
  date: dateStr.optional(),
  status: z2.enum(["completed", "in_progress", "pending"]).optional(),
  category: z2.enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"]).optional(),
  impact: z2.enum(["high", "medium", "low"]).optional()
});
var createUpdateData = z2.object({
  phaseId: z2.number().nullable().optional(),
  milestoneId: z2.number().nullable().optional(),
  title: z2.string().min(1),
  body: z2.string().min(1),
  category: z2.enum(["session", "result", "delivery", "insight", "blocker", "win", "general"]).optional(),
  status: z2.enum(["on_track", "at_risk", "blocked", "completed"]).optional(),
  impact: z2.enum(["high", "medium", "low"]).optional(),
  date: dateStr,
  isPublic: z2.boolean().optional()
});
var createOkrData = z2.object({
  phaseId: z2.number().nullable().optional(),
  objective: z2.string().min(1),
  keyResult: z2.string().min(1),
  targetValue: z2.string().optional(),
  currentValue: z2.string().optional(),
  unit: z2.string().optional(),
  progressPct: z2.number().min(0).max(100).optional(),
  status: z2.enum(["on_track", "at_risk", "off_track", "completed"]).optional(),
  period: z2.string().optional(),
  notes: z2.string().optional()
});
var updateOkrData = z2.object({
  id: z2.number(),
  objective: z2.string().optional(),
  keyResult: z2.string().optional(),
  targetValue: z2.string().optional(),
  currentValue: z2.string().optional(),
  progressPct: z2.number().min(0).max(100).optional(),
  status: z2.enum(["on_track", "at_risk", "off_track", "completed"]).optional(),
  period: z2.string().optional(),
  notes: z2.string().optional()
});
var createMetricData = z2.object({
  name: z2.string().min(1),
  value: z2.string().min(1),
  previousValue: z2.string().optional(),
  unit: z2.string().optional(),
  trend: z2.enum(["up", "down", "stable"]).optional(),
  description: z2.string().optional(),
  period: z2.string().optional()
});
var createLearningData = z2.object({
  phaseId: z2.number().nullable().optional(),
  type: z2.enum(["learning", "obstacle", "win"]).optional(),
  title: z2.string().min(1),
  description: z2.string().min(1),
  resolution: z2.string().optional(),
  date: dateStr,
  isResolved: z2.boolean().optional()
});
var createResourceData = z2.object({
  title: z2.string().min(1),
  description: z2.string().optional(),
  category: z2.enum(["document", "template", "script", "training", "guide", "other"]).optional(),
  areas: z2.array(z2.string()).optional(),
  fileUrl: z2.string().optional(),
  externalUrl: z2.string().optional(),
  content: z2.string().optional()
});
var createBacklogData = z2.object({
  title: z2.string().min(1),
  description: z2.string().optional(),
  status: z2.enum(["idea", "en_revision", "aprobada", "en_progreso", "descartada"]).optional(),
  priority: z2.enum(["alta", "media", "baja"]).optional()
});
var actionSchema = z2.discriminatedUnion("type", [
  z2.object({ type: z2.literal("create_phase"), label: z2.string(), data: createPhaseData }),
  z2.object({ type: z2.literal("update_phase"), label: z2.string(), data: updatePhaseData }),
  z2.object({ type: z2.literal("create_milestone"), label: z2.string(), data: createMilestoneData }),
  z2.object({ type: z2.literal("update_milestone"), label: z2.string(), data: updateMilestoneData }),
  z2.object({ type: z2.literal("create_update"), label: z2.string(), data: createUpdateData }),
  z2.object({ type: z2.literal("create_okr"), label: z2.string(), data: createOkrData }),
  z2.object({ type: z2.literal("update_okr"), label: z2.string(), data: updateOkrData }),
  z2.object({ type: z2.literal("create_metric"), label: z2.string(), data: createMetricData }),
  z2.object({ type: z2.literal("create_learning"), label: z2.string(), data: createLearningData }),
  z2.object({ type: z2.literal("create_resource"), label: z2.string(), data: createResourceData }),
  z2.object({ type: z2.literal("create_backlog"), label: z2.string(), data: createBacklogData })
]);
var interpretResultSchema = z2.object({
  reply: z2.string(),
  needsClarification: z2.boolean().optional(),
  actions: z2.array(actionSchema).default([])
});
async function loadClientContext(clientId) {
  const [phases, milestones2, okrs2, metrics2, updates, learnings2] = await Promise.all([
    getPhasesByClient(clientId),
    getMilestonesByClient(clientId, true),
    getOkrsByClient(clientId, true),
    getMetricsByClient(clientId),
    getUpdatesByClient(clientId),
    getLearningsByClient(clientId)
  ]);
  const fmt = (d) => d ? new Date(d).toISOString().split("T")[0] : null;
  return {
    phaseIds: new Set(phases.map((p) => p.id)),
    okrIds: new Set(okrs2.map((o) => o.id)),
    milestoneIds: new Set(milestones2.map((m) => m.id)),
    snapshot: {
      etapas: phases.map((p) => ({ id: p.id, nombre: p.name, estado: p.status })),
      hitos: milestones2.map((m) => ({
        id: m.id,
        titulo: m.title,
        etapaId: m.phaseId,
        estado: m.status,
        fecha: fmt(m.date)
      })),
      objetivos: okrs2.map((o) => ({
        id: o.id,
        objetivo: o.objective,
        keyResult: o.keyResult,
        progreso: o.progressPct,
        estado: o.status
      })),
      metricas: metrics2.map((m) => ({ nombre: m.name, valor: m.value })),
      ultimasActualizaciones: updates.slice(0, 8).map((u) => ({
        titulo: u.title,
        categoria: u.category,
        fecha: fmt(u.date)
      })),
      aprendizajes: learnings2.map((l) => ({ id: l.id, tipo: l.type, titulo: l.title }))
    }
  };
}
function buildSystemPrompt(clientName, snapshot) {
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  return `Sos el asistente de carga del panel de consultor\xEDa de Gumercindo Jim\xE9nez. Tu trabajo es ayudar al consultor (el ADMINISTRADOR, no el cliente) a cargar y actualizar la informaci\xF3n del proyecto del cliente "${clientName}" hablando en lenguaje natural en espa\xF1ol.

El consultor te cuenta qu\xE9 pas\xF3 en el proyecto y vos interpret\xE1s esa informaci\xF3n y la traduc\xEDs en ACCIONES concretas sobre las secciones del panel. NO ejecut\xE1s nada todav\xEDa: solo PROPON\xC9S las acciones para que el consultor las revise y confirme.

La fecha de hoy es ${today}.

## Estructura del panel (entidades que pod\xE9s crear/actualizar)

1. **Etapas** (fases del proyecto): name, description, status (completed | in_progress | pending), startDate, endDate.
2. **Hitos** (milestones, entregables clave): title, description, date (obligatoria), status (completed | in_progress | pending), category (strategy | implementation | training | automation | content | analytics | other), impact (high | medium | low). Un hito puede colgar de una etapa v\xEDa phaseId.
3. **Actualizaciones** (novedades/sesiones): title, body, category (session | result | delivery | insight | blocker | win | general), status (on_track | at_risk | blocked | completed), date. Puede vincularse a una etapa (phaseId) y/o a un hito (milestoneId).
4. **Objetivos (OKRs)**: objective, keyResult, targetValue, currentValue, unit, progressPct (0-100), status (on_track | at_risk | off_track | completed), period.
5. **M\xE9tricas (KPIs)**: name, value, previousValue, unit, trend (up | down | stable), period.
6. **Aprendizajes**: type (learning | obstacle | win), title, description, resolution, date.

## Estado ACTUAL del cliente "${clientName}"

Us\xE1 estos IDs reales cuando necesites ACTUALIZAR algo existente (ej. marcar un hito como completado, cambiar el estado de una etapa). NO inventes IDs.

${JSON.stringify(snapshot, null, 2)}

## Reglas

- Vincul\xE1 hitos, actualizaciones y objetivos a la etapa correcta usando phaseId cuando el contexto lo permita.
- Para ACTUALIZAR algo existente us\xE1 su id real del estado de arriba (update_phase, update_milestone, update_okr). Para crear algo nuevo us\xE1 las acciones create_*.
- Las fechas SIEMPRE en formato "YYYY-MM-DD". Si el consultor no da fecha, us\xE1 la de hoy (${today}).
- NO inventes datos que el consultor no mencion\xF3. Si falta informaci\xF3n esencial (ej. a qu\xE9 etapa pertenece un hito y hay varias posibles), pon\xE9 needsClarification en true y pregunt\xE1 en "reply" en vez de adivinar.
- Si el consultor solo charla o pregunta algo sin pedir cargar nada, devolv\xE9 actions vac\xEDo y respond\xE9 en "reply".
- El campo "label" de cada acci\xF3n debe ser una frase corta y clara en espa\xF1ol describiendo qu\xE9 se va a hacer (ej. "Marcar hito 'Lanzamiento web' como completado").
- "reply" es tu mensaje conversacional al consultor, en espa\xF1ol, resumiendo qu\xE9 entendiste.

## Tipos de acci\xF3n v\xE1lidos \u2014 el campo "type" DEBE ser EXACTAMENTE uno de estos (en ingl\xE9s, sin traducir):
- create_phase, update_phase  \u2192 Etapas
- create_milestone, update_milestone  \u2192 Hitos
- create_update  \u2192 Actualizaciones (es "create_update", NUNCA "create_actualization" ni variantes en espa\xF1ol)
- create_okr, update_okr  \u2192 Objetivos
- create_metric  \u2192 M\xE9tricas
- create_learning  \u2192 Aprendizajes
- create_resource  \u2192 Recursos (Biblioteca: videos, documentos, gu\xEDas, templates). category: document | template | script | training | guide | other. Para un video o link externo us\xE1 externalUrl. El campo "areas" es un ARRAY de departamentos a los que sirve el recurso (ej. ["Ventas"] o ["Ventas","Atenci\xF3n al Cliente / Soporte"] si sirve a varios); us\xE1 las que mencione el consultor o las est\xE1ndar (Ventas, Operaciones, Atenci\xF3n al Cliente / Soporte, Social Media).
- create_backlog  \u2192 Backlog de ideas (ideas, mejoras, oportunidades). status: idea | en_revision | aprobada | en_progreso | descartada. priority: alta | media | baja.
NUNCA inventes otros valores de "type" ni los traduzcas. Si ninguna acci\xF3n aplica, devolv\xE9 "actions": [].

## Formato de salida (OBLIGATORIO)

Respond\xE9 \xDANICAMENTE con un objeto JSON v\xE1lido, sin texto antes ni despu\xE9s, sin bloques de c\xF3digo markdown. Estructura:

{
  "reply": "string \u2014 tu mensaje al consultor en espa\xF1ol",
  "needsClarification": false,
  "actions": [
    { "type": "create_milestone", "label": "Crear hito ... ", "data": { ... } }
  ]
}`;
}
function extractJson(text2) {
  const trimmed = text2.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1));
    }
    throw new Error("La IA no devolvi\xF3 un JSON v\xE1lido.");
  }
}
var TYPE_ALIASES = {
  create_actualization: "create_update",
  create_actualizacion: "create_update",
  "create_actualizaci\xF3n": "create_update",
  update_update: "create_update",
  create_objetivo: "create_okr",
  create_aprendizaje: "create_learning",
  create_metrica: "create_metric",
  "create_m\xE9trica": "create_metric",
  create_hito: "create_milestone",
  create_etapa: "create_phase",
  create_recurso: "create_resource",
  crear_recurso: "create_resource",
  crear_video: "create_resource",
  create_idea: "create_backlog",
  crear_idea: "create_backlog",
  create_backlog_item: "create_backlog",
  create_backlogitem: "create_backlog"
};
function normalizeActionTypes(obj) {
  if (!obj || !Array.isArray(obj.actions)) return;
  for (const a of obj.actions) {
    if (a && typeof a.type === "string" && TYPE_ALIASES[a.type]) {
      a.type = TYPE_ALIASES[a.type];
    }
  }
}
async function interpretMessage(opts) {
  const ctx = await loadClientContext(opts.clientId);
  const system = buildSystemPrompt(opts.clientName, ctx.snapshot);
  const messages = [
    ...opts.history,
    { role: "user", content: opts.message }
  ];
  const raw = await invokeChat({ system, messages, maxTokens: 4096 });
  let extracted;
  try {
    extracted = extractJson(raw);
  } catch {
    return { reply: raw.slice(0, 2e3), actions: [] };
  }
  normalizeActionTypes(extracted);
  const parsed = interpretResultSchema.safeParse(extracted);
  if (!parsed.success) {
    const replyText = extracted && typeof extracted.reply === "string" ? extracted.reply : raw.slice(0, 2e3);
    return { reply: replyText, actions: [] };
  }
  const safeActions = parsed.data.actions.filter((a) => {
    if (a.type === "update_phase") return ctx.phaseIds.has(a.data.id);
    if (a.type === "update_milestone") return ctx.milestoneIds.has(a.data.id);
    if (a.type === "update_okr") return ctx.okrIds.has(a.data.id);
    return true;
  });
  return { ...parsed.data, actions: safeActions };
}
var toDate = (s) => s ? new Date(s) : void 0;
async function executeActions(opts) {
  const { clientId } = opts;
  const existingPhases = await getPhasesByClient(clientId);
  const validPhaseIds = new Set(existingPhases.map((p) => p.id));
  let phaseOrder = existingPhases.length;
  const validPhase = (id) => id != null && validPhaseIds.has(id) ? id : void 0;
  const results = [];
  for (const action of opts.actions) {
    try {
      switch (action.type) {
        case "create_phase": {
          await createPhase({
            clientId,
            name: action.data.name,
            description: action.data.description,
            status: action.data.status ?? "pending",
            startDate: toDate(action.data.startDate),
            endDate: toDate(action.data.endDate),
            order: phaseOrder++
          });
          break;
        }
        case "update_phase": {
          if (!validPhaseIds.has(action.data.id)) {
            throw new Error("La etapa no pertenece a este cliente.");
          }
          await updatePhase(action.data.id, {
            name: action.data.name,
            description: action.data.description,
            status: action.data.status,
            startDate: toDate(action.data.startDate),
            endDate: toDate(action.data.endDate)
          });
          break;
        }
        case "create_milestone": {
          await createMilestone({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            title: action.data.title,
            description: action.data.description,
            date: new Date(action.data.date),
            status: action.data.status ?? "pending",
            category: action.data.category ?? "other",
            impact: action.data.impact ?? "medium"
          });
          break;
        }
        case "update_milestone": {
          await updateMilestone(action.data.id, clientId, {
            phaseId: action.data.phaseId === void 0 ? void 0 : validPhase(action.data.phaseId) ?? null,
            title: action.data.title,
            description: action.data.description,
            date: toDate(action.data.date),
            status: action.data.status,
            category: action.data.category,
            impact: action.data.impact
          });
          break;
        }
        case "create_update": {
          await createUpdate({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            milestoneId: action.data.milestoneId ?? void 0,
            title: action.data.title,
            body: action.data.body,
            category: action.data.category ?? "general",
            status: action.data.status ?? "on_track",
            impact: action.data.impact ?? "medium",
            isPublic: action.data.isPublic ?? true,
            date: new Date(action.data.date)
          });
          break;
        }
        case "create_okr": {
          await createOkr({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            objective: action.data.objective,
            keyResult: action.data.keyResult,
            targetValue: action.data.targetValue,
            currentValue: action.data.currentValue,
            unit: action.data.unit,
            progressPct: action.data.progressPct ?? 0,
            status: action.data.status ?? "on_track",
            period: action.data.period,
            notes: action.data.notes
          });
          break;
        }
        case "update_okr": {
          await updateOkr(action.data.id, clientId, {
            objective: action.data.objective,
            keyResult: action.data.keyResult,
            targetValue: action.data.targetValue,
            currentValue: action.data.currentValue,
            progressPct: action.data.progressPct,
            status: action.data.status,
            period: action.data.period,
            notes: action.data.notes
          });
          break;
        }
        case "create_metric": {
          await createMetric({
            clientId,
            name: action.data.name,
            value: action.data.value,
            previousValue: action.data.previousValue,
            unit: action.data.unit,
            trend: action.data.trend ?? "stable",
            description: action.data.description,
            period: action.data.period,
            order: 0
          });
          break;
        }
        case "create_learning": {
          await createLearning({
            clientId,
            phaseId: validPhase(action.data.phaseId),
            type: action.data.type ?? "learning",
            title: action.data.title,
            description: action.data.description,
            resolution: action.data.resolution,
            date: new Date(action.data.date),
            isResolved: action.data.isResolved ?? false
          });
          break;
        }
        case "create_resource": {
          await createResource({
            clientId,
            title: action.data.title,
            description: action.data.description,
            category: action.data.category ?? "other",
            areas: action.data.areas,
            fileUrls: action.data.fileUrl ? [{ url: action.data.fileUrl, name: action.data.fileUrl.split("/").pop() ?? "archivo" }] : void 0,
            externalUrl: action.data.externalUrl,
            content: action.data.content
          });
          break;
        }
        case "create_backlog": {
          await createBacklogItem({
            clientId,
            title: action.data.title,
            description: action.data.description,
            status: action.data.status ?? "idea",
            priority: action.data.priority ?? "media"
          });
          break;
        }
      }
      results.push({ label: action.label, ok: true });
    } catch (error) {
      results.push({
        label: action.label,
        ok: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      });
    }
  }
  return results;
}

// server/routers.ts
init_db();
var adminProcedure2 = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Solo el consultor puede acceder a esta \xE1rea." });
  }
  return next({ ctx });
});
async function assertClientAccess(userId, clientId) {
  const accesses = await getClientAccessForUser(userId);
  const allowed = accesses.some((a) => a.clientId === clientId);
  if (!allowed) {
    throw new TRPCError3({ code: "FORBIDDEN", message: "No ten\xE9s acceso a este cliente." });
  }
}
async function assertSectionAccess(userId, clientId, section) {
  if (!MEMBER_GATED_SECTIONS.includes(section)) return;
  const accesses = await getClientAccessForUser(userId);
  const access = accesses.find((a) => a.clientId === clientId);
  if (!access || access.accessLevel !== "member") return;
  const client = await getClientById(clientId);
  const allowed = client?.memberVisibleSections ?? [];
  if (!allowed.includes(section)) {
    throw new TRPCError3({ code: "FORBIDDEN", message: "No ten\xE9s acceso a esta secci\xF3n." });
  }
}
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    // Login por email + contraseña. Crea la sesión (cookie firmada) si las
    // credenciales son válidas. Mensaje genérico ante cualquier fallo para no
    // revelar si el email existe.
    login: publicProcedure.input(
      z3.object({
        email: z3.string().email("Email inv\xE1lido"),
        password: z3.string().min(1, "Ingres\xE1 tu contrase\xF1a")
      })
    ).mutation(async ({ ctx, input }) => {
      const invalid = new TRPCError3({
        code: "UNAUTHORIZED",
        message: "Email o contrase\xF1a incorrectos."
      });
      const user = await getUserByEmail(input.email);
      if (!user || !user.passwordHash) throw invalid;
      const ok = await verifyPassword(input.password, user.passwordHash);
      if (!ok) throw invalid;
      const sessionToken = await sdk.signSession(
        {
          openId: user.openId,
          appId: ENV.appId || "consulting-panel",
          name: user.name || ""
        },
        { expiresInMs: ONE_YEAR_MS }
      );
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS
      });
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ─── CLIENTS (admin only) ────────────────────────────────────────────────
  clients: router({
    list: adminProcedure2.query(() => getAllClients()),
    get: adminProcedure2.input(z3.object({ id: z3.number() })).query(
      ({ input }) => getClientById(input.id)
    ),
    create: adminProcedure2.input(
      z3.object({
        slug: z3.string().min(2).max(64),
        name: z3.string().min(2).max(255),
        description: z3.string().optional(),
        logoUrl: z3.string().optional(),
        branding: z3.object({
          primaryColor: z3.string(),
          accentColor: z3.string(),
          backgroundColor: z3.string(),
          textColor: z3.string(),
          fontDisplay: z3.string(),
          fontBody: z3.string(),
          fontAccent: z3.string().optional()
        }).optional(),
        consultorName: z3.string().optional(),
        startDate: z3.date().optional()
      })
    ).mutation(({ input }) => createClient(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        name: z3.string().optional(),
        description: z3.string().optional(),
        logoUrl: z3.string().optional(),
        branding: z3.any().optional(),
        consultorName: z3.string().optional(),
        isActive: z3.boolean().optional(),
        visibleSections: z3.array(z3.string()).optional(),
        memberVisibleSections: z3.array(z3.string()).optional()
      })
    ).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateClient(id, data);
    }),
    grantAccess: adminProcedure2.input(z3.object({ userId: z3.number(), clientId: z3.number() })).mutation(({ input }) => grantClientAccess(input.userId, input.clientId)),
    // For the current logged-in client user: get their accessible clients
    myClients: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllClients();
      const accesses = await getClientAccessForUser(ctx.user.id);
      const levelByClientId = new Map(accesses.map((a) => [a.clientId, a.accessLevel]));
      const clientIds = accesses.map((a) => a.clientId);
      const all = await getAllClients();
      return all.filter((c) => clientIds.includes(c.id)).map((c) => ({ ...c, accessLevel: levelByClientId.get(c.id) ?? "owner" }));
    })
  }),
  // ─── PHASES ──────────────────────────────────────────────────────────────
  phases: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getPhasesByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        name: z3.string(),
        description: z3.string().optional(),
        status: z3.enum(["completed", "in_progress", "pending"]).default("pending"),
        startDate: z3.date().optional(),
        endDate: z3.date().optional(),
        order: z3.number().default(0),
        color: z3.string().optional()
      })
    ).mutation(({ input }) => createPhase(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        name: z3.string().optional(),
        description: z3.string().optional(),
        status: z3.enum(["completed", "in_progress", "pending"]).optional(),
        startDate: z3.date().optional(),
        endDate: z3.date().optional(),
        order: z3.number().optional(),
        color: z3.string().optional()
      })
    ).mutation(({ input }) => {
      const { id, ...data } = input;
      return updatePhase(id, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number() })).mutation(({ input }) => deletePhase(input.id))
  }),
  // ─── OKRs ────────────────────────────────────────────────────────────────
  okrs: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        await assertClientAccess(ctx.user.id, input.clientId);
        await assertSectionAccess(ctx.user.id, input.clientId, "okrs");
      }
      return getOkrsByClient(input.clientId, ctx.user.role === "admin");
    }),
    pause: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number(), isPaused: z3.boolean() })).mutation(({ input }) => pauseOkr(input.id, input.clientId, input.isPaused)),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        phaseId: z3.number().optional(),
        objective: z3.string(),
        keyResult: z3.string(),
        targetValue: z3.string().optional(),
        currentValue: z3.string().optional(),
        unit: z3.string().optional(),
        progressPct: z3.number().min(0).max(100).default(0),
        status: z3.enum(["on_track", "at_risk", "off_track", "completed"]).default("on_track"),
        period: z3.string().optional(),
        notes: z3.string().optional()
      })
    ).mutation(({ input }) => createOkr(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        clientId: z3.number(),
        objective: z3.string().optional(),
        keyResult: z3.string().optional(),
        targetValue: z3.string().optional(),
        currentValue: z3.string().optional(),
        progressPct: z3.number().min(0).max(100).optional(),
        status: z3.enum(["on_track", "at_risk", "off_track", "completed"]).optional(),
        period: z3.string().optional(),
        notes: z3.string().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateOkr(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteOkr(input.id, input.clientId)),
    reorder: adminProcedure2.input(z3.object({ clientId: z3.number(), ids: z3.array(z3.number()) })).mutation(({ input }) => reorderOkrs(input.clientId, input.ids))
  }),
  // ─── MILESTONES ──────────────────────────────────────────────────────────
  milestones: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getMilestonesByClient(input.clientId, ctx.user.role === "admin");
    }),
    pause: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number(), isPaused: z3.boolean() })).mutation(({ input }) => pauseMilestone(input.id, input.clientId, input.isPaused)),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        phaseId: z3.number().optional(),
        title: z3.string(),
        description: z3.string().optional(),
        date: z3.date(),
        status: z3.enum(["completed", "in_progress", "pending"]).default("pending"),
        category: z3.enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"]).default("other"),
        impact: z3.enum(["high", "medium", "low"]).default("medium")
      })
    ).mutation(({ input }) => createMilestone(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        clientId: z3.number(),
        phaseId: z3.number().nullable().optional(),
        title: z3.string().optional(),
        description: z3.string().optional(),
        date: z3.date().optional(),
        status: z3.enum(["completed", "in_progress", "pending"]).optional(),
        category: z3.enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"]).optional(),
        impact: z3.enum(["high", "medium", "low"]).optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateMilestone(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteMilestone(input.id, input.clientId)),
    reorder: adminProcedure2.input(z3.object({ clientId: z3.number(), ids: z3.array(z3.number()) })).mutation(({ input }) => reorderMilestones(input.clientId, input.ids))
  }),
  // ─── LEARNINGS ───────────────────────────────────────────────────────────
  learnings: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getLearningsByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        phaseId: z3.number().optional(),
        type: z3.enum(["learning", "obstacle", "win"]).default("learning"),
        title: z3.string(),
        description: z3.string(),
        resolution: z3.string().optional(),
        date: z3.date(),
        isResolved: z3.boolean().default(false)
      })
    ).mutation(({ input }) => createLearning(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        clientId: z3.number(),
        type: z3.enum(["learning", "obstacle", "win"]).optional(),
        title: z3.string().optional(),
        description: z3.string().optional(),
        resolution: z3.string().optional(),
        date: z3.date().optional(),
        isResolved: z3.boolean().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateLearning(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteLearning(input.id, input.clientId)),
    reorder: adminProcedure2.input(z3.object({ clientId: z3.number(), ids: z3.array(z3.number()) })).mutation(({ input }) => reorderLearnings(input.clientId, input.ids))
  }),
  // ─── SCOPE ───────────────────────────────────────────────────────────────
  scope: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getScopeByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        title: z3.string(),
        description: z3.string().optional(),
        inScope: z3.boolean().default(true),
        category: z3.string().optional(),
        order: z3.number().default(0)
      })
    ).mutation(({ input }) => createScopeItem(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        clientId: z3.number(),
        title: z3.string().optional(),
        description: z3.string().optional(),
        inScope: z3.boolean().optional(),
        category: z3.string().optional(),
        order: z3.number().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateScopeItem(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteScopeItem(input.id, input.clientId))
  }),
  // ─── RESOURCES ───────────────────────────────────────────────────────────
  resources: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        await assertClientAccess(ctx.user.id, input.clientId);
        await assertSectionAccess(ctx.user.id, input.clientId, "resources");
      }
      return getResourcesByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        title: z3.string(),
        description: z3.string().optional(),
        category: z3.enum(["document", "template", "script", "training", "guide", "other"]).default("other"),
        area: z3.string().optional(),
        areas: z3.array(z3.string()).optional(),
        fileUrl: z3.string().optional(),
        fileUrls: z3.array(z3.object({ url: z3.string(), name: z3.string() })).optional(),
        externalUrl: z3.string().optional(),
        content: z3.string().optional(),
        isPublic: z3.boolean().default(true),
        order: z3.number().default(0)
      })
    ).mutation(({ input }) => createResource(input)),
    // Crea el mismo recurso en la biblioteca de varios clientes a la vez.
    createForClients: adminProcedure2.input(
      z3.object({
        clientIds: z3.array(z3.number()).min(1),
        title: z3.string(),
        description: z3.string().optional(),
        category: z3.enum(["document", "template", "script", "training", "guide", "other"]).default("other"),
        areas: z3.array(z3.string()).optional(),
        fileUrl: z3.string().optional(),
        fileUrls: z3.array(z3.object({ url: z3.string(), name: z3.string() })).optional(),
        externalUrl: z3.string().optional(),
        content: z3.string().optional()
      })
    ).mutation(async ({ input }) => {
      const { clientIds, ...data } = input;
      let created = 0;
      for (const clientId of clientIds) {
        await createResource({ ...data, clientId });
        created++;
      }
      return { created };
    }),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        clientId: z3.number(),
        title: z3.string().optional(),
        description: z3.string().optional(),
        category: z3.enum(["document", "template", "script", "training", "guide", "other"]).optional(),
        area: z3.string().optional(),
        areas: z3.array(z3.string()).optional(),
        fileUrl: z3.string().optional(),
        fileUrls: z3.array(z3.object({ url: z3.string(), name: z3.string() })).optional(),
        externalUrl: z3.string().optional(),
        content: z3.string().optional(),
        isPublic: z3.boolean().optional(),
        order: z3.number().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateResource(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteResource(input.id, input.clientId))
  }),
  // ─── DIGITAL ASSETS ──────────────────────────────────────────────────────
  digitalAssets: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        await assertClientAccess(ctx.user.id, input.clientId);
        await assertSectionAccess(ctx.user.id, input.clientId, "digital_assets");
      }
      return getDigitalAssetsByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        title: z3.string(),
        description: z3.string().optional(),
        category: z3.enum(["webpage", "design_system", "tool", "document", "brand_asset", "other"]).default("other"),
        externalUrl: z3.string().optional(),
        fileUrl: z3.string().optional(),
        notes: z3.string().optional(),
        isPublic: z3.boolean().default(true),
        order: z3.number().default(0)
      })
    ).mutation(({ input }) => createDigitalAsset(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        clientId: z3.number(),
        title: z3.string().optional(),
        description: z3.string().optional(),
        category: z3.enum(["webpage", "design_system", "tool", "document", "brand_asset", "other"]).optional(),
        externalUrl: z3.string().optional(),
        fileUrl: z3.string().optional(),
        notes: z3.string().optional(),
        isPublic: z3.boolean().optional(),
        order: z3.number().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateDigitalAsset(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteDigitalAsset(input.id, input.clientId))
  }),
  // ─── METRICS ─────────────────────────────────────────────────────────────
  metrics: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getMetricsByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z3.object({
        clientId: z3.number(),
        name: z3.string(),
        value: z3.string(),
        previousValue: z3.string().optional(),
        unit: z3.string().optional(),
        trend: z3.enum(["up", "down", "stable"]).default("stable"),
        description: z3.string().optional(),
        period: z3.string().optional(),
        order: z3.number().default(0)
      })
    ).mutation(({ input }) => createMetric(input)),
    update: adminProcedure2.input(
      z3.object({
        id: z3.number(),
        clientId: z3.number(),
        name: z3.string().optional(),
        value: z3.string().optional(),
        previousValue: z3.string().optional(),
        unit: z3.string().optional(),
        trend: z3.enum(["up", "down", "stable"]).optional(),
        description: z3.string().optional(),
        period: z3.string().optional(),
        order: z3.number().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateMetric(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteMetric(input.id, input.clientId))
  }),
  // ─── UPDATES (Actualizaciones) ───────────────────────────────────────────
  updates: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        await assertClientAccess(ctx.user.id, input.clientId);
        await assertSectionAccess(ctx.user.id, input.clientId, "updates");
      }
      const all = await getUpdatesByClient(input.clientId);
      if (ctx.user.role !== "admin") return all.filter((u) => u.isPublic === true);
      return all;
    }),
    create: adminProcedure2.input(z3.object({
      clientId: z3.number(),
      phaseId: z3.number().optional(),
      milestoneId: z3.number().optional(),
      title: z3.string().min(1).max(255),
      body: z3.string().min(1),
      category: z3.enum(["session", "result", "delivery", "insight", "blocker", "win", "general"]).default("general"),
      status: z3.enum(["on_track", "at_risk", "blocked", "completed"]).default("on_track"),
      impact: z3.enum(["high", "medium", "low"]).default("medium"),
      isPublic: z3.boolean().default(true),
      date: z3.string()
    })).mutation(({ input }) => {
      const { date, ...rest } = input;
      return createUpdate({ ...rest, date: new Date(date) });
    }),
    update: adminProcedure2.input(z3.object({
      id: z3.number(),
      clientId: z3.number(),
      title: z3.string().optional(),
      body: z3.string().optional(),
      category: z3.enum(["session", "result", "delivery", "insight", "blocker", "win", "general"]).optional(),
      status: z3.enum(["on_track", "at_risk", "blocked", "completed"]).optional(),
      impact: z3.enum(["high", "medium", "low"]).optional(),
      isPublic: z3.boolean().optional(),
      phaseId: z3.number().optional(),
      milestoneId: z3.number().optional(),
      date: z3.string().optional()
    })).mutation(({ input }) => {
      const { id, clientId, date, ...rest } = input;
      return updateUpdate(id, clientId, { ...rest, ...date ? { date: new Date(date) } : {} });
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteUpdate(input.id, input.clientId))
  }),
  // ─── BACKLOG ─────────────────────────────────────────────────────────────
  backlog: router({
    list: protectedProcedure.input(z3.object({ clientId: z3.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        await assertClientAccess(ctx.user.id, input.clientId);
        await assertSectionAccess(ctx.user.id, input.clientId, "backlog");
      }
      return getBacklogByClient(input.clientId);
    }),
    create: adminProcedure2.input(z3.object({
      clientId: z3.number(),
      title: z3.string().min(1).max(255),
      description: z3.string().optional(),
      status: z3.enum(["idea", "en_revision", "aprobada", "en_progreso", "descartada"]).default("idea"),
      priority: z3.enum(["alta", "media", "baja"]).default("media")
    })).mutation(({ input }) => createBacklogItem(input)),
    update: adminProcedure2.input(z3.object({
      id: z3.number(),
      clientId: z3.number(),
      title: z3.string().optional(),
      description: z3.string().optional(),
      status: z3.enum(["idea", "en_revision", "aprobada", "en_progreso", "descartada"]).optional(),
      priority: z3.enum(["alta", "media", "baja"]).optional()
    })).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateBacklogItem(id, clientId, data);
    }),
    delete: adminProcedure2.input(z3.object({ id: z3.number(), clientId: z3.number() })).mutation(({ input }) => deleteBacklogItem(input.id, input.clientId))
  }),
  // ─── USERS (admin only) ──────────────────────────────────────────────────
  users: router({
    listByClient: adminProcedure2.input(z3.object({ clientId: z3.number() })).query(({ input }) => getUsersWithAccessToClient(input.clientId)),
    createWithAccess: adminProcedure2.input(z3.object({
      clientId: z3.number(),
      name: z3.string().min(2).max(255),
      email: z3.string().email("Email inv\xE1lido"),
      password: z3.string().min(6, "La contrase\xF1a debe tener al menos 6 caracteres"),
      accessLevel: z3.enum(["owner", "member"]).default("owner")
    })).mutation(async ({ input }) => {
      const existingUser = await (await Promise.resolve().then(() => (init_db(), db_exports))).getUserByEmail(input.email);
      if (existingUser) {
        await grantClientAccess(existingUser.id, input.clientId, input.accessLevel);
        return { userId: existingUser.id, created: false };
      }
      const passwordHash = await hashPassword(input.password);
      const userId = await createUserWithPassword({
        email: input.email,
        passwordHash,
        name: input.name
      });
      await grantClientAccess(userId, input.clientId, input.accessLevel);
      return { userId, created: true };
    }),
    setAccessLevel: adminProcedure2.input(z3.object({ userId: z3.number(), clientId: z3.number(), accessLevel: z3.enum(["owner", "member"]) })).mutation(({ input }) => setAccessLevel(input.userId, input.clientId, input.accessLevel)),
    revokeAccess: adminProcedure2.input(z3.object({ userId: z3.number(), clientId: z3.number() })).mutation(({ input }) => revokeClientAccess(input.userId, input.clientId))
  }),
  // ─── STORAGE ─────────────────────────────────────────────────────────────
  storage: router({
    getUploadUrl: adminProcedure2.input(z3.object({
      clientId: z3.number(),
      filename: z3.string().min(1).max(255),
      contentType: z3.string().min(1)
    })).mutation(async ({ input }) => {
      if (!ENV.supabaseUrl || !ENV.supabaseServiceKey) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Storage no configurado. Agreg\xE1 SUPABASE_URL y SUPABASE_SERVICE_KEY en Vercel." });
      }
      const { StorageClient } = await import("@supabase/storage-js");
      const storage = new StorageClient(`${ENV.supabaseUrl}/storage/v1`, {
        Authorization: `Bearer ${ENV.supabaseServiceKey}`,
        apikey: ENV.supabaseServiceKey
      });
      const ext = input.filename.split(".").pop() ?? "";
      const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `client-${input.clientId}/${Date.now()}_${safeName}`;
      const { data, error } = await storage.from("panel-assets").createSignedUploadUrl(path);
      if (error || !data) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: `Error al generar URL de subida: ${error?.message ?? "sin respuesta"}` });
      }
      const publicUrl = `${ENV.supabaseUrl}/storage/v1/object/public/panel-assets/${path}`;
      return { signedUrl: data.signedUrl, path, publicUrl, ext };
    })
  }),
  // ─── AI ASSISTANT (admin only) ───────────────────────────────────────────
  // El consultor describe en lenguaje natural qué pasó; la IA propone acciones
  // (interpret) que el admin revisa y confirma antes de aplicarlas (execute).
  ai: router({
    interpret: adminProcedure2.input(z3.object({
      clientId: z3.number(),
      message: z3.string().min(1),
      history: z3.array(z3.object({
        role: z3.enum(["user", "assistant"]),
        content: z3.string()
      })).default([])
    })).mutation(async ({ input }) => {
      const client = await getClientById(input.clientId);
      if (!client) throw new TRPCError3({ code: "NOT_FOUND", message: "Cliente no encontrado." });
      return interpretMessage({
        clientId: input.clientId,
        clientName: client.name,
        message: input.message,
        history: input.history
      });
    }),
    execute: adminProcedure2.input(z3.object({
      clientId: z3.number(),
      actions: z3.array(actionSchema)
    })).mutation(({ input }) => executeActions({ clientId: input.clientId, actions: input.actions }))
  })
});

// server/_core/context.ts
init_db();
init_env();
var DEV_ADMIN_OPEN_ID = "dev-admin";
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  if (!user && !ENV.isProduction && ENV.devAutoLogin) {
    user = await getUserByOpenId(DEV_ADMIN_OPEN_ID) ?? null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/serverless.ts
var app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(
  "/api/trpc",
  createExpressMiddleware({ router: appRouter, createContext })
);
var serverless_default = app;
export {
  serverless_default as default
};
