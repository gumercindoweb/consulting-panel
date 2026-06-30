import { ENV } from "./env";

// Cliente mínimo para la API nativa de Anthropic (Messages API).
// A diferencia de llm.ts (formato OpenAI), Anthropic usa:
//   - endpoint /v1/messages
//   - header x-api-key (no Authorization: Bearer)
//   - header anthropic-version
//   - "system" como campo top-level, separado de los mensajes
//   - respuesta en content[] (bloques de tipo "text")

const ANTHROPIC_VERSION = "2023-06-01";

export type ClaudeMessage = { role: "user" | "assistant"; content: string };

const resolveBaseUrl = () =>
  (ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? ENV.forgeApiUrl.trim()
    : "https://api.anthropic.com"
  ).replace(/\/$/, "");

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function invokeClaude(params: {
  system: string;
  messages: ClaudeMessage[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  if (!ENV.forgeApiKey) {
    throw new Error(
      "El asistente IA no está configurado. Falta la variable BUILT_IN_FORGE_API_KEY en Vercel."
    );
  }

  const body = JSON.stringify({
    model: params.model ?? ENV.forgeModel,
    max_tokens: params.maxTokens ?? 4096,
    system: params.system,
    messages: params.messages,
  });

  const url = `${resolveBaseUrl()}/v1/messages`;
  const headers = {
    "content-type": "application/json",
    "x-api-key": ENV.forgeApiKey,
    "anthropic-version": ANTHROPIC_VERSION,
  };

  // Reintentos con backoff para errores transitorios (429 / 5xx / red).
  let lastError: unknown;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      if (res.ok) {
        const data = (await res.json()) as {
          content?: Array<{ type: string; text?: string }>;
        };
        return (data.content ?? [])
          .filter((b) => b.type === "text" && typeof b.text === "string")
          .map((b) => b.text)
          .join("");
      }

      // 4xx (salvo 429) no se reintentan: es un error de la request.
      if (res.status !== 429 && res.status < 500) {
        const errText = await res.text();
        throw new Error(`Anthropic API ${res.status}: ${errText}`);
      }

      if (attempt === 3) {
        const errText = await res.text();
        throw new Error(`Anthropic API ${res.status} tras reintentos: ${errText}`);
      }
      await sleep(500 * 2 ** attempt + Math.random() * 250);
    } catch (error) {
      lastError = error;
      // Si fue un Error que tiramos nosotros por 4xx, no reintentar.
      if (error instanceof Error && error.message.startsWith("Anthropic API 4")) {
        throw error;
      }
      if (attempt === 3) break;
      await sleep(500 * 2 ** attempt + Math.random() * 250);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("La llamada a Anthropic falló tras varios reintentos.");
}
