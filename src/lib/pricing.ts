// Single source of truth for Signull service packages. Any future
// checkout, proposal, or client-facing page should import from here.
// Do not duplicate these numbers — change them in one place.

export type PricingTier = {
  key: "starter" | "growth" | "ai-automation";
  name: string;
  emoji: string;
  tagline: string;
  monthly: number | null; // null = custom / quote-based
  setup: number | null;
  badge?: string;
  features: string[];
  bestFor: string;
  ctaLabel: string;
  inheritsFrom?: string; // "Everything in <tier name>"
};

export const PRICING_TIERS: PricingTier[] = [
  {
    key: "starter",
    name: "Starter",
    emoji: "🌱",
    tagline: "Perfect if you just want a professional website handled for you",
    monthly: 297,
    setup: 1497,
    features: [
      "Professionally designed 5-page website built for your brand",
      "Mobile-first design optimized for how your customers actually browse",
      "Premium hosting with fast load speeds included",
      "Security, backups, and maintenance handled for you",
      "On-page SEO foundation so customers can find you",
      "Google Business Profile setup and optimization",
      "Contact form for calls and quote requests",
      "Unlimited small updates whenever you need them",
    ],
    bestFor:
      "Businesses that need a professional online presence without the DIY headaches or agency price tag.",
    ctaLabel: "Get Started",
  },
  {
    key: "growth",
    name: "Growth",
    emoji: "🚀",
    tagline: "Designed to help your website bring in more local customers",
    monthly: 697,
    setup: 2497,
    badge: "Most Popular",
    inheritsFrom: "Starter",
    features: [
      "Landing pages targeting the cities and services you want to rank for (Carlsbad, Encinitas, Del Mar, etc.)",
      "Ongoing SEO improvements every month",
      "2–4 blog posts added monthly to grow your search rankings",
      "Google Business Profile optimization and management",
      "Lead tracking so you know exactly where your calls are coming from",
      "Conversion optimization to turn more visitors into customers",
      "Monthly performance report so you can see what's working",
    ],
    bestFor:
      "Businesses ready to turn their website into their #1 source of new customers.",
    ctaLabel: "Get More Leads",
  },
  {
    key: "ai-automation",
    name: "AI Automation",
    emoji: "🤖",
    tagline: "Turn your website into an automated lead and booking system",
    monthly: null,
    setup: null,
    inheritsFrom: "Growth",
    features: [
      "AI chatbot that responds to website visitors",
      "Automated SMS and email follow-up with new leads",
      "CRM dashboard to manage leads and customers",
      "Automated appointment booking and reminders",
      "Review and reputation automation",
    ],
    bestFor:
      "Businesses that want leads handled automatically without chasing follow-ups.",
    ctaLabel: "Book a Strategy Call",
  },
];

export function formatMonthly(tier: PricingTier): string {
  return tier.monthly == null ? "Custom" : `$${tier.monthly.toLocaleString()}`;
}

export function formatSetup(tier: PricingTier): string | null {
  if (tier.setup == null) return null;
  return `$${tier.setup.toLocaleString()}`;
}
