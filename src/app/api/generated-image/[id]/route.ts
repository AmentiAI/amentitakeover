import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Stream a generated image's bytes. Immutable cache — the row's `bytes`
 * never mutates; we regenerate by deleting + recreating rows, which issues
 * new ids and therefore new URLs.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const img = await prisma.generatedImage.findUnique({
    where: { id },
    select: { bytes: true, mimeType: true },
  });
  if (!img) return new Response("Not found", { status: 404 });

  const body = new Uint8Array(img.bytes);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": img.mimeType,
      "Content-Length": body.byteLength.toString(),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
