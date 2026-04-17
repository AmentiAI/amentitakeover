import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { Plus, Workflow } from "lucide-react";

export default async function AutomationPage() {
  const automations = await prisma.automation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <Topbar title="Automation" />
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="text-sm text-slate-500">
          {automations.length} workflow{automations.length === 1 ? "" : "s"}
        </div>
        <button className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-3.5 w-3.5" /> New workflow
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-slate-50 p-4">
        {automations.length === 0 ? (
          <div className="flex items-center justify-center">
            <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
                <Workflow className="h-6 w-6" />
              </div>
              <div className="mb-1 text-base font-semibold text-slate-800">
                No workflows yet
              </div>
              <p className="text-sm text-slate-500">
                Trigger actions from events like "new opportunity", "stage
                changed", or "message received".
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {automations.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="font-semibold text-slate-800">{a.name}</div>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      a.active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {a.active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="text-xs text-slate-500">Trigger: {a.trigger}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
