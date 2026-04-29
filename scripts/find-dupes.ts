/**
 * Audit duplicates across the entire ScrapedBusiness table. Groups rows
 * by likely-same-business signals (apex domain, normalised phone, name)
 * and prints the worst offenders so we can decide how to merge.
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b(llc|inc\.?|corp\.?|corporation|company|co\.?|the|and|services?|solutions?|group|enterprise|enterprises|holdings|partners|partnership|pllc|ltd|llp)\b/gi, " ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function apexDomain(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

function normalizePhone(p: string | null | undefined): string {
  return (p ?? "").replace(/\D/g, "").replace(/^1(\d{10})$/, "$1");
}

async function main() {
  const rows = await prisma.scrapedBusiness.findMany({
    where: { archived: false },
    select: {
      id: true,
      name: true,
      website: true,
      phone: true,
      city: true,
      state: true,
      source: true,
      audited: true,
      createdAt: true,
    },
  });
  console.log(`Total visible rows: ${rows.length}`);

  // Group 1: same apex domain (most reliable cross-source dupe signal)
  const byDomain = new Map<string, typeof rows>();
  for (const r of rows) {
    const d = apexDomain(r.website);
    if (!d) continue;
    if (!byDomain.has(d)) byDomain.set(d, []);
    byDomain.get(d)!.push(r);
  }
  const domainDupes = [...byDomain.entries()].filter(([, list]) => list.length > 1);
  console.log(`\n=== Same-website duplicates (${domainDupes.length} groups, ${domainDupes.reduce((n, [, l]) => n + l.length, 0)} rows) ===`);
  for (const [domain, list] of domainDupes.slice(0, 15).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  ${domain}  (${list.length} rows)`);
    for (const r of list.slice(0, 5)) {
      console.log(`    · [${r.source}] ${r.name}  ${r.city ?? "?"}, ${r.state ?? "?"}  ${r.audited ? "audited" : "raw"}`);
    }
    if (list.length > 5) console.log(`    · …and ${list.length - 5} more`);
  }

  // Group 2: same normalised name + state (catches cross-source where
  // one source has no website yet).
  const byNameState = new Map<string, typeof rows>();
  for (const r of rows) {
    const n = normalizeName(r.name);
    const key = `${n}|${(r.state ?? "").toUpperCase()}`;
    if (!n) continue;
    if (!byNameState.has(key)) byNameState.set(key, []);
    byNameState.get(key)!.push(r);
  }
  const nameDupes = [...byNameState.entries()].filter(([, list]) => list.length > 1);
  console.log(`\n=== Same-name+state duplicates (${nameDupes.length} groups, ${nameDupes.reduce((n, [, l]) => n + l.length, 0)} rows) ===`);
  for (const [key, list] of nameDupes.slice(0, 10).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  "${key}"  (${list.length} rows)`);
    for (const r of list.slice(0, 5)) {
      console.log(`    · [${r.source}] ${r.name}  ${r.city ?? "?"}, ${r.state ?? "?"}  → ${r.website ?? "(no site)"}`);
    }
  }

  // Group 3: same normalised phone (most precise dedup signal)
  const byPhone = new Map<string, typeof rows>();
  for (const r of rows) {
    const p = normalizePhone(r.phone);
    if (p.length < 10) continue;
    if (!byPhone.has(p)) byPhone.set(p, []);
    byPhone.get(p)!.push(r);
  }
  const phoneDupes = [...byPhone.entries()].filter(([, list]) => list.length > 1);
  console.log(`\n=== Same-phone duplicates (${phoneDupes.length} groups, ${phoneDupes.reduce((n, [, l]) => n + l.length, 0)} rows) ===`);
  for (const [phone, list] of phoneDupes.slice(0, 10).sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\n  ${phone}  (${list.length} rows)`);
    for (const r of list.slice(0, 5)) {
      console.log(`    · [${r.source}] ${r.name}  ${r.city ?? "?"}, ${r.state ?? "?"}  → ${r.website ?? "(no site)"}`);
    }
  }

  await prisma.$disconnect();
}
main();
