/**
 * One-shot correction — un-archives all pestworld-pest-control rows that
 * lack a website, then re-archives only the ones that actually had a
 * website and failed during the deep-scrape pass.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  // 1. Restore all without-website rows we accidentally archived.
  const restored = await prisma.scrapedBusiness.updateMany({
    where: {
      source: "pestworld-pest-control",
      archived: true,
      audited: false,
      website: null,
    },
    data: { archived: false },
  });
  console.log(`Restored ${restored.count} no-website rows.`);

  // 2. Make sure the with-website-but-failed rows are archived.
  const archived = await prisma.scrapedBusiness.updateMany({
    where: {
      source: "pestworld-pest-control",
      archived: false,
      audited: false,
      NOT: { website: null },
    },
    data: { archived: true },
  });
  console.log(`Archived ${archived.count} failed-scrape rows.`);

  await prisma.$disconnect();
}
main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
