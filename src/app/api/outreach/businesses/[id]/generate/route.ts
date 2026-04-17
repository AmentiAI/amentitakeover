import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";
import { rebuildSite } from "@/lib/rebuilder";

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
      const mergedImages: { src: string; alt: string }[] = [];
      if (scraped.logo) {
        mergedImages.push({ src: scraped.logo, alt: "logo" });
      }
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
            images: mergedImages.length,
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
            imagesCount: mergedImagesCount(scraped),
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

function mergedImagesCount(scraped: NonNullable<Awaited<ReturnType<typeof deepScrapeSite>>>): number {
  const set = new Set<string>();
  if (scraped.logo) set.add(scraped.logo);
  if (scraped.ogImage) set.add(scraped.ogImage);
  for (const img of scraped.images) set.add(img.src);
  return set.size;
}
