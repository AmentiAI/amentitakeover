import { Topbar } from "@/components/topbar";
import { Store } from "lucide-react";

const APPS = [
  { name: "Stripe", desc: "Payments + invoices", cat: "Payments" },
  { name: "Twilio", desc: "SMS + voice", cat: "Messaging" },
  { name: "Gmail", desc: "Inbox sync", cat: "Messaging" },
  { name: "Google Calendar", desc: "2-way calendar sync", cat: "Calendars" },
  { name: "Slack", desc: "Workspace alerts", cat: "Notifications" },
  { name: "Zapier", desc: "5000+ integrations", cat: "Automation" },
];

export default function MarketplacePage() {
  return (
    <>
      <Topbar title="App Marketplace" />
      <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-700 text-white">
            <Store className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900">
              App Marketplace
            </div>
            <div className="text-xs text-slate-500">
              Connect third-party services.
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {APPS.map((a) => (
            <div
              key={a.name}
              className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-800">{a.name}</div>
              <div className="text-xs text-slate-500">{a.desc}</div>
              <div className="mt-3 flex items-center justify-between">
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                  {a.cat}
                </span>
                <button className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50">
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
