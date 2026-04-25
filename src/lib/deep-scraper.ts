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
  // Best contact-form schema we found while crawling. The build flow uses
  // this as a fallback delivery channel when `emails` is empty — outreach
  // can replay the POST instead of needing a mailto: address.
  contactForm:
    | (ScrapeResult["forms"][number] & { pageUrl: string; pageKind: SubpageKind })
    | null;
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
const MAX_SUBPAGES = 18;
const SITEMAP_TIMEOUT_MS = 4000;
const SITEMAP_MAX_URLS = 30;

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
  const pushCandidate = (href: string, text: string, kind: SubpageKind) => {
    const key = normalizeForDedup(href);
    if (candidates.some((c) => normalizeForDedup(c.href) === key)) return;
    candidates.push({ href, text, kind });
  };

  for (const l of sameOriginTopLevelLinks(base.links, originHost, base.url)) {
    if (candidates.length >= MAX_SUBPAGES) break;
    pushCandidate(l.href, l.text, classifyByPath(l.href, l.text));
  }

  // Sitemap.xml discovery — guarantees we see pages not linked from the
  // homepage nav (deep service pages, location pages, etc).
  try {
    const sitemapUrls = await fetchSitemapUrls(base.url, originHost);
    for (const href of sitemapUrls) {
      if (candidates.length >= MAX_SUBPAGES) break;
      pushCandidate(href, "", classifyByPath(href, ""));
    }
  } catch {
    // sitemap is optional
  }

  const extraImages: ScrapeResult["images"] = [];
  const extraHeadings: ScrapeResult["headings"] = [];
  // Collect every href across the homepage + crawled subpages so the
  // email/phone extractors see mailto:/tel: links that aren't echoed in
  // the visible text.
  const allHrefs: string[] = base.links.map((l) => l.href);
  // Scan rawHtml across pages too — email addresses sometimes only appear
  // in attributes (e.g. obfuscation, JSON-LD ContactPoint, microdata) and
  // never in the rendered text.
  const htmlFragments: string[] = [base.rawHtml];
  // Carries every form we saw across the homepage + subpages. Each entry is
  // tagged with the URL/kind of the page that hosted it so we can prefer
  // contact/quote pages when picking the best form below.
  type ScannedForm = ScrapeResult["forms"][number] & {
    pageUrl: string;
    pageKind: SubpageKind;
  };
  const scannedForms: ScannedForm[] = [];
  const tallyForms = (list: ScrapeResult["forms"], pageUrl: string, kind: SubpageKind) => {
    for (const f of list) scannedForms.push({ ...f, pageUrl, pageKind: kind });
  };
  tallyForms(base.forms, base.url, "home");
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
      tallyForms(sub.forms, sub.url, target.kind);
      for (const l of sub.links) allHrefs.push(l.href);
      htmlFragments.push(sub.rawHtml);
    } catch {
      // swallow per-page failures; we still have the homepage
    }
  }

  const mergedPalette = Array.from(paletteCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex)
    .slice(0, 16);

  const joinedText = pages.map((p) => p.text).join("\n");
  const joinedHtml = htmlFragments.join("\n");

  // Mine every signal: visible text, full HTML across all crawled pages,
  // and explicit mailto:/tel: hrefs (which often have NO matching visible
  // text — `<a href="mailto:foo@bar.com">Email us</a>`).
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
  const emailHits: string[] = [];
  for (const href of allHrefs) {
    if (!/^mailto:/i.test(href)) continue;
    // Strip mailto: scheme and any ?subject=&body= query so we keep the
    // address only. Some sites encode it (mailto:foo%40bar.com).
    const raw = href.replace(/^mailto:/i, "").split("?")[0];
    let decoded = raw;
    try {
      decoded = decodeURIComponent(raw);
    } catch {
      // leave raw — best effort
    }
    if (decoded) emailHits.push(decoded);
  }
  emailHits.push(...(joinedText.match(emailRegex) ?? []));
  emailHits.push(...(joinedHtml.match(emailRegex) ?? []));
  const emails = uniq(emailHits.map((e) => e.toLowerCase()))
    .filter((e) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(e))
    .filter((e) => !/\.(png|jpg|jpeg|gif|svg|webp)$/i.test(e))
    .filter((e) => !/(sentry|cloudflare|wixpress|godaddy|squarespace)\./i.test(e))
    .slice(0, 10);

  const phoneRegex = /(\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  const phoneHits: string[] = [];
  for (const href of allHrefs) {
    if (!/^tel:/i.test(href)) continue;
    phoneHits.push(href.replace(/^tel:/i, "").trim());
  }
  phoneHits.push(...(joinedText.match(phoneRegex) ?? []));
  const phones = uniq(phoneHits.map((p) => p.trim()))
    .filter((p) => p.length >= 7)
    .slice(0, 8);

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

  // Pick the best form across every page we crawled. Bias toward forms
  // that came from contact-kind pages — that's the canonical place a real
  // contact form lives. Within a page, we trust the heuristic score from
  // the scraper (email + message fields, name/phone bonuses, search/
  // newsletter penalties).
  const contactForm = pickBestContactForm(scannedForms);

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
    contactForm,
  };
}

function pickBestContactForm(
  forms: (ScrapeResult["forms"][number] & {
    pageUrl: string;
    pageKind: SubpageKind;
  })[],
): DeepScrapeResult["contactForm"] {
  if (!forms.length) return null;
  const ranked = forms
    .map((f) => ({
      form: f,
      // Page-kind bonus pushes the contact-page form ahead of the global
      // newsletter form in the footer.
      ranked: f.score + (f.pageKind === "contact" ? 12 : 0),
    }))
    .filter((entry) => entry.ranked > 0)
    .sort((a, b) => b.ranked - a.ranked);
  return ranked[0]?.form ?? null;
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

function classifyByPath(href: string, text: string): SubpageKind {
  const p = safePath(href);
  const t = text.toLowerCase();
  const has = (hints: string[]) => hints.some((h) => p.includes(h) || t.includes(h.replace(/-/g, " ")));
  if (has(WORK_HINTS)) return "work";
  if (has(SERVICES_HINTS)) return "services";
  if (has(ABOUT_HINTS)) return "about";
  if (has(REVIEWS_HINTS)) return "reviews";
  if (has(AREAS_HINTS)) return "areas";
  if (has(FAQ_HINTS)) return "faq";
  if (has(BLOG_HINTS)) return "blog";
  if (has(CONTACT_HINTS)) return "contact";
  return "other";
}

async function fetchSitemapUrls(baseUrl: string, originHost: string): Promise<string[]> {
  let origin = "";
  try {
    origin = new URL(baseUrl).origin;
  } catch {
    return [];
  }
  const candidates = [`${origin}/sitemap.xml`, `${origin}/sitemap_index.xml`];
  const discovered: string[] = [];
  for (const url of candidates) {
    const xml = await fetchWithTimeout(url, SITEMAP_TIMEOUT_MS);
    if (!xml) continue;
    const locMatches = Array.from(xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => m[1]);
    const nested: string[] = [];
    for (const loc of locMatches) {
      if (/\.xml(\?|$)/i.test(loc) && safeHost(loc) === originHost) nested.push(loc);
      else if (safeHost(loc) === originHost && !/\.(png|jpe?g|gif|svg|webp|pdf|zip|ico|css|js)(\?|$)/i.test(loc)) {
        discovered.push(loc);
      }
    }
    // one level of nested sitemap expansion — enough for /sitemap_index.xml
    for (const nestedUrl of nested.slice(0, 4)) {
      const sub = await fetchWithTimeout(nestedUrl, SITEMAP_TIMEOUT_MS);
      if (!sub) continue;
      const subLocs = Array.from(sub.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)).map((m) => m[1]);
      for (const loc of subLocs) {
        if (safeHost(loc) !== originHost) continue;
        if (/\.(png|jpe?g|gif|svg|webp|pdf|zip|ico|css|js|xml)(\?|$)/i.test(loc)) continue;
        discovered.push(loc);
      }
    }
    if (discovered.length) break; // stop at the first sitemap that returns URLs
  }
  // De-dup and trim
  const seen = new Set<string>();
  const out: string[] = [];
  for (const u of discovered) {
    const k = normalizeForDedup(u);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(u);
    if (out.length >= SITEMAP_MAX_URLS) break;
  }
  return out;
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<string | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; AmentiAffiliateBot/1.0)" },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
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
