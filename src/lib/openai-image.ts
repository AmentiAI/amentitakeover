/**
 * Thin wrapper around OpenAI's image generation endpoint.
 *
 * Env:
 *   OPENAI_API_KEY      — required
 *   OPENAI_IMAGE_MODEL  — optional override (defaults to gpt-image-2 with
 *                          auto-fallback to gpt-image-1 when unknown).
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
const PRIMARY_MODEL = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-2";
const FALLBACK_MODEL = "gpt-image-1";
const REQUEST_TIMEOUT_MS = 120_000;

export async function generateImage(opts: {
  prompt: string;
  size?: ImageSize;
  quality?: ImageQuality;
  model?: string;
}): Promise<GeneratedImageResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const size: ImageSize = opts.size ?? "1024x1024";
  const quality: ImageQuality = opts.quality ?? "high";
  const requestedModel = opts.model ?? PRIMARY_MODEL;

  try {
    return await callImageApi(apiKey, requestedModel, opts.prompt, size, quality);
  } catch (err) {
    if (
      err instanceof UnknownModelError &&
      requestedModel !== FALLBACK_MODEL
    ) {
      console.warn(
        `[openai-image] model ${requestedModel} unavailable, falling back to ${FALLBACK_MODEL}`,
      );
      return await callImageApi(apiKey, FALLBACK_MODEL, opts.prompt, size, quality);
    }
    throw err;
  }
}

class UnknownModelError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "UnknownModelError";
  }
}

async function callImageApi(
  apiKey: string,
  model: string,
  prompt: string,
  size: ImageSize,
  quality: ImageQuality,
): Promise<GeneratedImageResult> {
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
        prompt,
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
      if (res.status === 400 || res.status === 404) {
        if (/model.*(not found|does not exist|invalid|unknown|unsupported)|model_not_found/i.test(text)) {
          throw new UnknownModelError(`unknown model ${model}: ${text.slice(0, 160)}`);
        }
      }
      throw new Error(`OpenAI image generation failed (${res.status}): ${text.slice(0, 400)}`);
    }

    const json = (await res.json()) as OpenAIImageResponse;
    if (json.error) throw new Error(json.error.message ?? "OpenAI image error");

    const b64 = json.data?.[0]?.b64_json;
    if (!b64) throw new Error("OpenAI returned no image data");

    const [w, h] = size.split("x").map(Number);
    const buf = Buffer.from(b64, "base64");
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
