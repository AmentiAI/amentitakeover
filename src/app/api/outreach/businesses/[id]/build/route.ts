import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { rebuildSite } from "@/lib/rebuilder";
import {
  getTemplatePreviewUrl,
  normalizeTemplateChoice,
} from "@/lib/site-url";

export const maxDuration = 300;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const templateChoice = normalizeTemplateChoice(body?.templateChoice);

  const b = await prisma.scrapedBusiness.findUnique({
    where: { id },
    include: { site: true },
  });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!b.audited || !b.site) {
    return NextResponse.json(
      { error: "Run Enrich first — site data is missing." },
      { status: 400 },
    );
  }

  try {
    const site = b.site;
    const images = Array.isArray(site.images)
      ? (site.images as { src: string; alt?: string | null }[]).map((i) => ({
          src: i.src,
          alt: i.alt ?? "",
        }))
      : [];

    const rebuild = await rebuildSite({
      site: {
        url: site.url,
        title: site.title ?? b.name,
        description: site.description ?? null,
        textContent: site.textContent ?? "",
        headings: site.headings as unknown,
        images,
        palette: site.palette ?? [],
        fonts: site.fonts ?? [],
      },
    });

    await prisma.siteRebuild.create({
      data: {
        siteId: site.id,
        html: rebuild.html,
        notes: rebuild.notes,
        model: rebuild.model,
        status: "ready",
      },
    });

    await prisma.scrapedBusiness.update({
      where: { id },
      data: {
        siteGenerated: true,
        templateChoice,
      },
    });

    return NextResponse.json({
      ok: true,
      templateChoice,
      previewUrl: getTemplatePreviewUrl(id, { template: templateChoice }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
