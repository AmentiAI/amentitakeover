import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { ContactsSubnav } from "@/components/contacts-subnav";
import { FieldSections } from "@/components/contact-detail/field-sections";
import { ActivityTimeline } from "@/components/contact-detail/activity-timeline";
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Star,
  User as UserIcon,
  BellOff,
  MoreHorizontal,
  Users,
} from "lucide-react";

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contact = await prisma.contact.findUnique({
    where: { id },
    include: {
      business: true,
      owner: true,
      followers: { include: { user: true } },
      opportunities: { include: { stage: true, pipeline: true } },
      tasks: { orderBy: [{ done: "asc" }, { dueAt: "asc" }] },
      notes: { include: { author: true }, orderBy: { createdAt: "desc" } },
      activities: { include: { actor: true }, orderBy: { createdAt: "desc" }, take: 100 },
    },
  });
  if (!contact) return notFound();

  const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || "(no name)";
  const dnd = contact.dndCalls || contact.dndSms || contact.dndEmail;

  return (
    <>
      <Topbar title={fullName} />
      <ContactsSubnav />

      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 sm:px-4">
        <Link
          href="/contacts"
          className="inline-flex shrink-0 items-center gap-1 text-[12px] text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to contacts</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button className="rounded-md border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 sm:px-2.5 sm:text-xs">
            Email
          </button>
          <button className="rounded-md border border-slate-200 px-2 py-1.5 text-[11px] text-slate-700 hover:bg-slate-50 sm:px-2.5 sm:text-xs">
            SMS
          </button>
          <button className="rounded-md border border-slate-200 p-1.5 text-slate-700 hover:bg-slate-50">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-auto md:overflow-hidden lg:grid lg:grid-cols-[320px_1fr_280px] xl:grid-cols-[340px_1fr_300px]">
        <aside className="flex flex-col border-b border-slate-200 bg-white lg:overflow-hidden lg:border-b-0 lg:border-r">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
                {initials(fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-semibold text-slate-900">{fullName}</div>
                {contact.role && (
                  <div className="truncate text-[12px] text-slate-500">{contact.role}</div>
                )}
                {contact.business && (
                  <Link
                    href={`/companies/${contact.business.id}`}
                    className="mt-0.5 inline-flex items-center gap-1 text-[12px] text-brand-700 hover:underline"
                  >
                    <Building2 className="h-3 w-3" />
                    {contact.business.name}
                  </Link>
                )}
              </div>
              {dnd && (
                <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700">
                  <BellOff className="h-2.5 w-2.5" /> DND
                </span>
              )}
            </div>

            <div className="mt-3 space-y-1 text-[12px] text-slate-600">
              {contact.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <a href={`mailto:${contact.email}`} className="truncate hover:underline">
                    {contact.email}
                  </a>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <a href={`tel:${contact.phone}`} className="hover:underline">
                    {contact.phone}
                  </a>
                  {contact.phoneType && (
                    <span className="text-[10px] text-slate-400">· {contact.phoneType}</span>
                  )}
                </div>
              )}
            </div>

            {contact.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {contact.tags.map((t) => (
                  <span key={t} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <FieldSections contact={contact} />
        </aside>

        <section className="flex min-w-0 flex-col border-b border-slate-200 lg:overflow-hidden lg:border-b-0">
          <ActivityTimeline
            contactId={contact.id}
            activities={contact.activities.map((a) => ({
              id: a.id,
              type: a.type,
              title: a.title,
              details: a.details,
              createdAt: a.createdAt.toISOString(),
              actor: a.actor ? { id: a.actor.id, name: a.actor.name, email: a.actor.email } : null,
            }))}
            notes={contact.notes.map((n) => ({
              id: n.id,
              body: n.body,
              createdAt: n.createdAt.toISOString(),
              author: n.author ? { name: n.author.name, email: n.author.email } : null,
            }))}
            tasks={contact.tasks.map((t) => ({
              id: t.id,
              title: t.title,
              done: t.done,
              dueAt: t.dueAt ? t.dueAt.toISOString() : null,
            }))}
          />
        </section>

        <aside className="flex flex-col gap-3 bg-slate-50 p-3 sm:p-4 lg:overflow-auto lg:border-l lg:border-slate-200">
          <Panel title="Owner" icon={<UserIcon className="h-3 w-3" />}>
            <div className="text-[13px] text-slate-700">
              {contact.owner?.name ?? contact.owner?.email ?? <span className="text-slate-400">Unassigned</span>}
            </div>
          </Panel>

          <Panel title="Followers" icon={<Users className="h-3 w-3" />}>
            {contact.followers.length === 0 ? (
              <div className="text-[12px] text-slate-400">No followers yet</div>
            ) : (
              <div className="flex flex-wrap gap-1">
                {contact.followers.map((f) => (
                  <span key={f.id} className="rounded bg-white px-2 py-0.5 text-[11px] text-slate-700 shadow-sm">
                    {f.user.name ?? f.user.email}
                  </span>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Opportunities" icon={<Star className="h-3 w-3" />}>
            {contact.opportunities.length === 0 ? (
              <div className="text-[12px] text-slate-400">No open opportunities</div>
            ) : (
              <div className="space-y-1.5">
                {contact.opportunities.map((o) => (
                  <Link
                    key={o.id}
                    href={`/opportunities/${o.id}`}
                    className="block rounded-md bg-white px-2.5 py-1.5 text-[12px] shadow-sm hover:bg-slate-100"
                  >
                    <div className="truncate font-medium text-slate-800">{o.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>{o.stage.name}</span>
                      <span>${Number(o.value).toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Upcoming" icon={<Star className="h-3 w-3" />}>
            {contact.tasks.filter((t) => !t.done).length === 0 ? (
              <div className="text-[12px] text-slate-400">No upcoming tasks</div>
            ) : (
              <div className="space-y-1">
                {contact.tasks.filter((t) => !t.done).slice(0, 5).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-md bg-white px-2 py-1 text-[12px] shadow-sm">
                    <span className="truncate text-slate-700">{t.title}</span>
                    {t.dueAt && (
                      <span className="ml-2 shrink-0 text-[10px] text-slate-500">
                        {new Date(t.dueAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </aside>
      </div>
    </>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function initials(name: string): string {
  return name.split(/\s+/).map((p) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase() || "—";
}
