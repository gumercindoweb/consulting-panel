import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const milestones = [
  {
    title: "Auditoria inicial del negocio",
    description: "Relevamiento completo de la situacion actual: flujos de reserva manuales por WhatsApp, ausencia de base de datos de clientes, canales de comunicacion activos y oportunidades de automatizacion. Identificacion de los principales puntos de friccion en la experiencia del cliente.",
    date: "2025-08-15",
    category: "strategy",
    impact: "high"
  },
  {
    title: "Conexion de ManyChat a WhatsApp e Instagram",
    description: "Implementacion tecnica de la integracion de ManyChat con los canales de comunicacion del show. Configuracion inicial del bot y definicion de los flujos de respuesta automatica.",
    date: "2025-09-01",
    category: "automation",
    impact: "high"
  },
  {
    title: "Creacion de 6 plantillas de mensajes trilingues",
    description: "Desarrollo y activacion de 6 plantillas de mensajes en espanol, ingles y portugues para el flujo de reservas por WhatsApp. Cobertura de los principales escenarios: consulta de disponibilidad, confirmacion de reserva, recordatorio de show y seguimiento post-show.",
    date: "2025-09-15",
    category: "content",
    impact: "high"
  },
  {
    title: "Identificacion del mercado brasileno como prioridad",
    description: "Analisis de conversaciones entrantes revelo que el 58% del publico potencial es de habla portuguesa. Este hallazgo redefinio la estrategia de comunicacion y la prioridad de los recursos a desarrollar.",
    date: "2025-10-01",
    category: "analytics",
    impact: "high"
  },
  {
    title: "Primera ronda de capacitacion a vendedoras digitales",
    description: "Capacitacion del equipo de vendedoras en el uso de herramientas digitales, guiones de venta y protocolos de atencion al cliente. Foco en la adopcion de ManyChat y los nuevos flujos de comunicacion.",
    date: "2026-01-15",
    category: "training",
    impact: "medium"
  },
  {
    title: "Documentacion de protocolos de reserva",
    description: "Creacion del manual de protocolos de reserva y comunicacion. Estandarizacion de los procesos de atencion al cliente para garantizar consistencia en la experiencia del turista.",
    date: "2026-02-01",
    category: "implementation",
    impact: "medium"
  },
  {
    title: "Segunda ronda de capacitacion y refinamiento de guiones",
    description: "Segunda instancia de capacitacion con el equipo. Ajuste de guiones de conversion basado en los aprendizajes del Q1. Simplificacion de los flujos de atencion para reducir la friccion operativa.",
    date: "2026-03-01",
    category: "training",
    impact: "medium"
  },
  {
    title: "Lanzamiento del Plan Estrategico 2026",
    description: "Presentacion y activacion del Plan Estrategico 2026 con tres fases definidas: Auditoria en caliente, Bot minimo viable y Marketing Solido 360. Inicio de la Fase 1: relevamiento de datos reales de trafico y conversion.",
    date: "2026-05-01",
    category: "strategy",
    impact: "high"
  }
];

for (const m of milestones) {
  await conn.execute(
    `INSERT INTO milestones (clientId, title, description, date, status, category, impact) VALUES (1, ?, ?, ?, 'completed', ?, ?)`,
    [m.title, m.description, m.date, m.category, m.impact]
  );
}

// Update the last milestone to in_progress
await conn.execute(
  `UPDATE milestones SET status = 'in_progress' WHERE clientId = 1 AND title = 'Lanzamiento del Plan Estrategico 2026'`
);

console.log("Hitos insertados exitosamente.");
await conn.end();
