-- Add fileUrl column to project_updates table
ALTER TABLE project_updates
ADD COLUMN IF NOT EXISTS "fileUrl" text;

COMMENT ON COLUMN project_updates."fileUrl" IS 'Archivo adjunto opcional (PDF, imagen, etc.) con vista previa.';
