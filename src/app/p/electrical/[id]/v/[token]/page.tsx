import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ElectricalTemplate } from "@/components/templates/electrical";
import { buildElectricalFromScrape } from "@/lib/templates/electrical";
import { recordSiteView } from "@/lib/site-tracking";

export const dynamic = "force-dynamic";

export default async function ElectricalBusinessTrackedPage({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id, token } = await params;

  const business = await prisma.scrapedBusiness.findUnique({
    where: { id },
    include: { site: true },
  });

  if (!business) notFound();

  await recordSiteView({
    scrapedBusinessId: business.id,
    template: "electrical",
    trackingToken: token,
  });

  const data = buildElectricalFromScrape(
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
  );

  return <ElectricalTemplate data={data} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; token: string }>;
}) {
  const { id } = await params;
  const b = await prisma.scrapedBusiness.findUnique({
    where: { id },
    select: { name: true, city: true, state: true },
  });
  if (!b) return { title: "Electrical contractor" };
  const loc = [b.city, b.state].filter(Boolean).join(", ");
  return {
    title: `${b.name} — Licensed electrician${loc ? ` in ${loc}` : ""}`,
    description: `${b.name} provides licensed electrical services${loc ? ` in ${loc}` : ""}. 24/7 emergency, panel upgrades, EV chargers. Request dispatch.`,
  };
}
