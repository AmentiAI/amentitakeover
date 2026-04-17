import Link from "next/link";
import { prisma } from "@/lib/db";
import { Topbar } from "@/components/topbar";
import { ContactsSubnav } from "@/components/contacts-subnav";
import { Building2, Globe, MapPin, Plus, Users } from "lucide-react";

export default async function CompaniesPage() {
  const businesses = await prisma.business.findMany({
    include: {
      _count: { select: { contacts: true, opportunities: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <>
      <Topbar title="Companies" />
      <ContactsSubnav />

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2">
        <div className="text-[11px] text-slate-500">{businesses.length} companies</div>
        <button className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">
          <Plus className="h-3.5 w-3.5" /> Add company
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
          {businesses.map((b) => (
            <Link
              key={b.id}
              href={`/companies/${b.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
            >
              <div className="mb-2 flex items-start gap-2">
                <div className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 text-slate-500">
                  <Building2 className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-slate-800">{b.name}</div>
                  {b.industry && (
                    <div className="truncate text-[11px] text-slate-500">{b.industry}</div>
                  )}
                </div>
              </div>
              <div className="space-y-1 text-[12px] text-slate-500">
                {b.website && (
                  <div className="flex items-center gap-1 truncate">
                    <Globe className="h-3 w-3 shrink-0" />
                    <span className="truncate">{b.website.replace(/^https?:\/\//, "")}</span>
                  </div>
                )}
                {(b.city || b.state) && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[b.city, b.state].filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {b._count.contacts} contacts
                </span>
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {b._count.opportunities} opps
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
