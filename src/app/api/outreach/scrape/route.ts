import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchGoogleMaps, serpApiAvailable } from "@/lib/serpapi";
import { z } from "zod";

const Body = z.object({
  source: z.enum(["google", "yelp", "instagram"]).default("google"),
  industry: z.string(),
  location: z.string(),
  count: z.number().int().min(1).max(500).default(20),
  live: z.boolean().optional(), // force SerpApi; else auto-detect
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const { source, industry, location, count } = parsed.data;
  if (!serpApiAvailable()) {
    return NextResponse.json(
      { error: "SERP_API_KEY is not set. Add it to .env to enable live scraping." },
      { status: 400 },
    );
  }
  const useLive = true;

  const job = await prisma.scrapeJob.create({
    data: {
      source,
      query: { industry, location, count, live: useLive },
      status: "running",
      total: count,
      startedAt: new Date(),
    },
  });

  try {
    let saved = 0;

    if (useLive) {
      const local = await searchGoogleMaps({
        query: industry,
        location,
        limit: count,
      });

      for (const r of local) {
        // Dedupe by source+sourceId
        const existing = await prisma.scrapedBusiness.findFirst({
          where: { source: "google", sourceId: r.sourceId },
          select: { id: true },
        });
        if (existing) {
          await prisma.scrapedBusiness.update({
            where: { id: existing.id },
            data: {
              name: r.name,
              website: r.website,
              phone: r.phone,
              address: r.address,
              city: r.city,
              state: r.state,
              postalCode: r.postalCode,
              country: r.country ?? "USA",
              lat: r.lat,
              lng: r.lng,
              rating: r.rating,
              reviewsCount: r.reviewsCount,
              category: r.category,
              industry,
              hasWebsite: Boolean(r.website),
              scrapeJobId: job.id,
            },
          });
        } else {
          await prisma.scrapedBusiness.create({
            data: {
              source: "google",
              sourceId: r.sourceId,
              name: r.name,
              website: r.website,
              phone: r.phone,
              address: r.address,
              city: r.city,
              state: r.state,
              postalCode: r.postalCode,
              country: r.country ?? "USA",
              lat: r.lat,
              lng: r.lng,
              rating: r.rating,
              reviewsCount: r.reviewsCount,
              category: r.category,
              industry,
              hasWebsite: Boolean(r.website),
              scrapeJobId: job.id,
            },
          });
        }
        saved++;
        await prisma.scrapeJob.update({
          where: { id: job.id },
          data: { progress: saved, total: local.length },
        });
      }
    }

    await prisma.industryProgress.upsert({
      where: { industry },
      update: {
        totalFound: { increment: saved },
        lastRunAt: new Date(),
      },
      create: {
        industry,
        totalFound: saved,
        lastRunAt: new Date(),
      },
    });

    const updated = await prisma.scrapeJob.update({
      where: { id: job.id },
      data: {
        status: "done",
        progress: saved,
        total: saved,
        finishedAt: new Date(),
      },
    });
    return NextResponse.json({ ...updated, saved, live: useLive });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    await prisma.scrapeJob.update({
      where: { id: job.id },
      data: { status: "failed", error: msg, finishedAt: new Date() },
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
