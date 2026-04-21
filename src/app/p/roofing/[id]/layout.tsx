import { notFound } from "next/navigation";
import { loadSiteData } from "@/lib/templates/site-loader";

export default async function RoofingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadSiteData(id);
  if (!data) notFound();
  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-100">{children}</div>
  );
}
