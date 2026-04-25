/**
 * Multi-page "pro" template — the generated preview site a prospect sees.
 *
 * Shape is deliberately thin and forgiving: every section has a sensible
 * fallback so a brand-new scrape with only name+website still produces a
 * usable, polished page.
 */

import { pickBrandPalette } from "@/lib/color-pick";

export type SiteData = {
  slug: string;
  business: {
    name: string;
    tagline: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    rating: number | null;
    reviewsCount: number;
    logoUrl: string | null;
    hoursLine: string;
    trade: string;
  };
  hero: {
    title: string;
    eyebrow: string;
    subtitle: string;
    image: string | null;
    // Transparent-background mascot generated from the business name.
    // Templates overlay this on the hero canvas/photo.
    character: string | null;
  };
  banners: {
    about: string | null;
    services: string | null;
    cta: string | null;
  };
  headlines: {
    about: string;
    services: string;
    process: string;
    gallery: string;
    testimonials: string;
    cta: string;
  };
  services: { title: string; body: string; image: string | null }[];
  valueProps: { label: string; body: string }[];
  process: { step: string; title: string; body: string }[];
  gallery: { src: string; alt: string }[];
  testimonials: { quote: string; author: string; location: string; rating: number }[];
  serviceArea: string[];
  faqs: { q: string; a: string }[];
  socials: {
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    linkedin: string | null;
    tiktok: string | null;
    youtube: string | null;
  };
  palette: {
    base: string;
    accent: string;
    trust: string;
  };
  about: { short: string; long: string };
  seo: {
    title: string;
    description: string;
  };
};

type ScrapedIn = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  rating: number | null;
  reviewsCount: number;
  industry: string | null;
  category: string | null;
  instagram: string | null;
  facebook: string | null;
  twitter: string | null;
  linkedin: string | null;
  tiktok: string | null;
};

type SiteIn = {
  palette: string[];
  images: unknown;
  headings: unknown;
  textContent: string | null;
  description: string | null;
  title: string | null;
} | null;

export type GeneratedImagesIn = {
  hero: { src: string } | null;
  heroCharacter: { src: string } | null;
  aboutBanner: { src: string } | null;
  servicesBanner: { src: string } | null;
  ctaBanner: { src: string } | null;
  serviceCards: { src: string }[];
  gallery: { src: string }[];
} | null;

type HeadingEntry = { tag: string; text: string };

export function buildSiteData(
  b: ScrapedIn,
  site: SiteIn,
  generated: GeneratedImagesIn,
): SiteData {
  const images = parseImages(site?.images);
  const logoUrl = images.find(looksLikeLogo)?.src ?? null;
  const headings = parseHeadings(site?.headings);

  const hero = generated?.hero ?? null;

  // Single global set — every image slot on the page claims from here and
  // never picks a URL that's already been used. This guarantees uniqueness
  // across hero, banners, service cards, and gallery.
  const usedImages = new Set<string>();
  const claim = (src: string | null | undefined): string | null => {
    if (!src || usedImages.has(src)) return null;
    usedImages.add(src);
    return src;
  };
  const reserve = (src: string | null | undefined) => {
    if (src) usedImages.add(src);
  };

  // Reserve the purpose-built AI slots first so service cards and gallery
  // won't accidentally reuse them.
  reserve(generated?.hero?.src);
  reserve(generated?.aboutBanner?.src);
  reserve(generated?.servicesBanner?.src);
  reserve(generated?.ctaBanner?.src);

  const palette = pickBrandPalette(site?.palette ?? []) ?? FALLBACK_PALETTE;

  const trade = inferTradeLabel({ category: b.category, industry: b.industry });
  const city = b.city ?? null;
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  const tagline = deriveTagline(b, site, trade);
  const short = deriveShortAbout(b, site, trade);
  const long = deriveLongAbout(b, site, trade);
  const heroTitle = deriveHeroTitle(b, site, trade);
  const heroSubtitle = deriveHeroSubtitle(b, site, trade);

  const serviceTitles = inferServiceTitles({
    trade,
    name: b.name,
    headings: headings.map((h) => h.text),
  });
  const serviceBodies = buildServiceBodies(trade, serviceTitles, b);

  const scrapedPhotos = images.filter(isGalleryCandidate);
  const aiCardsByIndex = generated?.serviceCards ?? [];
  const aiGallery = generated?.gallery ?? [];

  // Services: each claims its purpose-built AI card first (index-matched).
  // If that specific card didn't generate, fall back to another unused AI
  // service-card (still trade-relevant), then a scraped business photo.
  // We deliberately do NOT fall back to AI gallery here — those are general
  // trade shots and pairing them with a specific service title often looks
  // like a mismatch. Better to leave the card image null and show a clean
  // accent tile than to show an unrelated photo.
  const serviceSpecificPool: string[] = [];
  for (const c of aiCardsByIndex) serviceSpecificPool.push(c.src);
  for (const img of scrapedPhotos) serviceSpecificPool.push(img.src);

  const pickServiceFallback = (): string | null => {
    for (const src of serviceSpecificPool) {
      const taken = claim(src);
      if (taken) return taken;
    }
    return null;
  };

  const services = serviceTitles.map((title, i) => {
    const matched = claim(aiCardsByIndex[i]?.src);
    return {
      title,
      body: serviceBodies[i] ?? defaultServiceBody(title, trade, b),
      image: matched ?? pickServiceFallback(),
    };
  });

  // Gallery: scraped photos first (real business, always trustworthy), then
  // remaining AI gallery shots, then any leftover AI service-card images.
  // Everything used above is skipped via usedImages.
  const gallery: { src: string; alt: string }[] = [];
  const pushGallery = (src: string | null, alt: string) => {
    const taken = claim(src);
    if (!taken) return;
    gallery.push({ src: taken, alt: alt || `${b.name} — recent work` });
  };
  for (const img of scrapedPhotos) {
    if (gallery.length >= 12) break;
    pushGallery(img.src, img.alt || `${b.name}`);
  }
  for (const g of aiGallery) {
    if (gallery.length >= 12) break;
    pushGallery(g.src, `${b.name} — recent work`);
  }
  for (const c of aiCardsByIndex) {
    if (gallery.length >= 12) break;
    pushGallery(c.src, `${b.name} — recent work`);
  }
  // Intentionally no generic Unsplash fallback — empty gallery beats
  // cross-site-repeated stock photos.

  const headlines = deriveHeadlines({ headings, trade });

  return {
    slug: b.id,
    business: {
      name: b.name,
      tagline,
      phone: b.phone,
      email: b.email,
      website: b.website,
      address: b.address,
      city: b.city,
      state: b.state,
      postalCode: b.postalCode,
      rating: b.rating,
      reviewsCount: b.reviewsCount,
      logoUrl,
      hoursLine: "Mon–Sat · 8am – 6pm",
      trade,
    },
    hero: {
      eyebrow: loc ? `Serving ${loc}` : `Local ${trade}`,
      title: heroTitle,
      subtitle: heroSubtitle,
      image: hero?.src ?? null,
      character: generated?.heroCharacter?.src ?? null,
    },
    banners: {
      about: generated?.aboutBanner?.src ?? null,
      services: generated?.servicesBanner?.src ?? null,
      cta: generated?.ctaBanner?.src ?? null,
    },
    headlines,
    services,
    valueProps: buildValueProps(b),
    process: DEFAULT_PROCESS,
    gallery,
    testimonials: buildTestimonials(b, trade, city),
    serviceArea: buildServiceArea(city, b.state),
    faqs: buildFaqs(trade, b, city),
    socials: {
      instagram: b.instagram,
      facebook: b.facebook,
      twitter: b.twitter,
      linkedin: b.linkedin,
      tiktok: b.tiktok,
      youtube: null,
    },
    palette,
    about: { short, long },
    seo: {
      title: `${b.name}${loc ? ` — ${trade} in ${loc}` : ` — ${trade}`}`,
      description: tagline,
    },
  };
}

const FALLBACK_PALETTE: SiteData["palette"] = {
  base: "#0b1120",
  accent: "#1e40af",
  trust: "#0f766e",
};

const DEFAULT_PROCESS: SiteData["process"] = [
  { step: "01", title: "Free consult", body: "We listen, inspect the site, and tell you straight — not a sales pitch." },
  { step: "02", title: "Clear quote", body: "Line-item estimate with material options. No pressure, no expiring discounts." },
  { step: "03", title: "Scheduled work", body: "Crews show up on time. Property protected, clean-up every day." },
  { step: "04", title: "Warranty & follow-up", body: "Everything we do is backed by a written warranty — and we actually answer the phone after." },
];

function looksLikeLogo(i: { src: string; alt: string }): boolean {
  return /logo|favicon|brand/i.test(i.alt) || /logo|favicon|brand/i.test(i.src);
}

// Substrings that, when present in image src/alt, indicate the image is
// chrome (icons, badges, payment logos, social glyphs) rather than real
// content. Site-builder names (wix/squarespace/shopify/etc.) are
// intentionally NOT here — those CDN hostnames embed the builder name
// (e.g. wixstatic.com), so excluding them dropped legit content imagery.
const GALLERY_EXCLUDE_RE =
  /(logo|favicon|brand|icon[-_/.]|sprite|avatar|badge|social|facebook|instagram|twitter|linkedin|youtube|tiktok|pinterest|yelp|google|bbb|angi|thumbtack|chamber|yext|bing|stars?\.|rating|trust|seal|award|mastercard|master-card|visa|amex|american[-_]?express|discover[-_]?card|diners[-_]?club|jcb|unionpay|paypal|stripe|square[-_](?:pay|cash|up)|apple[-_]?pay|google[-_]?pay|samsung[-_]?pay|venmo|cash[-_]?app|zelle|klarna|affirm|afterpay|bitcoin|crypto|cards?[-_](?:accepted|icons?|logos?)|payment[-_]?(?:methods?|icons?|logos?)|accepted[-_]?(?:cards?|payments?)|checkout|card[-_](?:brands?|icons?|logos?|types?)|powered[-_]?by|hamburger|menu[-_]?icon|chevron|arrow[-_](?:left|right|up|down)|play[-_]?button|spacer|divider|blank|placeholder|captcha|recaptcha|cloudflare|gtag|gtm|pixel[-_](?:tracker|tracking)|analytics|stock[-_]?photo|default[-_](?:image|photo|thumb)|untitled|unnamed|image[-_]?\d{0,3}\.|img[-_]?\d{0,3}\.|dsc[-_]?\d|temp[-_]?(?:image|file|upload)|new[-_]?image|copy[-_]?of|screen[-_]?shot|sloppyframe)/i;

const TINY_DIMENSION_RE = /\b(?:16|24|32|48|64|80|96)x(?:16|24|32|48|64|80|96)\b/;

export function isGalleryCandidate(i: { src: string; alt: string }): boolean {
  if (looksLikeLogo(i)) return false;
  if (GALLERY_EXCLUDE_RE.test(i.src)) return false;
  if (i.alt && GALLERY_EXCLUDE_RE.test(i.alt)) return false;
  if (/\.svg($|\?)/i.test(i.src)) return false;
  if (/\.(?:gif)($|\?)/i.test(i.src)) return false;
  if (/\/sprites?\//i.test(i.src)) return false;
  if (/\/(?:icons?|svgs?|assets\/icons?|assets\/logos?|payments?|cards?)\//i.test(i.src)) return false;
  if (TINY_DIMENSION_RE.test(i.src)) return false;
  return true;
}

function parseImages(raw: unknown): { src: string; alt: string }[] {
  if (!Array.isArray(raw)) return [];
  const out: { src: string; alt: string }[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const rec = x as { src?: unknown; alt?: unknown; kind?: unknown };
    if (rec.kind === "video") continue;
    const src = rec.src;
    if (typeof src !== "string" || !src.startsWith("http")) continue;
    const alt = typeof rec.alt === "string" ? rec.alt : "";
    out.push({ src, alt });
  }
  return out;
}

function parseHeadings(raw: unknown): HeadingEntry[] {
  if (!Array.isArray(raw)) return [];
  const out: HeadingEntry[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const rec = x as { tag?: unknown; text?: unknown };
    const tag = typeof rec.tag === "string" ? rec.tag.toLowerCase() : "";
    const text = typeof rec.text === "string" ? rec.text.trim() : "";
    if (!text) continue;
    out.push({ tag: /^h[1-6]$/.test(tag) ? tag : "h2", text });
  }
  return out;
}

export function inferTradeLabel(b: { category: string | null; industry: string | null }): string {
  const raw = (b.category ?? b.industry ?? "").toLowerCase();
  if (/roof/.test(raw)) return "roofing contractor";
  if (/plumb/.test(raw)) return "plumber";
  if (/hvac|heating|cool/.test(raw)) return "HVAC contractor";
  if (/electric/.test(raw)) return "electrician";
  if (/landscap|lawn|garden/.test(raw)) return "landscaper";
  if (/paint/.test(raw)) return "painter";
  if (/salon|barber|hair/.test(raw)) return "salon";
  if (/clean|janitor/.test(raw)) return "cleaning company";
  if (/auto|mechanic|tire/.test(raw)) return "auto shop";
  if (/restaurant|cafe|kitchen|food/.test(raw)) return "restaurant";
  if (/dent/.test(raw)) return "dental practice";
  if (/locksmith/.test(raw)) return "locksmith";
  if (raw) return raw;
  return "local business";
}

/**
 * Detect real service names from scraped headings, falling back to a canonical
 * trade list when the scraped page doesn't have enough signal.
 */
export function inferServiceTitles(args: {
  trade: string;
  name: string;
  headings: string[];
}): string[] {
  const detected = extractServiceHeadings(args.headings);
  if (detected.length >= 4) return detected.slice(0, 6);
  const canned = cannedServiceTitles(args.trade);
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const t of [...detected, ...canned]) {
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(t);
    if (merged.length >= 6) break;
  }
  return merged;
}

const NON_SERVICE_PATTERNS = [
  /^(contact|contact us|about|about us|home|our team|meet|our story|faq|faqs|frequently|testimonial|review|blog|news|press|careers?|privacy|terms|cart|shop|menu)\b/i,
  /^(why|how|what|when|where)\s/i,
  /\?$/,
  /welcome/i,
  /^get\b|^call\b|^book\b|^schedule\b|^request\b/i,
  /\d{3,}/, // phone numbers, zip codes
  /@/,
  /^(our services|services|what we do|products)$/i,
];

function extractServiceHeadings(texts: string[]): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();
  for (const raw of texts) {
    const text = cleanHeading(raw);
    if (!text) continue;
    if (text.length < 3 || text.length > 48) continue;
    if (text.split(/\s+/).length > 6) continue;
    if (NON_SERVICE_PATTERNS.some((r) => r.test(text))) continue;
    if (/^[a-z]/.test(text)) continue;
    const k = text.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    candidates.push(text);
    if (candidates.length >= 8) break;
  }
  return candidates;
}

function cleanHeading(s: string): string {
  return s.replace(/\s+/g, " ").replace(/[•·–—|]+\s*$/g, "").trim();
}

function deriveHeadlines({
  headings,
  trade,
}: {
  headings: HeadingEntry[];
  trade: string;
}): SiteData["headlines"] {
  const texts = headings.map((h) => h.text);
  const findByKeyword = (patterns: RegExp[]): string | null => {
    for (const t of texts) {
      const c = cleanHeading(t);
      if (c.length < 8 || c.length > 80) continue;
      if (patterns.some((p) => p.test(c))) return c;
    }
    return null;
  };
  return {
    about:
      findByKeyword([/^about\b/i, /who we are/i, /our story/i, /why\s+(choose|us)/i]) ||
      `Built on referrals, not ads.`,
    services:
      findByKeyword([/^our services/i, /^services we/i, /what we do/i, /what we offer/i]) ||
      `Full-service ${trade}, done right.`,
    process:
      findByKeyword([/how it works/i, /our process/i, /the process/i]) ||
      "Honest, simple process.",
    gallery:
      findByKeyword([/our work/i, /recent projects/i, /gallery/i, /portfolio/i, /case studies/i]) ||
      "Proof lives in the details.",
    testimonials:
      findByKeyword([/what.*customers say/i, /reviews/i, /testimonials/i]) ||
      "Reviews that feel like referrals.",
    cta:
      findByKeyword([/get.*(estimate|quote|started)/i, /ready to/i, /let'?s (work|talk|build)/i]) ||
      "Let's get your project on the calendar.",
  };
}

function deriveTagline(b: ScrapedIn, site: SiteIn, trade: string): string {
  const desc = cleanMeta(site?.description);
  if (desc && desc.length <= 160) return desc;
  if (desc) return truncateAtSentence(desc, 140);
  if (b.city) return `${b.city}'s trusted ${trade} — done right, on time, warrantied.`;
  return `Local ${trade} you can count on — done right, on time, warrantied.`;
}

function deriveShortAbout(b: ScrapedIn, site: SiteIn, trade: string): string {
  const desc = cleanMeta(site?.description);
  if (desc && desc.length >= 60 && desc.length <= 260) return desc;
  const city = b.city ?? "your area";
  return `${b.name} is a locally owned ${trade} serving ${city} and the surrounding region. Quality work, fair pricing, and follow-through — every job, every time.`;
}

function deriveLongAbout(b: ScrapedIn, site: SiteIn, trade: string): string {
  const text = site?.textContent ?? "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 60 && s.length < 320);
  const picked = sentences.slice(0, 4).join(" ");
  if (picked.length > 180) return picked;
  const city = b.city ?? "the region";
  return `${b.name} has served ${city} as a trusted ${trade} built on referrals and repeat customers. Every project — from the smallest repair to the largest install — gets the same careful prep, clean site, and follow-through that have made our reputation. We believe great service is boring-sounding: show up on time, do what we said, stand behind the work. That's it, and that's the whole thing.`;
}

function deriveHeroTitle(b: ScrapedIn, site: SiteIn, trade: string): string {
  const title = cleanMeta(site?.title);
  if (title && title.length >= 18 && title.length <= 80) {
    const cleaned = title.split(/\s*[\|—–·]\s*/)[0].trim();
    if (cleaned.length >= 18 && cleaned.length <= 80 && !/^\s*home\s*$/i.test(cleaned)) {
      return cleaned;
    }
  }
  if (b.city) return `${capitalize(trade)} in ${b.city} that actually shows up.`;
  return `${capitalize(trade)} that actually shows up.`;
}

function deriveHeroSubtitle(b: ScrapedIn, site: SiteIn, trade: string): string {
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  const desc = cleanMeta(site?.description);
  if (desc && desc.length >= 40 && desc.length <= 220) return desc;
  const rating = b.rating ? `${b.rating.toFixed(1)}★ rated` : "Locally owned";
  const reviews = b.reviewsCount > 0 ? ` (${b.reviewsCount} reviews)` : "";
  return loc
    ? `${rating}${reviews} ${trade} serving ${loc}. Free estimates, written quotes, warrantied work.`
    : `${rating}${reviews} ${trade}. Free estimates, written quotes, warrantied work.`;
}

function cannedServiceTitles(trade: string): string[] {
  if (/roof/.test(trade)) return ["Residential Roofing", "Commercial Roofing", "Storm Damage", "Repairs & Leaks", "Gutters & Downspouts", "Free Roof Inspection"];
  if (/plumb/.test(trade)) return ["Emergency Service", "Water Heaters", "Drain & Sewer", "Remodels & New Builds", "Fixtures & Faucets", "Maintenance Plans"];
  if (/hvac|heating|cool/.test(trade)) return ["AC Installation", "Heating & Furnaces", "Repair & Diagnostics", "Indoor Air Quality", "Maintenance Agreements", "Commercial Service"];
  if (/electric/.test(trade)) return ["Panel Upgrades", "EV Chargers", "Lighting & Outlets", "Whole-Home Rewires", "Emergency Service", "Commercial Work"];
  if (/landscap|lawn|garden/.test(trade)) return ["Lawn Care", "Design & Install", "Hardscape", "Irrigation", "Seasonal Clean-up", "Landscape Lighting"];
  if (/paint/.test(trade)) return ["Interior Painting", "Exterior Painting", "Cabinet Refinishing", "Drywall Repair", "Stain & Seal", "Color Consults"];
  if (/salon|barber|hair/.test(trade)) return ["Cut & Style", "Color", "Extensions", "Treatments", "Weddings & Events", "Men's Grooming"];
  if (/clean/.test(trade)) return ["Recurring Clean", "Deep Clean", "Move-in / Move-out", "Post-construction", "Commercial Janitorial", "Green Cleaning"];
  if (/restaurant|cafe|food/.test(trade)) return ["Dine-in", "Takeout", "Catering", "Private Events", "Gift Cards", "Seasonal Specials"];
  if (/dent/.test(trade)) return ["Preventive Care", "Cosmetic Dentistry", "Restorative", "Orthodontics", "Implants", "Emergency Care"];
  if (/auto|mechanic|tire/.test(trade)) return ["Oil & Maintenance", "Brakes", "Tires & Alignment", "Diagnostics", "A/C & Heating", "Detailing"];
  return [
    `Core ${capitalize(trade)} Service`,
    "Consultations & Estimates",
    "Project Management",
    "Maintenance & Follow-up",
    "Emergency Response",
    "Custom Work",
  ];
}

function buildServiceBodies(
  trade: string,
  titles: string[],
  b: ScrapedIn,
): string[] {
  const lookup = cannedServiceBodies(trade);
  return titles.map((t) => lookup[t.toLowerCase()] ?? defaultServiceBody(t, trade, b));
}

function cannedServiceBodies(trade: string): Record<string, string> {
  if (/roof/.test(trade)) return {
    "residential roofing": "Asphalt shingle, metal, and tile installations built to last decades — not until the next storm.",
    "commercial roofing": "TPO, EPDM, and modified bitumen for flat and low-slope roofs with full warranty coverage.",
    "storm damage": "Free inspection and insurance claim support after hail, wind, and tree damage. We work directly with your adjuster.",
    "repairs & leaks": "Small problems caught early stay small. Same-week diagnostic + fix for most leaks.",
    "gutters & downspouts": "Seamless aluminum, sized to your roof. Guards available.",
    "free roof inspection": "Written report, photos, and honest options — without a pressure pitch.",
  };
  if (/plumb/.test(trade)) return {
    "emergency service": "Burst pipes, major leaks, and clogged mains — 24/7 response across the region.",
    "water heaters": "Tankless and conventional installs, repair, and annual service plans.",
    "drain & sewer": "Camera inspection, hydro jetting, and trenchless repair when it's time.",
    "remodels & new builds": "Rough-in through finish. Permitted, inspected, and tidy.",
    "fixtures & faucets": "Swap-outs, upgrades, and new installs — brands we trust.",
    "maintenance plans": "Annual check-ins to catch problems before they flood your kitchen.",
  };
  if (/hvac|heating|cool/.test(trade)) return {
    "ac installation": "Right-sized systems, efficient models, quieter operation.",
    "heating & furnaces": "High-efficiency furnaces, boilers, and heat pumps with real warranty.",
    "repair & diagnostics": "Same-day service calls most of the year, 24/7 during peaks.",
    "indoor air quality": "Filtration, humidification, and duct cleaning that actually improves the air.",
    "maintenance agreements": "Two visits a year, priority scheduling, discounts on parts.",
    "commercial service": "Rooftop units, chillers, and full building systems supported.",
  };
  if (/electric/.test(trade)) return {
    "panel upgrades": "200A service upgrades, sub-panels, and modern breakers.",
    "ev chargers": "Level 2 home charger installs with permit and inspection.",
    "lighting & outlets": "Recessed cans, under-cabinet, and new circuits — clean finish work.",
    "whole-home rewires": "Old knob-and-tube or aluminum replaced safely, one zone at a time.",
    "emergency service": "Power loss, sparking, or burning smell? Same-day response.",
    "commercial work": "Tenant improvements, panel swaps, and controls.",
  };
  if (/landscap|lawn|garden/.test(trade)) return {
    "lawn care": "Weekly mow, edge, trim, and blow with a consistent crew.",
    "design & install": "Full yard design, plantings, hardscape, and lighting.",
    hardscape: "Paver patios, walkways, retaining walls — built to last.",
    irrigation: "New installs, repairs, and smart-controller upgrades.",
    "seasonal clean-up": "Spring and fall clean-ups that leave the yard ready.",
    "landscape lighting": "Low-voltage LED design and install.",
  };
  if (/paint/.test(trade)) return {
    "interior painting": "Prep, prime, two coats. Clean lines, tidy jobsite.",
    "exterior painting": "Wash, scrape, prime, and finish-coat with manufacturer-warrantied paint.",
    "cabinet refinishing": "Hand-sanded, sprayed finishes that look factory-new.",
    "drywall repair": "Holes, cracks, and bad patches fixed invisibly.",
    "stain & seal": "Decks, fences, and beams cleaned and sealed.",
    "color consults": "On-site color matching — no guessing from a card.",
  };
  if (/salon|barber|hair/.test(trade)) return {
    "cut & style": "Precision cuts, blowouts, and finishing that hold.",
    color: "Balayage, highlights, glosses, and color correction.",
    extensions: "Hand-tied, tape-in, and keratin bond installs and maintenance.",
    treatments: "Olaplex, gloss, and scalp treatments that actually work.",
    "weddings & events": "Trials, day-of services, and on-site options.",
    "men's grooming": "Tailored cuts, beard shaping, and straight-razor shaves.",
  };
  if (/clean/.test(trade)) return {
    "recurring clean": "Weekly, bi-weekly, or monthly — same crew, same standard.",
    "deep clean": "Full reset of the home, top to bottom.",
    "move-in / move-out": "Empty-home deep clean to get a deposit back — or start fresh.",
    "post-construction": "Dust, debris, and fingerprint removal after renovations.",
    "commercial janitorial": "Offices, medical, and retail — after hours or on schedule.",
    "green cleaning": "Kid- and pet-safe products available on request.",
  };
  if (/restaurant|cafe|food/.test(trade)) return {
    "dine-in": "Seasonal menu in a warm, welcoming room.",
    takeout: "Fast, clean packaging — same quality as the dining room.",
    catering: "Events, offices, and private parties.",
    "private events": "Full or partial buyouts for celebrations.",
    "gift cards": "Physical and digital — a good-food kind of gift.",
    "seasonal specials": "Rotating features tied to what's in season.",
  };
  if (/dent/.test(trade)) return {
    "preventive care": "Cleanings, exams, and x-rays — the foundation of every mouth.",
    "cosmetic dentistry": "Veneers, bonding, and whitening that look natural.",
    restorative: "Fillings, crowns, and bridges that hold up.",
    orthodontics: "Invisalign and clear aligners for adults and teens.",
    implants: "Single-tooth through full-arch — start-to-finish in one practice.",
    "emergency care": "Same-day appointments for pain and breakage.",
  };
  return {};
}

function defaultServiceBody(title: string, trade: string, b: ScrapedIn): string {
  const lower = title.toLowerCase();
  if (/emergency|24|hour|urgent/.test(lower))
    return `When it can't wait, ${b.name} responds fast — same day for most of the region.`;
  if (/consult|quote|estimate|inspect/.test(lower))
    return "Free, no-pressure, written. You get our honest read, not a sales pitch.";
  if (/warranty|maintenance|follow/.test(lower))
    return "We stand behind the work and return calls after the job is done.";
  if (/custom|special/.test(lower))
    return `If it's in our lane and we can do it right, we'll quote it.`;
  return `Professional ${title.toLowerCase()} from ${b.name} — clean process, clear pricing, ${trade} expertise you can count on.`;
}

function buildValueProps(b: ScrapedIn): SiteData["valueProps"] {
  return [
    { label: "Licensed & Insured", body: "Fully licensed, bonded, and insured — every crew, every job." },
    { label: "Written Warranty", body: "Workmanship + materials backed by a warranty you can hold in your hand." },
    { label: "Same-Day Quotes", body: "Most estimates back the same day — with options, not pressure." },
    { label: b.rating ? `${b.rating.toFixed(1)}★ Rated` : "Locally Trusted", body: b.reviewsCount > 0 ? `Over ${b.reviewsCount} reviews from real customers.` : "Referrals and repeat customers are our main source of work." },
  ];
}

function buildTestimonials(b: ScrapedIn, trade: string, city: string | null): SiteData["testimonials"] {
  const location = city ? `${city}${b.state ? `, ${b.state}` : ""}` : "Verified customer";
  return [
    {
      quote: `Great experience from quote to finish. ${capitalize(trade)} work was exactly what was promised, crew was respectful, and clean-up was perfect.`,
      author: "A.M.",
      location,
      rating: 5,
    },
    {
      quote: "Responsive, fair pricing, and they stood behind their warranty when we had a small follow-up question. Would hire again tomorrow.",
      author: "J.R.",
      location,
      rating: 5,
    },
    {
      quote: `We'd been burned by a previous contractor and were nervous. ${b.name} earned our trust quickly — and we've sent two neighbors their way since.`,
      author: "S.T.",
      location,
      rating: 5,
    },
  ];
}

function buildServiceArea(city: string | null, state: string | null): string[] {
  if (!city || !state) return ["Your Region"];
  return [
    `${city}, ${state}`,
    `Greater ${city}`,
    `${city} Metro`,
    `${state} Statewide`,
  ].slice(0, 4);
}

function buildFaqs(trade: string, b: ScrapedIn, city: string | null): SiteData["faqs"] {
  const loc = city ?? "your area";
  return [
    { q: "Are you licensed and insured?", a: `Yes. ${b.name} is fully licensed, bonded, and insured in every region we serve.` },
    { q: "Do you offer free estimates?", a: "Yes — on-site, written, and pressure-free. Most estimates are back within 24 hours." },
    { q: `How soon can you start?`, a: `Most non-emergency ${trade} projects in ${loc} can be scheduled within 1–2 weeks of signing.` },
    { q: "What warranty do you offer?", a: "Manufacturer warranty on materials plus our own workmanship warranty in writing. Specifics vary by project." },
    { q: "Do you handle insurance claims?", a: "Yes — for any storm/damage-related work, we support your claim with documentation and photos." },
    { q: `What areas do you serve?`, a: `We serve ${loc} and the surrounding region. Call to confirm if you're outside our primary area.` },
  ];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function cleanMeta(s: string | null | undefined): string | null {
  if (!s) return null;
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > 0 ? t : null;
}

function truncateAtSentence(s: string, limit: number): string {
  if (s.length <= limit) return s;
  const cut = s.slice(0, limit);
  const lastStop = Math.max(cut.lastIndexOf("."), cut.lastIndexOf("!"), cut.lastIndexOf("?"));
  if (lastStop > 60) return cut.slice(0, lastStop + 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[,;:]\s*$/, "") + "…";
}
