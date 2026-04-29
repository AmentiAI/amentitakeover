import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import { BotChallengeError } from "@/lib/scraper";
import { bizLogger } from "@/lib/build-logger";
import {
  extractCityState,
  hasDomainChanged,
  mergePhones,
} from "@/lib/business-merge";

export const maxDuration = 120;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const log = bizLogger(id);
  const b = await prisma.scrapedBusiness.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.website) {
    await log.warn("enrich.skipped", "Enrich skipped — no website on record");
    return NextResponse.json({ error: "No website" }, { status: 400 });
  }

  await log.info("enrich.started", `Enrich started — scraping ${b.website}`, {
    website: b.website,
  });
  const startedAt = Date.now();

  try {
    let scraped: Awaited<ReturnType<typeof deepScrapeSite>> | null = null;
    try {
      scraped = await deepScrapeSite(b.website);
    } catch (err) {
      if (err instanceof BotChallengeError) {
        await log.warn(
          "enrich.bot_challenge",
          `Blocked by ${err.vendor} bot challenge — site needs a JS-solving browser to scrape`,
          { website: b.website, vendor: err.vendor },
        );
        return NextResponse.json(
          {
            error: `Blocked by ${err.vendor} — this site requires a real browser to bypass its bot challenge.`,
          },
          { status: 451 },
        );
      }
      const msg = err instanceof Error ? err.message : "scrape error";
      await log.error("enrich.scrape_failed", `deepScrapeSite threw for ${b.website}: ${msg}`, {
        website: b.website,
        error: msg,
      });
      return NextResponse.json(
        { error: "Could not scrape site — check the URL" },
        { status: 502 },
      );
    }
    if (!scraped) {
      await log.error("enrich.scrape_failed", `deepScrapeSite returned null for ${b.website}`, {
        website: b.website,
      });
      return NextResponse.json(
        { error: "Could not scrape site — check the URL" },
        { status: 502 },
      );
    }

    // Templates render via canvas + SVG — the only photo asset we actually
    // need from a scrape is the logo. Bulk-stripping the OG image and
    // every <img> on the site keeps the Site row lean and avoids paying
    // egress later for assets we'll never use.
    const mergedImages: { src: string; alt: string }[] = scraped.logo
      ? [{ src: scraped.logo, alt: "logo" }]
      : [];

    const joinedText = scraped.pages
      .map((p) => `# ${p.kind.toUpperCase()}\n${p.text}`)
      .join("\n\n");

    const crmBusinessId = `${b.id}_crm`;
    const crmBusiness = await prisma.business.upsert({
      where: { id: crmBusinessId },
      update: {
        name: b.name,
        website: b.website ?? scraped.url,
        phone: b.phone ?? scraped.phones[0] ?? null,
        email: b.email ?? scraped.emails[0] ?? null,
        city: b.city,
        state: b.state,
        address: b.address,
        zip: b.postalCode,
        industry: b.industry ?? b.category,
      },
      create: {
        id: crmBusinessId,
        name: b.name,
        website: b.website ?? scraped.url,
        phone: b.phone ?? scraped.phones[0] ?? null,
        email: b.email ?? scraped.emails[0] ?? null,
        city: b.city,
        state: b.state,
        address: b.address,
        zip: b.postalCode,
        industry: b.industry ?? b.category,
      },
    });

    // Always persist the contact-form schema when we find one — useful as
    // an alternate channel even when email was also discovered.
    const contactForm = scraped.contactForm;

    let siteId = b.siteId;
    if (siteId) {
      await prisma.site.update({
        where: { id: siteId },
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
          images: mergedImages,
          links: scraped.links,
          contactForm: contactForm ?? undefined,
          contentScore: scraped.contentScore,
          signals: scraped.signals,
          businessId: crmBusiness.id,
        },
      });
    } else {
      const site = await prisma.site.create({
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
          images: mergedImages,
          links: scraped.links,
          contactForm: contactForm ?? undefined,
          contentScore: scraped.contentScore,
          signals: scraped.signals,
          businessId: crmBusiness.id,
        },
      });
      siteId = site.id;
    }

    // Backfill location when the row was missing it and the site reveals
    // a city/state (footer addresses, contact-page schema, etc.).
    const cityState = (!b.city || !b.state)
      ? extractCityState(joinedText)
      : { city: null, state: null };

    // Domain redirect — site that 301s to a new host should update the
    // canonical website. The original source is preserved in the source
    // tag, so no audit info is lost.
    const newWebsite =
      b.website && hasDomainChanged(b.website, scraped.url) ? scraped.url : undefined;

    // Phone history — never replace the primary number, accumulate every
    // number we've ever found tagged with where it came from.
    const mergedPhones = mergePhones(
      b.phones,
      b.phone ?? null,
      scraped.phones,
      "website-scrape",
    );

    await prisma.scrapedBusiness.update({
      where: { id },
      data: {
        hasWebsite: true,
        audited: true,
        // Demo pages render on the fly from scraped data — no AI imagery
        // step required. A successful scrape is the only prerequisite for
        // /p/<template>/<id> to look right, so siteGenerated tracks scrape
        // completion now (used to track AI-image-gen completion).
        siteGenerated: true,
        emailReady: Boolean(b.email || scraped.emails[0]),
        siteId,
        email: b.email ?? scraped.emails[0] ?? null,
        phone: b.phone ?? scraped.phones[0] ?? null,
        phones: mergedPhones,
        // Only overwrite city/state when they were missing — never clobber
        // existing GMB-precise values with regex-extracted ones.
        ...(cityState.city && !b.city ? { city: cityState.city } : {}),
        ...(cityState.state && !b.state ? { state: cityState.state } : {}),
        ...(newWebsite ? { website: newWebsite } : {}),
        instagram: b.instagram ?? scraped.socials.instagram ?? null,
        facebook: b.facebook ?? scraped.socials.facebook ?? null,
        twitter: b.twitter ?? scraped.socials.twitter ?? null,
        linkedin: b.linkedin ?? scraped.socials.linkedin ?? null,
        tiktok: b.tiktok ?? scraped.socials.tiktok ?? null,
      },
    });

    await log.info(
      "enrich.completed",
      `Enrich complete — logo=${scraped.logo ? "yes" : "no"}, ${scraped.pages.length} pages`,
      {
        durationMs: Date.now() - startedAt,
        siteId,
        logoCaptured: Boolean(scraped.logo),
        pagesScraped: scraped.pages.length,
        cityBackfilled: cityState.city && !b.city ? cityState.city : null,
        stateBackfilled: cityState.state && !b.state ? cityState.state : null,
        websiteUpdated: newWebsite ?? null,
        phonesAfter: mergedPhones.length,
        phonesAdded: mergedPhones.length - (Array.isArray(b.phones) ? (b.phones as unknown[]).length : (b.phone ? 1 : 0)),
        logo: scraped.logo,
        ogImage: scraped.ogImage,
        paletteCount: scraped.palette?.length ?? 0,
        fontsCount: scraped.fonts?.length ?? 0,
        emailsFound: scraped.emails.length,
        phonesFound: scraped.phones.length,
        socialsFound: Object.entries(scraped.socials).filter(([, v]) => v).map(([k]) => k),
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

    return NextResponse.json({
      ok: true,
      siteId,
      logo: scraped.logo,
      ogImage: scraped.ogImage,
      palette: scraped.palette,
      fonts: scraped.fonts,
      logoCaptured: Boolean(scraped.logo),
      pagesScraped: scraped.pages.length,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    await log.error("enrich.failed", "Enrich failed", {
      error: msg,
      durationMs: Date.now() - startedAt,
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
