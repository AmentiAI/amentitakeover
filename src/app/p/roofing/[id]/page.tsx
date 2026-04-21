import { notFound } from "next/navigation";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";
import {
  RoofingBanner,
  RoofingFooter,
  RoofingNav,
} from "@/components/templates/roofing/chrome";
import {
  CoverageMap,
  FinalCta,
  InspectionReport,
  LicenseBadges,
  MaterialCatalog,
  RecentProjects,
  ResilienceEditorial,
  RoofingHeroCtas,
  RoofStatBand,
  ServicesGrid,
  Testimonials,
  WarrantyTiers,
  splitHero,
} from "@/components/templates/roofing/roof-sections";
import { RoofSkylineBanner } from "@/components/templates/roofing/roof-banners";

export const dynamic = "force-dynamic";

export default async function RoofingHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, services, gallery, testimonials, serviceArea, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");
  const parts = splitHero(hero.title);

  return (
    <>
      <RoofingNav business={business} id={id} current="home" />

      <RoofingBanner
        variant="hero"
        eyebrow={hero.eyebrow || "Roofing, built to outlast the weather"}
        heroImage={hero.image}
        svg={<RoofSkylineBanner />}
        title={
          <>
            {parts.before && (
              <span className="block font-serif text-[30px] font-medium italic tracking-normal text-amber-200/85 sm:text-[40px] md:text-[48px]">
                {parts.before}
              </span>
            )}
            <span className="block">{parts.after}</span>
          </>
        }
        subtitle={hero.subtitle}
      >
        <RoofingHeroCtas
          business={business}
          rating={business.rating}
          reviewsCount={business.reviewsCount}
        />
      </RoofingBanner>

      <RoofStatBand reviewsCount={business.reviewsCount} />
      <ResilienceEditorial gallery={gallery} businessName={business.name} />
      <InspectionReport />
      <MaterialCatalog />
      <WarrantyTiers />
      {services.length > 3 && (
        <ServicesGrid services={services} headline={headlines.services} />
      )}
      <CoverageMap serviceArea={serviceArea} loc={loc} />
      <RecentProjects gallery={gallery} businessName={business.name} />
      <LicenseBadges />
      <Testimonials
        testimonials={testimonials}
        headline={headlines.testimonials}
      />
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
  const meta = await loadSiteMetadata(id);
  if (!meta) return { title: "Roofing" };
  return meta;
}
