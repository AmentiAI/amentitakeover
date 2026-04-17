import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import { z } from "zod";

const Body = z.object({
  scrapeJobId: z.string().optional(),
  ids: z.array(z.string()).optional(),
  limit: z.number().int().min(1).max(100).default(25),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const where: any = { audited: false, website: { not: null } };
  if (parsed.data.scrapeJobId) where.scrapeJobId = parsed.data.scrapeJobId;
  if (parsed.data.ids?.length) where.id = { in: parsed.data.ids };

  const targets = await prisma.scrapedBusiness.findMany({
    where,
    take: parsed.data.limit,
    orderBy: { createdAt: "desc" },
  });

  const job = await prisma.batchJob.create({
    data: {
      type: "audit",
      name: `Deep scrape × ${targets.length}`,
      status: "running",
      total: targets.length,
      params: parsed.data,
      startedAt: new Date(),
    },
  });

  let done = 0;
  let failed = 0;
  const outcomes: { id: string; ok: boolean; error?: string }[] = [];

  for (const biz of targets) {
    try {
      const result = await deepScrapeSite(biz.website!);
      const mergedImages: { src: string; alt: string }[] = [];
      if (result.logo) mergedImages.push({ src: result.logo, alt: "logo" });
      if (result.ogImage && result.ogImage !== result.logo) {
        mergedImages.push({ src: result.ogImage, alt: "hero" });
      }
      for (const img of result.images) {
        if (mergedImages.some((m) => m.src === img.src)) continue;
        mergedImages.push({ src: img.src, alt: img.alt ?? "" });
      }
      const site = await prisma.site.create({
        data: {
          url: result.url,
          title: result.title,
          description: result.description,
          favicon: result.logo ?? result.favicon,
          rawHtml: result.rawHtml,
          textContent: result.pages.map((p) => `# ${p.kind.toUpperCase()}\n${p.text}`).join("\n\n"),
          palette: result.palette,
          fonts: result.fonts,
          headings: result.headings as any,
          images: mergedImages as any,
          links: result.links as any,
          status: "scraped",
        },
      });
      await prisma.scrapedBusiness.update({
        where: { id: biz.id },
        data: {
          siteId: site.id,
          email: biz.email ?? result.emails[0] ?? null,
          phone: biz.phone ?? result.phones[0] ?? null,
          instagram: biz.instagram ?? result.socials.instagram,
          facebook: biz.facebook ?? result.socials.facebook,
          twitter: biz.twitter ?? result.socials.twitter,
          linkedin: biz.linkedin ?? result.socials.linkedin,
          tiktok: biz.tiktok ?? result.socials.tiktok,
          enriched: true,
          hasWebsite: true,
          audited: true,
        },
      });
      outcomes.push({ id: biz.id, ok: true });
      done++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      outcomes.push({ id: biz.id, ok: false, error: msg });
      failed++;
    }
    await prisma.batchJob.update({
      where: { id: job.id },
      data: { completed: done, failed },
    });
  }

  await prisma.batchJob.update({
    where: { id: job.id },
    data: { status: "done", finishedAt: new Date() },
  });

  return NextResponse.json({ jobId: job.id, done, failed, outcomes });
}
