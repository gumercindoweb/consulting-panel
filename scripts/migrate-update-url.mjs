// Migración: URL de referencia opcional en las actualizaciones del proyecto.
//   - project_updates.url text nullable — link de referencia (publicación,
//     entregable, documento) que se muestra en el feed y en la Hoja de Ruta.
//
// Uso: node scripts/migrate-update-url.mjs
// Lee DATABASE_URL desde .env.vercel (producción Supabase).

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
    ALTER TABLE project_updates
    ADD COLUMN IF NOT EXISTS "url" text
  `;
  console.log("• project_updates.url agregada.");
  console.log("✓ Migración aplicada correctamente.");
} finally {
  await sql.end();
}
