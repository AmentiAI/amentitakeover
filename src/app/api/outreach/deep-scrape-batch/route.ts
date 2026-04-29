import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import {
  extractCityState,
  hasDomainChanged,
  mergePhones,
} from "@/lib/business-merge";
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
      // Logo only — templates render via canvas + SVG, so we don't store
      // the bulk <img> sweep anymore.
      const mergedImages: { src: string; alt: string }[] = result.logo
        ? [{ src: result.logo, alt: "logo" }]
        : [];
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
          contactForm: result.contactForm ?? undefined,
          contentScore: result.contentScore,
          signals: result.signals,
          status: "scraped",
        },
      });
      const cityState = (!biz.city || !biz.state)
        ? extractCityState(result.pages.map((p) => p.text).join("\n"))
        : { city: null, state: null };
      const newWebsite =
        biz.website && hasDomainChanged(biz.website, result.url)
          ? result.url
          : undefined;
      const mergedPhones = mergePhones(
        biz.phones,
        biz.phone ?? null,
        result.phones,
        "website-scrape",
      );
      await prisma.scrapedBusiness.update({
        where: { id: biz.id },
        data: {
          siteId: site.id,
          email: biz.email ?? result.emails[0] ?? null,
          phone: biz.phone ?? result.phones[0] ?? null,
          phones: mergedPhones,
          ...(cityState.city && !biz.city ? { city: cityState.city } : {}),
          ...(cityState.state && !biz.state ? { state: cityState.state } : {}),
          ...(newWebsite ? { website: newWebsite } : {}),
          instagram: biz.instagram ?? result.socials.instagram,
          facebook: biz.facebook ?? result.socials.facebook,
          twitter: biz.twitter ?? result.socials.twitter,
          linkedin: biz.linkedin ?? result.socials.linkedin,
          tiktok: biz.tiktok ?? result.socials.tiktok,
          enriched: true,
          hasWebsite: true,
          audited: true,
          // Scrape completion is enough — demo pages don't need an AI-image
          // pass to render. See /enrich/route.ts for the full rationale.
          siteGenerated: true,
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
