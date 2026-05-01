/**
 * Dry-runs prefill-mapping against a batch of scraped contact forms and
 * prints a frequency-ranked report of every required field that prefill
 * couldn't fill. Lives outside the API/middleware so it works while the
 * dev server is running and bypasses the auth proxy entirely.
 *
 *   pnpm dry-run-fields                  → 50 rows, ready scope, dedupe ON
 *   pnpm dry-run-fields --limit 100      → 100 rows
 *   pnpm dry-run-fields --no-dedupe      → see every branch row
 *   pnpm dry-run-fields --scope all-with-form
 *   pnpm dry-run-fields --json           → emit machine-readable JSON only
 *
 * The aggregated output is what gets pasted into chat with Claude so it
 * can propose `OutreachPrefill.fieldOverrides` values for the missing
 * fields, which the operator drops into /outreach/prefill before re-running.
 */
import { PrismaClient, Prisma } from "@prisma/client";
import { submitContactForm, type StoredContactForm } from "../src/lib/form-replay";
import { loadPrefillAsSubmitInput } from "../src/lib/prefill-loader";

const prisma = new PrismaClient();

type Scope = "ready" | "all-with-form" | "captcha" | "no-message";

type Args = {
  limit: number;
  scope: Scope;
  dedupe: boolean;
  json: boolean;
};

function parseArgs(): Args {
  const out: Args = { limit: 50, scope: "ready", dedupe: true, json: false };
  for (let i = 2; i < process.argv.length; i++) {
    const a = process.argv[i];
    if (a === "--limit") out.limit = Math.max(1, Number(process.argv[++i]) || 50);
    else if (a === "--scope") out.scope = (process.argv[++i] as Scope) || "ready";
    else if (a === "--no-dedupe") out.dedupe = false;
    else if (a === "--json") out.json = true;
  }
  return out;
}

function buildScopeWhere(scope: Scope): Prisma.ScrapedBusinessWhereInput {
  const hasForm: Prisma.SiteWhereInput = {
    contactForm: { not: Prisma.AnyNull },
  };
  if (scope === "all-with-form") return { site: { is: hasForm } };
  if (scope === "captcha") {
    return {
      site: {
        is: {
          AND: [hasForm, { contactForm: { path: ["captcha", "type"], not: Prisma.AnyNull } }],
        },
      },
    };
  }
  if (scope === "no-message") {
    return {
      site: {
        is: {
          AND: [hasForm, { contactForm: { path: ["hasMessageField"], equals: false } }],
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

async function main() {
  const args = parseArgs();
  if (!args.json) {
    console.error(
      `[dry-run-fields] scope=${args.scope} limit=${args.limit} dedupe=${args.dedupe}`,
    );
  }

  const where = buildScopeWhere(args.scope);
  const fetched = await prisma.scrapedBusiness.findMany({
    where,
    include: { site: true },
    orderBy: [{ reviewsCount: "desc" }, { createdAt: "desc" }],
    take: args.dedupe ? args.limit * 4 : args.limit,
  });

  // Dedupe by exact form pageUrl — same logic as the UI page so the script
  // and the page report the same gap set.
  const targets: typeof fetched = [];
  if (args.dedupe) {
    const seen = new Set<string>();
    for (const b of fetched) {
      const form = b.site?.contactForm as { pageUrl?: string } | null;
      const key = form?.pageUrl ? form.pageUrl.toLowerCase() : null;
      if (key) {
        if (seen.has(key)) continue;
        seen.add(key);
      }
      targets.push(b);
      if (targets.length >= args.limit) break;
    }
  } else {
    targets.push(...fetched.slice(0, args.limit));
  }

  const baseInput = await loadPrefillAsSubmitInput({ refresh: false, dryRun: true });

  type AggregatedField = {
    name: string;
    type: string;
    label: string | null;
    count: number;
    sampleBusinesses: string[];
  };
  const byKey = new Map<string, AggregatedField>();
  let okCount = 0;
  let errCount = 0;
  let coveredCount = 0;

  for (const b of targets) {
    try {
      const form = b.site?.contactForm as unknown as StoredContactForm | null;
      if (!form?.action || !Array.isArray(form?.fields)) {
        errCount++;
        continue;
      }
      const result = await submitContactForm(form, baseInput);
      okCount++;
      if (result.unmatchedRequiredFields.length === 0) coveredCount++;
      for (const f of result.unmatchedRequiredFields) {
        const key = `${(f.name ?? "").trim().toLowerCase()}|${f.type}`;
        const existing = byKey.get(key);
        if (existing) {
          existing.count++;
          if (existing.sampleBusinesses.length < 3) {
            existing.sampleBusinesses.push(b.name);
          }
        } else {
          byKey.set(key, {
            name: f.name ?? "",
            type: f.type,
            label: f.label ?? null,
            count: 1,
            sampleBusinesses: [b.name],
          });
        }
      }
    } catch (err) {
      errCount++;
      if (!args.json) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`  [error] ${b.name}: ${msg}`);
      }
    }
  }

  const aggregated = Array.from(byKey.values()).sort((a, b) => b.count - a.count);
  const coveragePct =
    okCount > 0 ? Math.round((coveredCount / okCount) * 100) : null;

  const report = {
    scope: args.scope,
    dedupe: args.dedupe,
    requestedLimit: args.limit,
    counts: {
      attempted: targets.length,
      ok: okCount,
      errored: errCount,
      fullyCovered: coveredCount,
      coveragePct,
    },
    unmappedFields: aggregated,
  };

  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.error(
      `\nattempted=${report.counts.attempted}  ok=${okCount}  errored=${errCount}  fully-covered=${coveredCount}  coverage=${coveragePct ?? "n/a"}%\n`,
    );
    console.error(`Unmapped required fields (${aggregated.length} unique):`);
    for (const f of aggregated) {
      const label = f.label ? `  — ${f.label}` : "";
      console.error(`  ${f.count}× ${f.name} (${f.type})${label}`);
      if (f.sampleBusinesses[0]) {
        console.error(`         sample: ${f.sampleBusinesses.join(", ")}`);
      }
    }
    console.error("");
    console.log(JSON.stringify(report));
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
