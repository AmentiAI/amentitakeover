// Single source of truth for Signull / Amenti service packages.
//
// Pricing is organized by SERVICE CATEGORY. Each category has a set of
// fixed tiers plus a perpetual "Custom" option for enterprise / bespoke
// scoping. Any future checkout, proposal, or client-facing page should
// import from here — don't duplicate numbers or feature lists elsewhere.

export type PricingUnit = "one-time" | "monthly";

export type PricingTier = {
  key: string;
  name: string;
  tagline?: string;
  // When `null`, price is quote-based / custom.
  price: number | null;
  unit: PricingUnit;
  badge?: string;
  features: string[];
  custom?: boolean;
};

export type ServiceKey = "website" | "social" | "seo";

export type PricingService = {
  key: ServiceKey;
  name: string;
  tagline: string;
  emoji: string;
  tiers: PricingTier[];
};

export const PRICING_SERVICES: PricingService[] = [
  {
    key: "website",
    name: "Website Design Package",
    tagline: "Professional website design that delivers measurable results.",
    emoji: "🔍",
    tiers: [
      {
        key: "website-business",
        name: "Business",
        price: 800,
        unit: "one-time",
        features: [
          "Logo",
          "Service Pages (5)",
          "Company Pages (4)",
          "Mobile-responsive design",
        ],
      },
      {
        key: "website-premium",
        name: "Premium Business",
        price: 1800,
        unit: "one-time",
        badge: "Popular",
        features: [
          "Logo",
          "Service Pages (10)",
          "Company Pages (4)",
          "Blog setup + 3 starter posts",
          "Booking / lead-capture integration",
          "Analytics + performance tuning",
        ],
      },
      {
        key: "website-enterprise",
        name: "Enterprise",
        price: 2500,
        unit: "one-time",
        features: [
          "Logo",
          "Service Pages (20)",
          "Company Pages (4)",
          "E-commerce or advanced booking",
          "Multi-location / multi-brand support",
          "Premium hosting with CDN",
          "Custom animations + interactions",
        ],
      },
      {
        key: "website-custom",
        name: "Custom",
        price: null,
        unit: "one-time",
        custom: true,
        features: [
          "Scoped to your exact build",
          "Custom integrations + API work",
          "Migration from legacy platforms",
          "Quote delivered within 48 hours",
        ],
      },
    ],
  },
  {
    key: "social",
    name: "Social Media Marketing",
    tagline: "Professional social media marketing that delivers measurable results.",
    emoji: "🔍",
    tiers: [
      {
        key: "social-starter",
        name: "Starter",
        price: 1200,
        unit: "monthly",
        features: [
          "8–12 social media posts per month",
          "Caption writing + hashtag strategy",
          "Custom branded graphics",
          "1 platform managed end-to-end",
          "Monthly content calendar",
          "Basic analytics report",
          "Monthly strategy check-in",
        ],
      },
      {
        key: "social-growth",
        name: "Growth",
        price: 2500,
        unit: "monthly",
        features: [
          "15–20 posts per month",
          "Higher-quality graphics + light video edits",
          "1 paid ad campaign setup & management",
          "2–3 platforms managed",
          "Monthly engagement + growth report",
        ],
      },
      {
        key: "social-premium",
        name: "Premium",
        price: 4500,
        unit: "monthly",
        features: [
          "30+ posts per month (near-daily content)",
          "Short-form videos (Reels / TikToks / Shorts)",
          "Daily engagement & community management",
          "Multi-platform coverage",
          "Ongoing paid ad management + optimization",
          "Dedicated strategist + weekly check-ins",
        ],
      },
      {
        key: "social-custom",
        name: "Custom",
        price: null,
        unit: "monthly",
        custom: true,
        features: [
          "Scoped to platform, cadence, and volume",
          "Influencer outreach + UGC programs",
          "Custom analytics dashboard",
          "Quote delivered within 48 hours",
        ],
      },
    ],
  },
  {
    key: "seo",
    name: "SEO Services",
    tagline: "Professional SEO services that deliver measurable results.",
    emoji: "🔍",
    tiers: [
      {
        key: "seo-starter",
        name: "Starter",
        tagline: "For starting companies",
        price: 500,
        unit: "monthly",
        features: [
          "Comprehensive website audit & SEO health report",
          "Keyword research (up to 10 primary keywords)",
          "On-page SEO optimization (meta tags, titles, headings, alt texts)",
          "Google Search Console setup",
          "Page-speed + Core Web Vitals pass",
          "Monthly ranking report",
          "Competitor snapshot",
        ],
      },
      {
        key: "seo-growth",
        name: "Growth",
        tagline: "For established companies with employees and revenue",
        price: 1500,
        unit: "monthly",
        badge: "Popular",
        features: [
          "Advanced keyword research (up to 30 target keywords)",
          "On-page + off-page SEO strategy",
          "Local SEO optimization (Maps, directories, local citations)",
          "Backlink building campaign",
          "Schema markup + technical SEO fixes",
          "Content optimization on existing pages",
          "Monthly strategy call + reporting",
        ],
      },
      {
        key: "seo-dominate",
        name: "Dominate",
        tagline: "For high-end businesses in very competitive markets",
        price: 5000,
        unit: "monthly",
        features: [
          "Advanced keyword clustering (100+ keywords)",
          "Full content strategy (blogs, pillar pages, internal linking)",
          "Dedicated account manager & strategy sessions",
          "Digital PR + authority link building",
          "Conversion rate optimization on key pages",
          "Enterprise technical SEO audits",
          "Weekly performance reports",
        ],
      },
      {
        key: "seo-custom",
        name: "Custom",
        price: null,
        unit: "monthly",
        custom: true,
        features: [
          "Scoped to market, geography, and competitive pressure",
          "International or multi-site SEO programs",
          "Custom reporting dashboards",
          "Quote delivered within 48 hours",
        ],
      },
    ],
  },
];

export function formatTierPrice(tier: PricingTier): string {
  if (tier.price == null) return "Custom";
  return `$${tier.price.toLocaleString()}`;
}

export function formatTierUnit(tier: PricingTier): string {
  if (tier.price == null) return "Quote-based";
  return tier.unit === "monthly" ? "/month" : "one-time";
}

// Flat list of all non-custom tiers across services. Useful for affiliate
// commission math where every closed deal — regardless of category — pays
// the same percentage.
export function allPricedTiers(): (PricingTier & { serviceKey: ServiceKey })[] {
  const out: (PricingTier & { serviceKey: ServiceKey })[] = [];
  for (const s of PRICING_SERVICES) {
    for (const t of s.tiers) {
      if (t.price != null) out.push({ ...t, serviceKey: s.key });
    }
  }
  return out;
}
