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
// "transparent" → PNG with alpha channel. Only meaningful for output_format
// png, which is gpt-image-2's default. "auto" lets the model choose
// (typically opaque). Use "transparent" for cutout subjects (mascots,
// characters) you intend to overlay.
export type ImageBackground = "auto" | "transparent";

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
  background?: ImageBackground;
}): Promise<GeneratedImageResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const size: ImageSize = opts.size ?? "1024x1024";
  const quality: ImageQuality = opts.quality ?? "high";
  const requestedModel = opts.model ?? PRIMARY_MODEL;
  const background: ImageBackground = opts.background ?? "auto";

  try {
    return await callImageApi(apiKey, requestedModel, opts.prompt, size, quality, background);
  } catch (err) {
    if (
      err instanceof UnknownModelError &&
      requestedModel !== FALLBACK_MODEL
    ) {
      console.warn(
        `[openai-image] model ${requestedModel} unavailable, falling back to ${FALLBACK_MODEL}`,
      );
      return await callImageApi(apiKey, FALLBACK_MODEL, opts.prompt, size, quality, background);
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
  background: ImageBackground,
): Promise<GeneratedImageResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const body: Record<string, unknown> = {
      model,
      prompt,
      size,
      quality,
      n: 1,
    };
    // gpt-image-2 rejects the `background` param entirely (and `output_format`
    // varies by model release). For transparent cutouts we instead lean on
    // the prompt — see buildCharacterPrompt for the strict cutout language.
    void background;
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
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
      mimeType: detectImageMimeType(bytes),
      width: w,
      height: h,
      model,
    };
  } finally {
    clearTimeout(timer);
  }
}

// Sniff the actual image format from the first few bytes. The API response
// only gives us base64 — no Content-Type metadata — and forcing
// `output_format` is model-dependent, so we let OpenAI pick whatever it
// likes and trust the magic header.
function detectImageMimeType(bytes: Uint8Array): string {
  if (bytes.length >= 8 &&
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
      bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) {
    return "image/png";
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 12 &&
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return "image/webp";
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 &&
      bytes[3] === 0x38 && (bytes[4] === 0x37 || bytes[4] === 0x39) && bytes[5] === 0x61) {
    return "image/gif";
  }
  // Default — caller will still get the real bytes; a generic content-type
  // lets the browser sniff if needed.
  return "application/octet-stream";
}
