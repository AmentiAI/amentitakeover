/**
 * Roofing site template — data contract + adapter.
 *
 * The template renders from `RoofingSiteData`. Two producers exist:
 *   1. `buildFromScrape()` — merges a ScrapedBusiness + Site (+ deep-scrape
 *      pages) into template props, falling back to sensible defaults when
 *      fields are missing.
 *   2. `DEMO_DATA` — a static placeholder for design review.
 *
 * Template is deliberately forgiving: missing phones/emails/images all
 * degrade gracefully so a brand-new scrape (name + website only) still
 * produces a usable page.
 */

import { pickBrandPalette } from "@/lib/color-pick";

export type RoofingSiteData = {
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
    yearsInBusiness: number | null;
    logoUrl: string | null;
    hoursLine: string;
  };
  hero: {
    title: string;
    subtitle: string;
    image: string | null;
    alertBanner: string | null;
  };
  services: { title: string; body: string; icon: ServiceIcon }[];
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
  about: string;
};

export type ServiceIcon =
  | "residential"
  | "commercial"
  | "repair"
  | "storm"
  | "gutters"
  | "inspection";

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1632154502515-ec74e928baaa?auto=format&fit=crop&w=2400&q=80";

const FALLBACK_GALLERY: { src: string; alt: string }[] = [
  { src: "https://images.unsplash.com/photo-1632154502515-ec74e928baaa?auto=format&fit=crop&w=1200&q=80", alt: "Full roof replacement" },
  { src: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=80", alt: "Residential shingle roof" },
  { src: "https://images.unsplash.com/photo-1625231334168-35067f8853ed?auto=format&fit=crop&w=1200&q=80", alt: "Commercial flat roof" },
  { src: "https://images.unsplash.com/photo-1558036117-15d82a90b9b1?auto=format&fit=crop&w=1200&q=80", alt: "Metal roofing install" },
  { src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=1200&q=80", alt: "Storm damage repair" },
  { src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80", alt: "Roof inspection" },
];

const DEFAULT_SERVICES: RoofingSiteData["services"] = [
  {
    icon: "residential",
    title: "Residential Roofing",
    body: "Asphalt shingle, metal, and tile roof installations built to last decades — not until the next storm.",
  },
  {
    icon: "commercial",
    title: "Commercial Roofing",
    body: "TPO, EPDM and modified bitumen for flat and low-slope roofs with full warranty coverage.",
  },
  {
    icon: "storm",
    title: "Storm Damage Restoration",
    body: "Free inspection and insurance claim support after hail, wind, and tree damage. We work directly with your adjuster.",
  },
  {
    icon: "repair",
    title: "Repairs & Leak Fixes",
    body: "Same-week repair for leaks, missing shingles, flashing failures and pipe boots.",
  },
  {
    icon: "gutters",
    title: "Gutters & Downspouts",
    body: "Seamless gutter systems, leaf guards and proper drainage — because a roof is only as good as the water path off it.",
  },
  {
    icon: "inspection",
    title: "Free Roof Inspection",
    body: "24-point inspection with photo report delivered the same day. No pressure, no obligation.",
  },
];

const DEFAULT_PROCESS: RoofingSiteData["process"] = [
  { step: "01", title: "Free Inspection", body: "We climb up, take photos, and give you a written report — not a sales pitch." },
  { step: "02", title: "Clear Estimate", body: "Line-item quote with material options. No pressure, no expiring discounts." },
  { step: "03", title: "Install", body: "Crews arrive on time. Property protected, debris hauled, daily clean-up." },
  { step: "04", title: "Warranty", body: "Manufacturer warranty on materials + our own workmanship warranty — in writing." },
];

const DEFAULT_FAQS: RoofingSiteData["faqs"] = [
  { q: "How long does a new roof take?", a: "Most residential roofs are completed in one to two days once materials arrive on-site." },
  { q: "Will my insurance cover it?", a: "If the damage is storm- or hail-related, most policies cover replacement. We help you document and file the claim." },
  { q: "Do you handle permits?", a: "Yes — we pull all permits and schedule inspections directly with your city so you don't have to." },
  { q: "What warranty do I get?", a: "A manufacturer warranty on the materials (often 25–50 years) plus a workmanship warranty from us in writing." },
  { q: "Is financing available?", a: "Yes. We partner with financing providers for 0% and low-APR options so you can replace your roof before the next storm." },
];

const DEFAULT_TESTIMONIALS: RoofingSiteData["testimonials"] = [
  { quote: "Full roof replaced in a day and a half. They handled the insurance claim start to finish.", author: "Maria G.", location: "homeowner", rating: 5 },
  { quote: "Got three quotes — these guys were the only ones who actually went in the attic. Clear pricing and no surprises.", author: "David R.", location: "homeowner", rating: 5 },
  { quote: "Responsive, clean, professional. Property manager for 14 units — they handled every one.", author: "Alan P.", location: "property manager", rating: 5 },
];

// ----- Adapter: produce RoofingSiteData from a ScrapedBusiness + optional Site -----

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
  images: unknown; // Json — expected shape { src, alt? }[]
  headings: unknown; // Json — expected shape { tag, text }[]
  textContent: string | null;
  description: string | null;
  title: string | null;
} | null;

export type GeneratedImagesIn = {
  hero: { src: string } | null;
  gallery: { src: string }[];
} | null;

export function buildFromScrape(
  b: ScrapedIn,
  site: SiteIn,
  generated?: GeneratedImagesIn,
): RoofingSiteData {
  const images = parseImages(site?.images);

  // Logo is the only scraped image we keep — shown in the nav. Hero and
  // gallery come from AI-generated imagery so the mockup looks on-brand
  // and consistent, not whatever random stock the business had on their
  // old site.
  const logoUrl = images.find((i) => looksLikeLogo(i))?.src ?? null;

  const generatedGallery = generated?.gallery ?? [];
  const generatedHero = generated?.hero ?? null;

  // Prefer AI-generated imagery when present, but fall back to curated stock
  // so the mockup never renders with a blank hero or empty gallery — that
  // looks broken to a prospect.
  const heroPick = generatedHero
    ? { src: generatedHero.src, alt: `${b.name} — feature image` }
    : { src: FALLBACK_HERO, alt: `${b.name} — feature image` };

  const gallery: { src: string; alt: string }[] = [];
  const seen = new Set<string>();
  for (const g of generatedGallery) {
    if (seen.has(g.src)) continue;
    seen.add(g.src);
    gallery.push({ src: g.src, alt: `${b.name} — recent work` });
    if (gallery.length >= 12) break;
  }
  if (gallery.length === 0) {
    for (const f of FALLBACK_GALLERY) {
      gallery.push(f);
    }
  }

  const palette = derivePalette(site?.palette ?? []);

  const businessCity = b.city ?? null;
  const serviceArea = buildServiceArea(businessCity, b.state);

  const tagline = deriveTagline(b, site);
  const about = deriveAbout(b, site);

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
      yearsInBusiness: null,
      logoUrl,
      hoursLine: "Mon–Sat · 7am – 7pm",
    },
    hero: {
      title: deriveHeroTitle(b, site),
      subtitle: deriveHeroSubtitle(b, site),
      image: heroPick?.src ?? null,
      alertBanner: null,
    },
    services: DEFAULT_SERVICES,
    process: DEFAULT_PROCESS,
    gallery,
    testimonials: DEFAULT_TESTIMONIALS,
    serviceArea,
    faqs: DEFAULT_FAQS,
    socials: {
      instagram: b.instagram,
      facebook: b.facebook,
      twitter: b.twitter,
      linkedin: b.linkedin,
      tiktok: b.tiktok,
      youtube: null,
    },
    palette,
    about,
  };
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
    if (isJunkImage(src, alt)) continue;
    out.push({ src, alt });
  }
  return out;
}

const TEMPLATE_JUNK_RE =
  /(now[-_\s]?hiring|we'?re[-_\s]?hiring|hiring(?![a-z])|careers?|join[-_\s]?(our[-_\s]?)?team|apply[-_\s]?now|visa|mastercard|paypal|homeadvisor|home[-_\s]?advisor|angies?[-_\s]?list|thumbtack|houzz|trustpilot|yelp|bbb|facebook|instagram|twitter|tiktok|linkedin|pinterest|youtube)/i;

function isJunkImage(src: string, alt: string): boolean {
  return TEMPLATE_JUNK_RE.test(`${src} ${alt}`);
}

function looksLikeLogo(i: { src: string; alt: string }): boolean {
  return /logo|favicon|brand/i.test(i.alt) || /logo|favicon|brand/i.test(i.src);
}

// Fallback palette when the scraped site offers no usable brand colors.
const ROOFING_PALETTE: RoofingSiteData["palette"] = {
  base: "#0f172a",
  accent: "#b45309",
  trust: "#0f766e",
};

function derivePalette(colors: string[]): RoofingSiteData["palette"] {
  return pickBrandPalette(colors) ?? ROOFING_PALETTE;
}

function buildServiceArea(city: string | null, state: string | null): string[] {
  const base = [city, state].filter(Boolean).join(", ");
  if (!city || !state) return ["Your Region"];
  // Fan out: primary + nearby-sounding placeholders keyed off the city.
  return [
    base,
    `Greater ${city}`,
    `${city} Metro`,
    `${state} Statewide`,
  ].slice(0, 4);
}

function deriveTagline(b: ScrapedIn, site: SiteIn): string {
  // Prefer the meta description the business wrote for their own site — that's
  // how they already describe themselves. Trim if it's too long for a tagline.
  const desc = cleanMetaText(site?.description);
  if (desc) {
    if (desc.length <= 160) return desc;
    return truncateAtSentence(desc, 140);
  }
  if (b.city) return `${b.city}'s trusted roofing contractor since day one.`;
  return "Roofing done right. The first time.";
}

function deriveHeroTitle(b: ScrapedIn, site: SiteIn): string {
  // If their own title tag contains a real headline (not just brand+location),
  // use it verbatim — that's copy they've already signed off on.
  const title = cleanMetaText(site?.title);
  if (title && title.length >= 18 && title.length <= 80) {
    // strip trailing brand/pipe segments: "Best Roof | Denver CO | Acme Co"
    const cleaned = title.split(/\s*[\|—–·]\s*/)[0].trim();
    if (cleaned.length >= 18 && cleaned.length <= 80 && !/^\s*home\s*$/i.test(cleaned)) {
      return cleaned;
    }
  }
  if (b.city) return `Your roof, built to outlast the next ${b.state || b.city} storm.`;
  return "Your roof, built to outlast the next storm.";
}

function deriveHeroSubtitle(b: ScrapedIn, site: SiteIn): string {
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  const desc = cleanMetaText(site?.description);
  if (desc && desc.length >= 40 && desc.length <= 220) return desc;
  const rating = b.rating ? `${b.rating.toFixed(1)}★ rated` : "Family-owned";
  const reviews = b.reviewsCount > 0 ? ` (${b.reviewsCount} reviews)` : "";
  return loc
    ? `${rating}${reviews} roofing in ${loc}. Free inspection, written estimate, insurance-friendly.`
    : `${rating}${reviews}. Free inspection, written estimate, insurance-friendly.`;
}

function cleanMetaText(s: string | null | undefined): string | null {
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

function deriveAbout(b: ScrapedIn, site: SiteIn): string {
  const text = site?.textContent ?? "";
  // Try to pull a reasonable intro paragraph from scraped text.
  const cleaned = text
    .replace(/\s+/g, " ")
    .trim();
  const first = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 60 && s.length < 300).slice(0, 2).join(" ");
  if (first.length > 80) return first;
  const city = b.city ?? "your area";
  return `We're a locally owned roofing company serving ${city} and the surrounding region. From a leaking skylight to a full tear-off, every job gets the same crew discipline, clean-up and warranty that's made repeat customers and referrals our main source of work.`;
}

// ----- Demo data (used by /p/roofing/demo) -----

export const DEMO_DATA: RoofingSiteData = {
  slug: "demo",
  business: {
    name: "Ironclad Roofing Co.",
    tagline: "Denver's most-referred roofing crew since 2011.",
    phone: "(720) 555-0144",
    email: "hello@ironcladroofing.co",
    website: "https://ironcladroofing.co",
    address: "4210 Oak St, Denver, CO 80205",
    city: "Denver",
    state: "CO",
    postalCode: "80205",
    rating: 4.9,
    reviewsCount: 312,
    yearsInBusiness: 14,
    logoUrl: null,
    hoursLine: "Mon–Sat · 7am – 7pm",
  },
  hero: {
    title: "Your roof, built to outlast the next Colorado storm.",
    subtitle: "4.9★ rated (312 reviews) in Denver, CO. Free inspection, written estimate, insurance-friendly.",
    image: FALLBACK_HERO,
    alertBanner: "Hail storm in Denver this week? We offer same-day free inspections.",
  },
  services: DEFAULT_SERVICES,
  process: DEFAULT_PROCESS,
  gallery: FALLBACK_GALLERY,
  testimonials: DEFAULT_TESTIMONIALS,
  serviceArea: ["Denver, CO", "Aurora, CO", "Lakewood, CO", "Boulder, CO"],
  faqs: DEFAULT_FAQS,
  socials: {
    instagram: "https://instagram.com/ironcladroofing",
    facebook: "https://facebook.com/ironcladroofing",
    twitter: null,
    linkedin: null,
    tiktok: null,
    youtube: null,
  },
  palette: ROOFING_PALETTE,
  about:
    "Ironclad Roofing Co. is a family-owned roofing company serving Denver and the Front Range since 2011. From a leaking skylight to a full tear-off, every job gets the same crew discipline, clean-up and warranty. Our business has grown almost entirely on referrals — and we'd like to keep it that way.",
};
