export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  // Auto-login como admin de desarrollo (sin pasar por el login real).
  // Apagado por defecto: así se puede probar el acceso por email+clave.
  // Activar con DEV_AUTOLOGIN=1 en .env si querés la comodidad del bypass.
  devAutoLogin: process.env.DEV_AUTOLOGIN === "1",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Asistente IA — proveedor compatible con OpenAI (Groq, Google Gemini, OpenRouter…).
  // Gratuito: se crea una API key en el proveedor y se setean estas 3 variables en
  // Vercel. AI_API_URL es la base hasta antes de /chat/completions.
  //   Groq:   AI_API_URL=https://api.groq.com/openai/v1   AI_MODEL=llama-3.3-70b-versatile
  //   Gemini: AI_API_URL=https://generativelanguage.googleapis.com/v1beta/openai   AI_MODEL=gemini-2.0-flash
  aiApiUrl: process.env.AI_API_URL ?? "",
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? "llama-3.3-70b-versatile",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY ?? "",
};
