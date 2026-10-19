/**
 * Availability: merges every source of blocked nights. Server only.
 *
 * Sources
 * (a) Manual blocks in src/lib/booking/blocked-dates.json: [{ "start": "2027-01-10", "end": "2027-01-13",
 *     "note": "Owner stay" }]. `end` is the checkout day (exclusive), like iCal DTEND. The file is read at
 *     request time so edits apply without a rebuild locally (BLOCKED_DATES_FILE overrides the path); the
 *     bundled copy is the fallback on hosts where src/ is not on disk (Vercel), so redeploy after edits.
 * (b) Airbnb / Vrbo iCal feeds (AIRBNB_ICAL_URL, VRBO_ICAL_URL) when siteConfig.features.icalSync is
 *     true. Cached 15 minutes (Next fetch cache, tag "availability"); a failing feed falls back to the
 *     last good copy in memory and is logged, never thrown.
 * (c) Direct bookings from the store: confirmed, plus unexpired checkout holds.
 *
 * Same-day turnover: ranges are half-open, so a stay may end on the day another begins.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { siteConfig } from "@/content/site.config";
import bundledBlocks from "./blocked-dates.json";
import { isISODate, type ISODate } from "./dates";
import { parseIcsToRanges } from "./ical";
import { blockedNightsBetween, isRangeFree, mergeRanges, type BlockSource, type BlockedRange } from "./ranges";
import { getStore, type BookingStore } from "./store";

export const AVAILABILITY_TAG = "availability";
export const FEED_REVALIDATE_SECONDS = 900;
const FEED_TIMEOUT_MS = 8000;

/* ------------------------------------------------------------------ */
/* (a) Manual blocks                                                   */
/* ------------------------------------------------------------------ */

type RawBlock = { start?: unknown; end?: unknown; note?: unknown };

export function normalizeManualBlocks(raw: unknown): BlockedRange[] {
  if (!Array.isArray(raw)) return [];
  const out: BlockedRange[] = [];
  for (const item of raw as RawBlock[]) {
    if (!item || !isISODate(item.start) || !isISODate(item.end) || item.end <= item.start) {
      console.warn("[availability] ignored invalid manual block", item);
      continue;
    }
    out.push({
      start: item.start,
      end: item.end,
      source: "manual",
      note: typeof item.note === "string" ? item.note : undefined,
    });
  }
  return out;
}

export function manualBlocksPath(): string {
  return process.env.BLOCKED_DATES_FILE ?? path.join(process.cwd(), "src", "lib", "booking", "blocked-dates.json");
}

export async function getManualBlocks(): Promise<BlockedRange[]> {
  try {
    const text = await fs.readFile(manualBlocksPath(), "utf8");
    return normalizeManualBlocks(JSON.parse(text));
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[availability] could not read manual blocks file, using bundled copy", err);
    }
    return normalizeManualBlocks(bundledBlocks);
  }
}

/* ------------------------------------------------------------------ */
/* (b) iCal feeds                                                      */
/* ------------------------------------------------------------------ */

export type FeedStatus = { source: BlockSource; ok: boolean; stale?: boolean; error?: string };

type Fetcher = (url: string, init: RequestInit & { next?: { revalidate?: number; tags?: string[] } }) => Promise<Response>;

const lastGood = new Map<string, BlockedRange[]>();

export function configuredFeeds(): { source: BlockSource; url: string }[] {
  if (!siteConfig.features.icalSync) return [];
  const feeds: { source: BlockSource; url: string }[] = [];
  if (process.env.AIRBNB_ICAL_URL) feeds.push({ source: "airbnb", url: process.env.AIRBNB_ICAL_URL });
  if (process.env.VRBO_ICAL_URL) feeds.push({ source: "vrbo", url: process.env.VRBO_ICAL_URL });
  return feeds;
}

export async function fetchFeed(
  feed: { source: BlockSource; url: string },
  opts: { fresh?: boolean; fetcher?: Fetcher } = {},
): Promise<{ ranges: BlockedRange[]; status: FeedStatus }> {
  const fetcher: Fetcher = opts.fetcher ?? (fetch as Fetcher);
  try {
    const res = await fetcher(feed.url, {
      signal: AbortSignal.timeout(FEED_TIMEOUT_MS),
      headers: { accept: "text/calendar" },
      ...(opts.fresh
        ? { cache: "no-store" as const }
        : { next: { revalidate: FEED_REVALIDATE_SECONDS, tags: [AVAILABILITY_TAG] } }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes("BEGIN:VCALENDAR")) throw new Error("Response is not an iCal calendar");
    const { ranges } = parseIcsToRanges(text, feed.source);
    lastGood.set(feed.url, ranges);
    return { ranges, status: { source: feed.source, ok: true } };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[availability] ${feed.source} feed failed: ${message}`);
    const cached = lastGood.get(feed.url);
    if (cached && !opts.fresh) {
      return { ranges: cached, status: { source: feed.source, ok: true, stale: true, error: message } };
    }
    return { ranges: [], status: { source: feed.source, ok: false, error: message } };
  }
}

/* ------------------------------------------------------------------ */
/* (c) Direct bookings                                                 */
/* ------------------------------------------------------------------ */

export async function getDirectBlocks(store: BookingStore, opts: { excludeId?: string; now?: Date } = {}) {
  try {
    const active = await store.listActive(opts.now);
    return active
      .filter((b) => b.id !== opts.excludeId)
      .map<BlockedRange>((b) => ({ start: b.checkIn, end: b.checkOut, source: b.status === "hold" ? "hold" : "direct" }));
  } catch (err) {
    console.error("[availability] could not read direct bookings", err);
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Merge                                                               */
/* ------------------------------------------------------------------ */

export type AvailabilitySnapshot = {
  /** Unmerged ranges with their source (server use only; never send sources to the browser). */
  ranges: BlockedRange[];
  feeds: FeedStatus[];
  /** False when a configured feed could not be read and no cached copy exists. */
  complete: boolean;
  updatedAt: string;
};

export async function getBlockedRanges(
  opts: { fresh?: boolean; store?: BookingStore; excludeId?: string; now?: Date; fetcher?: Fetcher } = {},
): Promise<AvailabilitySnapshot> {
  const store = opts.store ?? getStore();
  const [manual, direct, feedResults] = await Promise.all([
    getManualBlocks(),
    getDirectBlocks(store, { excludeId: opts.excludeId, now: opts.now }),
    Promise.all(configuredFeeds().map((f) => fetchFeed(f, { fresh: opts.fresh, fetcher: opts.fetcher }))),
  ]);
  const feedRanges = feedResults.flatMap((r) => r.ranges);
  const feeds = feedResults.map((r) => r.status);
  return {
    ranges: [...manual, ...feedRanges, ...direct],
    feeds,
    complete: feeds.every((f) => f.ok),
    updatedAt: (opts.now ?? new Date()).toISOString(),
  };
}

export async function isRangeAvailable(
  checkIn: ISODate,
  checkOut: ISODate,
  opts: Parameters<typeof getBlockedRanges>[0] = {},
): Promise<{ available: boolean; complete: boolean }> {
  const snap = await getBlockedRanges(opts);
  return { available: isRangeFree(snap.ranges, checkIn, checkOut), complete: snap.complete };
}

/** Public shape for GET /api/availability: no sources, notes or guest data. */
export function publicAvailability(snap: AvailabilitySnapshot, from: ISODate, to: ISODate) {
  const clipped = mergeRanges(snap.ranges).filter((r) => r.end > from && r.start < to);
  return {
    from,
    to,
    blocked: clipped,
    nights: blockedNightsBetween(snap.ranges, from, to),
    complete: snap.complete,
    updatedAt: snap.updatedAt,
  };
}
