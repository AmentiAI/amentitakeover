import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { getTemplatePreviewUrl } from "@/lib/site-url";
import { NextStepsPanel } from "./next-steps";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  ExternalLink,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const opp = await prisma.opportunity.findUnique({
    where: { id },
    include: {
      pipeline: { include: { stages: { orderBy: { position: "asc" } } } },
      stage: true,
      business: { include: { sites: { orderBy: { createdAt: "desc" }, take: 1 } } },
      contact: true,
      owner: true,
      tasks: { orderBy: { dueAt: "asc" } },
      activities: { orderBy: { createdAt: "desc" }, take: 30, include: { actor: true } },
      appointments: { orderBy: { startsAt: "asc" }, take: 5 },
    },
  });

  if (!opp) notFound();

  // Find linked scraped business (by "<scrapeId>_crm" convention from sync-crm)
  const scrapedId = opp.businessId?.endsWith("_crm")
    ? opp.businessId.replace(/_crm$/, "")
    : null;
  const scraped = scrapedId
    ? await prisma.scrapedBusiness.findUnique({ where: { id: scrapedId } })
    : null;

  const siblingContacts = opp.businessId
    ? await prisma.contact.findMany({
        where: { businessId: opp.businessId, NOT: opp.contactId ? { id: opp.contactId } : undefined },
        take: 10,
      })
    : [];

  const notes = opp.contactId
    ? await prisma.note.findMany({
        where: { contactId: opp.contactId },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { author: true },
      })
    : [];

  const templateUrl = scraped ? getTemplatePreviewUrl(scraped.id) : null;
  const liveSite = opp.business?.sites?.[0];

  const stages = opp.pipeline.stages;
  const currentIdx = stages.findIndex((s) => s.id === opp.stage.id);
  const nextStage = currentIdx >= 0 && currentIdx < stages.length - 1 ? stages[currentIdx + 1] : null;
  const openTask = opp.tasks.find((t) => !t.done) ?? null;

  return (
    <>
      <Topbar title="Opportunity" />

      <div className="flex flex-col gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-sm sm:gap-3">
          <Link
            href="/opportunities"
            className="inline-flex shrink-0 items-center gap-1 text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Back to pipeline</span><span className="sm:hidden">Back</span>
          </Link>
          <span className="hidden text-slate-300 sm:inline">/</span>
          <span className="truncate font-semibold text-slate-900">{opp.title}</span>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {templateUrl && (
            <Link
              href={templateUrl}
              target="_blank"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:px-3"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Preview template</span><span className="sm:hidden">Preview</span>
            </Link>
          )}
          {opp.business?.website && (
            <a
              href={opp.business.website}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:px-3"
            >
              <Globe className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open website</span><span className="sm:hidden">Site</span>
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-slate-50">
        <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-4 sm:space-y-5">
            {/* Top summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Opportunity
                  </div>
                  <div className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                    {opp.title}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-600 sm:gap-x-4">
                    <span className="inline-flex items-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: opp.stage.color }}
                      />
                      {opp.stage.name}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span>{opp.pipeline.name}</span>
                    {opp.source && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1">
                          <Tag className="h-3 w-3" /> {opp.source}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-right sm:px-5 sm:py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Value
                  </div>
                  <div className="mt-1 text-lg font-semibold text-emerald-600 sm:text-xl">
                    ${Number(opp.value).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Stage progress bar */}
              <div className="mt-5 sm:mt-6">
                <div className="-mx-1 flex items-center gap-1 overflow-x-auto px-1 pb-1">
                  {opp.pipeline.stages.map((s, i) => {
                    const isActive = s.id === opp.stage.id;
                    const currentIdx = opp.pipeline.stages.findIndex((x) => x.id === opp.stage.id);
                    const passed = i < currentIdx;
                    return (
                      <div
                        key={s.id}
                        className={`min-w-[88px] shrink-0 flex-1 rounded-md px-2 py-1.5 text-center text-[10.5px] font-medium uppercase tracking-wide ${
                          isActive
                            ? "text-white"
                            : passed
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                        }`}
                        style={isActive ? { background: s.color } : undefined}
                      >
                        {s.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <NextStepsPanel
              opportunityId={opp.id}
              currentStage={{ id: opp.stage.id, name: opp.stage.name, color: opp.stage.color, position: opp.stage.position }}
              nextStage={
                nextStage
                  ? { id: nextStage.id, name: nextStage.name, color: nextStage.color, position: nextStage.position }
                  : null
              }
              nextTask={
                openTask
                  ? {
                      id: openTask.id,
                      title: openTask.title,
                      dueAt: openTask.dueAt ? openTask.dueAt.toISOString() : null,
                      done: openTask.done,
                    }
                  : null
              }
              phone={opp.contact?.phone ?? opp.business?.phone ?? null}
              email={opp.contact?.email ?? opp.business?.email ?? null}
            />

            {/* Business + Contact two-col */}
            <div className="grid gap-5 md:grid-cols-2">
              <Card title="Business" icon={<Building2 className="h-4 w-4" />}>
                {opp.business ? (
                  <div className="space-y-2.5 text-sm">
                    <div className="text-base font-semibold text-slate-900">
                      {opp.business.name}
                    </div>
                    {opp.business.industry && (
                      <Row icon={<Tag className="h-3.5 w-3.5" />} label={opp.business.industry} />
                    )}
                    {(opp.business.city || opp.business.state) && (
                      <Row
                        icon={<MapPin className="h-3.5 w-3.5" />}
                        label={[opp.business.address, opp.business.city, opp.business.state, opp.business.zip]
                          .filter(Boolean)
                          .join(", ")}
                      />
                    )}
                    {opp.business.phone && (
                      <Row
                        icon={<Phone className="h-3.5 w-3.5" />}
                        label={
                          <a href={`tel:${opp.business.phone}`} className="text-sky-600 hover:text-sky-700">
                            {opp.business.phone}
                          </a>
                        }
                      />
                    )}
                    {opp.business.email && (
                      <Row
                        icon={<Mail className="h-3.5 w-3.5" />}
                        label={
                          <a href={`mailto:${opp.business.email}`} className="text-sky-600 hover:text-sky-700">
                            {opp.business.email}
                          </a>
                        }
                      />
                    )}
                    {opp.business.website && (
                      <Row
                        icon={<Globe className="h-3.5 w-3.5" />}
                        label={
                          <a href={opp.business.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700">
                            {opp.business.website.replace(/^https?:\/\//, "")}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        }
                      />
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No business linked.</div>
                )}
              </Card>

              <Card
                title="Primary contact"
                icon={<User className="h-4 w-4" />}
                action={
                  opp.contact ? (
                    <Link
                      href={`/contacts/${opp.contact.id}`}
                      className="text-[11px] font-medium text-sky-600 hover:text-sky-700"
                    >
                      Open contact →
                    </Link>
                  ) : null
                }
              >
                {opp.contact ? (
                  <div className="space-y-2.5 text-sm">
                    <div className="text-base font-semibold text-slate-900">
                      {[opp.contact.firstName, opp.contact.lastName].filter(Boolean).join(" ") || "(no name)"}
                    </div>
                    {opp.contact.role && (
                      <Row icon={<Tag className="h-3.5 w-3.5" />} label={opp.contact.role} />
                    )}
                    {opp.contact.phone && (
                      <Row
                        icon={<Phone className="h-3.5 w-3.5" />}
                        label={
                          <a href={`tel:${opp.contact.phone}`} className="text-sky-600 hover:text-sky-700">
                            {opp.contact.phone}
                          </a>
                        }
                      />
                    )}
                    {opp.contact.email && (
                      <Row
                        icon={<Mail className="h-3.5 w-3.5" />}
                        label={
                          <a href={`mailto:${opp.contact.email}`} className="text-sky-600 hover:text-sky-700">
                            {opp.contact.email}
                          </a>
                        }
                      />
                    )}
                    {(opp.contact.instagram || opp.contact.facebook || opp.contact.linkedin || opp.contact.twitter) && (
                      <div className="flex items-center gap-2 pt-1 text-slate-500">
                        {opp.contact.instagram && <SocialIcon href={opp.contact.instagram} icon={<Instagram className="h-3.5 w-3.5" />} />}
                        {opp.contact.facebook && <SocialIcon href={opp.contact.facebook} icon={<Facebook className="h-3.5 w-3.5" />} />}
                        {opp.contact.linkedin && <SocialIcon href={opp.contact.linkedin} icon={<Linkedin className="h-3.5 w-3.5" />} />}
                        {opp.contact.twitter && <SocialIcon href={opp.contact.twitter} icon={<Twitter className="h-3.5 w-3.5" />} />}
                      </div>
                    )}
                    {opp.contact.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {opp.contact.tags.map((t) => (
                          <span key={t} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] text-slate-600">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No contact linked to this opportunity.</div>
                )}
              </Card>
            </div>

            {/* Sibling contacts */}
            {siblingContacts.length > 0 && (
              <Card title="Other contacts at this business" icon={<User className="h-4 w-4" />}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {siblingContacts.map((c) => (
                    <Link
                      key={c.id}
                      href={`/contacts/${c.id}`}
                      className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm hover:border-slate-300 hover:bg-white"
                    >
                      <div>
                        <div className="font-medium text-slate-900">
                          {[c.firstName, c.lastName].filter(Boolean).join(" ") || "(no name)"}
                        </div>
                        <div className="text-xs text-slate-500">{c.email ?? c.phone ?? "—"}</div>
                      </div>
                      <span className="text-xs text-slate-400">View →</span>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {/* Website / generated template */}
            <Card title="Website & generated template" icon={<Globe className="h-4 w-4" />}>
              <div className="grid gap-3 md:grid-cols-2">
                <PanelTile
                  title="Their live site"
                  value={opp.business?.website ?? liveSite?.url ?? null}
                  href={opp.business?.website ?? liveSite?.url ?? null}
                  emptyLabel="No website on file"
                />
                <PanelTile
                  title="Our template preview"
                  value={templateUrl ? `Roofing template · ${scraped?.name ?? ""}` : null}
                  href={templateUrl}
                  emptyLabel="No template rendered yet"
                  accent
                />
                {liveSite && (
                  <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
                    <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Scraped site snapshot
                    </div>
                    {liveSite.title && <div className="font-medium text-slate-900">{liveSite.title}</div>}
                    {liveSite.description && (
                      <p className="mt-1 line-clamp-3 text-slate-600">{liveSite.description}</p>
                    )}
                    {liveSite.palette.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-slate-500">Palette</span>
                        <div className="flex gap-1">
                          {liveSite.palette.slice(0, 6).map((c) => (
                            <span
                              key={c}
                              title={c}
                              className="h-4 w-4 rounded-full border border-slate-200"
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>

            {/* Tasks */}
            <Card
              title={`Tasks (${opp.tasks.length})`}
              icon={<CheckCircle2 className="h-4 w-4" />}
            >
              {opp.tasks.length === 0 ? (
                <div className="text-sm text-slate-500">No tasks yet.</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {opp.tasks.map((t) => (
                    <li key={t.id} className="flex items-start gap-3 py-2.5 text-sm">
                      {t.done ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                      )}
                      <div className="flex-1">
                        <div className={t.done ? "text-slate-400 line-through" : "text-slate-800"}>
                          {t.title}
                        </div>
                        {t.dueAt && (
                          <div className="text-xs text-slate-500">
                            Due {new Date(t.dueAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {/* Appointments */}
            {opp.appointments.length > 0 && (
              <Card
                title={`Upcoming appointments`}
                icon={<Calendar className="h-4 w-4" />}
              >
                <ul className="divide-y divide-slate-100">
                  {opp.appointments.map((a) => (
                    <li key={a.id} className="flex items-start gap-3 py-2.5 text-sm">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <div>
                        <div className="font-medium text-slate-900">{a.title}</div>
                        <div className="text-xs text-slate-500">
                          {new Date(a.startsAt).toLocaleString()}
                          {a.location ? ` · ${a.location}` : ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Notes */}
            {notes.length > 0 && (
              <Card title="Notes" icon={<Tag className="h-4 w-4" />}>
                <ul className="space-y-3">
                  {notes.map((n) => (
                    <li key={n.id} className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
                      <div className="text-slate-800 whitespace-pre-wrap">{n.body}</div>
                      <div className="mt-2 text-[11px] text-slate-500">
                        {n.author?.name ?? "Someone"} · {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </div>

        {/* Right rail: activity */}
        <aside className="hidden w-[340px] shrink-0 overflow-y-auto border-l border-slate-200 bg-white p-5 lg:block">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Activity
          </div>
          {opp.activities.length === 0 ? (
            <div className="text-sm text-slate-500">No activity yet.</div>
          ) : (
            <ol className="relative space-y-4 border-l border-slate-200 pl-4">
              {opp.activities.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-300 ring-4 ring-white" />
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {a.type.replace(/_/g, " ")}
                  </div>
                  <div className="mt-0.5 text-sm text-slate-800">{a.title}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    {a.actor?.name ?? "System"} · {new Date(a.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>
    </>
  );
}

function Card({
  title,
  icon,
  children,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <header className="mb-3 flex items-center justify-between gap-2 sm:mb-4">
        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold text-slate-900">
          {icon && <span className="shrink-0 text-slate-500">{icon}</span>}
          <span className="truncate">{title}</span>
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

function Row({ icon, label }: { icon: React.ReactNode; label: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-700">
      <span className="mt-0.5 text-slate-400">{icon}</span>
      <span className="flex-1">{label}</span>
    </div>
  );
}

function SocialIcon({ href, icon }: { href: string; icon: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="grid h-7 w-7 place-items-center rounded-full border border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900"
    >
      {icon}
    </a>
  );
}

function PanelTile({
  title,
  value,
  href,
  emptyLabel,
  accent,
}: {
  title: string;
  value: string | null;
  href: string | null;
  emptyLabel: string;
  accent?: boolean;
}) {
  const clickable = href != null;
  const Comp: any = clickable ? "a" : "div";
  return (
    <Comp
      href={href ?? undefined}
      target={clickable ? "_blank" : undefined}
      rel={clickable ? "noreferrer" : undefined}
      className={`flex items-center justify-between gap-3 rounded-lg border p-4 transition ${
        clickable
          ? accent
            ? "border-emerald-200 bg-emerald-50 hover:border-emerald-300"
            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          : "border-dashed border-slate-200 bg-slate-50"
      }`}
    >
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{title}</div>
        <div
          className={`mt-1 truncate text-sm ${
            clickable ? (accent ? "font-semibold text-emerald-700" : "font-medium text-slate-900") : "text-slate-500"
          }`}
        >
          {value ?? emptyLabel}
        </div>
      </div>
      {clickable && <ExternalLink className={`h-4 w-4 shrink-0 ${accent ? "text-emerald-600" : "text-slate-400"}`} />}
    </Comp>
  );
}
