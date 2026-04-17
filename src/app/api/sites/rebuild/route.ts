import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rebuildSite } from "@/lib/rebuilder";
import { z } from "zod";

export const maxDuration = 300;

const Body = z.object({
  siteId: z.string(),
  direction: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Body.safeParse(json);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const site = await prisma.site.findUnique({ where: { id: parsed.data.siteId } });
  if (!site) return NextResponse.json({ error: "Site not found" }, { status: 404 });

  try {
    const result = await rebuildSite({
      site: {
        url: site.url,
        title: site.title,
        description: site.description,
        textContent: site.textContent,
        headings: site.headings as any,
        images: site.images as any,
        palette: site.palette,
        fonts: site.fonts,
      },
      direction: parsed.data.direction,
    });
    const rebuild = await prisma.siteRebuild.create({
      data: {
        siteId: site.id,
        html: result.html,
        notes: result.notes,
        model: result.model,
        prompt: parsed.data.direction,
        status: "ready",
      },
    });
    return NextResponse.json(rebuild);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
