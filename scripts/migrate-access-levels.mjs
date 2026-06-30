// Migración: niveles de acceso (Dueño/Miembro) para usuarios de un cliente.
//   - client_access.accessLevel varchar(16) default 'owner'
//   - clients.memberVisibleSections (json) — secciones confidenciales habilitadas
//     para los usuarios "member" de ese cliente.
//
// Uso: node scripts/migrate-access-levels.mjs
// Lee DATABASE_URL desde .env.vercel (producción Supabase), NO desde .env
// (que apunta a la base local de desarrollo).

import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config({ path: ".env.vercel" });

if (!process.env.DATABASE_URL) {
  console.error("✗ No se encontró DATABASE_URL en .env.vercel");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });

try {
  await sql`
    ALTER TABLE client_access
    ADD COLUMN IF NOT EXISTS "accessLevel" varchar(16) NOT NULL DEFAULT 'owner'
  `;
  console.log("• client_access.accessLevel agregada (default 'owner').");

  await sql`
    ALTER TABLE clients
    ADD COLUMN IF NOT EXISTS "memberVisibleSections" json
  `;
  console.log("• clients.memberVisibleSections agregada.");

  console.log("✓ Migración aplicada correctamente.");
} finally {
  await sql.end();
}
