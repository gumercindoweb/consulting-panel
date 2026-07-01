-- Add url (reference link) and fileUrls (multi-file references) to backlog_items
ALTER TABLE backlog_items
ADD COLUMN IF NOT EXISTS "url" text,
ADD COLUMN IF NOT EXISTS "fileUrls" json;

COMMENT ON COLUMN backlog_items."url" IS 'URL de referencia opcional (ej. app o producto de inspiración).';
COMMENT ON COLUMN backlog_items."fileUrls" IS 'Archivos de referencia opcionales (imágenes, PDFs) con vista previa.';
