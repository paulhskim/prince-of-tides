import { NextResponse } from "next/server";
import { getStore } from "@/lib/booking/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/booking/:id: status for the success page (polls while a paid checkout is processing). No PII. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const b = await getStore().get(id);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(
    { id: b.id, status: b.status, checkIn: b.checkIn, checkOut: b.checkOut, total: b.quote.total },
    { headers: { "Cache-Control": "no-store" } },
  );
}
