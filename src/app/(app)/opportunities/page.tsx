import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { KanbanBoard } from "@/components/kanban/board";
import type { KanbanColumnData } from "@/components/kanban/column";
import Link from "next/link";
import {
  ChevronDown,
  Download,
  Filter,
  LayoutGrid,
  List,
  Plus,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

export default async function OpportunitiesPage() {
  let pipeline = await prisma.pipeline.findFirst({
    where: { isDefault: true },
    include: {
      stages: { orderBy: { position: "asc" } },
    },
  });
  if (!pipeline) {
    pipeline = await prisma.pipeline.findFirst({
      include: { stages: { orderBy: { position: "asc" } } },
    });
  }

  const opportunities = pipeline
    ? await prisma.opportunity.findMany({
        where: { pipelineId: pipeline.id },
        include: { business: true },
        orderBy: { position: "asc" },
      })
    : [];

  const totalValue = opportunities.reduce(
    (s, o) => s + Number(o.value ?? 0),
    0
  );

  const columns: KanbanColumnData[] = (pipeline?.stages ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    color: s.color,
    cards: opportunities
      .filter((o) => o.stageId === s.id)
      .map((o, idx) => ({
        id: o.id,
        title: o.title,
        businessName: o.business?.name ?? null,
        value: Number(o.value ?? 0),
        opportunityNumber: `#${String(idx + 1).padStart(3, "0")}`,
      })),
  }));

  return (
    <>
      <Topbar title="Opportunities" />
      <div className="overflow-x-auto border-b border-slate-200 bg-white">
        <div className="flex min-w-max items-center gap-4 px-4 py-2 text-sm">
          <Link href="/opportunities" className="whitespace-nowrap font-semibold text-slate-900">
            Opportunities
          </Link>
          <Link href="/opportunities/pipelines" className="whitespace-nowrap text-slate-500 hover:text-slate-800">
            Pipelines
          </Link>
          <Link href="/opportunities/bulk" className="whitespace-nowrap text-slate-500 hover:text-slate-800">
            Bulk Actions
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
            {pipeline?.name ?? "No pipeline"}
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
          <div className="text-xs text-slate-500">
            {opportunities.length} opportunities · ${totalValue.toFixed(2)}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50">
            <LayoutGrid className="h-4 w-4 text-slate-500" />
          </button>
          <button className="grid h-8 w-8 place-items-center rounded-md border border-slate-200 hover:bg-slate-50">
            <List className="h-4 w-4 text-slate-500" />
          </button>
          <button className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Upload className="h-3.5 w-3.5" /> Import
          </button>
          <button className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5" /> Add opportunity
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2 text-xs">
          <button className="rounded bg-slate-100 px-2 py-1 font-medium text-slate-700">All</button>
          <button className="rounded px-2 py-1 text-slate-500 hover:bg-slate-100">Mine</button>
          <span className="mx-1 text-slate-300">|</span>
          <button className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
            <Filter className="h-3.5 w-3.5" /> Advanced Filters
          </button>
          <button className="flex items-center gap-1 text-slate-500 hover:text-slate-700">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Sort By
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
            <Search className="h-3.5 w-3.5" />
            <input
              placeholder="Search"
              className="w-28 bg-transparent outline-none placeholder:text-slate-400 sm:w-48"
            />
          </div>
          <button className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">
            Manage Fields
          </button>
        </div>
      </div>

      <div className="flex-1 bg-slate-100">
        {columns.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No pipeline. Run <code className="mx-1 rounded bg-white px-1">npm run db:seed</code> to bootstrap.
          </div>
        ) : (
          <KanbanBoard initial={columns} />
        )}
      </div>
    </>
  );
}
