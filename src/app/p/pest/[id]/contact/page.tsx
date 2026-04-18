import { notFound } from "next/navigation";
import { ArrowRight, Mail, MapPin, Phone } from "lucide-react";
import { loadSiteData } from "@/lib/templates/site-loader";
import { PestBanner, PestFooter, PestNav } from "@/components/templates/pest/chrome";
import {
  CoverageSection,
  FinalCta,
} from "@/components/templates/pest/pest-sections";

export const dynamic = "force-dynamic";

export default async function PestContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, serviceArea, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");

  return (
    <>
      <PestNav business={business} id={id} current="contact" />

      <PestBanner
        variant="page"
        eyebrow="Contact"
        heroImage={hero.image}
        title={
          <>
            <span className="italic text-emerald-200/90">Free inspection</span>
            <span className="block font-sans font-black uppercase tracking-tight">
              one call away.
            </span>
          </>
        }
        subtitle="Tell us what you're seeing. We'll walk the property, map the pressure, and send a written plan."
      />

      {/* Direct contact card — phone, email, address, hours */}
      <section className="relative bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 md:grid-cols-3">
          <ContactCard
            icon={<Phone className="h-5 w-5" />}
            title="Call or text"
            line1={business.phone || "Call us for a free inspection."}
            href={business.phone ? `tel:${business.phone}` : undefined}
            cta="Call now"
          />
          <ContactCard
            icon={<Mail className="h-5 w-5" />}
            title="Email"
            line1={business.email || "Reach us by email any time."}
            href={business.email ? `mailto:${business.email}` : undefined}
            cta="Send message"
          />
          <ContactCard
            icon={<MapPin className="h-5 w-5" />}
            title="Service region"
            line1={loc || "Regional coverage"}
            line2={business.address || undefined}
          />
        </div>
      </section>

      <CoverageSection serviceArea={serviceArea} loc={loc} />

      <FinalCta business={business} ctaHeadline={headlines.cta} />
      <PestFooter business={business} loc={loc} socials={data.socials} />
    </>
  );
}

function ContactCard({
  icon,
  title,
  line1,
  line2,
  href,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  line1: string;
  line2?: string;
  href?: string;
  cta?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        {icon}
      </div>
      <div className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
        {title}
      </div>
      <div className="mt-2 text-[16px] font-semibold text-slate-900">{line1}</div>
      {line2 && <div className="mt-1 text-[13px] text-slate-600">{line2}</div>}
      {href && cta && (
        <a
          href={href}
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-bold text-emerald-700 hover:text-emerald-600"
        >
          {cta} <ArrowRight className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) return { title: "Contact" };
  return {
    title: `Contact · ${data.business.name}`,
    description: `Book a free pest inspection with ${data.business.name}.`,
  };
}
