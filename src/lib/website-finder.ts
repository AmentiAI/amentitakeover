// Best-effort lookup that takes a business name + location and returns
// the most likely homepage URL, or null. Uses our existing Playwright
// browser singleton to drive Bing search — Bing renders results client-
// side now so plain fetch returns an empty SPA shell. Filters directory
// / aggregator sites (Yelp, BBB, Yellow Pages, etc.) so we get the
// business's own domain rather than its third-party listing.

import type { Page } from "playwright";

// Hosts that aren't the business's own site — listing aggregators,
// social, search engines. The first organic result whose hostname
// isn't in this list (or a subdomain) is what we want.
const DIRECTORY_HOSTS = [
  "yelp.com",
  "bbb.org",
  "manta.com",
  "mapquest.com",
  "yellowpages.com",
  "yp.com",
  "superpages.com",
  "citysearch.com",
  "foursquare.com",
  "tripadvisor.com",
  "angi.com",
  "angieslist.com",
  "homeadvisor.com",
  "thumbtack.com",
  "porch.com",
  "houzz.com",
  "buildzoom.com",
  "alignable.com",
  "nextdoor.com",
  "facebook.com",
  "linkedin.com",
  "instagram.com",
  "twitter.com",
  "x.com",
  "pinterest.com",
  "youtube.com",
  "tiktok.com",
  "google.com",
  "goo.gl",
  "maps.google.com",
  "bing.com",
  "duckduckgo.com",
  "yandex.com",
  "yandex.ru",
  "amazon.com",
  "ebay.com",
  "etsy.com",
  "ebizautos.com",
  "chamberofcommerce.com",
  "dnb.com",
  "owler.com",
  "zoominfo.com",
  "glassdoor.com",
  "indeed.com",
  "linkedin.com",
  "trustpilot.com",
  "consumeraffairs.com",
  "wikipedia.org",
  "pestworld.org",
  "npmapestworld.org",
  "ezgenerator.com",
  "godaddysites.com",
  "weeblysite.com",
  "wixsite.com",
  "wordpress.com",
  "blogspot.com",
  "tumblr.com",
];

function isDirectoryHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
    return DIRECTORY_HOSTS.some((d) => host === d || host.endsWith("." + d));
  } catch {
    return true;
  }
}

function buildQuery(opts: {
  name: string;
  city?: string | null;
  state?: string | null;
}): string {
  const parts: string[] = [`"${opts.name.trim()}"`];
  if (opts.city) parts.push(opts.city.trim());
  if (opts.state) parts.push(opts.state.trim());
  return parts.join(" ");
}

export async function findBusinessWebsite(opts: {
  name: string;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  topN?: number;
}): Promise<{ website: string | null; query: string; candidates: string[] }> {
  const query = buildQuery(opts);
  const topN = opts.topN ?? 5;

  // Reuse the long-lived Playwright browser the scraper already uses.
  // We open a fresh context per query (cookies/storage isolated) but
  // amortize the ~1.5s Chromium launch cost across the whole batch.
  const { getBrowser } = await import("./scraper-browser");
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await context.newPage();
  let candidates: string[] = [];
  try {
    await page.goto(
      `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      { waitUntil: "domcontentloaded", timeout: 30_000 },
    );
    candidates = await extractBingResultUrls(page, topN);
  } finally {
    await context.close().catch(() => {});
  }

  // Score each candidate by how well it matches the business name and
  // whether it points at the homepage. Penalise career / job / blog
  // subdomains so we don't grab `careers.rentokil-terminix.com` as the
  // "homepage" for Rentokil. Reject any candidate that scores ≤ 0 — those
  // are probably tangentially-related results Bing returned (e.g. "Top
  // Gun Pest Control" matching the unrelated `tophat.com`).
  const scored = candidates
    .filter((u) => !isDirectoryHost(u))
    .map((u) => ({ url: u, score: scoreCandidate(u, opts.name) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score);

  const winner = scored[0]?.url ?? null;
  return { website: winner, query, candidates };
}

// Token-overlap heuristic. Tokenises the business name (filtering
// stopwords + boilerplate suffixes), counts how many distinct tokens
// appear in the candidate hostname/path, and rejects (returns 0) when
// fewer than 2 unique tokens match — except for the apex-domain-startsWith
// case which covers single-word brand names like "Orkin".
function scoreCandidate(rawUrl: string, name: string): number {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return 0;
  }
  const host = url.hostname.replace(/^www\./, "").toLowerCase();
  const path = url.pathname.toLowerCase();
  const haystack = host.replace(/[^a-z0-9]/g, "") + " " + path.replace(/[^a-z0-9]/g, "");

  // Tokens length ≥ 3, drop stopwords + business-suffix boilerplate but
  // KEEP "pest" / "control" / "exterminator" — those are signal-bearing
  // for our actual business cohort and prevent false matches against
  // unrelated brands that happen to share a generic word.
  const STOPWORDS = new Set([
    "the", "and", "for", "llc", "inc", "incorporated", "corp", "corporation",
    "company", "ltd", "llp", "pllc", "group", "services", "service",
    "solutions", "solution", "enterprise", "enterprises", "holdings",
    "partners", "partnership", "of",
  ]);
  const tokens = Array.from(
    new Set(
      name
        .toLowerCase()
        .replace(/[^a-z0-9 ]+/g, " ")
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !STOPWORDS.has(t)),
    ),
  );

  if (tokens.length === 0) return 0;

  // Hard-reject subdomains that are obviously not the homepage (job
  // boards, status pages, etc.). Even if they otherwise match by name
  // they aren't what we want as the canonical website.
  if (/(?:^|\.)(careers?|jobs?|recruit|recruiting|blog|press|investors?|support|status|store|shop|cdn|api|static|assets)\./i.test(host)) {
    return 0;
  }

  // Count distinct tokens present in the hostname/path haystack.
  const hostNoPunc = host.replace(/[^a-z0-9]/g, "");
  const matchedInHost = tokens.filter((t) => hostNoPunc.includes(t));
  const matchedAnywhere = tokens.filter((t) => haystack.includes(t));

  // Apex-domain coverage check — the part of the hostname before the
  // TLD with all dots/dashes stripped. We use this to tell "morton" →
  // `mortons.com` (apex = "mortons", 86% covered by token) apart from
  // "inspire" → `inspiresleep.com` (apex = "inspiresleep", only 58%
  // covered, the rest is unrelated generic word "sleep").
  const apex = host.split(".").slice(0, -1).join("").replace(/[^a-z0-9]/g, "");
  // A token "covers" the apex when the apex starts with it AND there are
  // at most 3 characters of slop after — so "morton" + "s" works,
  // "inspire" + "sleep" doesn't.
  const apexCovered = tokens.some(
    (t) => t.length >= 4 && apex.startsWith(t) && apex.length - t.length <= 3,
  );

  // Single-token brand escape — names like "Orkin" or "Terminix".
  if (tokens.length === 1) {
    if (!apexCovered) return 0;
  } else if (matchedAnywhere.length < 2 && !apexCovered) {
    // Multi-token names need ≥ 2 distinct tokens matching across host +
    // path, OR a single token that essentially IS the apex domain.
    return 0;
  } else if (matchedInHost.length < 1 && !apexCovered) {
    // Path-only matches are too weak — generic blog posts about pest
    // control would otherwise score positive.
    return 0;
  }

  let score = matchedInHost.length * 5 + matchedAnywhere.length * 1;

  // Homepage path > deep paths.
  if (path === "/" || path === "" || path === "/index.html") score += 3;
  if (/\/(careers?|jobs?|recruit|press|blog|news|support|store|shop|locations?)\b/i.test(path)) score -= 2;

  return score;
}

async function extractBingResultUrls(page: Page, topN: number): Promise<string[]> {
  // Wait briefly for the result list to render — Bing pops `.b_algo` in
  // after the SPA hydrates.
  try {
    await page.waitForSelector("li.b_algo", { timeout: 8_000 });
  } catch {
    // No results panel — leave empty.
    return [];
  }
  const urls = await page.$$eval(
    "li.b_algo h2 a, li.b_algo a.tilk",
    (anchors) =>
      anchors
        .map((a) => (a as HTMLAnchorElement).href)
        .filter((href) => href && /^https?:/.test(href)),
  );
  // Dedupe by hostname so multiple deep links to the same site collapse
  // to one candidate.
  const out: string[] = [];
  const hosts = new Set<string>();
  for (const raw of urls) {
    const u = unwrapBingRedirect(raw);
    try {
      const h = new URL(u).hostname.replace(/^www\./, "").toLowerCase();
      if (hosts.has(h)) continue;
      hosts.add(h);
      out.push(u);
      if (out.length >= topN) break;
    } catch {
      // bad URL, skip
    }
  }
  return out;
}

// Bing wraps every result link in a tracking redirect of the form
//   https://www.bing.com/ck/a?...&u=a1<base64-url>&...
// The `u` param holds the real URL: strip the `a1` prefix and base64-
// decode. Falls through to the original URL if the format isn't what we
// expect (Bing changes this layout occasionally).
function unwrapBingRedirect(href: string): string {
  try {
    const u = new URL(href);
    if (!/(^|\.)bing\.com$/.test(u.hostname)) return href;
    if (!u.pathname.startsWith("/ck/")) return href;
    const wrapped = u.searchParams.get("u");
    if (!wrapped) return href;
    // Bing prefixes the base64 with `a1` (or similar). Strip it.
    const b64 = wrapped.replace(/^a1/, "");
    // Restore url-safe alphabet + padding.
    const normal = b64.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normal + "=".repeat((4 - (normal.length % 4)) % 4);
    const decoded = Buffer.from(padded, "base64").toString("utf-8").trim();
    if (/^https?:\/\//i.test(decoded)) return decoded;
    return href;
  } catch {
    return href;
  }
}
