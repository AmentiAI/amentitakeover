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
      <div className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card label="Total opportunities" value={opps} />
          <Card label="Sites scraped" value={sites} />
          <Card label="AI rebuilds" value={rebuilds} />
          <Card label="Appointments" value={appts} />
        </div>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Custom dashboards, funnel reports, and campaign analytics show here once you have data flowing.
        </div>
      </div>
    </>
  );
}

function Card({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
    </div>
  );
}
