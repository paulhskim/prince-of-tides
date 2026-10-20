"use client";

/**
 * The confirmation view after "Request this reservation": set like a hotel's reservation confirmation.
 * Reference, dates, the folio (the quote the server returned from computeQuote), what happens next, and
 * a payment panel that previews the deposit and due dates. The panel is a preview only: its control is
 * disabled and there are no card fields. The secure payment link comes from the host after confirmation.
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import { siteConfig, type Quote } from "@/content/site.config";
import { diffDays, formatClock, formatLong, formatMoney, formatShortYear, type ISODate } from "@/lib/booking/dates";
import { guestSummary } from "@/lib/booking/guest-summary";
import { paymentSchedule, paymentTerms, securityDepositAmount } from "@/lib/booking/reserve";
import { RunningHead } from "@/components/site/layout";
import { Folio, StayTerms } from "./Folio";

export type ConfirmationData = {
  id: string;
  name: string;
  email: string;
  checkIn: ISODate;
  checkOut: ISODate;
  adults: number;
  children: number;
  infants: number;
  quote: Quote;
  requestedOn: ISODate;
};

export function Confirmation({ data }: { data: ConfirmationData }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const { quote } = data;
  const nights = diffDays(data.checkIn, data.checkOut);
  const pay = paymentSchedule(quote.total, data.checkIn, data.requestedOn);
  const deposit = securityDepositAmount();
  const first = data.name.trim().split(/\s+/)[0] || data.name;
  const hours = siteConfig.contact.responseTimeHours;

  const steps = [
    `The host reviews your dates and confirms them by email, typically within ${hours} hours.`,
    `You receive the rental agreement and a secure payment link for the ${pay.fullAtConfirmation ? "full amount" : "deposit"} of ${formatMoney(pay.deposit)}. Your dates are held once it is paid.`,
    pay.balanceDue
      ? `The balance of ${formatMoney(pay.balance)} is due on ${formatLong(pay.balanceDue)}, ${paymentTerms().balanceDaysBefore} days before arrival.`
      : "Nothing further is due before arrival.",
    "Before arrival: the door code, parking notes and the full address.",
  ];

  return (
    <div data-testid="reserve-confirmation">
      <header className="pb-section-sm pt-6 lg:pt-10">
        <div className="mx-auto max-w-page px-gutter">
          <RunningHead left="Reservation request" right={`Reference ${data.id}`} />
          <div className="mt-[clamp(2.25rem,1.5rem+3vw,4.5rem)] grid grid-cols-4 gap-x-col gap-y-6 md:grid-cols-8 lg:grid-cols-12">
            <h1 ref={headingRef} tabIndex={-1} className="display-cut col-span-4 text-h1 focus:outline-none md:col-span-8 lg:col-span-7">
              Request received.
            </h1>
            <p className="col-span-4 max-w-measure font-serif text-lead oldstyle md:col-span-7 lg:col-span-4 lg:col-start-9 lg:self-end">
              Thank you, {first}. Your request for {formatLong(data.checkIn)} to {formatLong(data.checkOut)} is with the host. A copy is on its way to {data.email}.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-page px-gutter pb-section">
        <div className="grid grid-cols-4 gap-x-col gap-y-14 md:grid-cols-8 lg:grid-cols-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            {/* The confirmation slip */}
            <section aria-labelledby="conf-slip" className="border-t-2 border-ink">
              <h2 id="conf-slip" className="sr-only">
                Reservation details
              </h2>
              <dl className="grid grid-cols-2 text-small md:grid-cols-3">
                {[
                  ["Reference", data.id, "conf-ref"],
                  ["Status", "Awaiting host confirmation", undefined],
                  ["Requested", formatShortYear(data.requestedOn), undefined],
                  ["Arrive", `${formatShortYear(data.checkIn)}, from ${formatClock(siteConfig.times.checkIn)}`, undefined],
                  ["Depart", `${formatShortYear(data.checkOut)}, by ${formatClock(siteConfig.times.checkOut)}`, undefined],
                  ["Stay", `${nights} ${nights === 1 ? "night" : "nights"}, ${guestSummary(data)}`, undefined],
                ].map(([k, v, testId]) => (
                  <div key={k} className="border-b border-rule py-4 pr-4">
                    <dt className="smallcaps text-ink-muted">{k}</dt>
                    <dd className="mt-1.5 font-serif text-[1.0625rem] leading-snug tabular" data-testid={testId}>
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section aria-labelledby="conf-folio" className="mt-14">
              <h2 id="conf-folio" className="smallcaps border-b border-ink pb-2">
                Folio
              </h2>
              <div className="mt-2">
                <Folio quote={quote} caption="Folio for this request" />
              </div>
            </section>

            <section aria-labelledby="conf-next" className="mt-14">
              <h2 id="conf-next" className="font-serif text-h3">
                What happens next
              </h2>
              <ol className="mt-4 border-t border-ink">
                {steps.map((s, i) => (
                  <li key={s} className="grid grid-cols-[2.75rem_1fr] border-b border-rule py-4 text-body">
                    <span aria-hidden="true" className="font-serif text-h3 italic leading-none text-brass tabular">
                      {["i", "ii", "iii", "iv"][i]}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </section>

            <section aria-labelledby="conf-terms" className="mt-14">
              <h2 id="conf-terms" className="sr-only">
                Payment and cancellation terms
              </h2>
              <StayTerms total={quote.total} checkIn={data.checkIn} today={data.requestedOn} headingLevel={3} />
            </section>

            <div className="mt-12 flex flex-wrap gap-x-8 gap-y-2">
              <Link href="/#arrival" className="link-caps">
                Arrival details
              </Link>
              <Link href="/area" className="link-caps">
                Area guide
              </Link>
              <Link href="/" className="link-caps">
                Return to the residence
              </Link>
            </div>
          </div>

          {/* Payment preview */}
          <aside aria-labelledby="pay-title" className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
            <div className="border-t-2 border-ink bg-sheet p-6 shadow-[inset_0_0_0_1px_var(--color-rule)] lg:sticky lg:top-24 lg:p-8" data-testid="payment-panel">
              <div className="flex items-center justify-between gap-4">
                <h2 id="pay-title" className="smallcaps text-ink">
                  Payment
                </h2>
                <span className="border border-rule-strong px-1.5 py-0.5 text-caption font-medium text-ink-muted">Preview</span>
              </div>
              <p className="mt-4 font-serif text-[1.75rem] font-light leading-none tracking-[-0.02em] tabular" data-testid="pay-deposit-amount">
                {formatMoney(pay.deposit)}
              </p>
              <p className="mt-1.5 text-small text-ink-muted">{pay.fullAtConfirmation ? "Full amount, due at confirmation" : `Deposit, ${pay.depositPct}% of ${formatMoney(quote.total)}, due at confirmation`}</p>

              <dl className="mt-6 border-t border-ink text-small">
                <div className="flex justify-between gap-4 border-b border-rule py-3">
                  <dt>Today</dt>
                  <dd className="tabular">{formatMoney(0)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-rule py-3">
                  <dt>
                    {pay.fullAtConfirmation ? "At confirmation" : "Deposit at confirmation"}
                    <span className="block text-caption text-ink-muted">After the host confirms your dates</span>
                  </dt>
                  <dd className="tabular">{formatMoney(pay.deposit)}</dd>
                </div>
                {pay.balanceDue && (
                  <div className="flex justify-between gap-4 border-b border-rule py-3" data-testid="pay-balance-row">
                    <dt>
                      Balance
                      <span className="block text-caption text-ink-muted">Due {formatShortYear(pay.balanceDue)}</span>
                    </dt>
                    <dd className="tabular">{formatMoney(pay.balance)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4 border-b border-rule py-3">
                  <dt>
                    Security deposit
                    <span className="block text-caption text-ink-muted">Refundable, with the final payment</span>
                  </dt>
                  <dd className="text-right tabular">{deposit !== null ? formatMoney(deposit) : <span className="text-caption text-ink-muted">Set in your agreement</span>}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 pt-3">
                  <dt className="smallcaps">Total{quote.isPlaceholder ? ", estimated" : ""}</dt>
                  <dd className="font-serif text-h3 tabular">{formatMoney(quote.total)}</dd>
                </div>
              </dl>

              <button
                type="button"
                aria-disabled="true"
                aria-describedby="pay-note"
                onClick={(e) => e.preventDefault()}
                className="btn mt-7 flex h-14 w-full cursor-not-allowed border-rule-strong bg-stone text-ink-muted"
                data-testid="pay-deposit-button"
              >
                Pay deposit (available after confirmation)
              </button>
              <p id="pay-note" className="mt-3 font-serif text-small italic leading-snug text-ink-muted">
                Payment is arranged after the host confirms. The secure link arrives by email with your rental agreement; this site never asks for card details.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
