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

// ─── ENUMS ───────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const phaseStatusEnum = pgEnum("phase_status", ["completed", "in_progress", "pending"]);
export const okrStatusEnum = pgEnum("okr_status", ["on_track", "at_risk", "off_track", "completed"]);
export const milestoneStatusEnum = pgEnum("milestone_status", ["completed", "in_progress", "pending"]);
export const milestoneCategoryEnum = pgEnum("milestone_category", ["strategy", "implementation", "training", "automation", "content", "analytics", "other"]);
export const impactEnum = pgEnum("impact", ["high", "medium", "low"]);
export const learningTypeEnum = pgEnum("learning_type", ["learning", "obstacle", "win"]);
export const resourceCategoryEnum = pgEnum("resource_category", ["document", "template", "script", "training", "guide", "other"]);
export const digitalAssetCategoryEnum = pgEnum("digital_asset_category", ["webpage", "design_system", "tool", "document", "brand_asset", "other"]);
export const trendEnum = pgEnum("trend", ["up", "down", "stable"]);
export const updateCategoryEnum = pgEnum("update_category", ["session", "result", "delivery", "insight", "blocker", "win", "general"]);
export const updateStatusEnum = pgEnum("update_status", ["on_track", "at_risk", "blocked", "completed"]);

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── CLIENTS ─────────────────────────────────────────────────────────────────
export const clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  coverImageUrl: text("coverImageUrl"),
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
  visibleSections: json("visibleSections").$type<string[]>(),
  // Secciones "confidenciales" habilitadas para los usuarios nivel "member"
  // (empleados del cliente) de este cliente. Compartido por todos los
  // miembros — no es 1x1 todavía (queda como evolución futura: ver
  // clientAccess.accessLevel para el campo que ya distingue cada usuario).
  memberVisibleSections: json("memberVisibleSections").$type<string[]>(),
  // Onboarding (entrada del cliente) y Outboarding (cierre/salida): bloques con
  // checklist de pasos que enmarcan las etapas en la Hoja de Ruta. `visible`
  // controla si el cliente los ve en su portal. Estándar para todos los clientes.
  onboarding: json("onboarding").$type<{ visible: boolean; items: { id: string; text: string; done: boolean }[] }>(),
  outboarding: json("outboarding").$type<{ visible: boolean; items: { id: string; text: string; done: boolean }[] }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ─── CLIENT ACCESS ────────────────────────────────────────────────────────────
export const clientAccess = pgTable("client_access", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  clientId: integer("clientId").notNull(),
  // "owner": el cliente principal, ve todo lo habilitado para el cliente.
  // "member": empleado del cliente, además filtrado por memberVisibleSections.
  accessLevel: varchar("accessLevel", { length: 16 }).default("owner").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ClientAccess = typeof clientAccess.$inferSelect;

// ─── INVITATIONS ──────────────────────────────────────────────────────────────
// Link de invitación: el admin lo genera para un cliente + nivel de acceso, lo
// comparte a mano (WhatsApp/mail), y quien lo abre elige su propio nombre,
// email y contraseña en /invite/:token. Un solo uso por link.
export const invitations = pgTable("invitations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  accessLevel: varchar("accessLevel", { length: 16 }).default("member").notNull(),
  note: varchar("note", { length: 255 }),
  status: varchar("status", { length: 16 }).default("pending").notNull(), // pending | accepted | revoked
  acceptedByUserId: integer("acceptedByUserId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  acceptedAt: timestamp("acceptedAt"),
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;

// ─── PROJECT PHASES ───────────────────────────────────────────────────────────
export const projectPhases = pgTable("project_phases", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
  progressPct: integer("progressPct").default(0).notNull(),
  status: okrStatusEnum("status").default("on_track").notNull(),
  period: varchar("period", { length: 64 }),
  notes: text("notes"),
  sortOrder: integer("sortOrder"),
  isPaused: boolean("isPaused").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
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
  status: milestoneStatusEnum("status").default("pending").notNull(),
  category: milestoneCategoryEnum("category").default("other").notNull(),
  impact: impactEnum("impact").default("medium").notNull(),
  resultType: updateCategoryEnum("resultType"),
  sortOrder: integer("sortOrder"),
  isPaused: boolean("isPaused").default(false).notNull(),
  // Hito personal de un miembro del equipo del cliente (lo asigna el admin
  // al cargar el hito). El asignado siempre lo ve en su portal.
  assignedToUserId: integer("assignedToUserId"),
  // Miembros adicionales (más allá del asignado) a los que el DUEÑO del
  // cliente decide mostrarles este hito, desde su propio portal.
  visibleToUserIds: integer("visibleToUserIds").array(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

// ─── LEARNINGS ────────────────────────────────────────────────────────────────
export const learnings = pgTable("learnings", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Learning = typeof learnings.$inferSelect;
export type InsertLearning = typeof learnings.$inferInsert;

// ─── SCOPE ITEMS ──────────────────────────────────────────────────────────────
export const scopeItems = pgTable("scope_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  inScope: boolean("inScope").default(true).notNull(),
  category: varchar("category", { length: 128 }),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ScopeItem = typeof scopeItems.$inferSelect;
export type InsertScopeItem = typeof scopeItems.$inferInsert;

// ─── RESOURCES ────────────────────────────────────────────────────────────────
export const resources = pgTable("resources", {
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
  fileUrls: json("fileUrls").$type<{ url: string; name: string }[]>(),
  externalUrl: text("externalUrl"),
  content: text("content"),
  isPublic: boolean("isPublic").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── DIGITAL ASSETS ───────────────────────────────────────────────────────────
export const digitalAssets = pgTable("digital_assets", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type DigitalAsset = typeof digitalAssets.$inferSelect;
export type InsertDigitalAsset = typeof digitalAssets.$inferInsert;

// ─── METRICS ──────────────────────────────────────────────────────────────────
export const metrics = pgTable("metrics", {
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
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

// ─── PROJECT UPDATES (Actualizaciones) ───────────────────────────────────────
export const projectUpdates = pgTable("project_updates", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  phaseId: integer("phaseId"),
  milestoneId: integer("milestoneId"),
  title: varchar("title", { length: 255 }).notNull(),
  body: text("body").notNull(),
  category: updateCategoryEnum("category").default("general").notNull(),
  status: updateStatusEnum("status").default("on_track").notNull(),
  impact: impactEnum("impact").default("medium").notNull(),
  // URL de referencia opcional (ej. publicación, entregable, documento) que se
  // muestra como link en la actualización, tanto en el feed como en la Hoja de Ruta.
  url: text("url"),
  // Archivo adjunto opcional (PDF, imagen, etc.) con vista previa. fileUrl
  // queda solo por compat de lectura — las actualizaciones nuevas escriben
  // en fileUrls (varios archivos por actualización, igual que en Resources).
  fileUrl: text("fileUrl"),
  fileUrls: json("fileUrls").$type<{ url: string; name: string }[]>(),
  isPublic: boolean("isPublic").default(true).notNull(),
  date: timestamp("date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ProjectUpdate = typeof projectUpdates.$inferSelect;
export type InsertProjectUpdate = typeof projectUpdates.$inferInsert;

// ─── BACKLOG ITEMS ────────────────────────────────────────────────────────────
export const backlogItems = pgTable("backlog_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: varchar("status", { length: 32 }).notNull().default("idea"),
  priority: varchar("priority", { length: 16 }).notNull().default("media"),
  // URL de referencia opcional (ej. una app/producto que sirve de inspiración).
  url: text("url"),
  // Archivos de referencia opcionales (imágenes, PDFs, capturas) con vista
  // previa — mismo patrón que Resources y ProjectUpdates.
  fileUrls: json("fileUrls").$type<{ url: string; name: string }[]>(),
  // Fecha en la que surgió la idea (editable, distinta de createdAt) y, si
  // se decide llevarla adelante, cuándo arrancó y cuándo se completó.
  ideaDate: timestamp("ideaDate"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BacklogItem = typeof backlogItems.$inferSelect;
export type InsertBacklogItem = typeof backlogItems.$inferInsert;
