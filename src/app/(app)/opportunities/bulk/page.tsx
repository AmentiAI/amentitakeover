import { Topbar } from "@/components/topbar";
import Link from "next/link";

export default function BulkActionsPage() {
  return (
    <>
      <Topbar title="Bulk Actions" />
      <div className="flex items-center gap-4 border-b border-slate-200 bg-white px-4 py-2 text-sm">
        <Link href="/opportunities" className="text-slate-500 hover:text-slate-800">
          Opportunities
        </Link>
        <Link href="/opportunities/pipelines" className="text-slate-500 hover:text-slate-800">
          Pipelines
        </Link>
        <Link href="/opportunities/bulk" className="font-semibold text-slate-900">
          Bulk Actions
        </Link>
      </div>
      <div className="flex-1 p-6">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No bulk jobs running. Start one from the Opportunities list.
        </div>
      </div>
    </>
  );
}
