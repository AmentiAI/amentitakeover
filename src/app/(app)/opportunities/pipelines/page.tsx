import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import Link from "next/link";

export default async function PipelinesPage() {
  const pipelines = await prisma.pipeline.findMany({
    include: { stages: true, _count: { select: { opportunities: true } } },
  });
  return (
    <>
      <Topbar title="Pipelines" />
      <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 text-sm sm:gap-4 sm:px-4">
        <Link href="/opportunities" className="shrink-0 text-slate-500 hover:text-slate-800">
          Opportunities
        </Link>
        <Link href="/opportunities/pipelines" className="shrink-0 font-semibold text-slate-900">
          Pipelines
        </Link>
        <Link href="/opportunities/bulk" className="shrink-0 text-slate-500 hover:text-slate-800">
          Bulk Actions
        </Link>
      </div>
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pipelines.map((p) => (
            <div
              key={p.id}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="font-semibold text-slate-800">{p.name}</div>
                {p.isDefault && (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700">
                    Default
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {p.stages.length} stages · {p._count.opportunities} opportunities
              </div>
              <div className="mt-3 flex flex-wrap gap-1">
                {p.stages.map((s) => (
                  <span
                    key={s.id}
                    className="rounded px-1.5 py-0.5 text-[10px] text-white"
                    style={{ backgroundColor: s.color }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
