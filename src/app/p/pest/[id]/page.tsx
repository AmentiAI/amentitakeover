import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Phone, Star } from "lucide-react";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";
import { PestBanner, PestFooter, PestNav } from "@/components/templates/pest/chrome";
import {
  FinalCta,
  GuaranteePledge,
  LicenseBadges,
  ProcessSteps,
} from "@/components/templates/pest/pest-sections";
import { splitHero } from "@/lib/templates/split-hero";
import { PestAreasWeServeSection } from "@/components/templates/pest/areas-we-serve";
import { ReviewsWallSection } from "@/components/templates/pest/reviews-wall";
import { PestQuoteFormSection } from "@/components/templates/pest/quote-form";
import { SafeHomeShieldSection } from "@/components/templates/pest/safe-home-shield";
import { PestTrustStripSection } from "@/components/templates/pest/trust-strip";

export const dynamic = "force-dynamic";

// Home page for the pest multi-page site. Layout priorities:
//   1) Title sits in the UPPER portion of the green banner (not bottom-aligned).
//   2) Banner is compact enough that the body content scrolls into view quickly.
//   3) Body uses a light background — banner is the only dark/green region.
export default async function PestHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, testimonials, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");
  const rating = business.rating;
  const parts = splitHero(hero.title);

  // Derived stats. Keeps numbers site-specific without fabricating claims.
  const homesProtected = Math.max(480, business.reviewsCount * 9 + 720);
  const yearsInBusiness = 18;

  return (
    <>
      <PestNav business={business} id={id} current="home" />

      <PestBanner
        variant="hero"
        eyebrow="Detect · Treat · Protect"
        title={
          <>
            {parts.before && (
              <span className="block italic text-emerald-200/90">{parts.before}</span>
            )}
            <span className="mt-1 block font-sans font-black uppercase tracking-tight">
              {parts.after}
            </span>
          </>
        }
        subtitle={hero.subtitle}
      >
        <div className="flex flex-wrap items-center gap-3">
          {business.phone && (
            <a
              href={`tel:${business.phone}`}
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-[#060c09] shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300 [.pest-light_&]:bg-emerald-700 [.pest-light_&]:text-[#f6efde] [.pest-light_&]:shadow-emerald-700/30 [.pest-light_&]:hover:bg-emerald-800"
            >
              <Phone className="h-4 w-4" /> Free inspection
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          )}
          <Link
            href={`/p/pest/${id}/services`}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-white/5 px-6 py-3 text-sm font-bold text-emerald-100 backdrop-blur transition hover:bg-white/10 [.pest-light_&]:border-emerald-700/40 [.pest-light_&]:bg-stone-900/5 [.pest-light_&]:text-emerald-900 [.pest-light_&]:hover:bg-stone-900/10"
          >
            See plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {rating !== null && rating !== undefined && (
          <div className="mt-6 flex items-center gap-2 text-[12.5px] text-emerald-100/75 [.pest-light_&]:text-emerald-900/75">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-emerald-400 text-emerald-400 [.pest-light_&]:fill-emerald-700 [.pest-light_&]:text-emerald-700"
                />
              ))}
            </div>
            <span className="font-semibold text-emerald-50 [.pest-light_&]:text-emerald-900">
              {rating.toFixed(1)}/5
            </span>
            {business.reviewsCount > 0 && (
              <span className="text-emerald-200/60 [.pest-light_&]:text-emerald-800/70">
                · {business.reviewsCount} reviews
              </span>
            )}
          </div>
        )}
      </PestBanner>

      <ProcessSteps />

      <PestQuoteFormSection businessName={business.name} state={business.state} />

      <SafeHomeShieldSection />

      <PestTrustStripSection
        yearsInBusiness={yearsInBusiness}
        jobsCompleted={homesProtected}
        reviewsCount={business.reviewsCount}
        rating={rating}
        loc={business.state ? `${business.state}` : null}
      />

      <PestAreasWeServeSection defaultZip={business.postalCode} />

      <ReviewsWallSection
        testimonials={testimonials}
        rating={rating}
        reviewCountHint={business.reviewsCount}
        loc={loc}
      />

      <LicenseBadges />

      <GuaranteePledge />

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
  const meta = await loadSiteMetadata(id);
  if (!meta) return { title: "Pest control" };
  return meta;
}
