"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV, SETTINGS_ITEM } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { ArrowLeftRight, ChevronsUpDown, Search } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-900 text-white font-bold">
          A
        </div>
        <div className="flex-1 leading-tight">
          <div className="text-[11px] text-slate-500">Workspace</div>
          <div className="text-sm font-semibold">Amenti Studio</div>
        </div>
        <ChevronsUpDown className="h-4 w-4 text-slate-400" />
      </div>

      <div className="px-3 py-2">
        <div className="flex items-center gap-2 rounded-md bg-slate-100 px-2 py-1.5 text-xs text-slate-500">
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1">Search</span>
          <kbd className="rounded bg-white px-1.5 text-[10px] text-slate-400 shadow-sm">
            ⌘K
          </kbd>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
        {NAV.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-slate-600 hover:bg-slate-100",
                active && "bg-brand-50 font-medium text-brand-900"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-slate-200 p-2">
        <Link
          href="/outreach"
          className="flex items-center gap-2.5 rounded-md bg-slate-900 px-2 py-1.5 text-[13px] font-medium text-white hover:bg-slate-800"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Open Outreach Platform
        </Link>
        <Link
          href={SETTINGS_ITEM.href}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] text-slate-600 hover:bg-slate-100",
            pathname.startsWith(SETTINGS_ITEM.href) &&
              "bg-brand-50 font-medium text-brand-900"
          )}
        >
          <SETTINGS_ITEM.icon className="h-4 w-4" />
          <span>{SETTINGS_ITEM.label}</span>
        </Link>
      </div>
    </aside>
  );
}
