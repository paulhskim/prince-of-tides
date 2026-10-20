/**
 * Pure date-picker logic (client-safe, unit tested). Decides what each day means for the current
 * selection: arrival allowed, departure allowed, departure-only (turnover), below the minimum, etc.
 */
import { siteConfig } from "@/content/site.config";
import { addDays, diffDays, formatLong, formatShort, type ISODate } from "./dates";
import { isRangeFreeInSet } from "./ranges";
import { arrivalProblem, earliestDeparture, lastBookableDate, minNightsFor, minNightsForStay } from "./rules";

export type Selection = { checkIn: ISODate | null; checkOut: ISODate | null };

export type DayKind =
  | "past"
  | "blocked"
  | "departure-only"
  | "beyond"
  | "gap-too-short"
  | "arrival-day"
  | "below-min"
  | "past-next-block"
  | "available"
  | "arrival"
  | "departure"
  | "in-range";

export type DayInfo = {
  iso: ISODate;
  kind: DayKind;
  /** Can be clicked / activated with Enter for the current phase. */
  selectable: boolean;
  /** Strike-through (unavailable nights). */
  struck: boolean;
  isToday: boolean;
  selected: boolean;
  label: string;
};

export type CalendarContext = {
  today: ISODate;
  blocked: ReadonlySet<ISODate>;
  selection: Selection;
};

/** Consecutive unblocked nights starting at `iso`, counted up to `cap`. */
function freeRun(iso: ISODate, blocked: ReadonlySet<ISODate>, cap: number): number {
  let n = 0;
  for (let d = iso; n < cap && !blocked.has(d); d = addDays(d, 1)) n++;
  return n;
}

export function canArriveOn(iso: ISODate, ctx: Omit<CalendarContext, "selection">): DayKind | true {
  if (iso < ctx.today) return "past";
  if (ctx.blocked.has(iso)) {
    const prev = addDays(iso, -1);
    return prev >= ctx.today && !ctx.blocked.has(prev) ? "departure-only" : "blocked";
  }
  if (iso > lastBookableDate(ctx.today)) return "beyond";
  if (arrivalProblem(iso)) return "arrival-day";
  const min = minNightsFor(iso);
  if (freeRun(iso, ctx.blocked, min) < min) return "gap-too-short";
  return true;
}

export function canDepartOn(iso: ISODate, checkIn: ISODate, blocked: ReadonlySet<ISODate>): DayKind | true {
  if (iso <= checkIn) return "available";
  if (!isRangeFreeInSet(blocked, checkIn, iso)) return "past-next-block";
  const nights = diffDays(checkIn, iso);
  if (nights < minNightsForStay(checkIn, iso)) return "below-min";
  if (nights > siteConfig.booking.maxNights) return "beyond";
  return true;
}

export function dayInfo(iso: ISODate, ctx: CalendarContext): DayInfo {
  const { checkIn, checkOut } = ctx.selection;
  const isToday = iso === ctx.today;
  const arrive = canArriveOn(iso, ctx);
  const choosingDeparture = Boolean(checkIn && !checkOut);

  let kind: DayKind;
  let selectable: boolean;

  if (checkIn && iso === checkIn) {
    kind = "arrival";
    selectable = true;
  } else if (checkOut && iso === checkOut) {
    kind = "departure";
    selectable = arrive === true;
  } else if (checkIn && checkOut && iso > checkIn && iso < checkOut) {
    kind = "in-range";
    selectable = arrive === true;
  } else if (choosingDeparture && iso > checkIn!) {
    const depart = canDepartOn(iso, checkIn!, ctx.blocked);
    if (depart === true) {
      kind = ctx.blocked.has(iso) ? "departure-only" : "available";
      selectable = true;
    } else {
      kind = depart === "past-next-block" ? (arrive === true ? "past-next-block" : (arrive as DayKind)) : depart;
      selectable = false;
    }
  } else {
    kind = arrive === true ? "available" : arrive;
    selectable = arrive === true;
  }

  const struck = kind === "past" || kind === "blocked" || (kind === "past-next-block" && ctx.blocked.has(iso));
  const selected = kind === "arrival" || kind === "departure" || kind === "in-range";
  return { iso, kind, selectable, struck, isToday, selected, label: dayLabel(iso, kind, isToday, checkIn) };
}

function dayLabel(iso: ISODate, kind: DayKind, isToday: boolean, checkIn: ISODate | null): string {
  const base = `${isToday ? "Today, " : ""}${formatLong(iso)}`;
  const min = checkIn && iso > checkIn ? minNightsForStay(checkIn, iso) : minNightsFor(iso);
  const arrivalRule = kind === "arrival-day" ? arrivalProblem(iso) : null;
  const suffix: Record<DayKind, string> = {
    past: "unavailable",
    blocked: "unavailable",
    "departure-only": "available for departure only",
    beyond: "unavailable, outside the booking window",
    "gap-too-short": `unavailable for arrival, the open dates are shorter than the ${min}-night minimum`,
    "arrival-day": `unavailable for arrival. ${arrivalRule ?? ""}`.trim(),
    "below-min": `below the ${min}-night minimum`,
    "past-next-block": "unavailable, the stay would cross reserved nights",
    available: "available",
    arrival: "arrival date selected",
    departure: "departure date selected",
    "in-range": "in your stay",
  };
  return `${base}, ${suffix[kind]}`;
}

/** Apply a click / Enter on a day. Returns the next selection, or null when the day is not selectable. */
export function selectDay(iso: ISODate, ctx: CalendarContext): Selection | null {
  const { checkIn, checkOut } = ctx.selection;
  if (checkIn && !checkOut) {
    if (iso === checkIn) return { checkIn: null, checkOut: null };
    if (iso > checkIn) {
      return canDepartOn(iso, checkIn, ctx.blocked) === true ? { checkIn, checkOut: iso } : null;
    }
    // Earlier than arrival: resets arrival.
    return canArriveOn(iso, ctx) === true ? { checkIn: iso, checkOut: null } : null;
  }
  return canArriveOn(iso, ctx) === true ? { checkIn: iso, checkOut: null } : null;
}

/** Live hint under the grid (design-system 8.8). */
export function selectionHint(sel: Selection): { text: string; tone: "plain" | "warning" } {
  if (!sel.checkIn) return { text: "Choose an arrival date.", tone: "plain" };
  if (!sel.checkOut) {
    const e = earliestDeparture(sel.checkIn);
    return {
      text: `Choose a departure date. ${e.minNights}-night minimum${e.fromEvent ? ` for ${e.reason}` : ""}: depart on or after ${formatShort(e.date)}.`,
      tone: "warning",
    };
  }
  const n = diffDays(sel.checkIn, sel.checkOut);
  return { text: `${n} ${n === 1 ? "night" : "nights"}, ${formatShort(sel.checkIn)} to ${formatShort(sel.checkOut)}.`, tone: "plain" };
}

/** Weeks (Sunday first) covering a month; days outside the month are null. */
export function monthMatrix(monthIso: ISODate): (ISODate | null)[][] {
  const [y, m] = monthIso.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1, 12));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = first.getUTCDay();
  const cells: (ISODate | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= days; d++) cells.push(`${monthIso.slice(0, 8)}${String(d).padStart(2, "0")}`);
  while (cells.length % 7) cells.push(null);
  const weeks: (ISODate | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}
