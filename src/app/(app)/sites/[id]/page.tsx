import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RebuildForm } from "./rebuild-form";
import { ExternalLink, Sparkles } from "lucide-react";

export default async function SiteDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const site = await prisma.site.findUnique({
    where: { id },
    include: { rebuilds: { orderBy: { createdAt: "desc" } } },
  });
  if (!site) notFound();
  const headings = (site.headings as any) ?? [];
  const images = (site.images as any) ?? [];

  return (
    <>
      <Topbar title={site.title ?? "Site"} />
      <div className="flex min-h-0 flex-1 flex-col overflow-auto md:flex-row md:overflow-hidden">
        <div className="shrink-0 overflow-y-auto border-b border-slate-200 bg-white p-3 sm:p-4 md:w-96 md:border-b-0 md:border-r">
          <div className="mb-2 flex items-center gap-2">
            {site.favicon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={site.favicon} alt="" className="h-4 w-4" />
            )}
            <div className="truncate text-sm font-semibold">{site.title ?? site.url}</div>
          </div>
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-brand-700 hover:underline"
          >
            {site.url}
            <ExternalLink className="h-3 w-3" />
          </a>
          <p className="mt-3 text-xs text-slate-600">{site.description}</p>

          <Section title="Palette">
            <div className="flex flex-wrap gap-1">
              {site.palette.map((c) => (
                <span
                  key={c}
                  className="h-6 w-6 rounded border border-white shadow-sm"
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
              {site.palette.length === 0 && <span className="text-xs text-slate-400">—</span>}
            </div>
          </Section>

          <Section title="Fonts">
            <div className="flex flex-wrap gap-1">
              {site.fonts.map((f) => (
                <span key={f} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">
                  {f}
                </span>
              ))}
              {site.fonts.length === 0 && <span className="text-xs text-slate-400">—</span>}
            </div>
          </Section>

          <Section title={`Headings (${headings.length})`}>
            <ul className="space-y-1 text-xs text-slate-600">
              {headings.slice(0, 20).map((h: any, i: number) => (
                <li key={i}>
                  <span className="mr-1 rounded bg-slate-100 px-1 text-[10px] uppercase">
                    {h.tag}
                  </span>
                  {h.text}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={`Images (${images.length})`}>
            <div className="grid grid-cols-4 gap-1">
              {images.slice(0, 12).map((img: any, i: number) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt ?? ""}
                  className="h-12 w-full rounded object-cover"
                />
              ))}
            </div>
          </Section>
        </div>

        <div className="flex min-w-0 flex-1 flex-col bg-slate-50">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
            <div className="text-sm font-semibold text-slate-800">
              AI Rebuilds
            </div>
            <div className="text-xs text-slate-500">{site.rebuilds.length} total</div>
          </div>
          <div className="border-b border-slate-200 bg-white p-3">
            <RebuildForm siteId={site.id} />
          </div>
          <div className="flex-1 overflow-auto p-3 sm:p-4">
            {site.rebuilds.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400 sm:p-8">
                No rebuilds yet. Generate one above.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {site.rebuilds.map((r) => (
                  <Link
                    key={r.id}
                    href={`/sites/${site.id}/rebuild/${r.id}`}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-500"
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-brand-700" />
                      <div className="text-sm font-semibold text-slate-800">
                        Rebuild
                      </div>
                      <span className="ml-auto text-[10px] text-slate-400">
                        {r.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {r.prompt ?? "Default direction"}
                    </div>
                    <div className="mt-2 line-clamp-3 text-xs text-slate-600">
                      {r.notes}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400">
                      model: {r.model ?? "—"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </div>
      {children}
    </div>
  );
}
