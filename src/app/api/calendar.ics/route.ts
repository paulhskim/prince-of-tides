import { buildIcs } from "@/lib/booking/ical";
import { getManualBlocks } from "@/lib/booking/availability";
import { getStore } from "@/lib/booking/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/calendar.ics?token=ICAL_EXPORT_TOKEN
 * Our direct bookings (confirmed + active checkout holds) and manual blocks, for Airbnb/Vrbo to import.
 * Platform-imported events are never re-exported (avoids feedback loops). SUMMARY is "Reserved", no PII.
 * When ICAL_EXPORT_TOKEN is set the token must match; in production the token is required.
 */
export async function GET(req: Request) {
  const expected = process.env.ICAL_EXPORT_TOKEN;
  const token = new URL(req.url).searchParams.get("token");
  if (expected ? token !== expected : process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }
  const [active, manual] = await Promise.all([getStore().listActive(), getManualBlocks()]);
  const events = [
    ...active.map((b) => ({ uid: b.id, start: b.checkIn, end: b.checkOut })),
    ...manual.map((m) => ({ uid: `manual-${m.start}-${m.end}`, start: m.start, end: m.end })),
  ];
  return new Response(buildIcs(events), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="prince-of-tides.ics"',
      "Cache-Control": "public, max-age=300",
    },
  });
}
