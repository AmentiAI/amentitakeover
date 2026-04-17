import { Topbar } from "@/components/topbar";
import Link from "next/link";

export default function BulkActionsPage() {
  return (
    <>
      <Topbar title="Bulk Actions" />
      <div className="flex items-center gap-3 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 text-sm sm:gap-4 sm:px-4">
        <Link href="/opportunities" className="shrink-0 text-slate-500 hover:text-slate-800">
          Opportunities
        </Link>
        <Link href="/opportunities/pipelines" className="shrink-0 text-slate-500 hover:text-slate-800">
          Pipelines
        </Link>
        <Link href="/opportunities/bulk" className="shrink-0 font-semibold text-slate-900">
          Bulk Actions
        </Link>
      </div>
      <div className="flex-1 p-3 sm:p-4 md:p-6">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 sm:p-8">
          No bulk jobs running. Start one from the Opportunities list.
        </div>
      </div>
    </>
  );
}
