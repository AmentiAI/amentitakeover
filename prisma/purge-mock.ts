/**
 * Purges all seed/mock data so the app runs against real SerpApi results only.
 * Keeps: User, Pipeline, Stage, Calendar (empty ones), CustomField.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Purging mock data...");

  // Order matters — children before parents.
  const steps: [string, () => Promise<{ count: number }>][] = [
    ["ActivityEvent", () => prisma.activityEvent.deleteMany({})],
    ["Note", () => prisma.note.deleteMany({})],
    ["ContactFollower", () => prisma.contactFollower.deleteMany({})],
    ["Task", () => prisma.task.deleteMany({})],
    ["Message", () => prisma.message.deleteMany({})],
    ["Conversation", () => prisma.conversation.deleteMany({})],
    ["Appointment", () => prisma.appointment.deleteMany({})],
    ["EmailDraft", () => prisma.emailDraft.deleteMany({})],
    ["SiteRebuild", () => prisma.siteRebuild.deleteMany({})],
    ["Opportunity", () => prisma.opportunity.deleteMany({})],
    ["ScrapedBusiness", () => prisma.scrapedBusiness.deleteMany({})],
    ["ScrapeJob", () => prisma.scrapeJob.deleteMany({})],
    ["BatchJob", () => prisma.batchJob.deleteMany({})],
    ["IndustryProgress", () => prisma.industryProgress.deleteMany({})],
    ["Site", () => prisma.site.deleteMany({})],
    ["Contact", () => prisma.contact.deleteMany({})],
    ["Business", () => prisma.business.deleteMany({})],
    ["Campaign", () => prisma.campaign.deleteMany({})],
    ["Automation", () => prisma.automation.deleteMany({})],
    ["SocialAccount", () => prisma.socialAccount.deleteMany({})],
    ["SocialFollowJob", () => prisma.socialFollowJob.deleteMany({})],
    ["AiUsageEvent", () => prisma.aiUsageEvent.deleteMany({})],
    ["SmartList", () => prisma.smartList.deleteMany({})],
  ];

  for (const [name, fn] of steps) {
    const res = await fn();
    console.log(`  ${name}: deleted ${res.count}`);
  }

  const users = await prisma.user.count();
  const pipes = await prisma.pipeline.count();
  const stages = await prisma.stage.count();
  console.log(`\nKept: ${users} users, ${pipes} pipelines, ${stages} stages.`);
  console.log("Purge complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
