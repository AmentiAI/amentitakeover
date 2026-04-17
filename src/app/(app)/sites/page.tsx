import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import Link from "next/link";
import { NewSiteForm } from "./new-site-form";
import { ExternalLink, Wand2 } from "lucide-react";

export default async function SitesPage() {
  const sites = await prisma.site.findMany({
    include: { business: true, rebuilds: { orderBy: { createdAt: "desc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Topbar title="Sites" />
      <div className="flex min-h-0 flex-1">
        <div className="w-80 shrink-0 border-r border-slate-200 bg-white p-4">
          <div className="mb-2 text-sm font-semibold text-slate-800">
            Scrape a new site
          </div>
          <p className="mb-3 text-xs text-slate-500">
            Paste a URL. We fetch, extract content + palette, then AI rebuilds
            it.
          </p>
          <NewSiteForm />
        </div>
        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          {sites.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">
              No sites scraped yet. Start on the left.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sites.map((s) => (
                <Link
                  key={s.id}
                  href={`/sites/${s.id}`}
                  className="group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-500 hover:shadow"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      {s.favicon && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s.favicon} alt="" className="h-4 w-4" />
                      )}
                      <div className="truncate text-sm font-semibold text-slate-800">
                        {s.title ?? s.url}
                      </div>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                  <div className="truncate text-xs text-slate-500">{s.url}</div>
                  <div className="mt-2 line-clamp-2 text-xs text-slate-600">
                    {s.description ?? ""}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {s.palette.slice(0, 5).map((c) => (
                      <span
                        key={c}
                        className="h-3 w-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {s.rebuilds.length} AI rebuild
                      {s.rebuilds.length === 1 ? "" : "s"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-brand-700 opacity-0 group-hover:opacity-100">
                      <Wand2 className="h-3 w-3" /> Open
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
