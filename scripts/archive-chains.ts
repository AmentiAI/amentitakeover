/**
 * Archives all rows whose website's apex domain shows up >= --threshold
 * times across the visible table. Default threshold is 5 — that catches
 * Orkin / Terminix / Arrow / Modern / Stark and anything similar that
 * sneaks in later. Rows you can't pitch a redesign to anyway because
 * the website is corporate-owned, not franchisee-owned.
 *
 *   tsx scripts/archive-chains.ts                  # dry-run
 *   tsx scripts/archive-chains.ts --commit
 *   tsx scripts/archive-chains.ts --threshold 10 --commit
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function apex(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

async function main() {
  const argv = process.argv.slice(2);
  const commit = argv.includes("--commit");
  const tIdx = argv.indexOf("--threshold");
  const threshold = tIdx >= 0 ? Number(argv[tIdx + 1]) : 5;

  const rows = await prisma.scrapedBusiness.findMany({
    where: { archived: false },
    select: { id: true, name: true, website: true, source: true, city: true, state: true },
  });

  const byDomain = new Map<string, typeof rows>();
  for (const r of rows) {
    const a = apex(r.website);
    if (!a) continue;
    if (!byDomain.has(a)) byDomain.set(a, []);
    byDomain.get(a)!.push(r);
  }

  const chains = [...byDomain.entries()]
    .filter(([, list]) => list.length >= threshold)
    .sort((a, b) => b[1].length - a[1].length);

  let total = 0;
  console.log(`Domains with >= ${threshold} rows:`);
  for (const [domain, list] of chains) {
    console.log(`  ${domain.padEnd(35)}  ${list.length} rows`);
    total += list.length;
  }
  console.log(`\nTotal rows to archive: ${total}`);

  if (!commit) {
    console.log("\n[dry-run] pass --commit to archive");
    await prisma.$disconnect();
    return;
  }

  const ids = chains.flatMap(([, list]) => list.map((r) => r.id));
  const CHUNK = 200;
  let archived = 0;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const res = await prisma.scrapedBusiness.updateMany({
      where: { id: { in: slice } },
      data: { archived: true },
    });
    archived += res.count;
  }
  console.log(`\nDone. Archived ${archived} chain rows.`);
  await prisma.$disconnect();
}
main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
