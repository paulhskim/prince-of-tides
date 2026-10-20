"use client";

/**
 * Client quote hook, plus the price-free stay note used by the home ledger and the mobile sheet.
 *
 * Rates are shown ONLY on /reserve, in the itemized quote, after a guest has chosen arrival and
 * departure. Everywhere else the widgets confirm the dates and the stay rules (minimum nights, arrival
 * days) and send the guest on; they never print a figure. computeQuote stays the single source of truth
 * (the server recomputes on submit).
 */
import { useMemo } from "react";
import { computeQuote, type Quote } from "@/content/site.config";
import { formatRangeCompact } from "@/lib/booking/dates";
import { minNightsMessage } from "@/lib/booking/rules";

/** Memoized client quote (stable identity while inputs are unchanged). */
export function useQuote(checkIn: string | null, checkOut: string | null, guests: number): Quote | null {
  return useMemo(() => (checkIn && checkOut ? computeQuote(checkIn, checkOut, guests) : null), [checkIn, checkOut, guests]);
}

/** What the stay note says, without prices. */
export function stayNoteText(checkIn: string | null, checkOut: string | null, quote: Quote | null): { text: string; tone: "plain" | "warning" } {
  if (!checkIn || !checkOut || !quote) {
    return { text: "Choose your dates. Your quote is drawn up for them on the reservation page, night by night.", tone: "plain" };
  }
  if (!quote.meetsMinNights) return { text: minNightsMessage(checkIn, checkOut), tone: "warning" };
  if (quote.arrivalRule) return { text: quote.arrivalRule, tone: "warning" };
  const blocking = quote.errors[0];
  if (blocking) return { text: blocking, tone: "warning" };
  return {
    text: `${formatRangeCompact(checkIn, checkOut)}, ${quote.nights} ${quote.nights === 1 ? "night" : "nights"}. Your itemized quote for these dates is on the next page.`,
    tone: "plain",
  };
}

export function StayNote({ checkIn, checkOut, quote }: { checkIn: string | null; checkOut: string | null; quote: Quote | null }) {
  const note = stayNoteText(checkIn, checkOut, quote);
  return (
    <p className={`text-small ${note.tone === "warning" ? "text-warning" : "text-ink-muted"}`} role="status" data-testid="stay-note">
      {note.text}
    </p>
  );
}
