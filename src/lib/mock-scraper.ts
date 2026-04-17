import type { Prisma } from "@prisma/client";

const FIRST_NAMES = [
  "Justin", "Aiden", "Taylor", "Morgan", "Jordan", "Casey", "Riley", "Skyler",
  "Avery", "Drew", "Parker", "Quinn", "Reese", "Rowan", "Sawyer", "Harper",
];
const LAST_NAMES = [
  "Jackson", "Nguyen", "Rivera", "Patel", "Kim", "Sullivan", "Wright",
  "Harris", "Brooks", "Foster", "Morgan", "Hughes", "Collins", "Ellis",
];
const BIZ_SUFFIX: Record<string, string[]> = {
  Plumbing: ["Plumbing & Rooter", "Plumbing LLC", "Plumbing Inc", "Plumbing & Drain", "Plumbing Co"],
  HVAC: ["Heating & Air", "HVAC Services", "Cooling Co", "Air Conditioning"],
  Electrical: ["Electric", "Electrical Services", "Electricians"],
  Roofing: ["Roofing", "Roof Co", "Roofing Experts"],
  Landscaping: ["Landscape", "Lawn & Garden", "Landscaping Co"],
  Dentist: ["Dental", "Dental Group", "Family Dentistry"],
  "Auto Repair": ["Auto", "Automotive", "Auto Service"],
  Restaurant: ["Kitchen", "Bistro", "Grill"],
  "Coffee Shop": ["Coffee Co", "Roasters", "Cafe"],
};

export function generateMockBusinesses(params: {
  industry: string;
  location: string;
  count: number;
}): Prisma.ScrapedBusinessCreateManyInput[] {
  const rand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  const [city, state] = params.location.split(",").map((s) => s.trim());
  const suffixes = BIZ_SUFFIX[params.industry] ?? [params.industry];
  const out: Prisma.ScrapedBusinessCreateManyInput[] = [];
  const seed = Date.now() % 10000;

  for (let i = 0; i < params.count; i++) {
    const r = rand(seed + i);
    const first = FIRST_NAMES[Math.floor(rand(seed + i + 1) * FIRST_NAMES.length)];
    const last = LAST_NAMES[Math.floor(rand(seed + i + 2) * LAST_NAMES.length)];
    const suffix = suffixes[Math.floor(r * suffixes.length)];
    const name = `${first} ${last}'s ${suffix}`;
    const hasWebsite = r > 0.25;
    const rating = Math.round((1 + r * 4) * 10) / 10;
    const reviews = Math.floor(r * 500);
    const hasEmail = r > 0.4;
    const confidence = Math.floor(30 + rand(seed + i + 7) * 70);
    const hqConfidence = Math.floor(rand(seed + i + 8) * 100);
    const enriched = r > 0.35;
    const qualified = r > 0.55;
    const lat = 34 + rand(seed + i + 9) * 6;
    const lng = -122 + rand(seed + i + 10) * 6;
    const phone = `+1805${String(Math.floor(1000000 + rand(seed + i + 11) * 8999999)).slice(0, 7)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const website = hasWebsite ? `https://${slug}.example.com` : null;
    const email = hasEmail
      ? `info@${slug.slice(0, 24)}.com`
      : null;
    const social = rand(seed + i + 12);
    out.push({
      source: "google",
      name,
      category: `${params.industry} / Plumbers`,
      industry: params.industry,
      city: city ?? null,
      state: state ?? null,
      country: "USA",
      website,
      phone,
      email,
      rating,
      reviewsCount: reviews,
      confidence,
      hqConfidence,
      enriched,
      qualified,
      hasWebsite,
      lat,
      lng,
      instagram: social > 0.6 ? `https://instagram.com/${slug}` : null,
      facebook: social > 0.4 ? `https://facebook.com/${slug}` : null,
      twitter: social > 0.7 ? `https://twitter.com/${slug}` : null,
      tags: [params.industry.toLowerCase()],
    });
  }
  return out;
}
