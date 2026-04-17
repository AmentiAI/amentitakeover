import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  phone: z.string().max(60).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  city: z.string().max(120).optional().or(z.literal("")),
  state: z.string().max(60).optional().or(z.literal("")),
  experience: z.string().max(4000).optional().or(z.literal("")),
  why: z.string().max(4000).optional().or(z.literal("")),
});

function clean(s: string | undefined): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length === 0 ? null : t;
}

export async function POST(req: NextRequest) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
  const d = parsed.data;

  const app = await prisma.affiliateApplication.create({
    data: {
      name: d.name.trim(),
      email: d.email.trim().toLowerCase(),
      phone: clean(d.phone),
      company: clean(d.company),
      city: clean(d.city),
      state: clean(d.state),
      experience: clean(d.experience),
      why: clean(d.why),
    },
  });

  return NextResponse.json({ id: app.id, status: app.status });
}
