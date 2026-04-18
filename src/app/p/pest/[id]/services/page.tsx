import { notFound } from "next/navigation";
import { loadSiteData } from "@/lib/templates/site-loader";
import { PestBanner, PestFooter, PestNav } from "@/components/templates/pest/chrome";
import {
  FinalCta,
  PestCatalog,
  ServicesGrid,
  TreatmentPlans,
  buildTreatmentPlans,
} from "@/components/templates/pest/pest-sections";

export const dynamic = "force-dynamic";

export default async function PestServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, services, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");
  const plans = buildTreatmentPlans(services);
  const callHref = business.phone ? `tel:${business.phone}` : "#";

  return (
    <>
      <PestNav business={business} id={id} current="services" />

      <PestBanner
        variant="page"
        eyebrow="Services"
        heroImage={hero.image}
        title={
          <>
            <span className="italic text-emerald-200/90">Treatment plans</span>
            <span className="block font-sans font-black uppercase tracking-tight">
              for every pressure.
            </span>
          </>
        }
        subtitle="Plans, pest-by-pest breakdowns, and the full service list — all in one place."
      />

      <TreatmentPlans
        plans={plans}
        headline={headlines.services}
        callHref={callHref}
      />
      <PestCatalog />
      <ServicesGrid services={services} callHref={callHref} />

      <FinalCta business={business} ctaHeadline={headlines.cta} />
      <PestFooter business={business} loc={loc} socials={data.socials} />
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
    description: `Treatment plans, pest catalog, and full service list from ${data.business.name}.`,
  };
}
