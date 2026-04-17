import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";
import { getTemplatePreviewUrl, normalizeTemplateChoice } from "@/lib/site-url";
import { EmailGenForm } from "./form";
import { DraftPreview } from "./preview";

export default async function EmailGenPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const params = await searchParams;
  const drafts = await prisma.emailDraft.findMany({
    include: { scrapedBusiness: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const candidates = await prisma.scrapedBusiness.findMany({
    where: { archived: false, email: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const selected =
    (params.draft && drafts.find((d) => d.id === params.draft)) || drafts[0] || null;

  const selectedTemplate = selected?.scrapedBusiness
    ? normalizeTemplateChoice(selected.scrapedBusiness.templateChoice)
    : "roofing";

  const siteUrl =
    selected?.scrapedBusinessId != null
      ? getTemplatePreviewUrl(selected.scrapedBusinessId, {
          trackingToken: selected.id,
          template: selectedTemplate,
        })
      : null;

  // Fan out to count mockup opens per draft. One query, group in JS.
  const draftIds = drafts.map((d) => d.id);
  const viewEvents = draftIds.length
    ? await prisma.activityEvent.findMany({
        where: {
          type: "template.viewed",
          OR: draftIds.map((id) => ({
            details: { path: ["draftId"], equals: id },
          })),
        },
        select: { details: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const viewsByDraft = new Map<string, { count: number; lastAt: Date }>();
  for (const ev of viewEvents) {
    const detail = ev.details as { draftId?: unknown } | null;
    const did = typeof detail?.draftId === "string" ? detail.draftId : null;
    if (!did) continue;
    const cur = viewsByDraft.get(did);
    if (cur) cur.count += 1;
    else viewsByDraft.set(did, { count: 1, lastAt: ev.createdAt });
  }
  const selectedViews = selected ? viewsByDraft.get(selected.id) ?? null : null;

  return (
    <>
      <OutreachTopbar activeHref="/outreach/email-gen" />
      <div className="flex min-h-0 flex-1">
        <div className="w-96 shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950 p-4">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            New email
          </div>
          <EmailGenForm
            candidates={candidates.map((c) => ({
              id: c.id,
              name: c.name,
              email: c.email,
              templateChoice: normalizeTemplateChoice(c.templateChoice),
            }))}
          />

          <div className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Recent drafts
          </div>
          <div className="mt-2 space-y-2">
            {drafts.map((d) => {
              const active = selected?.id === d.id;
              const statusStyle =
                d.status === "sent"
                  ? "border-emerald-900 text-emerald-400"
                  : d.status === "failed"
                    ? "border-rose-900 text-rose-400"
                    : d.status === "sending"
                      ? "border-sky-900 text-sky-400"
                      : "border-slate-700 text-slate-400";
              const v = viewsByDraft.get(d.id);
              return (
                <a
                  key={d.id}
                  href={`/outreach/email-gen?draft=${d.id}`}
                  className={`block rounded border p-3 transition ${
                    active
                      ? "border-indigo-600 bg-indigo-950/30"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate text-xs font-semibold text-white">
                      {d.subject}
                    </div>
                    <span
                      className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${statusStyle}`}
                    >
                      {d.status}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <div className="truncate text-[11px] text-slate-500">
                      {d.scrapedBusiness?.name ?? "—"}
                    </div>
                    {v && (
                      <span
                        className="shrink-0 rounded border border-emerald-900/70 bg-emerald-950/40 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-emerald-300"
                        title={`Last opened ${v.lastAt.toLocaleString()}`}
                      >
                        {v.count} {v.count === 1 ? "open" : "opens"}
                      </span>
                    )}
                  </div>
                </a>
              );
            })}
            {drafts.length === 0 && (
              <div className="text-xs text-slate-500">No drafts yet.</div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {selected ? (
            <DraftPreview
              draft={{
                id: selected.id,
                subject: selected.subject,
                body: selected.body,
                status: selected.status,
                tone: selected.tone,
                model: selected.model,
                sentAt: selected.sentAt ? selected.sentAt.toISOString() : null,
                scrapedBusiness: selected.scrapedBusiness
                  ? {
                      id: selected.scrapedBusiness.id,
                      name: selected.scrapedBusiness.name,
                      email: selected.scrapedBusiness.email,
                    }
                  : null,
              }}
              siteUrl={siteUrl}
              views={selectedViews ? { count: selectedViews.count, lastAt: selectedViews.lastAt.toISOString() } : null}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Write an email or generate one with AI on the left.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
