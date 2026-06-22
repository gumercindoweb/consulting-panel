import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // Hash scrypt de la contraseña para login por email+clave. NULL para usuarios
  // que solo entran por OAuth. Formato: "scrypt:<saltHex>:<hashHex>".
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: pgEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
// Each consulting client (e.g. Sensaciones de Tango)
export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
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
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── CLIENT ACCESS ────────────────────────────────────────────────────────────
// Links a user to a client (many-to-many, but typically 1 user = 1 client)
export const clientAccess = pgTable("client_access", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  clientId: integer("clientId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientAccess = typeof clientAccess.$inferSelect;

// ─── PROJECT PHASES ───────────────────────────────────────────────────────────
export const projectPhases = pgTable("project_phases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: pgEnum("status", ["completed", "in_progress", "pending"]).default("pending").notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  order: integer("order").default(0).notNull(),
  color: varchar("color", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type ProjectPhase = typeof projectPhases.$inferSelect;
export type InsertProjectPhase = typeof projectPhases.$inferInsert;

// ─── OKRs ─────────────────────────────────────────────────────────────────────
export const okrs = pgTable("okrs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  phaseId: integer("phaseId"),
  objective: text("objective").notNull(),
  keyResult: text("keyResult").notNull(),
  targetValue: varchar("targetValue", { length: 128 }),
  currentValue: varchar("currentValue", { length: 128 }),
  unit: varchar("unit", { length: 64 }),
  progressPct: integer("progressPct").default(0).notNull(), // 0-100
  status: pgEnum("status", ["on_track", "at_risk", "off_track", "completed"]).default("on_track").notNull(),
  period: varchar("period", { length: 64 }), // e.g. "Q2 2026"
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type Okr = typeof okrs.$inferSelect;
export type InsertOkr = typeof okrs.$inferInsert;

// ─── MILESTONES ───────────────────────────────────────────────────────────────
export const milestones = pgTable("milestones", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  phaseId: integer("phaseId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: pgEnum("status", ["completed", "in_progress", "pending"]).default("pending").notNull(),
  category: pgEnum("category", [
    "strategy",
    "implementation",
    "training",
    "automation",
    "content",
    "analytics",
    "other",
  ]).default("other").notNull(),
  impact: pgEnum("impact", ["high", "medium", "low"]).default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

// ─── LEARNINGS ────────────────────────────────────────────────────────────────
export const learnings = pgTable("learnings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  phaseId: integer("phaseId"),
  type: pgEnum("type", ["learning", "obstacle", "win"]).default("learning").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  resolution: text("resolution"), // how it was resolved (for obstacles)
  date: timestamp("date").notNull(),
  isResolved: boolean("isResolved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type Learning = typeof learnings.$inferSelect;
export type InsertLearning = typeof learnings.$inferInsert;

// ─── SCOPE ITEMS ──────────────────────────────────────────────────────────────
export const scopeItems = pgTable("scope_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  inScope: boolean("inScope").default(true).notNull(), // true = in scope, false = out of scope
  category: varchar("category", { length: 128 }),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type ScopeItem = typeof scopeItems.$inferSelect;
export type InsertScopeItem = typeof scopeItems.$inferInsert;

// ─── RESOURCES ────────────────────────────────────────────────────────────────
export const resources = pgTable("resources", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: pgEnum("category", [
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
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── METRICS ──────────────────────────────────────────────────────────────────
export const metrics = pgTable("metrics", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  value: varchar("value", { length: 128 }).notNull(),
  previousValue: varchar("previousValue", { length: 128 }),
  unit: varchar("unit", { length: 64 }),
  trend: pgEnum("trend", ["up", "down", "stable"]).default("stable").notNull(),
  description: text("description"),
  period: varchar("period", { length: 64 }),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;
