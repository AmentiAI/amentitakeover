import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { OutreachTopbar } from "@/components/outreach-topbar";
import { INDUSTRIES } from "@/lib/industries";
import { serpApiAvailable } from "@/lib/serpapi";
import { BusinessTable } from "./business-table";
import { ScrapeTrigger } from "./scrape-trigger";
import { StatsRow } from "./stats-row";
import { FlagFilters } from "./flag-filters";
import { Pagination } from "./pagination";
import Link from "next/link";

const PER_PAGE = 50;

// Each flag key maps to an additive Prisma `where` fragment. Returning an
// array of fragments lets us AND them together and merge the ones that touch
// the same nested relation (`site.is.AND`).
function buildFlagWhere(flags: Set<string>): Prisma.ScrapedBusinessWhereInput {
  const where: Prisma.ScrapedBusinessWhereInput = {};
  const siteAnd: Prisma.SiteWhereInput[] = [];

  if (flags.has("web")) where.hasWebsite = true;
  if (flags.has("email")) where.email = { not: null };
  if (flags.has("enriched")) where.enriched = true;
  if (flags.has("qualified")) where.qualified = true;

  if (flags.has("form")) {
    siteAnd.push({ contactForm: { not: Prisma.AnyNull } });
  }
  if (flags.has("msg")) {
    siteAnd.push({
      contactForm: { path: ["hasMessageField"], equals: true },
    });
  }
  if (flags.has("nomsg")) {
    // Has a captured form, but the form has no message/textarea field.
    siteAnd.push({ contactForm: { not: Prisma.AnyNull } });
    siteAnd.push({
      contactForm: { path: ["hasMessageField"], equals: false },
    });
  }
  if (flags.has("captcha")) {
    siteAnd.push({
      contactForm: { path: ["captcha", "type"], not: Prisma.AnyNull },
    });
  }
  if (flags.has("nocap")) {
    siteAnd.push({ contactForm: { not: Prisma.AnyNull } });
    siteAnd.push({
      contactForm: { path: ["captcha"], equals: Prisma.AnyNull },
    });
  }
  if (flags.has("pass")) {
    siteAnd.push({ contentScore: { path: ["passed"], equals: true } });
  }
  if (flags.has("fail")) {
    siteAnd.push({ contentScore: { path: ["passed"], equals: false } });
  }
  if (flags.has("stale")) {
    siteAnd.push({ signals: { path: ["yearsBehind"], gte: 2 } });
  }

  if (siteAnd.length > 0) {
    where.site = { is: { AND: siteAnd } };
  }
  return where;
}

export default async function GoogleBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{
    industry?: string;
    state?: string;
    city?: string;
    q?: string;
    source?: string;
    flags?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const flagSet = new Set(
    (sp.flags ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const pageNum = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.ScrapedBusinessWhereInput = {
    archived: false,
    ...buildFlagWhere(flagSet),
  };
  if (sp.source) where.source = sp.source;
  if (sp.industry) where.industry = sp.industry;
  if (sp.state) where.state = sp.state;
  if (sp.city) where.city = { contains: sp.city, mode: "insensitive" };
  if (sp.q)
    where.OR = [
      { name: { contains: sp.q, mode: "insensitive" } },
      { email: { contains: sp.q, mode: "insensitive" } },
      { website: { contains: sp.q, mode: "insensitive" } },
    ];

  const [total, businesses] = await Promise.all([
    prisma.scrapedBusiness.count({ where }),
    prisma.scrapedBusiness.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * PER_PAGE,
      take: PER_PAGE,
      // Pull contactForm + contentScore + signals so badges render without
      // a second per-row query.
      include: { site: { select: { contactForm: true, contentScore: true, signals: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(pageNum, totalPages);

  return (
    <>
      <OutreachTopbar activeHref="/outreach/scrape/google" />
      <div className="flex-1 overflow-auto">
        <div className="border-b border-slate-800 bg-slate-950 px-3 pt-3 sm:px-4">
          <StatsRow />
        </div>

        <div className="border-b border-slate-800 bg-slate-950 px-3 py-3 sm:px-4">
          <form
            action="/outreach/scrape/google"
            method="GET"
            className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center"
          >
            <select
              name="state"
              defaultValue={sp.state ?? ""}
              className="min-w-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            >
              <option value="">All States</option>
              {[
                "AL","AK","AZ","AR","CA","CO","CT","FL","GA","IL","NY","TX","WA","OR","MA",
              ].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <input
              name="city"
              defaultValue={sp.city ?? ""}
              placeholder="All Cities"
              className="min-w-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 sm:w-36"
            />
            <select
              name="industry"
              defaultValue={sp.industry ?? ""}
              className="col-span-2 min-w-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200 sm:col-span-1"
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
              className="col-span-2 min-w-0 flex-1 rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 sm:col-span-1"
            />
            {/* Carry the flags param + reset page on submit so a text-filter
                update doesn't drop the active flag chips. */}
            {sp.flags && <input type="hidden" name="flags" value={sp.flags} />}
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-500 sm:py-1.5"
            >
              Apply
            </button>
            <Link
              href="/outreach/scrape/google"
              className="rounded-md border border-slate-700 px-3 py-2 text-center text-xs text-slate-300 hover:bg-slate-800 sm:py-1.5"
            >
              Clear
            </Link>
          </form>
        </div>

        <div className="border-b border-slate-800 bg-slate-950 px-3 py-2 sm:px-4">
          <FlagFilters />
        </div>

        <div className="border-b border-slate-800 bg-slate-950 px-3 py-2 sm:px-4">
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
            source: b.source,
            enriched: b.enriched,
            qualified: b.qualified,
            hasEmail: !!b.email,
            hasWebsite: b.hasWebsite,
            hasContactForm: !!b.site?.contactForm,
            formHasMessage:
              !!(b.site?.contactForm as { hasMessageField?: boolean } | null)
                ?.hasMessageField,
            formCaptcha:
              ((b.site?.contactForm as { captcha?: { type?: string } | null } | null)
                ?.captcha?.type) ?? null,
            contentScore:
              (b.site?.contentScore as { h1Count?: number; h2Count?: number; passed?: boolean } | null) ?? null,
            cms: ((b.site?.signals as { cms?: string | null } | null)?.cms) ?? null,
            yearsBehind:
              ((b.site?.signals as { yearsBehind?: number | null } | null)?.yearsBehind) ?? null,
          }))}
        />

        <div className="border-t border-slate-800 bg-slate-950">
          <Pagination page={safePage} totalPages={totalPages} total={total} />
        </div>
      </div>
    </>
  );
}
