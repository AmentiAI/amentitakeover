/**
 * Thin wrapper over OpenAI's Chat Completions REST API. We call fetch directly
 * rather than depend on the SDK so we don't need to reinstall node_modules.
 *
 * Drop-in replacement for the previous Anthropic helper — callers pass a
 * system prompt + user prompt and get the assistant's text back. A null
 * return from getOpenAI() signals "no key configured"; callers should fall
 * back to a deterministic template in that case.
 */

export function getOpenAI(): { apiKey: string; model: string } | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    model: process.env.OPENAI_MODEL || "gpt-4o",
  };
}

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o";

export type OpenAIResponse = {
  text: string;
  inputTokens: number;
  outputTokens: number;
};

export async function callOpenAI({
  system,
  user,
  maxTokens,
  jsonMode,
}: {
  system: string;
  user: string;
  maxTokens: number;
  jsonMode?: boolean;
}): Promise<OpenAIResponse> {
  const client = getOpenAI();
  if (!client) throw new Error("OPENAI_API_KEY not set");

  const body: Record<string, unknown> = {
    model: client.model,
    max_tokens: maxTokens,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  };
  if (jsonMode) body.response_format = { type: "json_object" };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${client.apiKey}`,
    },
    body: JSON.stringify(body),
  });
  if (!resp.ok) {
    const msg = await resp.text().catch(() => "");
    throw new Error(`OpenAI ${resp.status}: ${msg.slice(0, 500)}`);
  }
  const json = (await resp.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const text = json.choices?.[0]?.message?.content ?? "";
  return {
    text,
    inputTokens: json.usage?.prompt_tokens ?? 0,
    outputTokens: json.usage?.completion_tokens ?? 0,
  };
}
