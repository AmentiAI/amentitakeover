import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { Wand2 } from "lucide-react";

export default async function AuditedPage() {
  const sites = await prisma.site.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { rebuilds: true } } },
    take: 200,
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/audited" />
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-3 text-xs text-slate-400">
          {sites.length} audited website{sites.length === 1 ? "" : "s"}
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sites.map((s) => (
            <Link
              key={s.id}
              href={`/sites/${s.id}`}
              className="block rounded-lg border border-slate-800 bg-slate-950 p-4 transition hover:border-indigo-500"
            >
              <div className="flex items-center gap-2">
                {s.favicon && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.favicon} alt="" className="h-4 w-4" />
                )}
                <div className="truncate text-sm font-semibold text-white">
                  {s.title ?? s.url}
                </div>
              </div>
              <div className="truncate text-[11px] text-slate-500">{s.url}</div>
              <div className="mt-2 flex flex-wrap gap-1">
                {s.palette.slice(0, 6).map((c) => (
                  <span
                    key={c}
                    className="h-3 w-3 rounded-full border border-slate-800"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>{s._count.rebuilds} rebuilds</span>
                <span className="inline-flex items-center gap-1 text-indigo-300">
                  <Wand2 className="h-3 w-3" />
                  Open
                </span>
              </div>
            </Link>
          ))}
          {sites.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-slate-700 bg-slate-950 p-12 text-center text-sm text-slate-500">
              No audited sites yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
