import { ENV } from "./env";

// Cliente para APIs de chat compatibles con OpenAI (Groq, Google Gemini en su
// modo OpenAI, OpenRouter, etc.). Configurable por env para poder usar
// proveedores con nivel gratuito sin tocar código.
//   - endpoint {AI_API_URL}/chat/completions
//   - header Authorization: Bearer {AI_API_KEY}
//   - "system" como primer mensaje del array
//   - respuesta en choices[0].message.content

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const resolveBaseUrl = () =>
  (ENV.aiApiUrl ?? "").trim().replace(/\/$/, "");

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function invokeChat(params: {
  system: string;
  messages: ChatMessage[];
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const base = resolveBaseUrl();
  if (!base) {
    throw new Error(
      "El asistente IA no está configurado. Falta la variable AI_API_URL en Vercel."
    );
  }
  if (!ENV.aiApiKey) {
    throw new Error(
      "El asistente IA no está configurado. Falta la variable AI_API_KEY en Vercel."
    );
  }

  const body = JSON.stringify({
    model: params.model ?? ENV.aiModel,
    max_tokens: params.maxTokens ?? 4096,
    messages: [
      { role: "system", content: params.system },
      ...params.messages,
    ],
    response_format: { type: "json_object" },
  });

  const url = `${base}/chat/completions`;
  const headers = {
    "content-type": "application/json",
    authorization: `Bearer ${ENV.aiApiKey}`,
  };

  // Reintentos con backoff para errores transitorios (429 / 5xx / red).
  let lastError: unknown;
  for (let attempt = 0; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { method: "POST", headers, body });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        return data.choices?.[0]?.message?.content ?? "";
      }

      // 4xx (salvo 429) no se reintentan: es un error de la request.
      if (res.status !== 429 && res.status < 500) {
        const errText = await res.text();
        throw new Error(`IA API ${res.status}: ${errText}`);
      }

      if (attempt === 3) {
        const errText = await res.text();
        throw new Error(`IA API ${res.status} tras reintentos: ${errText}`);
      }
      await sleep(500 * 2 ** attempt + Math.random() * 250);
    } catch (error) {
      lastError = error;
      // Si fue un Error que tiramos nosotros por 4xx, no reintentar.
      if (error instanceof Error && error.message.startsWith("IA API 4")) {
        throw error;
      }
      if (attempt === 3) break;
      await sleep(500 * 2 ** attempt + Math.random() * 250);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("La llamada a la IA falló tras varios reintentos.");
}
