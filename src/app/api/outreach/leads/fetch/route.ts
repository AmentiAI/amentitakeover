import { NextRequest, NextResponse } from "next/server";
import {
  KNOWN_INDUSTRIES,
  deriveSourceTag,
  fetchOsmLeads,
  importLeads,
  partitionByExisting,
} from "@/lib/lead-fetcher";

// API counterpart of scripts/fetch-leads.ts. Same lib under the hood —
// exists so the operator doesn't have to drop into a terminal to start a
// new lead pull. Returns a summary of what was fetched + imported.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    industry?: string;
    state?: string;
    city?: string;
    count?: number;
    sourceTag?: string;
    dryRun?: boolean;
  };

  if (!body.industry || !body.state) {
    return NextResponse.json(
      { error: "industry and state are required" },
      { status: 400 },
    );
  }
  const count = Math.max(1, Math.min(500, Number(body.count ?? 100)));
  const sourceTag = body.sourceTag?.trim() || deriveSourceTag(body.industry);

  try {
    const { records: pool, rawCount } = await fetchOsmLeads({
      industry: body.industry,
      state: body.state,
      city: body.city,
      count,
    });

    // Skip rows we've already imported under this source tag, then take
    // only the requested count of unseen ones. Result: every pull yields
    // genuinely new businesses until the OSM region runs out.
    const { fresh, alreadyImported } = await partitionByExisting(pool, sourceTag);
    const selected = fresh.slice(0, count);

    if (body.dryRun) {
      return NextResponse.json({
        dryRun: true,
        rawCount,
        poolSize: pool.length,
        alreadyImported,
        kept: selected.length,
        records: selected.map((r) => ({
          name: r.name,
          website: r.website,
          city: r.locality,
          state: r.region,
        })),
      });
    }

    const { created, updated, skippedDomainDupe } = await importLeads(selected, {
      industry: body.industry,
      sourceTag,
    });
    return NextResponse.json({
      ok: true,
      rawCount,
      poolSize: pool.length,
      alreadyImported,
      kept: selected.length,
      created,
      updated,
      skippedDomainDupe,
      sourceTag,
      records: selected.map((r) => ({
        name: r.name,
        website: r.website,
        city: r.locality,
        state: r.region,
      })),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ knownIndustries: KNOWN_INDUSTRIES });
}
