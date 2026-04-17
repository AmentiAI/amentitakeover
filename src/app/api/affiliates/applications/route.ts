import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const apps = await prisma.affiliateApplication.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json(apps);
}
