import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import { bizLogger } from "@/lib/build-logger";

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
    const scraped = await deepScrapeSite(b.website).catch(() => null);
    if (!scraped) {
      await log.error("enrich.scrape_failed", `deepScrapeSite returned null for ${b.website}`, {
        website: b.website,
      });
      return NextResponse.json(
        { error: "Could not scrape site — check the URL" },
        { status: 502 },
      );
    }

    const mergedImages: { src: string; alt: string }[] = [];
    if (scraped.logo) mergedImages.push({ src: scraped.logo, alt: "logo" });
    if (scraped.ogImage && scraped.ogImage !== scraped.logo) {
      mergedImages.push({ src: scraped.ogImage, alt: "hero" });
    }
    for (const img of scraped.images) {
      if (mergedImages.some((m) => m.src === img.src)) continue;
      mergedImages.push({ src: img.src, alt: img.alt ?? "" });
    }

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
          businessId: crmBusiness.id,
        },
      });
      siteId = site.id;
    }

    await prisma.scrapedBusiness.update({
      where: { id },
      data: {
        hasWebsite: true,
        audited: true,
        emailReady: Boolean(b.email || scraped.emails[0]),
        siteId,
        email: b.email ?? scraped.emails[0] ?? null,
        phone: b.phone ?? scraped.phones[0] ?? null,
        instagram: b.instagram ?? scraped.socials.instagram ?? null,
        facebook: b.facebook ?? scraped.socials.facebook ?? null,
        twitter: b.twitter ?? scraped.socials.twitter ?? null,
        linkedin: b.linkedin ?? scraped.socials.linkedin ?? null,
        tiktok: b.tiktok ?? scraped.socials.tiktok ?? null,
      },
    });

    await log.info(
      "enrich.completed",
      `Enrich complete — ${mergedImages.length} images, ${scraped.pages.length} pages`,
      {
        durationMs: Date.now() - startedAt,
        siteId,
        imagesCount: mergedImages.length,
        pagesScraped: scraped.pages.length,
        sampleImages: mergedImages.slice(0, 5).map((i) => i.src),
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
      imagesCount: mergedImages.length,
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
