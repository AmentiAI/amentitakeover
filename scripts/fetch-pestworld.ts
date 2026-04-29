/**
 * Pulls pest-control leads from PestWorld's "find a pro" directory by
 * iterating ~5 representative ZIP codes per state. Each result page lists
 * NPMA member companies with name + address + phone (and website for the
 * "QualityPro Certified" sponsors at the top of every page).
 *
 *   npm run pestworld -- --states NY,RI,MA --concurrency 3
 *   npm run pestworld -- --states ALL --limit-per-zip 50
 *
 * Source tag is `pestworld-pest-control` so they show up in the All
 * Businesses table with a violet pill, just like OSM imports. Run the
 * deep-scraper afterward to flesh out each row's Site / contactForm /
 * signals:
 *
 *   npm run fsq:process -- --source pestworld-pest-control --limit 200 --concurrency 5
 *
 * Note: ~80% of standard listings on PestWorld have no website link in
 * the HTML — those rows are still imported (so you can manually look
 * them up), but the deep-scraper will skip them since `website` is null.
 */
import { PrismaClient } from "@prisma/client";
import * as cheerio from "cheerio";
import * as crypto from "node:crypto";
import { findApexOwner } from "../src/lib/website-dedup";

const prisma = new PrismaClient();

// 5 representative ZIPs per state — picked from the largest cities so a
// pull from any state surfaces the urban core companies first.
const ZIPS_BY_STATE: Record<string, string[]> = {
  AL: ["35203", "36830", "36104", "35802", "36602"],
  AK: ["99501", "99701", "99801", "99603", "99645"],
  AZ: ["85001", "85701", "85281", "86001", "85201"],
  AR: ["72201", "72701", "72401", "71601", "72901"],
  CA: ["90001", "94102", "92101", "95814", "94501"],
  CO: ["80201", "80525", "80903", "81501", "80303"],
  CT: ["06101", "06510", "06605", "06801", "06450"],
  DE: ["19801", "19901", "19958", "19711", "19720"],
  FL: ["33101", "32801", "33602", "32202", "33301"],
  GA: ["30303", "30901", "31405", "31201", "30501"],
  HI: ["96813", "96720", "96793", "96766", "96701"],
  ID: ["83702", "83814", "83301", "83401", "83843"],
  IL: ["60601", "61602", "61101", "60540", "62701"],
  IN: ["46202", "46801", "47708", "46514", "47401"],
  IA: ["50309", "52240", "52401", "51101", "50613"],
  KS: ["66101", "67202", "66603", "66044", "67501"],
  KY: ["40202", "40508", "41011", "42101", "41001"],
  LA: ["70112", "70802", "71101", "70501", "70360"],
  ME: ["04101", "04401", "04240", "04901", "04330"],
  MD: ["21202", "21401", "21701", "20850", "20906"],
  MA: ["02108", "02139", "01609", "02740", "01103"],
  MI: ["48201", "48104", "49503", "48823", "48933"],
  MN: ["55101", "55401", "55802", "55901", "56301"],
  MS: ["39201", "39401", "39530", "38703", "39759"],
  MO: ["63101", "64108", "65801", "65201", "63701"],
  MT: ["59101", "59601", "59801", "59401", "59715"],
  NE: ["68102", "68508", "68845", "68701", "69101"],
  NV: ["89101", "89501", "89701", "89048", "89801"],
  NH: ["03301", "03101", "03801", "03060", "03431"],
  NJ: ["07102", "08901", "07728", "07601", "08540"],
  NM: ["87102", "87501", "88001", "87401", "88240"],
  NY: ["10001", "14202", "14604", "13202", "12207"],
  NC: ["28202", "27601", "27401", "27101", "28801"],
  ND: ["58102", "58501", "58201", "58701", "58504"],
  OH: ["44113", "43215", "45202", "43604", "44308"],
  OK: ["73102", "74103", "74012", "73501", "74401"],
  OR: ["97201", "97401", "97301", "97501", "97701"],
  PA: ["19102", "15222", "17101", "18101", "16501"],
  RI: ["02903", "02919", "02909", "02816", "02842"],
  SC: ["29201", "29401", "29605", "29501", "29455"],
  SD: ["57104", "57501", "57701", "57401", "57078"],
  TN: ["37201", "38103", "37402", "37902", "37601"],
  TX: ["75201", "77002", "78701", "78205", "76101"],
  UT: ["84101", "84601", "84115", "84401", "84770"],
  VT: ["05401", "05601", "05701", "05201", "05301"],
  VA: ["23218", "22201", "23454", "22030", "24011"],
  WA: ["98101", "99201", "98402", "98801", "98225"],
  WV: ["25301", "26505", "25701", "26101", "24901"],
  WI: ["53202", "53703", "54301", "54601", "53534"],
  WY: ["82001", "82601", "82801", "83001", "82070"],
  DC: ["20001", "20007", "20015", "20019", "20024"],
};

type Listing = {
  name: string;
  website: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  certified: boolean;
};

function parseArgs() {
  const out = {
    states: [] as string[],
    zipsPerState: 5,
    limitPerZip: undefined as number | undefined,
    concurrency: 3,
    statePauseSec: 0,
    sourceTag: "pestworld-pest-control",
    industry: "Pest Control",
    dryRun: false,
  };
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--states") {
      const v = argv[++i].toUpperCase();
      out.states = v === "ALL" ? Object.keys(ZIPS_BY_STATE) : v.split(",").map((s) => s.trim());
    } else if (a === "--zips-per-state") out.zipsPerState = Number(argv[++i]);
    else if (a === "--limit-per-zip") out.limitPerZip = Number(argv[++i]);
    else if (a === "--concurrency") out.concurrency = Number(argv[++i]);
    else if (a === "--state-pause") out.statePauseSec = Number(argv[++i]);
    else if (a === "--source-tag") out.sourceTag = argv[++i];
    else if (a === "--industry") out.industry = argv[++i];
    else if (a === "--dry-run") out.dryRun = true;
  }
  if (out.states.length === 0) {
    console.error(
      "Usage: tsx scripts/fetch-pestworld.ts --states <NY,RI,...|ALL> [--zips-per-state 5] [--limit-per-zip N] [--concurrency 3] [--dry-run]",
    );
    process.exit(1);
  }
  return out;
}

async function fetchZip(zip: string): Promise<Listing[]> {
  const url = `https://www.pestworld.org/find-local-exterminators/find-a-pro-results/?ZipCode=${zip}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });
  if (!res.ok) throw new Error(`pestworld ${zip} returned ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const listings: Listing[] = [];

  // Sponsored / QualityPro section — has website button.
  $("section.pro-result-special").each((_i, el) => {
    const $el = $(el);
    const name = $el.find("h2").first().text().trim();
    const addr = addressHtmlToText($el.find("address").first());
    const tel = $el.find('a[href^="tel:"]').first().attr("href")?.replace(/^tel:/, "").trim() ?? null;
    const website =
      $el.find('a.button-secondary[href^="http"]').first().attr("href")?.trim() ??
      null;
    const certified = /qualitypro/i.test($el.find(".certified-pro").text());
    const parsed = parseAddress(addr);
    if (!name) return;
    listings.push({
      name,
      website,
      phone: prettifyPhone(tel),
      address: parsed.street,
      city: parsed.city,
      state: parsed.state,
      postalCode: parsed.zip,
      certified,
    });
  });

  // Standard list — no website in HTML, just name + address + phone.
  $("li.pro-result-standard").each((_i, el) => {
    const $el = $(el);
    const name = $el.find("h2").first().text().trim();
    const addr = addressHtmlToText($el.find("address").first());
    const tel = $el.find('a[href^="tel:"]').first().attr("href")?.replace(/^tel:/, "").trim() ?? null;
    const certified = /qualitypro/i.test($el.find(".certified-pro").text());
    const parsed = parseAddress(addr);
    if (!name) return;
    listings.push({
      name,
      website: null,
      phone: prettifyPhone(tel),
      address: parsed.street,
      city: parsed.city,
      state: parsed.state,
      postalCode: parsed.zip,
      certified,
    });
  });

  return listings;
}

// PestWorld renders addresses as `<street><br />City,STATE,zip`. Cheerio
// `.text()` collapses the line break to a space which makes regex
// parsing ambiguous (street can contain a city-looking word, city can
// have spaces). Splitting on the literal <br> gives us street vs.
// "city,state,zip" cleanly.
function addressHtmlToText($addr: cheerio.Cheerio<cheerio.Element>): string {
  const html = $addr.html() ?? "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .trim();
}

function parseAddress(raw: string): {
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
} {
  if (!raw) return { street: null, city: null, state: null, zip: null };
  // Each line came from a <br> split; first line is street, second is
  // "City,STATE,zip" (sometimes with whitespace).
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { street: null, city: null, state: null, zip: null };
  const street = lines[0] ?? null;
  const tail = lines.slice(1).join(" ").trim();
  if (!tail) return { street, city: null, state: null, zip: null };
  // tail is roughly "Brunswick,ME,04011-2207" — split on commas.
  const parts = tail.split(/\s*,\s*/);
  let city: string | null = null;
  let state: string | null = null;
  let zip: string | null = null;
  if (parts.length >= 3) {
    city = parts[0] || null;
    state = (parts[1] || "").toUpperCase().slice(0, 2) || null;
    zip = (parts[2] || "").split("-")[0].trim() || null;
  } else {
    // Fallback for weirdly-formatted lines — try a regex.
    const m = tail.match(/^([A-Za-z][\w .'-]*?),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/);
    if (m) {
      city = m[1].trim();
      state = m[2];
      zip = m[3].split("-")[0];
    } else {
      city = parts[0] ?? null;
    }
  }
  return { street, city, state, zip };
}

function prettifyPhone(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw.trim();
}

// Stable id keyed on name + phone + state — handles the same business
// appearing in multiple ZIP results (large companies show up across
// every nearby ZIP) and idempotent re-runs.
function makeSourceId(l: Listing): string {
  const base = `${(l.name ?? "").toLowerCase().trim()}|${(l.phone ?? "").replace(/\D/g, "")}|${(l.state ?? "").toUpperCase()}`;
  return crypto.createHash("sha1").update(base).digest("hex").slice(0, 24);
}

async function importListings(
  listings: Listing[],
  opts: { sourceTag: string; industry: string },
): Promise<{ created: number; updated: number; skippedDomainDupe: number }> {
  if (listings.length === 0) return { created: 0, updated: 0, skippedDomainDupe: 0 };

  // Dedupe within the batch first — same regional company shows up
  // across multiple nearby ZIPs (Big Blue Bug, Modern Pest Services, …).
  // Without this we'd create 3-5x rows per company.
  const inBatch = new Map<string, Listing>();
  for (const l of listings) {
    const id = makeSourceId(l);
    if (!inBatch.has(id)) inBatch.set(id, l);
  }
  const deduped = [...inBatch.values()];

  const ids = deduped.map((l) => makeSourceId(l));
  const existing = await prisma.scrapedBusiness.findMany({
    where: { source: opts.sourceTag, sourceId: { in: ids } },
    select: { id: true, sourceId: true },
  });
  const known = new Map(existing.map((e) => [e.sourceId!, e.id]));

  let created = 0;
  let updated = 0;
  let skippedDomainDupe = 0;
  for (const l of deduped) {
    const sourceId = makeSourceId(l);
    const phonesSeed = l.phone
      ? [{ number: l.phone, source: opts.sourceTag, scrapedAt: new Date().toISOString() }]
      : null;
    const data = {
      source: opts.sourceTag,
      sourceId,
      name: l.name,
      website: l.website ?? null,
      phone: l.phone ?? null,
      phones: phonesSeed ?? undefined,
      email: null,
      address: l.address ?? null,
      city: l.city ?? null,
      state: l.state ?? null,
      postalCode: l.postalCode ?? null,
      country: "USA",
      lat: null,
      lng: null,
      rating: null,
      reviewsCount: 0,
      category: "Pest Control",
      industry: opts.industry,
      hasWebsite: Boolean(l.website),
      emailReady: false,
      // QualityPro Certified flag goes on tags so you can filter for it
      // later — no schema change needed.
      tags: l.certified ? ["pestworld-certified"] : [],
    };
    const id = known.get(sourceId);
    if (id) {
      await prisma.scrapedBusiness.update({ where: { id }, data });
      updated++;
    } else {
      // Reject if any other visible row already owns this apex domain.
      // Pestworld lists the same QualityPro chains under multiple ZIP
      // codes; without this check we'd create duplicates of every chain
      // (terminix.com, orkin.com, etc.) once per state.
      if (l.website) {
        const owner = await findApexOwner(prisma, l.website);
        if (owner) {
          skippedDomainDupe++;
          continue;
        }
      }
      await prisma.scrapedBusiness.create({ data });
      created++;
    }
  }
  return { created, updated, skippedDomainDupe };
}

async function main() {
  const opts = parseArgs();

  console.log(
    `Fetching up to ${opts.zipsPerState} ZIPs across ${opts.states.length} states ` +
      `(concurrency=${opts.concurrency} per state, ${opts.statePauseSec}s between states)`,
  );

  const allListings: Listing[] = [];
  let totalHits = 0;
  let totalFails = 0;

  for (let s = 0; s < opts.states.length; s++) {
    const state = opts.states[s];
    const zips = ZIPS_BY_STATE[state];
    if (!zips) {
      console.warn(`[${state}] unknown state, skipping`);
      continue;
    }
    const stateZips = zips.slice(0, opts.zipsPerState);
    const stateListings: Listing[] = [];
    let cursor = 0;
    let hits = 0;
    let fails = 0;

    const worker = async (workerId: number) => {
      while (true) {
        const i = cursor++;
        if (i >= stateZips.length) return;
        const zip = stateZips[i];
        try {
          const list = await fetchZip(zip);
          const capped = opts.limitPerZip ? list.slice(0, opts.limitPerZip) : list;
          stateListings.push(...capped);
          hits++;
          console.log(
            `[${state} w${workerId}] ✓ ${zip} → ${capped.length} listings (${capped.filter((l) => l.website).length} with website)`,
          );
        } catch (err) {
          fails++;
          console.log(
            `[${state} w${workerId}] ✗ ${zip}: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      }
    };
    await Promise.all(Array.from({ length: opts.concurrency }, (_, i) => worker(i + 1)));
    allListings.push(...stateListings);
    totalHits += hits;
    totalFails += fails;
    console.log(`[${state}] done: ${stateListings.length} listings (${stateListings.filter((l) => l.website).length} with website)`);

    // Polite pause between states so we don't hammer pestworld back-to-back.
    if (s < opts.states.length - 1 && opts.statePauseSec > 0) {
      await new Promise((r) => setTimeout(r, opts.statePauseSec * 1000));
    }
  }
  const hits = totalHits;
  const fails = totalFails;

  console.log(`\nFetched ${allListings.length} listings total (${hits} ZIPs ok, ${fails} failed)`);
  console.log(`  with website:    ${allListings.filter((l) => l.website).length}`);
  console.log(`  without website: ${allListings.filter((l) => !l.website).length}`);

  if (opts.dryRun) {
    console.log("\n[dry-run] not importing.");
    for (const l of allListings.slice(0, 10)) {
      console.log(`  · ${l.name}  ${l.city ?? "?"}, ${l.state ?? "?"} ${l.website ?? "(no site)"}`);
    }
    await prisma.$disconnect();
    return;
  }

  const { created, updated, skippedDomainDupe } = await importListings(allListings, {
    sourceTag: opts.sourceTag,
    industry: opts.industry,
  });
  console.log(`\n=== imported ===`);
  console.log(`Created: ${created}`);
  console.log(`Updated: ${updated}`);
  if (skippedDomainDupe > 0) {
    console.log(`Skipped (domain already in DB): ${skippedDomainDupe}`);
  }
  console.log(`Source tag: ${opts.sourceTag}`);
  console.log(`\nNext: run the scraper to enrich the ones with websites →`);
  console.log(`  npm run fsq:process -- --source ${opts.sourceTag} --limit ${created + updated} --concurrency 5`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect().finally(() => process.exit(1));
});
