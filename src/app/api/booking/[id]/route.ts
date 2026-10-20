import { NextResponse } from "next/server";
import { getStore } from "@/lib/booking/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/booking/:id: status for the success page (polls while a paid checkout is processing).
 * Returns a non-PII summary only (status, dates, total): never name, email, phone or message.
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  // References look like POT-2610-7F3K; anything else is not looked up at all.
  if (!/^POT-[0-9]{4}-[A-Z0-9]{4}$/.test(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const b = await getStore().get(id);
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(
    { id: b.id, status: b.status, checkIn: b.checkIn, checkOut: b.checkOut, total: b.quote.total },
    { headers: { "Cache-Control": "no-store" } },
  );
}
