import { notFound } from "next/navigation";
import { loadSiteData } from "@/lib/templates/site-loader";
import { PestThemeFrame } from "@/components/templates/pest/pest-theme-frame";

// Multi-page pest template layout. Validates the scraped-business id once so
// every child page can assume loadSiteData succeeds. The theme frame supplies
// the dark/light context + floating toggle for every child page; sections that
// haven't been migrated yet stay in their hardcoded light palette regardless
// of the toggle, which is acceptable until they get dark-mode treatments too.
export default async function PestLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();
  return <PestThemeFrame>{children}</PestThemeFrame>;
}
