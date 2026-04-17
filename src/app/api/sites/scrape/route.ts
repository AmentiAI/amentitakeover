import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeSite } from "@/lib/scraper";
import { z } from "zod";

const Body = z.object({
  url: z.string().min(3),
  businessId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  try {
    const data = await scrapeSite(parsed.data.url);
    // Prepend detected logo + og:image so downstream consumers can find them
    // via the existing images-array contract.
    const mergedImages: { src: string; alt: string }[] = [];
    if (data.logoUrl) {
      mergedImages.push({ src: data.logoUrl, alt: "logo" });
    }
    if (data.ogImage && data.ogImage !== data.logoUrl) {
      mergedImages.push({ src: data.ogImage, alt: "hero" });
    }
    for (const img of data.images) {
      if (mergedImages.some((m) => m.src === img.src)) continue;
      mergedImages.push({ src: img.src, alt: img.alt ?? "" });
    }

    const site = await prisma.site.create({
      data: {
        url: data.url,
        title: data.title,
        description: data.description,
        favicon: data.logoUrl ?? data.favicon,
        rawHtml: data.rawHtml,
        textContent: data.textContent,
        palette: data.palette,
        fonts: data.fonts,
        headings: data.headings,
        images: mergedImages,
        links: data.links,
        status: "scraped",
        businessId: parsed.data.businessId,
      },
    });
    return NextResponse.json(site);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
