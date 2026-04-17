import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { deepScrapeSite } from "@/lib/deep-scraper";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const biz = await prisma.scrapedBusiness.findUnique({ where: { id } });
  if (!biz) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!biz.website) {
    return NextResponse.json({ error: "no website on record" }, { status: 400 });
  }

  try {
    const result = await deepScrapeSite(biz.website);

    const mergedImages: { src: string; alt: string }[] = [];
    if (result.logo) {
      mergedImages.push({ src: result.logo, alt: "logo" });
    }
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

    const inferredEmail = biz.email ?? result.emails[0] ?? null;
    const inferredPhone = biz.phone ?? result.phones[0] ?? null;

    await prisma.scrapedBusiness.update({
      where: { id: biz.id },
      data: {
        siteId: site.id,
        email: inferredEmail,
        phone: inferredPhone,
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

    return NextResponse.json({
      siteId: site.id,
      pages: result.pages.map((p) => ({ url: p.url, kind: p.kind })),
      emails: result.emails,
      phones: result.phones,
      socials: result.socials,
      imagesCount: result.images.length,
      palette: result.palette,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
