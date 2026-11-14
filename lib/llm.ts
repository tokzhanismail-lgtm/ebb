/**
 * Provider-agnostic LLM call (server-side only). Configure with environment variables:
 *   LLM_PROVIDER = anthropic | gemini | openai
 *   LLM_API_KEY  = your key
 *   LLM_MODEL    = optional model override
 */

export type ChatMsg = { role: "user" | "assistant"; content: string };

const DEFAULT_MODELS: Record<string, string> = {
  anthropic: "claude-haiku-5-5",
  gemini: "gemini-flash-latest",
  openai: "gpt-4o-mini",
};

export function llmConfig() {
  const provider = (process.env.LLM_PROVIDER || "").toLowerCase().trim();
  const key = (process.env.LLM_API_KEY || "").trim();
  const model = (process.env.LLM_MODEL || DEFAULT_MODELS[provider] || "").trim();
  const ok = Boolean(key && DEFAULT_MODELS[provider]);
  return { provider, key, model, ok };
}

export async function chat(system: string, messages: ChatMsg[], maxTokens = 600): Promise<string> {
  const { provider, key, model, ok } = llmConfig();
  if (!ok) throw new Error("LLM not configured");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "content-type": "application/json",
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return (data.content || []).map((c: { text?: string }) => c.text || "").join("").trim();
    }

    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          max_tokens: maxTokens,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
      const data = await res.json();
      return (data.choices?.[0]?.message?.content || "").trim();
    }

    // gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          })),
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    return parts
      .map((p: { text?: string }) => p.text || "")
      .join("")
      .trim();
  } finally {
    clearTimeout(timer);
  }
}

/** Pulls the first JSON object out of a model reply (models sometimes wrap JSON in prose or code fences). */
export function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
