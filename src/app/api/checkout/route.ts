import { NextResponse } from "next/server";
import { createCheckout, siteUrlFrom, stripeEnabled } from "@/lib/booking/stripe";
import { clientIp } from "@/lib/booking/rate-limit";
import { rateLimit } from "@/lib/booking/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** POST /api/checkout (phase 3). 404 unless features.stripeCheckout and STRIPE_SECRET_KEY are both set. */
export async function POST(req: Request) {
  if (!stripeEnabled()) return new NextResponse("Not found", { status: 404 });
  if (!rateLimit(`checkout:${clientIp(req.headers)}`).ok) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const result = await createCheckout(body, { siteUrl: siteUrlFrom(req) });
  return NextResponse.json(result.body, { status: result.status, headers: { "Cache-Control": "no-store" } });
}
