import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { ContactsSubnav } from "@/components/contacts-subnav";
import { Mail, MessageSquare, Tag, Trash2, UserPlus, Zap } from "lucide-react";

export default async function BulkActionsPage() {
  const total = await prisma.contact.count();

  const actions = [
    { icon: Mail, title: "Send bulk email", desc: "Compose once, send to matching contacts with merge tags.", tone: "sky" },
    { icon: MessageSquare, title: "Send bulk SMS", desc: "Short-form text to a filtered list. Respects DND.", tone: "emerald" },
    { icon: Tag, title: "Apply tags", desc: "Add or remove tags across selected contacts.", tone: "indigo" },
    { icon: UserPlus, title: "Reassign owner", desc: "Move ownership to another team member in bulk.", tone: "amber" },
    { icon: Zap, title: "Run automation", desc: "Trigger any active automation against the list.", tone: "violet" },
    { icon: Trash2, title: "Delete contacts", desc: "Permanently remove selected records. Irreversible.", tone: "rose" },
  ];

  return (
    <>
      <Topbar title="Bulk Actions" />
      <ContactsSubnav />

      <div className="flex-1 overflow-auto bg-slate-50 p-3 sm:p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 rounded-lg border border-slate-200 bg-white p-3 sm:p-4">
            <div className="text-sm font-semibold text-slate-800">Target audience</div>
            <div className="mt-1 text-[13px] text-slate-600">
              {total.toLocaleString()} total contacts in workspace. Apply a Smart List or filter before running an action.
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <select className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700">
                <option>All contacts</option>
                <option>Leads only</option>
                <option>Customers only</option>
                <option>Unassigned</option>
              </select>
              <span className="text-[11px] text-slate-500">→ {total.toLocaleString()} selected</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.title}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4 text-left transition-shadow hover:shadow-sm"
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-md bg-${a.tone}-50 text-${a.tone}-600`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{a.title}</div>
                    <div className="text-[12px] text-slate-500">{a.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
