import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";

export default async function OutreachCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/email-campaigns" />
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}
          </div>
          <button className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">
            New campaign
          </button>
        </div>
        <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Sent</th>
                <th className="px-4 py-2">Opened</th>
                <th className="px-4 py-2">Replied</th>
                <th className="px-4 py-2">Rate</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => {
                const openRate = c.sent ? Math.round((c.opened / c.sent) * 100) : 0;
                const replyRate = c.sent ? Math.round((c.replied / c.sent) * 100) : 0;
                return (
                  <tr key={c.id} className="border-b border-slate-800">
                    <td className="px-4 py-2 font-medium text-slate-100">{c.name}</td>
                    <td className="px-4 py-2">
                      <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-slate-400">{c.sent}</td>
                    <td className="px-4 py-2 text-slate-400">{c.opened}</td>
                    <td className="px-4 py-2 text-slate-400">{c.replied}</td>
                    <td className="px-4 py-2 text-slate-400">
                      {openRate}% open · {replyRate}% reply
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
