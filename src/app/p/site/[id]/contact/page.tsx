import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/templates/site/chrome";
import {
  ContactBlock,
  FaqSection,
  PageHeader,
  ServiceAreaSection,
} from "@/components/templates/site/sections";
import { loadSiteData, loadSiteMetadata } from "@/lib/templates/site-loader";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();

  return (
    <SiteChrome data={data} active="contact">
      <PageHeader
        eyebrow="Contact"
        title="Let's talk about your project."
        subtitle="Same-week response. Written quotes. Real people on the phone."
        image={data.banners.cta}
      />
      <ContactBlock data={data} />
      <ServiceAreaSection data={data} />
      <FaqSection data={data} />
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
  if (!meta) return { title: "Contact" };
  return { title: `Contact · ${meta.title}`, description: meta.description };
}
