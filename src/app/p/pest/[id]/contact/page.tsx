import { notFound } from "next/navigation";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { loadSiteData } from "@/lib/templates/site-loader";
import { PestBanner, PestFooter, PestNav } from "@/components/templates/pest/chrome";
import { PestContactForm } from "@/components/templates/pest/pest-contact-form";
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

      {/* Contact form (left) + direct-contact sidebar (right) */}
      <section className="relative bg-slate-50 py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[1.4fr_1fr] lg:gap-14">
          <PestContactForm business={business} />

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
              line1={business.hoursLine || "Mon–Sat · emergency after-hours"}
            />
          </aside>
        </div>
      </section>

      <CoverageSection serviceArea={serviceArea} loc={loc} />

      <FinalCta
        business={business}
        ctaHeadline={headlines.cta}
        backdrop="bugs"
      />
      <PestFooter business={business} loc={loc} socials={data.socials} />
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
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
          {title}
        </div>
        <div className="mt-1 truncate text-[15px] font-semibold text-slate-900">
          {line1}
        </div>
        {line2 && (
          <div className="mt-0.5 truncate text-[12.5px] text-slate-500">{line2}</div>
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
    description: `Book a free pest inspection with ${data.business.name}.`,
  };
}
