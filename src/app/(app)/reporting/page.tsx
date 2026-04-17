import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";

export default async function ReportingPage() {
  const [opps, sites, rebuilds, appts] = await Promise.all([
    prisma.opportunity.count(),
    prisma.site.count(),
    prisma.siteRebuild.count(),
    prisma.appointment.count(),
  ]);
  return (
    <>
      <Topbar title="Reporting" />
      <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
          <Card label="Total opportunities" value={opps} />
          <Card label="Sites scraped" value={sites} />
          <Card label="AI rebuilds" value={rebuilds} />
          <Card label="Appointments" value={appts} />
        </div>
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm sm:mt-6 sm:p-6">
          Custom dashboards, funnel reports, and campaign analytics show here once you have data flowing.
        </div>
      </div>
    </>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="truncate text-[10px] font-medium uppercase tracking-wide text-slate-500 sm:text-xs">
        {label}
      </div>
      <div className="mt-1.5 text-lg font-bold text-slate-900 sm:mt-2 sm:text-2xl">{value}</div>
    </div>
  );
}
