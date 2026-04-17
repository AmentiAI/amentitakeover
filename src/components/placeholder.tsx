import { Topbar } from "./topbar";
import type { LucideIcon } from "lucide-react";

export function Placeholder({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: LucideIcon;
  children?: React.ReactNode;
}) {
  return (
    <>
      <Topbar title={title} />
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-8">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          {Icon && (
            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-brand-50 text-brand-700">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div className="mb-1 text-base font-semibold text-slate-800">{title}</div>
          <p className="text-sm text-slate-500">
            {children ??
              "This module is scaffolded and connected to the database. Configure to get started."}
          </p>
        </div>
      </div>
    </>
  );
}
