/**
 * Public URL of this deployment. Used when we need to link to our own pages
 * from outside the browser (emails, lead notifications, etc).
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_APP_URL (explicit override)
 *   2. Production default → https://signulldev.com
 *   3. VERCEL_URL for preview / branch deploys
 *   4. http://localhost:3000 (dev fallback)
 */
export const PRODUCTION_SITE_URL = "https://signulldev.com";

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

function ensureScheme(s: string): string {
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

/**
 * Absolute URL for the generated roofing template preview, keyed by the
 * scraped-business id (the URL convention the app uses: /p/roofing/[id]).
 */
export function getTemplatePreviewUrl(scrapedBusinessId: string): string {
  return `${getSiteBaseUrl()}/p/roofing/${scrapedBusinessId}`;
}

function stripTrailingSlash(s: string): string {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}
