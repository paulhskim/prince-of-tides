"use client";

/**
 * Reservation ledger for the home page (#reserve, ux-spec 2.14): calendar always open on desktop
 * (cols 1 to 7), ledger on the right (cols 9 to 12, sticky). Below lg the calendar is not inlined: the
 * ledger cells open the reservation sheet. "Request these dates" goes to /reserve with the stay in the
 * query string; the full request form lives there (src/components/reserve/ReserveFlow.tsx).
 *
 * No prices here: the itemized quote appears only on /reserve once dates are chosen (computeQuote in
 * site.config.ts; the server recomputes everything on submit).
 */
import { useCallback, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import { formatShort } from "@/lib/booking/dates";
import { countedGuests } from "@/lib/booking/schemas";
import { DateRangeCalendar } from "./DateRangeCalendar";
import { GuestFields, guestLine } from "./GuestFields";
import { StayNote, useQuote } from "./QuoteLedger";
import { ReservationSheet } from "./ReservationSheet";
import { stayToQuery, useAvailability, useStay, type Stay } from "./state";

const primaryBtn =
  "btn btn-primary flex w-full aria-disabled:cursor-not-allowed aria-disabled:bg-stone aria-disabled:text-ink-faint";

/** `variant` is kept for compatibility; "page" was the retired /book form and now renders the ledger. */
export function ReservationForm({ variant = "inline" }: { variant?: "inline" | "page" }) {
  void variant;
  return <InlineReservation />;
}

/* ------------------------------------------------------------------ */
/* Ledger header + cells (shared)                                      */
/* ------------------------------------------------------------------ */

function LedgerHead({ headingId }: { headingId: string }) {
  return (
    <>
      <p className="smallcaps flex items-center justify-between text-ink-muted">
        <span>Reservation</span>
        <span className="text-brass">Hilton Head Resort</span>
      </p>
      <h3 id={headingId} className="mt-4 font-serif text-[1.875rem] font-light leading-none tracking-[-0.02em]">
        {siteConfig.brand.name}
        <span className="sr-only">, Hilton Head Resort</span>
      </h3>
    </>
  );
}

function Cell({
  label,
  value,
  onClick,
  expanded,
  controls,
  testId,
}: {
  label: string;
  value: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  expanded?: boolean;
  controls?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={controls}
      data-testid={testId}
      className="flex min-h-18 flex-col items-start justify-center px-3 py-3 text-left transition-colors duration-[var(--duration-fast)] first:pl-0 hover:bg-stone/60 focus-visible:outline-offset-[-2px]"
    >
      <span className="smallcaps text-ink-muted">{label}</span>
      <span className="mt-1.5 font-serif text-[1.125rem] leading-tight text-ink tabular">{value}</span>
    </button>
  );
}

function stayIsReady(stay: Stay, quote: ReturnType<typeof useQuote>) {
  return Boolean(stay.checkIn && stay.checkOut && quote && quote.meetsMinNights && quote.errors.length === 0);
}

/* ------------------------------------------------------------------ */
/* Inline (home)                                                       */
/* ------------------------------------------------------------------ */

function InlineReservation() {
  const [stay, setStay] = useStay();
  const avail = useAvailability();
  const router = useRouter();
  const quote = useQuote(stay.checkIn, stay.checkOut, countedGuests(stay));
  const ready = stayIsReady(stay, quote);
  const [guestsOpen, setGuestsOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const headingId = useId();
  const guestsId = useId();

  const isDesktop = () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches;

  const focusCalendar = useCallback(() => {
    const root = calendarRef.current;
    if (!root) return;
    root.scrollIntoView({ block: "nearest" });
    root.querySelector<HTMLButtonElement>('button[data-iso][tabindex="0"]')?.focus();
  }, []);

  const openDates = (e: React.MouseEvent<HTMLElement>) => {
    if (isDesktop()) focusCalendar();
    else {
      triggerRef.current = e.currentTarget;
      setSheetOpen(true);
    }
  };

  return (
    <div className="grid grid-cols-4 gap-x-col md:grid-cols-8 lg:grid-cols-12" data-testid="reservation-inline">
      <div ref={calendarRef} className="hidden lg:col-span-7 lg:block">
        <DateRangeCalendar
          selection={{ checkIn: stay.checkIn, checkOut: stay.checkOut }}
          onChange={(s) => setStay(s)}
          blocked={avail.blocked}
          today={avail.today}
          status={avail.status}
          complete={avail.complete}
          months={2}
        />
      </div>
      <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
        <section aria-labelledby={headingId} className="border-t-2 border-ink bg-sheet p-6 shadow-[inset_0_0_0_1px_var(--color-rule)] lg:sticky lg:top-28 lg:p-9">
          <LedgerHead headingId={headingId} />
          <div className="mt-6 grid grid-cols-3 divide-x divide-rule border-y border-ink">
            <Cell label={bookingCopy.labels.checkIn} value={stay.checkIn ? formatShort(stay.checkIn) : bookingCopy.placeholders.selectDate} onClick={openDates} />
            <Cell label={bookingCopy.labels.checkOut} value={stay.checkOut ? formatShort(stay.checkOut) : bookingCopy.placeholders.selectDate} onClick={openDates} />
            <Cell
              label={bookingCopy.labels.guests}
              value={guestLine(stay).replace(/, \d+ infants?$/, "")}
              onClick={() => setGuestsOpen((v) => !v)}
              expanded={guestsOpen}
              controls={guestsId}
            />
          </div>
          <div id={guestsId} hidden={!guestsOpen} className="pt-4">
            <GuestFields idPrefix="inline" value={stay} onChange={setStay} />
          </div>
          <div className="mt-5">
            <StayNote checkIn={stay.checkIn} checkOut={stay.checkOut} quote={quote} />
          </div>
          {/* Not a disabled control: before dates are chosen it opens the calendar, set as a secondary action. */}
          <button
            type="button"
            onClick={(e) => {
              if (ready) router.push(`/reserve?${stayToQuery(stay)}`);
              else openDates(e);
            }}
            className={
              ready
                ? `${primaryBtn} mt-6 h-14`
                : "btn btn-secondary mt-6 flex h-14 w-full"
            }
          >
            {ready ? "Request these dates" : bookingCopy.buttons.checkDates}
          </button>
          <p className="mt-4 font-serif text-small italic leading-snug text-ink-muted">No payment is taken now. The host confirms availability and sends an invoice.</p>
        </section>
      </div>
      <ReservationSheet open={sheetOpen} onClose={() => setSheetOpen(false)} returnFocusTo={triggerRef} />
    </div>
  );
}
