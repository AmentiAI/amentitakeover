import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import { rebuildSite } from "@/lib/rebuilder";
import {
  getTemplatePreviewUrl,
  normalizeTemplateChoice,
} from "@/lib/site-url";
import { bizLogger } from "@/lib/build-logger";
import { BotChallengeError } from "@/lib/scraper";
import {
  extractCityState,
  hasDomainChanged,
  mergePhones,
} from "@/lib/business-merge";

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

  // Hoisted so the post-rebuild ScrapedBusiness update can run the same
  // city/state/website/phone backfills that /api/enrich does, when this
  // route is hit standalone (i.e., outside the Run all flow).
  let scraped: Awaited<ReturnType<typeof deepScrapeSite>> | null = null;
  let scrapedJoinedText = "";

  try {
    // Re-scrape so each Build click freshens images, copy, palette, etc.
    // Without this, a stale Untitled.png or 404'd asset sticks until the
    // user manually clicks Re-scrape — surprising, since the user expects
    // "Build mockup" to be a do-it-now action.
    if (b.website) {
      const rescrapeStart = Date.now();
      scraped = await deepScrapeSite(b.website).catch((err) => {
        if (err instanceof BotChallengeError) {
          log.warn(
            "build.bot_challenge",
            `Re-scrape blocked by ${err.vendor} — falling back to cached site data`,
            { website: b.website, vendor: err.vendor },
          );
        } else {
          const msg = err instanceof Error ? err.message : "scrape error";
          log.warn("build.rescrape_failed", `Re-scrape failed, using cached site data: ${msg}`);
        }
        return null;
      });
      if (scraped) {
        // Logo only — templates render visuals via canvas + SVG, so the
        // bulk-images-from-the-site list is dead weight in Site.images.
        const merged: { src: string; alt: string }[] = scraped.logo
          ? [{ src: scraped.logo, alt: "logo" }]
          : [];
        const joinedText = scraped.pages
          .map((p) => `# ${p.kind.toUpperCase()}\n${p.text}`)
          .join("\n\n");
        scrapedJoinedText = joinedText;
        // Always save the contact-form schema when we find one — it's
        // useful even if an email was also discovered (alternate channel,
        // visibility into form structure, future automation).
        const contactForm = scraped.contactForm;
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
            contactForm: contactForm ?? undefined,
            contentScore: scraped.contentScore,
            signals: scraped.signals,
          },
        });
        await log.info(
          "build.rescraped",
          `Re-scraped ${b.website} — logo=${scraped.logo ? "yes" : "no"}, ${scraped.pages.length} pages`,
          {
            durationMs: Date.now() - rescrapeStart,
            logoCaptured: Boolean(scraped.logo),
            pagesScraped: scraped.pages.length,
            logo: scraped.logo,
            ogImage: scraped.ogImage,
            emailFound: scraped.emails.length > 0,
            contentScore: scraped.contentScore,
            signals: scraped.signals,
            contactFormCaptured: Boolean(contactForm),
            contactForm: contactForm
              ? {
                  pageUrl: contactForm.pageUrl,
                  pageKind: contactForm.pageKind,
                  action: contactForm.action,
                  method: contactForm.method,
                  fieldCount: contactForm.fields.length,
                  hasEmailField: contactForm.hasEmailField,
                  hasMessageField: contactForm.hasMessageField,
                  fieldNames: contactForm.fields.map((f) => f.name),
                }
              : null,
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

    // Apply the same backfill rules as /api/enrich, gated on having
    // fresh scrape data this run. Skipped silently when re-scrape was
    // blocked (Cloudflare etc.) — Run all hits enrich first anyway.
    const backfill: Record<string, unknown> = {
      siteGenerated: true,
      templateChoice,
    };
    if (scraped) {
      const cityState = (!b.city || !b.state)
        ? extractCityState(scrapedJoinedText)
        : { city: null, state: null };
      const newWebsite =
        b.website && hasDomainChanged(b.website, scraped.url) ? scraped.url : undefined;
      const mergedPhones = mergePhones(
        b.phones,
        b.phone ?? null,
        scraped.phones,
        "website-scrape",
      );
      backfill.phones = mergedPhones;
      if (cityState.city && !b.city) backfill.city = cityState.city;
      if (cityState.state && !b.state) backfill.state = cityState.state;
      if (newWebsite) backfill.website = newWebsite;
    }
    await prisma.scrapedBusiness.update({
      where: { id },
      data: backfill,
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
