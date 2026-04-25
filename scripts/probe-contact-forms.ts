/**
 * One-off probe: pull the latest 5 scraped businesses with websites, run
 * the existing deepScrapeSite over each, and dump the captured contact-form
 * schema to stdout. Used to figure out which field names are common across
 * sites so the prefill page can map them sensibly.
 *
 * Run: DATABASE_URL='...' tsx scripts/probe-contact-forms.ts
 */
import { PrismaClient } from "@prisma/client";
import { deepScrapeSite } from "../src/lib/deep-scraper";

const prisma = new PrismaClient();

async function main() {
  const businesses = await prisma.scrapedBusiness.findMany({
    where: { hasWebsite: true, archived: false, website: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, website: true },
  });

  console.log(`Found ${businesses.length} businesses with websites\n`);

  // Field-name + label-token frequency across every form we capture.
  const fieldNameCount = new Map<string, number>();
  const labelTokenCount = new Map<string, number>();
  const intentMap = new Map<string, Set<string>>(); // e.g., "email" -> ["your-email", "wpforms[fields][1]"]
  const reports: Array<Record<string, unknown>> = [];

  for (const b of businesses) {
    if (!b.website) continue;
    console.log(`\n--- ${b.name} :: ${b.website} ---`);
    try {
      const t0 = Date.now();
      const result = await deepScrapeSite(b.website);
      const ms = Date.now() - t0;
      const cf = result.contactForm;
      const summary = {
        name: b.name,
        website: b.website,
        durationMs: ms,
        emails: result.emails,
        phones: result.phones,
        contactForm: cf
          ? {
              pageUrl: cf.pageUrl,
              pageKind: cf.pageKind,
              action: cf.action,
              method: cf.method,
              fieldCount: cf.fields.length,
              fields: cf.fields.map((f) => ({
                name: f.name,
                type: f.type,
                required: f.required ?? false,
                label: f.label ?? null,
                placeholder: f.placeholder ?? null,
              })),
            }
          : null,
      };
      reports.push(summary);
      console.log(JSON.stringify(summary, null, 2));

      if (cf) {
        for (const f of cf.fields) {
          if (f.type === "hidden") continue;
          const key = f.name.toLowerCase();
          fieldNameCount.set(key, (fieldNameCount.get(key) ?? 0) + 1);
          const intent = inferIntent(f.name, f.label, f.type);
          if (intent) {
            if (!intentMap.has(intent)) intentMap.set(intent, new Set());
            intentMap.get(intent)!.add(`${b.name}:${f.name}`);
          }
          for (const tok of tokenize(`${f.name} ${f.label ?? ""}`)) {
            labelTokenCount.set(tok, (labelTokenCount.get(tok) ?? 0) + 1);
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`ERROR: ${msg}`);
    }
  }

  console.log("\n=================== FIELD NAME FREQUENCY ===================");
  for (const [name, count] of [...fieldNameCount.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`${count}x  ${name}`);
  }

  console.log("\n=================== TOKEN FREQUENCY ===================");
  for (const [tok, count] of [...labelTokenCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40)) {
    console.log(`${count}x  ${tok}`);
  }

  console.log("\n=================== INTENT MAPPING ===================");
  for (const [intent, fields] of intentMap.entries()) {
    console.log(`${intent}:`);
    for (const f of fields) console.log(`  - ${f}`);
  }

  console.log("\n=================== JSON DUMP ===================");
  console.log(JSON.stringify(reports, null, 2));

  await prisma.$disconnect();
}

function inferIntent(name: string, label: string | undefined, type: string): string | null {
  const haystack = `${name} ${label ?? ""}`.toLowerCase();
  if (type === "email" || /\be[-_ ]?mail\b|emailaddress/.test(haystack)) return "email";
  if (type === "tel" || /\bphone\b|telephone|mobile|\bcell\b/.test(haystack)) return "phone";
  if (type === "textarea" || /message|comments?|details|inquiry|notes|describe|question/.test(haystack)) return "message";
  if (/subject|topic|reason|regarding/.test(haystack)) return "subject";
  if (/\bname\b|fullname|first[-_ ]?name|last[-_ ]?name|your[-_ ]?name/.test(haystack)) return "name";
  if (/\baddress\b|\bstreet\b|\bcity\b|\bstate\b|\bzip\b/.test(haystack)) return "address";
  if (/service|interest|reason/.test(haystack)) return "service";
  if (/\bdate\b|\btime\b|when|schedule/.test(haystack)) return "schedule";
  return null;
}

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 _-]+/g, " ")
    .split(/[\s_-]+/)
    .filter((t) => t.length >= 3 && !/^\d+$/.test(t));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
