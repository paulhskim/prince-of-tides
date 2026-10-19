import { NextResponse } from "next/server";
import { getStripe, handleStripeEvent, stripeEnabled } from "@/lib/booking/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/stripe/webhook (phase 3). 404 unless Stripe checkout is enabled.
 * Verifies the signature against the raw body with STRIPE_WEBHOOK_SECRET; processing is idempotent by
 * event id (see handleStripeEvent).
 */
export async function POST(req: Request) {
  if (!stripeEnabled()) return new NextResponse("Not found", { status: 404 });
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  const raw = await req.text();
  let event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.warn("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  try {
    const result = await handleStripeEvent(event as unknown as Parameters<typeof handleStripeEvent>[0]);
    return NextResponse.json({ received: true, ...result });
  } catch (err) {
    console.error("[stripe webhook] handler failed", err);
    // 500 makes Stripe retry; handleStripeEvent released the event id so the retry is processed.
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
