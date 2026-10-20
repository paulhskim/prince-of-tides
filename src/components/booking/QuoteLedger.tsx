"use client";

/**
 * Live quote (design-system 8.10). Computed on the client with computeQuote from site.config.ts, the
 * same function the server uses; the server recomputes on submit and its figure is what is stored.
 */
import { useId, useMemo, useState } from "react";
import { computeQuote, type Quote } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import { formatMoney, formatShort } from "@/lib/booking/dates";

export function groupNights(q: Quote): { rate: number; nights: number; season: string }[] {
  const groups: { rate: number; nights: number; season: string }[] = [];
  for (const n of q.nightlyBreakdown) {
    const g = groups.find((x) => x.rate === n.rate);
    if (g) g.nights++;
    else groups.push({ rate: n.rate, nights: 1, season: n.season });
  }
  return groups;
}

/** Memoized client quote (stable identity while inputs are unchanged). */
export function useQuote(checkIn: string | null, checkOut: string | null, guests: number): Quote | null {
  return useMemo(() => (checkIn && checkOut ? computeQuote(checkIn, checkOut, guests) : null), [checkIn, checkOut, guests]);
}

const pct = (r: number) => `${Math.round(r * 1000) / 10}%`;

export function QuoteLedger({ quote, compact = false }: { quote: Quote | null; compact?: boolean }) {
  const [showNights, setShowNights] = useState(false);
  const nightsId = useId();

  if (!quote) {
    return <p className="text-small text-ink-muted">Add your dates for an estimated total.</p>;
  }

  const blocking = quote.errors.filter((e) => !/minimum/.test(e));
  if (blocking.length) {
    return (
      <p className="text-small text-warning" role="status">
        {blocking[0]}
      </p>
    );
  }

  const rows = groupNights(quote);
  return (
    <div data-testid="quote-ledger">
      <table className="w-full border-collapse text-small">
        <caption className="sr-only">Estimated price for your dates, in US dollars</caption>
        <tbody>
          {rows.map((g) => (
            <tr key={g.rate} className="border-b border-rule">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal text-ink">
                {bookingCopy.quote.nightsTemplate
                  .replace("{{nights}}", String(g.nights))
                  .replace("{{rate}}", formatMoney(g.rate))
                  .replace(/^1 nights/, "1 night")}
                {rows.length > 1 && <span className="block text-caption text-ink-muted">{g.season}</span>}
              </th>
              <td className="py-2.5 text-right align-top text-ink">{formatMoney(g.rate * g.nights)}</td>
            </tr>
          ))}
          {!compact && quote.nights > 1 && (
            <tr className="border-b border-rule">
              <td colSpan={2} className="py-1.5">
                <button
                  type="button"
                  aria-expanded={showNights}
                  aria-controls={nightsId}
                  onClick={() => setShowNights((v) => !v)}
                  className="min-h-11 text-caption text-ink-muted underline decoration-rule-strong underline-offset-[0.22em] hover:text-ink hover:decoration-ink"
                >
                  {showNights ? "Hide nightly rates" : "Show nightly rates"}
                </button>
                <ul id={nightsId} hidden={!showNights} className="pb-2 text-caption text-ink-muted">
                  {quote.nightlyBreakdown.map((n) => (
                    <li key={n.date} className="flex justify-between py-0.5 tabular">
                      <span>{formatShort(n.date)}</span>
                      <span>{formatMoney(n.rate)}</span>
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          )}
          {quote.discounts > 0 && (
            <tr className="border-b border-rule">
              <th scope="row" className="py-2.5 pr-4 text-left font-normal text-ink">
                {quote.discountLabel}
              </th>
              <td className="py-2.5 text-right text-ink">
                <span aria-hidden="true">-</span>
                <span className="sr-only">minus </span>
                {formatMoney(quote.discounts)}
              </td>
            </tr>
          )}
          <tr className="border-b border-rule">
            <th scope="row" className="py-2.5 pr-4 text-left font-normal text-ink">
              {bookingCopy.quote.cleaningFee}
            </th>
            <td className="py-2.5 text-right text-ink">{formatMoney(quote.cleaningFee)}</td>
          </tr>
          <tr>
            <th scope="row" className="pt-2.5 pr-4 text-left font-normal text-ink">
              {bookingCopy.quote.taxes}, {pct(quote.taxes.reduce((sum, t) => sum + t.rate, 0))}
            </th>
            <td className="pt-2.5 text-right text-ink">{formatMoney(quote.taxTotal)}</td>
          </tr>
          {quote.taxes.map((t, i) => (
            <tr key={t.name} className={i === quote.taxes.length - 1 ? "border-b border-rule" : undefined}>
              <th scope="row" className={`pr-4 pl-3 text-left text-caption font-normal text-ink-muted ${i === quote.taxes.length - 1 ? "pb-2.5" : ""}`}>
                {t.name}, {pct(t.rate)}
              </th>
              <td className={`text-right align-top text-caption text-ink-muted ${i === quote.taxes.length - 1 ? "pb-2.5" : ""}`}>{formatMoney(t.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-ink">
            <th scope="row" className="smallcaps pt-4 pr-4 text-left align-baseline text-ink">
              {bookingCopy.quote.totalEstimate}
            </th>
            <td className="pt-4 text-right align-baseline font-serif text-[1.875rem] font-light leading-none tracking-[-0.02em] text-ink" data-testid="quote-total">
              {formatMoney(quote.total)}
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="mt-4 text-caption text-ink-muted">{bookingCopy.quote.disclaimer}</p>
      <p className="mt-1 text-caption text-ink-muted">Booking direct means no platform service fee.</p>
      {quote.isPlaceholder && process.env.NODE_ENV !== "production" && (
        <p className="mt-3 border border-warning px-3 py-2 text-caption text-warning" role="note">
          Development only: these rates are placeholders (pricing.isPlaceholder is true in
          src/content/site.config.ts). Enter real rates before launch.
        </p>
      )}
    </div>
  );
}
