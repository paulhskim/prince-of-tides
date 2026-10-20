"use client";

/**
 * Compact reservation bar.
 *
 * Desktop (lg+): Arrive | Depart | Guests | estimate | "Request a stay" / "Request these dates". Arrive/Depart open a popover
 * calendar, Guests a popover stepper (aria-expanded, Esc and outside click close, focus returns).
 * The page decides where the bar sits (design-system 8.5: a row under the masthead once the cover
 * scrolls away).
 *
 * Mobile (below lg): renders the fixed bottom bar (design-system 8.6) and the reservation sheet. It
 * appears after the first screen of scrolling and hides while #reserve or the footer is on screen, and
 * on /reserve, /book and /booking pages. Being position: fixed, it works wherever ReservationBar is mounted, as
 * long as no ancestor sets transform/filter.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { booking as bookingCopy, reviewsSection } from "@/content/copy";
import { formatRangeCompact, formatShort, diffDays } from "@/lib/booking/dates";
import { countedGuests } from "@/lib/booking/schemas";
import { DateRangeCalendar } from "./DateRangeCalendar";
import { GuestFields, guestLine } from "./GuestFields";
import { useQuote } from "./QuoteLedger";
import { ReservationSheet } from "./ReservationSheet";
import { stayToQuery, useAvailability, useStay } from "./state";

const { overall, outOf, count } = reviewsSection.ratingSummary;
const ratingLine = `${overall} of ${outOf} from ${count} Vrbo reviews`;

const primarySm = "btn btn-primary min-h-11 shrink-0 px-5";

export function ReservationBar() {
  return (
    <>
      <DesktopBar />
      <MobileReservationBar />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop                                                             */
/* ------------------------------------------------------------------ */

function DesktopBar() {
  const [stay, setStay] = useStay();
  const avail = useAvailability();
  const router = useRouter();
  const quote = useQuote(stay.checkIn, stay.checkOut, countedGuests(stay));
  const [open, setOpen] = useState<null | "dates" | "guests">(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const datesBtn = useRef<HTMLButtonElement>(null);
  const guestsBtn = useRef<HTMLButtonElement>(null);
  const popId = useId();

  const close = useCallback((returnFocus = true) => {
    setOpen((current) => {
      if (returnFocus) (current === "guests" ? guestsBtn : datesBtn).current?.focus();
      return null;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) close(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const ready = Boolean(stay.checkIn && stay.checkOut && quote && quote.errors.length === 0);

  function requestToBook() {
    if (ready) {
      router.push(`/reserve?${stayToQuery(stay)}`);
      return;
    }
    const reserve = document.getElementById("reserve");
    if (reserve) {
      reserve.scrollIntoView({ block: "start" });
      reserve.querySelector<HTMLElement>('button[data-iso][tabindex="0"]')?.focus({ preventScroll: true });
    } else {
      router.push(`/reserve?${stayToQuery(stay)}`);
    }
  }

  const cell =
    "flex h-[4.5rem] min-w-44 flex-col items-start justify-center border-r border-rule px-6 text-left transition-colors duration-[var(--duration-fast)] hover:bg-stone/60 focus-visible:outline-offset-[-2px]";

  return (
    <div ref={rootRef} className="relative hidden lg:block" data-testid="reservation-bar">
      <div className="flex items-stretch border-y border-ink bg-sheet">
        <button ref={datesBtn} type="button" className={cell} aria-expanded={open === "dates"} aria-controls={`${popId}-dates`} onClick={() => setOpen(open === "dates" ? null : "dates")}>
          <span className="smallcaps text-ink-muted">{bookingCopy.labels.checkIn}</span>
          <span className="mt-1 font-serif text-[1.0625rem] text-ink tabular">{stay.checkIn ? formatShort(stay.checkIn) : bookingCopy.placeholders.selectDate}</span>
        </button>
        <button type="button" className={cell} aria-expanded={open === "dates"} aria-controls={`${popId}-dates`} onClick={() => setOpen(open === "dates" ? null : "dates")}>
          <span className="smallcaps text-ink-muted">{bookingCopy.labels.checkOut}</span>
          <span className="mt-1 font-serif text-[1.0625rem] text-ink tabular">{stay.checkOut ? formatShort(stay.checkOut) : bookingCopy.placeholders.selectDate}</span>
        </button>
        <button ref={guestsBtn} type="button" className={cell} aria-expanded={open === "guests"} aria-controls={`${popId}-guests`} onClick={() => setOpen(open === "guests" ? null : "guests")}>
          <span className="smallcaps text-ink-muted">{bookingCopy.labels.guests}</span>
          <span className="mt-1 font-serif text-[1.0625rem] text-ink tabular">{guestLine(stay)}</span>
        </button>
        <div className="flex flex-1 items-center justify-end gap-6 pl-5 pr-2">
          <p className="font-serif text-body italic text-ink-muted tabular" aria-live="polite">
            {ready && quote ? (
              <>
                {diffDays(stay.checkIn!, stay.checkOut!)} nights, <span className="not-italic text-ink">quote on the next page</span>
              </>
            ) : (
              "Add dates for your quote"
            )}
          </p>
          <button type="button" onClick={requestToBook} className={`${primarySm} min-h-14 px-8`}>
            {ready ? "Request these dates" : "Request a stay"}
          </button>
        </div>
      </div>

      {open === "dates" && (
        <div id={`${popId}-dates`} role="group" aria-label="Choose dates" className="absolute top-full left-0 z-40 mt-px w-[46rem] bg-sheet p-6 shadow-overlay">
          <DateRangeCalendar
            autoFocus
            months={2}
            selection={{ checkIn: stay.checkIn, checkOut: stay.checkOut }}
            onChange={(s) => setStay(s)}
            onEscape={() => close()}
            onComplete={() => {
              setOpen("guests");
              requestAnimationFrame(() => guestsBtn.current?.focus());
            }}
            blocked={avail.blocked}
            today={avail.today}
            status={avail.status}
            complete={avail.complete}
          />
        </div>
      )}
      {open === "guests" && (
        <div id={`${popId}-guests`} role="group" aria-label="Guests" className="absolute top-full left-72 z-40 mt-px w-96 bg-sheet p-6 shadow-overlay">
          <GuestFields idPrefix={`${popId}-g`} value={stay} onChange={setStay} />
          <button type="button" onClick={() => close()} className="link-caps mt-4">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile sticky bar                                                   */
/* ------------------------------------------------------------------ */

export function MobileReservationBar() {
  const [stay] = useStay();
  const pathname = usePathname();
  const quote = useQuote(stay.checkIn, stay.checkOut, countedGuests(stay));
  const [visible, setVisible] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  // Hidden on the reservation routes: /reserve, /book (redirects there) and /booking/*.
  const onBookingRoute = (pathname?.startsWith("/book") || pathname?.startsWith("/reserve")) ?? false;

  useEffect(() => {
    if (onBookingRoute) return;
    const covered = new Set<Element>();
    let scrolled = false;
    const update = () => setVisible(scrolled && covered.size === 0);
    const onScroll = () => {
      scrolled = window.scrollY > window.innerHeight * 0.6;
      update();
    };
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) covered.add(e.target);
        else covered.delete(e.target);
      }
      update();
    });
    for (const el of document.querySelectorAll("#reserve, footer")) io.observe(el);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [onBookingRoute]);

  if (onBookingRoute) return null;
  const ready = Boolean(stay.checkIn && stay.checkOut && quote && quote.errors.length === 0);

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-0 z-30 border-t border-rule-strong bg-sheet pb-[env(safe-area-inset-bottom)] transition-transform duration-[var(--duration-base)] ease-quiet lg:hidden ${visible ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
        aria-hidden={!visible || undefined}
        inert={!visible || undefined}
        data-testid="mobile-reservation-bar"
      >
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-gutter">
          <div className="min-w-0">
            {ready && quote ? (
              <>
                <p className="truncate text-small font-medium text-ink tabular">
                  {formatRangeCompact(stay.checkIn!, stay.checkOut!)}, {quote.nights} nights
                </p>
                <p className="text-caption text-ink-muted">Your quote is drawn up on the next page</p>
              </>
            ) : (
              <>
                <p className="text-small font-medium text-ink">Add dates for a quote</p>
                <p className="text-caption text-ink-muted">{ratingLine}</p>
              </>
            )}
          </div>
          <button ref={btnRef} type="button" onClick={() => setSheetOpen(true)} className={primarySm}>
            {ready ? "Request these dates" : "Request a stay"}
          </button>
        </div>
      </div>
      <ReservationSheet open={sheetOpen} onClose={() => setSheetOpen(false)} returnFocusTo={btnRef} />
    </>
  );
}
