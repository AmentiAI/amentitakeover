import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RoofingTemplate } from "@/components/templates/roofing";
import { buildFromScrape } from "@/lib/templates/roofing";
import { getSiteImageSet } from "@/lib/site-image-generator";

export default async function RoofingBusinessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const business = await prisma.scrapedBusiness.findUnique({
    where: { id },
    include: { site: true },
  });

  if (!business) notFound();

  const generated = await getSiteImageSet(business.id);

  const data = buildFromScrape(
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

  return <RoofingTemplate data={data} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const b = await prisma.scrapedBusiness.findUnique({ where: { id }, select: { name: true, city: true, state: true } });
  if (!b) return { title: "Roofing contractor" };
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  return {
    title: `${b.name} — Roofing contractor${loc ? ` in ${loc}` : ""}`,
    description: `${b.name} provides roofing services${loc ? ` in ${loc}` : ""}. Licensed, bonded, insured. Free inspection.`,
  };
}
