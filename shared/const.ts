export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Secciones consideradas "confidenciales": los usuarios nivel "member"
// (empleados del cliente) solo las ven si el admin las habilitó explícitamente
// en clients.memberVisibleSections. El resto de secciones (resumen, hoja de
// ruta, hitos, aprendizajes, alcance, métricas) quedan visibles para members
// igual que para el dueño, sujetas solo al toggle general visibleSections.
export const MEMBER_GATED_SECTIONS = [
  "resources",
  "digital_assets",
  "backlog",
  "okrs",
  "updates",
] as const;
