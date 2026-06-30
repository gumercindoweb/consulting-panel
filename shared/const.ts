export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Fuente única de verdad de las secciones del portal del cliente. Usado por:
// el toggle general "PORTAL DEL CLIENTE" (visibleSections, todos los usuarios),
// el panel "SECCIONES PARA MIEMBROS DEL EQUIPO" (memberVisibleSections), y el
// sidebar/portal para resolver labels.
export const CLIENT_PORTAL_SECTIONS = [
  { id: "overview", label: "Resumen ejecutivo" },
  { id: "updates", label: "Actualizaciones" },
  { id: "timeline", label: "Hoja de Ruta" },
  { id: "milestones", label: "Hitos e implementaciones" },
  { id: "okrs", label: "Objetivos" },
  { id: "metrics", label: "Métricas del negocio" },
  { id: "learnings", label: "Aprendizajes y obstáculos" },
  { id: "scope", label: "Alcance del proyecto" },
  { id: "resources", label: "Biblioteca de formación" },
  { id: "digital_assets", label: "Activos digitales" },
  { id: "backlog", label: "Backlog de ideas" },
] as const;

// Secciones controlables para usuarios nivel "member" (empleados del cliente):
// TODAS menos "overview" (el resumen ejecutivo siempre queda visible como
// landing). Por defecto (memberVisibleSections vacío/null) un member NO ve
// ninguna — el admin tiene que habilitarlas explícitamente una por una desde
// el panel "SECCIONES PARA MIEMBROS DEL EQUIPO".
export const MEMBER_GATED_SECTIONS = CLIENT_PORTAL_SECTIONS
  .filter((s) => s.id !== "overview")
  .map((s) => s.id);
