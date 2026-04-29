/**
 * Walks the Foursquare-imported backlog and runs deepScrapeSite on each
 * row. Same enrichment path the in-app /api/enrich uses — populates Site
 * (rawHtml, palette, headings, images, contactForm) and updates the
 * ScrapedBusiness with the email/phone/socials we discovered.
 *
 * Idempotent and resumable: only touches rows where `audited: false`, so
 * re-running just picks up where the last run left off. Per-business
 * failures are logged but don't abort the run.
 *
 *   DATABASE_URL=... tsx scripts/process-foursquare-backlog.ts \
 *     --limit 50 \
 *     --concurrency 4
 *
 * Recommended cadence: cron / scheduled task every few hours; each run
 * processes a slice and stops, so a 10k import gets worked through over
 * days without overloading anything.
 */
import { PrismaClient } from "@prisma/client";
import { deepScrapeSite } from "../src/lib/deep-scraper";
import {
  extractCityState,
  hasDomainChanged,
  mergePhones,
} from "../src/lib/business-merge";

const prisma = new PrismaClient();

function parseArgs() {
  const out = {
    limit: 25,
    concurrency: 4,
    source: "foursquare",
    industry: undefined as string | undefined,
    state: undefined as string | undefined,
    // Hard wall-clock budget per business — covers the entire deep-scrape
    // (homepage + all subpages + Playwright fallback). Without this a
    // single Cloudflare-protected site with 18 subpages can lock a worker
    // for 10+ minutes. 0 disables the timeout.
    perBusinessTimeoutSec: 0,
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--limit") out.limit = Number(argv[++i]);
    else if (a === "--concurrency") out.concurrency = Number(argv[++i]);
    else if (a === "--source") out.source = argv[++i];
    else if (a === "--industry") out.industry = argv[++i];
    else if (a === "--state") out.state = argv[++i];
    else if (a === "--per-business-timeout") out.perBusinessTimeoutSec = Number(argv[++i]);
  }
  return out;
}

// Wraps a long-running scrape in a wall-clock deadline. If the budget
// expires we throw a typed error so the caller can mark the row as
// failed-but-attempted (audited=false) rather than success.
class PerBusinessTimeoutError extends Error {
  constructor(public seconds: number) {
    super(`scrape exceeded ${seconds}s budget`);
    this.name = "PerBusinessTimeoutError";
  }
}

function withTimeout<T>(p: Promise<T>, seconds: number): Promise<T> {
  if (seconds <= 0) return p;
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new PerBusinessTimeoutError(seconds)), seconds * 1000),
    ),
  ]);
}

async function main() {
  const opts = parseArgs();

  const targets = await prisma.scrapedBusiness.findMany({
    where: {
      source: opts.source,
      audited: false,
      archived: false,
      website: { not: null },
      ...(opts.industry ? { industry: opts.industry } : {}),
      ...(opts.state ? { state: opts.state } : {}),
    },
    take: opts.limit,
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      website: true,
      email: true,
      phone: true,
      phones: true,
      city: true,
      state: true,
    },
  });

  if (targets.length === 0) {
    console.log("Nothing to process — backlog is empty for these filters.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Processing ${targets.length} businesses (concurrency=${opts.concurrency})`);
  const startedAt = Date.now();
  let done = 0;
  let failed = 0;

  let cursor = 0;
  const worker = async (workerId: number) => {
    while (true) {
      const i = cursor++;
      if (i >= targets.length) return;
      const biz = targets[i];
      const t0 = Date.now();
      try {
        const result = await withTimeout(
          deepScrapeSite(biz.website!),
          opts.perBusinessTimeoutSec,
        );
        // Logo only — templates render via canvas + SVG.
        const mergedImages: { src: string; alt: string }[] = result.logo
          ? [{ src: result.logo, alt: "logo" }]
          : [];
        const joinedText = result.pages
          .map((p) => `# ${p.kind.toUpperCase()}\n${p.text}`)
          .join("\n\n");

        const site = await prisma.site.create({
          data: {
            url: result.url,
            title: result.title,
            description: result.description,
            favicon: result.logo ?? result.favicon,
            rawHtml: result.rawHtml,
            textContent: joinedText,
            palette: result.palette,
            fonts: result.fonts,
            headings: result.headings,
            images: mergedImages,
            links: result.links,
            contactForm: result.contactForm ?? undefined,
            contentScore: result.contentScore,
            signals: result.signals,
            status: "scraped",
          },
        });

        const cityState = (!biz.city || !biz.state)
          ? extractCityState(joinedText)
          : { city: null, state: null };
        const newWebsite =
          biz.website && hasDomainChanged(biz.website, result.url)
            ? result.url
            : undefined;
        const mergedPhones = mergePhones(
          biz.phones,
          biz.phone ?? null,
          result.phones,
          "website-scrape",
        );

        await prisma.scrapedBusiness.update({
          where: { id: biz.id },
          data: {
            siteId: site.id,
            audited: true,
            email: biz.email ?? result.emails[0] ?? null,
            phone: biz.phone ?? result.phones[0] ?? null,
            phones: mergedPhones,
            ...(cityState.city && !biz.city ? { city: cityState.city } : {}),
            ...(cityState.state && !biz.state ? { state: cityState.state } : {}),
            ...(newWebsite ? { website: newWebsite } : {}),
            instagram: undefined,
            facebook: undefined,
            twitter: undefined,
            linkedin: result.socials.linkedin ?? undefined,
            tiktok: result.socials.tiktok ?? undefined,
            emailReady: Boolean(biz.email || result.emails[0]),
            hasWebsite: true,
          },
        });

        done++;
        const ms = Date.now() - t0;
        console.log(
          `[w${workerId}] ✓ ${biz.name.padEnd(40).slice(0, 40)} ${ms}ms ` +
            `email=${result.emails.length} form=${result.contactForm ? "yes" : "no"}` +
            `${result.contactForm?.captcha ? `(${result.contactForm.captcha.type})` : ""}`,
        );
      } catch (err) {
        failed++;
        const ms = Date.now() - t0;
        const msg = err instanceof Error ? err.message : String(err);
        const tag = err instanceof PerBusinessTimeoutError ? "TIMEOUT" : "ERR";
        console.log(`[w${workerId}] ✗ ${tag} ${biz.name.padEnd(40).slice(0, 40)} ${ms}ms — ${msg.slice(0, 100)}`);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.max(1, opts.concurrency) }, (_, i) => worker(i + 1)),
  );

  const total = Date.now() - startedAt;
  console.log(`\n=== done ===`);
  console.log(`Processed: ${done}`);
  console.log(`Failed:    ${failed}`);
  console.log(`Wall time: ${(total / 1000).toFixed(1)}s`);
  console.log(`Avg / biz: ${(total / Math.max(1, done + failed)).toFixed(0)}ms`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
