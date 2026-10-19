import { NextResponse } from "next/server";
import { addDays, diffDays, todayISO } from "@/lib/booking/dates";
import { getBlockedRanges, publicAvailability } from "@/lib/booking/availability";
import { availabilityQuerySchema } from "@/lib/booking/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_SPAN_DAYS = 400;

/**
 * GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns blocked nights in [from, to) as merged ranges and as a flat list. No sources or guest data.
 * Defaults: from = today at the property, to = from + 366 days.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from") ?? todayISO();
  const to = url.searchParams.get("to") ?? addDays(from, 366);
  const parsed = availabilityQuerySchema.safeParse({ from, to });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid range" }, { status: 400 });
  }
  if (diffDays(from, to) > MAX_SPAN_DAYS) {
    return NextResponse.json({ error: `Range is limited to ${MAX_SPAN_DAYS} days.` }, { status: 400 });
  }
  try {
    const snap = await getBlockedRanges();
    return NextResponse.json(publicAvailability(snap, from, to), {
      headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600" },
    });
  } catch (err) {
    console.error("[api/availability] failed", err);
    // Degrade: no known blocks, flagged incomplete so the UI says the host confirms dates.
    return NextResponse.json(
      { from, to, blocked: [], nights: [], complete: false, updatedAt: new Date().toISOString() },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
