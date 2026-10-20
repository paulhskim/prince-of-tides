/**
 * The stay set like a hotel folio: nights grouped by season and rate, discount, cleaning, every tax line
 * with its rate, the total and the averages. Every figure is read from a Quote produced by computeQuote
 * (src/content/site.config.ts); nothing is added or recomputed here.
 *
 * <StayTerms /> sets the payment schedule and the cancellation tiers as real dates for the arrival.
 */
import type { Quote } from "@/content/site.config";
import { policies } from "@/content/policies";
import { formatMoney, formatShort, formatShortYear, type ISODate } from "@/lib/booking/dates";
import {
  ILLUSTRATIVE_NOTE,
  averagePerNight,
  cancellationDates,
  groupNightsBySeasonRate,
  paymentSchedule,
  pct,
  securityDepositAmount,
} from "@/lib/booking/reserve";

const money = (n: number) => formatMoney(n);

export function Folio({ quote, caption = "Your stay, itemized" }: { quote: Quote; caption?: string }) {
  const groups = groupNightsBySeasonRate(quote);
  const avg = averagePerNight(quote);
  const row = "border-b border-rule";
  const th = "py-3 pr-4 text-left font-normal align-baseline";
  const td = "py-3 text-right align-baseline tabular";
  return (
    <div data-testid="folio">
      <table className="w-full border-collapse text-small">
        <caption className="sr-only">{caption}, in US dollars</caption>
        <thead>
          <tr className="border-b border-ink">
            <th scope="col" className="smallcaps pb-2 text-left text-ink-muted">
              Item
            </th>
            <th scope="col" className="smallcaps pb-2 text-right text-ink-muted">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={`${g.season}-${g.rate}`} className={row} data-testid="folio-nights">
              <th scope="row" className={th}>
                <span className="text-ink">
                  {g.nights} {g.nights === 1 ? "night" : "nights"} at {money(g.rate)}
                </span>
                <span className="block text-caption text-ink-muted">
                  {g.season}
                  {g.nights > 1 ? `, ${formatShort(g.first)} to ${formatShort(g.last)}` : `, ${formatShort(g.first)}`}
                </span>
              </th>
              <td className={td}>{money(g.amount)}</td>
            </tr>
          ))}
          <tr className={row}>
            <th scope="row" className={`${th} text-ink-muted`}>
              Lodging, {quote.nights} {quote.nights === 1 ? "night" : "nights"}
            </th>
            <td className={`${td} text-ink-muted`}>{money(quote.subtotal)}</td>
          </tr>
          {quote.discounts > 0 && (
            <tr className={row} data-testid="folio-discount">
              <th scope="row" className={th}>
                {quote.discountLabel}
              </th>
              <td className={`${td} text-success`}>
                <span aria-hidden="true">-</span>
                <span className="sr-only">minus </span>
                {money(quote.discounts)}
              </td>
            </tr>
          )}
          <tr className={row}>
            <th scope="row" className={th}>
              Cleaning fee
              <span className="block text-caption text-ink-muted">Once per stay</span>
            </th>
            <td className={td}>{money(quote.cleaningFee)}</td>
          </tr>
          <tr className="border-b border-ink">
            <th scope="row" className={`${th} text-ink-muted`}>
              Subtotal before taxes
            </th>
            <td className={`${td} text-ink-muted`}>{money(quote.taxableAmount)}</td>
          </tr>
          {quote.taxes.map((t) => (
            <tr key={t.name} className={row} data-testid="folio-tax">
              <th scope="row" className={th}>
                {t.name}
                <span className="block text-caption text-ink-muted">
                  {pct(t.rate)} of {money(quote.taxableAmount)}
                </span>
              </th>
              <td className={td} data-tax-amount={t.amount}>
                {money(t.amount)}
              </td>
            </tr>
          ))}
          <tr className={row}>
            <th scope="row" className={`${th} text-ink-muted`}>
              Taxes, {pct(quote.taxes.reduce((s, t) => s + t.rate, 0))} combined
            </th>
            <td className={`${td} text-ink-muted`}>{money(quote.taxTotal)}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-ink">
            <th scope="row" className="smallcaps pt-4 pr-4 text-left align-baseline text-ink">
              Total{quote.isPlaceholder ? ", estimated" : ""}
            </th>
            <td
              className="pt-4 text-right align-baseline font-serif text-[2rem] font-light leading-none tracking-[-0.02em] tabular"
              data-testid="folio-total"
            >
              {money(quote.total)}
            </td>
          </tr>
        </tfoot>
      </table>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 text-caption text-ink-muted">
        <div>
          <dt className="smallcaps">Average nightly rate</dt>
          <dd className="mt-1 font-serif text-body text-ink tabular">{money(avg.lodging)}</dd>
        </div>
        <div>
          <dt className="smallcaps">Average per night, all in</dt>
          <dd className="mt-1 font-serif text-body text-ink tabular" data-testid="folio-average">
            {money(avg.allIn)}
          </dd>
        </div>
      </dl>
      {quote.isPlaceholder && <p className="mt-4 font-serif text-small italic text-ink-muted">{ILLUSTRATIVE_NOTE} The host confirms the final figure before any payment.</p>}
    </div>
  );
}

/** Payment schedule, cancellation tiers (dated) and the security deposit. */
export function StayTerms({ total, checkIn, today, headingLevel = 3 }: { total: number; checkIn: ISODate; today: ISODate; headingLevel?: 3 | 4 }) {
  const pay = paymentSchedule(total, checkIn, today);
  const tiers = cancellationDates(checkIn, today);
  const deposit = securityDepositAmount();
  const H = headingLevel === 3 ? "h3" : "h4";
  const head = "smallcaps border-b border-ink pb-2 text-ink";
  const line = "flex items-baseline justify-between gap-4 border-b border-rule py-3";
  return (
    <div className="grid gap-x-col gap-y-10 md:grid-cols-2" data-testid="stay-terms">
      <section aria-label="Payment schedule">
        <H className={head}>Payment schedule</H>
        <ol className="text-small">
          <li className={line}>
            <span>
              Request today
              <span className="block text-caption text-ink-muted">Nothing is charged</span>
            </span>
            <span className="tabular">{money(0)}</span>
          </li>
          <li className={line} data-testid="pay-deposit">
            <span>
              {pay.fullAtConfirmation ? "Full payment to confirm" : `Deposit to confirm, ${pay.depositPct}%`}
              <span className="block text-caption text-ink-muted">When you sign the rental agreement</span>
            </span>
            <span className="tabular">{money(pay.deposit)}</span>
          </li>
          {pay.balanceDue && (
            <li className={line} data-testid="pay-balance">
              <span>
                Balance
                <span className="block text-caption text-ink-muted">Due {formatShortYear(pay.balanceDue)}</span>
              </span>
              <span className="tabular">{money(pay.balance)}</span>
            </li>
          )}
          <li className={line}>
            <span>
              Refundable security deposit
              <span className="block text-caption text-ink-muted">Collected with the final payment, returned within 7 days of checkout</span>
            </span>
            <span className="text-right tabular">{deposit !== null ? money(deposit) : <span className="text-caption text-ink-muted">Amount set in your agreement</span>}</span>
          </li>
        </ol>
        {pay.fullAtConfirmation && (
          <p className="mt-3 text-caption text-ink-muted">Your arrival is within the balance window, so the full amount is due at confirmation.</p>
        )}
      </section>

      <section aria-label="Cancellation">
        <H className={head}>Cancellation</H>
        <ol className="text-small" data-testid="cancellation-dates">
          {tiers.map((t) => (
            <li key={t.when} className={`${line} ${t.passed ? "text-ink-muted" : ""}`}>
              <span>
                {t.from === null ? `Through ${formatShortYear(t.until)}` : t.from <= today ? `Now to ${formatShortYear(t.until)}` : `${formatShortYear(t.from)} to ${formatShortYear(t.until)}`}
                <span className="block text-caption text-ink-muted">
                  {t.when}
                  {t.passed ? ", already passed" : ""}
                </span>
              </span>
              <span className="max-w-[11rem] text-right text-caption">{t.refund}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-caption text-ink-muted">{policies.cancellation.notes[0]}</p>
      </section>
    </div>
  );
}
