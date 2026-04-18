import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";

export default async function IgAutomationPage() {
  const jobs = await prisma.socialFollowJob.findMany({
    where: { platform: "instagram" },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/instagram-auto" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <Kpi label="Follows today" value="0" />
          <Kpi label="Unfollows today" value="0" />
          <Kpi label="DMs sent" value="0" />
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-white">Running jobs</div>
            <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">
              New job
            </button>
          </div>
          <div className="space-y-2">
            {jobs.length === 0 && (
              <div className="text-xs text-slate-500">No Instagram jobs running.</div>
            )}
            {jobs.map((j) => (
              <div
                key={j.id}
                className="flex items-center justify-between rounded border border-slate-800 bg-slate-900 p-3"
              >
                <div>
                  <div className="text-sm text-white">{j.target}</div>
                  <div className="text-[11px] text-slate-500">{j.status}</div>
                </div>
                <div className="text-xs text-slate-400">
                  +{j.followed} / -{j.unfollowed}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
