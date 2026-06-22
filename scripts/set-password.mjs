// Asigna (o actualiza) la contraseña de un usuario para el login email+clave.
// Crea el usuario si no existe. Opcionalmente lo marca como admin o le da
// acceso a un cliente por slug.
//
// Uso:
//   node scripts/set-password.mjs <email> <password> [--admin] [--name="Nombre"] [--client=<slug>]
//
// Ejemplos:
//   node scripts/set-password.mjs gumercindoweb@gmail.com "MiClave123" --admin --name="Gumercindo Jiménez"
//   node scripts/set-password.mjs cliente@sdt.com "ClaveCliente" --name="Sensaciones de Tango" --client=sensaciones-de-tango
//
// El hash usa scrypt con el mismo formato que server/_core/password.ts:
//   "scrypt:<saltHex>:<hashHex>"  (salt 16 bytes, keylen 64)

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { randomBytes, scryptSync } from "node:crypto";

dotenv.config();

function hashPassword(plain) {
  const salt = randomBytes(16);
  const derived = scryptSync(plain, salt, 64);
  return `scrypt:${salt.toString("hex")}:${derived.toString("hex")}`;
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      flags[key] = rest.length > 0 ? rest.join("=") : true;
    } else {
      positional.push(arg);
    }
  }
  return { positional, flags };
}

const { positional, flags } = parseArgs(process.argv.slice(2));
const [emailRaw, password] = positional;

if (!emailRaw || !password) {
  console.error(
    "Uso: node scripts/set-password.mjs <email> <password> [--admin] [--name=\"Nombre\"] [--client=<slug>]"
  );
  process.exit(1);
}

const email = emailRaw.trim().toLowerCase();
const role = flags.admin ? "admin" : "user";
const name = typeof flags.name === "string" ? flags.name : null;
const clientSlug = typeof flags.client === "string" ? flags.client : null;

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── 1. Asegurar que existe la columna passwordHash ──────────────────────────
const [cols] = await conn.query(
  `SELECT COLUMN_NAME FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'passwordHash'`
);
if (cols.length === 0) {
  await conn.execute(
    `ALTER TABLE users ADD COLUMN passwordHash VARCHAR(255) NULL AFTER loginMethod`
  );
  console.log("• Columna passwordHash agregada a users.");
}

// ─── 2. Crear o actualizar el usuario ────────────────────────────────────────
// Buscamos por EMAIL: si ya existe un usuario con ese correo (p. ej. el admin
// creado por OAuth/seed), actualizamos esa fila en vez de crear un duplicado.
const passwordHash = hashPassword(password);

const [existing] = await conn.query(
  `SELECT id, openId FROM users WHERE email = ? LIMIT 1`,
  [email]
);

let userId;
if (existing.length > 0) {
  userId = existing[0].id;
  await conn.execute(
    `UPDATE users
       SET passwordHash = ?, role = ?, loginMethod = 'password',
           name = COALESCE(?, name)
     WHERE id = ?`,
    [passwordHash, role, name, userId]
  );
  console.log(`• Usuario existente actualizado (openId=${existing[0].openId}).`);
} else {
  // openId derivado del email (estable, no colisiona con los openId de OAuth).
  const openId = `local:${email}`.slice(0, 64);
  const [res] = await conn.execute(
    `INSERT INTO users (openId, name, email, loginMethod, passwordHash, role)
     VALUES (?, ?, ?, 'password', ?, ?)`,
    [openId, name, email, passwordHash, role]
  );
  userId = res.insertId;
  console.log(`• Usuario nuevo creado (openId=${openId}).`);
}

// ─── 3. Acceso a cliente (opcional) ──────────────────────────────────────────
if (clientSlug) {
  const [[clientRow]] = await conn.query(
    `SELECT id, name FROM clients WHERE slug = ? LIMIT 1`,
    [clientSlug]
  );
  if (!clientRow) {
    console.error(`✗ No existe ningún cliente con slug "${clientSlug}".`);
    await conn.end();
    process.exit(1);
  }
  const [access] = await conn.query(
    `SELECT id FROM client_access WHERE userId = ? AND clientId = ?`,
    [userId, clientRow.id]
  );
  if (access.length === 0) {
    await conn.execute(
      `INSERT INTO client_access (userId, clientId) VALUES (?, ?)`,
      [userId, clientRow.id]
    );
  }
  console.log(`• Acceso otorgado a "${clientRow.name}" (clientId=${clientRow.id}).`);
}

console.log(`✓ Usuario listo: ${email} · rol=${role}`);
await conn.end();
