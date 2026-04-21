import { notFound } from "next/navigation";
import { loadSiteData } from "@/lib/templates/site-loader";
import {
  RoofingBanner,
  RoofingFooter,
  RoofingNav,
} from "@/components/templates/roofing/chrome";
import {
  FinalCta,
  MaterialCatalog,
  ServicesGrid,
  WarrantyTiers,
} from "@/components/templates/roofing/roof-sections";
import { MaterialCutawayBanner } from "@/components/templates/roofing/roof-banners";

export const dynamic = "force-dynamic";

export default async function RoofingServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, services, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");

  return (
    <>
      <RoofingNav business={business} id={id} current="services" />

      <RoofingBanner
        variant="page"
        eyebrow="Services"
        heroImage={hero.image}
        svg={<MaterialCutawayBanner />}
        title={
          <>
            <span className="block font-serif text-[28px] font-medium italic tracking-normal text-amber-200/85 sm:text-[36px] md:text-[44px]">
              Every roof system,
            </span>
            <span className="block">matched to the building.</span>
          </>
        }
        subtitle="Materials catalog, warranty tiers, and the full service list — in one place."
      />

      <MaterialCatalog />
      <WarrantyTiers />
      <ServicesGrid services={services} headline={headlines.services} />

      <FinalCta business={business} headline={headlines.cta} />
      <RoofingFooter business={business} loc={loc} socials={data.socials} />
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) return { title: "Services" };
  return {
    title: `Services · ${data.business.name}`,
    description: `Roof systems, warranty tiers, and the full service list from ${data.business.name}.`,
  };
}
