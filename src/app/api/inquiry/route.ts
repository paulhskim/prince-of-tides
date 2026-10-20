import { NextResponse } from "next/server";
import { processInquiry } from "@/lib/booking/inquiry";
import { clientIp } from "@/lib/booking/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Largest accepted request body. A real request is under 3 KB (the message is capped at 1000 characters). */
const MAX_BODY_BYTES = 16 * 1024;

/**
 * POST /api/inquiry: request to book (phase 1). Returns { ok, id } or field errors.
 * Only application/json is accepted: this keeps cross-site "simple" form or text/plain posts out (they
 * cannot set that content type without a CORS preflight, which this route does not grant).
 */
export async function POST(req: Request) {
  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") {
    return NextResponse.json({ ok: false, error: "invalid", message: "Expected a JSON body." }, { status: 415 });
  }
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, error: "invalid", message: "Request too large." }, { status: 413 });
  }
  let body: unknown;
  try {
    const text = await req.text();
    if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) {
      return NextResponse.json({ ok: false, error: "invalid", message: "Request too large." }, { status: 413 });
    }
    body = JSON.parse(text);
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
