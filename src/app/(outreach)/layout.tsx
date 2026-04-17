import { OutreachSidebar } from "@/components/outreach-sidebar";

export default function OutreachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
      <OutreachSidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
