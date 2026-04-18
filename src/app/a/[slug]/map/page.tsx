import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getAffiliateFromCookies } from "@/lib/affiliate-session";
import { UsaMap } from "@/components/usa-map";
import { normalizeState } from "@/lib/us-states";

export const dynamic = "force-dynamic";

export default async function AffiliateMapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const affiliate = await prisma.affiliate.findUnique({
    where: { slug },
    select: { active: true },
  });
  if (!affiliate) notFound();

  const session = await getAffiliateFromCookies();
  if (!session || session.slug !== slug || !affiliate.active) {
    redirect(`/a/${slug}`);
  }

  const builtIds = (
    await prisma.generatedImage.findMany({
      select: { scrapedBusinessId: true },
      distinct: ["scrapedBusinessId"],
    })
  ).map((r) => r.scrapedBusinessId);

  const rows = builtIds.length === 0 ? [] : await prisma.scrapedBusiness.findMany({
    where: { archived: false, id: { in: builtIds } },
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      industry: true,
      rating: true,
      website: true,
      lat: true,
      lng: true,
    },
    take: 5000,
  });

  const stateCounts: Record<string, number> = {};
  for (const r of rows) {
    const s = normalizeState(r.state);
    if (!s) continue;
    stateCounts[s.code] = (stateCounts[s.code] ?? 0) + 1;
  }

  return (
    <div className="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-white">Lead map</h1>
        <p className="mt-1 text-xs text-slate-400">
          {rows.length.toLocaleString()} prospects available to call. Tap a state
          to drill in.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/40 lg:h-[calc(100vh-150px)] lg:min-h-[480px]">
        <UsaMap
          points={rows}
          stateCounts={stateCounts}
          topoUrl="/geo/us-states-10m.json"
        />
      </div>
    </div>
  );
}
