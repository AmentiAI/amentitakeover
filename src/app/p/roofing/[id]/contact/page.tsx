import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { loadSiteData } from "@/lib/templates/site-loader";
import {
  RoofingBanner,
  RoofingFooter,
  RoofingNav,
} from "@/components/templates/roofing/chrome";
import { RoofContactForm } from "@/components/templates/roofing/roof-contact-form";
import {
  CoverageMap,
  FaqSection,
  FinalCta,
} from "@/components/templates/roofing/roof-sections";
import { BeaconHouseBanner } from "@/components/templates/roofing/roof-banners";

export const dynamic = "force-dynamic";

export default async function RoofingContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  const { business, hero, serviceArea, faqs, headlines } = data;
  const loc = [business.city, business.state].filter(Boolean).join(", ");

  return (
    <>
      <RoofingNav business={business} id={id} current="contact" />

      <RoofingBanner
        variant="page"
        eyebrow="Contact"
        heroImage={hero.image}
        svg={<BeaconHouseBanner />}
        title={
          <>
            <span className="block font-serif text-[28px] font-medium italic tracking-normal text-amber-200/85 sm:text-[36px] md:text-[44px]">
              Free inspection.
            </span>
            <span className="block">One call away.</span>
          </>
        }
        subtitle="Tell us what you're seeing on the roof. We'll walk the property and send a written plan."
      />

      <section className="relative border-y border-slate-800/80 bg-[#0a111d] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <RoofContactForm business={business} />

          <aside className="flex flex-col gap-5">
            <ContactRow
              icon={<Phone className="h-5 w-5" />}
              title="Call or text"
              line1={business.phone || "Call for a free inspection."}
              href={business.phone ? `tel:${business.phone}` : undefined}
            />
            <ContactRow
              icon={<Mail className="h-5 w-5" />}
              title="Email"
              line1={business.email || "Email us any time."}
              href={business.email ? `mailto:${business.email}` : undefined}
            />
            <ContactRow
              icon={<MapPin className="h-5 w-5" />}
              title="Service region"
              line1={loc || "Regional coverage"}
              line2={business.address || undefined}
            />
            <ContactRow
              icon={<Clock className="h-5 w-5" />}
              title="Hours"
              line1={business.hoursLine || "Mon–Sat · emergency tarp-up 24/7"}
            />
          </aside>
        </div>
      </section>

      <CoverageMap serviceArea={serviceArea} loc={loc} />
      <FaqSection faqs={faqs} />

      <FinalCta business={business} headline={headlines.cta} />
      <RoofingFooter business={business} loc={loc} socials={data.socials} />
    </>
  );
}

function ContactRow({
  icon,
  title,
  line1,
  line2,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  line1: string;
  line2?: string;
  href?: string;
}) {
  const body = (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-sm transition hover:border-amber-400/40 hover:shadow-md">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-amber-400/10 text-amber-300">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">
          {title}
        </div>
        <div className="mt-1 truncate text-[15px] font-semibold text-slate-50">
          {line1}
        </div>
        {line2 && (
          <div className="mt-0.5 truncate text-[12.5px] text-slate-400">{line2}</div>
        )}
      </div>
    </div>
  );
  return href ? (
    <a href={href} className="block">
      {body}
    </a>
  ) : (
    body
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
    description: `Book a free roof inspection with ${data.business.name}.`,
  };
}
