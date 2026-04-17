import { prisma } from "@/lib/db";
import { OutreachTopbar } from "@/components/outreach-topbar";
import { INDUSTRIES } from "@/lib/industries";
import { serpApiAvailable } from "@/lib/serpapi";
import { BusinessTable } from "./business-table";
import { ScrapeTrigger } from "./scrape-trigger";
import { StatsRow } from "./stats-row";
import Link from "next/link";

export default async function GoogleBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{
    industry?: string;
    state?: string;
    city?: string;
    q?: string;
  }>;
}) {
  const sp = await searchParams;
  const where: any = { archived: false, source: "google" };
  if (sp.industry) where.industry = sp.industry;
  if (sp.state) where.state = sp.state;
  if (sp.city) where.city = { contains: sp.city, mode: "insensitive" };
  if (sp.q)
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { email: { contains: sp.q, mode: "insensitive" } },
      { website: { contains: sp.q, mode: "insensitive" } },
    ];

  const businesses = await prisma.scrapedBusiness.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <OutreachTopbar activeHref="/outreach/scrape/google" />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-800 bg-slate-950 px-4 pt-3">
          <StatsRow />
        </div>

        <div className="border-b border-slate-800 bg-slate-950 px-4 py-3">
          <form
            action="/outreach/scrape/google"
            method="GET"
            className="flex flex-wrap items-center gap-2"
          >
            <select
              name="state"
              defaultValue={sp.state ?? ""}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            >
              <option value="">All States</option>
              {[
                "AL","AK","AZ","AR","CA","CO","CT","FL","GA","IL","NY","TX","WA","OR","CO","MA",
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              name="city"
              defaultValue={sp.city ?? ""}
              placeholder="All Cities"
              className="w-36 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
            />
            <select
              name="industry"
              defaultValue={sp.industry ?? ""}
              className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            >
              <option value="">All Industries</option>
              {INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
            <input
              name="q"
              defaultValue={sp.q ?? ""}
              placeholder="Search by name, email, or URL…"
              className="flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Apply
            </button>
            <Link
              href="/outreach/scrape/google"
              className="rounded-md border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
            >
              Clear
            </Link>
          </form>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {INDUSTRIES.slice(0, 26).map((i) => {
              const active = sp.industry === i;
              return (
                <Link
                  key={i}
                  href={`/outreach/scrape/google?industry=${encodeURIComponent(i)}`}
                  className={`rounded-full border px-2 py-0.5 text-[11px] transition ${
                    active
                      ? "border-indigo-400 bg-indigo-500/10 text-indigo-200"
                      : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
                  }`}
                >
                  {i}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="border-b border-slate-800 bg-slate-950 px-4 py-2">
          <ScrapeTrigger serpApiReady={serpApiAvailable()} />
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
      </div>
    </>
  );
}
