import { cache } from "react";
import { prisma } from "@/lib/db";
import { buildFromScrape, type RoofingSiteData } from "@/lib/templates/roofing";
import { getSiteImageSet } from "@/lib/site-image-generator";

export const loadRoofingData = cache(
  async (id: string): Promise<RoofingSiteData | null> => {
    const business = await prisma.scrapedBusiness.findUnique({
      where: { id },
      include: { site: true },
    });
    if (!business) return null;

    const generated = await getSiteImageSet(business.id);

    return buildFromScrape(
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
          }
        : null,
      generated,
    );
  },
);

export type TemplateVariant = "roofing" | "roofing2" | "roofing3" | "electrical";

export const TEMPLATE_NAV_KEY: Record<TemplateVariant, string> = {
  roofing: "roofing",
  roofing2: "roofing2",
  roofing3: "roofing3",
  electrical: "electrical",
};
