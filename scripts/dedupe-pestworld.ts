/**
 * One-shot cleanup — when the same business showed up across multiple
 * nearby ZIP codes during the pestworld scrape, the older import script
 * (pre-fix) wrote one row per occurrence instead of one row per
 * business. This script collapses duplicates by `sourceId` (already a
 * SHA1 of name+phone+state) keeping the earliest row.
 *
 *   tsx scripts/dedupe-pestworld.ts            # dry-run
 *   tsx scripts/dedupe-pestworld.ts --commit   # actually delete
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const commit = process.argv.includes("--commit");
  const sourceTag = "pestworld-pest-control";

  const rows = await prisma.scrapedBusiness.findMany({
    where: { source: sourceTag },
    select: { id: true, sourceId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  console.log(`Total rows for ${sourceTag}: ${rows.length}`);

  const groups = new Map<string, { keep: string; trash: string[] }>();
  for (const r of rows) {
    if (!r.sourceId) continue;
    const g = groups.get(r.sourceId);
    if (!g) groups.set(r.sourceId, { keep: r.id, trash: [] });
    else g.trash.push(r.id);
  }

  const toDelete: string[] = [];
  for (const g of groups.values()) toDelete.push(...g.trash);
  console.log(`Unique source IDs:     ${groups.size}`);
  console.log(`Duplicate rows to drop: ${toDelete.length}`);

  if (!commit) {
    console.log("\n[dry-run] pass --commit to actually delete.");
    await prisma.$disconnect();
    return;
  }

  // Chunk deletes to avoid massive parameter lists in a single query.
  const CHUNK = 200;
  let deleted = 0;
  for (let i = 0; i < toDelete.length; i += CHUNK) {
    const slice = toDelete.slice(i, i + CHUNK);
    const res = await prisma.scrapedBusiness.deleteMany({
      where: { id: { in: slice } },
    });
    deleted += res.count;
    console.log(`  deleted ${deleted}/${toDelete.length}`);
  }
  console.log(`\nDone. Deleted ${deleted} duplicate rows.`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
