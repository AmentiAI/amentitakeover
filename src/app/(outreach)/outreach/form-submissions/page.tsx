import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { OutreachTopbar } from "@/components/outreach-topbar";
import { SubmissionsTable, type SubmissionRow } from "./submissions-table";

export const dynamic = "force-dynamic";

const PER_PAGE = 100;

// Lists every scraped business that has a captured contact form ready to
// replay — no-captcha + has-message-field is the strict default because
// those are the only forms our pitch text actually fits into. Operators run
// bulk dry-runs from here, then aggregate the unmatched-required-fields
// across every selection so we can fill the prefill defaults until coverage
// is 100%. Live submission lives behind a separate button (added later).
export default async function FormSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; allBranches?: string }>;
}) {
  const sp = await searchParams;
  // `scope` lets the operator widen the filter when they want to see forms
  // we'd still skip by default (captcha-gated, no-message). Defaults to the
  // strict "ready to pitch" set.
  const scope = sp.scope ?? "ready";
  const allBranches = sp.allBranches === "1";
  const where = buildScopeWhere(scope);

  const [rawRows, totalSubmittable] = await Promise.all([
    prisma.scrapedBusiness.findMany({
      where,
      include: { site: true },
      // Reviews-desc first so the franchise-HQ-flagship row tends to be the
      // canonical pick when we dedupe. Fall back to recency.
      orderBy: [{ reviewsCount: "desc" }, { createdAt: "desc" }],
      // Pull a generous window so dedupe still has enough material to fill
      // PER_PAGE after collapsing branches.
      take: allBranches ? PER_PAGE : PER_PAGE * 4,
    }),
    prisma.scrapedBusiness.count({ where: buildScopeWhere("ready") }),
  ]);

  const mapped = rawRows.map((b) => {
    const form = (b.site?.contactForm as
      | { fields?: unknown[]; hasMessageField?: boolean; captcha?: unknown; pageUrl?: string }
      | null
      | undefined) ?? null;
    const fieldCount = Array.isArray(form?.fields) ? form!.fields!.length : 0;
    const captchaType = form?.captcha
      ? typeof form.captcha === "object" && form.captcha !== null && "type" in form.captcha
        ? String((form.captcha as { type?: string }).type ?? "")
        : null
      : null;
    return {
      id: b.id,
      name: b.name,
      city: b.city,
      state: b.state,
      industry: b.industry,
      website: b.website,
      hasForm: Boolean(form),
      formFieldCount: fieldCount,
      formHasMessage: Boolean(form?.hasMessageField),
      formCaptcha: captchaType,
      formPageUrl: form?.pageUrl ?? null,
      branchCount: 1,
    } satisfies SubmissionRow;
  });

  // Dedupe rows that point at the exact same captured form. Same pageUrl
  // == same inbox; submitting twice would just deliver duplicate messages
  // to the same person. We keep the row with most reviews (already first
  // in the order from the query) and tag branchCount so the operator sees
  // how many other branches are folded into this entry. Pages without a
  // captured pageUrl are kept as-is — without a key we can't safely group.
  let tableRows = mapped;
  if (!allBranches) {
    const seen = new Map<string, SubmissionRow>();
    const survivors: SubmissionRow[] = [];
    for (const r of mapped) {
      if (!r.formPageUrl) {
        survivors.push(r);
        continue;
      }
      const key = r.formPageUrl.toLowerCase();
      const existing = seen.get(key);
      if (existing) {
        existing.branchCount += 1;
        continue;
      }
      seen.set(key, r);
      survivors.push(r);
    }
    tableRows = survivors.slice(0, PER_PAGE);
  } else {
    tableRows = mapped.slice(0, PER_PAGE);
  }

  return (
    <>
      <OutreachTopbar activeHref="/outreach/form-submissions" />
      <main className="px-4 py-5 sm:px-6 sm:py-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-100">
              Form submissions
            </h1>
            <p className="mt-0.5 text-xs text-slate-400">
              {totalSubmittable.toLocaleString()} businesses have a captured
              contact form, no captcha, and a message/textarea field — the
              ready-to-pitch set.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ScopeTabs current={scope} allBranches={allBranches} />
            <BranchToggle current={allBranches} scope={scope} />
          </div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900/40">
          <SubmissionsTable rows={tableRows} />
        </div>
      </main>
    </>
  );
}

// Scope presets. Strict "ready" is the default because that's where the
// existing pitch (`message` field) actually lands; the looser scopes are
// there for when the operator wants to triage what's currently filtered
// out and decide whether it's worth widening the prefill heuristic.
function buildScopeWhere(scope: string): Prisma.ScrapedBusinessWhereInput {
  const hasForm: Prisma.SiteWhereInput = {
    contactForm: { not: Prisma.AnyNull },
  };
  if (scope === "all-with-form") {
    return { site: { is: hasForm } };
  }
  if (scope === "captcha") {
    return {
      site: {
        is: {
          AND: [
            hasForm,
            { contactForm: { path: ["captcha", "type"], not: Prisma.AnyNull } },
          ],
        },
      },
    };
  }
  if (scope === "no-message") {
    return {
      site: {
        is: {
          AND: [
            hasForm,
            { contactForm: { path: ["hasMessageField"], equals: false } },
          ],
        },
      },
    };
  }
  // "ready" (default): has form + no captcha + has message field.
  return {
    site: {
      is: {
        AND: [
          hasForm,
          { contactForm: { path: ["captcha"], equals: Prisma.AnyNull } },
          { contactForm: { path: ["hasMessageField"], equals: true } },
        ],
      },
    },
  };
}

// Toggles the dedupe-by-form-pageUrl behavior. Default ON because chains
// (Batzner, Rentokil/Terminix, Orkin) often share one corporate contact
// form across dozens of GMB location rows; without dedupe the operator
// would dry-run + submit the same form many times in a row.
function BranchToggle({ current, scope }: { current: boolean; scope: string }) {
  const sp = new URLSearchParams();
  sp.set("scope", scope);
  if (!current) sp.set("allBranches", "1");
  return (
    <a
      href={`?${sp.toString()}`}
      className={`rounded-md border px-2.5 py-1 text-[11px] transition ${
        current
          ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
          : "border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
      }`}
      title={
        current
          ? "Showing every branch row. Submitting to all of them sends duplicate messages to franchise corporate inboxes."
          : "Folding rows that point at the same form pageUrl. Click to show every branch instead."
      }
    >
      {current ? "All branches" : "Dedupe branches"}
    </a>
  );
}

function ScopeTabs({ current, allBranches }: { current: string; allBranches: boolean }) {
  const tabs = [
    { id: "ready", label: "Ready to pitch" },
    { id: "all-with-form", label: "All with form" },
    { id: "captcha", label: "Captcha-gated" },
    { id: "no-message", label: "No message field" },
  ];
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      {tabs.map((t) => {
        const sp = new URLSearchParams();
        sp.set("scope", t.id);
        if (allBranches) sp.set("allBranches", "1");
        return (
          <a
            key={t.id}
            href={`?${sp.toString()}`}
            className={`rounded-md border px-2.5 py-1 transition ${
              current === t.id
                ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-200"
                : "border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {t.label}
          </a>
        );
      })}
    </div>
  );
}
