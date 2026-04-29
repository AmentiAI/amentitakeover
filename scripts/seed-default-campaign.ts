/**
 * Idempotently inserts the "Default mockup outreach" campaign so the
 * /outreach/email-campaigns page has at least one row out of the box.
 * Re-running keeps the existing row's stats (sent/opened/replied) — only
 * subject + body are refreshed from src/lib/default-campaign.ts.
 *
 *   tsx scripts/seed-default-campaign.ts
 */
import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_CAMPAIGN_BODY,
  defaultCampaignSubject,
} from "../src/lib/default-campaign";

const prisma = new PrismaClient();
const DEFAULT_NAME = "Default mockup outreach";

async function main() {
  const existing = await prisma.campaign.findFirst({ where: { name: DEFAULT_NAME } });
  const subject = defaultCampaignSubject(null);
  const body = DEFAULT_CAMPAIGN_BODY;

  if (existing) {
    const updated = await prisma.campaign.update({
      where: { id: existing.id },
      data: { subject, body, channel: "email" },
    });
    console.log(`Refreshed campaign "${updated.name}" (${updated.id}) — status=${updated.status}, sent=${updated.sent}`);
  } else {
    const created = await prisma.campaign.create({
      data: { name: DEFAULT_NAME, channel: "email", status: "draft", subject, body },
    });
    console.log(`Created campaign "${created.name}" (${created.id})`);
  }
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
