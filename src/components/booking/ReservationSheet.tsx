"use client";

/** Mobile reservation sheet (design-system 8.7): dates, guests, quote, primary action pinned at the bottom. */
import { useRouter } from "next/navigation";
import { siteConfig } from "@/content/site.config";
import { diffDays, formatClock } from "@/lib/booking/dates";
import { countedGuests } from "@/lib/booking/schemas";
import { DateRangeCalendar } from "./DateRangeCalendar";
import { Dialog } from "./Dialog";
import { GuestFields } from "./GuestFields";
import { QuoteLedger, useQuote } from "./QuoteLedger";
import { stayToQuery, useAvailability, useStay } from "./state";

export function ReservationSheet({
  open,
  onClose,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
  const [stay, setStay] = useStay();
  const avail = useAvailability();
  const router = useRouter();
  const quote = useQuote(stay.checkIn, stay.checkOut, countedGuests(stay));
  const ready = Boolean(stay.checkIn && stay.checkOut && quote && quote.meetsMinNights);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Your stay"
      variant="sheet"
      returnFocusTo={returnFocusTo}
      footer={
        <>
          <button
            type="button"
            disabled={!ready}
            aria-disabled={!ready || undefined}
            onClick={() => router.push(`/book?${stayToQuery(stay)}`)}
            className="flex h-12 w-full items-center justify-center bg-marsh px-6 text-body font-medium tracking-[0.01em] text-sheet transition-colors duration-[var(--duration-fast)] hover:bg-marsh-hover disabled:cursor-not-allowed disabled:bg-stone disabled:text-ink-faint"
          >
            {ready ? "Request these dates" : "Choose your dates"}
          </button>
          <p className="mt-2 text-caption text-ink-muted">No payment is taken now. The host confirms availability and sends an invoice.</p>
        </>
      }
    >
      <section aria-labelledby="sheet-dates">
        <h3 id="sheet-dates" className="text-label font-medium text-ink-muted">
          Dates
        </h3>
        <p className="mt-1 text-small text-ink-muted">
          Check-in {formatClock(siteConfig.times.checkIn)}. Check-out {formatClock(siteConfig.times.checkOut)}.
        </p>
        <DateRangeCalendar
          className="mt-4"
          months={1}
          selection={{ checkIn: stay.checkIn, checkOut: stay.checkOut }}
          onChange={(s) => setStay(s)}
          blocked={avail.blocked}
          today={avail.today}
          status={avail.status}
          complete={avail.complete}
        />
      </section>
      <section aria-labelledby="sheet-guests" className="mt-8">
        <h3 id="sheet-guests" className="mb-3 text-label font-medium text-ink-muted">
          Guests
        </h3>
        <GuestFields idPrefix="sheet" value={stay} onChange={setStay} />
      </section>
      <section aria-labelledby="sheet-quote" className="mt-8">
        <h3 id="sheet-quote" className="mb-3 text-label font-medium text-ink-muted">
          Estimate{stay.checkIn && stay.checkOut ? `, ${diffDays(stay.checkIn, stay.checkOut)} nights` : ""}
        </h3>
        <QuoteLedger quote={quote} compact />
      </section>
    </Dialog>
  );
}
