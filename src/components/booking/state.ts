"use client";

/**
 * Shared client state for the booking UI: the selected stay (synced to the URL with replaceState, so it
 * is shareable and survives refresh) and the availability fetched from /api/availability. Module-level
 * stores so the reservation bar, the inline ledger and the mobile sheet stay in sync on one page.
 */
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { siteConfig } from "@/content/site.config";
import { addDays, diffDays, isISODate, todayISO, type ISODate } from "@/lib/booking/dates";
import { lastBookableDate } from "@/lib/booking/rules";
import { GUEST_RULES } from "@/lib/booking/schemas";

export type Stay = {
  checkIn: ISODate | null;
  checkOut: ISODate | null;
  adults: number;
  children: number;
  infants: number;
};

export const DEFAULT_STAY: Stay = { checkIn: null, checkOut: null, adults: 2, children: 0, infants: 0 };

/* ------------------------------------------------------------------ */
/* Stay                                                                */
/* ------------------------------------------------------------------ */

function clampInt(v: string | null, min: number, max: number, fallback: number): number {
  if (v === null || v === "") return fallback;
  const n = Number.parseInt(v, 10);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/**
 * Read stay params. Accepts checkIn/checkOut and the ux-spec aliases arrive/depart. Dates the calendar
 * could never produce are dropped (arrival in the past or beyond the booking window, stays longer than
 * maxNights), so a stale or hand-edited link opens the calendar instead of quoting an impossible stay.
 */
export function stayFromParams(params: URLSearchParams, today: ISODate = todayISO()): Stay {
  const ci = params.get("checkIn") ?? params.get("arrive");
  const co = params.get("checkOut") ?? params.get("depart");
  const checkIn = isISODate(ci) && ci >= today && ci <= lastBookableDate(today) ? ci : null;
  const checkOut =
    checkIn && isISODate(co) && co > checkIn && diffDays(checkIn, co) <= siteConfig.booking.maxNights ? co : null;
  const adults = clampInt(params.get("adults"), 1, GUEST_RULES.maxAdults, DEFAULT_STAY.adults);
  const children = clampInt(params.get("children"), 0, GUEST_RULES.maxGuests - adults, 0);
  const infants = clampInt(params.get("infants"), 0, GUEST_RULES.maxInfants, 0);
  return { checkIn, checkOut, adults, children, infants };
}

export function stayToQuery(s: Stay): string {
  const p = new URLSearchParams();
  if (s.checkIn) p.set("checkIn", s.checkIn);
  if (s.checkOut) p.set("checkOut", s.checkOut);
  p.set("adults", String(s.adults));
  if (s.children) p.set("children", String(s.children));
  if (s.infants) p.set("infants", String(s.infants));
  return p.toString();
}

let stay: Stay | null = null;
const stayListeners = new Set<() => void>();

function readStay(): Stay {
  if (stay === null) stay = typeof window === "undefined" ? DEFAULT_STAY : stayFromParams(new URLSearchParams(window.location.search));
  return stay;
}

const STAY_KEYS = ["checkIn", "checkOut", "arrive", "depart", "adults", "children", "infants"];

function writeUrl(s: Stay) {
  const url = new URL(window.location.href);
  for (const k of STAY_KEYS) url.searchParams.delete(k);
  const hasSelection = s.checkIn || s.adults !== DEFAULT_STAY.adults || s.children || s.infants;
  if (hasSelection) for (const [k, v] of new URLSearchParams(stayToQuery(s))) url.searchParams.set(k, v);
  window.history.replaceState(window.history.state, "", url.toString());
}

export function setStay(patch: Partial<Stay>) {
  stay = { ...readStay(), ...patch };
  writeUrl(stay);
  for (const l of stayListeners) l();
}

export function useStay(): [Stay, (patch: Partial<Stay>) => void] {
  const value = useSyncExternalStore(
    (cb) => {
      stayListeners.add(cb);
      return () => stayListeners.delete(cb);
    },
    readStay,
    () => DEFAULT_STAY,
  );
  return [value, useCallback((p: Partial<Stay>) => setStay(p), [])];
}

/* ------------------------------------------------------------------ */
/* Availability                                                        */
/* ------------------------------------------------------------------ */

export type Availability = {
  status: "loading" | "ready" | "error";
  blocked: ReadonlySet<ISODate>;
  /** False when a platform feed could not be read: the host confirms dates. */
  complete: boolean;
  today: ISODate;
};

const EMPTY: ReadonlySet<ISODate> = new Set();
let availability: Availability | null = null;
let inflight: Promise<void> | null = null;
const availListeners = new Set<() => void>();
/** Placeholder "today" used only for the server render, before the browser knows the real date. */
export const SERVER_TODAY: ISODate = "1970-01-01";
const SERVER_AVAIL: Availability = { status: "loading", blocked: EMPTY, complete: true, today: SERVER_TODAY };

function readAvailability(): Availability {
  if (!availability) availability = { status: "loading", blocked: EMPTY, complete: true, today: todayISO() };
  return availability;
}

function loadAvailability() {
  if (inflight || readAvailability().status === "ready") return;
  const today = readAvailability().today;
  inflight = fetch(`/api/availability?from=${today}&to=${addDays(today, 400)}`)
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
    .then((data: { nights: string[]; complete: boolean }) => {
      availability = { status: "ready", blocked: new Set(data.nights), complete: data.complete, today };
    })
    .catch(() => {
      availability = { status: "error", blocked: EMPTY, complete: false, today };
    })
    .finally(() => {
      inflight = null;
      for (const l of availListeners) l();
    });
}

export function useAvailability(): Availability {
  const value = useSyncExternalStore(
    (cb) => {
      availListeners.add(cb);
      return () => availListeners.delete(cb);
    },
    readAvailability,
    () => SERVER_AVAIL,
  );
  useEffect(() => {
    loadAvailability();
  }, []);
  return value;
}

/* ------------------------------------------------------------------ */
/* Media                                                               */
/* ------------------------------------------------------------------ */

const LG = "(min-width: 1024px)";

/** True at the lg breakpoint. Server snapshot is true (two months render, the second hidden by CSS below lg). */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(LG);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(LG).matches,
    () => true,
  );
}
