"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, CheckSquare, Layers, Users2 } from "lucide-react";

const TABS = [
  { label: "Smart Lists", href: "/contacts", icon: Bookmark, match: (p: string) => p === "/contacts" || p.startsWith("/contacts/list") || /^\/contacts\/[^/]+$/.test(p) },
  { label: "Bulk Actions", href: "/contacts/bulk", icon: Layers, match: (p: string) => p.startsWith("/contacts/bulk") },
  { label: "Tasks", href: "/contacts/tasks", icon: CheckSquare, match: (p: string) => p.startsWith("/contacts/tasks") },
  { label: "Companies", href: "/contacts/companies", icon: Users2, match: (p: string) => p.startsWith("/contacts/companies") },
];

export function ContactsSubnav() {
  const pathname = usePathname() || "";
  return (
    <div className="flex items-center gap-1 border-b border-slate-200 bg-white px-3">
      {TABS.map((t) => {
        const Active = t.match(pathname);
        const Icon = t.icon;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-[13px] transition-colors ${
              Active
                ? "border-brand-600 text-brand-700 font-medium"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
