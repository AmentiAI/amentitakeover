import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function generatePasscode(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const action = body?.action as "approve" | "reject" | undefined;
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const app = await prisma.affiliateApplication.findUnique({ where: { id } });
  if (!app) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (app.status !== "pending") {
    return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
  }

  if (action === "reject") {
    const updated = await prisma.affiliateApplication.update({
      where: { id },
      data: { status: "rejected", reviewedAt: new Date() },
    });
    return NextResponse.json(updated);
  }

  const commissionPct = Number.isFinite(Number(body?.commissionPct))
    ? Math.max(0, Math.min(100, Math.round(Number(body.commissionPct))))
    : 30;

  const base = slugify(app.name) || "affiliate";
  let slug = base;
  let i = 2;
  while (await prisma.affiliate.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }

  const affiliate = await prisma.affiliate.create({
    data: {
      name: app.name,
      slug,
      passcode: generatePasscode(),
      commissionPct,
    },
  });

  const updated = await prisma.affiliateApplication.update({
    where: { id },
    data: {
      status: "approved",
      reviewedAt: new Date(),
      affiliateId: affiliate.id,
    },
  });

  return NextResponse.json({ application: updated, affiliate });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  await prisma.affiliateApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
