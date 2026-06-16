import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(conn);

// Insert OKRs
await conn.execute(`INSERT INTO okrs (clientId, objective, keyResult, targetValue, currentValue, unit, progressPct, status, period) VALUES (1, 'Automatizar reservas por WhatsApp', 'Bot de reservas con respuesta menor a 2 minutos', '100', '30', '%', 30, 'on_track', 'Q2 2026')`);
await conn.execute(`INSERT INTO okrs (clientId, objective, keyResult, targetValue, currentValue, unit, progressPct, status, period) VALUES (1, 'Aumentar tasa de conversion', 'Pasar de 15% al 35% de conversion', '35', '15', '%', 15, 'at_risk', 'Q2-Q3 2026')`);
await conn.execute(`INSERT INTO okrs (clientId, objective, keyResult, targetValue, currentValue, unit, progressPct, status, period) VALUES (1, 'Activar mercado brasileno', 'Flujo especifico en portugues para turistas', '100', '60', '%', 60, 'on_track', 'Q2 2026')`);
await conn.execute(`INSERT INTO okrs (clientId, objective, keyResult, targetValue, currentValue, unit, progressPct, status, period) VALUES (1, 'Construir base de datos de clientes', 'Capturar datos de 500 visitantes del Cafe Tortoni', '500', '0', 'contactos', 0, 'on_track', 'Q2-Q3 2026')`);
await conn.execute(`INSERT INTO okrs (clientId, objective, keyResult, targetValue, currentValue, unit, progressPct, status, period) VALUES (1, 'Posicionamiento en redes sociales', 'Alcanzar 10.000 seguidores en Instagram', '10000', '0', 'seguidores', 0, 'on_track', 'Q3 2026')`);

// Insert learnings
await conn.execute(`INSERT INTO learnings (clientId, type, title, description, date, isResolved) VALUES (1, 'learning', 'El trafico organico del Cafe Tortoni es una ventaja competitiva enorme', 'El Cafe Tortoni recibe miles de turistas diariamente. La mayoria no sabe que existe el show de tango. La captacion en el punto de contacto fisico es la oportunidad mas grande del negocio.', '2025-09-01', 0)`);
await conn.execute(`INSERT INTO learnings (clientId, type, title, description, date, isResolved) VALUES (1, 'learning', 'El mercado brasileno representa el 58% del publico potencial', 'Analisis de conversaciones revelo que la mayoria de consultas entrantes son en portugues. Esto define la prioridad de comunicacion y los recursos a desarrollar.', '2025-10-01', 0)`);
await conn.execute(`INSERT INTO learnings (clientId, type, title, description, resolution, date, isResolved) VALUES (1, 'obstacle', 'Resistencia inicial al cambio en el equipo de vendedoras', 'Las vendedoras digitales mostraron resistencia a adoptar nuevas herramientas y protocolos de comunicacion digital.', 'Se realizaron capacitaciones progresivas con enfoque practico. Se simplificaron los guiones y se redujo la friccion en el uso de las herramientas.', '2026-01-15', 1)`);
await conn.execute(`INSERT INTO learnings (clientId, type, title, description, resolution, date, isResolved) VALUES (1, 'obstacle', 'Falta de datos historicos sistematizados', 'El negocio opero 20 anos sin registros digitales de clientes, reservas o metricas. No habia baseline de datos para medir el punto de partida.', 'Se establecio el Q1 2026 como etapa de baseline: comenzar a registrar datos desde cero para tener metricas reales en el Plan 2026.', '2026-01-01', 1)`);
await conn.execute(`INSERT INTO learnings (clientId, type, title, description, date, isResolved) VALUES (1, 'win', 'Implementacion exitosa de comunicacion trilingue', 'Las 6 plantillas de mensajes en ES/EN/PT fueron implementadas y estan en uso activo. Reduccion del tiempo de respuesta manual y mejora en la experiencia del turista internacional.', '2025-09-15', 0)`);
await conn.execute(`INSERT INTO learnings (clientId, type, title, description, date, isResolved) VALUES (1, 'win', 'Capacitacion completada del equipo de vendedoras', 'Dos rondas de capacitacion completadas. El equipo maneja con mayor fluidez los protocolos de reserva digital y los guiones de conversion.', '2026-03-01', 0)`);

// Insert scope items
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Estrategia de marketing digital', 'Definicion y ejecucion de estrategia en redes sociales, contenido y posicionamiento.', 1, 'Marketing', 1)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Automatizacion de reservas por WhatsApp', 'Implementacion de bots y flujos automaticos de atencion y reserva.', 1, 'Automatizacion', 2)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Capacitacion del equipo de vendedoras', 'Formacion en herramientas digitales, guiones de venta y protocolos de atencion.', 1, 'Capacitacion', 3)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Comunicacion trilingue ES/EN/PT', 'Desarrollo de materiales y guiones en espanol, ingles y portugues.', 1, 'Contenido', 4)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Analisis de datos y metricas de conversion', 'Seguimiento de tasas de conversion, trafico y comportamiento de clientes.', 1, 'Analitica', 5)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Gestion del sistema de tickets online', 'Integracion y optimizacion del sistema tickets.sensacionesdetango.com.', 1, 'Tecnologia', 6)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Desarrollo del sitio web', 'Diseno, desarrollo o rediseno del sitio web del show.', 0, 'Tecnologia', 7)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Gestion de la produccion artistica del show', 'Direccion artistica, coreografias, casting o produccion del espectaculo.', 0, 'Produccion', 8)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Negociacion con el Cafe Tortoni', 'Gestion del contrato o relacion comercial con el venue.', 0, 'Operaciones', 9)`);
await conn.execute(`INSERT INTO scope_items (clientId, title, description, inScope, category, \`order\`) VALUES (1, 'Publicidad paga Meta Ads Google Ads', 'Gestion de campanas de publicidad pagada en plataformas digitales.', 0, 'Marketing', 10)`);

// Insert metrics
await conn.execute(`INSERT INTO metrics (clientId, name, value, unit, trend, description, period, \`order\`) VALUES (1, 'Capacidad del show', '80', 'personas/funcion', 'stable', 'Capacidad maxima de la sala del Cafe Tortoni', 'Permanente', 1)`);
await conn.execute(`INSERT INTO metrics (clientId, name, value, unit, trend, description, period, \`order\`) VALUES (1, 'Funciones por semana', '14', 'funciones', 'stable', 'Lun-Jue: 2 funciones/dia. Vie-Sab: 3 funciones/dia. Dom: cerrado', 'Permanente', 2)`);
await conn.execute(`INSERT INTO metrics (clientId, name, value, unit, trend, description, period, \`order\`) VALUES (1, 'Mercado brasileno', '58', '% del publico', 'stable', 'Porcentaje estimado de turistas de habla portuguesa', 'Estimado 2025', 3)`);
await conn.execute(`INSERT INTO metrics (clientId, name, value, unit, trend, description, period, \`order\`) VALUES (1, 'Plantillas activas', '6', 'plantillas', 'up', 'Plantillas trilingues implementadas en WhatsApp', 'Activo desde Sep 2025', 4)`);
await conn.execute(`INSERT INTO metrics (clientId, name, value, unit, trend, description, period, \`order\`) VALUES (1, 'Duracion del show', '60', 'minutos', 'stable', 'Duracion estandar del espectaculo', 'Permanente', 5)`);

// Insert resources
await conn.execute(`INSERT INTO resources (clientId, title, description, category, externalUrl, \`order\`) VALUES (1, 'Guion de atencion al cliente en WhatsApp', 'Protocolo completo de respuesta a consultas de reserva en espanol, ingles y portugues.', 'script', NULL, 1)`);
await conn.execute(`INSERT INTO resources (clientId, title, description, category, externalUrl, \`order\`) VALUES (1, 'Sistema de tickets online', 'Plataforma de venta de entradas online del show.', 'guide', 'https://tickets.sensacionesdetango.com', 2)`);
await conn.execute(`INSERT INTO resources (clientId, title, description, category, externalUrl, \`order\`) VALUES (1, 'Sitio web oficial', 'Sitio web de Sensaciones de Tango con informacion del show, horarios y reservas.', 'guide', 'https://sensacionesdetango.com', 3)`);
await conn.execute(`INSERT INTO resources (clientId, title, description, category, externalUrl, \`order\`) VALUES (1, 'WhatsApp de reservas', 'Canal principal de reservas y atencion al cliente por WhatsApp.', 'guide', 'https://wa.me/5491150108040', 4)`);

console.log("Seed completado exitosamente.");
await conn.end();
