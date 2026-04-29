import Link from "next/link";
import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import { NewCampaignButton } from "./new-campaign-button";

export const dynamic = "force-dynamic";

export default async function OutreachCampaignsPage() {
  const campaigns = await prisma.campaign.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/email-campaigns" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {campaigns.length} campaign{campaigns.length === 1 ? "" : "s"}
          </div>
          <NewCampaignButton />
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
              {campaigns.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-500">
                    No campaigns yet. Click <span className="text-slate-300">New campaign</span> to create one.
                  </td>
                </tr>
              )}
              {campaigns.map((c) => {
                const openRate = c.sent ? Math.round((c.opened / c.sent) * 100) : 0;
                const replyRate = c.sent ? Math.round((c.replied / c.sent) * 100) : 0;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-slate-800 transition hover:bg-slate-900/60"
                  >
                    <td className="px-4 py-2 font-medium text-slate-100">
                      <Link
                        href={`/outreach/email-campaigns/${c.id}`}
                        className="block hover:text-indigo-300"
                      >
                        {c.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      <Link
                        href={`/outreach/email-campaigns/${c.id}`}
                        className="block"
                      >
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                          {c.status}
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-400">
                      <Link href={`/outreach/email-campaigns/${c.id}`} className="block">
                        {c.sent}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-400">
                      <Link href={`/outreach/email-campaigns/${c.id}`} className="block">
                        {c.opened}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-400">
                      <Link href={`/outreach/email-campaigns/${c.id}`} className="block">
                        {c.replied}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-slate-400">
                      <Link href={`/outreach/email-campaigns/${c.id}`} className="block">
                        {openRate}% open · {replyRate}% reply
                      </Link>
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
