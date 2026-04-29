/**
 * CLI wrapper around src/lib/lead-fetcher — pulls local business leads
 * (with websites) from OpenStreetMap's Overpass API and imports them into
 * ScrapedBusiness so the deep-scrape pipeline can pick them up.
 *
 * Usage:
 *   npm run leads:fetch -- --industry "Pest Control" --state NY --count 100
 *   npm run leads:fetch -- --industry Plumbing --state TX --city Austin --count 50
 *
 * Flags:
 *   --industry <name>        required — see KNOWN_INDUSTRIES; anything else
 *                            falls back to a name-only search
 *   --state <XX>             required — 2-letter state code
 *   --city <name>            optional — narrows to a specific city
 *   --count <n>              default 100; cap is hit by Overpass query budget
 *   --source-tag <slug>      override the auto-derived source tag (default
 *                            "osm-<industry-slug>")
 *   --out <path.jsonl>       write fetched records to a JSONL file too
 *   --dry-run                fetch + print preview, skip DB writes
 *   --json-only              skip DB import (useful with --out)
 *   --overpass-url <url>     override the Overpass endpoint
 *
 * After import, kick off the deep-scrape:
 *   npm run fsq:process -- --source <source-tag> --limit <count> --concurrency 5
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import {
  KNOWN_INDUSTRIES,
  deriveSourceTag,
  fetchOsmLeads,
  importLeads,
  partitionByExisting,
} from "../src/lib/lead-fetcher";

const prisma = new PrismaClient();

function parseArgs() {
  const out = {
    industry: "",
    state: "",
    city: "",
    count: 100,
    sourceTag: "",
    out: "",
    dryRun: false,
    jsonOnly: false,
    overpassUrl: undefined as string | undefined,
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--industry") out.industry = argv[++i];
    else if (a === "--state") out.state = argv[++i];
    else if (a === "--city") out.city = argv[++i];
    else if (a === "--count") out.count = Number(argv[++i]);
    else if (a === "--source-tag") out.sourceTag = argv[++i];
    else if (a === "--out") out.out = argv[++i];
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--json-only") out.jsonOnly = true;
    else if (a === "--overpass-url") out.overpassUrl = argv[++i];
  }
  if (!out.industry || !out.state) {
    console.error(
      "Usage: tsx scripts/fetch-leads.ts --industry <type> --state <XX> [--city <name>] [--count 100] [--source-tag osm-<slug>] [--out path.jsonl] [--json-only] [--dry-run]\n\nKnown industries: " +
        KNOWN_INDUSTRIES.join(", ") +
        "\n(Other industries fall back to a name-only search.)",
    );
    process.exit(1);
  }
  if (!out.sourceTag) out.sourceTag = deriveSourceTag(out.industry);
  return out;
}

async function main() {
  const opts = parseArgs();

  console.log(`Fetching ${opts.count} ${opts.industry} leads in ${opts.city ? `${opts.city}, ` : ""}${opts.state}…`);
  const { records: pool, rawCount, query } = await fetchOsmLeads({
    industry: opts.industry,
    state: opts.state,
    city: opts.city,
    count: opts.count,
    overpassUrl: opts.overpassUrl,
  });
  console.log(`\n=== Overpass query ===\n${query}`);
  console.log(`\nRaw OSM elements: ${rawCount}`);
  console.log(`Pool with website (pre-dedup): ${pool.length}`);

  // Skip rows we already imported under this source tag, then take only
  // the requested count of new ones.
  const { fresh, alreadyImported } = await partitionByExisting(pool, opts.sourceTag);
  const selected = fresh.slice(0, opts.count);
  console.log(`Already imported (skipped):    ${alreadyImported}`);
  console.log(`New to import this run:        ${selected.length}`);

  for (const r of selected.slice(0, 5)) {
    console.log(`  · ${r.name} (${r.locality ?? "?"}, ${r.region ?? "?"}) → ${r.website}`);
  }
  if (selected.length > 5) console.log(`  · …and ${selected.length - 5} more`);

  if (opts.out) {
    fs.writeFileSync(opts.out, selected.map((r) => JSON.stringify(r)).join("\n") + "\n");
    console.log(`\nWrote ${selected.length} records → ${opts.out}`);
  }

  if (opts.dryRun) {
    console.log("\n[dry-run] not importing.");
    await prisma.$disconnect();
    return;
  }
  if (opts.jsonOnly) {
    console.log("\n[json-only] skipping DB import.");
    await prisma.$disconnect();
    return;
  }

  if (selected.length === 0) {
    console.log(
      "\nNo new businesses available — every match in the OSM pool has already been imported. Try a different city, broaden the industry, or add new admin areas.",
    );
    await prisma.$disconnect();
    return;
  }

  const { created, updated } = await importLeads(selected, {
    industry: opts.industry,
    sourceTag: opts.sourceTag,
  });
  console.log(`\n=== imported ===`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  console.log(`Source tag: ${opts.sourceTag}`);
  console.log(`\nNext: run the scraper to enrich them →`);
  console.log(`  npm run fsq:process -- --source ${opts.sourceTag} --limit ${selected.length} --concurrency 5`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
