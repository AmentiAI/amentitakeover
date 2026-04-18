import { cache } from "react";
import { prisma } from "@/lib/db";
import { buildSiteData, type SiteData } from "@/lib/templates/site";
import { getSiteImageSet } from "@/lib/site-image-generator";

export const loadSiteData = cache(
  async (id: string): Promise<SiteData | null> => {
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
