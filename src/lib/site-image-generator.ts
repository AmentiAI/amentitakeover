import { prisma } from "@/lib/db";
import { buildImageBrief, type BusinessContext } from "@/lib/image-prompt";
import { generateImage, ImageModerationError, type ImageQuality } from "@/lib/openai-image";
import { inferServiceTitles, inferTradeLabel } from "@/lib/templates/site";

/**
 * Generate a matched set of mockup-site images for a scraped business.
 * Produces:
 *   - 1 hero (landscape)
 *   - 3 section banners (about / services / cta, landscape)
 *   - 6 service-card images (one per service, square)
 *   - 6 gallery images (square)
 * = 16 images total, all matched visually and tied to the business's real
 * scraped services + page content.
 *
 * Idempotent unless `force` is set.
 */

export type SiteImagePurpose =
  | "hero"
  | "banner-about"
  | "banner-services"
  | "banner-cta"
  | "service-card"
  | "gallery";

export type SiteImageSet = {
  hero: { id: string; src: string } | null;
  aboutBanner: { id: string; src: string } | null;
  servicesBanner: { id: string; src: string } | null;
  ctaBanner: { id: string; src: string } | null;
  serviceCards: { id: string; src: string }[];
  gallery: { id: string; src: string }[];
};

const DEFAULT_GALLERY_COUNT = 6;
const DEFAULT_SERVICE_CARD_COUNT = 6;

export async function generateSiteImages(
  scrapedBusinessId: string,
  opts?: { force?: boolean; quality?: ImageQuality; galleryCount?: number },
): Promise<SiteImageSet> {
  const force = opts?.force ?? false;
  const quality: ImageQuality = opts?.quality ?? "high";
  const galleryCount = opts?.galleryCount ?? DEFAULT_GALLERY_COUNT;

  if (!force) {
    const existing = await getSiteImageSet(scrapedBusinessId);
    if (existing.hero || existing.gallery.length > 0 || existing.serviceCards.length > 0) {
      return existing;
    }
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

  // Run image generation in parallel with a small concurrency cap so we
  // finish well under the serverless 60s cap but don't hammer OpenAI.
  // Sequential gen of 16 images was timing out the function and causing
  // the client to receive a non-JSON platform error page.
  type Job = {
    key: string;
    purpose: SiteImagePurpose;
    position: number;
    prompt: string;
    size: "1024x1024" | "1536x1024";
  };
  const jobs: Job[] = [
    { key: "hero", purpose: "hero", position: 0, prompt: brief.heroPrompt, size: "1536x1024" },
    { key: "banner-about", purpose: "banner-about", position: 0, prompt: brief.aboutBannerPrompt, size: "1536x1024" },
    { key: "banner-services", purpose: "banner-services", position: 1, prompt: brief.servicesBannerPrompt, size: "1536x1024" },
    { key: "banner-cta", purpose: "banner-cta", position: 2, prompt: brief.ctaBannerPrompt, size: "1536x1024" },
    ...brief.serviceCardPrompts.slice(0, DEFAULT_SERVICE_CARD_COUNT).map((prompt, i) => ({
      key: `service-card-${i}`,
      purpose: "service-card" as SiteImagePurpose,
      position: i,
      prompt,
      size: "1024x1024" as const,
    })),
    ...brief.galleryPrompts.slice(0, galleryCount).map((prompt, i) => ({
      key: `gallery-${i}`,
      purpose: "gallery" as SiteImagePurpose,
      position: i,
      prompt,
      size: "1024x1024" as const,
    })),
  ];

  const results = await runParallel(jobs, 6, (job) =>
    persistIfGenerated(scrapedBusinessId, job.purpose, job.position, job.prompt, job.size, quality, failures),
  );

  const byKey = new Map<string, { id: string } | null>();
  jobs.forEach((j, i) => byKey.set(j.key, results[i]));

  const heroRow = byKey.get("hero") ?? null;
  const bannerRows: Partial<Record<SiteImagePurpose, { id: string }>> = {};
  if (byKey.get("banner-about")) bannerRows["banner-about"] = byKey.get("banner-about")!;
  if (byKey.get("banner-services")) bannerRows["banner-services"] = byKey.get("banner-services")!;
  if (byKey.get("banner-cta")) bannerRows["banner-cta"] = byKey.get("banner-cta")!;

  const serviceCardRows: { id: string }[] = [];
  for (let i = 0; i < DEFAULT_SERVICE_CARD_COUNT; i++) {
    const row = byKey.get(`service-card-${i}`);
    if (row) serviceCardRows.push(row);
  }
  const galleryRows: { id: string }[] = [];
  for (let i = 0; i < galleryCount; i++) {
    const row = byKey.get(`gallery-${i}`);
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
        serviceCardsGenerated: serviceCardRows.length,
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
    serviceCards: serviceCardRows.map((r) => ({ id: r.id, src: `/api/generated-image/${r.id}` })),
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
  const serviceCards = rows.filter((r) => r.purpose === "service-card");
  const gallery = rows.filter((r) => r.purpose === "gallery");
  return {
    hero: rowToImg(hero),
    aboutBanner: rowToImg(aboutBanner),
    servicesBanner: rowToImg(servicesBanner),
    ctaBanner: rowToImg(ctaBanner),
    serviceCards: serviceCards.map((g) => ({ id: g.id, src: `/api/generated-image/${g.id}` })),
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
      textContent: string | null;
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
  const trade = inferTradeLabel({
    category: business.category,
    industry: business.industry,
  });
  const serviceTitles = inferServiceTitles({
    trade,
    name: business.name,
    headings: headingTexts,
  }).slice(0, 6);
  return {
    name: business.name,
    category: business.category,
    industry: business.industry,
    city: business.city,
    state: business.state,
    description: business.site?.description ?? null,
    headings: headingTexts,
    palette: business.site?.palette ?? [],
    textContent: business.site?.textContent ?? null,
    serviceTitles,
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
    console.error("[site-image-generator] image gen error:", msg);
    failures.push({ prompt: opts.prompt.slice(0, 80), error: msg.slice(0, 200) });
    return null;
  }
}

// Run up to `concurrency` promises at a time, preserving input order in
// the output array. A single failing job becomes null in its slot rather
// than rejecting the whole batch — matches the existing "failures array"
// error-handling contract.
async function runParallel<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R | null>,
): Promise<(R | null)[]> {
  const out: (R | null)[] = new Array(items.length).fill(null);
  let cursor = 0;
  async function worker() {
    while (true) {
      const i = cursor++;
      if (i >= items.length) return;
      try {
        out[i] = await fn(items[i], i);
      } catch {
        out[i] = null;
      }
    }
  }
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return out;
}

function genericSafePrompt(size: "1024x1024" | "1024x1536" | "1536x1024" | undefined): string {
  const wide = size === "1536x1024";
  return wide
    ? "A clean modern storefront exterior at golden hour, warm sunlight, soft shadows, welcoming architecture, no text, no logos, no people, photorealistic editorial photography."
    : "A tidy organized workbench with quality tools laid out neatly on warm wood, soft natural light, shallow depth of field, no text, no logos, no people, photorealistic editorial photography.";
}
