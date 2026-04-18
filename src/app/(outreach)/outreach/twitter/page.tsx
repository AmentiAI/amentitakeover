import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";

export default async function TwitterPage() {
  const accounts = await prisma.socialAccount.findMany({
    where: { platform: "twitter" },
    orderBy: { followers: "desc" },
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/twitter" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="rounded-lg border border-slate-800 bg-slate-950">
          <table className="w-full border-collapse text-sm">
            <thead className="text-left text-[10px] uppercase tracking-wider text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="px-4 py-2">Handle</th>
                <th className="px-4 py-2">Followers</th>
                <th className="px-4 py-2">Following</th>
                <th className="px-4 py-2">Engagement</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-500">
                    No Twitter accounts tracked yet.
                  </td>
                </tr>
              )}
              {accounts.map((a) => (
                <tr key={a.id} className="border-b border-slate-800">
                  <td className="px-4 py-2 font-medium text-slate-100">
                    @{a.handle}
                  </td>
                  <td className="px-4 py-2 text-slate-400">{a.followers.toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-400">{a.following.toLocaleString()}</td>
                  <td className="px-4 py-2 text-slate-400">{(a.engagement * 100).toFixed(1)}%</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[10px] ${
                        a.active
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                          : "border-slate-700 bg-slate-800 text-slate-400"
                      }`}
                    >
                      {a.active ? "Active" : "Paused"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
