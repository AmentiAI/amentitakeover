import * as cheerio from "cheerio";
import { scrapeSite, type ScrapeResult } from "./scraper";

export type DeepScrapeResult = ScrapeResult & {
  pages: { url: string; kind: "home" | "contact" | "about"; text: string }[];
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

const CONTACT_HINTS = ["contact", "get-in-touch", "reach-us", "quote"];
const ABOUT_HINTS = ["about", "who-we-are", "our-story", "team"];
const SERVICES_HINTS = ["services", "what-we-do", "solutions"];
const WORK_HINTS = ["gallery", "portfolio", "projects", "work", "case-studies"];
const MAX_SUBPAGES = 5;

export async function deepScrapeSite(inputUrl: string): Promise<DeepScrapeResult> {
  const base = await scrapeSite(inputUrl);

  const pages: DeepScrapeResult["pages"] = [
    { url: base.url, kind: "home", text: base.textContent },
  ];

  const originHost = safeHost(base.url);
  const seen = new Set<string>([normalizeForDedup(base.url)]);

  const candidates: { href: string; kind: string }[] = [];
  for (const hints of [CONTACT_HINTS, ABOUT_HINTS, SERVICES_HINTS, WORK_HINTS]) {
    const hit = pickLink(base.links, originHost, hints);
    if (hit) candidates.push(hit);
  }

  const extraImages: ScrapeResult["images"] = [];
  const extraHeadings: ScrapeResult["headings"] = [];
  const extraPalette = new Set(base.palette);
  const extraFonts = new Set(base.fonts);

  for (const target of candidates.slice(0, MAX_SUBPAGES)) {
    const key = normalizeForDedup(target.href);
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      const sub = await scrapeSite(target.href);
      pages.push({
        url: sub.url,
        kind: target.kind as "contact" | "about",
        text: sub.textContent,
      });
      extraImages.push(...sub.images);
      extraHeadings.push(...sub.headings);
      sub.palette.forEach((c) => extraPalette.add(c));
      sub.fonts.forEach((f) => extraFonts.add(f));
    } catch {
      // swallow per-page failures; we still have the homepage
    }
  }

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
    palette: Array.from(extraPalette).slice(0, 16),
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
): { href: string; kind: string } | null {
  const sameHost = links.filter((l) => safeHost(l.href) === originHost);
  for (const h of hints) {
    const hit = sameHost.find((l) => {
      const p = safePath(l.href);
      return p.includes(h) || l.text.toLowerCase().includes(h.replace(/-/g, " "));
    });
    if (hit) return { href: hit.href, kind: hints[0] };
  }
  return null;
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
