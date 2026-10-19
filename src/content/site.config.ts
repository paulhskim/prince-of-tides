/**
 * Prince of Tides: site-wide owner settings.
 *
 * OWNER: replace these before launch.
 * - contact.*: every value marked "TODO_OWNER" (host name, email, phone). responseTimeHours is a
 *   placeholder (12) that you should confirm.
 * - links.airbnbUrl / links.vrboUrl: your real listing URLs.
 * - pricing.*: ALL numbers (seasonal nightly rates, cleaning fee, discounts) are market-based starting
 *   suggestions from docs/booking-ops.md, NOT your actual rates. Set your real numbers and then change
 *   pricing.isPlaceholder to false. While isPlaceholder is true the UI must label quotes as estimates.
 * - pricing.taxes: researched Oct 2026 (combined 10%). Confirm with your accountant / SC DOR / Town of
 *   Hilton Head Island Revenue Services before collecting taxes on direct bookings. See docs/booking-ops.md.
 * - booking.*: minimum nights, max nights and policy ids are recommendations you may change.
 * - features.*: leave icalSync and stripeCheckout false until docs/booking-architecture.md phase 2/3
 *   is configured (env vars set, database provisioned).
 *
 * Values that are verified facts (do not change unless the facts change): brand, permit, capacity, times.
 *
 * Date handling: all public functions take stay dates as "YYYY-MM-DD" strings that are interpreted as
 * local calendar dates at the property. Internally we parse them manually and build Date objects at
 * 12:00 UTC so no timezone (browser or server) can shift the calendar day.
 *
 * This module has no imports on purpose, so it can be used on the server, in the browser, and in scripts.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

/** "MM-DD", e.g. "06-01". */
export type MonthDay = `${string}-${string}`;

export type Season = {
  name: string;
  /** First night of the season, inclusive, "MM-DD". */
  start: MonthDay;
  /** Last night of the season, inclusive, "MM-DD". May be earlier than start (wraps over Dec 31). */
  end: MonthDay;
  /** Nightly rate in whole currency units for Sunday to Thursday nights (or all nights if no weekendNightly). */
  nightly: number;
  /** Optional rate for Friday and Saturday nights within this season. */
  weekendNightly?: number | null;
  /** Minimum nights for a stay whose check-in night falls in this season. */
  minNights: number;
};

export type TaxLine = {
  name: string;
  /** Decimal rate, e.g. 0.05 for 5%. */
  rate: number;
  /** Government body the tax is remitted to (informational). */
  remitTo?: string;
};

export type PricingConfig = {
  currency: "USD";
  /** Fallback Sunday to Thursday rate for any night not covered by a season. */
  baseNightly: number;
  /** Fallback Friday/Saturday rate for nights not covered by a season. null = use baseNightly. */
  weekendNightly?: number | null;
  seasons: Season[];
  cleaningFee: number;
  petFee: null;
  taxes: TaxLine[];
  /** Per extra guest per night above a threshold. null = no extra guest fee. */
  extraGuestFee?: null;
  /** Applied to the lodging subtotal for stays of weeklyMinNights or more (not stacked with monthly). */
  weeklyDiscountPct: number;
  weeklyMinNights: number;
  /** Applied to the lodging subtotal for stays of monthlyMinNights or more (replaces weekly). */
  monthlyDiscountPct: number;
  monthlyMinNights: number;
  isPlaceholder: boolean;
  placeholderNote: string;
};

export type BookingMode = "request" | "instant";

export type BookingConfig = {
  mode: BookingMode;
  minNightsDefault: number;
  maxNights: number;
  bookingWindowDays: number;
  /** Check-out and check-in on the same day are allowed (10:00 out, 16:00 in). */
  sameDayTurnover: boolean;
  /** Key into policies.payment (src/content/policies.ts). */
  depositPolicy: string;
  /** Matches policies.cancellation.id (src/content/policies.ts). */
  cancellationPolicyId: string;
};

export type SiteConfig = {
  brand: { name: string; unitLabel: string };
  contact: {
    hostName: string;
    email: string;
    phone: string;
    /** Hours within which we promise to reply to a booking request. */
    responseTimeHours: number;
  };
  links: { airbnbUrl: string; vrboUrl: string };
  permit: { townStrPermit: string };
  capacity: {
    maxGuests: number;
    maxAdults: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    minAge: number;
    petsAllowed: boolean;
  };
  times: { checkIn: string; checkOut: string; timezone: string };
  pricing: PricingConfig;
  booking: BookingConfig;
  features: { icalSync: boolean; stripeCheckout: boolean; emailNotifications: boolean };
};

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

export const siteConfig: SiteConfig = {
  brand: {
    name: "Prince of Tides",
    unitLabel: "Hilton Head Resort, Building 3",
  },

  contact: {
    hostName: "TODO_OWNER",
    email: "TODO_OWNER",
    phone: "TODO_OWNER",
    responseTimeHours: 12, // TODO_OWNER: confirm
  },

  links: {
    airbnbUrl: "TODO_OWNER",
    vrboUrl: "TODO_OWNER",
  },

  permit: {
    // Town of Hilton Head Island Short-Term Rental Permit. Town rules require it on every advertisement.
    townStrPermit: "029008",
  },

  capacity: {
    maxGuests: 6,
    maxAdults: 6,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 831,
    minAge: 21,
    petsAllowed: false,
  },

  times: {
    checkIn: "16:00",
    checkOut: "10:00",
    timezone: "America/New_York",
  },

  pricing: {
    currency: "USD",
    // PLACEHOLDER: market-based starting suggestions (see docs/booking-ops.md, "Rate card").
    baseNightly: 185,
    weekendNightly: null,
    seasons: [
      { name: "Winter", start: "01-03", end: "02-29", nightly: 145, weekendNightly: null, minNights: 3 },
      { name: "Spring", start: "03-01", end: "05-21", nightly: 195, weekendNightly: 215, minNights: 3 },
      { name: "Summer", start: "05-22", end: "08-15", nightly: 265, weekendNightly: null, minNights: 5 },
      { name: "Late summer and fall", start: "08-16", end: "10-31", nightly: 195, weekendNightly: 210, minNights: 3 },
      { name: "Late fall", start: "11-01", end: "12-19", nightly: 155, weekendNightly: null, minNights: 3 },
      { name: "Holidays", start: "12-20", end: "01-02", nightly: 195, weekendNightly: null, minNights: 4 },
    ],
    cleaningFee: 185, // PLACEHOLDER
    petFee: null,
    // Researched Oct 2026, combined 10% on lodging plus cleaning fee. See docs/booking-ops.md, "Taxes".
    taxes: [
      { name: "SC sales tax on accommodations", rate: 0.05, remitTo: "SC Department of Revenue" },
      { name: "SC state accommodations tax", rate: 0.02, remitTo: "SC Department of Revenue" },
      { name: "Hilton Head Island accommodations tax", rate: 0.01, remitTo: "Town of Hilton Head Island" },
      { name: "Hilton Head Island beach preservation fee", rate: 0.02, remitTo: "Town of Hilton Head Island" },
    ],
    extraGuestFee: null,
    weeklyDiscountPct: 10, // PLACEHOLDER
    weeklyMinNights: 7,
    monthlyDiscountPct: 25, // PLACEHOLDER
    monthlyMinNights: 28,
    isPlaceholder: true,
    placeholderNote:
      "Estimated pricing based on comparable Hilton Head Resort condos. Your exact quote, including taxes, is confirmed by the host before you pay.",
  },

  booking: {
    mode: "request",
    minNightsDefault: 3,
    maxNights: 90, // stays of 90+ days fall outside SC accommodations tax and short-term rules; handle offline
    bookingWindowDays: 365,
    sameDayTurnover: true,
    depositPolicy: "split-50-50",
    cancellationPolicyId: "pot-standard-60-30",
  },

  features: {
    icalSync: false,
    stripeCheckout: false,
    emailNotifications: true,
  },
};

/* ------------------------------------------------------------------ */
/* Date helpers (no timezone drift)                                    */
/* ------------------------------------------------------------------ */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Parse "YYYY-MM-DD" into a Date at 12:00 UTC on that calendar day. Returns null if invalid. */
export function parseISODate(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d, 12, 0, 0));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d) return null;
  return date;
}

/** Format a UTC-noon Date as "YYYY-MM-DD". */
export function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Calendar parts of a Date. UTC-noon dates (from parseISODate) and local-midnight dates
 * (new Date(y, m, d)) both resolve to the intended calendar day with local getters in any
 * timezone between UTC-11 and UTC+11, so we read local parts.
 */
function calendarParts(date: Date): { month: number; day: number; weekday: number } {
  return { month: date.getMonth() + 1, day: date.getDate(), weekday: date.getDay() };
}

function mdToNumber(md: string): number {
  const [m, d] = md.split("-").map(Number);
  return m * 100 + d;
}

function seasonContains(season: Season, month: number, day: number): boolean {
  const v = month * 100 + day;
  const s = mdToNumber(season.start);
  const e = mdToNumber(season.end);
  return s <= e ? v >= s && v <= e : v >= s || v <= e; // wraps year end when start > end
}

const roundCents = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100;

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

/** Rate for the NIGHT that starts on `date`. Friday and Saturday nights use weekend rates if set. */
export function getNightlyRate(date: Date): { nightly: number; season: string; minNights: number } {
  const { pricing, booking } = siteConfig;
  const { month, day, weekday } = calendarParts(date);
  const isWeekendNight = weekday === 5 || weekday === 6;
  const season = pricing.seasons.find((s) => seasonContains(s, month, day));
  if (season) {
    const nightly = isWeekendNight && season.weekendNightly ? season.weekendNightly : season.nightly;
    return { nightly, season: season.name, minNights: season.minNights };
  }
  const nightly = isWeekendNight && pricing.weekendNightly ? pricing.weekendNightly : pricing.baseNightly;
  return { nightly, season: "Standard", minNights: booking.minNightsDefault };
}

export type QuoteTax = { name: string; rate: number; amount: number };

export type Quote = {
  nights: number;
  nightlyBreakdown: { date: string; rate: number; season: string }[];
  subtotal: number;
  discounts: number;
  /** Which discount was applied, if any. */
  discountLabel: string | null;
  cleaningFee: number;
  taxableAmount: number;
  taxes: QuoteTax[];
  taxTotal: number;
  total: number;
  minNightsRequired: number;
  meetsMinNights: boolean;
  isPlaceholder: boolean;
  /** Validation problems (empty when the stay is quotable). */
  errors: string[];
};

/**
 * Estimate a stay. checkIn / checkOut are "YYYY-MM-DD" local calendar dates; nights are
 * checkIn through the night before checkOut.
 *
 * Tax base: taxes apply to (lodging subtotal - discounts + cleaning fee). SC accommodations taxes apply to
 * the gross charge for the accommodations, and platforms (e.g. Airbnb) tax cleaning fees as part of the
 * listing price; see docs/booking-ops.md. Each tax line is rounded to cents.
 *
 * Minimum nights: the minimum of the season that contains the check-in night.
 */
export function computeQuote(checkIn: string, checkOut: string, guests: number): Quote {
  const { pricing, capacity, booking } = siteConfig;
  const errors: string[] = [];
  const start = parseISODate(checkIn);
  const end = parseISODate(checkOut);

  const empty: Quote = {
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
    minNightsRequired: booking.minNightsDefault,
    meetsMinNights: false,
    isPlaceholder: pricing.isPlaceholder,
    errors,
  };

  if (!start) errors.push("Invalid check-in date.");
  if (!end) errors.push("Invalid check-out date.");
  if (!start || !end) return empty;

  const nights = Math.round((end.getTime() - start.getTime()) / DAY_MS);
  if (nights < 1) {
    errors.push("Check-out must be after check-in.");
    return empty;
  }
  if (nights > booking.maxNights) errors.push(`Stays are limited to ${booking.maxNights} nights.`);
  if (!Number.isInteger(guests) || guests < 1) errors.push("At least one guest is required.");
  if (guests > capacity.maxGuests) errors.push(`The condo sleeps up to ${capacity.maxGuests} guests.`);

  const nightlyBreakdown: Quote["nightlyBreakdown"] = [];
  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    const night = new Date(start.getTime() + i * DAY_MS);
    // Read the calendar day from the UTC-noon date via ISO, then rebuild, to keep getNightlyRate tz-safe.
    const iso = toISODate(night);
    const [y, m, d] = iso.split("-").map(Number);
    const r = getNightlyRate(new Date(y, m - 1, d, 12));
    nightlyBreakdown.push({ date: iso, rate: r.nightly, season: r.season });
    subtotal += r.nightly;
  }
  subtotal = roundCents(subtotal);

  const [cy, cm, cd] = checkIn.split("-").map(Number);
  const minNightsRequired = getNightlyRate(new Date(cy, cm - 1, cd, 12)).minNights;
  const meetsMinNights = nights >= minNightsRequired;
  if (!meetsMinNights) errors.push(`This season has a ${minNightsRequired}-night minimum.`);

  let discountPct = 0;
  let discountLabel: string | null = null;
  if (nights >= pricing.monthlyMinNights && pricing.monthlyDiscountPct > 0) {
    discountPct = pricing.monthlyDiscountPct;
    discountLabel = `Monthly stay discount (${discountPct}%)`;
  } else if (nights >= pricing.weeklyMinNights && pricing.weeklyDiscountPct > 0) {
    discountPct = pricing.weeklyDiscountPct;
    discountLabel = `Weekly stay discount (${discountPct}%)`;
  }
  const discounts = roundCents((subtotal * discountPct) / 100);
  const cleaningFee = roundCents(pricing.cleaningFee);
  const taxableAmount = roundCents(subtotal - discounts + cleaningFee);
  const taxes: QuoteTax[] = pricing.taxes.map((t) => ({
    name: t.name,
    rate: t.rate,
    amount: roundCents(taxableAmount * t.rate),
  }));
  const taxTotal = roundCents(taxes.reduce((sum, t) => sum + t.amount, 0));
  const total = roundCents(taxableAmount + taxTotal);

  return {
    nights,
    nightlyBreakdown,
    subtotal,
    discounts,
    discountLabel,
    cleaningFee,
    taxableAmount,
    taxes,
    taxTotal,
    total,
    minNightsRequired,
    meetsMinNights,
    isPlaceholder: pricing.isPlaceholder,
    errors,
  };
}

/** Sum of all tax rates as a decimal (0.10 = 10%). */
export const combinedTaxRate = (): number =>
  Math.round(siteConfig.pricing.taxes.reduce((s, t) => s + t.rate, 0) * 10000) / 10000;
