import { notFound } from "next/navigation";
import { loadSiteData } from "@/lib/templates/site-loader";

// Multi-page pest template layout. Validates the scraped-business id once so
// every child page can assume loadSiteData succeeds. Sets the light body
// palette; the dark green bug banner lives in each page's <PestBanner /> call.
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
  return <div className="min-h-screen bg-white text-slate-900">{children}</div>;
}
