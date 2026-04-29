/**
 * Apex-domain dedup pass for the visible table. The rule is "one row per
 * apex domain, regardless of city." Existing rows that violate the rule are
 * collapsed: the highest-ranked row keeps the apex, the rest are archived.
 *
 * Differs from merge-cross-source-dupes.ts in that this DOESN'T require the
 * cities to match — Orkin-style chains where the same domain appears in
 * different cities also collapse here. Use this script when you've decided
 * franchise rows shouldn't get their own per-city listings.
 *
 *   tsx scripts/archive-domain-dupes.ts            # dry-run
 *   tsx scripts/archive-domain-dupes.ts --commit
 */
import { PrismaClient, Prisma } from "@prisma/client";
const prisma = new PrismaClient();

function apex(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url.trim()).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

const SOURCE_RANK: Record<string, number> = {
  google: 100,
  "pestworld-pest-control": 80,
  "osm-pest-control": 60,
  "osm-pest": 40,
  foursquare: 30,
  manual: 20,
};
function rankRow(r: {
  audited: boolean;
  email: string | null;
  phone: string | null;
  source: string;
  siteId: string | null;
  createdAt: Date;
}): number {
  let score = 0;
  if (r.audited) score += 100;
  if (r.siteId) score += 50;
  if (r.email) score += 25;
  if (r.phone) score += 10;
  score += SOURCE_RANK[r.source] ?? (r.source.startsWith("osm-") ? 40 : 0);
  score += Math.max(0, 1_000_000 - Math.floor(r.createdAt.getTime() / 1_000_000));
  return score;
}

async function main() {
  const commit = process.argv.includes("--commit");

  const rows = await prisma.scrapedBusiness.findMany({
    where: { archived: false, website: { not: null } },
    select: {
      id: true,
      name: true,
      website: true,
      phone: true,
      phones: true,
      email: true,
      city: true,
      state: true,
      source: true,
      audited: true,
      siteId: true,
      createdAt: true,
    },
  });

  type Row = (typeof rows)[number];
  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const a = apex(r.website);
    if (!a) continue;
    if (!groups.has(a)) groups.set(a, []);
    groups.get(a)!.push(r);
  }

  const dupeGroups = [...groups.entries()].filter(([, list]) => list.length > 1);
  console.log(
    `Apex domains with > 1 visible row: ${dupeGroups.length} (covering ${dupeGroups.reduce((n, [, l]) => n + l.length, 0)} rows)`,
  );

  const toArchive: { id: string; reason: string }[] = [];
  const toUpdate: { id: string; data: Prisma.ScrapedBusinessUpdateInput }[] = [];

  for (const [apexDomain, list] of dupeGroups) {
    const ranked = [...list].sort((a, b) => rankRow(b) - rankRow(a));
    const winner = ranked[0];
    const losers = ranked.slice(1);

    // Fold each loser's contact info + phone audit into the winner so we
    // don't drop data on the floor when archiving them.
    const phonesEntries: { number: string; source: string; scrapedAt: string }[] = [];
    const seen = new Set<string>();
    const pushPhone = (e: unknown) => {
      if (!e || typeof e !== "object") return;
      const obj = e as { number?: unknown; source?: unknown; scrapedAt?: unknown };
      if (typeof obj.number !== "string") return;
      const norm = obj.number.replace(/\D/g, "");
      if (!norm || seen.has(norm)) return;
      seen.add(norm);
      phonesEntries.push({
        number: obj.number,
        source: typeof obj.source === "string" ? obj.source : "unknown",
        scrapedAt: typeof obj.scrapedAt === "string" ? obj.scrapedAt : new Date().toISOString(),
      });
    };
    for (const r of [winner, ...losers]) {
      if (Array.isArray(r.phones)) for (const p of r.phones) pushPhone(p);
      else if (r.phone) {
        pushPhone({ number: r.phone, source: r.source, scrapedAt: r.createdAt.toISOString() });
      }
    }

    const inheritedEmail =
      winner.email ?? losers.find((r) => r.email)?.email ?? null;

    toUpdate.push({
      id: winner.id,
      data: {
        phones: phonesEntries,
        ...(inheritedEmail && !winner.email ? { email: inheritedEmail, emailReady: true } : {}),
      },
    });
    for (const l of losers) {
      toArchive.push({ id: l.id, reason: `domain dupe of ${winner.id} (${apexDomain})` });
    }

    console.log(
      `  ${apexDomain.padEnd(40)}  keep=[${winner.source}] ${winner.name}  drop=${losers.length} (${losers.map((l) => l.source).join(", ")})`,
    );
  }

  console.log(`\nWill update: ${toUpdate.length} winners`);
  console.log(`Will archive: ${toArchive.length} duplicates`);

  if (!commit) {
    console.log("\n[dry-run] pass --commit to apply");
    await prisma.$disconnect();
    return;
  }

  for (const u of toUpdate) {
    await prisma.scrapedBusiness.update({ where: { id: u.id }, data: u.data });
  }
  const ids = toArchive.map((t) => t.id);
  const CHUNK = 200;
  let archived = 0;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK);
    const res = await prisma.scrapedBusiness.updateMany({
      where: { id: { in: slice } },
      data: { archived: true },
    });
    archived += res.count;
  }
  console.log(`\nDone. Updated ${toUpdate.length} winners, archived ${archived} duplicates.`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
