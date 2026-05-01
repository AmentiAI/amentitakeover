import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  submitContactForm,
  type StoredContactForm,
} from "@/lib/form-replay";
import { loadPrefillAsSubmitInput } from "@/lib/prefill-loader";

export const maxDuration = 300;

// Fan-out dry-run + aggregator. Pulls eligible scraped businesses, dedupes
// by exact form pageUrl (so franchises with one corporate form don't burn
// dry-run budget), runs each through `submitContactForm` with `dryRun: true`,
// then collapses the per-row `unmatchedRequiredFields` arrays into a single
// frequency-ranked report.
//
// Designed to be hit from curl while the dev server is running so the
// operator can ask "what fields did prefill fail to fill?" without clicking
// through the UI. Use POST so the body params survive proxies that strip
// long query strings.

type Body = {
  // How many businesses to dry-run. Capped to keep the request from
  // pegging the dev server for too long.
  limit?: number;
  // Same scope strings the page UI uses.
  scope?: "ready" | "all-with-form" | "captcha" | "no-message";
  // Default true. Set false to dry-run every branch row.
  dedupe?: boolean;
};

type AggregatedField = {
  // Lowercased name + type, used as the grouping key. Returned so the caller
  // can reference a specific gap when proposing prefill values.
  key: string;
  name: string;
  type: string;
  label: string | null;
  count: number;
  sampleBusinesses: string[];
};

type RowOutcome = {
  id: string;
  name: string;
  ok: boolean;
  error?: string;
  submittedCount: number;
  unmatched: { name: string; type: string; label?: string }[];
};

const HARD_CAP = 200;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Body;
  const limit = Math.max(1, Math.min(HARD_CAP, body.limit ?? 50));
  const scope = body.scope ?? "ready";
  const dedupe = body.dedupe !== false;

  const where = buildScopeWhere(scope);
  const fetched = await prisma.scrapedBusiness.findMany({
    where,
    include: { site: true },
    orderBy: [{ reviewsCount: "desc" }, { createdAt: "desc" }],
    take: dedupe ? limit * 4 : limit,
  });

  // Dedupe by form pageUrl. Same logic as the page so the script and the
  // UI report the same set when both are pointed at the same scope.
  const targets: typeof fetched = [];
  if (dedupe) {
    const seen = new Set<string>();
    for (const b of fetched) {
      const form = b.site?.contactForm as { pageUrl?: string } | null;
      const key = form?.pageUrl ? form.pageUrl.toLowerCase() : null;
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      targets.push(b);
      if (targets.length >= limit) break;
    }
  } else {
    targets.push(...fetched.slice(0, limit));
  }

  // Single prefill load — all dry-runs in this batch use the same defaults.
  const baseInput = await loadPrefillAsSubmitInput({
    refresh: false,
    dryRun: true,
  });

  const outcomes: RowOutcome[] = [];
  // Modest concurrency keeps a 50-row run snappy without burying the dev
  // server. Each dry-run is purely DB-backed (no outbound fetch in dryRun
  // mode), so 8 in flight is plenty.
  const CONCURRENCY = 8;
  let cursor = 0;
  const worker = async () => {
    while (true) {
      const i = cursor++;
      if (i >= targets.length) return;
      const b = targets[i];
      try {
        const form = b.site?.contactForm as unknown as StoredContactForm | null;
        if (!form?.action || !Array.isArray(form?.fields)) {
          outcomes.push({
            id: b.id,
            name: b.name,
            ok: false,
            error: "missing or malformed contact form",
            submittedCount: 0,
            unmatched: [],
          });
          continue;
        }
        const result = await submitContactForm(form, baseInput);
        outcomes.push({
          id: b.id,
          name: b.name,
          ok: true,
          submittedCount: result.submittedFields.length,
          unmatched: result.unmatchedRequiredFields,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "unknown";
        outcomes.push({
          id: b.id,
          name: b.name,
          ok: false,
          error: msg,
          submittedCount: 0,
          unmatched: [],
        });
      }
    }
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));

  // Roll up the per-row unmatched lists into one frequency-ranked report.
  const byKey = new Map<string, AggregatedField>();
  let okCount = 0;
  let errCount = 0;
  let coveredCount = 0;
  for (const o of outcomes) {
    if (!o.ok) {
      errCount++;
      continue;
    }
    okCount++;
    if (o.unmatched.length === 0) coveredCount++;
    for (const f of o.unmatched) {
      const key = `${(f.name ?? "").trim().toLowerCase()}|${f.type}`;
      const existing = byKey.get(key);
      if (existing) {
        existing.count++;
        if (existing.sampleBusinesses.length < 3) {
          existing.sampleBusinesses.push(o.name);
        }
      } else {
        byKey.set(key, {
          key,
          name: f.name ?? "",
          type: f.type,
          label: f.label ?? null,
          count: 1,
          sampleBusinesses: [o.name],
        });
      }
    }
  }

  const aggregated = Array.from(byKey.values()).sort((a, b) => b.count - a.count);
  const coveragePct = okCount > 0 ? Math.round((coveredCount / okCount) * 100) : null;

  return NextResponse.json({
    scope,
    dedupe,
    requestedLimit: limit,
    counts: {
      attempted: outcomes.length,
      ok: okCount,
      errored: errCount,
      fullyCovered: coveredCount,
      coveragePct,
    },
    unmappedFields: aggregated,
    // Optional per-row detail for when the caller needs to drill in. Keeps
    // payload small by stripping submittedFields (the labels live in the
    // aggregate).
    rows: outcomes.map((o) => ({
      id: o.id,
      name: o.name,
      ok: o.ok,
      error: o.error,
      submittedCount: o.submittedCount,
      unmatchedCount: o.unmatched.length,
    })),
  });
}

function buildScopeWhere(scope: string): Prisma.ScrapedBusinessWhereInput {
  const hasForm: Prisma.SiteWhereInput = {
    contactForm: { not: Prisma.AnyNull },
  };
  if (scope === "all-with-form") return { site: { is: hasForm } };
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
