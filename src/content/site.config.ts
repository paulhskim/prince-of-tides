/**
 * Prince of Tides: site-wide owner settings.
 *
 * OWNER: replace these before launch.
 * - contact.*: every value marked "TODO_OWNER" (host name, email, phone). responseTimeHours is a
 *   placeholder (12) that you should confirm.
 * - links.airbnbUrl / links.vrboUrl: your real listing URLs.
 * - pricing.*: ALL numbers (season weeknight and weekend rates, dated event rates, cleaning fee,
 *   discounts) are a tailored, market-based starting plan (docs/rate-plan.md), NOT your actual rates.
 *   Set your real numbers and then change pricing.isPlaceholder to false. While isPlaceholder is true
 *   the UI must label quotes as estimates. Rates are private: the site shows them only in the itemized
 *   quote on /reserve after a guest chooses dates, never as a public table.
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
  /** Nightly rate in whole currency units for Sunday to Thursday nights (weeknights). */
  nightly: number;
  /** Nightly rate for Friday and Saturday nights (weekend nights). */
  weekendNightly: number;
  /** Minimum nights for any stay that includes a night of this season (see computeQuote). */
  minNights: number;
};

/**
 * A dated rate event: a holiday or island event with its own price and stay rules. Events override the
 * season for the nights they cover. When two events overlap, the first one listed wins.
 */
export type RateEvent = {
  id: string;
  /** Shown to the guest in the itemized quote, e.g. "RBC Heritage week". */
  name: string;
  /** First night, inclusive, "YYYY-MM-DD". */
  first: string;
  /** Last night, inclusive, "YYYY-MM-DD" (the morning after is the natural check-out). */
  last: string;
  /** Nightly rate for weeknights (and weekends when weekendNightly is not set). */
  nightly: number;
  /** Optional Friday and Saturday rate during the event. */
  weekendNightly?: number | null;
  /** Minimum nights for any stay that includes a night of this event. */
  minNights: number;
  /** When set, a stay that ARRIVES during the event must arrive on one of these weekdays (0 Sun to 6 Sat). */
  arrivalWeekdays?: number[] | null;
  /** Where the date comes from (verified source). */
  source: string;
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
  /** Fallback Friday/Saturday rate for nights not covered by a season. */
  weekendNightly: number;
  seasons: Season[];
  /** Dated holidays and island events, 2026-10 through 2027-12 (the 365-day booking window plus stays). */
  events: RateEvent[];
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
    // PLACEHOLDER: a tailored rate plan for the owner to confirm. Rationale, comparables and the full
    // month-by-month calendar are in docs/rate-plan.md. Weeknights are Sunday to Thursday nights,
    // weekend nights are Friday and Saturday nights. Rates are never shown as a public table: the
    // guest sees them only in the itemized quote on /reserve after choosing dates.
    baseNightly: 185, // fallback only; the seasons below cover every night of the year
    weekendNightly: 205,
    seasons: [
      { name: "Winter", start: "01-03", end: "02-14", nightly: 135, weekendNightly: 155, minNights: 3 },
      { name: "Early spring", start: "02-15", end: "03-07", nightly: 150, weekendNightly: 175, minNights: 3 },
      { name: "Spring", start: "03-08", end: "05-21", nightly: 190, weekendNightly: 225, minNights: 3 },
      { name: "Early summer", start: "05-22", end: "06-11", nightly: 225, weekendNightly: 255, minNights: 4 },
      { name: "High summer", start: "06-12", end: "08-08", nightly: 255, weekendNightly: 285, minNights: 5 },
      { name: "Late summer", start: "08-09", end: "09-30", nightly: 185, weekendNightly: 215, minNights: 3 },
      { name: "Fall", start: "10-01", end: "10-31", nightly: 175, weekendNightly: 205, minNights: 3 },
      { name: "Late fall", start: "11-01", end: "12-19", nightly: 140, weekendNightly: 160, minNights: 3 },
      { name: "Holidays", start: "12-20", end: "01-02", nightly: 165, weekendNightly: 185, minNights: 3 },
    ],
    // Dated events. Every date is verified (sources in docs/rate-plan.md); events whose dates are not
    // published yet (e.g. the 2027 Concours d'Elegance, the 2028 RBC Heritage) are left out on purpose.
    // Order matters: the first event that covers a night prices it (Easter before spring break).
    events: [
      {
        id: "concours-2026",
        name: "Concours d'Elegance weekend",
        first: "2026-10-29",
        last: "2026-10-31",
        nightly: 215,
        weekendNightly: 235,
        minNights: 3,
        source: "hiltonheadisland.org event listing: Hilton Head Island Concours d'Elegance and Motoring Festival, Oct 29 to Nov 1, 2026",
      },
      {
        id: "thanksgiving-2026",
        name: "Thanksgiving week",
        first: "2026-11-21",
        last: "2026-11-28",
        nightly: 185,
        weekendNightly: 195,
        minNights: 4,
        source: "Thanksgiving Day, Thursday Nov 26, 2026 (fourth Thursday of November)",
      },
      {
        id: "christmas-2026",
        name: "Christmas",
        first: "2026-12-23",
        last: "2026-12-27",
        nightly: 215,
        minNights: 4,
        source: "Christmas Day, Dec 25",
      },
      {
        id: "new-year-2027",
        name: "New Year's",
        first: "2026-12-29",
        last: "2027-01-01",
        nightly: 225,
        minNights: 3,
        source: "New Year's Day, Jan 1",
      },
      {
        id: "presidents-2027",
        name: "Presidents' Day weekend",
        first: "2027-02-12",
        last: "2027-02-14",
        nightly: 185,
        minNights: 3,
        source: "calendardate.com 2027 holidays: Presidents' Day, Monday Feb 15, 2027",
      },
      {
        id: "seafood-2027",
        name: "Hilton Head Island Seafood Festival",
        first: "2027-02-25",
        last: "2027-02-27",
        nightly: 175,
        weekendNightly: 195,
        minNights: 3,
        source: "The Local Palate event listing: Hilton Head Seafood Festival, Feb 22 to 28, 2027",
      },
      {
        id: "easter-2027",
        name: "Easter weekend",
        first: "2027-03-25",
        last: "2027-03-27",
        nightly: 265,
        minNights: 3,
        source: "calendardate.com 2027 holidays: Easter Sunday, Mar 28, 2027",
      },
      {
        id: "spring-break-2027",
        name: "Spring break weeks",
        first: "2027-03-13",
        last: "2027-04-09",
        nightly: 230,
        weekendNightly: 255,
        minNights: 4,
        source: "Demand window, Saturday Mar 13 to Saturday Apr 10, 2027, around Easter; WTOC (Mar 2025): spring break travel leads into peak season",
      },
      {
        id: "rbc-heritage-2027",
        name: "RBC Heritage week",
        first: "2027-04-10",
        last: "2027-04-17",
        nightly: 325,
        weekendNightly: 345,
        minNights: 5,
        arrivalWeekdays: [6, 0],
        source: "pgatour.com and Golf Channel 2027 schedule: RBC Heritage, Harbour Town Golf Links, Apr 15 to 18, 2027",
      },
      {
        id: "memorial-2027",
        name: "Memorial Day weekend",
        first: "2027-05-28",
        last: "2027-05-30",
        nightly: 265,
        minNights: 3,
        source: "calendardate.com 2027 holidays: Memorial Day, Monday May 31, 2027",
      },
      {
        id: "july-4-2027",
        name: "Fourth of July week",
        first: "2027-07-01",
        last: "2027-07-07",
        nightly: 315,
        weekendNightly: 335,
        minNights: 5,
        source: "calendardate.com 2027 holidays: Independence Day, Sunday Jul 4, 2027",
      },
      {
        id: "labor-day-2027",
        name: "Labor Day weekend",
        first: "2027-09-03",
        last: "2027-09-05",
        nightly: 235,
        minNights: 3,
        source: "calendardate.com 2027 holidays: Labor Day, Monday Sep 6, 2027",
      },
      {
        id: "thanksgiving-2027",
        name: "Thanksgiving week",
        first: "2027-11-20",
        last: "2027-11-27",
        nightly: 185,
        weekendNightly: 195,
        minNights: 4,
        source: "calendardate.com 2027 holidays: Thanksgiving Day, Thursday Nov 25, 2027",
      },
      {
        id: "christmas-2027",
        name: "Christmas",
        first: "2027-12-23",
        last: "2027-12-27",
        nightly: 215,
        minNights: 4,
        source: "Christmas Day, Dec 25",
      },
      {
        id: "new-year-2028",
        name: "New Year's",
        first: "2027-12-29",
        last: "2028-01-01",
        nightly: 225,
        minNights: 3,
        source: "New Year's Day, Jan 1",
      },
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
function calendarParts(date: Date): { year: number; month: number; day: number; weekday: number } {
  return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate(), weekday: date.getDay() };
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

export type NightKind = "event" | "weekend" | "weeknight";

/** Everything the plan says about one night. */
export type NightRate = {
  nightly: number;
  /** The base season the night falls in (also for event nights). */
  season: string;
  /** Minimum stay for any stay that includes this night. */
  minNights: number;
  /** Why the night costs what it does: the event name, or "Late fall weeknight" / "Late fall weekend". */
  label: string;
  kind: NightKind;
  /** The event pricing this night, or null. */
  event: string | null;
  /** Weekdays (0 Sun to 6 Sat) a stay arriving on this night may arrive on, or null for any day. */
  arrivalWeekdays: number[] | null;
};

const WEEKDAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** "Saturday or Sunday" for an arrival rule. */
export function weekdayList(days: number[]): string {
  const names = days.map((d) => WEEKDAY_NAMES[d]);
  return names.length <= 1 ? (names[0] ?? "") : `${names.slice(0, -1).join(", ")} or ${names[names.length - 1]}`;
}

/**
 * Rate for the NIGHT that starts on `date`. Order of precedence: a dated event covering the night, then
 * the season (weeknight or weekend rate), then the fallback rate. Friday and Saturday are weekend nights.
 */
export function getNightlyRate(date: Date): NightRate {
  const { pricing, booking } = siteConfig;
  const { year, month, day, weekday } = calendarParts(date);
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const isWeekendNight = weekday === 5 || weekday === 6;
  const season = pricing.seasons.find((s) => seasonContains(s, month, day));
  const seasonName = season ? season.name : "Standard";

  const event = pricing.events.find((e) => iso >= e.first && iso <= e.last);
  if (event) {
    const nightly = isWeekendNight && event.weekendNightly ? event.weekendNightly : event.nightly;
    return {
      nightly,
      season: seasonName,
      minNights: event.minNights,
      label: event.name,
      kind: "event",
      event: event.name,
      arrivalWeekdays: event.arrivalWeekdays && event.arrivalWeekdays.length ? event.arrivalWeekdays : null,
    };
  }

  const kind: NightKind = isWeekendNight ? "weekend" : "weeknight";
  const nightly = season
    ? isWeekendNight
      ? season.weekendNightly
      : season.nightly
    : isWeekendNight
      ? pricing.weekendNightly
      : pricing.baseNightly;
  return {
    nightly,
    season: seasonName,
    minNights: season ? season.minNights : booking.minNightsDefault,
    label: `${seasonName} ${kind}`,
    kind,
    event: null,
    arrivalWeekdays: null,
  };
}

/** getNightlyRate for a "YYYY-MM-DD" night, built at local noon so no timezone can shift the day. */
export function rateForISO(iso: string): NightRate {
  const [y, m, d] = iso.split("-").map(Number);
  return getNightlyRate(new Date(y, m - 1, d, 12));
}

export type StayRules = {
  /** The largest minimum of any night in the stay. */
  minNights: number;
  /** What sets that minimum: an event name, or a season name. */
  minNightsReason: string;
  /** True when the reason is an event rather than a season. */
  minNightsFromEvent: boolean;
  /** Arrival-day rule of the check-in night, or null. */
  arrivalRule: { event: string; weekdays: number[] } | null;
  meetsArrivalDay: boolean;
};

/**
 * Stay rules for checkIn to checkOut ("YYYY-MM-DD"): the minimum is the maximum requirement of any night
 * in the stay, and a stay arriving during an event with fixed arrival days must arrive on one of them.
 * With checkOut null (or not after checkIn) only the check-in night is considered.
 */
export function stayRules(checkIn: string, checkOut: string | null): StayRules {
  const start = parseISODate(checkIn);
  const end = checkOut ? parseISODate(checkOut) : null;
  const first = start ? rateForISO(checkIn) : null;
  let minNights = first ? first.minNights : siteConfig.booking.minNightsDefault;
  let reason = first ? (first.event ?? first.season) : "Standard";
  let fromEvent = Boolean(first?.event);
  if (start && end) {
    const nights = Math.round((end.getTime() - start.getTime()) / DAY_MS);
    for (let i = 1; i < nights; i++) {
      const r = rateForISO(toISODate(new Date(start.getTime() + i * DAY_MS)));
      if (r.minNights > minNights) {
        minNights = r.minNights;
        reason = r.event ?? r.season;
        fromEvent = Boolean(r.event);
      }
    }
  }
  const arrivalRule = first?.arrivalWeekdays && first.event ? { event: first.event, weekdays: first.arrivalWeekdays } : null;
  const meetsArrivalDay = !arrivalRule || (start !== null && arrivalRule.weekdays.includes(start.getUTCDay()));
  return { minNights, minNightsReason: reason, minNightsFromEvent: fromEvent, arrivalRule, meetsArrivalDay };
}

/** Guest-facing sentence for a minimum-stay shortfall. */
export function minNightsMessageFor(r: Pick<StayRules, "minNights" | "minNightsReason" | "minNightsFromEvent">): string {
  return r.minNightsFromEvent
    ? `Stays that include ${r.minNightsReason} have a ${r.minNights}-night minimum.`
    : `This season has a ${r.minNights}-night minimum.`;
}

/** Guest-facing sentence for an arrival-day rule. */
export function arrivalMessageFor(rule: { event: string; weekdays: number[] }): string {
  return `Arrivals during ${rule.event} are on ${weekdayList(rule.weekdays)}.`;
}

export type QuoteTax = { name: string; rate: number; amount: number };

export type QuoteNight = {
  date: string;
  rate: number;
  season: string;
  /** Event name, or season plus "weeknight" / "weekend". */
  label: string;
  kind: NightKind;
};

export type Quote = {
  nights: number;
  nightlyBreakdown: QuoteNight[];
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
  /** What sets minNightsRequired (event or season name). */
  minNightsReason: string;
  meetsMinNights: boolean;
  /** False when the stay arrives during an event on a day that event does not accept arrivals. */
  meetsArrivalDay: boolean;
  /** Guest-facing explanation when meetsArrivalDay is false. */
  arrivalRule: string | null;
  isPlaceholder: boolean;
  /** Validation problems (empty when the stay is quotable). */
  errors: string[];
};

/**
 * Estimate a stay. checkIn / checkOut are "YYYY-MM-DD" local calendar dates; nights are
 * checkIn through the night before checkOut. Each night is priced by getNightlyRate (event, then
 * season weeknight or weekend rate).
 *
 * Tax base: taxes apply to (lodging subtotal - discounts + cleaning fee). SC accommodations taxes apply to
 * the gross charge for the accommodations, and platforms (e.g. Airbnb) tax cleaning fees as part of the
 * listing price; see docs/booking-ops.md. Each tax line is rounded to cents.
 *
 * Minimum nights: the largest minimum of any night in the stay (a stay touching RBC Heritage week needs
 * that week's minimum). Arrival days: a stay arriving during an event with fixed arrival days must
 * arrive on one of them.
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
    minNightsReason: "Standard",
    meetsMinNights: false,
    meetsArrivalDay: true,
    arrivalRule: null,
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

  const nightlyBreakdown: QuoteNight[] = [];
  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    // Read the calendar day from the UTC-noon date via ISO, then rebuild at local noon (tz-safe).
    const iso = toISODate(new Date(start.getTime() + i * DAY_MS));
    const r = rateForISO(iso);
    nightlyBreakdown.push({ date: iso, rate: r.nightly, season: r.season, label: r.label, kind: r.kind });
    subtotal += r.nightly;
  }
  subtotal = roundCents(subtotal);

  const rules = stayRules(checkIn, checkOut);
  const minNightsRequired = rules.minNights;
  const meetsMinNights = nights >= minNightsRequired;
  if (!meetsMinNights) errors.push(minNightsMessageFor(rules));
  const arrivalRule = rules.meetsArrivalDay || !rules.arrivalRule ? null : arrivalMessageFor(rules.arrivalRule);
  if (arrivalRule) errors.push(arrivalRule);

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
    minNightsReason: rules.minNightsReason,
    meetsMinNights,
    meetsArrivalDay: rules.meetsArrivalDay,
    arrivalRule,
    isPlaceholder: pricing.isPlaceholder,
    errors,
  };
}

/** Sum of all tax rates as a decimal (0.10 = 10%). */
export const combinedTaxRate = (): number =>
  Math.round(siteConfig.pricing.taxes.reduce((s, t) => s + t.rate, 0) * 10000) / 10000;
