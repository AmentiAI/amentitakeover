/**
 * Bootstrap seed — creates only the minimum the app needs to function:
 *   - Your user
 *   - Default pipeline "Cold Email Outreach v2" with 10 stages
 *   - Two empty calendars (Discovery / Demos)
 *
 * NO fake businesses, contacts, opportunities, conversations, campaigns, or
 * scraped businesses are created. Populate real data via the SerpApi scraper
 * on /outreach/scrape/google.
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULT_STAGES } from "../src/lib/stages";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "wilsonaidan336@gmail.com" },
    update: {},
    create: {
      email: "wilsonaidan336@gmail.com",
      name: "Wilson",
      role: "owner",
    },
  });

  let pipeline = await prisma.pipeline.findFirst({
    where: { name: "Cold Email Outreach v2" },
  });
  if (!pipeline) {
    pipeline = await prisma.pipeline.create({
      data: {
        name: "Cold Email Outreach v2",
        description: "Default outreach pipeline",
        isDefault: true,
      },
    });
  }

  const existingStages = await prisma.stage.findMany({
    where: { pipelineId: pipeline.id },
  });
  if (existingStages.length === 0) {
    for (let i = 0; i < DEFAULT_STAGES.length; i++) {
      const s = DEFAULT_STAGES[i];
      await prisma.stage.create({
        data: {
          name: s.name,
          color: s.color,
          position: i,
          pipelineId: pipeline.id,
        },
      });
    }
  }

  const calCount = await prisma.calendar.count();
  if (calCount === 0) {
    await prisma.calendar.create({ data: { name: "Discovery Calls", color: "#3a86ff" } });
    await prisma.calendar.create({ data: { name: "Demos", color: "#8338ec" } });
  }

  console.log("Seed complete — real data is populated via the scraper UI.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
