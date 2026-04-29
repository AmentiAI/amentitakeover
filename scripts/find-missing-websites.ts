/**
 * Walks ScrapedBusiness rows that have a name + city/state but no
 * `website`, queries Bing via Playwright for `"Name" City State`, and
 * fills in the most likely homepage URL (skipping Yelp, BBB, Yellow
 * Pages, social, search engines, and other directory hosts).
 *
 *   npm run leads:findsite -- --source pestworld-pest-control --limit 50
 *   npm run leads:findsite -- --source pestworld-pest-control --limit 999 --concurrency 2
 *
 * Once a website is filled in, the row will be picked up by the regular
 * deep-scrape pipeline (`npm run fsq:process`) on the next pass.
 *
 * Polite — each search runs in a fresh Playwright context with a 1s
 * delay between starts. Bing throttles aggressive querying; concurrency
 * 2 with a small delay is the sweet spot.
 */
import { PrismaClient } from "@prisma/client";
import { findBusinessWebsite } from "../src/lib/website-finder";
import { closeBrowser } from "../src/lib/scraper-browser";

const prisma = new PrismaClient();

function parseArgs() {
  const out = {
    source: undefined as string | undefined,
    state: undefined as string | undefined,
    limit: 50,
    concurrency: 2,
    delayMs: 1000,
    dryRun: false,
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--source") out.source = argv[++i];
    else if (a === "--state") out.state = argv[++i];
    else if (a === "--limit") out.limit = Number(argv[++i]);
    else if (a === "--concurrency") out.concurrency = Number(argv[++i]);
    else if (a === "--delay-ms") out.delayMs = Number(argv[++i]);
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

async function main() {
  const opts = parseArgs();

  const targets = await prisma.scrapedBusiness.findMany({
    where: {
      website: null,
      archived: false,
      ...(opts.source ? { source: opts.source } : {}),
      ...(opts.state ? { state: opts.state } : {}),
    },
    take: opts.limit,
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, city: true, state: true, phone: true },
  });

  if (targets.length === 0) {
    console.log("Nothing to look up — every matching row already has a website.");
    await prisma.$disconnect();
    return;
  }
  console.log(
    `Looking up websites for ${targets.length} businesses (concurrency=${opts.concurrency}, ${opts.delayMs}ms delay)`,
  );

  let done = 0;
  let found = 0;
  let missed = 0;
  let errored = 0;
  let cursor = 0;

  const worker = async (workerId: number) => {
    while (true) {
      const i = cursor++;
      if (i >= targets.length) return;
      const biz = targets[i];
      try {
        const t0 = Date.now();
        const result = await findBusinessWebsite({
          name: biz.name,
          city: biz.city,
          state: biz.state,
          phone: biz.phone,
        });
        const ms = Date.now() - t0;
        if (result.website) {
          if (!opts.dryRun) {
            await prisma.scrapedBusiness.update({
              where: { id: biz.id },
              data: {
                website: result.website,
                hasWebsite: true,
              },
            });
          }
          found++;
          console.log(
            `[w${workerId}] ✓ ${biz.name.padEnd(38).slice(0, 38)} ${ms}ms → ${result.website}`,
          );
        } else {
          missed++;
          console.log(
            `[w${workerId}] · ${biz.name.padEnd(38).slice(0, 38)} ${ms}ms — no usable result (${result.candidates.length} candidates: ${result.candidates.slice(0, 2).join(", ")})`,
          );
        }
      } catch (err) {
        errored++;
        const msg = err instanceof Error ? err.message : String(err);
        console.log(`[w${workerId}] ✗ ${biz.name}: ${msg.slice(0, 100)}`);
      }
      done++;
      // Polite pause so we don't hammer Bing.
      if (opts.delayMs > 0) await new Promise((r) => setTimeout(r, opts.delayMs));
    }
  };

  await Promise.all(
    Array.from({ length: Math.max(1, opts.concurrency) }, (_, i) => worker(i + 1)),
  );

  console.log(`\n=== done ===`);
  console.log(`Processed: ${done}`);
  console.log(`Found:     ${found}`);
  console.log(`No match:  ${missed}`);
  console.log(`Errors:    ${errored}`);
  if (opts.dryRun) console.log(`(dry-run — no DB writes)`);

  await closeBrowser();
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await closeBrowser().catch(() => {});
  await prisma.$disconnect();
  process.exit(1);
});
