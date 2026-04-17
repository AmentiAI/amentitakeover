import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default async function RebuildView({
  params,
}: {
  params: Promise<{ id: string; rebuildId: string }>;
}) {
  const { id, rebuildId } = await params;
  const rebuild = await prisma.siteRebuild.findUnique({
    where: { id: rebuildId },
    include: { site: true },
  });
  if (!rebuild || rebuild.siteId !== id) notFound();

  return (
    <>
      <Topbar title={`Rebuild — ${rebuild.site.title ?? rebuild.site.url}`} />
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 text-xs">
        <Link
          href={`/sites/${id}`}
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to site
        </Link>
        <div className="flex items-center gap-3 text-slate-500">
          <span>model: {rebuild.model ?? "—"}</span>
          <a
            href={`/api/sites/rebuild/${rebuild.id}/preview`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-brand-700 hover:underline"
          >
            Open full preview <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div className="max-h-[30vh] shrink-0 overflow-y-auto border-b border-slate-200 bg-white p-3 sm:p-4 md:max-h-none md:w-80 md:border-b-0 md:border-r">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Direction
          </div>
          <p className="mt-1 text-sm text-slate-700">
            {rebuild.prompt ?? "Default: improve layout, clarity, and conversion."}
          </p>
          <div className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            AI Notes
          </div>
          <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
            {rebuild.notes}
          </div>
        </div>
        <div className="min-h-[60vh] flex-1 bg-slate-50 md:min-h-0">
          <iframe
            srcDoc={rebuild.html}
            className="h-full w-full bg-white"
            sandbox="allow-same-origin"
          />
        </div>
      </div>
    </>
  );
}
