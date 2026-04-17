import { prisma } from "@/lib/db";
import { buildImageBrief, type BusinessContext } from "@/lib/image-prompt";
import { generateImage, type ImageQuality } from "@/lib/openai-image";

/**
 * Generate a matched set of mockup-site images (hero + gallery) for a
 * scraped business. Persists raw PNG bytes to GeneratedImage rows so the
 * template can reference them via /api/generated-image/:id.
 *
 * Idempotent: if the business already has generated images and `force` is
 * not set, returns the existing set untouched.
 */

export type SiteImageSet = {
  hero: { id: string; src: string } | null;
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

  const hero = await safeGenerate({
    prompt: brief.heroPrompt,
    size: "1536x1024",
    quality,
  });
  let heroRow: { id: string } | null = null;
  if (hero) {
    heroRow = await prisma.generatedImage.create({
      data: {
        scrapedBusinessId,
        purpose: "hero",
        position: 0,
        prompt: brief.heroPrompt,
        bytes: hero.bytes,
        mimeType: hero.mimeType,
        width: hero.width,
        height: hero.height,
        model: hero.model,
      },
      select: { id: true },
    });
  }

  const galleryRows: { id: string }[] = [];
  const prompts = brief.galleryPrompts.slice(0, galleryCount);
  for (let i = 0; i < prompts.length; i++) {
    const result = await safeGenerate({
      prompt: prompts[i],
      size: "1024x1024",
      quality,
    });
    if (!result) continue;
    const row = await prisma.generatedImage.create({
      data: {
        scrapedBusinessId,
        purpose: "gallery",
        position: i,
        prompt: prompts[i],
        bytes: result.bytes,
        mimeType: result.mimeType,
        width: result.width,
        height: result.height,
        model: result.model,
      },
      select: { id: true },
    });
    galleryRows.push(row);
  }

  await prisma.activityEvent.create({
    data: {
      type: "site.images_generated",
      title: `Generated site images for ${business.name}`,
      details: {
        scrapedBusinessId,
        heroGenerated: Boolean(heroRow),
        galleryGenerated: galleryRows.length,
        styleDirection: brief.styleDirection,
      },
    },
  });

  return {
    hero: heroRow ? { id: heroRow.id, src: `/api/generated-image/${heroRow.id}` } : null,
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
  const heroRow = rows.find((r) => r.purpose === "hero");
  const gallery = rows.filter((r) => r.purpose === "gallery");
  return {
    hero: heroRow ? { id: heroRow.id, src: `/api/generated-image/${heroRow.id}` } : null,
    gallery: gallery.map((g) => ({ id: g.id, src: `/api/generated-image/${g.id}` })),
  };
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

async function safeGenerate(opts: Parameters<typeof generateImage>[0]) {
  try {
    return await generateImage(opts);
  } catch (err) {
    // swallow & log — one failure shouldn't nuke the whole set
    console.error("[site-image-generator] gpt-image-1 error:", err);
    return null;
  }
}
