"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NAV, SETTINGS_ITEM } from "@/lib/nav";
import { cn } from "@/lib/cn";
import { ArrowLeftRight, ChevronsUpDown, Menu, Search, X } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 py-2 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-brand-900 text-xs font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold text-slate-900">
            Amenti Studio
          </span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 max-w-[85%]">
            <SidebarInner
              pathname={pathname}
              onNavigate={() => setOpen(false)}
              onClose={() => setOpen(false)}
              mobile
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-56 shrink-0 border-r border-slate-200 bg-white md:flex md:flex-col">
        <SidebarInner pathname={pathname} />
      </aside>
    </>
  );
}

function SidebarInner({
  pathname,
  onNavigate,
  onClose,
  mobile,
}: {
  pathname: string;
  onNavigate?: () => void;
  onClose?: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-900 text-white font-bold">
          A
        </div>
        <div className="flex-1 leading-tight">
          <div className="text-[11px] text-slate-500">Workspace</div>
          <div className="text-sm font-semibold">Amenti Studio</div>
        </div>
        {mobile ? (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <ChevronsUpDown className="h-4 w-4 text-slate-400" />
        )}
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
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-slate-600 hover:bg-slate-100 md:py-1.5",
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
          onClick={onNavigate}
          className="flex items-center gap-2.5 rounded-md bg-slate-900 px-2 py-2 text-[13px] font-medium text-white hover:bg-slate-800 md:py-1.5"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Open Outreach Platform
        </Link>
        <Link
          href={SETTINGS_ITEM.href}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-2.5 rounded-md px-2 py-2 text-[13px] text-slate-600 hover:bg-slate-100 md:py-1.5",
            pathname.startsWith(SETTINGS_ITEM.href) &&
              "bg-brand-50 font-medium text-brand-900"
          )}
        >
          <SETTINGS_ITEM.icon className="h-4 w-4" />
          <span>{SETTINGS_ITEM.label}</span>
        </Link>
      </div>
    </div>
  );
}
