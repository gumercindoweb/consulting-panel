import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  Client,
  ClientAccess,
  InsertClient,
  InsertLearning,
  InsertMetric,
  InsertMilestone,
  InsertOkr,
  InsertProjectPhase,
  InsertResource,
  InsertScopeItem,
  InsertUser,
  Learning,
  Metric,
  Milestone,
  Okr,
  ProjectPhase,
  Resource,
  ScopeItem,
  clientAccess,
  clients,
  learnings,
  metrics,
  milestones,
  okrs,
  projectPhases,
  resources,
  scopeItems,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const client = postgres(process.env.DATABASE_URL, {
        ssl: "require",
        max: 1,
      });
      _db = drizzle(client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── USERS ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  textFields.forEach((field) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  });

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  const existing = await db.select().from(users).where(eq(users.openId, values.openId!)).limit(1);
  if (existing.length > 0) {
    await db.update(users).set(updateSet).where(eq(users.openId, values.openId!));
  } else {
    await db.insert(users).values(values);
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Busca un usuario por email (case-insensitive). Usado por el login email+clave.
export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  const normalized = email.trim().toLowerCase();
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── CLIENTS ──────────────────────────────────────────────────────────────────
export async function getAllClients(): Promise<Client[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clients).where(eq(clients.isActive, true)).orderBy(asc(clients.name));
}

export async function getClientById(id: number): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
  return result[0];
}

export async function getClientBySlug(slug: string): Promise<Client | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(clients).where(eq(clients.slug, slug)).limit(1);
  return result[0];
}

export async function createClient(data: InsertClient): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(clients).values(data);
  return (result[0] as any).insertId;
}

export async function updateClient(id: number, data: Partial<InsertClient>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(clients).set(data).where(eq(clients.id, id));
}

// ─── CLIENT ACCESS ────────────────────────────────────────────────────────────
export async function getClientAccessForUser(userId: number): Promise<ClientAccess[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(clientAccess).where(eq(clientAccess.userId, userId));
}

export async function grantClientAccess(userId: number, clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(clientAccess).where(and(eq(clientAccess.userId, userId), eq(clientAccess.clientId, clientId))).limit(1);
  if (existing.length === 0) {
    await db.insert(clientAccess).values({ userId, clientId });
  }
}

// ─── PROJECT PHASES ───────────────────────────────────────────────────────────
export async function getPhasesByClient(clientId: number): Promise<ProjectPhase[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(projectPhases)
    .where(eq(projectPhases.clientId, clientId))
    .orderBy(asc(projectPhases.order));
}

export async function createPhase(data: InsertProjectPhase): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(projectPhases).values(data);
  return (result[0] as any).insertId;
}

export async function updatePhase(id: number, data: Partial<InsertProjectPhase>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(projectPhases).set(data).where(eq(projectPhases.id, id));
}

export async function deletePhase(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(projectPhases).where(eq(projectPhases.id, id));
}

// ─── OKRs ─────────────────────────────────────────────────────────────────────
export async function getOkrsByClient(clientId: number): Promise<Okr[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(okrs).where(eq(okrs.clientId, clientId)).orderBy(asc(okrs.createdAt));
}

export async function createOkr(data: InsertOkr): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(okrs).values(data);
  return (result[0] as any).insertId;
}

export async function updateOkr(id: number, clientId: number, data: Partial<InsertOkr>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(okrs).set(data).where(and(eq(okrs.id, id), eq(okrs.clientId, clientId)));
}

export async function deleteOkr(id: number, clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(okrs).where(and(eq(okrs.id, id), eq(okrs.clientId, clientId)));
}

// ─── MILESTONES ───────────────────────────────────────────────────────────────
export async function getMilestonesByClient(clientId: number): Promise<Milestone[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(milestones)
    .where(eq(milestones.clientId, clientId))
    .orderBy(asc(milestones.date));
}

export async function createMilestone(data: InsertMilestone): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(milestones).values(data);
  return (result[0] as any).insertId;
}

export async function updateMilestone(id: number, clientId: number, data: Partial<InsertMilestone>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(milestones).set(data).where(and(eq(milestones.id, id), eq(milestones.clientId, clientId)));
}

export async function deleteMilestone(id: number, clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(milestones).where(and(eq(milestones.id, id), eq(milestones.clientId, clientId)));
}

// ─── LEARNINGS ────────────────────────────────────────────────────────────────
export async function getLearningsByClient(clientId: number): Promise<Learning[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(learnings)
    .where(eq(learnings.clientId, clientId))
    .orderBy(asc(learnings.date));
}

export async function createLearning(data: InsertLearning): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(learnings).values(data);
  return (result[0] as any).insertId;
}

export async function updateLearning(id: number, clientId: number, data: Partial<InsertLearning>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(learnings).set(data).where(and(eq(learnings.id, id), eq(learnings.clientId, clientId)));
}

export async function deleteLearning(id: number, clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(learnings).where(and(eq(learnings.id, id), eq(learnings.clientId, clientId)));
}

// ─── SCOPE ITEMS ──────────────────────────────────────────────────────────────
export async function getScopeByClient(clientId: number): Promise<ScopeItem[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(scopeItems)
    .where(eq(scopeItems.clientId, clientId))
    .orderBy(asc(scopeItems.order));
}

export async function createScopeItem(data: InsertScopeItem): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(scopeItems).values(data);
  return (result[0] as any).insertId;
}

export async function updateScopeItem(id: number, clientId: number, data: Partial<InsertScopeItem>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(scopeItems).set(data).where(and(eq(scopeItems.id, id), eq(scopeItems.clientId, clientId)));
}

export async function deleteScopeItem(id: number, clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(scopeItems).where(and(eq(scopeItems.id, id), eq(scopeItems.clientId, clientId)));
}

// ─── RESOURCES ────────────────────────────────────────────────────────────────
export async function getResourcesByClient(clientId: number): Promise<Resource[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(resources)
    .where(eq(resources.clientId, clientId))
    .orderBy(asc(resources.order));
}

export async function createResource(data: InsertResource): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(resources).values(data);
  return (result[0] as any).insertId;
}

export async function updateResource(id: number, clientId: number, data: Partial<InsertResource>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(resources).set(data).where(and(eq(resources.id, id), eq(resources.clientId, clientId)));
}

export async function deleteResource(id: number, clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(resources).where(and(eq(resources.id, id), eq(resources.clientId, clientId)));
}

// ─── METRICS ──────────────────────────────────────────────────────────────────
export async function getMetricsByClient(clientId: number): Promise<Metric[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(metrics)
    .where(eq(metrics.clientId, clientId))
    .orderBy(asc(metrics.order));
}

export async function createMetric(data: InsertMetric): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(metrics).values(data);
  return (result[0] as any).insertId;
}

export async function updateMetric(id: number, clientId: number, data: Partial<InsertMetric>): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.update(metrics).set(data).where(and(eq(metrics.id, id), eq(metrics.clientId, clientId)));
}

export async function deleteMetric(id: number, clientId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(metrics).where(and(eq(metrics.id, id), eq(metrics.clientId, clientId)));
}
