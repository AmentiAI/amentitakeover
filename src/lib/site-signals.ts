import type * as cheerio from "cheerio";

// Cheap-to-extract pitch ammo derived from a single page's HTML. Every
// signal here is a pattern match — no extra network calls, runs inside
// the scrape we're already doing. Persisted on Site.signals so the UI
// can surface it for outreach personalization without re-scraping.

export type SiteSignals = {
  cms: string | null;
  copyrightYear: number | null;
  yearsBehind: number | null;
  mobileViewport: boolean;
  seo: {
    titleLength: number | null;
    descriptionPresent: boolean;
    descriptionLength: number | null;
    canonical: boolean;
    robotsNoindex: boolean;
  };
  analytics: string[];
  bookingWidgets: string[];
  liveChat: string[];
  schemaOrg: {
    hasLocalBusiness: boolean;
    types: string[];
  };
  stockPhotoCount: number;
};

export function extractSignals(
  $: cheerio.CheerioAPI,
  rawHtml: string,
  imageSrcs: string[],
): SiteSignals {
  return {
    cms: detectCms($, rawHtml),
    ...computeCopyright($, rawHtml),
    mobileViewport: hasMobileViewport($),
    seo: computeSeo($),
    analytics: detectAnalytics(rawHtml),
    bookingWidgets: detectBookingWidgets(rawHtml),
    liveChat: detectLiveChat(rawHtml),
    schemaOrg: detectSchemaOrg($),
    stockPhotoCount: countStockPhotos(imageSrcs),
  };
}

// CMS / platform detection. Hits common script-src + meta-generator +
// HTML-class signatures. Returns the most specific match — a Squarespace
// site running Wix-named modules still gets tagged "squarespace" because
// the host is what matters most.
function detectCms($: cheerio.CheerioAPI, html: string): string | null {
  const generator = ($('meta[name="generator"]').attr("content") ?? "").toLowerCase();
  if (/wordpress/i.test(generator)) return "wordpress";
  if (/wix\.com/i.test(generator)) return "wix";
  if (/squarespace/i.test(generator)) return "squarespace";
  if (/shopify/i.test(generator)) return "shopify";
  if (/webflow/i.test(generator)) return "webflow";
  if (/duda/i.test(generator)) return "duda";

  // Host signatures inside the raw HTML (script src, link href, asset
  // URLs). Order matters — Shopify always loads cdn.shopify.com so it
  // wins before generic "wordpress" hits trigger on a Shopify-hosted
  // theme that happens to mention WP.
  if (/cdn\.shopify\.com|myshopify\.com/i.test(html)) return "shopify";
  if (/static\.wixstatic\.com|wix\.com\//i.test(html)) return "wix";
  if (/squarespace-cdn\.com|squarespace\.com/i.test(html)) return "squarespace";
  if (/assets\.website-files\.com|webflow\.com/i.test(html)) return "webflow";
  if (/wp-content|wp-includes|wp-json/i.test(html)) return "wordpress";
  if (/godaddysites\.com|secureserver\.net/i.test(html)) return "godaddy";
  if (/dudamobile\.com|dudaone\.com|irp\.cdn-website\.com/i.test(html)) return "duda";
  if (/weebly\.com|editmysite\.com/i.test(html)) return "weebly";
  if (/static\.parastorage\.com/i.test(html)) return "wix";

  return null;
}

// Copyright year and "years behind". Looks for `© 2019 Acme` or
// `Copyright 2019` in the rendered HTML; takes the LATEST year mentioned
// so a page footer that lists "Founded 1995" plus "© 2024" doesn't get
// flagged as stale. yearsBehind is current year minus the latest year.
function computeCopyright(
  $: cheerio.CheerioAPI,
  html: string,
): { copyrightYear: number | null; yearsBehind: number | null } {
  const text = `${$("footer").text()} ${$("body").text()}`.slice(0, 30_000);
  const matches = [
    ...text.matchAll(/(?:©|copyright|\(c\))\s*\D{0,8}(\d{4})/gi),
    ...html.matchAll(/(?:&copy;|©|copyright)\s*\D{0,8}(\d{4})/gi),
  ];
  const now = new Date().getFullYear();
  const years = matches
    .map((m) => Number(m[1]))
    .filter((y) => y >= 1995 && y <= now + 1);
  if (!years.length) return { copyrightYear: null, yearsBehind: null };
  const latest = Math.max(...years);
  return { copyrightYear: latest, yearsBehind: now - latest };
}

function hasMobileViewport($: cheerio.CheerioAPI): boolean {
  const v = ($('meta[name="viewport"]').attr("content") ?? "").toLowerCase();
  return /width\s*=\s*device-width/.test(v);
}

function computeSeo($: cheerio.CheerioAPI): SiteSignals["seo"] {
  const title = $("title").first().text().trim();
  const desc = ($('meta[name="description"]').attr("content") ?? "").trim();
  const canonical = Boolean($('link[rel="canonical"]').attr("href"));
  const robots = ($('meta[name="robots"]').attr("content") ?? "").toLowerCase();
  return {
    titleLength: title.length || null,
    descriptionPresent: desc.length > 0,
    descriptionLength: desc.length || null,
    canonical,
    robotsNoindex: /noindex/.test(robots),
  };
}

// Analytics + martech stack — substring match on the rendered HTML for
// known script-src / pixel patterns. Each vendor only counts once even
// if the page references it multiple times.
function detectAnalytics(html: string): string[] {
  const out = new Set<string>();
  const checks: { name: string; re: RegExp }[] = [
    { name: "ga4", re: /googletagmanager\.com\/gtag\/js|gtag\(['"]config['"]\s*,\s*['"]G-/i },
    { name: "ua", re: /google-analytics\.com\/(?:analytics|ga)\.js|UA-\d{4,}-\d+/i },
    { name: "gtm", re: /googletagmanager\.com\/gtm\.js/i },
    { name: "meta-pixel", re: /connect\.facebook\.net\/[^"']+\/fbevents\.js|fbq\(['"]init['"]/i },
    { name: "tiktok-pixel", re: /analytics\.tiktok\.com\/i18n\/pixel/i },
    { name: "linkedin-insight", re: /snap\.licdn\.com\/li\.lms-analytics/i },
    { name: "pinterest-tag", re: /s\.pinimg\.com\/ct\/core\.js|pintrk\(/i },
    { name: "bing-uet", re: /bat\.bing\.com\/bat\.js/i },
    { name: "hotjar", re: /static\.hotjar\.com|hjid:\s*\d+/i },
    { name: "clarity", re: /clarity\.ms\/tag/i },
    { name: "mixpanel", re: /cdn\.mxpnl\.com|mixpanel\.init/i },
    { name: "klaviyo", re: /klaviyo\.com\/onsite|klaviyo\.com\/api/i },
    { name: "hubspot", re: /js\.hsforms\.net|hs-scripts\.com|hs-analytics\.net|js\.hubspot\.com/i },
    { name: "activecampaign", re: /trackcmp\.net|activehosted\.com/i },
    { name: "mailchimp", re: /chimpstatic\.com|mailchimp\.com\/mc/i },
  ];
  for (const c of checks) if (c.re.test(html)) out.add(c.name);
  return [...out].sort();
}

// Booking / scheduling widgets — strong signal that a service business
// has invested in conversion infrastructure. Sites without these are
// usually the easiest "you should really have an online booking flow"
// pitch.
function detectBookingWidgets(html: string): string[] {
  const out = new Set<string>();
  const checks: { name: string; re: RegExp }[] = [
    { name: "calendly", re: /calendly\.com|assets\.calendly\.com/i },
    { name: "acuity", re: /acuityscheduling\.com|squarespace-scheduling\.com/i },
    { name: "square-appointments", re: /squareup\.com\/appointments/i },
    { name: "servicetitan", re: /servicetitan\.com|sched\.servicetitan/i },
    { name: "housecall-pro", re: /housecallpro\.com|book\.housecallpro/i },
    { name: "jobber", re: /getjobber\.com\/clienthub|jobber\.com\/widget/i },
    { name: "fieldedge", re: /fieldedge\.com/i },
    { name: "thryv", re: /thryv\.com\/widget/i },
    { name: "setmore", re: /setmore\.com\/widget/i },
    { name: "bookwhen", re: /bookwhen\.com/i },
  ];
  for (const c of checks) if (c.re.test(html)) out.add(c.name);
  return [...out].sort();
}

function detectLiveChat(html: string): string[] {
  const out = new Set<string>();
  const checks: { name: string; re: RegExp }[] = [
    { name: "intercom", re: /widget\.intercom\.io|js\.intercomcdn\.com/i },
    { name: "drift", re: /js\.driftt\.com|js\.drift\.com/i },
    { name: "tawkto", re: /embed\.tawk\.to/i },
    { name: "tidio", re: /widget\.tidio\.co|code\.tidio\.co/i },
    { name: "crisp", re: /client\.crisp\.chat|crisp\.chat\/load/i },
    { name: "livechat", re: /cdn\.livechatinc\.com/i },
    { name: "zendesk", re: /static\.zdassets\.com|zendesk\.com\/embeddable/i },
    { name: "podium", re: /podium\.com|js\.podium\.com/i },
    { name: "freshchat", re: /wchat\.freshchat\.com/i },
    { name: "hubspot-chat", re: /js\.usemessages\.com|js\.hs-banner\.com/i },
  ];
  for (const c of checks) if (c.re.test(html)) out.add(c.name);
  return [...out].sort();
}

function detectSchemaOrg($: cheerio.CheerioAPI): SiteSignals["schemaOrg"] {
  const types = new Set<string>();
  let hasLocalBusiness = false;
  $('script[type="application/ld+json"]').each((_i, el) => {
    const txt = $(el).contents().text();
    try {
      const parsed = JSON.parse(txt);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      const walk = (node: unknown) => {
        if (!node || typeof node !== "object") return;
        const obj = node as { "@type"?: unknown; "@graph"?: unknown };
        const t = obj["@type"];
        if (typeof t === "string") {
          types.add(t);
          if (/LocalBusiness|Restaurant|Plumber|Electrician|HVAC|Roofing|HomeAndConstruction/i.test(t)) {
            hasLocalBusiness = true;
          }
        } else if (Array.isArray(t)) {
          for (const tt of t) {
            if (typeof tt === "string") types.add(tt);
          }
        }
        if (Array.isArray(obj["@graph"])) {
          for (const g of obj["@graph"]) walk(g);
        }
      };
      for (const c of candidates) walk(c);
    } catch {
      // ignore malformed JSON-LD
    }
  });
  return { hasLocalBusiness, types: [...types].sort() };
}

const STOCK_PHOTO_HOSTS = [
  "unsplash.com",
  "images.unsplash.com",
  "pexels.com",
  "images.pexels.com",
  "pixabay.com",
  "cdn.pixabay.com",
  "gettyimages.com",
  "media.gettyimages.com",
  "shutterstock.com",
  "image.shutterstock.com",
  "istockphoto.com",
  "media.istockphoto.com",
  "freepik.com",
  "img.freepik.com",
  "depositphotos.com",
  "dreamstime.com",
  "alamy.com",
  "stocksnap.io",
  "burst.shopifycdn.com",
];

function countStockPhotos(srcs: string[]): number {
  let n = 0;
  for (const src of srcs) {
    let host: string;
    try {
      host = new URL(src).hostname.replace(/^www\./, "").toLowerCase();
    } catch {
      continue;
    }
    if (STOCK_PHOTO_HOSTS.some((h) => host === h || host.endsWith("." + h))) n++;
  }
  return n;
}
