import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const source = process.argv[2] ?? "pestworld-pest-control";
  const [total, audited, hasWebsite, scraped, hasContactForm, hasEmail] = await Promise.all([
    prisma.scrapedBusiness.count({ where: { source } }),
    prisma.scrapedBusiness.count({ where: { source, audited: true } }),
    prisma.scrapedBusiness.count({ where: { source, hasWebsite: true } }),
    prisma.scrapedBusiness.count({ where: { source, audited: true, hasWebsite: true } }),
    prisma.scrapedBusiness.count({ where: { source, site: { contactForm: { not: null } } } }),
    prisma.scrapedBusiness.count({ where: { source, NOT: { email: null } } }),
  ]);
  console.log(`source=${source}`);
  console.log(`  total:           ${total}`);
  console.log(`  has website:     ${hasWebsite}`);
  console.log(`  audited:         ${audited} (${hasWebsite > 0 ? Math.round((audited / hasWebsite) * 100) : 0}% of with-website)`);
  console.log(`  scraped + sited: ${scraped}`);
  console.log(`  contact form:    ${hasContactForm}`);
  console.log(`  has email:       ${hasEmail}`);
  await prisma.$disconnect();
}
main();
