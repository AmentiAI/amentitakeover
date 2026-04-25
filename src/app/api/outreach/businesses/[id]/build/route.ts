import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import { rebuildSite } from "@/lib/rebuilder";
import {
  getTemplatePreviewUrl,
  normalizeTemplateChoice,
} from "@/lib/site-url";
import { bizLogger } from "@/lib/build-logger";
import { isGalleryCandidate } from "@/lib/templates/site";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const log = bizLogger(id);
  const body = await req.json().catch(() => ({}));
  const templateChoice = normalizeTemplateChoice(body?.templateChoice);

  const b = await prisma.scrapedBusiness.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.audited || !b.site) {
    await log.warn("build.skipped", "Build skipped — Enrich not run yet", {
      reason: "missing_site_data",
      audited: b.audited,
      hasSite: Boolean(b.site),
    });
    return NextResponse.json(
      { error: "Run Enrich first — site data is missing." },
      { status: 400 },
    );
  }

  let site = b.site;
  await log.info("build.started", `Build started for ${b.name}`, {
    templateChoice,
    siteUrl: site.url,
  });
  const startedAt = Date.now();

  try {
    // Re-scrape so each Build click freshens images, copy, palette, etc.
    // Without this, a stale Untitled.png or 404'd asset sticks until the
    // user manually clicks Re-scrape — surprising, since the user expects
    // "Build mockup" to be a do-it-now action.
    if (b.website) {
      const rescrapeStart = Date.now();
      const scraped = await deepScrapeSite(b.website).catch((err) => {
        const msg = err instanceof Error ? err.message : "scrape error";
        log.warn("build.rescrape_failed", `Re-scrape failed, using cached site data: ${msg}`);
        return null;
      });
      if (scraped) {
        const merged: { src: string; alt: string }[] = [];
        if (scraped.logo) merged.push({ src: scraped.logo, alt: "logo" });
        if (scraped.ogImage && scraped.ogImage !== scraped.logo) {
          merged.push({ src: scraped.ogImage, alt: "hero" });
        }
        for (const img of scraped.images) {
          if (merged.some((m) => m.src === img.src)) continue;
          merged.push({ src: img.src, alt: img.alt ?? "" });
        }
        const joinedText = scraped.pages
          .map((p) => `# ${p.kind.toUpperCase()}\n${p.text}`)
          .join("\n\n");
        site = await prisma.site.update({
          where: { id: site.id },
          data: {
            url: scraped.url,
            title: scraped.title,
            description: scraped.description,
            favicon: scraped.logo ?? scraped.favicon,
            rawHtml: scraped.rawHtml,
            textContent: joinedText,
            palette: scraped.palette,
            fonts: scraped.fonts,
            headings: scraped.headings,
            images: merged,
            links: scraped.links,
          },
        });
        const galleryEligible = merged.filter(isGalleryCandidate);
        await log.info(
          "build.rescraped",
          `Re-scraped ${b.website} — ${merged.length} images, ${galleryEligible.length} pass gallery filter`,
          {
            durationMs: Date.now() - rescrapeStart,
            imagesCount: merged.length,
            galleryCandidatesCount: galleryEligible.length,
            pagesScraped: scraped.pages.length,
            sampleImages: merged.slice(0, 5).map((i) => i.src),
            galleryCandidatesSample: galleryEligible.slice(0, 5).map((i) => i.src),
            ogImage: scraped.ogImage,
            logo: scraped.logo,
          },
        );
      }
    }

    const images = Array.isArray(site.images)
      ? (site.images as { src: string; alt?: string | null }[]).map((i) => ({
          src: i.src,
          alt: i.alt ?? "",
        }))
      : [];

    const rebuild = await rebuildSite({
      site: {
        url: site.url,
        title: site.title ?? b.name,
        description: site.description ?? null,
        textContent: site.textContent ?? "",
        headings: site.headings as unknown,
        images,
        palette: site.palette ?? [],
        fonts: site.fonts ?? [],
      },
    });

    await log.info("build.rebuild_done", "LLM rebuild complete", {
      model: rebuild.model,
      htmlBytes: rebuild.html?.length ?? 0,
      notes: rebuild.notes ?? null,
    });

    await prisma.siteRebuild.create({
      data: {
        siteId: site.id,
        html: rebuild.html,
        notes: rebuild.notes,
        model: rebuild.model,
        status: "ready",
      },
    });

    await prisma.scrapedBusiness.update({
      where: { id },
      data: {
        siteGenerated: true,
        templateChoice,
      },
    });

    const previewUrl = getTemplatePreviewUrl(id, { template: templateChoice });
    await log.info("build.completed", `Build completed in ${Date.now() - startedAt}ms`, {
      templateChoice,
      previewUrl,
      durationMs: Date.now() - startedAt,
    });

    return NextResponse.json({
      ok: true,
      templateChoice,
      previewUrl,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    await log.error("build.failed", "Build failed", {
      error: msg,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
