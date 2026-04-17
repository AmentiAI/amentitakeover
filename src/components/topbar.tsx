import { Bell, HelpCircle, MessageSquare, Sparkles } from "lucide-react";

export function Topbar({ title }: { title: string }) {
  return (
    <header className="flex h-12 items-center justify-between border-b border-slate-200 bg-white px-4">
      <div className="flex items-center gap-3">
        <h1 className="text-[15px] font-semibold text-slate-800">{title}</h1>
      </div>
      <div className="flex items-center gap-2 text-slate-500">
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100">
          <Sparkles className="h-4 w-4" />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100">
          <MessageSquare className="h-4 w-4" />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100">
          <HelpCircle className="h-4 w-4" />
        </button>
        <button className="grid h-8 w-8 place-items-center rounded-md hover:bg-slate-100">
          <Bell className="h-4 w-4" />
        </button>
        <div className="ml-2 grid h-8 w-8 place-items-center rounded-full bg-brand-700 text-xs font-semibold text-white">
          W
        </div>
      </div>
    </header>
  );
}
