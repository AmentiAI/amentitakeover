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
 * There's a single unified multi-page template now. The `TemplateChoice` type
 * is kept so downstream tracking + outreach code doesn't change shape, but it
 * always resolves to the `site` template.
 */
export type TemplateChoice = "site";

export const TEMPLATE_CHOICES: { value: TemplateChoice; label: string; hint: string }[] = [
  { value: "site", label: "Pro Multi-Page", hint: "Modern multi-page preview tailored to the scraped business" },
];

export function normalizeTemplateChoice(_raw: unknown): TemplateChoice {
  return "site";
}

/**
 * Absolute URL for the generated template preview, keyed by the
 * scraped-business id. Optional `trackingToken` (typically the email-draft id)
 * is appended as a `/v/<token>` path segment so we can attribute opens back
 * to a specific outreach send.
 */
export function getTemplatePreviewUrl(
  scrapedBusinessId: string,
  opts?: { trackingToken?: string | null; template?: TemplateChoice },
): string {
  const base = `${getPreviewBaseUrl()}/p/site/${scrapedBusinessId}`;
  const token = opts?.trackingToken?.trim();
  return token ? `${base}/v/${encodeURIComponent(token)}` : base;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
