import { prisma } from "@/lib/db";
import { OutreachTopbar } from "@/components/outreach-topbar";
import {
  ActivitySquare,
  Building2,
  CheckCircle2,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default async function OutreachDashboard() {
  const [total, enriched, qualified, hasEmail, socialCount, hqConfidence, jobs, drafts, usage] =
    await Promise.all([
      prisma.scrapedBusiness.count({ where: { archived: false } }),
      prisma.scrapedBusiness.count({ where: { enriched: true, archived: false } }),
      prisma.scrapedBusiness.count({ where: { qualified: true, archived: false } }),
      prisma.scrapedBusiness.count({
        where: { NOT: { email: null }, archived: false },
      }),
      prisma.scrapedBusiness.count({
        where: {
          OR: [
            { NOT: { instagram: null } },
            { NOT: { facebook: null } },
            { NOT: { twitter: null } },
          ],
          archived: false,
        },
      }),
      prisma.scrapedBusiness.count({
        where: { hqConfidence: { gte: 70 }, archived: false },
      }),
      prisma.batchJob.count({ where: { status: "running" } }),
      prisma.emailDraft.count(),
      prisma.aiUsageEvent.aggregate({
        _sum: { cents: true, inputTokens: true, outputTokens: true },
      }),
    ]);

  return (
    <>
      <OutreachTopbar activeHref="/outreach" />
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Stat color="sky" label="Total" value={fmt(total)} icon={Building2} />
          <Stat color="emerald" label="Enriched" value={fmt(enriched)} icon={Sparkles} />
          <Stat color="violet" label="Qualified" value={fmt(qualified)} icon={CheckCircle2} />
          <Stat color="indigo" label="Social Media" value={fmt(socialCount)} icon={ActivitySquare} />
          <Stat color="teal" label="Has Email" value={fmt(hasEmail)} icon={Mail} />
          <Stat color="amber" label="HQ Confidence" value={fmt(hqConfidence)} icon={Send} />
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <Card title="Running jobs" value={jobs} cta="View batch" href="/outreach/batch" />
          <Card title="Drafted emails" value={drafts} cta="Open email gen" href="/outreach/email-gen" />
          <Card
            title="AI spend"
            value={`$${((usage._sum.cents ?? 0) / 100).toFixed(2)}`}
            cta="See usage"
            href="/outreach/ai-usage"
          />
        </div>
      </div>
    </>
  );
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: string;
  color: string;
}) {
  const ring: Record<string, string> = {
    sky: "from-sky-500/20 text-sky-300 border-sky-500/30",
    emerald: "from-emerald-500/20 text-emerald-300 border-emerald-500/30",
    violet: "from-violet-500/20 text-violet-300 border-violet-500/30",
    indigo: "from-indigo-500/20 text-indigo-300 border-indigo-500/30",
    teal: "from-teal-500/20 text-teal-300 border-teal-500/30",
    amber: "from-amber-500/20 text-amber-300 border-amber-500/30",
  };
  return (
    <div
      className={`rounded-lg border bg-gradient-to-br to-transparent p-4 ${ring[color]}`}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-medium uppercase tracking-wide opacity-80">
          {label}
        </div>
        <Icon className="h-4 w-4 opacity-80" />
      </div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function Card({
  title,
  value,
  cta,
  href,
}: {
  title: string;
  value: string | number;
  cta: string;
  href: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-5">
      <div className="text-[11px] uppercase tracking-wide text-slate-500">{title}</div>
      <div className="mt-1 text-2xl font-bold text-white">{value}</div>
      <Link
        href={href}
        className="mt-3 inline-block text-xs text-indigo-300 hover:text-indigo-200"
      >
        {cta} →
      </Link>
    </div>
  );
}
