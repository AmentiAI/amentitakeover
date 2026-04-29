/**
 * Marks `audited: false` rows under a source tag as `archived: true`.
 * Used after a deep-scrape pass where the remaining rows turned out to
 * be permanently unscrapeable (Cloudflare-blocked national chains, dead
 * domains, etc.) — archiving them removes them from the queue without
 * losing the import history.
 *
 *   tsx scripts/archive-failed.ts pestworld-pest-control
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const source = process.argv[2];
  if (!source) {
    console.error("Usage: tsx scripts/archive-failed.ts <source-tag>");
    process.exit(1);
  }
  const targets = await prisma.scrapedBusiness.findMany({
    where: { source, audited: false, archived: false },
    select: { id: true, name: true, website: true },
  });
  console.log(`Found ${targets.length} unaudited rows under ${source}`);
  if (targets.length === 0) {
    await prisma.$disconnect();
    return;
  }
  for (const t of targets.slice(0, 10)) {
    console.log(`  · ${t.name} → ${t.website ?? "(no site)"}`);
  }
  if (targets.length > 10) console.log(`  · …and ${targets.length - 10} more`);

  const res = await prisma.scrapedBusiness.updateMany({
    where: { source, audited: false, archived: false },
    data: { archived: true },
  });
  console.log(`\nArchived ${res.count} rows.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
