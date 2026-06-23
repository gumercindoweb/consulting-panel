-- Crear enum de categorías de activos digitales
DO $$ BEGIN
  CREATE TYPE digital_asset_category AS ENUM (
    'webpage', 'design_system', 'tool', 'document', 'brand_asset', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Crear tabla digital_assets
CREATE TABLE IF NOT EXISTS digital_assets (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "clientId" integer NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  category digital_asset_category DEFAULT 'other' NOT NULL,
  "externalUrl" text,
  "fileUrl" text,
  notes text,
  "isPublic" boolean DEFAULT true NOT NULL,
  "order" integer DEFAULT 0 NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);
