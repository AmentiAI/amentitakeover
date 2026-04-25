import { cache } from "react";
import { prisma } from "@/lib/db";
import { buildSiteData, type SiteData } from "@/lib/templates/site";
import { getSiteImageSet } from "@/lib/site-image-generator";

// Sentinel id used to render a template with no real business — pulls in
// the SVG defaults via getSiteImageSet (DB empty for this id) and synthetic
// neutral copy. Used by /outreach/templates "Default preview" links.
const DEFAULT_PREVIEW_PREFIX = "default";

function isDefaultPreviewId(id: string): boolean {
  return id === DEFAULT_PREVIEW_PREFIX || id.startsWith(`${DEFAULT_PREVIEW_PREFIX}-`);
}

function tradeFromDefaultId(id: string): "roofing" | "pest" | null {
  const suffix = id === DEFAULT_PREVIEW_PREFIX ? "" : id.slice(DEFAULT_PREVIEW_PREFIX.length + 1);
  if (suffix === "roofing") return "roofing";
  if (suffix === "pest") return "pest";
  return null;
}

export const loadSiteData = cache(
  async (id: string): Promise<SiteData | null> => {
    if (isDefaultPreviewId(id)) {
      // DB has no rows for this id → getSiteImageSet returns the SVG defaults.
      const generated = await getSiteImageSet(id);
      return buildSampleSiteData(tradeFromDefaultId(id), generated);
    }

    const business = await prisma.scrapedBusiness.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!business) return null;

    const generated = await getSiteImageSet(business.id);

    return buildSiteData(
      {
        id: business.id,
        name: business.name,
        phone: business.phone,
        email: business.email,
        website: business.website,
        address: business.address,
        city: business.city,
        state: business.state,
        postalCode: business.postalCode,
        rating: business.rating,
        reviewsCount: business.reviewsCount,
        industry: business.industry,
        category: business.category,
        instagram: business.instagram,
        facebook: business.facebook,
        twitter: business.twitter,
        linkedin: business.linkedin,
        tiktok: business.tiktok,
      },
      business.site
        ? {
            palette: business.site.palette,
            images: business.site.images,
            headings: business.site.headings,
            textContent: business.site.textContent,
            description: business.site.description,
            title: business.site.title,
          }
        : null,
      generated,
    );
  },
);

export async function loadSiteMetadata(
  id: string,
): Promise<{ title: string; description: string } | null> {
  if (isDefaultPreviewId(id)) {
    const trade = tradeFromDefaultId(id);
    const label = trade === "roofing" ? "Roofing" : trade === "pest" ? "Pest Control" : "Local Services";
    return {
      title: `Demo ${label} — template preview`,
      description: `Default preview of the ${label.toLowerCase()} template with placeholder content.`,
    };
  }
  const b = await prisma.scrapedBusiness.findUnique({
    where: { id },
    select: { name: true, city: true, state: true },
  });
  if (!b) return null;
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  return {
    title: `${b.name}${loc ? ` — ${loc}` : ""}`,
    description: `${b.name}${loc ? ` in ${loc}` : ""}. Licensed, bonded, insured. Free estimates, written quotes.`,
  };
}

function buildSampleSiteData(
  trade: "roofing" | "pest" | null,
  generated: Awaited<ReturnType<typeof getSiteImageSet>>,
): SiteData {
  const name =
    trade === "roofing"
      ? "Demo Roofing Co."
      : trade === "pest"
        ? "Demo Pest Control"
        : "Demo Local Services";
  const industry = trade === "roofing" ? "roofing" : trade === "pest" ? "pest control" : null;
  return buildSiteData(
    {
      id: "default",
      name,
      phone: "(555) 555-0123",
      email: "hello@demo.example",
      website: "https://demo.example",
      address: "123 Main Street",
      city: "Austin",
      state: "TX",
      postalCode: "78701",
      rating: 4.9,
      reviewsCount: 84,
      industry,
      category: null,
      instagram: null,
      facebook: null,
      twitter: null,
      linkedin: null,
      tiktok: null,
    },
    null,
    generated,
  );
}
