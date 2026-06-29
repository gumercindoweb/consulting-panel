import { StorageClient } from "@supabase/storage-js";

// ─── SUPABASE STORAGE (subida directa desde el navegador) ──────────────────────
// SUPABASE_URL y la clave ANON son PÚBLICAS por diseño — están pensadas para
// exponerse en el frontend. La seguridad real la da la política RLS del bucket
// (solo permite INSERT en panel-assets bajo el prefijo client-*). La clave
// service_role (secreta) NUNCA se usa acá.
const SUPABASE_URL = "https://keanbqmcnfxuzfudxjez.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYW5icW1jbmZ4dXpmdWR4amV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzk4MjUsImV4cCI6MjA5NzY1NTgyNX0.oJ4Ct-Nd6XOG5M4xwLdAoTGHz99QI7EDihAbyBNWoHU";

const BUCKET = "panel-assets";

const storage = new StorageClient(`${SUPABASE_URL}/storage/v1`, {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
});

/**
 * Sube un archivo al bucket panel-assets y devuelve su URL pública.
 * El path siempre arranca con `client-<id>/` para cumplir la política RLS.
 */
export async function uploadClientFile(
  clientId: number,
  file: File,
): Promise<{ path: string; publicUrl: string }> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `client-${clientId}/${Date.now()}_${safeName}`;

  const { data, error } = await storage.from(BUCKET).upload(path, file, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo subir el archivo.");
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${data.path}`;
  return { path: data.path, publicUrl };
}
