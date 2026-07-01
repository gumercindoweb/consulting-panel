-- Add fileUrls (multi-file) column to project_updates table
ALTER TABLE project_updates
ADD COLUMN IF NOT EXISTS "fileUrls" json;

COMMENT ON COLUMN project_updates."fileUrls" IS 'Varios archivos adjuntos por actualización (ej. varias fotos, un PDF y un doc). fileUrl (legado) queda solo por compat de lectura.';
