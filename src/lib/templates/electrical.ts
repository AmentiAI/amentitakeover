/**
 * Electrical contractor template — data contract + adapter.
 */

import { pickBrandPalette } from "@/lib/color-pick";

export type ElectricalSiteData = {
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
    licenseNumber: string | null;
  };
  hero: {
    title: string;
    subtitle: string;
    image: string | null;
    alertBanner: string | null;
  };
  services: { title: string; body: string; icon: ElectricalIcon }[];
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
  };
  about: string;
};

export type ElectricalIcon =
  | "residential"
  | "commercial"
  | "panel"
  | "ev"
  | "generator"
  | "lighting"
  | "emergency"
  | "surge";

// Fallback when the scraped site offers no usable brand colors.
const ELECTRICAL_PALETTE: ElectricalSiteData["palette"] = {
  base: "#0f172a",
  accent: "#0369a1",
};

function derivePalette(colors: string[]): ElectricalSiteData["palette"] {
  const picked = pickBrandPalette(colors);
  if (!picked) return ELECTRICAL_PALETTE;
  return { base: picked.base, accent: picked.accent };
}

const FALLBACK_HERO =
  "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=2400&q=80";

const FALLBACK_GALLERY: { src: string; alt: string }[] = [
  { src: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1600&q=80", alt: "Electrical panel upgrade" },
  { src: "https://images.unsplash.com/photo-1607435097405-db48f377bff6?auto=format&fit=crop&w=1600&q=80", alt: "Modern lighting install" },
  { src: "https://images.unsplash.com/photo-1624961935081-f7aafe4b8a16?auto=format&fit=crop&w=1600&q=80", alt: "EV charger installation" },
  { src: "https://images.unsplash.com/photo-1581092918484-8313cd82a78f?auto=format&fit=crop&w=1600&q=80", alt: "Commercial electrical" },
  { src: "https://images.unsplash.com/photo-1565608087341-404b25492fee?auto=format&fit=crop&w=1600&q=80", alt: "Residential wiring" },
  { src: "https://images.unsplash.com/photo-1568322445389-f64ac2515099?auto=format&fit=crop&w=1600&q=80", alt: "Backup generator" },
];

const DEFAULT_SERVICES: ElectricalSiteData["services"] = [
  {
    icon: "panel",
    title: "Panel Upgrades",
    body: "100A → 200A service upgrades, sub-panels, and full panel replacements. Permits pulled, inspection passed.",
  },
  {
    icon: "ev",
    title: "EV Charger Installation",
    body: "Level 2 home chargers sized to your panel. Tesla, ChargePoint, and universal J1772 installs.",
  },
  {
    icon: "residential",
    title: "Residential Wiring",
    body: "New circuits, outlet and switch installs, rewires, and troubleshooting for homes of any age.",
  },
  {
    icon: "commercial",
    title: "Commercial Electrical",
    body: "Tenant build-outs, emergency lighting, three-phase service, and preventive maintenance contracts.",
  },
  {
    icon: "generator",
    title: "Generators & Backup Power",
    body: "Whole-home standby generator installs, transfer switches, and battery backup systems.",
  },
  {
    icon: "lighting",
    title: "Lighting & LED Retrofits",
    body: "Recessed can installs, dimmable LED retrofits, smart switches, and exterior lighting design.",
  },
  {
    icon: "emergency",
    title: "24/7 Emergency Service",
    body: "On-call master electrician for dead circuits, power outages, smoke, sparks, and burning smells.",
  },
  {
    icon: "surge",
    title: "Whole-Home Surge Protection",
    body: "Panel-mounted surge protectors to guard electronics, HVAC, and appliances from utility spikes.",
  },
];

const DEFAULT_PROCESS: ElectricalSiteData["process"] = [
  { step: "01", title: "Dispatch", body: "Licensed electrician scheduled same or next day — no four-hour windows." },
  { step: "02", title: "Diagnose", body: "We locate the fault, identify code issues, and explain options in plain language." },
  { step: "03", title: "Fix", body: "Work done to NEC code with permits and utility coordination when required." },
  { step: "04", title: "Verify", body: "Meter readings, load testing, and a written report on what was done and why." },
];

const DEFAULT_FAQS: ElectricalSiteData["faqs"] = [
  { q: "Do you pull permits?", a: "Yes — any service upgrade, new circuit, or rewire gets a permit. We schedule the inspection with your city directly." },
  { q: "How long does a panel upgrade take?", a: "A standard 100A → 200A upgrade takes one working day once the utility coordinates the disconnect." },
  { q: "Do I need to be home during the inspection?", a: "Typically yes, so we can walk through every circuit and confirm what's on it. Plan on about an hour." },
  { q: "Are you licensed and insured?", a: "Fully licensed master electrician, bonded, and carrying $2M general liability plus workers' comp." },
  { q: "Do you offer financing for larger jobs?", a: "Yes — 0% APR and low-monthly options on panel upgrades, generators, and EV chargers." },
];

const DEFAULT_TESTIMONIALS: ElectricalSiteData["testimonials"] = [
  { quote: "Diagnosed a 30-year wiring issue in 15 minutes that two other electricians missed. Fixed it the same afternoon.", author: "Priya N.", location: "homeowner", rating: 5 },
  { quote: "Full panel upgrade, permit, inspection, and Tesla charger installed in a single day. Clean work.", author: "Marcus L.", location: "homeowner", rating: 5 },
  { quote: "Our tenant build-out had a deadline we were going to miss. They added a second crew and we opened on time.", author: "Jordan A.", location: "property manager", rating: 5 },
];

// ----- Adapter -----

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
} | null;

export type GeneratedImagesIn = {
  hero: { src: string } | null;
  gallery: { src: string }[];
} | null;

export function buildElectricalFromScrape(
  b: ScrapedIn,
  site: SiteIn,
  generated?: GeneratedImagesIn,
): ElectricalSiteData {
  const images = parseImages(site?.images);

  // Only the scraped logo carries over — hero and gallery come from the
  // AI-generated set so the mockup's imagery looks intentional and on-brand.
  const logoUrl = images.find((i) => looksLikeLogo(i))?.src ?? null;

  const generatedGallery = generated?.gallery ?? [];
  const generatedHero = generated?.hero ?? null;

  const heroPick = generatedHero
    ? { src: generatedHero.src, alt: `${b.name} — feature image` }
    : null;

  const gallery: { src: string; alt: string }[] = [];
  const seen = new Set<string>();
  for (const g of generatedGallery) {
    if (seen.has(g.src)) continue;
    seen.add(g.src);
    gallery.push({ src: g.src, alt: `${b.name} — recent work` });
    if (gallery.length >= 12) break;
  }

  const city = b.city ?? null;
  const serviceArea = buildServiceArea(city, b.state);

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
      hoursLine: "Mon–Fri · 7am – 7pm · 24/7 emergency",
      licenseNumber: null,
    },
    hero: {
      title: deriveHeroTitle(b),
      subtitle: deriveHeroSubtitle(b),
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
    palette: derivePalette(site?.palette ?? []),
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

function buildServiceArea(city: string | null, state: string | null): string[] {
  if (!city || !state) return ["Your Region"];
  return [
    `${city}, ${state}`,
    `Greater ${city}`,
    `${city} Metro`,
    `${state} Statewide`,
  ].slice(0, 4);
}

function deriveTagline(b: ScrapedIn, site: SiteIn): string {
  if (site?.description && site.description.length > 0 && site.description.length < 140) {
    return site.description;
  }
  if (b.city) return `${b.city}'s licensed master electrician — done right the first time.`;
  return "Licensed master electrician. Done right the first time.";
}

function deriveHeroTitle(b: ScrapedIn): string {
  if (b.city) return `The licensed electrician ${b.city} calls when it has to be right.`;
  return "The licensed electrician you call when it has to be right.";
}

function deriveHeroSubtitle(b: ScrapedIn): string {
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  const rating = b.rating ? `${b.rating.toFixed(1)}★ rated` : "Family-owned";
  const reviews = b.reviewsCount > 0 ? ` (${b.reviewsCount} reviews)` : "";
  return loc
    ? `${rating}${reviews} master electrician in ${loc}. Same-day service, permits pulled, work inspected.`
    : `${rating}${reviews}. Same-day service, permits pulled, work inspected.`;
}

function deriveAbout(b: ScrapedIn, site: SiteIn): string {
  const text = site?.textContent ?? "";
  const cleaned = text.replace(/\s+/g, " ").trim();
  const first = cleaned
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 60 && s.length < 300)
    .slice(0, 2)
    .join(" ");
  if (first.length > 80) return first;
  const city = b.city ?? "your area";
  return `A licensed electrical contractor serving ${city} and the surrounding region. From a dead outlet to a full service upgrade, every job is permitted, inspected, and backed by a written workmanship warranty. We're built on repeat customers and referrals — and we'd like to keep it that way.`;
}

// ----- Demo -----

export const DEMO_ELECTRICAL_DATA: ElectricalSiteData = {
  slug: "demo",
  business: {
    name: "Voltline Electrical Co.",
    tagline: "Denver's licensed master electricians since 2009.",
    phone: "(720) 555-0188",
    email: "dispatch@voltline.co",
    website: "https://voltline.co",
    address: "1820 Larimer St, Denver, CO 80202",
    city: "Denver",
    state: "CO",
    postalCode: "80202",
    rating: 4.9,
    reviewsCount: 248,
    yearsInBusiness: 16,
    logoUrl: null,
    hoursLine: "Mon–Fri · 7am – 7pm · 24/7 emergency",
    licenseNumber: "CO-EC-0084212",
  },
  hero: {
    title: "The licensed electrician Denver calls when it has to be right.",
    subtitle: "4.9★ rated (248 reviews) master electrician in Denver, CO. Same-day service, permits pulled, work inspected.",
    image: FALLBACK_HERO,
    alertBanner: null,
  },
  services: DEFAULT_SERVICES,
  process: DEFAULT_PROCESS,
  gallery: FALLBACK_GALLERY,
  testimonials: DEFAULT_TESTIMONIALS,
  serviceArea: ["Denver, CO", "Aurora, CO", "Lakewood, CO", "Boulder, CO"],
  faqs: DEFAULT_FAQS,
  socials: {
    instagram: "https://instagram.com/voltline",
    facebook: "https://facebook.com/voltline",
    twitter: null,
    linkedin: "https://linkedin.com/company/voltline",
    tiktok: null,
    youtube: null,
  },
  palette: ELECTRICAL_PALETTE,
  about:
    "Voltline is a licensed master electrical contractor serving Denver and the Front Range since 2009. From a dead outlet to whole-home rewires, every job is permitted, inspected, and backed by a written workmanship warranty. Our business has grown almost entirely on referrals — and we'd like to keep it that way.",
};
