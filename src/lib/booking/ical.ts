/**
 * iCal import (Airbnb / Vrbo feeds) and export (our direct bookings). Server only.
 *
 * Import rules (docs/booking-architecture.md, phase 2):
 * - All-day events (DTSTART;VALUE=DATE) use the date parts as written. node-ical builds those at local
 *   midnight and flags them `dateOnly`, so local getters return the written calendar day.
 * - Timed events (DATE-TIME, UTC or TZID) are converted to the property's calendar date
 *   (America/New_York) with Intl, never via the server's local time.
 * - DTEND is the checkout day and is exclusive. A missing DTEND blocks one night.
 * - Malformed events are skipped and logged; parsing never throws.
 */
import ical from "node-ical";
import { siteConfig } from "@/content/site.config";
import { addDays, instantToISO, isISODate, type ISODate } from "./dates";
import type { BlockSource, BlockedRange } from "./ranges";

type DateLike = Date & { dateOnly?: boolean; tz?: string };

function eventDate(value: unknown): ISODate | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null;
  const d = value as DateLike;
  if (d.dateOnly) {
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return isISODate(iso) ? iso : null;
  }
  return instantToISO(d, siteConfig.times.timezone);
}

export type ParseResult = { ranges: BlockedRange[]; skipped: number };

export function parseIcsToRanges(text: string, source: BlockSource): ParseResult {
  let parsed: Record<string, unknown>;
  try {
    parsed = ical.sync.parseICS(text) as Record<string, unknown>;
  } catch (err) {
    console.error(`[availability] could not parse ${source} feed`, err);
    return { ranges: [], skipped: 0 };
  }
  const ranges: BlockedRange[] = [];
  let skipped = 0;
  for (const [key, raw] of Object.entries(parsed)) {
    const ev = raw as { type?: string; start?: unknown; end?: unknown; status?: string };
    if (!ev || ev.type !== "VEVENT") continue;
    if (typeof ev.status === "string" && ev.status.toUpperCase() === "CANCELLED") continue;
    const start = eventDate(ev.start);
    if (!start) {
      skipped++;
      console.warn(`[availability] skipped ${source} event ${key}: missing or invalid DTSTART`);
      continue;
    }
    let end = ev.end === undefined ? addDays(start, 1) : eventDate(ev.end);
    if (!end) {
      skipped++;
      console.warn(`[availability] skipped ${source} event ${key}: invalid DTEND`);
      continue;
    }
    if (end < start) {
      skipped++;
      console.warn(`[availability] skipped ${source} event ${key}: DTEND before DTSTART`);
      continue;
    }
    // A timed event that starts and ends on the same calendar day still occupies that night.
    if (end === start) end = addDays(start, 1);
    ranges.push({ start, end, source });
  }
  return { ranges, skipped };
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

export type ExportEvent = { uid: string; start: ISODate; end: ISODate };

const icsDate = (iso: ISODate) => iso.replace(/-/g, "");

function icsStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Fold lines longer than 75 octets per RFC 5545 (our lines are short; kept for safety). */
function fold(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  for (let i = 0; i < line.length; i += 74) parts.push((i === 0 ? "" : " ") + line.slice(i, i + 74));
  return parts.join("\r\n");
}

/** Build a minimal, platform-friendly calendar. SUMMARY is always "Reserved": no guest data. */
export function buildIcs(events: ExportEvent[], now: Date = new Date()): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Prince of Tides//Direct bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Prince of Tides direct bookings",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@princeoftides`,
      `DTSTAMP:${icsStamp(now)}`,
      `DTSTART;VALUE=DATE:${icsDate(e.start)}`,
      `DTEND;VALUE=DATE:${icsDate(e.end)}`,
      "SUMMARY:Reserved",
      "TRANSP:OPAQUE",
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
