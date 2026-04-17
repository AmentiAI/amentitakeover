import { OutreachTopbar } from "@/components/outreach-topbar";
import { prisma } from "@/lib/db";

export default async function BatchJobsPage() {
  const jobs = await prisma.batchJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const scrapes = await prisma.scrapeJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return (
    <>
      <OutreachTopbar activeHref="/outreach/batch" />
      <div className="flex-1 overflow-auto p-4">
        <Section title="Scrape jobs">
          <Table
            headers={["Source", "Query", "Status", "Progress", "Created"]}
            rows={scrapes.map((s) => [
              s.source,
              JSON.stringify(s.query).slice(0, 60),
              s.status,
              `${s.progress}/${s.total}`,
              s.createdAt.toISOString().slice(0, 16).replace("T", " "),
            ])}
          />
        </Section>
        <div className="h-6" />
        <Section title="Batch jobs">
          <Table
            headers={["Type", "Name", "Status", "Progress", "Created"]}
            rows={jobs.map((j) => [
              j.type,
              j.name,
              j.status,
              `${j.completed}/${j.total}`,
              j.createdAt.toISOString().slice(0, 16).replace("T", " "),
            ])}
          />
        </Section>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {title}
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950">{children}</div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | number)[][] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <thead className="text-left text-[10px] uppercase tracking-wider text-slate-500">
        <tr className="border-b border-slate-800">
          {headers.map((h) => (
            <th key={h} className="px-4 py-2">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 && (
          <tr>
            <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-500">
              No records.
            </td>
          </tr>
        )}
        {rows.map((r, i) => (
          <tr key={i} className="border-b border-slate-800">
            {r.map((c, j) => (
              <td key={j} className="px-4 py-2 text-slate-300">{c}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
