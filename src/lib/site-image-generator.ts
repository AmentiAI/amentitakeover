import { prisma } from "@/lib/db";
import { buildImageBrief, type BusinessContext } from "@/lib/image-prompt";
import { generateImage, ImageModerationError, type ImageQuality } from "@/lib/openai-image";

/**
 * Generate a matched set of mockup-site images for a scraped business.
 * Produces one hero, three section banners, and four gallery squares — 8
 * images total so the template has distinct art for each section instead
 * of reusing one gallery everywhere.
 *
 * Persists raw PNG bytes to GeneratedImage rows keyed by purpose.
 * Idempotent: if the business already has generated images and `force` is
 * not set, returns the existing set untouched.
 */

export type SiteImagePurpose =
  | "hero"
  | "banner-about"
  | "banner-services"
  | "banner-cta"
  | "gallery";

export type SiteImageSet = {
  hero: { id: string; src: string } | null;
  aboutBanner: { id: string; src: string } | null;
  servicesBanner: { id: string; src: string } | null;
  ctaBanner: { id: string; src: string } | null;
  gallery: { id: string; src: string }[];
};

const DEFAULT_GALLERY_COUNT = 4;

export async function generateSiteImages(
  scrapedBusinessId: string,
  opts?: { force?: boolean; quality?: ImageQuality; galleryCount?: number },
): Promise<SiteImageSet> {
  const force = opts?.force ?? false;
  const quality: ImageQuality = opts?.quality ?? "medium";
  const galleryCount = opts?.galleryCount ?? DEFAULT_GALLERY_COUNT;

  if (!force) {
    const existing = await getSiteImageSet(scrapedBusinessId);
    if (existing.hero || existing.gallery.length > 0) return existing;
  } else {
    await prisma.generatedImage.deleteMany({ where: { scrapedBusinessId } });
  }

  const business = await prisma.scrapedBusiness.findUnique({
    where: { id: scrapedBusinessId },
    include: { site: true },
  });
  if (!business) throw new Error(`ScrapedBusiness ${scrapedBusinessId} not found`);

  const ctx = buildContext(business);
  const brief = await buildImageBrief(ctx);
  const failures: { prompt: string; error: string }[] = [];

  // Hero — landscape flagship
  const heroRow = await persistIfGenerated(scrapedBusinessId, "hero", 0, brief.heroPrompt, "1536x1024", quality, failures);

  // Three section banners — all landscape, different narrative
  const banners: { purpose: SiteImagePurpose; prompt: string }[] = [
    { purpose: "banner-about", prompt: brief.aboutBannerPrompt },
    { purpose: "banner-services", prompt: brief.servicesBannerPrompt },
    { purpose: "banner-cta", prompt: brief.ctaBannerPrompt },
  ];
  const bannerRows: Partial<Record<SiteImagePurpose, { id: string }>> = {};
  for (let i = 0; i < banners.length; i++) {
    const b = banners[i];
    const row = await persistIfGenerated(scrapedBusinessId, b.purpose, i, b.prompt, "1536x1024", quality, failures);
    if (row) bannerRows[b.purpose] = row;
  }

  // Gallery — square process/detail shots
  const galleryRows: { id: string }[] = [];
  const prompts = brief.galleryPrompts.slice(0, galleryCount);
  for (let i = 0; i < prompts.length; i++) {
    const row = await persistIfGenerated(scrapedBusinessId, "gallery", i, prompts[i], "1024x1024", quality, failures);
    if (row) galleryRows.push(row);
  }

  await prisma.activityEvent.create({
    data: {
      type: "site.images_generated",
      title: `Generated site images for ${business.name}`,
      details: {
        scrapedBusinessId,
        heroGenerated: Boolean(heroRow),
        bannersGenerated: Object.keys(bannerRows).length,
        galleryGenerated: galleryRows.length,
        styleDirection: brief.styleDirection,
        failures: failures.slice(0, 5),
      },
    },
  });

  return {
    hero: rowToImg(heroRow),
    aboutBanner: rowToImg(bannerRows["banner-about"]),
    servicesBanner: rowToImg(bannerRows["banner-services"]),
    ctaBanner: rowToImg(bannerRows["banner-cta"]),
    gallery: galleryRows.map((r) => ({ id: r.id, src: `/api/generated-image/${r.id}` })),
  };
}

export async function getSiteImageSet(
  scrapedBusinessId: string,
): Promise<SiteImageSet> {
  const rows = await prisma.generatedImage.findMany({
    where: { scrapedBusinessId },
    select: { id: true, purpose: true, position: true },
    orderBy: [{ purpose: "asc" }, { position: "asc" }],
  });
  const hero = rows.find((r) => r.purpose === "hero");
  const aboutBanner = rows.find((r) => r.purpose === "banner-about");
  const servicesBanner = rows.find((r) => r.purpose === "banner-services");
  const ctaBanner = rows.find((r) => r.purpose === "banner-cta");
  const gallery = rows.filter((r) => r.purpose === "gallery");
  return {
    hero: rowToImg(hero),
    aboutBanner: rowToImg(aboutBanner),
    servicesBanner: rowToImg(servicesBanner),
    ctaBanner: rowToImg(ctaBanner),
    gallery: gallery.map((g) => ({ id: g.id, src: `/api/generated-image/${g.id}` })),
  };
}

function rowToImg(row: { id: string } | undefined | null): { id: string; src: string } | null {
  return row ? { id: row.id, src: `/api/generated-image/${row.id}` } : null;
}

async function persistIfGenerated(
  scrapedBusinessId: string,
  purpose: SiteImagePurpose,
  position: number,
  prompt: string,
  size: "1024x1024" | "1536x1024" | "1024x1536",
  quality: ImageQuality,
  failures: { prompt: string; error: string }[],
): Promise<{ id: string } | null> {
  const result = await safeGenerate({ prompt, size, quality }, failures);
  if (!result) return null;
  return prisma.generatedImage.create({
    data: {
      scrapedBusinessId,
      purpose,
      position,
      prompt,
      bytes: result.bytes,
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      model: result.model,
    },
    select: { id: true },
  });
}

function buildContext(
  business: {
    name: string;
    category: string | null;
    industry: string | null;
    city: string | null;
    state: string | null;
    site: {
      description: string | null;
      headings: unknown;
      palette: string[];
    } | null;
  },
): BusinessContext {
  const headingTexts: string[] = [];
  if (Array.isArray(business.site?.headings)) {
    for (const h of business.site.headings as unknown[]) {
      if (!h || typeof h !== "object") continue;
      const text = (h as { text?: unknown }).text;
      if (typeof text === "string" && text.trim().length > 2) {
        headingTexts.push(text.trim());
      }
    }
  }
  return {
    name: business.name,
    category: business.category,
    industry: business.industry,
    city: business.city,
    state: business.state,
    description: business.site?.description ?? null,
    headings: headingTexts,
    palette: business.site?.palette ?? [],
  };
}

async function safeGenerate(
  opts: Parameters<typeof generateImage>[0],
  failures: { prompt: string; error: string }[],
) {
  try {
    return await generateImage(opts);
  } catch (err) {
    if (err instanceof ImageModerationError) {
      console.warn("[site-image-generator] prompt blocked by safety system, retrying with generic fallback");
      try {
        return await generateImage({
          ...opts,
          prompt: genericSafePrompt(opts.size),
        });
      } catch (retryErr) {
        const msg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        console.error("[site-image-generator] fallback also failed:", msg);
        failures.push({ prompt: opts.prompt.slice(0, 80), error: `moderation+fallback:${msg.slice(0, 120)}` });
        return null;
      }
    }
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[site-image-generator] gpt-image-1 error:", msg);
    failures.push({ prompt: opts.prompt.slice(0, 80), error: msg.slice(0, 200) });
    return null;
  }
}

function genericSafePrompt(size: "1024x1024" | "1024x1536" | "1536x1024" | undefined): string {
  const wide = size === "1536x1024";
  return wide
    ? "A clean modern storefront exterior at golden hour, warm sunlight, soft shadows, welcoming architecture, no text, no logos, no people, photorealistic editorial photography."
    : "A tidy organized workbench with quality tools laid out neatly on warm wood, soft natural light, shallow depth of field, no text, no logos, no people, photorealistic editorial photography.";
}
