# Sensaciones Dashboard — TODO

## Schema & Backend
- [x] Extender schema: tablas clients, okrs, milestones, learnings, obstacles, scope_items, resources, project_phases
- [x] Generar y aplicar migración SQL
- [x] Helpers de DB para todas las entidades
- [x] Routers tRPC: clients, okrs, milestones, learnings, resources, phases, scope
- [x] Procedimientos de admin (CRUD completo)
- [x] Seed inicial: cliente Sensaciones de Tango con datos reales del proyecto

## Autenticación & Roles
- [x] Login con Manus OAuth para clientes
- [x] Rol admin (consultor) vs rol client
- [x] Aislamiento de datos por cliente (cada query filtra por clientId)
- [x] Middleware adminProcedure para proteger rutas de admin
- [x] assertClientAccess: guard de acceso por cliente para usuarios no-admin

## Frontend — Global
- [x] Configurar tema oscuro global en index.css
- [x] Tipografías: Playfair Display, Cormorant Garamond, Bebas Neue, Hanken Grotesk (Google Fonts)
- [x] Paleta de colores SDT: noir #0B0807, rojo #B32825, ámbar #E0913F, oro #D9A441
- [x] Ruta /login — página de login para clientes
- [x] Ruta /dashboard — dashboard del cliente (protegido)
- [x] Ruta /admin — panel de administración (solo admin)
- [x] DashboardSidebar adaptado al branding SDT con navegación de 7 secciones

## Dashboard Cliente — Secciones
- [x] Resumen ejecutivo: OKRs, métricas clave, estado general, progreso visual
- [x] Timeline de hitos e implementaciones (cronológico, agrupado por mes)
- [x] Registro de aprendizajes y obstáculos (con tipo: learning/obstacle/win)
- [x] Alcance del proyecto (scope vs. out-of-scope, agrupado por categoría)
- [x] Panel de recursos para el equipo (documentos, guiones, plantillas, links)
- [x] Etapas del proyecto con estado (Diagnóstico, Q1 Optimización, Plan 2026 F1/F2/F3)
- [x] Sección OKRs con barras de progreso y estado (on_track/at_risk/off_track)

## Panel de Administración
- [x] Gestión de clientes (crear, editar, ver)
- [x] Gestión de OKRs por cliente
- [x] Gestión de hitos por cliente
- [x] Gestión de aprendizajes/obstáculos por cliente
- [x] Gestión de alcance (scope items) por cliente
- [x] Gestión de recursos por cliente
- [x] Gestión de fases del proyecto por cliente
- [x] Gestión de métricas por cliente
- [x] Botón "Ver como cliente" para previsualizar el dashboard del cliente

## Datos Iniciales SDT
- [x] Seed: cliente Sensaciones de Tango (branding SDT, info, consultorName: Gumercindo Jiménez)
- [x] Seed: 5 fases del proyecto (Diagnóstico, Q1 Optimización, Plan 2026 F1/F2/F3)
- [x] Seed: 8 hitos históricos desde Agosto 2025
- [x] Seed: 5 OKRs del Plan Estratégico 2026
- [x] Seed: 6 aprendizajes del Q1 2026 (learnings, obstacles, wins)
- [x] Seed: 10 items de alcance del proyecto (6 in-scope, 4 out-of-scope)
- [x] Seed: 4 recursos iniciales (guiones, links a plataformas)
- [x] Seed: 5 métricas clave del negocio

## Testing
- [x] Tests para auth.me (autenticado y anónimo)
- [x] Tests para guard de admin (UNAUTHORIZED y FORBIDDEN)
- [x] Tests para aislamiento de datos por cliente (assertClientAccess)
- [x] Tests para auth.logout
- [x] Tests para clients.myClients (role-based access)
