import mysql from "mysql2/promise";
import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || (() => { throw new Error("Set SUPABASE_URL env var"); })();
const MYSQL_URL = process.env.DATABASE_URL || "mysql://root@localhost:3306/sensaciones";

const pg = postgres(SUPABASE_URL, { ssl: "require" });
const my = await mysql.createConnection(MYSQL_URL);

async function migrateTable(name, rows) {
  if (!rows.length) { console.log(`  ${name}: 0 filas, saltando`); return; }
  try {
    await pg.unsafe(`DELETE FROM "${name}"`);
    for (const row of rows) {
      const keys = Object.keys(row);
      const cols = keys.map(k => `"${k}"`).join(", ");
      const vals = keys.map((_, i) => `$${i + 1}`).join(", ");
      const values = keys.map(k => {
        const v = row[k];
        if (v instanceof Date) return v;
        if (typeof v === "object" && v !== null) return JSON.stringify(v);
        return v;
      });
      await pg.unsafe(`INSERT INTO "${name}" (${cols}) OVERRIDING SYSTEM VALUE VALUES (${vals})`, values);
    }
    console.log(`  ✓ ${name}: ${rows.length} filas migradas`);
  } catch (e) {
    console.error(`  ✗ ${name}: ${e.message}`);
  }
}

console.log("Migrando datos de MySQL → Supabase...\n");

const tables = ["users", "clients", "client_access", "project_phases", "okrs", "milestones", "learnings", "scope_items", "resources", "metrics"];

for (const table of tables) {
  try {
    const [rows] = await my.query(`SELECT * FROM \`${table}\``);
    await migrateTable(table, rows);
  } catch (e) {
    console.log(`  ${table}: no existe localmente, saltando`);
  }
}

// Reset sequences so new inserts don't collide
const seqTables = ["users", "clients", "client_access", "project_phases", "okrs", "milestones", "learnings", "scope_items", "resources", "metrics"];
for (const t of seqTables) {
  try {
    await pg.unsafe(`SELECT setval(pg_get_serial_sequence('"${t}"', 'id'), COALESCE((SELECT MAX(id) FROM "${t}"), 0) + 1, false)`);
  } catch {}
}

console.log("\n✓ Migración completa.");
await my.end();
await pg.end();
