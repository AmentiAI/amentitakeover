import Link from "next/link";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { ContactsSubnav } from "@/components/contacts-subnav";
import { Calendar, CheckCircle2, Circle, Plus, User } from "lucide-react";

export default async function ContactTasksPage() {
  const tasks = await prisma.task.findMany({
    where: { contactId: { not: null } },
    include: { assignee: true, contact: true },
    orderBy: [{ done: "asc" }, { dueAt: "asc" }],
    take: 200,
  });

  const groups: Record<string, typeof tasks> = {
    overdue: [],
    today: [],
    upcoming: [],
    nodate: [],
    done: [],
  };
  const now = new Date();
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  for (const t of tasks) {
    if (t.done) groups.done.push(t);
    else if (!t.dueAt) groups.nodate.push(t);
    else if (t.dueAt < now) groups.overdue.push(t);
    else if (t.dueAt <= endOfToday) groups.today.push(t);
    else groups.upcoming.push(t);
  }

  return (
    <>
      <Topbar title="Tasks" />
      <ContactsSubnav />

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="text-[11px] text-slate-500">{tasks.length} tasks</div>
        <button className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-3.5 w-3.5" /> New task
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <TaskGroup title="Overdue" tone="rose" tasks={groups.overdue} />
          <TaskGroup title="Today" tone="amber" tasks={groups.today} />
          <TaskGroup title="Upcoming" tone="sky" tasks={groups.upcoming} />
          <TaskGroup title="No due date" tone="slate" tasks={groups.nodate} />
          <TaskGroup title="Completed" tone="emerald" tasks={groups.done} />
        </div>
      </div>
    </>
  );
}

function TaskGroup({
  title,
  tone,
  tasks,
}: {
  title: string;
  tone: "rose" | "amber" | "sky" | "slate" | "emerald";
  tasks: Awaited<ReturnType<typeof prisma.task.findMany>> extends infer T ? T : never;
}) {
  const toneMap = {
    rose: "border-rose-200 text-rose-700 bg-rose-50",
    amber: "border-amber-200 text-amber-700 bg-amber-50",
    sky: "border-sky-200 text-sky-700 bg-sky-50",
    slate: "border-slate-200 text-slate-700 bg-slate-100",
    emerald: "border-emerald-200 text-emerald-700 bg-emerald-50",
  };
  if (!tasks.length) return null;
  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] ${toneMap[tone]}`}>
          {tasks.length}
        </span>
      </div>
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
        {tasks.map((t: any) => (
          <div key={t.id} className="flex items-start gap-2 px-3 py-2 text-sm sm:items-center sm:gap-3">
            {t.done ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500 sm:mt-0" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 sm:mt-0" />
            )}
            <div className="min-w-0 flex-1">
              <div className={`truncate ${t.done ? "text-slate-400 line-through" : "text-slate-800"}`}>
                {t.title}
              </div>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                {t.contact && (
                  <Link
                    href={`/contacts/${t.contact.id}`}
                    className="truncate text-[11px] text-slate-500 hover:text-brand-700"
                  >
                    {[t.contact.firstName, t.contact.lastName].filter(Boolean).join(" ") || "(no name)"}
                  </Link>
                )}
                {t.dueAt && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="h-3 w-3" />
                    {new Date(t.dueAt).toLocaleDateString()}
                  </div>
                )}
                {t.assignee && (
                  <div className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                    <User className="h-3 w-3" />
                    <span className="truncate">{t.assignee.name ?? t.assignee.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
