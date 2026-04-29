/**
 * Archives every visible row whose `website` is null. After enrichment
 * (OSM, PestWorld, Bing search) the remaining no-website rows aren't
 * reachable via our scrape pipeline — clearing them keeps the table
 * focused on actionable leads.
 *
 *   tsx scripts/archive-no-website.ts            # dry-run
 *   tsx scripts/archive-no-website.ts --commit
 *   tsx scripts/archive-no-website.ts --source pestworld-pest-control --commit
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const argv = process.argv.slice(2);
  const commit = argv.includes("--commit");
  const sIdx = argv.indexOf("--source");
  const sourceFilter = sIdx >= 0 ? argv[sIdx + 1] : undefined;

  const where = {
    archived: false,
    website: null,
    ...(sourceFilter ? { source: sourceFilter } : {}),
  };

  const rows = await prisma.scrapedBusiness.findMany({
    where,
    select: { id: true, name: true, source: true, city: true, state: true },
  });
  console.log(`No-website visible rows${sourceFilter ? ` for ${sourceFilter}` : ""}: ${rows.length}`);

  // Show top sources / states for visibility before archiving.
  const bySource = new Map<string, number>();
  for (const r of rows) bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1);
  console.log("By source:");
  for (const [s, n] of [...bySource.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${s.padEnd(35)}  ${n}`);
  }
  console.log("Sample:");
  for (const r of rows.slice(0, 5)) {
    console.log(`  · [${r.source}] ${r.name}  ${r.city ?? "?"}, ${r.state ?? "?"}`);
  }

  if (!commit) {
    console.log("\n[dry-run] pass --commit to archive");
    await prisma.$disconnect();
    return;
  }

  const res = await prisma.scrapedBusiness.updateMany({
    where,
    data: { archived: true },
  });
  console.log(`\nArchived ${res.count} no-website rows.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
