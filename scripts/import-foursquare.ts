/**
 * Import a filtered slice of the Foursquare Open Source Places dataset
 * into ScrapedBusiness rows. The dataset itself is hosted on AWS Open
 * Data as Parquet — convert your filtered subset to JSON Lines before
 * feeding it to this script.
 *
 *   # Example: pull every plumber in TX out of the FSQ parquet and write
 *   # to JSONL (requires DuckDB CLI — `brew install duckdb`):
 *   duckdb -c "
 *     COPY (
 *       SELECT *
 *       FROM read_parquet('places-*.parquet')
 *       WHERE region = 'TX'
 *         AND list_contains(transform(categories, c -> lower(c)), 'plumber')
 *     ) TO 'plumbers-tx.jsonl' (FORMAT JSON, ARRAY FALSE);
 *   "
 *
 *   # Then import:
 *   DATABASE_URL=... tsx scripts/import-foursquare.ts \
 *     --file plumbers-tx.jsonl \
 *     --industry Plumbing
 *
 * Each row is upserted by (source, sourceId) so re-running with the same
 * file is idempotent. Existing GMB-sourced rows aren't touched — this
 * script only writes rows tagged `source: "foursquare"` (overridable).
 */
import { PrismaClient } from "@prisma/client";
import * as fs from "node:fs";
import * as readline from "node:readline";
import { findApexOwner } from "../src/lib/website-dedup";

const prisma = new PrismaClient();

type FsqRecord = {
  fsq_id?: string;
  fsq_place_id?: string;
  name?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
  locality?: string | null;
  region?: string | null;
  postcode?: string | null;
  country?: string | null;
  email?: string | null;
  tel?: string | null;
  website?: string | null;
  // Categories arrive as either string[] of names or an array of objects.
  categories?: unknown;
  social_media?: {
    twitter?: string | null;
    facebook_id?: string | null;
    instagram?: string | null;
  } | null;
};

function parseArgs() {
  const out: { file?: string; industry?: string; sourceTag: string; batchSize: number; dryRun: boolean } = {
    sourceTag: "foursquare",
    batchSize: 250,
    dryRun: false,
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--file") out.file = argv[++i];
    else if (a === "--industry") out.industry = argv[++i];
    else if (a === "--source-tag") out.sourceTag = argv[++i];
    else if (a === "--batch-size") out.batchSize = Number(argv[++i]);
    else if (a === "--dry-run") out.dryRun = true;
  }
  if (!out.file) {
    console.error(
      "Usage: tsx scripts/import-foursquare.ts --file <path.jsonl> [--industry <name>] [--source-tag foursquare] [--batch-size 250] [--dry-run]",
    );
    process.exit(1);
  }
  return out;
}

function pickCategoryName(raw: unknown): string | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const first = raw[0];
  if (typeof first === "string") return first;
  if (first && typeof first === "object") {
    const obj = first as { name?: unknown; category_name?: unknown };
    if (typeof obj.name === "string") return obj.name;
    if (typeof obj.category_name === "string") return obj.category_name;
  }
  return null;
}

function toRow(rec: FsqRecord, industry: string | undefined, sourceTag: string) {
  const sourceId = rec.fsq_id ?? rec.fsq_place_id ?? null;
  if (!sourceId || !rec.name) return null;
  const category = pickCategoryName(rec.categories);
  const social = rec.social_media ?? {};
  return {
    source: sourceTag,
    sourceId,
    name: rec.name,
    website: rec.website ?? null,
    phone: rec.tel ?? null,
    email: rec.email ?? null,
    address: rec.address ?? null,
    city: rec.locality ?? null,
    state: rec.region ?? null,
    postalCode: rec.postcode ?? null,
    country: rec.country ?? "USA",
    lat: typeof rec.latitude === "number" ? rec.latitude : null,
    lng: typeof rec.longitude === "number" ? rec.longitude : null,
    rating: null,
    reviewsCount: 0,
    category,
    industry: industry ?? null,
    instagram: social.instagram ?? null,
    facebook: social.facebook_id ? `https://facebook.com/${social.facebook_id}` : null,
    twitter: social.twitter ? `https://twitter.com/${social.twitter}` : null,
    hasWebsite: Boolean(rec.website),
    emailReady: Boolean(rec.email),
  };
}

async function main() {
  const opts = parseArgs();
  if (!fs.existsSync(opts.file!)) {
    console.error(`File not found: ${opts.file}`);
    process.exit(1);
  }

  let read = 0;
  let parsed = 0;
  let queued = 0;
  let inserted = 0;
  let updated = 0;
  let skipped = 0;

  type Row = NonNullable<ReturnType<typeof toRow>>;
  let batch: Row[] = [];

  async function flush() {
    if (!batch.length) return;
    if (opts.dryRun) {
      console.log(`[dry-run] would upsert ${batch.length} rows`);
      batch = [];
      return;
    }
    // Pull every existing (source, sourceId) for this batch in one query
    // so we can split into create vs update — far faster than N individual
    // upserts when the JSONL is large.
    const existing = await prisma.scrapedBusiness.findMany({
      where: {
        source: opts.sourceTag,
        sourceId: { in: batch.map((r) => r.sourceId) },
      },
      select: { id: true, sourceId: true },
    });
    const existingIds = new Map(existing.map((e) => [e.sourceId!, e.id]));

    const candidatesToCreate = batch.filter((r) => !existingIds.has(r.sourceId));
    const toUpdate = batch.filter((r) => existingIds.has(r.sourceId));

    // Apex-domain dedup: drop any candidate whose website apex already lives
    // on a visible row (any source). Foursquare frequently lists the same
    // chain under multiple FSQ ids, so without this check we'd duplicate
    // every chain across cities. Rows without a website are kept as-is —
    // they get deduped later via name/phone heuristics.
    const toCreate: typeof candidatesToCreate = [];
    let domainDupesInBatch = 0;
    for (const r of candidatesToCreate) {
      if (r.website) {
        const owner = await findApexOwner(prisma, r.website);
        if (owner) {
          domainDupesInBatch++;
          continue;
        }
      }
      toCreate.push(r);
    }
    skipped += domainDupesInBatch;

    if (toCreate.length) {
      const res = await prisma.scrapedBusiness.createMany({
        data: toCreate,
        skipDuplicates: true,
      });
      inserted += res.count;
    }
    for (const r of toUpdate) {
      const id = existingIds.get(r.sourceId)!;
      await prisma.scrapedBusiness.update({
        where: { id },
        data: {
          // Refresh the data we have, but never clobber existing email /
          // phone / socials with null — Foursquare data sometimes lags
          // what was already enriched via GMB or deep-scrape.
          name: r.name,
          website: r.website ?? undefined,
          phone: r.phone ?? undefined,
          email: r.email ?? undefined,
          address: r.address ?? undefined,
          city: r.city ?? undefined,
          state: r.state ?? undefined,
          postalCode: r.postalCode ?? undefined,
          country: r.country ?? undefined,
          lat: r.lat ?? undefined,
          lng: r.lng ?? undefined,
          category: r.category ?? undefined,
          industry: r.industry ?? undefined,
          instagram: r.instagram ?? undefined,
          facebook: r.facebook ?? undefined,
          twitter: r.twitter ?? undefined,
          hasWebsite: r.hasWebsite,
          emailReady: r.emailReady || undefined,
        },
      });
      updated++;
    }
    batch = [];
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(opts.file!),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    read++;
    const trimmed = line.trim();
    if (!trimmed) continue;
    let rec: FsqRecord;
    try {
      rec = JSON.parse(trimmed);
    } catch {
      skipped++;
      continue;
    }
    parsed++;
    const row = toRow(rec, opts.industry, opts.sourceTag);
    if (!row) {
      skipped++;
      continue;
    }
    batch.push(row);
    queued++;
    if (batch.length >= opts.batchSize) {
      await flush();
      console.log(
        `[import-foursquare] read=${read} parsed=${parsed} created=${inserted} updated=${updated} skipped=${skipped}`,
      );
    }
  }
  await flush();

  console.log("\n=== done ===");
  console.log(`Lines read:     ${read}`);
  console.log(`JSON parsed:    ${parsed}`);
  console.log(`Created rows:   ${inserted}`);
  console.log(`Updated rows:   ${updated}`);
  console.log(`Skipped:        ${skipped}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
