import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/templates/site/chrome";
import {
  CTASection,
  GalleryStrip,
  PageHeader,
  ServiceAreaSection,
  Testimonials,
} from "@/components/templates/site/sections";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  return (
    <SiteChrome data={data} active="gallery">
      <PageHeader
        eyebrow="Recent work"
        title="Craft you can see."
        subtitle="A look at recent projects — every one handled by a crew that cares about the finish."
        image={data.banners.services}
      />
      <GalleryStrip data={data} />
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
  if (!meta) return { title: "Gallery" };
  return { title: `Gallery · ${meta.title}`, description: meta.description };
}
