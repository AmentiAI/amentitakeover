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
 *
 * Some templates are industry-locked (see INDUSTRY_LOCK) — `pest` only renders
 * for pest-control businesses, and it's the ONLY option those businesses get.
 */
export type TemplateChoice = "site" | "editorial" | "pest" | "roofing";

type TemplateMeta = { value: TemplateChoice; label: string; hint: string };

export const TEMPLATE_CHOICES: TemplateMeta[] = [
  { value: "site", label: "Pro Multi-Page", hint: "Modern multi-page preview with services, gallery, and reviews" },
  { value: "editorial", label: "Editorial", hint: "Magazine-style single-page layout — serif typography, big imagery" },
  { value: "pest", label: "Pest Control", hint: "Industry-specific template with radar hero, crawling-bug canvas, and treatment-plan focus" },
  { value: "roofing", label: "Roofing", hint: "Industry-specific template with pitched-roof hero, storm-front canvas, and warranty/inspection focus" },
];

// Templates reserved for businesses in a specific industry. Anyone not in the
// industry cannot select these; anyone IN the industry gets ONLY these.
const INDUSTRY_LOCK: Record<string, TemplateChoice[]> = {
  pest: ["pest"],
  roofing: ["roofing"],
};

export function normalizeTemplateChoice(raw: unknown): TemplateChoice {
  if (raw === "editorial") return "editorial";
  if (raw === "pest") return "pest";
  if (raw === "roofing") return "roofing";
  return "site";
}

export type BusinessIndustrySignals = {
  industry?: string | null;
  category?: string | null;
  name?: string | null;
  tags?: string[] | null;
  description?: string | null;
};

export function detectIndustry(biz: BusinessIndustrySignals): keyof typeof INDUSTRY_LOCK | null {
  const hay = [
    biz.industry,
    biz.category,
    biz.name,
    biz.description,
    ...(biz.tags ?? []),
  ]
    .filter((s): s is string => typeof s === "string" && s.length > 0)
    .join(" ")
    .toLowerCase();
  if (!hay) return null;

  // Pest control: match trade-specific terms. We require a pest-adjacent
  // noun + treatment/control context so a random "bug fix" plumbing mention
  // doesn't tip a business into the pest lock.
  const pestKeywords = [
    "pest control",
    "pest management",
    "exterminator",
    "extermination",
    "termite",
    "bed bug",
    "bedbug",
    "rodent control",
    "mosquito control",
    "wildlife removal",
    "cockroach",
    "fumigation",
    "wasp removal",
    "ant control",
  ];
  if (pestKeywords.some((k) => hay.includes(k))) return "pest";

  // Roofing: match roof-trade terms. Require a roof noun + action/material
  // context so a generic "we cover roofs" mention in a painter's copy doesn't
  // tip them into the roofing lock.
  const roofingKeywords = [
    "roofing",
    "roofer",
    "roof repair",
    "roof replacement",
    "roof installation",
    "roof inspection",
    "reroofing",
    "re-roof",
    "shingle",
    "metal roof",
    "tile roof",
    "flat roof",
    "storm damage",
    "hail damage",
    "gutter",
    "skylight install",
  ];
  if (roofingKeywords.some((k) => hay.includes(k))) return "roofing";

  return null;
}

/**
 * Returns the templates this business is allowed to render. If the business is
 * locked to an industry, only industry-specific templates are returned.
 * Otherwise the general-purpose templates (site/editorial) are returned with
 * industry-locked ones filtered out.
 */
export function allowedTemplatesForBusiness(
  biz: BusinessIndustrySignals,
): TemplateMeta[] {
  const lockedIndustry = detectIndustry(biz);
  if (lockedIndustry) {
    const allow = new Set<TemplateChoice>(INDUSTRY_LOCK[lockedIndustry]);
    return TEMPLATE_CHOICES.filter((t) => allow.has(t.value));
  }
  const lockedValues = new Set<TemplateChoice>(
    Object.values(INDUSTRY_LOCK).flat(),
  );
  return TEMPLATE_CHOICES.filter((t) => !lockedValues.has(t.value));
}

/**
 * Returns the default template for a business — industry-locked template if
 * the business is locked, otherwise "site". Use this when a business has no
 * explicit `templateChoice` set yet.
 */
export function defaultTemplateForBusiness(biz: BusinessIndustrySignals): TemplateChoice {
  const lockedIndustry = detectIndustry(biz);
  if (lockedIndustry) return INDUSTRY_LOCK[lockedIndustry][0];
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
