import { notFound } from "next/navigation";
import { loadSiteData } from "@/lib/templates/site-loader";
import {
  RoofingBanner,
  RoofingFooter,
  RoofingNav,
} from "@/components/templates/roofing/chrome";
import {
  AboutEditorial,
  FinalCta,
  InspectionReport,
  LicenseBadges,
  ProcessSteps,
  Testimonials,
} from "@/components/templates/roofing/roof-sections";
import { CrewOnRidgeBanner } from "@/components/templates/roofing/roof-banners";

export const dynamic = "force-dynamic";

export default async function RoofingAboutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, about, process, testimonials, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");

  return (
    <>
      <RoofingNav business={business} id={id} current="about" />

      <RoofingBanner
        variant="page"
        eyebrow="About"
        heroImage={hero.image}
        svg={<CrewOnRidgeBanner />}
        title={
          <>
            <span className="block font-serif text-[28px] font-medium italic tracking-normal text-amber-200/85 sm:text-[36px] md:text-[44px]">
              The crew behind the ridge.
            </span>
            <span className="block">Built on referrals.</span>
          </>
        }
        subtitle="Who we are, how we work, and the credentials behind every install."
      />

      <AboutEditorial
        business={business}
        about={about}
        headline={headlines.about}
      />
      <ProcessSteps process={process} headline={headlines.process} />
      <InspectionReport />
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
  const data = await loadSiteData(id);
  if (!data) return { title: "About" };
  return {
    title: `About · ${data.business.name}`,
    description: `How ${data.business.name} approaches roofing — crew, process, and credentials.`,
  };
}
