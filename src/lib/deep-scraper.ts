import * as cheerio from "cheerio";
import { scrapeSite, type ScrapeResult } from "./scraper";

export type SubpageKind =
  | "home"
  | "contact"
  | "about"
  | "services"
  | "work"
  | "blog"
  | "areas"
  | "reviews"
  | "faq"
  | "other";

export type DeepScrapeResult = ScrapeResult & {
  pages: { url: string; kind: SubpageKind; text: string }[];
  emails: string[];
  phones: string[];
  socials: {
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    linkedin: string | null;
    tiktok: string | null;
    youtube: string | null;
  };
  logo: string | null;
  ogImage: string | null;
};

const CONTACT_HINTS = ["contact", "get-in-touch", "reach-us", "quote", "book", "appointment", "estimate"];
const ABOUT_HINTS = ["about", "who-we-are", "our-story", "team", "history", "mission", "values"];
const SERVICES_HINTS = ["services", "what-we-do", "solutions", "products", "offerings", "specialties"];
const WORK_HINTS = [
  "gallery",
  "portfolio",
  "projects",
  "work",
  "case-studies",
  "our-work",
  "recent-work",
  "jobs",
  "before-after",
  "photos",
];
const BLOG_HINTS = ["blog", "news", "resources", "articles", "insights"];
const AREAS_HINTS = ["areas", "locations", "service-area", "neighborhoods", "cities"];
const REVIEWS_HINTS = ["reviews", "testimonials", "what-clients-say"];
const FAQ_HINTS = ["faq", "faqs", "questions"];
const MAX_SUBPAGES = 14;

export async function deepScrapeSite(inputUrl: string): Promise<DeepScrapeResult> {
  const base = await scrapeSite(inputUrl);

  const pages: DeepScrapeResult["pages"] = [
    { url: base.url, kind: "home", text: base.textContent },
  ];

  const originHost = safeHost(base.url);
  const seen = new Set<string>([normalizeForDedup(base.url)]);

  // Portfolio/work pages first — these have the richest imagery, which is the
  // most important payload for downstream template generation. We collect up
  // to a couple hits per category so multi-service / multi-location sites
  // actually crawl all of their pages, not just one representative link.
  const candidates: { href: string; text: string; kind: SubpageKind }[] = [];
  const groups: { hints: string[]; kind: SubpageKind; max: number }[] = [
    { hints: WORK_HINTS, kind: "work", max: 3 },
    { hints: SERVICES_HINTS, kind: "services", max: 4 },
    { hints: ABOUT_HINTS, kind: "about", max: 2 },
    { hints: REVIEWS_HINTS, kind: "reviews", max: 1 },
    { hints: AREAS_HINTS, kind: "areas", max: 2 },
    { hints: FAQ_HINTS, kind: "faq", max: 1 },
    { hints: BLOG_HINTS, kind: "blog", max: 1 },
    { hints: CONTACT_HINTS, kind: "contact", max: 1 },
  ];
  for (const g of groups) {
    const hits = pickLinks(base.links, originHost, g.hints, g.max);
    for (const h of hits) {
      candidates.push({ href: h.href, text: h.text, kind: g.kind });
    }
  }

  // Fill any remaining budget with same-origin nav/top-level links so we
  // don't miss pages that don't match keyword hints (unusual URL structures).
  const remaining = Math.max(0, MAX_SUBPAGES - candidates.length);
  if (remaining > 0) {
    const extra = sameOriginTopLevelLinks(base.links, originHost, base.url)
      .filter((l) => !candidates.some((c) => normalizeForDedup(c.href) === normalizeForDedup(l.href)))
      .slice(0, remaining);
    for (const l of extra) {
      candidates.push({ href: l.href, text: l.text, kind: "other" });
    }
  }

  const extraImages: ScrapeResult["images"] = [];
  const extraHeadings: ScrapeResult["headings"] = [];
  // Preserve frequency when merging palettes across pages: page index ≈ usage
  // weight. Count how often a hex shows up in the ordered list from each
  // scrape, then re-sort by total count so primary brand colors win.
  const paletteCounts = new Map<string, number>();
  const tallyPalette = (list: string[]) => {
    for (let i = 0; i < list.length; i++) {
      // earlier-position hexes are more prominent on the source page — give
      // them a bit more weight than late-list hexes
      const weight = Math.max(1, 12 - i);
      paletteCounts.set(list[i], (paletteCounts.get(list[i]) ?? 0) + weight);
    }
  };
  tallyPalette(base.palette);
  const extraFonts = new Set(base.fonts);

  for (const target of candidates.slice(0, MAX_SUBPAGES)) {
    const key = normalizeForDedup(target.href);
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const sub = await scrapeSite(target.href);
      pages.push({
        url: sub.url,
        kind: target.kind,
        text: sub.textContent,
      });
      extraImages.push(...sub.images);
      extraHeadings.push(...sub.headings);
      tallyPalette(sub.palette);
      sub.fonts.forEach((f) => extraFonts.add(f));
    } catch {
      // swallow per-page failures; we still have the homepage
    }
  }

  const mergedPalette = Array.from(paletteCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex)
    .slice(0, 16);

  const joinedText = pages.map((p) => p.text).join("\n");
  const joinedHtml = base.rawHtml;

  const emails = uniq(
    (joinedText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []).map((e) =>
      e.toLowerCase(),
    ),
  )
    .filter((e) => !/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(e))
    .slice(0, 10);

  const phones = uniq(
    (joinedText.match(/(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g) ?? []).map((p) =>
      p.trim(),
    ),
  ).slice(0, 8);

  const socials = extractSocials(joinedHtml, base.links.map((l) => l.href));

  const logo = base.logoUrl ?? pickLogo(base);

  const mergedImages = uniqBy(
    [...base.images, ...extraImages].filter((i) => !isTinyAsset(i.src)),
    (i) => i.src,
  ).slice(0, 200);

  const mergedHeadings = uniqBy(
    [...base.headings, ...extraHeadings],
    (h) => `${h.tag}|${h.text}`,
  ).slice(0, 80);

  return {
    ...base,
    images: mergedImages,
    headings: mergedHeadings,
    palette: mergedPalette,
    fonts: Array.from(extraFonts).slice(0, 10),
    pages,
    emails,
    phones,
    socials,
    logo,
    ogImage: base.ogImage,
  };
}

function pickLink(
  links: ScrapeResult["links"],
  originHost: string,
  hints: string[],
): { href: string } | null {
  const sameHost = links.filter((l) => safeHost(l.href) === originHost);
  for (const h of hints) {
    const hit = sameHost.find((l) => {
      const p = safePath(l.href);
      return p.includes(h) || l.text.toLowerCase().includes(h.replace(/-/g, " "));
    });
    if (hit) return { href: hit.href };
  }
  return null;
}

function pickLinks(
  links: ScrapeResult["links"],
  originHost: string,
  hints: string[],
  max: number,
): { href: string; text: string }[] {
  const sameHost = links.filter((l) => safeHost(l.href) === originHost);
  const hits: { href: string; text: string }[] = [];
  const seenHrefs = new Set<string>();
  for (const l of sameHost) {
    if (hits.length >= max) break;
    const p = safePath(l.href);
    const textLower = l.text.toLowerCase();
    const match = hints.some(
      (h) => p.includes(h) || textLower.includes(h.replace(/-/g, " ")),
    );
    if (!match) continue;
    const k = normalizeForDedup(l.href);
    if (seenHrefs.has(k)) continue;
    seenHrefs.add(k);
    hits.push({ href: l.href, text: l.text });
  }
  return hits;
}

function sameOriginTopLevelLinks(
  links: ScrapeResult["links"],
  originHost: string,
  baseUrl: string,
): { href: string; text: string }[] {
  const out: { href: string; text: string }[] = [];
  const seen = new Set<string>([normalizeForDedup(baseUrl)]);
  for (const l of links) {
    if (safeHost(l.href) !== originHost) continue;
    const p = safePath(l.href);
    if (!p || p === "/" || p === "") continue;
    // skip asset-looking links, anchor-only, mailto, tel
    if (/^(mailto:|tel:|javascript:)/i.test(l.href)) continue;
    if (/\.(png|jpe?g|gif|svg|webp|pdf|zip|ico|css|js)(\?|$)/i.test(p)) continue;
    // prefer short single-segment paths — these are the main nav pages
    const segments = p.split("/").filter(Boolean);
    if (segments.length > 2) continue;
    const key = normalizeForDedup(l.href);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ href: l.href, text: l.text });
  }
  return out;
}

function extractSocials(html: string, links: string[]): DeepScrapeResult["socials"] {
  const pool = [...links, ...(html.match(/https?:\/\/[^"'\s<>]+/g) ?? [])];
  const find = (patterns: RegExp[]): string | null => {
    for (const l of pool) {
      if (patterns.some((r) => r.test(l))) return l;
    }
    return null;
  };
  return {
    instagram: find([/instagram\.com\/[^/?#]+/i]),
    facebook: find([/facebook\.com\/[^/?#]+/i]),
    twitter: find([/(twitter|x)\.com\/[^/?#]+/i]),
    linkedin: find([/linkedin\.com\/(company|in)\/[^/?#]+/i]),
    tiktok: find([/tiktok\.com\/@[^/?#]+/i]),
    youtube: find([/youtube\.com\/(channel|c|@)[^/?#]+/i, /youtu\.be\/[^/?#]+/i]),
  };
}

function pickLogo(base: ScrapeResult): string | null {
  const byAlt = base.images.find((i) => (i.alt ?? "").toLowerCase().includes("logo"));
  if (byAlt) return byAlt.src;
  const bySrc = base.images.find((i) => /logo/i.test(i.src));
  if (bySrc) return bySrc.src;
  return base.favicon;
}

function safeHost(u: string): string {
  try {
    return new URL(u).host.replace(/^www\./, "");
  } catch {
    return "";
  }
}
function safePath(u: string): string {
  try {
    return new URL(u).pathname.toLowerCase();
  } catch {
    return u.toLowerCase();
  }
}
function normalizeForDedup(u: string): string {
  try {
    const url = new URL(u);
    return `${url.host.replace(/^www\./, "")}${url.pathname.replace(/\/$/, "")}`.toLowerCase();
  } catch {
    return u.toLowerCase();
  }
}
function isTinyAsset(src: string): boolean {
  return /(?:\b|[_-])(icon|sprite|pixel|tracker|1x1)\b/i.test(src) || /\.svg$/i.test(src) && /icon/i.test(src);
}
function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
function uniqBy<T, K>(arr: T[], by: (x: T) => K): T[] {
  const seen = new Set<K>();
  const out: T[] = [];
  for (const x of arr) {
    const k = by(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

// Re-export cheerio here for a compact public API if callers want it
export { cheerio };
