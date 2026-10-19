import { NextResponse } from "next/server";
import { processInquiry } from "@/lib/booking/inquiry";
import { clientIp } from "@/lib/booking/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/inquiry: request to book (phase 1). Returns { ok, id } or field errors. */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid", message: "Expected a JSON body." }, { status: 400 });
  }
  try {
    const result = await processInquiry(body, { ip: clientIp(req.headers) });
    return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("[api/inquiry] failed", err);
    return NextResponse.json({ ok: false, error: "server", message: "Something failed on our side." }, { status: 500 });
  }
}
