import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/templates/site/chrome";
import {
  CTASection,
  FaqSection,
  PageHeader,
  ProcessSection,
  ServiceAreaSection,
  Testimonials,
  ValuePropStrip,
} from "@/components/templates/site/sections";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  return (
    <SiteChrome data={data} active="about">
      <PageHeader
        eyebrow={data.business.city ? `About · ${data.business.city}` : "About"}
        title={`Built on referrals, grown by ${data.business.name.split(" ")[0]}.`}
        subtitle={data.about.short}
        image={data.banners.about}
      />
      <section className="relative bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-5 sm:px-6">
          <div className="text-xs font-bold uppercase tracking-[0.22em] text-accent">Our story</div>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            What you can expect working with us.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-slate-700">{data.about.long}</p>
        </div>
      </section>
      <ValuePropStrip data={data} />
      <ProcessSection data={data} />
      <Testimonials data={data} />
      <ServiceAreaSection data={data} />
      <FaqSection data={data} />
      <CTASection data={data} />
    </SiteChrome>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const meta = await loadSiteMetadata(id);
  if (!meta) return { title: "About" };
  return { title: `About · ${meta.title}`, description: meta.description };
}
