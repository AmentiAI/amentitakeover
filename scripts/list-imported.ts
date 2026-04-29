import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const source = process.argv[2] ?? "osm-pest";
  const rows = await prisma.scrapedBusiness.findMany({
    where: { source },
    select: { name: true, website: true, city: true, state: true, audited: true, hasWebsite: true },
    orderBy: { createdAt: "desc" },
  });
  console.log(`source=${source} count=${rows.length}`);
  for (const r of rows) {
    console.log(`  ${r.audited ? "✓" : "·"} ${r.name.padEnd(45).slice(0, 45)} ${r.city ?? "?"}, ${r.state ?? "?"} → ${r.website}`);
  }
  await prisma.$disconnect();
}
main();
