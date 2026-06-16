import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
// Each consulting client (e.g. Sensaciones de Tango)
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(), // e.g. "sensaciones-de-tango"
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  // Branding tokens stored as JSON
  branding: json("branding").$type<{
    primaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontDisplay: string;
    fontBody: string;
    fontAccent?: string;
  }>(),
  consultorName: varchar("consultorName", { length: 255 }),
  startDate: timestamp("startDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── CLIENT ACCESS ────────────────────────────────────────────────────────────
// Links a user to a client (many-to-many, but typically 1 user = 1 client)
export const clientAccess = mysqlTable("client_access", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clientId: int("clientId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientAccess = typeof clientAccess.$inferSelect;

// ─── PROJECT PHASES ───────────────────────────────────────────────────────────
export const projectPhases = mysqlTable("project_phases", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["completed", "in_progress", "pending"]).default("pending").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  order: int("order").default(0).notNull(),
  color: varchar("color", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ProjectPhase = typeof projectPhases.$inferSelect;
export type InsertProjectPhase = typeof projectPhases.$inferInsert;

// ─── OKRs ─────────────────────────────────────────────────────────────────────
export const okrs = mysqlTable("okrs", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  phaseId: int("phaseId"),
  objective: text("objective").notNull(),
  keyResult: text("keyResult").notNull(),
  targetValue: varchar("targetValue", { length: 128 }),
  currentValue: varchar("currentValue", { length: 128 }),
  unit: varchar("unit", { length: 64 }),
  progressPct: int("progressPct").default(0).notNull(), // 0-100
  status: mysqlEnum("status", ["on_track", "at_risk", "off_track", "completed"]).default("on_track").notNull(),
  period: varchar("period", { length: 64 }), // e.g. "Q2 2026"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Okr = typeof okrs.$inferSelect;
export type InsertOkr = typeof okrs.$inferInsert;

// ─── MILESTONES ───────────────────────────────────────────────────────────────
export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  phaseId: int("phaseId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: mysqlEnum("status", ["completed", "in_progress", "pending"]).default("pending").notNull(),
  category: mysqlEnum("category", [
    "strategy",
    "implementation",
    "training",
    "automation",
    "content",
    "analytics",
    "other",
  ]).default("other").notNull(),
  impact: mysqlEnum("impact", ["high", "medium", "low"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

// ─── LEARNINGS ────────────────────────────────────────────────────────────────
export const learnings = mysqlTable("learnings", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  phaseId: int("phaseId"),
  type: mysqlEnum("type", ["learning", "obstacle", "win"]).default("learning").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  resolution: text("resolution"), // how it was resolved (for obstacles)
  date: timestamp("date").notNull(),
  isResolved: boolean("isResolved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Learning = typeof learnings.$inferSelect;
export type InsertLearning = typeof learnings.$inferInsert;

// ─── SCOPE ITEMS ──────────────────────────────────────────────────────────────
export const scopeItems = mysqlTable("scope_items", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  inScope: boolean("inScope").default(true).notNull(), // true = in scope, false = out of scope
  category: varchar("category", { length: 128 }),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScopeItem = typeof scopeItems.$inferSelect;
export type InsertScopeItem = typeof scopeItems.$inferInsert;

// ─── RESOURCES ────────────────────────────────────────────────────────────────
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "document",
    "template",
    "script",
    "training",
    "guide",
    "other",
  ]).default("other").notNull(),
  fileUrl: text("fileUrl"),
  externalUrl: text("externalUrl"),
  content: text("content"), // inline markdown content
  isPublic: boolean("isPublic").default(true).notNull(), // visible to client's team
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── METRICS ──────────────────────────────────────────────────────────────────
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  value: varchar("value", { length: 128 }).notNull(),
  previousValue: varchar("previousValue", { length: 128 }),
  unit: varchar("unit", { length: 64 }),
  trend: mysqlEnum("trend", ["up", "down", "stable"]).default("stable").notNull(),
  description: text("description"),
  period: varchar("period", { length: 64 }),
  order: int("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;
