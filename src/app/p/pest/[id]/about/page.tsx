import { notFound } from "next/navigation";
import { loadSiteData } from "@/lib/templates/site-loader";
import { PestBanner, PestFooter, PestNav } from "@/components/templates/pest/chrome";
import {
  BarrierSection,
  FinalCta,
  InspectionReport,
  LicenseBadges,
  ThreatAssessment,
} from "@/components/templates/pest/pest-sections";

export const dynamic = "force-dynamic";

export default async function PestAboutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, about, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");

  return (
    <>
      <PestNav business={business} id={id} current="about" />

      <PestBanner
        variant="page"
        eyebrow="About"
        heroImage={hero.image}
        title={
          <>
            <span className="italic text-emerald-200/90">How we work</span>
            <span className="block font-sans font-black uppercase tracking-tight">
              behind the barrier.
            </span>
          </>
        }
        subtitle="Our approach, our inspection process, and the credentials behind every visit."
      />

      <BarrierSection />
      <ThreatAssessment
        headline={headlines.about}
        aboutShort={about.short}
        aboutLong={about.long}
        loc={loc}
      />
      <InspectionReport />
      <LicenseBadges />

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
  if (!data) return { title: "About" };
  return {
    title: `About · ${data.business.name}`,
    description: `How ${data.business.name} approaches pest control — inspection, barrier, and licensing.`,
  };
}
