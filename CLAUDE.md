# Panel de Consultoría — Gumercindo Jiménez

Panel para centralizar el seguimiento de proyectos y clientes de la consultoría de
**Gumercindo Jiménez** (gumercindoweb@gmail.com). Cada cliente tiene un portal donde
ve su Hoja de Ruta, actualizaciones, objetivos, métricas, biblioteca de formación, etc.
El admin (Gumercindo) gestiona todo el contenido.

> **Este archivo es la memoria del proyecto.** Está pensado para poder continuar el
> trabajo desde cualquier cuenta/máquina de Claude. Manténlo actualizado al agregar
> features grandes. El repo es **PÚBLICO**: nunca commitear API keys ni secretos aquí.

## Stack
- **Front**: React 19 + Vite + TypeScript + TailwindCSS. Router en `client/src`.
- **Back**: Express + **tRPC v11** (`server/routers.ts`) + **Drizzle ORM**.
- **DB**: PostgreSQL en **Supabase** (proyecto prod "Consulting Panel", ref `keanbqmcnfxuzfudxjez`).
- **Hosting**: Vercel (serverless). Proyecto `consulting-panel` → https://consulting-panel.vercel.app
- **Auth**: JWT en cookie de sesión (1 año), contraseñas con **scrypt** (`scrypt:saltHex:hashHex`). Roles `admin` (Gumercindo) y `user` (clientes). Los usuarios de cliente tienen `accessLevel` (owner / member) en `client_access`.

## Deploy (IMPORTANTE)
- **Deploy = push a `main`**. Vercel buildea solo (~30 seg). No hace falta commitear `dist-server/` (Vercel lo regenera; si aparece modificado en git, ignoralo).
- Verificar deploy con el MCP de Vercel (`get_project` / `get_deployment`, projectId `prj_SwTIegVKPSQr53qJ3Y1NWpcTZ0yY`, teamId `team_0rVrS4XHYLVe0gqwblB3TZuE`). OJO: el MCP de Vercel "por defecto" puede apuntar a otra cuenta — usar SIEMPRE ese projectId/teamId.
- Tras editar código, correr `npx tsc --noEmit` antes de commitear.
- El entorno local **no** sirve para probar datos (la DB local no está conectada a Supabase). Se valida en producción tras el deploy + refresh forzado del navegador (Cmd/Ctrl+Shift+R) porque suele quedar caché vieja.

## Base de datos y migraciones (IMPORTANTE)
- Schema en `drizzle/schema.ts`. Las columnas usan **camelCase entre comillas** en Postgres.
- **NO usar `drizzle-kit push`** (se cuelga en el prompt interactivo). Aplicar migraciones con el **MCP de Supabase** (`apply_migration`, project_id `keanbqmcnfxuzfudxjez`). Ej: `ALTER TABLE x ADD COLUMN IF NOT EXISTS ...`.
- En SQL crudo, los nombres camelCase van con comillas dobles: `"milestoneId"`, `"fileUrl"`, etc. (columnas snake/lower como `area`, `url`, `onboarding` no hace falta).
- Verificar la columna post-migración con `execute_sql` sobre `information_schema.columns`.

## Variables de entorno (en Vercel, NO en el repo)
- `DATABASE_URL`, `JWT_SECRET` — core.
- `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` — storage (scaffolding; ver más abajo).
- **Asistente IA** (proveedor compatible con OpenAI, gratis): `AI_API_URL`, `AI_API_KEY`, `AI_MODEL`.
  - En uso: **Groq** → `AI_API_URL=https://api.groq.com/openai/v1`, `AI_MODEL=llama-3.3-70b-versatile`, `AI_API_KEY=<key de console.groq.com>`.
  - Alternativa: Gemini (`AI_API_URL=https://generativelanguage.googleapis.com/v1beta/openai`, `AI_MODEL=gemini-2.0-flash`) — pero su free tier suele dar "limit: 0". Se descartó por eso.
  - Tras cambiar env vars, hacer **Redeploy** en Vercel.

## Estructura
- `server/routers.ts` — todos los endpoints tRPC (clients, phases, milestones, okrs, metrics, updates, resources, digitalAssets, backlog, learnings, scope, users, ai).
- `server/ai.ts` — asistente IA (ver abajo). `server/_core/anthropic.ts` = `invokeChat` (cliente OpenAI-compatible con reintentos). `server/db.ts` — funciones DB. `server/_core/env.ts` — env.
- `client/src/pages/AdminClientDetail.tsx` — panel admin de un cliente (tabs). **Archivo grande**; cada tab es un componente ahí adentro (UpdatesTab, ResourcesTab, MilestonesTab, etc.). Incluye el widget flotante del Asistente IA.
- `client/src/components/admin/TimelineTab.tsx` — "Hoja de Ruta" del admin (etapas → hitos → actualizaciones, drag&drop, onboarding/outboarding).
- `client/src/components/dashboard/Section*.tsx` — vistas del portal del cliente. `SectionTimeline.tsx` = Hoja de Ruta del cliente.
- `client/src/pages/ClientDashboard.tsx` — portal del cliente (usa `trpc.clients.myClients`).

## Asistente IA (`server/ai.ts`)
Widget flotante (abajo-derecha) en el panel admin de cada cliente. El consultor dicta en
lenguaje natural qué pasó y la IA **propone acciones** (con checkbox) que el admin confirma
antes de guardar. Endpoints `ai.interpret` / `ai.execute` (admin-only).
- Cliente LLM: `invokeChat` en `server/_core/anthropic.ts` (formato OpenAI, `response_format: json_object`).
- Acciones soportadas (`actionSchema`, discriminated union por `type`): `create_phase`, `update_phase`, `create_milestone`, `update_milestone`, `create_update`, `create_okr`, `update_okr`, `create_metric`, `create_learning`, `create_resource` (con `areas: string[]`), `create_backlog`.
- El modelo a veces inventa/traduce el `type` → hay un `TYPE_ALIASES` que normaliza sinónimos (ej. `create_actualization` → `create_update`) antes de validar con Zod. Al agregar una acción nueva: sumar el literal al schema, el handler en `executeActions`, mencionarla en el system prompt y (opcional) alias.

## Convenciones / gotchas
- Estilo visual: variables CSS `--gj-*` (admin) y `--creme/--oro/--rojo/--ambar` (portal SDT). Fuentes y colores por cliente vía `clients.branding` (JSON).
- Visibilidad de secciones del portal: `clients.visibleSections` (owner) y `clients.memberVisibleSections` (member), ambos JSON.
- **Storage de archivos**: subida directa del navegador a Supabase Storage bucket `panel-assets` (público) con la **anon key** (pública por diseño, hardcodeada en `client/src/lib/storage.ts`), restringida por RLS a prefijo `client-*`. No requiere env vars. Hay scaffolding server-side sin usar por si se quiere el approach con service key.
- Al pushear a `main` se necesita autorización explícita del usuario (rama por defecto).
- Mensajes de commit terminan con `Co-Authored-By: Claude ...`.

## Estado de features (todo en producción salvo que diga lo contrario)
- **Auth**: login email+clave, roles admin/user, niveles owner/member por cliente. Gestión de accesos desde el tab "ACCESOS" (sin SQL manual).
- **Admin → cliente**: tabs Actualizaciones, Hoja de Ruta, Hitos, Objetivos (OKRs), Aprendizajes, Alcance, Biblioteca de Formación (Recursos), Activos Digitales, Métricas, Backlog, Accesos. Toggle de visibilidad por sección. "Ver como cliente" para previsualizar.
- **Hoja de Ruta**: jerarquía Etapa → Hito → Actualización. Etapas plegables. Drag&drop para reordenar hitos dentro de una etapa. Orden de etapas: la **vigente (en curso) primero, resto descendente (3, 2, 1)**.
- **Onboarding / Outboarding**: checklists que enmarcan las etapas (Onboarding arriba, Outboarding abajo). Columnas `clients.onboarding` / `clients.outboarding` (jsonb, `{visible, items:[{id,text,done}]}`). Toggle mostrar/ocultar al cliente. Read-only en el portal.
- **Actualizaciones**: feed + campo `url` (URL de referencia opcional) que se muestra como "🔗 Ver referencia". Se pueden vincular a una etapa (`phaseId`) y/o hito (`milestoneId`).
- **Biblioteca de Formación (recursos)**: agrupada por **Áreas/Departamentos** (`resources.areas` text[]; ej. Ventas, Operaciones, Atención al Cliente / Soporte, Social Media). Un recurso puede estar en varias áreas (checkboxes en el admin). Se puede crear un recurso **en varios clientes a la vez** (endpoint `resources.createForClients`) y **copiar un recurso existente a otros clientes** (botón 📋 en cada tarjeta). Preview inline de archivos, adjuntos múltiples.
- **Asistente IA**: ver sección arriba.
- **Clientes**: Sensaciones de Tango (SDT, piloto), Comunidad NM Roller, FlyFree Urban.

## Pendientes / ideas futuras
- Rotar la API key de Groq (quedó expuesta en una captura durante el setup).
- El checklist de onboarding/outboarding oculto igual viaja al portal (se gatea en UI); si se quiere, filtrarlo server-side.
- Acciones del Asistente IA que aún NO existen: crear activos digitales, branding, accesos de usuarios, toggles de visibilidad.
- Reset de contraseña por email; notificaciones al cliente; export PDF.
