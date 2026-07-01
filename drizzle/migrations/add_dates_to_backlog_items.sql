-- Add ideaDate (when the idea came up), startDate and endDate (work timeline) to backlog_items
ALTER TABLE backlog_items
ADD COLUMN IF NOT EXISTS "ideaDate" timestamp,
ADD COLUMN IF NOT EXISTS "startDate" timestamp,
ADD COLUMN IF NOT EXISTS "endDate" timestamp;

COMMENT ON COLUMN backlog_items."ideaDate" IS 'Fecha en la que surgió la idea (editable, distinta de createdAt).';
COMMENT ON COLUMN backlog_items."startDate" IS 'Fecha en la que se empezó a trabajar la idea.';
COMMENT ON COLUMN backlog_items."endDate" IS 'Fecha en la que se completó la idea.';
