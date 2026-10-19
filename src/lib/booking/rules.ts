/**
 * Stay rules shared by the calendar (client) and the API (server): booking window, minimum and maximum
 * nights, availability. Pricing itself always comes from computeQuote / getNightlyRate in
 * src/content/site.config.ts (the single source of truth).
 */
import { computeQuote, getNightlyRate, siteConfig, type Quote } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import { addDays, diffDays, type ISODate } from "./dates";
import { isRangeFree, type BlockedRange } from "./ranges";

/** Minimum nights for a stay arriving on `checkIn` (season of the check-in night). */
export function minNightsFor(checkIn: ISODate): number {
  const [y, m, d] = checkIn.split("-").map(Number);
  return getNightlyRate(new Date(y, m - 1, d, 12)).minNights;
}

export function lastBookableDate(today: ISODate): ISODate {
  return addDays(today, siteConfig.booking.bookingWindowDays);
}

export type StayProblem =
  | { code: "past"; message: string }
  | { code: "window"; message: string }
  | { code: "min_nights"; message: string; minNights: number }
  | { code: "max_nights"; message: string }
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
      message: bookingCopy.minNightsMessage.replace("{{minNights}}", String(quote.minNightsRequired)),
    });
  }
  if (!isRangeFree(blocked, checkIn, checkOut)) {
    problems.push({ code: "unavailable", message: bookingCopy.unavailableDatesMessage });
  }
  // Remaining computeQuote errors (invalid dates, guest count) that the checks above do not cover.
  for (const e of quote.errors) {
    if (/minimum|limited to/.test(e)) continue;
    problems.push({ code: "quote", message: e });
  }
  return { quote, problems };
}
