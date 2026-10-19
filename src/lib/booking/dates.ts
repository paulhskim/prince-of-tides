/**
 * Client-safe date helpers for the booking engine.
 *
 * Every date is a "YYYY-MM-DD" string (a calendar day at the property). Arithmetic goes through
 * UTC-noon Date objects (parseISODate / toISODate from site.config) so no browser or server timezone
 * can shift a day. A stay is the half-open range [checkIn, checkOut): the nights are checkIn up to the
 * night before checkOut, which makes same-day turnover natural.
 */
import { parseISODate, siteConfig, toISODate } from "@/content/site.config";

export type ISODate = string;

const DAY_MS = 24 * 60 * 60 * 1000;

export const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isISODate(value: unknown): value is ISODate {
  return typeof value === "string" && ISO_DATE_RE.test(value) && parseISODate(value) !== null;
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso);
  if (!d) throw new Error(`Invalid date: ${iso}`);
  return toISODate(new Date(d.getTime() + days * DAY_MS));
}

/** Whole days from a to b (b - a). */
export function diffDays(a: ISODate, b: ISODate): number {
  const da = parseISODate(a);
  const db = parseISODate(b);
  if (!da || !db) return NaN;
  return Math.round((db.getTime() - da.getTime()) / DAY_MS);
}

/** Nights of a stay: checkIn up to (not including) checkOut. */
export function eachNight(checkIn: ISODate, checkOut: ISODate): ISODate[] {
  const n = diffDays(checkIn, checkOut);
  const out: ISODate[] = [];
  for (let i = 0; i < n; i++) out.push(addDays(checkIn, i));
  return out;
}

/** Today's calendar date in a given IANA timezone (defaults to the property's). */
export function todayISO(timeZone: string = siteConfig.times.timezone, now: Date = new Date()): ISODate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Calendar date of an instant in a given timezone. */
export function instantToISO(instant: Date, timeZone: string = siteConfig.times.timezone): ISODate {
  return todayISO(timeZone, instant);
}

/** 0 = Sunday ... 6 = Saturday */
export function weekday(iso: ISODate): number {
  const d = parseISODate(iso);
  return d ? d.getUTCDay() : 0;
}

export function monthStart(iso: ISODate): ISODate {
  return `${iso.slice(0, 7)}-01`;
}

export function addMonths(monthIso: ISODate, months: number): ISODate {
  const [y, m] = monthIso.split("-").map(Number);
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${ny}-${String(nm).padStart(2, "0")}-01`;
}

export function daysInMonth(monthIso: ISODate): number {
  const [y, m] = monthIso.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Same day of month clamped to the target month's length (for PageUp/PageDown). */
export function shiftMonthsKeepDay(iso: ISODate, months: number): ISODate {
  const target = addMonths(monthStart(iso), months);
  const day = Math.min(Number(iso.slice(8, 10)), daysInMonth(target));
  return `${target.slice(0, 8)}${String(day).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/* Formatting (fixed en-US, UTC so the calendar day never shifts)      */
/* ------------------------------------------------------------------ */

function fmt(iso: ISODate, opts: Intl.DateTimeFormatOptions): string {
  const d = parseISODate(iso);
  if (!d) return iso;
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(d);
}

/** "Friday, June 12, 2026" */
export const formatLong = (iso: ISODate) =>
  fmt(iso, { weekday: "long", month: "long", day: "numeric", year: "numeric" });

/** "Fri 12 Jun" (ledger style per design-system 8.7) */
export function formatShort(iso: ISODate): string {
  const d = parseISODate(iso);
  if (!d) return iso;
  const wd = fmt(iso, { weekday: "short" });
  const mo = fmt(iso, { month: "short" });
  return `${wd} ${d.getUTCDate()} ${mo}`;
}

/** "Fri 12 Jun 2026" */
export const formatShortYear = (iso: ISODate) => `${formatShort(iso)} ${iso.slice(0, 4)}`;

/** "June 2026" */
export const formatMonth = (iso: ISODate) => fmt(iso, { month: "long", year: "numeric" });

/** "Jun 12 to 15" or "Jun 30 to Jul 3" */
export function formatRangeCompact(checkIn: ISODate, checkOut: ISODate): string {
  const a = parseISODate(checkIn);
  const b = parseISODate(checkOut);
  if (!a || !b) return "";
  const ma = fmt(checkIn, { month: "short" });
  const mb = fmt(checkOut, { month: "short" });
  return ma === mb
    ? `${ma} ${a.getUTCDate()} to ${b.getUTCDate()}`
    : `${ma} ${a.getUTCDate()} to ${mb} ${b.getUTCDate()}`;
}

export function formatMoney(amount: number, opts: { cents?: boolean } = {}): string {
  const whole = opts.cents === false || Number.isInteger(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: siteConfig.pricing.currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

export const toCents = (amount: number) => Math.round(amount * 100);

/** "16:00" to "4:00 PM" */
export function formatClock(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return hhmm;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}
