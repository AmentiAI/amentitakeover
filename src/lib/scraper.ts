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

// Common banner/promo/advert filename patterns.
const AD_BANNER_RE =
  /(\b|[-_/])(ad|ads|banner|promo|sale|coupon|discount|offer|deal|placeholder|stock|default|mock)([-_0-9]|\.[a-z]{3,4}(?:$|\?))/i;

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

export async function scrapeSite(inputUrl: string): Promise<ScrapeResult> {
  const url = normalizeUrl(inputUrl);
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; SignullBot/1.0; +https://signulldev.com/bot)",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
  const rawHtml = await res.text();
  const $ = cheerio.load(rawHtml);

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
  const favicon = faviconRaw ? absolutize(faviconRaw, url) : null;

  const ogImageRaw =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[name="og:image"]').attr("content") ||
    $('meta[property="og:image:secure_url"]').attr("content") ||
    $('meta[name="twitter:image"]').attr("content") ||
    null;
  const ogImage = ogImageRaw ? absolutize(ogImageRaw, url) : null;

  const logoUrl = detectLogo($, url) ?? favicon;

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
    if (!abs || imageSet.has(abs)) return;
    if (isSocialAsset(abs, alt)) return;
    if (isIrrelevantAsset(abs, alt)) return;
    imageSet.add(abs);
    images.push({ src: abs, alt, kind: "image" });
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
      // srcset can be a comma-separated list of "url 2x" entries — pull urls
      if (c.includes(",") && /\s\d+[wx]/.test(c)) {
        c.split(",")
          .map((s) => s.trim().split(/\s+/)[0])
          .filter(Boolean)
          .forEach((s) => pushImg(s, alt));
      } else {
        pushImg(c, alt);
      }
    }
  });

  // <picture><source srcset="..."> — pull first candidate
  $("picture source").each((_i, el) => {
    const srcset = $(el).attr("srcset");
    if (!srcset) return;
    const first = srcset.split(",")[0].trim().split(/\s+/)[0];
    pushImg(first, null);
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

  $("script, style, noscript, svg").remove();
  const textContent = $("body").text().replace(/\s+/g, " ").trim().slice(0, 20000);

  const palette = extractPalette(rawHtml);
  const fonts = extractFonts(rawHtml);

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
    images: images.slice(0, 120),
    links: links.slice(0, 120),
    palette,
    fonts,
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

function extractPalette(html: string): string[] {
  const hexes = new Set<string>();
  const hexRe = /#([0-9a-f]{6}|[0-9a-f]{3})\b/gi;
  let m: RegExpExecArray | null;
  while ((m = hexRe.exec(html))) hexes.add(`#${m[1].toLowerCase()}`);
  return Array.from(hexes).slice(0, 12);
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
