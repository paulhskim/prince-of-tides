"use client";

/**
 * Success page body. Uses the stored request when the server found it; otherwise the summary the form
 * saved in sessionStorage (on hosts where the store is per instance, e.g. the memory adapter on Vercel).
 */
import { useSyncExternalStore } from "react";
import Link from "next/link";
import { booking as bookingCopy } from "@/content/copy";
import { formatLong, formatMoney, formatShortYear, diffDays } from "@/lib/booking/dates";
import { resolveOwnerTokens } from "@/lib/booking/owner-tokens";
import { guestSummary } from "@/lib/booking/guest-summary";

export type RequestSummary = {
  id: string;
  /** Only from this browser's sessionStorage; the server never sends contact details here. */
  name?: string;
  email?: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  infants: number;
  total: number;
  status?: string;
};

function readSession(id: string | null): string | null {
  if (!id) return null;
  try {
    return sessionStorage.getItem(`pot:request:${id}`);
  } catch {
    return null;
  }
}

export function SuccessSummary({ id, initial, paid }: { id: string | null; initial: RequestSummary | null; paid?: boolean }) {
  const stored = useSyncExternalStore(
    () => () => {},
    () => readSession(id),
    () => null,
  );
  let session: RequestSummary | null = null;
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as RequestSummary;
      session = parsed && parsed.id === id ? parsed : null;
    } catch {
      session = null;
    }
  }
  // Server record (no PII) wins for dates, status and total; this browser's copy adds name and email.
  const s: RequestSummary | null = initial
    ? { ...initial, name: session?.name, email: session?.email }
    : session;
  const confirmed = paid && s?.status === "confirmed";
  const title = confirmed ? "Reservation confirmed." : id ? bookingCopy.success.title : "No request to show.";

  return (
    <div className="grid grid-cols-4 gap-x-col md:grid-cols-8 lg:grid-cols-12" data-testid="booking-success">
      <div className="col-span-4 md:col-span-8 lg:col-span-7">
        <h1 className="font-serif text-h1">{title}</h1>
        {s && s.name && s.email ? (
          <p className="mt-5 max-w-measure font-serif text-lead">
            {bookingCopy.success.body
              .replace("{{guestName}}", s.name.split(" ")[0] || s.name)
              .replace("{{checkIn}}", formatLong(s.checkIn))
              .replace("{{checkOut}}", formatLong(s.checkOut))
              .replace("{{email}}", s.email)}
          </p>
        ) : s ? (
          <p className="mt-5 max-w-measure font-serif text-lead">
            Thank you. Your request for {formatLong(s.checkIn)} to {formatLong(s.checkOut)} is with us under reference {s.id}. A
            confirmation has been sent to the email address you gave.
          </p>
        ) : id ? (
          <p className="mt-5 max-w-measure font-serif text-lead">
            Thank you. Your request is with us under reference {id}. Please keep this reference for your records.
          </p>
        ) : (
          <p className="mt-5 max-w-measure font-serif text-lead" data-testid="success-missing">
            This page confirms a booking request once one has been sent. If you sent one, the confirmation email holds your
            reference. To send a request, <Link href="/book">choose your dates</Link>.
          </p>
        )}
        {paid && !confirmed && (
          <p className="mt-4 max-w-measure text-small text-ink-muted">Your payment is being processed. A confirmation email follows once it clears.</p>
        )}

        <section aria-labelledby="next-steps" className="mt-12 border-t border-ink pt-5">
          <h2 id="next-steps" className="font-serif text-h3">
            {bookingCopy.success.nextStepsHeading}
          </h2>
          <ol className="mt-5 max-w-measure">
            {bookingCopy.success.nextSteps.map((step, i) => (
              <li key={step} className="grid grid-cols-[2.5rem_1fr] border-b border-rule py-3 text-body">
                <span className="font-serif text-h3 leading-none text-ink-muted tabular" aria-hidden="true">
                  {i + 1}
                </span>
                <span>{resolveOwnerTokens(step)}</span>
              </li>
            ))}
          </ol>
        </section>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-small">
          <Link href="/#arrival">Read arrival details</Link>
          <Link href="/area">Browse the area guide</Link>
          <Link href={bookingCopy.success.button.href}>{bookingCopy.success.button.label}</Link>
        </div>
      </div>

      {s && (
        <aside aria-labelledby="request-ledger" className="col-span-4 mt-12 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-2">
          <div className="border border-rule-strong bg-sheet p-6 lg:p-8">
            <p className="text-label text-ink-muted">Reference</p>
            <h2 id="request-ledger" className="mt-1 font-serif text-h3 tabular" data-testid="success-ref">
              {s.id}
            </h2>
            <dl className="mt-5 text-small">
              {[
                ["Arrive", formatShortYear(s.checkIn)],
                ["Depart", formatShortYear(s.checkOut)],
                ["Nights", String(diffDays(s.checkIn, s.checkOut))],
                ["Guests", guestSummary(s)],
                ...(s.email ? [["Email", s.email]] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-rule py-2.5">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-right text-ink tabular break-all">{v}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-4 border-t border-ink pt-3">
                <dt className="font-semibold text-ink">{bookingCopy.quote.totalEstimate}</dt>
                <dd className="font-serif text-h3 tabular">{formatMoney(s.total)}</dd>
              </div>
            </dl>
            <p className="mt-3 text-caption text-ink-muted">{bookingCopy.quote.disclaimer}</p>
          </div>
        </aside>
      )}
    </div>
  );
}
