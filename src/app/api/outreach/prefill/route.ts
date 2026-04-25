import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SINGLETON_ID = "default";

// Singleton row: the OutreachPrefill table only ever holds one entry. We
// upsert rather than relying on a fixed-id default, so the first-ever GET
// works on a fresh DB without seeding.

export async function GET() {
  const row = await prisma.outreachPrefill.findUnique({ where: { id: SINGLETON_ID } });
  return NextResponse.json({ prefill: row ?? emptyPrefill() });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const data = sanitize(body);
  const row = await prisma.outreachPrefill.upsert({
    where: { id: SINGLETON_ID },
    update: data,
    create: { id: SINGLETON_ID, ...data },
  });
  return NextResponse.json({ prefill: row });
}

function emptyPrefill() {
  return {
    id: SINGLETON_ID,
    name: null,
    email: null,
    phone: null,
    subject: null,
    message: null,
    referralSource: null,
    service: null,
    projectType: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    fieldOverrides: null,
  };
}

function sanitize(body: Record<string, unknown>) {
  const stringFields = [
    "name",
    "email",
    "phone",
    "subject",
    "message",
    "referralSource",
    "service",
    "projectType",
    "address",
    "city",
    "state",
    "zip",
  ] as const;
  const out: Record<string, unknown> = {};
  for (const key of stringFields) {
    const v = body[key];
    if (typeof v === "string") {
      const trimmed = v.trim();
      out[key] = trimmed.length > 0 ? trimmed : null;
    } else if (v === null) {
      out[key] = null;
    }
  }
  if (body.fieldOverrides && typeof body.fieldOverrides === "object" && !Array.isArray(body.fieldOverrides)) {
    // Filter to string→string entries to avoid persisting deeply-nested junk.
    const fo = body.fieldOverrides as Record<string, unknown>;
    const cleaned: Record<string, string> = {};
    for (const [k, v] of Object.entries(fo)) {
      if (typeof k === "string" && typeof v === "string") cleaned[k] = v;
    }
    out.fieldOverrides = Object.keys(cleaned).length ? cleaned : null;
  } else if (body.fieldOverrides === null) {
    out.fieldOverrides = null;
  }
  return out;
}
