import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

// openId del usuario admin de desarrollo (ver seed-dev.mjs)
const DEV_ADMIN_OPEN_ID = "dev-admin";

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  // ─── DEV AUTH BYPASS ──────────────────────────────────────────────────────
  // En desarrollo (NODE_ENV !== "production") no hay OAuth de Manus disponible,
  // así que si no hay sesión válida entramos automáticamente como el admin de
  // desarrollo. En producción este bloque nunca se ejecuta.
  if (!user && !ENV.isProduction) {
    user = (await db.getUserByOpenId(DEV_ADMIN_OPEN_ID)) ?? null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
