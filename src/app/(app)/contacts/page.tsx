import Link from "next/link";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { ContactsSubnav } from "@/components/contacts-subnav";
import { Mail, Phone, Plus, Search, Tag, BellOff } from "lucide-react";

export default async function ContactsPage() {
  const contacts = await prisma.contact.findMany({
    include: { business: true, owner: true },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const smartLists = await (prisma as any).smartList
    ?.findMany({
      where: { scope: "contacts" },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    })
    .catch(() => []) ?? [];

  return (
    <>
      <Topbar title="Contacts" />
      <ContactsSubnav />

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500">
            <Search className="h-3.5 w-3.5" />
            <input
              placeholder="Search by name, email, phone, tag"
              className="w-72 bg-transparent outline-none placeholder:text-slate-400"
            />
          </div>
          <span className="text-[11px] text-slate-500">{contacts.length} contacts</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
            Import
          </button>
          <button className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50">
            Export
          </button>
          <button className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
            <Plus className="h-3.5 w-3.5" /> Add contact
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 overflow-auto border-r border-slate-200 bg-slate-50 p-3 text-sm">
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            <span>Smart Lists</span>
            <button className="text-slate-400 hover:text-slate-700">+</button>
          </div>
          <SmartListItem label="All contacts" href="/contacts" count={contacts.length} active />
          <SmartListItem label="Leads" href="/contacts?type=Lead" count={contacts.filter(c => (c.contactType || "Lead") === "Lead").length} />
          <SmartListItem label="Customers" href="/contacts?type=Customer" count={contacts.filter(c => c.contactType === "Customer").length} />
          <SmartListItem label="Unassigned" href="/contacts?owner=unassigned" count={contacts.filter(c => !c.ownerId).length} />
          <SmartListItem label="DND" href="/contacts?dnd=1" count={contacts.filter(c => c.dndCalls || c.dndSms || c.dndEmail).length} />
          {smartLists.length > 0 && (
            <div className="mt-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Saved
            </div>
          )}
          {smartLists.map((l: { id: string; name: string }) => (
            <SmartListItem key={l.id} label={l.name} href={`/contacts?list=${l.id}`} count={0} />
          ))}
        </aside>

        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 bg-slate-50 text-left text-[11px] uppercase tracking-wide text-slate-500 shadow-[inset_0_-1px_0_#e2e8f0]">
              <tr>
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" className="h-3.5 w-3.5" />
                </th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Business</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Owner</th>
                <th className="px-3 py-2">Tags</th>
                <th className="px-3 py-2">DND</th>
                <th className="px-3 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {contacts.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-slate-400">
                    No contacts yet. Seed the DB to bootstrap.
                  </td>
                </tr>
              )}
              {contacts.map((c) => {
                const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || "(no name)";
                const dnd = c.dndCalls || c.dndSms || c.dndEmail;
                return (
                  <tr key={c.id} className="group border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">
                      <input type="checkbox" className="h-3.5 w-3.5" />
                    </td>
                    <td className="px-3 py-2">
                      <Link href={`/contacts/${c.id}`} className="font-medium text-slate-800 hover:text-brand-700">
                        {name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-slate-600">{c.business?.name ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {c.email ? (
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          {c.email}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {c.phone ? (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          {c.phone}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {c.owner?.name ?? <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">
                        {c.tags.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600"
                          >
                            <Tag className="h-2.5 w-2.5" />
                            {t}
                          </span>
                        ))}
                        {c.tags.length > 3 && (
                          <span className="text-[10px] text-slate-400">+{c.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {dnd ? (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-700">
                          <BellOff className="h-2.5 w-2.5" /> DND
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {c.createdAt.toISOString().slice(0, 10)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function SmartListItem({ label, href, count, active = false }: { label: string; href: string; count: number; active?: boolean }) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded px-2 py-1 text-[13px] ${
        active ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-700 hover:bg-white"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className="text-[10px] text-slate-400">{count}</span>
    </Link>
  );
}
