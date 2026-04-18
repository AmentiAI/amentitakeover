import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";

export default async function ServiceHealthPage() {
  const dbOk = await prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false);
  const hasAi = Boolean(process.env.OPENAI_API_KEY);
  const services = [
    { name: "Database (Postgres / Neon)", ok: dbOk },
    { name: "OpenAI API", ok: hasAi },
    { name: "Site scraper (fetch)", ok: true },
    { name: "Queue runner", ok: true },
    { name: "SMTP", ok: false },
    { name: "Instagram adapter", ok: false },
  ];
  return (
    <>
      <OutreachTopbar activeHref="/outreach" />
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.name}
              className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-4"
            >
              <div className="text-sm font-semibold text-white">{s.name}</div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                  s.ok
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {s.ok ? "Healthy" : "Down"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
