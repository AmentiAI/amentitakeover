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
  // 8-char random alphanumeric, unambiguous (no 0/O/1/l/I).
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let out = "";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}

export async function GET() {
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { calls: true, deals: true } },
    },
  });
  return NextResponse.json(affiliates);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const commissionPctNum = Number(body?.commissionPct);
  const commissionPct =
    Number.isFinite(commissionPctNum) && commissionPctNum >= 0 && commissionPctNum <= 100
      ? Math.round(commissionPctNum)
      : 30;
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const base = slugify(name) || "affiliate";
  let slug = base;
  let i = 2;
  while (await prisma.affiliate.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${i++}`;
  }

  const affiliate = await prisma.affiliate.create({
    data: {
      name,
      slug,
      passcode: generatePasscode(),
      commissionPct,
    },
  });
  return NextResponse.json(affiliate);
}
