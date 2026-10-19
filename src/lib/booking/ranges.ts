/**
 * Client-safe range logic. A blocked range is the half-open [start, end): `start` is the first blocked
 * night, `end` is the checkout day (exclusive), exactly like iCal all-day DTEND. A new stay may check in
 * on a range's `end` and may check out on a range's `start` (same-day turnover).
 */
import { addDays, diffDays, type ISODate } from "./dates";

export type BlockSource = "manual" | "airbnb" | "vrbo" | "direct" | "hold";

export type BlockedRange = { start: ISODate; end: ISODate; source?: BlockSource; note?: string };

/** Sort and coalesce overlapping or touching ranges. Drops empty or inverted ranges. */
export function mergeRanges(ranges: BlockedRange[]): { start: ISODate; end: ISODate }[] {
  const valid = ranges
    .filter((r) => r.start && r.end && diffDays(r.start, r.end) > 0)
    .map((r) => ({ start: r.start, end: r.end }))
    .sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  const out: { start: ISODate; end: ISODate }[] = [];
  for (const r of valid) {
    const last = out[out.length - 1];
    if (last && r.start <= last.end) {
      if (r.end > last.end) last.end = r.end;
    } else {
      out.push({ ...r });
    }
  }
  return out;
}

/** Every blocked night inside [from, to). */
export function blockedNightsBetween(ranges: BlockedRange[], from: ISODate, to: ISODate): ISODate[] {
  const nights: ISODate[] = [];
  for (const r of mergeRanges(ranges)) {
    let d = r.start < from ? from : r.start;
    const stop = r.end > to ? to : r.end;
    while (d < stop) {
      nights.push(d);
      d = addDays(d, 1);
    }
  }
  return nights;
}

/** True when no night of [checkIn, checkOut) is blocked. Touching ranges (turnover) are allowed. */
export function isRangeFree(ranges: BlockedRange[], checkIn: ISODate, checkOut: ISODate): boolean {
  return !ranges.some((r) => r.start < checkOut && checkIn < r.end);
}

/** Night-set version, used by the calendar. */
export function isRangeFreeInSet(blocked: ReadonlySet<ISODate>, checkIn: ISODate, checkOut: ISODate): boolean {
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) if (blocked.has(d)) return false;
  return true;
}
