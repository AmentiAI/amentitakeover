import * as cheerio from "cheerio";

export type ScrapeMedia = {
  src: string;
  alt: string | null;
  kind?: "image" | "video";
  poster?: string | null;
};

export type ScrapeResult = {
  url: string;
  title: string | null;
  description: string | null;
  favicon: string | null;
  logoUrl: string | null;
  ogImage: string | null;
  rawHtml: string;
  textContent: string;
  headings: { tag: string; text: string }[];
  images: ScrapeMedia[];
  links: { href: string; text: string }[];
  palette: string[];
  fonts: string[];
  forms: FormSchema[];
  // Pass/fail snapshot of the homepage's heading hygiene. Pass = exactly
  // one <h1> AND at least three <h2>s — a quick proxy for "this page is
  // structured content, not a single hero with a contact button."
  contentScore: ContentScore;
  // Cheap-to-extract pitch signals — CMS, last-updated year, mobile flag,
  // SEO completeness, analytics + booking + chat stack, schema.org,
  // stock-photo count. See src/lib/site-signals.ts.
  signals: import("./site-signals").SiteSignals;
};

export type ContentScore = {
  h1Count: number;
  h2Count: number;
  passed: boolean;
};

// Captured shape of a `<form>` element on the page. We persist this so that
// downstream "submit on the prospect's behalf" flows can replay the POST
// without scraping the contact page again. `action` is absolute; `fields`
// includes hidden inputs (CSRF tokens, etc.) so the replay carries them.
export type FormField = {
  name: string;
  type: string; // text | email | tel | textarea | select | checkbox | radio | hidden | ...
  placeholder?: string;
  required?: boolean;
  label?: string;
  value?: string;
  options?: { value: string; label: string }[];
};

export type FormSchema = {
  action: string;
  method: "GET" | "POST";
  encoding: string | null;
  fields: FormField[];
  hasEmailField: boolean;
  hasMessageField: boolean;
  score: number;
  // Detected human-verification challenge — null when the form is a clean
  // dropoff target. Replaying a captcha-protected form without solving the
  // challenge will be silently rejected by the recipient.
  captcha: CaptchaInfo | null;
};

export type CaptchaInfo = {
  type: "recaptcha" | "hcaptcha" | "turnstile" | "wpcf7-recaptcha" | "unknown";
  signals: string[];
};

// Hosts we never want to pull imagery from — these are always social-brand
// logos, follow-us buttons, or embeds we don't want polluting a business's
// "recent work" gallery.
const SOCIAL_HOSTS = [
  "facebook.com",
  "fbcdn.net",
  "instagram.com",
  "cdninstagram.com",
  "twitter.com",
  "x.com",
  "twimg.com",
  "tiktok.com",
  "tiktokcdn.com",
  "linkedin.com",
  "licdn.com",
  "pinterest.com",
  "pinimg.com",
  "yelp.com",
  "yelpcdn.com",
  "nextdoor.com",
  "angi.com",
  "bbb.org",
];

// Filename patterns that are almost always social-share buttons / brand icons.
const SOCIAL_FILE_RE =
  /(facebook|instagram|twitter|x-?logo|tiktok|linkedin|pinterest|youtube|yelp|whatsapp|nextdoor|bbb|google-?(plus|my-?business|review))[-_\s]?(icon|logo|badge|btn|button|share)?\.(png|jpe?g|svg|webp|gif)/i;

// Hiring / careers / "join our team" banners and generic ads — these never
// belong in a business's "recent work" gallery.
const HIRING_RE =
  /(now[-_\s]?hiring|we'?re[-_\s]?hiring|hiring(?![a-z])|careers?|join[-_\s]?(our[-_\s]?)?team|apply[-_\s]?now|job[-_\s]?(opening|board)|we'?re[-_\s]?growing|work[-_\s]?with[-_\s]?us)/i;

// Payment-method logos, review-network badges, site-builder credits, ad units.
const VENDOR_BADGE_RE =
  /(visa|mastercard|amex|american[-_\s]?express|discover|paypal|apple[-_\s]?pay|google[-_\s]?pay|venmo|stripe|square|homeadvisor|home[-_\s]?advisor|angies?[-_\s]?list|thumbtack|porch\.com|houzz|trustpilot|trulia|zillow|realtor|energystar|energy[-_\s]?star|powered[-_\s]?by|built[-_\s]?with|wix[-_\s]?logo|squarespace[-_\s]?logo|wordpress[-_\s]?logo|godaddy|wp[-_\s]?logo)/i;

// Common promo/advert filename patterns. Deliberately excludes "banner"
// because legitimate hero images are frequently named "hero-banner.jpg".
const AD_BANNER_RE =
  /(\b|[-_/])(ads?|promo|sale|coupon|discount|offer|deal|placeholder|default-image|mock-up|mockup)([-_0-9]|\.[a-z]{3,4}(?:$|\?))/i;

function isSocialAsset(src: string, alt: string | null): boolean {
  let host = "";
  try {
    host = new URL(src).host.toLowerCase().replace(/^www\./, "");
  } catch {
    // non-URL (e.g. data:) — skip host check, fall through to filename
  }
  if (host && SOCIAL_HOSTS.some((h) => host === h || host.endsWith(`.${h}`))) return true;
  if (SOCIAL_FILE_RE.test(src)) return true;
  if (alt && /^(facebook|instagram|twitter|x|tiktok|linkedin|pinterest|youtube|yelp|bbb|google)$/i.test(alt.trim())) return true;
  return false;
}

function isIrrelevantAsset(src: string, alt: string | null): boolean {
  const haystack = `${src} ${alt ?? ""}`;
  if (HIRING_RE.test(haystack)) return true;
  if (VENDOR_BADGE_RE.test(haystack)) return true;
  if (AD_BANNER_RE.test(src)) return true;
  return false;
}

// Thrown when a fetch hits a Cloudflare / WAF challenge page that gates
// content behind a JS-solver. We can't get past this with plain fetch —
// the operator gets a clear error message so they know to switch tactics
// (headless browser, paid scraping API, manual visit).
export class BotChallengeError extends Error {
  constructor(public vendor: string, public url: string) {
    super(`Blocked by ${vendor} bot challenge — site requires JS-solving browser to scrape (${url})`);
    this.name = "BotChallengeError";
  }
}

// Tries plain fetch first (cheap, fast). If we hit a bot challenge, falls
// back to a headless browser that can execute the challenge JS. Set
// SCRAPER_FORCE_BROWSER=1 to skip the fetch attempt entirely.
async function fetchPageHtml(
  inputUrl: string,
): Promise<{ rawHtml: string; url: string; usedBrowser: boolean }> {
  const requestUrl = normalizeUrl(inputUrl);
  const forceBrowser = process.env.SCRAPER_FORCE_BROWSER === "1";

  if (!forceBrowser) {
    try {
      // Lean on a real-browser header set so we don't get auto-flagged as
      // a crawler by lightweight bot rules. Doesn't beat full JS
      // challenges (those require a real browser), but gets us past the
      // easy heuristics.
      const res = await fetch(requestUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-CH-UA":
            '"Chromium";v="124", "Google Chrome";v="124", "Not?A_Brand";v="99"',
          "Sec-CH-UA-Mobile": "?0",
          "Sec-CH-UA-Platform": '"macOS"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        },
        redirect: "follow",
      });
      // Use the final URL after any redirect chain as the canonical
      // origin. Critical for sites that redirect http→https or apex→www.
      const url = res.url || requestUrl;

      // Cloudflare's challenge response → fall through to browser.
      if (res.status === 403 && /cloudflare/i.test(res.headers.get("server") ?? "")) {
        throw new BotChallengeError("Cloudflare", url);
      }
      if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

      const rawHtml = await res.text();
      if (
        /<title>\s*Just a moment\.{2,}\s*<\/title>/i.test(rawHtml) ||
        /challenge-platform|cf_chl_opt|_cf_chl_/i.test(rawHtml)
      ) {
        throw new BotChallengeError("Cloudflare", url);
      }
      if (/<title>\s*Access denied/i.test(rawHtml) && /perimeterx|akamai|incapsula|sucuri/i.test(rawHtml)) {
        throw new BotChallengeError("WAF", url);
      }
      return { rawHtml, url, usedBrowser: false };
    } catch (err) {
      if (!(err instanceof BotChallengeError)) throw err;
      // Fall through to browser path.
    }
  }

  // Browser fallback — dynamic-imported so we only load Playwright when
  // we actually need it (most scrapes never reach this branch).
  const { fetchPageWithBrowser } = await import("./scraper-browser");
  const r = await fetchPageWithBrowser(requestUrl);
  // Even after the browser runs the challenge, if we still see the
  // challenge title the solver couldn't get past — surface as a clean
  // error rather than parsing the challenge HTML as content.
  if (
    /<title>\s*Just a moment\.{2,}\s*<\/title>/i.test(r.rawHtml) ||
    /<title>\s*Attention Required/i.test(r.rawHtml)
  ) {
    throw new BotChallengeError("Cloudflare", r.finalUrl);
  }
  return { rawHtml: r.rawHtml, url: r.finalUrl, usedBrowser: true };
}

export async function scrapeSite(inputUrl: string): Promise<ScrapeResult> {
  const { rawHtml, url } = await fetchPageHtml(inputUrl);
  const $ = cheerio.load(rawHtml);

  // Fetch a few same-origin stylesheets so we actually see the site's real
  // colors instead of just inline hex codes in the HTML.
  const cssBlob = await fetchSameOriginStylesheets($, url);

  const title = $("title").first().text().trim() || null;
  const description =
    $('meta[name="description"]').attr("content")?.trim() ||
    $('meta[property="og:description"]').attr("content")?.trim() ||
    null;
  const faviconRaw =
    $('link[rel="apple-touch-icon"]').attr("href") ||
    $('link[rel~="icon"][sizes]').attr("href") ||
    $('link[rel~="icon"]').attr("href") ||
    $('link[rel="shortcut icon"]').attr("href") ||
    "/favicon.ico";
  const faviconAbs = faviconRaw ? absolutize(faviconRaw, url) : null;
  const favicon = faviconAbs ? normalizeImageUrl(faviconAbs) : null;

  const ogImageRaw =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="og:image"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null;
  const ogImageAbs = ogImageRaw ? absolutize(ogImageRaw, url) : null;
  const ogImage = ogImageAbs ? normalizeImageUrl(ogImageAbs) : null;

  const logoRaw = detectLogo($, url) ?? favicon;
  const logoUrl = logoRaw ? normalizeImageUrl(logoRaw) : null;

  const headings: { tag: string; text: string }[] = [];
  $("h1, h2, h3").each((_i, el) => {
    const t = $(el).text().trim();
    if (t) headings.push({ tag: el.tagName.toLowerCase(), text: t });
  });

  const imageSet = new Set<string>();
  const images: ScrapeMedia[] = [];
  const pushImg = (rawSrc: string | undefined, alt: string | null) => {
    if (!rawSrc) return;
    const abs = absolutize(rawSrc.trim(), url);
    if (!abs) return;
    const normalized = normalizeImageUrl(abs);
    if (imageSet.has(normalized)) return;
    if (isSocialAsset(normalized, alt)) return;
    if (isIrrelevantAsset(normalized, alt)) return;
    imageSet.add(normalized);
    images.push({ src: normalized, alt, kind: "image" });
  };
  const pushVideo = (rawSrc: string | undefined, poster: string | null, alt: string | null) => {
    if (!rawSrc) return;
    const abs = absolutize(rawSrc.trim(), url);
    if (!abs || imageSet.has(abs)) return;
    imageSet.add(abs);
    images.push({ src: abs, alt, kind: "video", poster: poster ?? null });
  };

  $("img").each((_i, el) => {
    const alt = $(el).attr("alt") ?? null;
    // Standard src + common lazy-load attributes
    const candidates = [
      $(el).attr("src"),
      $(el).attr("data-src"),
      $(el).attr("data-lazy-src"),
      $(el).attr("data-original"),
      $(el).attr("data-srcset"),
      $(el).attr("srcset"),
    ];
    for (const c of candidates) {
      if (!c) continue;
      if (looksLikeSrcset(c)) {
        for (const url of parseSrcset(c)) pushImg(url, alt);
      } else {
        pushImg(c, alt);
      }
    }
  });

  // <picture><source srcset="..."> — pull first candidate
  $("picture source").each((_i, el) => {
    const srcset = $(el).attr("srcset");
    if (!srcset) return;
    const first = parseSrcset(srcset)[0];
    if (first) pushImg(first, null);
  });

  // Inline background-image in style attrs
  $("[style*='background-image']").each((_i, el) => {
    const style = $(el).attr("style") ?? "";
    const m = style.match(/background-image\s*:\s*url\(["']?([^"')]+)["']?\)/i);
    if (m) pushImg(m[1], null);
  });

  // <video src> / <video><source src>
  $("video").each((_i, el) => {
    const poster = $(el).attr("poster") ?? null;
    const alt = $(el).attr("aria-label") ?? $(el).attr("title") ?? null;
    const direct = $(el).attr("src");
    if (direct) pushVideo(direct, poster, alt);
    $(el).find("source").each((_j, srcEl) => {
      pushVideo($(srcEl).attr("src"), poster, alt);
    });
  });

  // YouTube / Vimeo / Wistia embeds
  $("iframe[src]").each((_i, el) => {
    const src = $(el).attr("src") ?? "";
    if (/(youtube\.com\/embed|youtu\.be|vimeo\.com|wistia\.com|wistia\.net)/i.test(src)) {
      const alt = $(el).attr("title") ?? null;
      pushVideo(src, null, alt);
    }
  });

  // Background-image in stylesheets / inline <style>
  const styleText = $("style").map((_i, el) => $(el).text()).get().join("\n");
  const bgRe = /url\(["']?([^"')\s]+\.(?:jpe?g|png|webp|avif|gif))["']?\)/gi;
  let bgMatch: RegExpExecArray | null;
  while ((bgMatch = bgRe.exec(styleText))) {
    pushImg(bgMatch[1], null);
  }

  const links: { href: string; text: string }[] = [];
  $("a[href]").each((_i, el) => {
    const href = $(el).attr("href")!;
    links.push({ href: absolutize(href, url), text: $(el).text().trim() });
  });

  // Capture <form> elements before stripping scripts/styles — we want field
  // metadata (including hidden CSRF inputs) for replay.
  const forms = extractForms($, url);

  $("script, style, noscript, svg").remove();
  const textContent = $("body").text().replace(/\s+/g, " ").trim().slice(0, 20000);

  const palette = extractPalette(rawHtml + "\n" + cssBlob);
  const fonts = extractFonts(rawHtml + "\n" + cssBlob);

  // Heading-hygiene pass/fail snapshot of the page. Lives at the page
  // level (homepage gets the meaningful score in deep-scrape) — the
  // criteria match an "is this a real content page, not just a hero +
  // contact button" rubric.
  const h1Count = headings.filter((h) => h.tag === "h1").length;
  const h2Count = headings.filter((h) => h.tag === "h2").length;
  const contentScore: ContentScore = {
    h1Count,
    h2Count,
    passed: h1Count === 1 && h2Count >= 3,
  };

  // Outreach-personalization signals derived from the same HTML we
  // already parsed — runs inline so we never touch the network for it.
  const { extractSignals } = await import("./site-signals");
  const signals = extractSignals(
    $,
    rawHtml,
    images.map((i) => i.src),
  );

  return {
    url,
    title,
    description,
    favicon,
    logoUrl,
    ogImage,
    rawHtml: rawHtml.slice(0, 200_000),
    textContent,
    headings: headings.slice(0, 60),
    images: dedupeImagesBySize(images).slice(0, 120),
    links: links.slice(0, 120),
    palette,
    fonts,
    forms,
    contentScore,
    signals,
  };
}

function detectLogo(
  $: cheerio.CheerioAPI,
  base: string,
): string | null {
  // 1. JSON-LD Organization.logo
  let jsonLdLogo: string | null = null;
  $('script[type="application/ld+json"]').each((_i, el) => {
    if (jsonLdLogo) return;
    try {
      const txt = $(el).contents().text();
      const parsed = JSON.parse(txt);
      const candidates = Array.isArray(parsed) ? parsed : [parsed];
      for (const node of candidates) {
        const logo =
          typeof node?.logo === "string"
            ? node.logo
            : typeof node?.logo?.url === "string"
              ? node.logo.url
              : null;
        if (logo) {
          jsonLdLogo = absolutize(logo, base);
          return;
        }
      }
    } catch {
      // ignore bad JSON
    }
  });
  if (jsonLdLogo) return jsonLdLogo;

  // 2. <img alt="logo" ...> or src contains /logo
  const imgs = $("img").toArray();
  const byAlt = imgs.find((el) => /logo/i.test($(el).attr("alt") ?? ""));
  if (byAlt) {
    const src = $(byAlt).attr("src");
    if (src) return absolutize(src, base);
  }
  const bySrc = imgs.find((el) => /logo/i.test($(el).attr("src") ?? ""));
  if (bySrc) {
    const src = $(bySrc).attr("src");
    if (src) return absolutize(src, base);
  }

  // 3. First img inside <header>, <nav>, or .logo / #logo containers
  const headerImg =
    $("header img").first().attr("src") ||
    $("nav img").first().attr("src") ||
    $(".logo img, #logo img, [class*='Logo'] img, [class*='brand'] img")
      .first()
      .attr("src") ||
    null;
  if (headerImg) return absolutize(headerImg, base);

  return null;
}

function normalizeUrl(u: string): string {
  if (!/^https?:\/\//i.test(u)) return `https://${u}`;
  return u;
}

function absolutize(href: string, base: string): string {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function extractPalette(source: string): string[] {
  // Count occurrences so the picker can prefer colors the site actually uses
  // a lot (primary brand color) over single-mention values (borders, tokens).
  const counts = new Map<string, number>();
  const bump = (hex: string) => counts.set(hex, (counts.get(hex) ?? 0) + 1);

  // 1. literal hex: #rgb or #rrggbb
  const hexRe = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = hexRe.exec(source))) bump(`#${expandShortHex(m[1].toLowerCase())}`);

  // 2. rgb() / rgba()
  const rgbRe = /rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})/gi;
  while ((m = rgbRe.exec(source))) {
    const r = clampByte(Number(m[1]));
    const g = clampByte(Number(m[2]));
    const b = clampByte(Number(m[3]));
    bump(rgbToHexString(r, g, b));
  }

  // 3. hsl() / hsla() — normalize to hex via HSL->RGB
  const hslRe = /hsla?\(\s*(\d{1,3}(?:\.\d+)?)\s*[, ]\s*(\d{1,3}(?:\.\d+)?)%\s*[, ]\s*(\d{1,3}(?:\.\d+)?)%/gi;
  while ((m = hslRe.exec(source))) {
    const h = Number(m[1]);
    const s = Math.min(100, Math.max(0, Number(m[2]))) / 100;
    const l = Math.min(100, Math.max(0, Number(m[3]))) / 100;
    bump(hslToHexString(h, s, l));
  }

  // Order by frequency desc — color-pick.ts uses position as a usage signal.
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([hex]) => hex)
    .slice(0, 48);
}

function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function expandShortHex(s: string): string {
  return s.length === 3 ? s.split("").map((c) => c + c).join("") : s;
}

function rgbToHexString(r: number, g: number, b: number): string {
  const pad = (n: number) => n.toString(16).padStart(2, "0");
  return `#${pad(r)}${pad(g)}${pad(b)}`;
}

function hslToHexString(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  return rgbToHexString(
    clampByte((r1 + m) * 255),
    clampByte((g1 + m) * 255),
    clampByte((b1 + m) * 255),
  );
}

const STYLESHEET_BYTE_BUDGET = 400_000; // ~400KB total across all fetched sheets
const STYLESHEET_MAX_FILES = 4;
const STYLESHEET_TIMEOUT_MS = 4000;

async function fetchSameOriginStylesheets(
  $: cheerio.CheerioAPI,
  base: string,
): Promise<string> {
  let origin = "";
  try {
    origin = new URL(base).origin;
  } catch {
    return "";
  }

  const hrefs: string[] = [];
  $("link[rel='stylesheet'][href], link[rel~='stylesheet'][href]").each((_i, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const abs = absolutize(href, base);
    if (!abs.startsWith(origin)) return; // same-origin only
    if (!hrefs.includes(abs)) hrefs.push(abs);
  });

  const targets = hrefs.slice(0, STYLESHEET_MAX_FILES);
  let remaining = STYLESHEET_BYTE_BUDGET;
  const chunks: string[] = [];

  const results = await Promise.all(
    targets.map((href) => fetchText(href, remaining).catch(() => null)),
  );
  for (const body of results) {
    if (!body) continue;
    if (body.length > remaining) {
      chunks.push(body.slice(0, remaining));
      remaining = 0;
      break;
    }
    chunks.push(body);
    remaining -= body.length;
  }
  return chunks.join("\n");
}

async function fetchText(url: string, maxBytes: number): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), STYLESHEET_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SignullBot/1.0)" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!res.ok) return "";
    const text = await res.text();
    return text.length > maxBytes ? text.slice(0, maxBytes) : text;
  } finally {
    clearTimeout(timer);
  }
}

// Pulls every <form> on the page into a structured schema. Skips submit
// buttons (they're triggers, not data) but keeps hidden inputs because they
// frequently carry CSRF / nonce tokens required by the form's backend.
// Each form gets a heuristic score so deep-scraper can pick the best one.
// Also stamps each form with detected captcha info so downstream code can
// flag forms that won't submit cleanly without a human.
function extractForms(
  $: cheerio.CheerioAPI,
  baseUrl: string,
): FormSchema[] {
  // Detect captcha vendors at the page level — most challenges are loaded
  // via a script src then JS-injected into the form, so the script tag is
  // the most reliable signal regardless of whether the widget div has
  // been rendered yet.
  const pageScripts = $("script[src]")
    .map((_i, el) => ($(el).attr("src") ?? "").toLowerCase())
    .get();
  const pageCaptcha = pageLevelCaptcha(pageScripts);

  const forms: FormSchema[] = [];
  $("form").each((_i, formEl) => {
    const $form = $(formEl);
    const rawAction = ($form.attr("action") ?? "").trim();
    const action = rawAction ? absolutize(rawAction, baseUrl) : baseUrl;
    const methodRaw = ($form.attr("method") ?? "post").trim().toUpperCase();
    const method: "GET" | "POST" = methodRaw === "GET" ? "GET" : "POST";
    const encoding = ($form.attr("enctype") ?? "").trim() || null;

    const fields: FormField[] = [];
    $form.find("input, textarea, select").each((_j, fieldEl) => {
      const $field = $(fieldEl);
      const tag = (fieldEl as { tagName?: string }).tagName?.toLowerCase() ?? "";
      const typeAttr = ($field.attr("type") ?? "").toLowerCase();
      // Skip purely structural / trigger inputs — they aren't data fields.
      if (
        tag === "input" &&
        ["submit", "button", "image", "reset"].includes(typeAttr)
      ) {
        return;
      }
      const name = ($field.attr("name") ?? "").trim();
      // Anonymous fields can't be POSTed back; skip them.
      if (!name) return;
      const type =
        tag === "textarea"
          ? "textarea"
          : tag === "select"
            ? "select"
            : typeAttr || "text";
      const placeholder = ($field.attr("placeholder") ?? "").trim() || undefined;
      const required = $field.is("[required]") || undefined;
      const value = ($field.attr("value") ?? "").trim() || undefined;
      // Resolve label text — prefer aria-label, then a wrapping <label>, then
      // a <label for="..."> elsewhere in the form.
      const ariaLabel = ($field.attr("aria-label") ?? "").trim();
      let label: string | undefined = ariaLabel || undefined;
      if (!label) {
        const id = $field.attr("id");
        if (id) {
          const lbl = $form.find(`label[for="${id}"]`).first().text().trim();
          if (lbl) label = lbl;
        }
      }
      if (!label) {
        const wrap = $field.parent("label").text().trim();
        if (wrap) label = wrap;
      }
      const field: FormField = { name, type };
      if (placeholder) field.placeholder = placeholder;
      if (required) field.required = required;
      if (value) field.value = value;
      if (label) field.label = label;
      if (tag === "select") {
        const options: { value: string; label: string }[] = [];
        $field.find("option").each((_k, optEl) => {
          const $opt = $(optEl);
          const v = ($opt.attr("value") ?? $opt.text() ?? "").trim();
          const l = $opt.text().trim();
          if (v || l) options.push({ value: v, label: l });
        });
        if (options.length) field.options = options;
      }
      fields.push(field);
    });

    if (fields.length === 0) return;

    const hasEmailField = fields.some(
      (f) => f.type === "email" || /e[-_]?mail/i.test(f.name) || /e[-_]?mail/i.test(f.label ?? ""),
    );
    // Any <textarea> qualifies as a message field — that's the universal
    // affordance for free-text intent in HTML forms, regardless of the
    // name the site chose. The keyword regex covers single-line inputs
    // labelled "comment" / "your message" / etc. as a secondary signal.
    const hasMessageField = fields.some(
      (f) =>
        f.type === "textarea" ||
        /message|comments?|details|inquiry|notes|describe|question|project[-_ ]?description/i.test(f.name) ||
        /message|comments?|details|inquiry|notes|describe|question|project[-_ ]?description/i.test(f.label ?? ""),
    );
    const looksLikeSearch = fields.length === 1 && /search|q/i.test(fields[0].name);
    const looksLikeNewsletter =
      fields.length <= 2 && fields.every((f) => f.type === "email" || /name/i.test(f.name));

    let score = fields.length * 1;
    if (hasEmailField) score += 5;
    if (hasMessageField) score += 4;
    if (fields.some((f) => /name/i.test(f.name))) score += 1;
    if (fields.some((f) => /phone|tel/i.test(f.name) || f.type === "tel")) score += 2;
    if (looksLikeSearch) score = -10;
    if (looksLikeNewsletter) score -= 4;

    const captcha = detectFormCaptcha($, $form, pageCaptcha);
    // Captcha doesn't disqualify a form from being captured — we still
    // want the schema and field list — but a small score nudge lets a
    // captcha-free form on the same page win when scoring is otherwise
    // close.
    if (captcha) score -= 1;

    forms.push({
      action,
      method,
      encoding,
      fields,
      hasEmailField,
      hasMessageField,
      score,
      captcha,
    });
  });
  return forms;
}

function pageLevelCaptcha(scriptSrcs: string[]): CaptchaInfo | null {
  const signals: string[] = [];
  let type: CaptchaInfo["type"] | null = null;
  for (const src of scriptSrcs) {
    if (/google\.com\/recaptcha\/(api|enterprise)/i.test(src)) {
      signals.push(`script:${src}`);
      type = "recaptcha";
    } else if (/(?:^|\.)hcaptcha\.com\//i.test(src)) {
      signals.push(`script:${src}`);
      type = type ?? "hcaptcha";
    } else if (/challenges\.cloudflare\.com\/turnstile/i.test(src)) {
      signals.push(`script:${src}`);
      type = type ?? "turnstile";
    }
  }
  return type ? { type, signals } : null;
}

function detectFormCaptcha(
  $: cheerio.CheerioAPI,
  $form: cheerio.Cheerio<cheerio.Element>,
  pageCaptcha: CaptchaInfo | null,
): CaptchaInfo | null {
  const signals: string[] = [];
  let type: CaptchaInfo["type"] | null = null;

  // Hidden response inputs injected by the captcha widgets — most reliable
  // form-internal signal because the widget mounts with that input name.
  if ($form.find('[name="g-recaptcha-response"]').length) {
    signals.push("input:g-recaptcha-response");
    type = "recaptcha";
  }
  if ($form.find('[name="h-captcha-response"]').length) {
    signals.push("input:h-captcha-response");
    type = type ?? "hcaptcha";
  }
  if ($form.find('[name="cf-turnstile-response"]').length) {
    signals.push("input:cf-turnstile-response");
    type = type ?? "turnstile";
  }

  // Widget container divs (often empty pre-render but the class is still
  // there in the SSR'd HTML).
  if ($form.find(".g-recaptcha, [data-sitekey]").length) {
    signals.push("widget:g-recaptcha");
    type = type ?? "recaptcha";
  }
  if ($form.find(".h-captcha").length) {
    signals.push("widget:h-captcha");
    type = type ?? "hcaptcha";
  }
  if ($form.find(".cf-turnstile, .turnstile").length) {
    signals.push("widget:cf-turnstile");
    type = type ?? "turnstile";
  }
  if ($form.find(".wpcf7-recaptcha").length) {
    signals.push("widget:wpcf7-recaptcha");
    type = type ?? "wpcf7-recaptcha";
  }

  if (!type && pageCaptcha) {
    // No form-internal evidence, but the page loads a captcha script. We
    // assume any meaningful contact form on that page is gated by it.
    return { type: pageCaptcha.type, signals: ["page-script-only", ...pageCaptcha.signals] };
  }
  if (!type) return null;
  return { type, signals };
}

// Strip CDN transform suffixes so we end up with canonical full-size images.
// Wix serves a transform pipeline at /v1/<spec>/<derivedName>.<ext>; cutting
// it leaves the original media URL. Squarespace ?format=...&w=... is similar
// — drop the query string. Without this we keep tiny thumbnails AND inherit
// derived filenames like "Untitled.png" that fail our gallery filters.
function normalizeImageUrl(src: string): string {
  if (/(^|\/\/)static\.wixstatic\.com\/media\//i.test(src)) {
    const i = src.indexOf("/v1/");
    if (i > 0) return src.slice(0, i);
  }
  if (/(^|\/\/)images\.squarespace-cdn\.com\//i.test(src)) {
    const q = src.indexOf("?");
    if (q > 0) return src.slice(0, q);
  }
  return src;
}

// CMSes (WordPress most often) generate size variants of every uploaded
// image: `photo-300x200.jpg`, `photo-768x512.jpg`, `photo-1024x683.jpg`.
// They're the same picture at different resolutions. We treat them as one
// logical asset and keep the largest variant so the template gets the
// sharpest version.
function logicalImageKey(src: string): string {
  // Strip `-WxH` or `_WxH` immediately before the extension (e.g.,
  // `-300x200.webp`). Leaves the path otherwise intact so different photos
  // remain distinct.
  return src.replace(/[-_]\d{2,4}x\d{2,4}(?=\.[a-z0-9]{2,5}(?:$|\?))/i, "");
}

function imageSizeScore(src: string): number {
  // Larger pixel area = higher score. Falls back to URL length so URLs
  // with no size hint at all don't get displaced by tiny variants.
  const m = src.match(/[-_](\d{2,4})x(\d{2,4})(?=\.[a-z0-9]{2,5}(?:$|\?))/i);
  if (m) return Number(m[1]) * Number(m[2]);
  return Number.MAX_SAFE_INTEGER; // no size hint -> assume full-size original
}

function dedupeImagesBySize<T extends { src: string }>(items: T[]): T[] {
  const best = new Map<string, { item: T; score: number }>();
  for (const item of items) {
    const key = logicalImageKey(item.src);
    const score = imageSizeScore(item.src);
    const prev = best.get(key);
    if (!prev || score > prev.score) {
      best.set(key, { item, score });
    }
  }
  // Preserve original order based on FIRST appearance per logical key.
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = logicalImageKey(item.src);
    if (seen.has(key)) continue;
    seen.add(key);
    const winner = best.get(key);
    if (winner) out.push(winner.item);
  }
  return out;
}

// True if the value looks like a srcset (URL + descriptor like "120w" / "1.5x"
// + comma-separated candidates) and not a single URL that happens to contain
// commas. Wix CDN paths embed commas inside path segments
// (e.g. `/v1/fill/w_120,h_120,al_c,q_85/...`), so the old `.includes(",")` +
// `.split(",")` heuristic shredded them into bogus fragments.
function looksLikeSrcset(s: string): boolean {
  return /\s\d+(?:\.\d+)?[wx](?:\s*,|\s*$)/.test(s);
}

// Parse a real srcset string into URLs. We split on commas that immediately
// follow a width/density descriptor — never on commas inside URLs.
function parseSrcset(s: string): string[] {
  // Each candidate is `URL` then optional whitespace + descriptor (`120w` /
  // `1.5x`). Candidates are comma-separated. We anchor splits on the
  // descriptor boundary (lookbehind) so URL-internal commas survive.
  const parts = s.split(/(?<=\s\d+(?:\.\d+)?[wx])\s*,\s*/);
  const out: string[] = [];
  for (const p of parts) {
    const url = p.trim().split(/\s+/)[0];
    if (url) out.push(url);
  }
  return out;
}

function extractFonts(html: string): string[] {
  const set = new Set<string>();
  const re = /font-family\s*:\s*([^;"}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    m[1]
      .split(",")
      .map((s) => s.trim().replace(/["']/g, ""))
      .filter(Boolean)
      .forEach((f) => set.add(f));
  }
  return Array.from(set).slice(0, 8);
}
