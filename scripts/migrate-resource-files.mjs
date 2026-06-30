// Migración: múltiples archivos por recurso de Biblioteca de Formación.
//   - resources.fileUrls (json [{url,name}][]) — nueva columna, varios archivos
//     por recurso. fileUrl (singular) queda intacta solo por compat de lectura.
//   - Migra los fileUrl existentes a fileUrls=[{url, name}] derivando el
//     nombre original del path (quita el prefijo "<timestamp>_" que agrega
//     uploadClientFile en client/src/lib/storage.ts).
//
// Uso: node scripts/migrate-resource-files.mjs
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
    ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS "fileUrls" json
  `;
  console.log("• resources.fileUrls agregada.");

  const rows = await sql`
    SELECT id, "fileUrl" FROM resources
    WHERE "fileUrl" IS NOT NULL AND "fileUrls" IS NULL
  `;

  for (const row of rows) {
    const basename = row.fileUrl.split("/").pop() ?? "archivo";
    const name = basename.replace(/^\d+_/, "");
    await sql`
      UPDATE resources SET "fileUrls" = ${sql.json([{ url: row.fileUrl, name }])}
      WHERE id = ${row.id}
    `;
  }
  console.log(`• ${rows.length} recurso(s) con fileUrl migrados a fileUrls.`);

  console.log("✓ Migración aplicada correctamente.");
} finally {
  await sql.end();
}
