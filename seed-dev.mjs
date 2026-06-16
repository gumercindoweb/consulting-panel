// Seed base para desarrollo local: usuario admin, cliente SDT y fases del proyecto.
// Idempotente: se puede correr varias veces sin duplicar.
// Orden de ejecución recomendado: seed-dev.mjs → seed-sdt.mjs → seed-milestones.mjs
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// ─── Usuario admin de desarrollo (usado por el dev auth bypass) ──────────────
await conn.execute(
  `INSERT INTO users (openId, name, email, loginMethod, role)
   VALUES ('dev-admin', 'Gumercindo Jiménez', 'gumercindoweb@gmail.com', 'dev', 'admin')
   ON DUPLICATE KEY UPDATE role = 'admin', name = VALUES(name)`
);
const [[adminRow]] = await conn.query(
  `SELECT id FROM users WHERE openId = 'dev-admin' LIMIT 1`
);
const adminId = adminRow.id;

// ─── Cliente: Sensaciones de Tango (id = 1) ──────────────────────────────────
const branding = JSON.stringify({
  primaryColor: "#B32825", // rojo
  accentColor: "#D9A441", // oro
  backgroundColor: "#0B0807", // noir
  textColor: "#F5EFE6",
  fontDisplay: "Playfair Display",
  fontBody: "Hanken Grotesk",
  fontAccent: "Bebas Neue",
});

await conn.execute(
  `INSERT INTO clients (id, slug, name, description, consultorName, branding, startDate, isActive)
   VALUES (1, 'sensaciones-de-tango',
           'Sensaciones de Tango',
           'Show de tango íntimo y auténtico en el corazón de Buenos Aires. Café Tortoni, Av. de Mayo 825, CABA.',
           'Gumercindo Jiménez',
           ?, '2025-08-01', 1)
   ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description),
           consultorName = VALUES(consultorName), branding = VALUES(branding)`,
  [branding]
);

// ─── Acceso del admin al cliente ─────────────────────────────────────────────
const [accessRows] = await conn.query(
  `SELECT id FROM client_access WHERE userId = ? AND clientId = 1`,
  [adminId]
);
if (accessRows.length === 0) {
  await conn.execute(
    `INSERT INTO client_access (userId, clientId) VALUES (?, 1)`,
    [adminId]
  );
}

// ─── Fases del proyecto ──────────────────────────────────────────────────────
const phases = [
  ["Diagnóstico", "Auditoría inicial del negocio: relevamiento de flujos, canales y oportunidades.", "completed", "2025-08-01", "2025-10-31", 1, "#D9A441"],
  ["Q1 Optimización", "Capacitación del equipo, plantillas trilingües y protocolos de reserva.", "completed", "2025-11-01", "2026-03-31", 2, "#E0913F"],
  ["Plan 2026 — Fase 1", "Auditoría en caliente: relevamiento de datos reales de tráfico y conversión.", "in_progress", "2026-05-01", null, 3, "#B32825"],
  ["Plan 2026 — Fase 2", "Bot mínimo viable: automatización de reservas por WhatsApp.", "pending", null, null, 4, "#8A1F1D"],
  ["Plan 2026 — Fase 3", "Marketing sólido 360: posicionamiento, redes y base de datos de clientes.", "pending", null, null, 5, "#5C1513"],
];

const [existingPhases] = await conn.query(
  `SELECT COUNT(*) AS c FROM project_phases WHERE clientId = 1`
);
if (existingPhases[0].c === 0) {
  for (const [name, description, status, startDate, endDate, order, color] of phases) {
    await conn.execute(
      `INSERT INTO project_phases (clientId, name, description, status, startDate, endDate, \`order\`, color)
       VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, status, startDate, endDate, order, color]
    );
  }
}

console.log("Seed base (admin + cliente + fases) completado exitosamente.");
await conn.end();
