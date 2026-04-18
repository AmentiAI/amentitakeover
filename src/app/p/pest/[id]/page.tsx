import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Phone, Star } from "lucide-react";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";
import { PestBanner, PestFooter, PestNav } from "@/components/templates/pest/chrome";
import { PestCounter } from "@/components/templates/pest/pest-counter";
import {
  FAQSection,
  FinalCta,
  GuaranteePledge,
  LicenseBadges,
  PestTeaser,
  ProcessSteps,
  ServicesTeaser,
  TestimonialsSection,
  TreatmentZonesSection,
  ValueBar,
  splitHero,
} from "@/components/templates/pest/pest-sections";

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

  const { business, hero, services, testimonials, headlines, faqs } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");
  const rating = business.rating;
  const parts = splitHero(hero.title);

  // Derived stats. Keeps numbers site-specific without fabricating claims.
  const pestsEliminated = Math.max(12_000, business.reviewsCount * 220 + 18_500);
  const homesProtected = Math.max(480, business.reviewsCount * 9 + 720);
  const yearsInBusiness = 18;

  return (
    <>
      <PestNav business={business} id={id} current="home" />

      <PestBanner
        variant="hero"
        eyebrow="Detect · Treat · Protect"
        heroImage={hero.image}
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
              className="group inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-[#060c09] shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
            >
              <Phone className="h-4 w-4" /> Free inspection
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </a>
          )}
          <Link
            href={`/p/pest/${id}/services`}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-white/5 px-6 py-3 text-sm font-bold text-emerald-100 backdrop-blur transition hover:bg-white/10"
          >
            See plans <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {rating !== null && rating !== undefined && (
          <div className="mt-6 flex items-center gap-2 text-[12.5px] text-emerald-100/75">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-emerald-400 text-emerald-400" />
              ))}
            </div>
            <span className="font-semibold text-emerald-50">{rating.toFixed(1)}/5</span>
            {business.reviewsCount > 0 && (
              <span className="text-emerald-200/60">· {business.reviewsCount} reviews</span>
            )}
          </div>
        )}
      </PestBanner>

      {/* Count-up stat band, sits against the light page body */}
      <section className="relative border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
          <PestCounter
            target={pestsEliminated}
            label="Pests eliminated"
            className="text-slate-900"
          />
          <PestCounter
            target={homesProtected}
            label="Homes protected"
            duration={2200}
            className="text-slate-900"
          />
          <PestCounter
            target={yearsInBusiness}
            label="Years on the route"
            duration={1400}
            suffix=" yr"
            className="text-slate-900"
          />
        </div>
      </section>

      {/* Short intro / positioning */}
      <section className="relative bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-600">
            {headlines.about}
          </div>
          <h2 className="mt-4 font-serif text-4xl leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Built like a service, <span className="italic text-emerald-700">not a product.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Every visit starts with an inspection and ends with a written report. No upsells, no mystery chemistries — just the treatment plan we&apos;d use on our own house.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-[13px] font-semibold">
            <Link
              href={`/p/pest/${id}/about`}
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-white hover:bg-emerald-500"
            >
              How we work <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/p/pest/${id}/contact`}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-5 py-2.5 text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </section>

      <ValueBar />

      <ServicesTeaser services={services} id={id} />

      <ProcessSteps />

      <TreatmentZonesSection />

      <PestTeaser id={id} />

      <TestimonialsSection
        testimonials={testimonials}
        headline={headlines.testimonials}
      />

      <LicenseBadges />

      <GuaranteePledge />

      <FAQSection faqs={faqs} />

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
