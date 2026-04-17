import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import { BusinessTable } from "../google/business-table";

export default async function YelpPage() {
  const businesses = await prisma.scrapedBusiness.findMany({
    where: { source: "yelp", archived: false },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/scrape/google" />
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
        Yelp · {businesses.length} businesses
      </div>
      <BusinessTable
        businesses={businesses.map((b) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          city: b.city,
          state: b.state,
          industry: b.industry,
          rating: b.rating,
          reviews: b.reviewsCount,
          confidence: b.confidence,
          enriched: b.enriched,
          qualified: b.qualified,
          hasEmail: !!b.email,
          hasWebsite: b.hasWebsite,
        }))}
      />
    </>
  );
}
