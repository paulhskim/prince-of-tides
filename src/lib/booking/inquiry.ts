/**
 * Request-to-book processing (phase 1), independent of Next so it can be unit tested.
 * Order per docs/booking-architecture.md: validate, recompute the quote on the server, re-check rules and
 * availability, persist first, email second, return the reference.
 */
import { siteConfig, type Quote } from "@/content/site.config";
import { todayISO } from "./dates";
import { getBlockedRanges } from "./availability";
import { sendRequestEmails } from "./email";
import { hashIp, rateLimit } from "./rate-limit";
import { checkStay, type StayProblem } from "./rules";
import { fieldErrors, inquirySchema } from "./schemas";
import { getStore, newRef, type BookingRecord, type BookingStore } from "./store";
import type { BlockedRange } from "./ranges";

export type InquiryResponse =
  | { ok: true; id: string; quote: Quote }
  | {
      ok: false;
      error: "invalid" | "rate_limited" | "unavailable" | "rules" | "quote_changed" | "server";
      message: string;
      fields?: Record<string, string>;
      problems?: StayProblem[];
      quote?: Quote;
    };

export type InquiryDeps = {
  store?: BookingStore;
  ip?: string;
  now?: Date;
  /** Override availability (tests). Defaults to getBlockedRanges(). */
  getBlocked?: () => Promise<BlockedRange[]>;
  /** Override email delivery (tests). */
  sendEmails?: (r: BookingRecord) => Promise<BookingRecord["emailStatus"]>;
};

const MAX_LINKS_IN_MESSAGE = 2;

export async function processInquiry(body: unknown, deps: InquiryDeps = {}): Promise<{ status: number; body: InquiryResponse }> {
  const now = deps.now ?? new Date();
  const store = deps.store ?? getStore();

  // 1. Rate limit per IP.
  if (deps.ip) {
    const rl = rateLimit(`inquiry:${deps.ip}`, now.getTime());
    if (!rl.ok) {
      return {
        status: 429,
        body: { ok: false, error: "rate_limited", message: "Too many requests from this connection. Please try again later, or email us." },
      };
    }
  }

  // 2. Validate.
  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    // The honeypot failing validation is reported like a success so bots learn nothing.
    const fields = fieldErrors(parsed.error);
    if (fields.company) return { status: 200, body: { ok: true, id: newRef(now), quote: emptyQuoteFor(body) } };
    return { status: 400, body: { ok: false, error: "invalid", message: "Please correct the highlighted fields.", fields } };
  }
  const input = parsed.data;
  if (input.company) return { status: 200, body: { ok: true, id: newRef(now), quote: emptyQuoteFor(body) } };
  const links = (input.message.match(/https?:\/\//gi) ?? []).length;
  if (links > MAX_LINKS_IN_MESSAGE) {
    return {
      status: 400,
      body: { ok: false, error: "invalid", message: "Please remove links from your message.", fields: { message: "Message: please include no more than 2 links." } },
    };
  }

  // 3. Server-side rules, availability and quote (never trust client totals).
  const blocked = deps.getBlocked ? await deps.getBlocked() : (await getBlockedRanges({ store, now })).ranges;
  const guests = input.adults + input.children;
  const { quote, problems } = checkStay({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    guests,
    today: todayISO(siteConfig.times.timezone, now),
    blocked,
  });
  if (problems.some((p) => p.code === "unavailable")) {
    return { status: 409, body: { ok: false, error: "unavailable", message: problems.find((p) => p.code === "unavailable")!.message, problems } };
  }
  if (problems.length) {
    return { status: 422, body: { ok: false, error: "rules", message: problems[0].message, problems, quote } };
  }
  if (input.quotedTotal !== undefined && Math.abs(input.quotedTotal - quote.total) > 0.01) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "quote_changed",
        message: "The estimate for these dates has been updated. Please review the new total and send again.",
        quote,
      },
    };
  }

  // 4. Persist first.
  const ts = now.toISOString();
  const record: BookingRecord = {
    id: newRef(now),
    createdAt: ts,
    updatedAt: ts,
    status: "requested",
    kind: "request",
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
    source: input.source,
    quote,
    emailStatus: "pending",
    ipHash: deps.ip ? hashIp(deps.ip) : undefined,
  };
  try {
    await store.create(record);
  } catch (err) {
    console.error("[inquiry] could not persist request", err);
    // Fall through: the log line below and the host email still carry the request (phase 1a).
  }
  // One JSON line in the runtime log (phase 1a persistent log). No message body, to limit PII in logs.
  console.log(
    JSON.stringify({
      event: "booking_request",
      id: record.id,
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      adults: record.adults,
      children: record.children,
      infants: record.infants,
      total: quote.total,
      email: record.email,
      at: ts,
    }),
  );

  // 5. Email second; failure never loses the request.
  const emailStatus = await (deps.sendEmails ?? sendRequestEmails)(record);
  await store.update(record.id, { emailStatus }).catch(() => undefined);

  return { status: 200, body: { ok: true, id: record.id, quote } };
}

function emptyQuoteFor(body: unknown): Quote {
  void body;
  return {
    nights: 0,
    nightlyBreakdown: [],
    subtotal: 0,
    discounts: 0,
    discountLabel: null,
    cleaningFee: 0,
    taxableAmount: 0,
    taxes: [],
    taxTotal: 0,
    total: 0,
    minNightsRequired: siteConfig.booking.minNightsDefault,
    meetsMinNights: false,
    isPlaceholder: siteConfig.pricing.isPlaceholder,
    errors: [],
  };
}
