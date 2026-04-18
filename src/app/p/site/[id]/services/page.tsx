import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/templates/site/chrome";
import {
  CTASection,
  FaqSection,
  PageHeader,
  ProcessSection,
  ServiceAreaSection,
  ServicesBannerStrip,
  ServicesGrid,
  ValuePropStrip,
} from "@/components/templates/site/sections";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  return (
    <SiteChrome data={data} active="services">
      <PageHeader
        eyebrow="Services"
        title="Everything we do, done well."
        subtitle="A complete look at our work — residential, commercial, repairs, new installs. Something not listed? Call us."
        image={data.banners.services}
      />
      <ValuePropStrip data={data} />
      <ServicesGrid data={data} />
      <ServicesBannerStrip data={data} />
      <ProcessSection data={data} />
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
  if (!meta) return { title: "Services" };
  return { title: `Services · ${meta.title}`, description: meta.description };
}
