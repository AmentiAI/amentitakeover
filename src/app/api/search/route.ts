import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ results: [] });

  const [contacts, businesses, opps, scraped] = await Promise.all([
    prisma.contact.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: "insensitive" } },
          { lastName: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 6,
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
    prisma.business.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { website: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, city: true, state: true },
    }),
    prisma.opportunity.findMany({
      where: { title: { contains: q, mode: "insensitive" } },
      take: 5,
      select: { id: true, title: true, stage: { select: { name: true } } },
    }),
    prisma.scrapedBusiness.findMany({
      where: {
        archived: false,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { website: { contains: q, mode: "insensitive" } },
          { city: { contains: q, mode: "insensitive" } },
        ],
      },
      take: 5,
      select: { id: true, name: true, city: true, state: true, industry: true },
    }),
  ]);

  return NextResponse.json({
    contacts: contacts.map((c) => ({
      id: c.id,
      label: [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email || "(no name)",
      sub: c.email ?? "",
      href: `/contacts/${c.id}`,
    })),
    businesses: businesses.map((b) => ({
      id: b.id,
      label: b.name,
      sub: [b.city, b.state].filter(Boolean).join(", "),
      href: `/companies/${b.id}`,
    })),
    opportunities: opps.map((o) => ({
      id: o.id,
      label: o.title,
      sub: o.stage.name,
      href: `/opportunities`,
    })),
    scraped: scraped.map((s) => ({
      id: s.id,
      label: s.name,
      sub: [s.industry, s.city, s.state].filter(Boolean).join(" · "),
      href: `/outreach/scrape/google`,
    })),
  });
}
