import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function StatsRow() {
  const [
    total,
    enriched,
    qualified,
    socialCount,
    hasEmail,
    hqConfidence,
    withForm,
    withFormCaptcha,
    contentPass,
    contentFail,
  ] = await Promise.all([
    prisma.scrapedBusiness.count({ where: { archived: false } }),
    prisma.scrapedBusiness.count({ where: { enriched: true } }),
    prisma.scrapedBusiness.count({ where: { qualified: true } }),
    prisma.scrapedBusiness.count({
      where: {
        OR: [
          { NOT: { instagram: null } },
          { NOT: { facebook: null } },
          { NOT: { twitter: null } },
        ],
      },
    }),
    prisma.scrapedBusiness.count({ where: { NOT: { email: null } } }),
    prisma.scrapedBusiness.count({ where: { hqConfidence: { gte: 70 } } }),
    // Any captured contact form (with or without captcha).
    prisma.scrapedBusiness.count({
      where: {
        archived: false,
        site: { contactForm: { not: Prisma.AnyNull } },
      },
    }),
    // Subset: form's captcha field is a non-null JSON object (i.e., a
    // captcha was detected). We derive "clean form" as withForm minus this.
    prisma.scrapedBusiness.count({
      where: {
        archived: false,
        site: { contactForm: { path: ["captcha"], not: Prisma.JsonNull } },
      },
    }),
    // Homepage heading hygiene — single h1 + at least 3 h2 → passed.
    prisma.scrapedBusiness.count({
      where: {
        archived: false,
        site: { contentScore: { path: ["passed"], equals: true } },
      },
    }),
    prisma.scrapedBusiness.count({
      where: {
        archived: false,
        site: { contentScore: { path: ["passed"], equals: false } },
      },
    }),
  ]);

  const formClean = Math.max(0, withForm - withFormCaptcha);

  const stats = [
    { label: "Total", value: total, color: "bg-sky-500/10 text-sky-300 border-sky-500/30" },
    { label: "Enriched", value: enriched, color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
    { label: "Qualified", value: qualified, color: "bg-violet-500/10 text-violet-300 border-violet-500/30" },
    { label: "Social Media", value: socialCount, color: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30" },
    { label: "Has Email", value: hasEmail, color: "bg-teal-500/10 text-teal-300 border-teal-500/30" },
    { label: "Form", value: formClean, color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
    { label: "Form +captcha", value: withFormCaptcha, color: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
    { label: "Content ✓", value: contentPass, color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
    { label: "Content ✗", value: contentFail, color: "bg-rose-500/10 text-rose-300 border-rose-500/30" },
    { label: "HQ Confidence", value: hqConfidence, color: "bg-amber-500/10 text-amber-300 border-amber-500/30" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`rounded-md border px-3 py-1.5 text-xs ${s.color}`}
        >
          <span className="mr-2 opacity-70">{s.label}</span>
          <span className="font-bold">{fmt(s.value)}</span>
        </div>
      ))}
    </div>
  );
}

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}
