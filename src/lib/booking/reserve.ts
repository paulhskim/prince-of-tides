/**
 * Pure helpers for the /reserve page (client and server safe, unit tested in tests/booking/reserve.test.ts).
 *
 * Nothing here prices a stay: every figure comes from computeQuote / getNightlyRate in
 * src/content/site.config.ts. These helpers only group, date and describe what that quote and the
 * policies in src/content/policies.ts already say.
 */
import { rateForISO, siteConfig, type NightKind, type NightRate, type Quote, type QuoteNight } from "@/content/site.config";
import { policies } from "@/content/policies";
import { addDays, diffDays, weekday, type ISODate } from "./dates";

const roundCents = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/* ------------------------------------------------------------------ */
/* Nightly rates (only ever shown after a guest has chosen dates)      */
/* ------------------------------------------------------------------ */

/** Rate for the night that starts on `iso` (same call computeQuote makes). */
export function rateForNight(iso: ISODate): NightRate {
  return rateForISO(iso);
}

export type NightGroup = {
  /** Event name, or the season name for weeknight / weekend runs. */
  name: string;
  season: string;
  kind: NightKind;
  rate: number;
  nights: number;
  amount: number;
  first: ISODate;
  last: ISODate;
  /** Event nights priced at the event's own Friday and Saturday rate. */
  eventWeekend: boolean;
};

/** True when `n` is a Friday or Saturday night of an event that has its own weekend rate. */
function isEventWeekend(n: QuoteNight): boolean {
  if (n.kind !== "event") return false;
  const wd = weekday(n.date);
  if (wd !== 5 && wd !== 6) return false;
  const e = siteConfig.pricing.events.find((x) => n.date >= x.first && n.date <= x.last && x.name === n.label);
  return Boolean(e?.weekendNightly && e.weekendNightly !== e.nightly);
}

/**
 * Nights grouped like a tailored quote: consecutive nights with the same rate and the same reason form
 * one line ("3 weeknights, Late fall, $140", "4 nights, RBC Heritage week, $325"). A new line starts
 * whenever the rate or the reason changes, so the folio reads in date order.
 */
export function groupNightRuns(q: Pick<Quote, "nightlyBreakdown">): NightGroup[] {
  const groups: NightGroup[] = [];
  for (const n of q.nightlyBreakdown) {
    const g = groups[groups.length - 1];
    const eventWeekend = isEventWeekend(n);
    if (g && g.rate === n.rate && g.kind === n.kind && g.name === nameOf(n) && g.eventWeekend === eventWeekend && addDays(g.last, 1) === n.date) {
      g.nights++;
      g.amount = roundCents(g.amount + n.rate);
      g.last = n.date;
    } else {
      groups.push({ name: nameOf(n), season: n.season, kind: n.kind, rate: n.rate, nights: 1, amount: n.rate, first: n.date, last: n.date, eventWeekend });
    }
  }
  return groups;
}

function nameOf(n: QuoteNight): string {
  return n.kind === "event" ? n.label : n.season;
}

/** "3 weeknights", "1 weekend night", "4 nights" (event nights; "weekend nights" at an event's weekend rate). */
export function nightsPhrase(g: Pick<NightGroup, "kind" | "nights"> & { eventWeekend?: boolean }): string {
  const one = g.nights === 1;
  if (g.kind === "weeknight") return `${g.nights} ${one ? "weeknight" : "weeknights"}`;
  if (g.kind === "weekend" || g.eventWeekend) return `${g.nights} weekend ${one ? "night" : "nights"}`;
  return `${g.nights} ${one ? "night" : "nights"}`;
}

/** Averages for the folio footer. `allIn` includes cleaning and taxes; `lodging` is after any discount. */
export function averagePerNight(q: Pick<Quote, "nights" | "subtotal" | "discounts" | "total">): { lodging: number; allIn: number } {
  if (!q.nights) return { lodging: 0, allIn: 0 };
  return { lodging: roundCents((q.subtotal - q.discounts) / q.nights), allIn: roundCents(q.total / q.nights) };
}

/** Events (names) that price at least one night of the quote, in date order. */
export function eventsInQuote(q: Pick<Quote, "nightlyBreakdown">): string[] {
  const out: string[] = [];
  for (const n of q.nightlyBreakdown) if (n.kind === "event" && !out.includes(n.label)) out.push(n.label);
  return out;
}

/**
 * Minimum-stay hint for the calendar (no prices): the default minimum, the seasons that ask for more,
 * and the longest event minimum.
 */
export function minimumStaySummary(): string {
  const { booking, pricing } = siteConfig;
  const def = booking.minNightsDefault;
  const seasonal = pricing.seasons.filter((s) => s.minNights > def).map((s) => `${s.minNights} in ${s.name.toLowerCase()}`);
  const eventMax = Math.max(def, ...pricing.events.map((e) => e.minNights));
  const events = eventMax > def ? ` Holiday and island-event weeks set their own minimum, up to ${eventMax} nights, shown as you choose.` : "";
  return `Minimum stay ${def} nights${seasonal.length ? `; ${seasonal.join(", ")}` : ""}.${events}`;
}

/* ------------------------------------------------------------------ */
/* Payment schedule (policies.payment)                                 */
/* ------------------------------------------------------------------ */

/**
 * Terms behind each payment policy id. The wording lives in src/content/policies.ts; these are the
 * numbers that wording states ("50% ... to confirm", "balance is due 30 days before check-in").
 */
const PAYMENT_TERMS: Record<string, { depositPct: number; balanceDaysBefore: number }> = {
  "split-50-50": { depositPct: 50, balanceDaysBefore: 30 },
};

export function paymentTerms(policyId: string = siteConfig.booking.depositPolicy): { depositPct: number; balanceDaysBefore: number } {
  const known = PAYMENT_TERMS[policyId];
  if (known) return known;
  // Fallback: read the numbers from the policy summary itself.
  const pct = /(\d+)%/.exec(policies.payment.summary);
  const days = /(\d+) days before check-in/.exec(policies.payment.summary);
  return { depositPct: pct ? Number(pct[1]) : 100, balanceDaysBefore: days ? Number(days[1]) : 0 };
}

/** Date the balance is due: N days before arrival. */
export function balanceDueDate(checkIn: ISODate, daysBefore: number = paymentTerms().balanceDaysBefore): ISODate {
  return addDays(checkIn, -daysBefore);
}

export type PaymentSchedule = {
  depositPct: number;
  deposit: number;
  balance: number;
  /** null when the whole amount is due at confirmation. */
  balanceDue: ISODate | null;
  /** True when booking inside the balance window, so 100% is due at confirmation. */
  fullAtConfirmation: boolean;
};

/**
 * Split a total per the payment policy. Inside the balance window (today on or after the balance due
 * date) everything is due at confirmation, as policies.payment.schedule states.
 */
export function paymentSchedule(total: number, checkIn: ISODate, today: ISODate, policyId?: string): PaymentSchedule {
  const terms = paymentTerms(policyId);
  const due = balanceDueDate(checkIn, terms.balanceDaysBefore);
  const fullAtConfirmation = terms.depositPct >= 100 || today >= due;
  if (fullAtConfirmation) {
    return { depositPct: 100, deposit: roundCents(total), balance: 0, balanceDue: null, fullAtConfirmation: true };
  }
  const deposit = roundCents((total * terms.depositPct) / 100);
  return { depositPct: terms.depositPct, deposit, balance: roundCents(total - deposit), balanceDue: due, fullAtConfirmation: false };
}

/* ------------------------------------------------------------------ */
/* Cancellation tiers with dates (policies.cancellation)               */
/* ------------------------------------------------------------------ */

export type DatedTier = {
  when: string;
  refund: string;
  /** First calendar day this tier applies (inclusive), or null for "from now". */
  from: ISODate | null;
  /** Last calendar day this tier applies (inclusive). */
  until: ISODate;
  /** The tier ended before today. */
  passed: boolean;
};

/** Parse a tier's day bounds from its wording: "60 or more days", "30 to 59 days", "Less than 30 days". */
export function tierDayBounds(when: string): { minDays: number; maxDays: number | null } | null {
  let m = /(\d+) or more days/i.exec(when);
  if (m) return { minDays: Number(m[1]), maxDays: null };
  m = /(\d+) to (\d+) days/i.exec(when);
  if (m) return { minDays: Number(m[1]), maxDays: Number(m[2]) };
  m = /less than (\d+) days/i.exec(when);
  if (m) return { minDays: 0, maxDays: Number(m[1]) - 1 };
  return null;
}

/**
 * The cancellation tiers as real dates for an arrival. A tier covering "N to M days before check-in"
 * runs from checkIn - M through checkIn - N. Tiers that have already ended are flagged `passed`.
 */
export function cancellationDates(checkIn: ISODate, today: ISODate, tiers = policies.cancellation.tiers): DatedTier[] {
  const out: DatedTier[] = [];
  for (const t of tiers) {
    const b = tierDayBounds(t.when);
    if (!b) continue;
    const from = b.maxDays === null ? null : addDays(checkIn, -b.maxDays);
    const until = addDays(checkIn, -b.minDays);
    out.push({ when: t.when, refund: t.refund, from, until, passed: until < today });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Security deposit                                                    */
/* ------------------------------------------------------------------ */

/** The refundable security deposit in dollars, or null while the owner has not set it. */
export function securityDepositAmount(amount: string = policies.securityDeposit.amount): number | null {
  if (!amount || /TODO_OWNER/.test(amount)) return null;
  const m = /\$?\s*([\d,]+(?:\.\d{1,2})?)/.exec(amount);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

/** Nights between two dates, or 0. */
export const nightsOf = (checkIn: ISODate | null, checkOut: ISODate | null) => (checkIn && checkOut ? diffDays(checkIn, checkOut) : 0);

/** Percent label: 0.05 to "5%", 0.025 to "2.5%". */
export const pct = (rate: number) => `${Math.round(rate * 1000) / 10}%`;

/** The honest note shown under a quote while pricing.isPlaceholder is true. */
export const ILLUSTRATIVE_NOTE = "Rates shown are illustrative until the season is published.";

/** One line under the total: why the nightly figures differ. */
export const RATES_VARY_NOTE = "Rates vary by date, season and island events.";
