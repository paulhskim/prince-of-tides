/**
 * Pure helpers for the /reserve page (client and server safe, unit tested in tests/booking/reserve.test.ts).
 *
 * Nothing here prices a stay: every figure comes from computeQuote / getNightlyRate in
 * src/content/site.config.ts. These helpers only group, date and describe what that quote and the
 * policies in src/content/policies.ts already say.
 */
import { getNightlyRate, siteConfig, type Quote, type Season } from "@/content/site.config";
import { policies } from "@/content/policies";
import { addDays, daysInMonth, diffDays, type ISODate } from "./dates";

const roundCents = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/* ------------------------------------------------------------------ */
/* Nightly rates                                                       */
/* ------------------------------------------------------------------ */

/** Rate for the night that starts on `iso` (same call computeQuote makes). */
export function rateForNight(iso: ISODate): { nightly: number; season: string; minNights: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return getNightlyRate(new Date(y, m - 1, d, 12));
}

export type NightGroup = { season: string; rate: number; nights: number; amount: number; first: ISODate; last: ISODate };

/**
 * Nights grouped like a hotel folio: consecutive runs are not required, nights are grouped by season and
 * rate in order of first appearance ("Spring, 3 nights at $195", "Spring, 2 nights at $215").
 */
export function groupNightsBySeasonRate(q: Pick<Quote, "nightlyBreakdown">): NightGroup[] {
  const groups: NightGroup[] = [];
  for (const n of q.nightlyBreakdown) {
    const g = groups.find((x) => x.season === n.season && x.rate === n.rate);
    if (g) {
      g.nights++;
      g.amount = roundCents(g.amount + n.rate);
      g.last = n.date;
    } else {
      groups.push({ season: n.season, rate: n.rate, nights: 1, amount: n.rate, first: n.date, last: n.date });
    }
  }
  return groups;
}

/** Averages for the folio footer. `allIn` includes cleaning and taxes; `lodging` is after any discount. */
export function averagePerNight(q: Pick<Quote, "nights" | "subtotal" | "discounts" | "total">): { lodging: number; allIn: number } {
  if (!q.nights) return { lodging: 0, allIn: 0 };
  return { lodging: roundCents((q.subtotal - q.discounts) / q.nights), allIn: roundCents(q.total / q.nights) };
}

/* ------------------------------------------------------------------ */
/* Seasons                                                             */
/* ------------------------------------------------------------------ */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "06-01" to "Jun 1". */
export function formatMonthDay(md: string): string {
  const [m, d] = md.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

export type SeasonRow = {
  name: string;
  dates: string;
  /** Lowest nightly rate in the season. */
  from: number;
  /** Friday and Saturday rate when it differs. */
  weekend: number | null;
  weeknight: number;
  minNights: number;
};

/** The seasonal rate table, straight from siteConfig.pricing.seasons (config order). */
export function seasonRows(seasons: Season[] = siteConfig.pricing.seasons): SeasonRow[] {
  return seasons.map((s) => {
    const weekend = s.weekendNightly && s.weekendNightly !== s.nightly ? s.weekendNightly : null;
    return {
      name: s.name,
      dates: `${formatMonthDay(s.start)} to ${formatMonthDay(s.end)}`,
      from: weekend === null ? s.nightly : Math.min(s.nightly, weekend),
      weekend,
      weeknight: s.nightly,
      minNights: s.minNights,
    };
  });
}

export type SeasonSpan = { season: string; from: ISODate; to: ISODate };

/** Seasons that cover the nights of a month, as consecutive spans (for labels under the month heading). */
export function seasonSpansInMonth(monthIso: ISODate): SeasonSpan[] {
  const first = `${monthIso.slice(0, 7)}-01`;
  const spans: SeasonSpan[] = [];
  for (let i = 0; i < daysInMonth(first); i++) {
    const iso = addDays(first, i);
    const season = rateForNight(iso).season;
    const last = spans[spans.length - 1];
    if (last && last.season === season) last.to = iso;
    else spans.push({ season, from: iso, to: iso });
  }
  return spans;
}

/** True when the night of `iso` belongs to a different season than the night before. */
export function isSeasonStart(iso: ISODate): boolean {
  return rateForNight(iso).season !== rateForNight(addDays(iso, -1)).season;
}

/** Lowest nightly rate across the config (for "from $X a night"). */
export function lowestNightly(): number {
  const { pricing } = siteConfig;
  const all = [pricing.baseNightly, ...pricing.seasons.flatMap((s) => [s.nightly, s.weekendNightly ?? s.nightly])];
  return Math.min(...all);
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

/** The honest note shown wherever rates appear while pricing.isPlaceholder is true. */
export const ILLUSTRATIVE_NOTE = "Rates shown are illustrative until the season is published.";
