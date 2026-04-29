import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import { rebuildSite } from "@/lib/rebuilder";
import { generateSiteImages } from "@/lib/site-image-generator";
import {
  extractCityState,
  hasDomainChanged,
  mergePhones,
} from "@/lib/business-merge";

export const maxDuration = 300;

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const b = await prisma.scrapedBusiness.findUnique({ where: { id } });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.website)
    return NextResponse.json({ error: "No website" }, { status: 400 });

  try {
    const scraped = await deepScrapeSite(b.website).catch(() => null);
    let siteId: string | null = null;

    if (scraped) {
      // Logo only — templates render via canvas + SVG. Skipping the bulk
      // <img> sweep keeps Site.images small and avoids storing a pile of
      // CDN URLs we'll never reference.
      const mergedImages: { src: string; alt: string }[] = scraped.logo
        ? [{ src: scraped.logo, alt: "logo" }]
        : [];

      const joinedText = scraped.pages
        .map((p) => `# ${p.kind.toUpperCase()}\n${p.text}`)
        .join("\n\n");

      // Mirror the scraped business into the CRM so every generated site shows
      // up on the pipeline/opportunities views. Uses the same `{id}_crm` id
      // convention the lead-form endpoints use to keep things idempotent.
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

      const contactForm = scraped.contactForm;
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

      await prisma.activityEvent.create({
        data: {
          type: "site.generated",
          title: `Site generated for ${b.name}`,
          details: {
            siteId: site.id,
            scrapedBusinessId: b.id,
            crmBusinessId: crmBusiness.id,
            pages: scraped.pages.length,
            logoCaptured: Boolean(scraped.logo),
          },
        },
      });

      const rebuild = await rebuildSite({
        site: {
          url: scraped.url,
          title: scraped.title,
          description: scraped.description,
          textContent: joinedText,
          headings: scraped.headings,
          images: mergedImages,
          palette: scraped.palette,
          fonts: scraped.fonts,
        },
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
    }

    // Generate AI imagery for the mockup — hero + gallery, styled to match
    // the business. Best-effort; failures don't block the rest of the flow.
    if (siteId) {
      try {
        await generateSiteImages(b.id);
      } catch (err) {
        console.error("[generate] site-image generation failed:", err);
      }
    }

    // Same backfill rules as /api/enrich. Only run them when we
    // actually got fresh scrape data this turn.
    const cityState = scraped && (!b.city || !b.state)
      ? extractCityState(
          scraped.pages.map((p) => p.text).join("\n"),
        )
      : { city: null, state: null };
    const newWebsite =
      scraped && b.website && hasDomainChanged(b.website, scraped.url)
        ? scraped.url
        : undefined;
    const mergedPhones = scraped
      ? mergePhones(b.phones, b.phone ?? null, scraped.phones, "website-scrape")
      : null;

    const updated = await prisma.scrapedBusiness.update({
      where: { id },
      data: {
        hasWebsite: Boolean(b.website),
        audited: Boolean(scraped),
        siteGenerated: Boolean(siteId),
        emailReady: Boolean(b.email || scraped?.emails[0]),
        siteId: siteId ?? undefined,
        // Enrich from deep scrape when the DB row is missing info
        email: b.email ?? scraped?.emails[0] ?? null,
        phone: b.phone ?? scraped?.phones[0] ?? null,
        ...(mergedPhones ? { phones: mergedPhones } : {}),
        ...(cityState.city && !b.city ? { city: cityState.city } : {}),
        ...(cityState.state && !b.state ? { state: cityState.state } : {}),
        ...(newWebsite ? { website: newWebsite } : {}),
        instagram: b.instagram ?? scraped?.socials.instagram ?? null,
        facebook: b.facebook ?? scraped?.socials.facebook ?? null,
        twitter: b.twitter ?? scraped?.socials.twitter ?? null,
        linkedin: b.linkedin ?? scraped?.socials.linkedin ?? null,
        tiktok: b.tiktok ?? scraped?.socials.tiktok ?? null,
      },
    });

    return NextResponse.json({
      ...updated,
      _scrape: scraped
        ? {
            logoCaptured: Boolean(scraped.logo),
            pagesCount: scraped.pages.length,
            emails: scraped.emails.length,
            phones: scraped.phones.length,
          }
        : null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
