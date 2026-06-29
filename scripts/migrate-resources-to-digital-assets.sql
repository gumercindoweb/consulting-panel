-- Migrar todos los recursos existentes a activos digitales
-- Mapeo de categorías: script→document, guide→webpage, template→document, training→document, other→other

INSERT INTO digital_assets (
  "clientId", title, description, category,
  "externalUrl", "fileUrl", "isPublic", "order", "createdAt", "updatedAt"
)
SELECT
  "clientId",
  title,
  description,
  CASE category
    WHEN 'guide'    THEN 'webpage'::digital_asset_category
    WHEN 'script'   THEN 'document'::digital_asset_category
    WHEN 'template' THEN 'document'::digital_asset_category
    WHEN 'training' THEN 'document'::digital_asset_category
    WHEN 'document' THEN 'document'::digital_asset_category
    ELSE            'other'::digital_asset_category
  END,
  "externalUrl",
  "fileUrl",
  "isPublic",
  "order",
  NOW(),
  NOW()
FROM resources;

-- Una vez verificado que la migración fue correcta, borrar los recursos originales:
DELETE FROM resources;
