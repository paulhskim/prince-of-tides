/**
 * Stay rules shared by the calendar (client) and the API (server): booking window, minimum and maximum
 * nights, arrival days, availability. Pricing itself always comes from computeQuote / getNightlyRate in
 * src/content/site.config.ts (the single source of truth).
 */
import { arrivalMessageFor, computeQuote, minNightsMessageFor, rateForISO, siteConfig, stayRules, type Quote } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import { addDays, diffDays, type ISODate } from "./dates";
import { isRangeFree, type BlockedRange } from "./ranges";

/** Minimum nights of the check-in night itself (a lower bound for any stay arriving on `checkIn`). */
export function minNightsFor(checkIn: ISODate): number {
  return rateForISO(checkIn).minNights;
}

/** Minimum nights for the stay checkIn to checkOut: the largest minimum of any night in it. */
export function minNightsForStay(checkIn: ISODate, checkOut: ISODate): number {
  return stayRules(checkIn, checkOut).minNights;
}

/** Arrival-day rule for arriving on `iso`: null when any weekday is fine or `iso` is one of the allowed days. */
export function arrivalProblem(iso: ISODate): string | null {
  const r = stayRules(iso, null);
  return r.meetsArrivalDay || !r.arrivalRule ? null : arrivalMessageFor(r.arrivalRule);
}

/**
 * The first departure that meets the minimum for a stay arriving on `checkIn` (the minimum can grow as
 * the stay reaches into an event week), with the minimum that applies and why.
 */
export function earliestDeparture(checkIn: ISODate): { date: ISODate; minNights: number; reason: string; fromEvent: boolean } {
  for (let n = 1; n <= siteConfig.booking.maxNights; n++) {
    const d = addDays(checkIn, n);
    const r = stayRules(checkIn, d);
    if (n >= r.minNights) return { date: d, minNights: r.minNights, reason: r.minNightsReason, fromEvent: r.minNightsFromEvent };
  }
  const r = stayRules(checkIn, null);
  return { date: addDays(checkIn, r.minNights), minNights: r.minNights, reason: r.minNightsReason, fromEvent: r.minNightsFromEvent };
}

/** Guest-facing minimum-stay sentence for a stay (names the event when an event sets it). */
export function minNightsMessage(checkIn: ISODate, checkOut: ISODate): string {
  const r = stayRules(checkIn, checkOut);
  return r.minNightsFromEvent ? minNightsMessageFor(r) : bookingCopy.minNightsMessage.replace("{{minNights}}", String(r.minNights));
}

export function lastBookableDate(today: ISODate): ISODate {
  return addDays(today, siteConfig.booking.bookingWindowDays);
}

export type StayProblem =
  | { code: "past"; message: string }
  | { code: "window"; message: string }
  | { code: "min_nights"; message: string; minNights: number }
  | { code: "max_nights"; message: string }
  | { code: "arrival_day"; message: string }
  | { code: "unavailable"; message: string }
  | { code: "quote"; message: string };

/**
 * Validate a stay against every rule. `blocked` is the merged availability (manual, iCal, direct).
 * Returns the server-computed quote plus problems. An empty list means the stay can be requested.
 */
export function checkStay(params: {
  checkIn: ISODate;
  checkOut: ISODate;
  guests: number;
  today: ISODate;
  blocked: BlockedRange[];
}): { quote: Quote; problems: StayProblem[] } {
  const { checkIn, checkOut, guests, today, blocked } = params;
  const problems: StayProblem[] = [];
  const quote = computeQuote(checkIn, checkOut, guests);

  if (checkIn < today) problems.push({ code: "past", message: bookingCopy.validation.pastDate });
  if (checkIn > lastBookableDate(today)) {
    problems.push({
      code: "window",
      message: `Requests open ${siteConfig.booking.bookingWindowDays} days ahead. Please choose earlier dates.`,
    });
  }
  const nights = diffDays(checkIn, checkOut);
  if (nights > siteConfig.booking.maxNights) {
    problems.push({ code: "max_nights", message: `Stays are limited to ${siteConfig.booking.maxNights} nights.` });
  }
  if (!quote.meetsMinNights && nights > 0) {
    problems.push({
      code: "min_nights",
      minNights: quote.minNightsRequired,
      message: minNightsMessage(checkIn, checkOut),
    });
  }
  if (quote.arrivalRule && nights > 0) problems.push({ code: "arrival_day", message: quote.arrivalRule });
  if (!isRangeFree(blocked, checkIn, checkOut)) {
    problems.push({ code: "unavailable", message: bookingCopy.unavailableDatesMessage });
  }
  // Remaining computeQuote errors (invalid dates, guest count) that the checks above do not cover.
  for (const e of quote.errors) {
    if (/minimum|limited to|^Arrivals during/.test(e)) continue;
    problems.push({ code: "quote", message: e });
  }
  return { quote, problems };
}
