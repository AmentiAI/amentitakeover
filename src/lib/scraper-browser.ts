/**
 * Headless-browser fallback for sites that block plain fetch (Cloudflare's
 * "Just a moment..." JS challenge, Akamai bot manager, etc.). We dynamic-
 * import Playwright so the heavy Chromium binary only loads on the rare
 * call paths that need it — most scrapes still take the cheap fetch route
 * and never touch this module.
 *
 * Trade-off vs. fetch: ~1–3s slower (Chromium launch + JS execution +
 * waiting for the challenge to complete), uses ~150MB of RAM while the
 * browser is open, and adds Chromium binaries to the install. In return:
 * actually gets past Cloudflare challenge level 1.
 */

import type { Browser } from "playwright";

export type BrowserFetchResult = {
  rawHtml: string;
  finalUrl: string;
  statusUsed: number;
};

const NAVIGATION_TIMEOUT_MS = 45_000;
const CHALLENGE_TIMEOUT_MS = 20_000;
const CHALLENGE_POLL_MS = 500;

// We hold one browser instance per Node process and reuse it across calls.
// Each scrape opens a fresh context (cookies/storage isolated) but reuses
// the long-lived browser, which saves ~1.5s per page after the first.
let browserPromise: Promise<Browser> | null = null;

export async function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = (async () => {
      const { chromium } = await import("playwright");
      return await chromium.launch({
        headless: true,
        // Args that help us blend in with a real Chrome and avoid bot
        // automation fingerprints. Not bulletproof — sites doing aggressive
        // canvas/WebGL fingerprinting can still flag us — but covers the
        // common "navigator.webdriver === true" auto-flag.
        args: [
          "--disable-blink-features=AutomationControlled",
          "--disable-features=IsolateOrigins,site-per-process",
          "--no-sandbox",
        ],
      });
    })();
  }
  return browserPromise;
}

export async function fetchPageWithBrowser(url: string): Promise<BrowserFetchResult> {
  const browser = await getBrowser();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    viewport: { width: 1366, height: 800 },
    locale: "en-US",
    timezoneId: "America/New_York",
    extraHTTPHeaders: {
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  const page = await context.newPage();
  try {
    const response = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: NAVIGATION_TIMEOUT_MS,
    });
    const statusUsed = response?.status() ?? 0;

    // Wait for Cloudflare's challenge to complete. The challenge page
    // titles the tab "Just a moment..." until the JS solver hands off to
    // the real content; we poll until that title clears or we time out.
    const challengeStart = Date.now();
    while (Date.now() - challengeStart < CHALLENGE_TIMEOUT_MS) {
      const title = await page.title().catch(() => "");
      if (!/Just a moment|attention required/i.test(title)) break;
      await page.waitForTimeout(CHALLENGE_POLL_MS);
    }

    const rawHtml = await page.content();
    const finalUrl = page.url();
    return { rawHtml, finalUrl, statusUsed };
  } finally {
    await context.close().catch(() => {});
  }
}

export async function closeBrowser(): Promise<void> {
  if (browserPromise) {
    const b = await browserPromise.catch(() => null);
    browserPromise = null;
    if (b) await b.close().catch(() => {});
  }
}
