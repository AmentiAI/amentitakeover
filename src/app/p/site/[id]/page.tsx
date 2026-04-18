import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/templates/site/chrome";
import {
  AboutPreview,
  CTASection,
  GalleryStrip,
  Hero,
  ProcessSection,
  ServiceAreaSection,
  ServicesBannerStrip,
  ServicesGrid,
  Testimonials,
  ValuePropStrip,
} from "@/components/templates/site/sections";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";

export default async function SiteHomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  return (
    <SiteChrome data={data} active="home">
      <Hero data={data} />
      <ValuePropStrip data={data} />
      <AboutPreview data={data} />
      <ServicesGrid data={data} compact />
      <ServicesBannerStrip data={data} />
      <ProcessSection data={data} />
      <GalleryStrip data={data} compact />
      <Testimonials data={data} />
      <ServiceAreaSection data={data} />
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
  return meta ?? { title: "Local business" };
}
