// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";

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
var roleEnum = pgEnum("role", ["user", "admin"]);
var phaseStatusEnum = pgEnum("phase_status", ["completed", "in_progress", "pending"]);
var okrStatusEnum = pgEnum("okr_status", ["on_track", "at_risk", "off_track", "completed"]);
var milestoneStatusEnum = pgEnum("milestone_status", ["completed", "in_progress", "pending"]);
var milestoneCategoryEnum = pgEnum("milestone_category", ["strategy", "implementation", "training", "automation", "content", "analytics", "other"]);
var impactEnum = pgEnum("impact", ["high", "medium", "low"]);
var learningTypeEnum = pgEnum("learning_type", ["learning", "obstacle", "win"]);
var resourceCategoryEnum = pgEnum("resource_category", ["document", "template", "script", "training", "guide", "other"]);
var trendEnum = pgEnum("trend", ["up", "down", "stable"]);
var users = pgTable("users", {
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
var clients = pgTable("clients", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  logoUrl: text("logoUrl"),
  branding: json("branding").$type(),
  consultorName: varchar("consultorName", { length: 255 }),
  startDate: timestamp("startDate"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var clientAccess = pgTable("client_access", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("userId").notNull(),
  clientId: integer("clientId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var projectPhases = pgTable("project_phases", {
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
var okrs = pgTable("okrs", {
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
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var milestones = pgTable("milestones", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  phaseId: integer("phaseId"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  status: milestoneStatusEnum("status").default("pending").notNull(),
  category: milestoneCategoryEnum("category").default("other").notNull(),
  impact: impactEnum("impact").default("medium").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var learnings = pgTable("learnings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  phaseId: integer("phaseId"),
  type: learningTypeEnum("type").default("learning").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  resolution: text("resolution"),
  date: timestamp("date").notNull(),
  isResolved: boolean("isResolved").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var scopeItems = pgTable("scope_items", {
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
var resources = pgTable("resources", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  clientId: integer("clientId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: resourceCategoryEnum("category").default("other").notNull(),
  fileUrl: text("fileUrl"),
  externalUrl: text("externalUrl"),
  content: text("content"),
  isPublic: boolean("isPublic").default(true).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull()
});
var metrics = pgTable("metrics", {
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

// server/_core/env.ts
var ENV = {
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
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
async function createClient(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(clients).values(data);
  return result[0].insertId;
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
async function grantClientAccess(userId, clientId) {
  const db = await getDb();
  if (!db) return;
  const existing = await db.select().from(clientAccess).where(and(eq(clientAccess.userId, userId), eq(clientAccess.clientId, clientId))).limit(1);
  if (existing.length === 0) {
    await db.insert(clientAccess).values({ userId, clientId });
  }
}
async function getPhasesByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projectPhases).where(eq(projectPhases.clientId, clientId)).orderBy(asc(projectPhases.order));
}
async function createPhase(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(projectPhases).values(data);
  return result[0].insertId;
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
async function getOkrsByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(okrs).where(eq(okrs.clientId, clientId)).orderBy(asc(okrs.createdAt));
}
async function createOkr(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(okrs).values(data);
  return result[0].insertId;
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
async function getMilestonesByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(milestones).where(eq(milestones.clientId, clientId)).orderBy(asc(milestones.date));
}
async function createMilestone(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(milestones).values(data);
  return result[0].insertId;
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
  return db.select().from(learnings).where(eq(learnings.clientId, clientId)).orderBy(asc(learnings.date));
}
async function createLearning(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(learnings).values(data);
  return result[0].insertId;
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
  const result = await db.insert(scopeItems).values(data);
  return result[0].insertId;
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
  const result = await db.insert(resources).values(data);
  return result[0].insertId;
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
async function getMetricsByClient(clientId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(metrics).where(eq(metrics.clientId, clientId)).orderBy(asc(metrics.order));
}
async function createMetric(data) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const result = await db.insert(metrics).values(data);
  return result[0].insertId;
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

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/storageProxy.ts
function registerStorageProxy(app) {
  app.get("/manus-storage/*", async (req, res) => {
    const key = req.params[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }
    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }
    try {
      const forgeUrl = new URL(
        "v1/storage/presign/get",
        ENV.forgeApiUrl.replace(/\/+$/, "") + "/"
      );
      forgeUrl.searchParams.set("path", key);
      const forgeResp = await fetch(forgeUrl, {
        headers: { Authorization: `Bearer ${ENV.forgeApiKey}` }
      });
      if (!forgeResp.ok) {
        const body = await forgeResp.text().catch(() => "");
        console.error(`[StorageProxy] forge error: ${forgeResp.status} ${body}`);
        res.status(502).send("Storage backend error");
        return;
      }
      const { url } = await forgeResp.json();
      if (!url) {
        res.status(502).send("Empty signed URL from backend");
        return;
      }
      res.set("Cache-Control", "no-store");
      res.redirect(307, url);
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  });
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
import { z as z2 } from "zod";

// server/_core/password.ts
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
var scryptAsync = promisify(scrypt);
var KEYLEN = 64;
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

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
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

// server/routers.ts
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
var appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    // Login por email + contraseña. Crea la sesión (cookie firmada) si las
    // credenciales son válidas. Mensaje genérico ante cualquier fallo para no
    // revelar si el email existe.
    login: publicProcedure.input(
      z2.object({
        email: z2.string().email("Email inv\xE1lido"),
        password: z2.string().min(1, "Ingres\xE1 tu contrase\xF1a")
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
    get: adminProcedure2.input(z2.object({ id: z2.number() })).query(
      ({ input }) => getClientById(input.id)
    ),
    create: adminProcedure2.input(
      z2.object({
        slug: z2.string().min(2).max(64),
        name: z2.string().min(2).max(255),
        description: z2.string().optional(),
        logoUrl: z2.string().optional(),
        branding: z2.object({
          primaryColor: z2.string(),
          accentColor: z2.string(),
          backgroundColor: z2.string(),
          textColor: z2.string(),
          fontDisplay: z2.string(),
          fontBody: z2.string(),
          fontAccent: z2.string().optional()
        }).optional(),
        consultorName: z2.string().optional(),
        startDate: z2.date().optional()
      })
    ).mutation(({ input }) => createClient(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        logoUrl: z2.string().optional(),
        branding: z2.any().optional(),
        consultorName: z2.string().optional(),
        isActive: z2.boolean().optional()
      })
    ).mutation(({ input }) => {
      const { id, ...data } = input;
      return updateClient(id, data);
    }),
    grantAccess: adminProcedure2.input(z2.object({ userId: z2.number(), clientId: z2.number() })).mutation(({ input }) => grantClientAccess(input.userId, input.clientId)),
    // For the current logged-in client user: get their accessible clients
    myClients: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role === "admin") return getAllClients();
      const accesses = await getClientAccessForUser(ctx.user.id);
      const clientIds = accesses.map((a) => a.clientId);
      const all = await getAllClients();
      return all.filter((c) => clientIds.includes(c.id));
    })
  }),
  // ─── PHASES ──────────────────────────────────────────────────────────────
  phases: router({
    list: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getPhasesByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z2.object({
        clientId: z2.number(),
        name: z2.string(),
        description: z2.string().optional(),
        status: z2.enum(["completed", "in_progress", "pending"]).default("pending"),
        startDate: z2.date().optional(),
        endDate: z2.date().optional(),
        order: z2.number().default(0),
        color: z2.string().optional()
      })
    ).mutation(({ input }) => createPhase(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        name: z2.string().optional(),
        description: z2.string().optional(),
        status: z2.enum(["completed", "in_progress", "pending"]).optional(),
        startDate: z2.date().optional(),
        endDate: z2.date().optional(),
        order: z2.number().optional(),
        color: z2.string().optional()
      })
    ).mutation(({ input }) => {
      const { id, ...data } = input;
      return updatePhase(id, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number() })).mutation(({ input }) => deletePhase(input.id))
  }),
  // ─── OKRs ────────────────────────────────────────────────────────────────
  okrs: router({
    list: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getOkrsByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z2.object({
        clientId: z2.number(),
        phaseId: z2.number().optional(),
        objective: z2.string(),
        keyResult: z2.string(),
        targetValue: z2.string().optional(),
        currentValue: z2.string().optional(),
        unit: z2.string().optional(),
        progressPct: z2.number().min(0).max(100).default(0),
        status: z2.enum(["on_track", "at_risk", "off_track", "completed"]).default("on_track"),
        period: z2.string().optional(),
        notes: z2.string().optional()
      })
    ).mutation(({ input }) => createOkr(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        clientId: z2.number(),
        objective: z2.string().optional(),
        keyResult: z2.string().optional(),
        targetValue: z2.string().optional(),
        currentValue: z2.string().optional(),
        progressPct: z2.number().min(0).max(100).optional(),
        status: z2.enum(["on_track", "at_risk", "off_track", "completed"]).optional(),
        period: z2.string().optional(),
        notes: z2.string().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateOkr(id, clientId, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number(), clientId: z2.number() })).mutation(({ input }) => deleteOkr(input.id, input.clientId))
  }),
  // ─── MILESTONES ──────────────────────────────────────────────────────────
  milestones: router({
    list: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getMilestonesByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z2.object({
        clientId: z2.number(),
        phaseId: z2.number().optional(),
        title: z2.string(),
        description: z2.string().optional(),
        date: z2.date(),
        status: z2.enum(["completed", "in_progress", "pending"]).default("pending"),
        category: z2.enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"]).default("other"),
        impact: z2.enum(["high", "medium", "low"]).default("medium")
      })
    ).mutation(({ input }) => createMilestone(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        clientId: z2.number(),
        title: z2.string().optional(),
        description: z2.string().optional(),
        date: z2.date().optional(),
        status: z2.enum(["completed", "in_progress", "pending"]).optional(),
        category: z2.enum(["strategy", "implementation", "training", "automation", "content", "analytics", "other"]).optional(),
        impact: z2.enum(["high", "medium", "low"]).optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateMilestone(id, clientId, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number(), clientId: z2.number() })).mutation(({ input }) => deleteMilestone(input.id, input.clientId))
  }),
  // ─── LEARNINGS ───────────────────────────────────────────────────────────
  learnings: router({
    list: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getLearningsByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z2.object({
        clientId: z2.number(),
        phaseId: z2.number().optional(),
        type: z2.enum(["learning", "obstacle", "win"]).default("learning"),
        title: z2.string(),
        description: z2.string(),
        resolution: z2.string().optional(),
        date: z2.date(),
        isResolved: z2.boolean().default(false)
      })
    ).mutation(({ input }) => createLearning(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        clientId: z2.number(),
        type: z2.enum(["learning", "obstacle", "win"]).optional(),
        title: z2.string().optional(),
        description: z2.string().optional(),
        resolution: z2.string().optional(),
        date: z2.date().optional(),
        isResolved: z2.boolean().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateLearning(id, clientId, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number(), clientId: z2.number() })).mutation(({ input }) => deleteLearning(input.id, input.clientId))
  }),
  // ─── SCOPE ───────────────────────────────────────────────────────────────
  scope: router({
    list: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getScopeByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z2.object({
        clientId: z2.number(),
        title: z2.string(),
        description: z2.string().optional(),
        inScope: z2.boolean().default(true),
        category: z2.string().optional(),
        order: z2.number().default(0)
      })
    ).mutation(({ input }) => createScopeItem(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        clientId: z2.number(),
        title: z2.string().optional(),
        description: z2.string().optional(),
        inScope: z2.boolean().optional(),
        category: z2.string().optional(),
        order: z2.number().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateScopeItem(id, clientId, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number(), clientId: z2.number() })).mutation(({ input }) => deleteScopeItem(input.id, input.clientId))
  }),
  // ─── RESOURCES ───────────────────────────────────────────────────────────
  resources: router({
    list: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getResourcesByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z2.object({
        clientId: z2.number(),
        title: z2.string(),
        description: z2.string().optional(),
        category: z2.enum(["document", "template", "script", "training", "guide", "other"]).default("other"),
        fileUrl: z2.string().optional(),
        externalUrl: z2.string().optional(),
        content: z2.string().optional(),
        isPublic: z2.boolean().default(true),
        order: z2.number().default(0)
      })
    ).mutation(({ input }) => createResource(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        clientId: z2.number(),
        title: z2.string().optional(),
        description: z2.string().optional(),
        category: z2.enum(["document", "template", "script", "training", "guide", "other"]).optional(),
        fileUrl: z2.string().optional(),
        externalUrl: z2.string().optional(),
        content: z2.string().optional(),
        isPublic: z2.boolean().optional(),
        order: z2.number().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateResource(id, clientId, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number(), clientId: z2.number() })).mutation(({ input }) => deleteResource(input.id, input.clientId))
  }),
  // ─── METRICS ─────────────────────────────────────────────────────────────
  metrics: router({
    list: protectedProcedure.input(z2.object({ clientId: z2.number() })).query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") await assertClientAccess(ctx.user.id, input.clientId);
      return getMetricsByClient(input.clientId);
    }),
    create: adminProcedure2.input(
      z2.object({
        clientId: z2.number(),
        name: z2.string(),
        value: z2.string(),
        previousValue: z2.string().optional(),
        unit: z2.string().optional(),
        trend: z2.enum(["up", "down", "stable"]).default("stable"),
        description: z2.string().optional(),
        period: z2.string().optional(),
        order: z2.number().default(0)
      })
    ).mutation(({ input }) => createMetric(input)),
    update: adminProcedure2.input(
      z2.object({
        id: z2.number(),
        clientId: z2.number(),
        name: z2.string().optional(),
        value: z2.string().optional(),
        previousValue: z2.string().optional(),
        unit: z2.string().optional(),
        trend: z2.enum(["up", "down", "stable"]).optional(),
        description: z2.string().optional(),
        period: z2.string().optional(),
        order: z2.number().optional()
      })
    ).mutation(({ input }) => {
      const { id, clientId, ...data } = input;
      return updateMetric(id, clientId, data);
    }),
    delete: adminProcedure2.input(z2.object({ id: z2.number(), clientId: z2.number() })).mutation(({ input }) => deleteMetric(input.id, input.clientId))
  })
});

// server/_core/context.ts
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

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
