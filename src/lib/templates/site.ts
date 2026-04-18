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
  };
  hero: {
    title: string;
    eyebrow: string;
    subtitle: string;
    image: string | null;
  };
  banners: {
    about: string | null;
    services: string | null;
    cta: string | null;
  };
  services: { title: string; body: string }[];
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
  aboutBanner: { src: string } | null;
  servicesBanner: { src: string } | null;
  ctaBanner: { src: string } | null;
  gallery: { src: string }[];
} | null;

export function buildSiteData(
  b: ScrapedIn,
  site: SiteIn,
  generated: GeneratedImagesIn,
): SiteData {
  const images = parseImages(site?.images);
  const logoUrl = images.find(looksLikeLogo)?.src ?? null;

  const hero = generated?.hero ?? null;
  const gallery: { src: string; alt: string }[] = [];
  const seen = new Set<string>();
  for (const g of generated?.gallery ?? []) {
    if (seen.has(g.src)) continue;
    seen.add(g.src);
    gallery.push({ src: g.src, alt: `${b.name} — recent work` });
    if (gallery.length >= 12) break;
  }
  if (gallery.length === 0) FALLBACK_GALLERY.forEach((f) => gallery.push(f));

  const palette = pickBrandPalette(site?.palette ?? []) ?? FALLBACK_PALETTE;

  const trade = inferTradeLabel(b);
  const city = b.city ?? null;
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  const tagline = deriveTagline(b, site, trade);
  const short = deriveShortAbout(b, site, trade);
  const long = deriveLongAbout(b, site, trade);
  const heroTitle = deriveHeroTitle(b, site, trade);
  const heroSubtitle = deriveHeroSubtitle(b, site, trade);

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
    },
    hero: {
      eyebrow: loc ? `Serving ${loc}` : `Local ${trade}`,
      title: heroTitle,
      subtitle: heroSubtitle,
      image: hero?.src ?? null,
    },
    banners: {
      about: generated?.aboutBanner?.src ?? null,
      services: generated?.servicesBanner?.src ?? null,
      cta: generated?.ctaBanner?.src ?? null,
    },
    services: buildServices(trade, b),
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

const FALLBACK_GALLERY: { src: string; alt: string }[] = [
  { src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80", alt: "Recent work" },
  { src: "https://images.unsplash.com/photo-1565374395542-0ce18882c857?auto=format&fit=crop&w=1200&q=80", alt: "Quality craft" },
  { src: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=1200&q=80", alt: "Tools of the trade" },
  { src: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1200&q=80", alt: "Finished result" },
];

const DEFAULT_PROCESS: SiteData["process"] = [
  { step: "01", title: "Free consult", body: "We listen, inspect the site, and tell you straight — not a sales pitch." },
  { step: "02", title: "Clear quote", body: "Line-item estimate with material options. No pressure, no expiring discounts." },
  { step: "03", title: "Scheduled work", body: "Crews show up on time. Property protected, clean-up every day." },
  { step: "04", title: "Warranty & follow-up", body: "Everything we do is backed by a written warranty — and we actually answer the phone after." },
];

function looksLikeLogo(i: { src: string; alt: string }): boolean {
  return /logo|favicon|brand/i.test(i.alt) || /logo|favicon|brand/i.test(i.src);
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

function inferTradeLabel(b: ScrapedIn): string {
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

function buildServices(trade: string, b: ScrapedIn): SiteData["services"] {
  if (/roof/.test(trade)) {
    return [
      { title: "Residential Roofing", body: "Asphalt shingle, metal, and tile installations built to last decades — not until the next storm." },
      { title: "Commercial Roofing", body: "TPO, EPDM, and modified bitumen for flat and low-slope roofs with full warranty coverage." },
      { title: "Storm Damage", body: "Free inspection and insurance claim support after hail, wind, and tree damage. We work directly with your adjuster." },
      { title: "Repairs & Leaks", body: "Small problems caught early stay small. Same-week diagnostic + fix for most leaks." },
      { title: "Gutters & Downspouts", body: "Seamless aluminum, sized to your roof. Guards available." },
      { title: "Free Roof Inspection", body: "Written report, photos, and honest options — without a pressure pitch." },
    ];
  }
  if (/plumb/.test(trade)) {
    return [
      { title: "Emergency Service", body: "Burst pipes, major leaks, and clogged mains — 24/7 response across the region." },
      { title: "Water Heaters", body: "Tankless and conventional installs, repair, and annual service plans." },
      { title: "Drain & Sewer", body: "Camera inspection, hydro jetting, and trenchless repair when it's time." },
      { title: "Remodels & New Builds", body: "Rough-in through finish. Permitted, inspected, and tidy." },
      { title: "Fixtures & Faucets", body: "Swap-outs, upgrades, and new installs — brands we trust." },
      { title: "Maintenance Plans", body: "Annual check-ins to catch problems before they flood your kitchen." },
    ];
  }
  if (/hvac|heating|cool/.test(trade)) {
    return [
      { title: "AC Installation", body: "Right-sized systems, efficient models, quieter operation." },
      { title: "Heating & Furnaces", body: "High-efficiency furnaces, boilers, and heat pumps with real warranty." },
      { title: "Repair & Diagnostics", body: "Same-day service calls most of the year, 24/7 during peaks." },
      { title: "Indoor Air Quality", body: "Filtration, humidification, and duct cleaning that actually improves the air." },
      { title: "Maintenance Agreements", body: "Two visits a year, priority scheduling, discounts on parts." },
      { title: "Commercial Service", body: "Rooftop units, chillers, and full building systems supported." },
    ];
  }
  if (/electric/.test(trade)) {
    return [
      { title: "Panel Upgrades", body: "200A service upgrades, sub-panels, and modern breakers." },
      { title: "EV Chargers", body: "Level 2 home charger installs with permit and inspection." },
      { title: "Lighting & Outlets", body: "Recessed cans, under-cabinet, and new circuits — clean finish work." },
      { title: "Whole-Home Rewires", body: "Old knob-and-tube or aluminum replaced safely, one zone at a time." },
      { title: "Emergency Service", body: "Power loss, sparking, or burning smell? Same-day response." },
      { title: "Commercial Work", body: "Tenant improvements, panel swaps, and controls." },
    ];
  }
  if (/landscap|lawn|garden/.test(trade)) {
    return [
      { title: "Lawn Care", body: "Weekly mow, edge, trim, and blow with a consistent crew." },
      { title: "Design & Install", body: "Full yard design, plantings, hardscape, and lighting." },
      { title: "Hardscape", body: "Paver patios, walkways, retaining walls — built to last." },
      { title: "Irrigation", body: "New installs, repairs, and smart-controller upgrades." },
      { title: "Seasonal Clean-up", body: "Spring and fall clean-ups that leave the yard ready." },
      { title: "Landscape Lighting", body: "Low-voltage LED design and install." },
    ];
  }
  if (/paint/.test(trade)) {
    return [
      { title: "Interior Painting", body: "Prep, prime, two coats. Clean lines, tidy jobsite." },
      { title: "Exterior Painting", body: "Wash, scrape, prime, and finish-coat with manufacturer-warrantied paint." },
      { title: "Cabinet Refinishing", body: "Hand-sanded, sprayed finishes that look factory-new." },
      { title: "Drywall Repair", body: "Holes, cracks, and bad patches fixed invisibly." },
      { title: "Stain & Seal", body: "Decks, fences, and beams cleaned and sealed." },
      { title: "Color Consults", body: "On-site color matching — no guessing from a card." },
    ];
  }
  if (/salon|barber|hair/.test(trade)) {
    return [
      { title: "Cut & Style", body: "Precision cuts, blowouts, and finishing that hold." },
      { title: "Color", body: "Balayage, highlights, glosses, and color correction." },
      { title: "Extensions", body: "Hand-tied, tape-in, and keratin bond installs and maintenance." },
      { title: "Treatments", body: "Olaplex, gloss, and scalp treatments that actually work." },
      { title: "Weddings & Events", body: "Trials, day-of services, and on-site options." },
      { title: "Men's Grooming", body: "Tailored cuts, beard shaping, and straight-razor shaves." },
    ];
  }
  if (/clean/.test(trade)) {
    return [
      { title: "Recurring Clean", body: "Weekly, bi-weekly, or monthly — same crew, same standard." },
      { title: "Deep Clean", body: "Full reset of the home, top to bottom." },
      { title: "Move-in / Move-out", body: "Empty-home deep clean to get a deposit back — or start fresh." },
      { title: "Post-construction", body: "Dust, debris, and fingerprint removal after renovations." },
      { title: "Commercial Janitorial", body: "Offices, medical, and retail — after hours or on schedule." },
      { title: "Green Cleaning", body: "Kid- and pet-safe products available on request." },
    ];
  }
  if (/restaurant|cafe|food/.test(trade)) {
    return [
      { title: "Dine-in", body: "Seasonal menu in a warm, welcoming room." },
      { title: "Takeout", body: "Fast, clean packaging — same quality as the dining room." },
      { title: "Catering", body: "Events, offices, and private parties." },
      { title: "Private Events", body: "Full or partial buyouts for celebrations." },
      { title: "Gift Cards", body: "Physical and digital — a good-food kind of gift." },
      { title: "Seasonal Specials", body: "Rotating features tied to what's in season." },
    ];
  }
  if (/dent/.test(trade)) {
    return [
      { title: "Preventive Care", body: "Cleanings, exams, and x-rays — the foundation of every mouth." },
      { title: "Cosmetic Dentistry", body: "Veneers, bonding, and whitening that look natural." },
      { title: "Restorative", body: "Fillings, crowns, and bridges that hold up." },
      { title: "Orthodontics", body: "Invisalign and clear aligners for adults and teens." },
      { title: "Implants", body: "Single-tooth through full-arch — start-to-finish in one practice." },
      { title: "Emergency Care", body: "Same-day appointments for pain and breakage." },
    ];
  }
  return [
    { title: `Our Core ${capitalize(trade)} Service`, body: `${b.name}'s flagship offering — what we do better than anyone else in the region.` },
    { title: "Consultations & Estimates", body: "Free, no-pressure, written. You get our honest read, not a sales pitch." },
    { title: "Project Management", body: "One point of contact from start to finish — no getting passed around." },
    { title: "Maintenance & Follow-up", body: "We stand behind the work and return calls after the job is done." },
    { title: "Emergency Response", body: "When it can't wait, we show up fast." },
    { title: "Custom Work", body: "If it's in our lane and we can do it right, we'll quote it." },
  ];
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
