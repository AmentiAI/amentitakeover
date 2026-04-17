import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { Megaphone, Plus } from "lucide-react";

export default async function MarketingPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <Topbar title="Marketing" />
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="text-sm text-slate-500">
          {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}
        </div>
        <button className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-3.5 w-3.5" /> New campaign
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-slate-50 p-4">
        {campaigns.length === 0 ? (
          <div className="flex items-center justify-center">
            <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Megaphone className="h-6 w-6" />
              </div>
              <div className="mb-1 text-base font-semibold text-slate-800">
                No campaigns yet
              </div>
              <p className="text-sm text-slate-500">
                Create an email or SMS campaign and we'll track sends, opens,
                and replies.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead className="bg-white text-left text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Channel</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Sent</th>
                <th className="px-4 py-2">Opened</th>
                <th className="px-4 py-2">Replied</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 bg-white">
                  <td className="px-4 py-2 font-medium text-slate-800">{c.name}</td>
                  <td className="px-4 py-2 text-slate-600">{c.channel}</td>
                  <td className="px-4 py-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-700">
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{c.sent}</td>
                  <td className="px-4 py-2 text-slate-600">{c.opened}</td>
                  <td className="px-4 py-2 text-slate-600">{c.replied}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
