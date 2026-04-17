import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { Calendar, Clock, MapPin, Plus } from "lucide-react";

export default async function CalendarsPage() {
  const calendars = await prisma.calendar.findMany();
  const upcoming = await prisma.appointment.findMany({
    include: { calendar: true, opportunity: { include: { business: true } } },
    orderBy: { startsAt: "asc" },
    take: 50,
  });

  return (
    <>
      <Topbar title="Calendars" />
      <div className="flex min-h-0 flex-1">
        <div className="w-64 shrink-0 border-r border-slate-200 bg-white p-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              My Calendars
            </div>
            <button className="grid h-6 w-6 place-items-center rounded hover:bg-slate-100">
              <Plus className="h-3.5 w-3.5 text-slate-500" />
            </button>
          </div>
          <div className="space-y-1">
            {calendars.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                <span className="text-slate-700">{c.name}</span>
              </div>
            ))}
            {calendars.length === 0 && (
              <div className="text-xs text-slate-400">No calendars</div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-semibold text-slate-800">Upcoming</div>
            <button className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
              <Plus className="h-3.5 w-3.5" /> New appointment
            </button>
          </div>
          <div className="space-y-2">
            {upcoming.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
                No upcoming appointments.
              </div>
            )}
            {upcoming.map((a) => (
              <div
                key={a.id}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
              >
                <div
                  className="mt-0.5 h-8 w-1 rounded"
                  style={{ backgroundColor: a.calendar.color }}
                />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">
                    {a.title}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {a.startsAt.toISOString().slice(0, 10)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {a.startsAt.toISOString().slice(11, 16)} –{" "}
                      {a.endsAt.toISOString().slice(11, 16)}
                    </span>
                    {a.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {a.location}
                      </span>
                    )}
                    {a.opportunity?.business?.name && (
                      <span>· {a.opportunity.business.name}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
