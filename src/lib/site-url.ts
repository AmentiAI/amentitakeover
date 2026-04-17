/**
 * Public URL of this deployment. Used when we need to link to our own pages
 * from outside the browser (emails, lead notifications, etc).
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_APP_URL (explicit override)
 *   2. Production default → https://amentiaiaffiliates.online
 *   3. VERCEL_URL for preview / branch deploys
 *   4. http://localhost:3000 (dev fallback)
 */
export const PRODUCTION_SITE_URL = "https://amentiaiaffiliates.online";

/**
 * Domain specifically for generated site previews (the /p/... pages we share
 * with prospects). Kept separate from the app domain so marketing links and
 * cold outreach go to a clean, client-facing URL.
 *
 * Override with NEXT_PUBLIC_PREVIEW_BASE_URL.
 */
export const PRODUCTION_PREVIEW_URL = "https://amentiaiaffiliates.com";

export function getSiteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return ensureScheme(stripTrailingSlash(fromEnv));

  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production") return PRODUCTION_SITE_URL;

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${stripTrailingSlash(vercel)}`;

  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;
  return "http://localhost:3000";
}

export function getPreviewBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PREVIEW_BASE_URL?.trim();
  if (fromEnv) return ensureScheme(stripTrailingSlash(fromEnv));

  if (process.env.VERCEL_ENV === "production") return PRODUCTION_PREVIEW_URL;
  if (process.env.NODE_ENV === "production") return PRODUCTION_PREVIEW_URL;

  return getSiteBaseUrl();
}

function ensureScheme(s: string): string {
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

/**
 * Absolute URL for the generated template preview, keyed by the
 * scraped-business id. Optional `trackingToken` (typically the email-draft id)
 * is appended as a `/v/<token>` path segment so we can attribute opens back
 * to a specific outreach send.
 */
export type TemplateChoice = "roofing" | "roofing2" | "roofing3" | "electrical";

export const TEMPLATE_CHOICES: { value: TemplateChoice; label: string; hint: string }[] = [
  { value: "roofing", label: "Classic", hint: "Clean card-based roofing layout" },
  { value: "roofing2", label: "Editorial", hint: "Magazine-style long-form" },
  { value: "roofing3", label: "Bold", hint: "Luxury-dark with oversized type" },
  { value: "electrical", label: "Electrical", hint: "For electrical contractors" },
];

export function normalizeTemplateChoice(raw: unknown): TemplateChoice {
  if (raw === "roofing2" || raw === "roofing3" || raw === "electrical") return raw;
  return "roofing";
}

export function getTemplatePreviewUrl(
  scrapedBusinessId: string,
  opts?: { trackingToken?: string | null; template?: TemplateChoice },
): string {
  const template = opts?.template ?? "roofing";
  const base = `${getPreviewBaseUrl()}/p/${template}/${scrapedBusinessId}`;
  const token = opts?.trackingToken?.trim();
  return token ? `${base}/v/${encodeURIComponent(token)}` : base;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
