/**
 * Phase 3: Stripe Checkout instant booking. Server only. OFF by default.
 * Active only when siteConfig.features.stripeCheckout is true AND STRIPE_SECRET_KEY is set; the routes
 * return 404 otherwise. Enable only after the prerequisites in docs/booking-architecture.md (database
 * adapter, iCal sync healthy, real rates, tax registration, rental agreement).
 */
import Stripe from "stripe";
import { siteConfig, type Quote } from "@/content/site.config";
import { diffDays, formatLong, formatMoney, toCents, todayISO } from "./dates";
import { getBlockedRanges } from "./availability";
import { checkStay } from "./rules";
import { checkoutSchema, fieldErrors } from "./schemas";
import { getStore, newRef, type BookingRecord, type BookingStore } from "./store";
import { deliver } from "./email";
import { isRangeFree } from "./ranges";

export const HOLD_MINUTES = 30;
export const DEPOSIT_THRESHOLD_DAYS = 30;

export function stripeEnabled(): boolean {
  return siteConfig.features.stripeCheckout && Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

type SessionParams = Parameters<Stripe["checkout"]["sessions"]["create"]>[0];

/** 50% now when check-in is 30+ days out (balance later, card saved), otherwise 100%. */
export function amountDueNow(quote: Quote, checkIn: string, today: string): { cents: number; deposit: boolean } {
  const totalCents = toCents(quote.total);
  const deposit = diffDays(today, checkIn) >= DEPOSIT_THRESHOLD_DAYS;
  return { cents: deposit ? Math.round(totalCents / 2) : totalCents, deposit };
}

export function buildSessionParams(record: BookingRecord, siteUrl: string, today: string): SessionParams {
  const q = record.quote;
  const due = amountDueNow(q, record.checkIn, today);
  const dates = `${formatLong(record.checkIn)} to ${formatLong(record.checkOut)}`;
  const currency = siteConfig.pricing.currency.toLowerCase();
  const lineItems: NonNullable<SessionParams>["line_items"] = due.deposit
    ? [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: due.cents,
            product_data: {
              name: `Deposit (50%), ${siteConfig.brand.name}, ${q.nights} nights`,
              description: `${dates}. Total ${formatMoney(q.total)} including cleaning and lodging taxes. Due now ${formatMoney(due.cents / 100)}; balance ${formatMoney(q.total - due.cents / 100)} charged 30 days before check-in.`,
            },
          },
        },
      ]
    : [
        {
          quantity: 1,
          price_data: {
            currency,
            unit_amount: toCents(q.subtotal - q.discounts),
            product_data: {
              name: `Lodging, ${q.nights} nights`,
              description: `${dates}${q.discountLabel ? `, after ${q.discountLabel.toLowerCase()}` : ""}`,
            },
          },
        },
        { quantity: 1, price_data: { currency, unit_amount: toCents(q.cleaningFee), product_data: { name: "Cleaning fee" } } },
        ...q.taxes.map((t) => ({
          quantity: 1,
          price_data: { currency, unit_amount: toCents(t.amount), product_data: { name: `${t.name} (${(t.rate * 100).toFixed(0)}%)` } },
        })),
      ];
  return {
    mode: "payment",
    line_items: lineItems,
    customer_email: record.email,
    client_reference_id: record.id,
    metadata: { booking_id: record.id, check_in: record.checkIn, check_out: record.checkOut, total_cents: String(toCents(q.total)) },
    payment_intent_data: {
      metadata: { booking_id: record.id },
      ...(due.deposit ? { setup_future_usage: "off_session" as const } : {}),
    },
    expires_at: Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60,
    success_url: `${siteUrl}/booking/success?id=${encodeURIComponent(record.id)}&paid=1`,
    cancel_url: `${siteUrl}/book?checkIn=${record.checkIn}&checkOut=${record.checkOut}&adults=${record.adults}&children=${record.children}&infants=${record.infants}`,
  };
}

export function siteUrlFrom(req: Request): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin).replace(/\/$/, "");
}

/* ------------------------------------------------------------------ */
/* POST /api/checkout                                                  */
/* ------------------------------------------------------------------ */

export async function createCheckout(
  body: unknown,
  opts: { siteUrl: string; store?: BookingStore; stripe?: Pick<Stripe, "checkout"> },
): Promise<{ status: number; body: Record<string, unknown> }> {
  const store = opts.store ?? getStore();
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return { status: 400, body: { ok: false, error: "invalid", fields: fieldErrors(parsed.error) } };
  const input = parsed.data;
  if (input.company) return { status: 400, body: { ok: false, error: "invalid" } };

  const now = new Date();
  const today = todayISO(siteConfig.times.timezone, now);
  // Availability re-check #1: fresh platform feeds (bypass cache) plus store. Fail closed.
  const snap = await getBlockedRanges({ fresh: true, store, now });
  if (!snap.complete) {
    return { status: 503, body: { ok: false, error: "availability_unknown", message: "We could not confirm availability right now. Please send a request instead." } };
  }
  const { quote, problems } = checkStay({ checkIn: input.checkIn, checkOut: input.checkOut, guests: input.adults + input.children, today, blocked: snap.ranges });
  if (problems.some((p) => p.code === "unavailable")) return { status: 409, body: { ok: false, error: "unavailable", problems } };
  if (problems.length) return { status: 422, body: { ok: false, error: "rules", problems } }; // min nights is hard in instant mode

  const ts = now.toISOString();
  const record: BookingRecord = {
    id: newRef(now),
    createdAt: ts,
    updatedAt: ts,
    status: "hold",
    kind: "checkout",
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    adults: input.adults,
    children: input.children,
    infants: input.infants,
    name: input.name,
    email: input.email,
    phone: input.phone,
    arrivalTime: input.arrivalTime || undefined,
    message: input.message || undefined,
    quote,
    emailStatus: "pending",
    holdExpiresAt: new Date(now.getTime() + HOLD_MINUTES * 60_000).toISOString(),
    amountDueNowCents: amountDueNow(quote, input.checkIn, today).cents,
    agreementAcceptedAt: ts,
  };
  const held = await store.createHoldIfFree(record);
  if (!held) return { status: 409, body: { ok: false, error: "unavailable", message: "Those dates were just booked." } };

  const stripe = opts.stripe ?? getStripe();
  try {
    const session = await stripe.checkout.sessions.create(buildSessionParams(record, opts.siteUrl, today), {
      idempotencyKey: `checkout-${record.id}`,
    });
    await store.update(record.id, { stripeCheckoutSessionId: session.id });
    return { status: 200, body: { ok: true, id: record.id, url: session.url } };
  } catch (err) {
    console.error("[checkout] Stripe session failed", err);
    await store.update(record.id, { status: "expired" });
    return { status: 502, body: { ok: false, error: "payment_unavailable", message: "Payment is unavailable right now. Please send a request instead." } };
  }
}

/* ------------------------------------------------------------------ */
/* POST /api/stripe/webhook                                            */
/* ------------------------------------------------------------------ */

type MinimalEvent = { id: string; type: string; data: { object: Record<string, unknown> } };

export async function handleStripeEvent(
  event: MinimalEvent,
  opts: { store?: BookingStore; stripe?: Pick<Stripe, "refunds">; fresh?: boolean } = {},
): Promise<{ handled: boolean; note: string }> {
  const store = opts.store ?? getStore();
  // Idempotency: each event id is processed once.
  if (!(await store.recordEvent(event.id))) return { handled: false, note: "duplicate event" };
  try {
    return await processEvent(event, store, opts);
  } catch (err) {
    await store.forgetEvent(event.id).catch(() => undefined);
    throw err;
  }
}

async function processEvent(
  event: MinimalEvent,
  store: BookingStore,
  opts: { stripe?: Pick<Stripe, "refunds">; fresh?: boolean },
): Promise<{ handled: boolean; note: string }> {

  const obj = event.data.object as {
    id?: string;
    metadata?: Record<string, string>;
    payment_status?: string;
    payment_intent?: string | { id: string } | null;
    amount_total?: number | null;
  };

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    if (obj.payment_status !== "paid") return { handled: false, note: "not paid yet" };
    const bookingId = obj.metadata?.booking_id;
    const booking = (bookingId && (await store.get(bookingId))) || (obj.id ? await store.findByCheckoutSession(obj.id) : null);
    if (!booking) return { handled: false, note: "booking not found" };
    if (booking.status === "confirmed") return { handled: false, note: "already confirmed" };
    const paymentIntent = typeof obj.payment_intent === "string" ? obj.payment_intent : obj.payment_intent?.id;

    // Availability re-check #2 (fresh feeds), excluding this booking's own hold.
    const snap = await getBlockedRanges({ fresh: opts.fresh ?? true, store, excludeId: booking.id });
    const holdLive = booking.status === "hold";
    const free = snap.complete && isRangeFree(snap.ranges, booking.checkIn, booking.checkOut);

    if (holdLive && free) {
      await store.update(booking.id, {
        status: "confirmed",
        stripePaymentIntentId: paymentIntent,
        amountPaidCents: obj.amount_total ?? booking.amountDueNowCents,
      });
      await notifyConfirmed(booking, store);
      await revalidateAvailability();
      return { handled: true, note: "confirmed" };
    }

    // The honest failure mode: refund in full and tell both sides.
    if (paymentIntent) {
      const stripe = opts.stripe ?? getStripe();
      await stripe.refunds.create({ payment_intent: paymentIntent }, { idempotencyKey: `refund-${booking.id}` });
    }
    await store.update(booking.id, { status: "cancelled", stripePaymentIntentId: paymentIntent, amountRefundedCents: obj.amount_total ?? undefined });
    await deliver([
      {
        to: booking.email,
        subject: `${siteConfig.brand.name}: your dates could not be held`,
        text: `Dear ${booking.name},\n\nWe are sorry. Your dates (${formatLong(booking.checkIn)} to ${formatLong(booking.checkOut)}) were taken before your payment completed. Your payment has been refunded in full.\n\nReference: ${booking.id}`,
      },
      {
        to: process.env.BOOKING_NOTIFY_EMAIL ?? "host",
        subject: `Refunded: ${booking.id}, dates no longer available`,
        text: `Checkout ${booking.id} completed but the dates were no longer available (hold ${holdLive ? "live" : "expired"}, feeds complete ${snap.complete}). A full refund was issued.`,
      },
    ]);
    return { handled: true, note: "refunded" };
  }

  if (event.type === "checkout.session.expired") {
    const booking = obj.metadata?.booking_id ? await store.get(obj.metadata.booking_id) : null;
    if (booking?.status === "hold") {
      await store.update(booking.id, { status: "expired" });
      await revalidateAvailability();
      return { handled: true, note: "expired" };
    }
    return { handled: false, note: "no hold" };
  }

  return { handled: false, note: `ignored ${event.type}` };
}

async function notifyConfirmed(b: BookingRecord, store: BookingStore) {
  const status = await deliver([
    {
      to: b.email,
      subject: `${siteConfig.brand.name}: confirmed, ${formatLong(b.checkIn)} to ${formatLong(b.checkOut)}`,
      text: `Dear ${b.name},\n\nYour stay is confirmed and your payment has been received.\n\nArrive: ${formatLong(b.checkIn)}, from 4:00 PM\nDepart: ${formatLong(b.checkOut)}, by 10:00 AM\nTotal: ${formatMoney(b.quote.total)}\n\nReference: ${b.id}`,
    },
    {
      to: process.env.BOOKING_NOTIFY_EMAIL ?? "host",
      subject: `Confirmed and paid: ${b.name}, ${b.checkIn} to ${b.checkOut} [${b.id}]`,
      text: `Instant booking ${b.id} is confirmed. Block these dates on Airbnb and Vrbo if they do not import /api/calendar.ics.`,
    },
  ]);
  await store.update(b.id, { emailStatus: status }).catch(() => undefined);
}

async function revalidateAvailability() {
  try {
    const { revalidateTag } = await import("next/cache");
    revalidateTag("availability");
  } catch {
    // Outside Next (tests): nothing to revalidate.
  }
}
