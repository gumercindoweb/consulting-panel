-- Per-member milestone assignment + owner-managed extra visibility
ALTER TABLE milestones
ADD COLUMN IF NOT EXISTS "assignedToUserId" integer,
ADD COLUMN IF NOT EXISTS "visibleToUserIds" integer[];

COMMENT ON COLUMN milestones."assignedToUserId" IS 'Miembro del equipo del cliente al que corresponde personalmente este hito (lo asigna el admin).';
COMMENT ON COLUMN milestones."visibleToUserIds" IS 'Miembros adicionales a los que el dueño del cliente decide mostrarles este hito, desde su propio portal.';
