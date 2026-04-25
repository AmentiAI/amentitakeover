import Link from "next/link";
import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import {
  TEMPLATE_CHOICES,
  type TemplateChoice,
  getTemplatePreviewUrl,
} from "@/lib/site-url";
import { ExternalLink } from "lucide-react";

type ReplacementGroup = { section: string; fields: string[] };

const TEMPLATE_REPLACEMENTS: Record<TemplateChoice, ReplacementGroup[]> = {
  site: [
    { section: "Hero", fields: ["Eyebrow", "Title", "Subtitle", "Hero image"] },
    { section: "Brand", fields: ["Business name", "Logo", "Tagline", "Phone", "Email", "Address", "Hours"] },
    { section: "Services", fields: ["Service titles & bodies", "Service card images", "Services banner"] },
    { section: "About", fields: ["Short summary", "Long story", "About banner"] },
    { section: "Process", fields: ["3 process steps (title + body)"] },
    { section: "Gallery", fields: ["Generated gallery images with alt text"] },
    { section: "Testimonials", fields: ["Quote, author, location, rating"] },
    { section: "Service area", fields: ["City list"] },
    { section: "FAQs", fields: ["Q&A pairs"] },
    { section: "Theme", fields: ["Brand palette — base / accent / trust"] },
    { section: "Social", fields: ["Instagram, Facebook, Twitter, LinkedIn, TikTok, YouTube"] },
    { section: "SEO meta", fields: ["Title", "Description"] },
  ],
  editorial: [
    { section: "Hero", fields: ["Eyebrow", "Title", "Subtitle", "Hero image"] },
    { section: "Brand", fields: ["Business name", "Tagline", "Phone", "Email", "Address"] },
    { section: "Services", fields: ["Service titles & bodies", "Service imagery"] },
    { section: "About", fields: ["Short summary", "Long story"] },
    { section: "Process", fields: ["Process steps"] },
    { section: "Gallery", fields: ["Generated gallery images"] },
    { section: "Testimonials", fields: ["Quote, author, rating"] },
    { section: "Theme", fields: ["Editorial serif palette"] },
    { section: "Social", fields: ["Instagram, Facebook, Twitter, LinkedIn"] },
    { section: "SEO meta", fields: ["Title", "Description"] },
  ],
  pest: [
    { section: "Hero", fields: ["Radar hero", "Headline", "Subtitle", "Crawling-bug canvas"] },
    { section: "Brand", fields: ["Business name", "Phone", "Address", "Service area"] },
    { section: "Treatment plans", fields: ["Plan titles, bullets, pricing/cadence"] },
    { section: "Services", fields: ["Pest categories with descriptions"] },
    { section: "About", fields: ["License/insurance line", "About copy"] },
    { section: "Process", fields: ["Inspect → Treat → Monitor steps"] },
    { section: "Testimonials", fields: ["Quote, author, location"] },
    { section: "Service area", fields: ["City coverage list"] },
    { section: "FAQs", fields: ["Pest-specific Q&A"] },
    { section: "Social", fields: ["Active social handles"] },
  ],
  roofing: [
    { section: "Hero", fields: ["Pitched-roof hero", "Headline", "Subtitle", "Storm-front canvas"] },
    { section: "Brand", fields: ["Business name", "Phone", "Address", "Service area"] },
    { section: "Services", fields: ["Repair / Replace / Inspect / Storm — title + body"] },
    { section: "About", fields: ["Warranty length", "Insurance/licensing", "About copy"] },
    { section: "Process", fields: ["Inspect → Estimate → Install → Warranty"] },
    { section: "Gallery", fields: ["Project photos"] },
    { section: "Testimonials", fields: ["Quote, author, location, rating"] },
    { section: "Service area", fields: ["City coverage list"] },
    { section: "FAQs", fields: ["Roofing-specific Q&A"] },
    { section: "Social", fields: ["Active social handles"] },
  ],
};

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<{ biz?: string }>;
}) {
  const sp = await searchParams;

  const explicit = sp.biz?.trim();
  const biz = explicit
    ? await prisma.scrapedBusiness.findUnique({ where: { id: explicit } })
    : (await prisma.scrapedBusiness.findFirst({
        where: { siteGenerated: true, archived: false },
        orderBy: { updatedAt: "desc" },
      })) ??
      (await prisma.scrapedBusiness.findFirst({
        where: { archived: false },
        orderBy: { createdAt: "desc" },
      }));

  const candidates = await prisma.scrapedBusiness.findMany({
    where: { archived: false },
    orderBy: [{ siteGenerated: "desc" }, { updatedAt: "desc" }],
    take: 25,
    select: { id: true, name: true, city: true, state: true, siteGenerated: true },
  });

  return (
    <>
      <OutreachTopbar activeHref="/outreach/templates" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-white">Business Templates</h1>
            <p className="mt-0.5 text-xs text-slate-400">
              Live previews of every prospect-facing template, with the data fields
              that get swapped in during build.
            </p>
          </div>
          <form className="flex items-center gap-2">
            <label className="text-[11px] uppercase tracking-wider text-slate-500">
              Preview as
            </label>
            <select
              name="biz"
              defaultValue={biz?.id ?? ""}
              className="min-w-0 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-200"
            >
              {!biz && <option value="">No business available</option>}
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.city ? ` — ${c.city}${c.state ? `, ${c.state}` : ""}` : ""}
                  {c.siteGenerated ? " ✓" : ""}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Apply
            </button>
          </form>
        </div>

        {!biz && (
          <div className="rounded-lg border border-amber-700/40 bg-amber-950/30 p-4 text-sm text-amber-200">
            No scraped businesses yet. Run a scrape (Google / Yelp / Instagram) to
            populate a preview source, then come back here.
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="px-3 py-2 font-semibold">Template</th>
                <th className="px-3 py-2 font-semibold">Description</th>
                <th className="px-3 py-2 font-semibold">Replaced at build</th>
                <th className="px-3 py-2 font-semibold w-px whitespace-nowrap">Preview</th>
                <th className="px-3 py-2 font-semibold w-px whitespace-nowrap">With biz</th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATE_CHOICES.map((tpl) => {
                const tradeSentinel =
                  tpl.value === "roofing"
                    ? "default-roofing"
                    : tpl.value === "pest"
                      ? "default-pest"
                      : "default";
                const defaultUrl = getTemplatePreviewUrl(tradeSentinel, {
                  template: tpl.value,
                });
                const bizUrl = biz
                  ? getTemplatePreviewUrl(biz.id, { template: tpl.value })
                  : null;
                const replacements = TEMPLATE_REPLACEMENTS[tpl.value];
                const fieldCount = replacements.reduce(
                  (n, g) => n + g.fields.length,
                  0,
                );
                return (
                  <tr
                    key={tpl.value}
                    className="border-b border-slate-900 last:border-b-0 align-top hover:bg-slate-900/40"
                  >
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-white">{tpl.label}</div>
                      <div className="mt-0.5 font-mono text-[10px] text-slate-500">
                        /p/{tpl.value}/&lt;id&gt;
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[12px] text-slate-400">
                      {tpl.hint}
                    </td>
                    <td className="px-3 py-2.5">
                      <details className="group text-[11px]">
                        <summary className="cursor-pointer list-none text-slate-300 hover:text-white">
                          {replacements.length} sections · {fieldCount} fields
                          <span className="ml-1 text-slate-500 group-open:hidden">▸</span>
                          <span className="ml-1 hidden text-slate-500 group-open:inline">▾</span>
                        </summary>
                        <ul className="mt-2 space-y-1.5">
                          {replacements.map((g) => (
                            <li key={g.section}>
                              <span className="font-semibold text-slate-200">
                                {g.section}:
                              </span>{" "}
                              <span className="text-slate-400">
                                {g.fields.join(", ")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </td>
                    <td className="px-3 py-2.5">
                      <Link
                        href={defaultUrl}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-md border border-slate-700 px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        Default <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                    <td className="px-3 py-2.5">
                      {bizUrl ? (
                        <Link
                          href={bizUrl}
                          target="_blank"
                          className="inline-flex items-center gap-1 rounded-md border border-slate-800 px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800 hover:text-white"
                        >
                          Open <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-600">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
