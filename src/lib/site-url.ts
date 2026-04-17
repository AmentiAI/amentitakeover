/**
 * Public URL of this deployment. Used when we need to link to our own pages
 * from outside the browser (emails, lead notifications, etc).
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_APP_URL (explicit — preferred)
 *   2. VERCEL_URL (Vercel auto-injects)
 *   3. http://localhost:3000 (dev fallback)
 */
export function getSiteBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return stripTrailingSlash(fromEnv);
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${stripTrailingSlash(vercel)}`;
  return "http://localhost:3000";
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
