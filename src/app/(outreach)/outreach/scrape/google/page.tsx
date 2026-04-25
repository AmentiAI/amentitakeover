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
    // Pull just contactForm so we can render a "Form" flag without a 2nd query.
    include: { site: { select: { contactForm: true } } },
  });

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
            hasContactForm: !!b.site?.contactForm,
            // True when the captured form has a textarea / "message" /
            // "comments" / "details" field — i.e., the operator can convey
            // intent. Falsy when it's a bare contact-info dropoff form.
            formHasMessage:
              !!(b.site?.contactForm as { hasMessageField?: boolean } | null)
                ?.hasMessageField,
            // Captcha vendor detected on the form / page (recaptcha,
            // hcaptcha, turnstile, …). Non-null forms can't be submitted
            // headlessly without solving the challenge.
            formCaptcha:
              ((b.site?.contactForm as { captcha?: { type?: string } | null } | null)
                ?.captcha?.type) ?? null,
          }))}
        />
      </div>
    </>
  );
}
