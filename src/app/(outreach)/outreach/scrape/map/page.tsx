import { prisma } from "@/lib/db";
import { OutreachTopbar } from "@/components/outreach-topbar";
import { UsaMap } from "@/components/usa-map";
import { normalizeState } from "@/lib/us-states";

export default async function ScrapeMapPage() {
  const rows = await prisma.scrapedBusiness.findMany({
    where: { archived: false },
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
    <>
      <OutreachTopbar activeHref="/outreach/scrape/google" />
      <div className="flex-1 overflow-hidden p-4">
        <UsaMap
          points={rows}
          stateCounts={stateCounts}
          topoUrl="/geo/us-states-10m.json"
        />
      </div>
    </>
  );
}
