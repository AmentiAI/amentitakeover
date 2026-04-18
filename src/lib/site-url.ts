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
 * with prospects). Defaults to the main app domain (.online) because the
 * dedicated .com domain is not yet pointed at this deployment.
 *
 * Override with NEXT_PUBLIC_PREVIEW_BASE_URL once DNS for
 * amentiaiaffiliates.com is configured — then bump this to the .com host.
 */
export const PRODUCTION_PREVIEW_URL = PRODUCTION_SITE_URL;

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
 * Available preview templates. Each `value` maps to a Next.js route segment
 * under `/p/<value>/<id>`, so the same scraped business can be previewed in
 * multiple visual treatments without regenerating image or content data.
 */
export type TemplateChoice = "site" | "editorial";

export const TEMPLATE_CHOICES: { value: TemplateChoice; label: string; hint: string }[] = [
  { value: "site", label: "Pro Multi-Page", hint: "Modern multi-page preview with services, gallery, and reviews" },
  { value: "editorial", label: "Editorial", hint: "Magazine-style single-page layout — serif typography, big imagery" },
];

export function normalizeTemplateChoice(raw: unknown): TemplateChoice {
  if (raw === "editorial") return "editorial";
  return "site";
}

/**
 * Absolute URL for the generated template preview, keyed by the
 * scraped-business id. Optional `trackingToken` (typically the email-draft id)
 * is appended as a `/v/<token>` path segment so we can attribute opens back
 * to a specific outreach send. The tracking-token route only exists on the
 * `site` template today, so the `editorial` variant skips the `/v/` suffix.
 */
export function getTemplatePreviewUrl(
  scrapedBusinessId: string,
  opts?: { trackingToken?: string | null; template?: TemplateChoice },
): string {
  const template = opts?.template ?? "site";
  const base = `${getPreviewBaseUrl()}/p/${template}/${scrapedBusinessId}`;
  const token = opts?.trackingToken?.trim();
  if (!token || template !== "site") return base;
  return `${base}/v/${encodeURIComponent(token)}`;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
