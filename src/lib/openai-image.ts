/**
 * Thin wrapper around OpenAI's gpt-image-1 generation endpoint.
 *
 * Env:
 *   OPENAI_API_KEY — required
 *
 * We avoid pulling in the full openai SDK since we only need one endpoint.
 * Returns raw PNG bytes (decoded from the b64 response). Caller is responsible
 * for persisting them.
 */

export type ImageSize = "1024x1024" | "1024x1536" | "1536x1024";
export type ImageQuality = "low" | "medium" | "high";

export type GeneratedImageResult = {
  bytes: Uint8Array<ArrayBuffer>;
  mimeType: string;
  width: number;
  height: number;
  model: string;
};

export class ImageModerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageModerationError";
  }
}

type OpenAIImageResponse = {
  data?: { b64_json?: string }[];
  error?: { message?: string };
};

const API_URL = "https://api.openai.com/v1/images/generations";
const DEFAULT_MODEL = "gpt-image-1";
const REQUEST_TIMEOUT_MS = 90_000;

export async function generateImage(opts: {
  prompt: string;
  size?: ImageSize;
  quality?: ImageQuality;
  model?: string;
}): Promise<GeneratedImageResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const size: ImageSize = opts.size ?? "1024x1024";
  const quality: ImageQuality = opts.quality ?? "medium";
  const model = opts.model ?? DEFAULT_MODEL;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        prompt: opts.prompt,
        size,
        quality,
        n: 1,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      if (res.status === 400 && /moderation_blocked|safety_violations|safety system/i.test(text)) {
        throw new ImageModerationError(`moderation_blocked: ${text.slice(0, 200)}`);
      }
      throw new Error(`OpenAI image generation failed (${res.status}): ${text.slice(0, 400)}`);
    }

    const json = (await res.json()) as OpenAIImageResponse;
    if (json.error) throw new Error(json.error.message ?? "OpenAI image error");

    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image data");

    const [w, h] = size.split("x").map(Number);
    const buf = Buffer.from(b64, "base64");
    // Prisma's Bytes column wants Uint8Array<ArrayBuffer>; Node's Buffer
    // uses ArrayBufferLike in TS 5.7. Copy into a fresh ArrayBuffer to
    // normalize the type.
    const ab = new ArrayBuffer(buf.byteLength);
    const bytes = new Uint8Array(ab);
    bytes.set(buf);
    return {
      bytes,
      mimeType: "image/png",
      width: w,
      height: h,
      model,
    };
  } finally {
    clearTimeout(timer);
  }
}
