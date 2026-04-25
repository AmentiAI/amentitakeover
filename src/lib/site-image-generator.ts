import { prisma } from "@/lib/db";
import { buildImageBrief, type BusinessContext } from "@/lib/image-prompt";
import { generateImage, ImageModerationError, type ImageQuality } from "@/lib/openai-image";
import { inferServiceTitles, inferTradeLabel } from "@/lib/templates/site";
import {
  DEFAULT_BANNER_ABOUT,
  DEFAULT_BANNER_CTA,
  DEFAULT_BANNER_SERVICES,
  DEFAULT_GALLERY,
  DEFAULT_SERVICE_CARDS,
} from "@/lib/template-defaults";
import { isBlobConfigured, uploadBytesToBlob } from "@/lib/blob-storage";

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
  | "hero-character"
  | "banner-about"
  | "banner-services"
  | "banner-cta"
  | "service-card"
  | "gallery";

export type SiteImageSet = {
  hero: { id: string; src: string } | null;
  // Transparent-background mascot/character generated from the business name.
  // Rendered as an overlay on top of each template's hero canvas/image.
  heroCharacter: { id: string; src: string } | null;
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
    size: "1024x1024" | "1536x1024" | "1024x1536";
    background?: "auto" | "transparent";
    useBlob?: boolean;
  };
  const jobs: Job[] = [
    { key: "hero", purpose: "hero", position: 0, prompt: brief.heroPrompt, size: "1536x1024" },
    // Character generation disabled — pest/roofing templates rely on canvas
    // and SVG for hero visuals; logo (or CSS text logo) covers brand.
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
    persistIfGenerated(
      scrapedBusinessId,
      job.purpose,
      job.position,
      job.prompt,
      job.size,
      quality,
      failures,
      job.background,
      job.useBlob,
    ),
  );

  type RowResult = { id: string; blobUrl: string | null };
  const byKey = new Map<string, RowResult | null>();
  jobs.forEach((j, i) => byKey.set(j.key, results[i]));

  const heroRow = byKey.get("hero") ?? null;
  const heroCharacterRow = byKey.get("hero-character") ?? null;
  const bannerRows: Partial<Record<SiteImagePurpose, RowResult>> = {};
  if (byKey.get("banner-about")) bannerRows["banner-about"] = byKey.get("banner-about")!;
  if (byKey.get("banner-services")) bannerRows["banner-services"] = byKey.get("banner-services")!;
  if (byKey.get("banner-cta")) bannerRows["banner-cta"] = byKey.get("banner-cta")!;

  const serviceCardRows: RowResult[] = [];
  for (let i = 0; i < DEFAULT_SERVICE_CARD_COUNT; i++) {
    const row = byKey.get(`service-card-${i}`);
    if (row) serviceCardRows.push(row);
  }
  const galleryRows: RowResult[] = [];
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
    heroCharacter: rowToImg(heroCharacterRow),
    aboutBanner: rowToImg(bannerRows["banner-about"]),
    servicesBanner: rowToImg(bannerRows["banner-services"]),
    ctaBanner: rowToImg(bannerRows["banner-cta"]),
    serviceCards: serviceCardRows.map((r) => ({ id: r.id, src: srcFromRow(r) })),
    gallery: galleryRows.map((r) => ({ id: r.id, src: srcFromRow(r) })),
  };
}

export async function getSiteImageSet(
  scrapedBusinessId: string,
): Promise<SiteImageSet> {
  const rows = await prisma.generatedImage.findMany({
    where: { scrapedBusinessId },
    select: { id: true, purpose: true, position: true, blobUrl: true },
    orderBy: [{ purpose: "asc" }, { position: "asc" }],
  });
  const hero = rows.find((r) => r.purpose === "hero");
  const heroCharacter = rows.find((r) => r.purpose === "hero-character");
  const aboutBanner = rows.find((r) => r.purpose === "banner-about");
  const servicesBanner = rows.find((r) => r.purpose === "banner-services");
  const ctaBanner = rows.find((r) => r.purpose === "banner-cta");
  const serviceCards = rows.filter((r) => r.purpose === "service-card");
  const gallery = rows.filter((r) => r.purpose === "gallery");
  return withDefaults({
    hero: rowToImg(hero),
    heroCharacter: rowToImg(heroCharacter),
    aboutBanner: rowToImg(aboutBanner),
    servicesBanner: rowToImg(servicesBanner),
    ctaBanner: rowToImg(ctaBanner),
    serviceCards: serviceCards.map((g) => ({ id: g.id, src: srcFromRow(g) })),
    gallery: gallery.map((g) => ({ id: g.id, src: srcFromRow(g) })),
  });
}

// Generates ONLY the transparent-bg hero character. Cheap (~1 image call),
// idempotent unless `force` is set. Used by /api/build so each Build click
// can produce a name-driven mascot without paying for the full 16-image set.
export async function generateHeroCharacter(
  scrapedBusinessId: string,
  opts?: { force?: boolean; quality?: ImageQuality },
): Promise<{ id: string; blobUrl: string | null; prompt: string } | null> {
  const business = await prisma.scrapedBusiness.findUnique({
    where: { id: scrapedBusinessId },
    include: { site: true },
  });
  if (!business) throw new Error(`ScrapedBusiness ${scrapedBusinessId} not found`);

  if (opts?.force) {
    await prisma.generatedImage.deleteMany({
      where: { scrapedBusinessId, purpose: "hero-character" },
    });
  } else {
    const existing = await prisma.generatedImage.findFirst({
      where: { scrapedBusinessId, purpose: "hero-character" },
      select: { id: true, blobUrl: true, prompt: true },
    });
    if (existing) return existing;
  }

  const ctx = buildContext(business);
  const prompt = buildCharacterPrompt(ctx);
  const failures: { prompt: string; error: string }[] = [];
  const row = await persistIfGenerated(
    scrapedBusinessId,
    "hero-character",
    0,
    prompt,
    "1024x1536",
    opts?.quality ?? "high",
    failures,
    "transparent",
    true,
  );
  if (!row) {
    const err = failures[0]?.error ?? "image generation failed";
    throw new Error(err);
  }
  return { id: row.id, blobUrl: row.blobUrl, prompt };
}

function rowToImg(
  row: { id: string; blobUrl?: string | null } | undefined | null,
): { id: string; src: string } | null {
  return row ? { id: row.id, src: srcFromRow(row) } : null;
}

function srcFromRow(row: { id: string; blobUrl?: string | null }): string {
  return row.blobUrl ? row.blobUrl : `/api/generated-image/${row.id}`;
}

function withDefaults(set: SiteImageSet): SiteImageSet {
  const def = (id: string, src: string) => ({ id, src });
  return {
    hero: set.hero,
    // No SVG fallback for the character — hero just renders without it.
    heroCharacter: set.heroCharacter,
    aboutBanner: set.aboutBanner ?? def("default-banner-about", DEFAULT_BANNER_ABOUT),
    servicesBanner: set.servicesBanner ?? def("default-banner-services", DEFAULT_BANNER_SERVICES),
    ctaBanner: set.ctaBanner ?? def("default-banner-cta", DEFAULT_BANNER_CTA),
    serviceCards: set.serviceCards.length
      ? set.serviceCards
      : DEFAULT_SERVICE_CARDS.map((src, i) => def(`default-service-${i + 1}`, src)),
    gallery: set.gallery.length
      ? set.gallery
      : DEFAULT_GALLERY.map((src, i) => def(`default-gallery-${i + 1}`, src)),
  };
}

async function persistIfGenerated(
  scrapedBusinessId: string,
  purpose: SiteImagePurpose,
  position: number,
  prompt: string,
  size: "1024x1024" | "1536x1024" | "1024x1536",
  quality: ImageQuality,
  failures: { prompt: string; error: string }[],
  background: "auto" | "transparent" = "auto",
  useBlob: boolean = false,
): Promise<{ id: string; blobUrl: string | null } | null> {
  const result = await safeGenerate({ prompt, size, quality, background }, failures);
  if (!result) return null;

  let blobUrl: string | null = null;
  if (useBlob && isBlobConfigured()) {
    try {
      const ext = extFromMime(result.mimeType);
      const pathname = `generated-images/${scrapedBusinessId}/${purpose}-${position}-${Date.now()}.${ext}`;
      blobUrl = await uploadBytesToBlob({
        pathname,
        bytes: result.bytes,
        contentType: result.mimeType,
      });
    } catch (err) {
      // Blob upload failure shouldn't lose the image — fall back to bytes.
      console.error("[site-image-generator] blob upload failed:", err);
    }
  }

  const row = await prisma.generatedImage.create({
    data: {
      scrapedBusinessId,
      purpose,
      position,
      prompt,
      bytes: blobUrl ? null : Buffer.from(result.bytes),
      blobUrl,
      mimeType: result.mimeType,
      width: result.width,
      height: result.height,
      model: result.model,
    },
    select: { id: true, blobUrl: true },
  });
  return { id: row.id, blobUrl: row.blobUrl };
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

// Builds a brand-mascot prompt anchored on the business name and trade so the
// character feels purpose-built for this specific company. Strict transparent-
// background instructions because we composite the cutout over each template's
// hero canvas — any solid background would frame it as a sticker.
function buildCharacterPrompt(ctx: BusinessContext): string {
  const trade = (ctx.industry || ctx.category || "local services").toLowerCase();
  const tradeOutfit = pickTradeOutfit(trade);
  // gpt-image-2 doesn't accept the `background` API param, so transparency
  // has to live in the prompt. We over-specify the cutout intent and ask
  // for PNG so any alpha the model produces survives.
  return [
    `Subject: a friendly cartoon mascot character representing "${ctx.name}".`,
    `${tradeOutfit}.`,
    "Full body, three-quarter front pose, professional brand illustration",
    "with bold clean linework, modern flat-design shading, vibrant brand",
    "colors. Friendly approachable expression — small smile, eye contact",
    "with the viewer. Centered in the frame with generous empty space",
    "the character must not touch the edges of the canvas.",
    "",
    "Make the background behind the character true transparency.",
  ].join(" ");
}

// Maps a sniffed mime-type back to the file extension we should use when
// uploading to blob storage. Defaults to `bin` so a future format we don't
// recognize still gets a sane URL — the actual content-type header is what
// drives browser rendering.
function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

function pickTradeOutfit(trade: string): string {
  if (/roof/.test(trade)) {
    return "A cheerful roofer in a hard hat, work boots, and tool belt, holding a roofing hammer";
  }
  if (/pest|extermin|termite/.test(trade)) {
    return "A cheerful exterminator in a clean uniform with a small spray-applicator wand, holding a clipboard";
  }
  if (/plumb/.test(trade)) {
    return "A cheerful plumber in coveralls with a wrench in one hand and a clipboard in the other";
  }
  if (/electric/.test(trade)) {
    return "A cheerful electrician in a polo shirt with a tool belt, holding a voltage tester";
  }
  if (/hvac|heating|cooling|air/.test(trade)) {
    return "A cheerful HVAC technician in a uniform with a service tablet and a small refrigerant gauge";
  }
  if (/landsc|lawn|garden|tree/.test(trade)) {
    return "A cheerful landscaper in a polo shirt, holding small pruning shears, with a smile";
  }
  if (/clean/.test(trade)) {
    return "A cheerful cleaner in a tidy uniform with a microfiber cloth and spray bottle";
  }
  if (/paint/.test(trade)) {
    return "A cheerful painter in white coveralls holding a paint brush and a color swatch fan";
  }
  return "A cheerful service professional in a polo shirt, holding a clipboard, with a friendly smile";
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
