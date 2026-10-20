"use client";

/**
 * Reservation ledger and request form.
 *
 * variant "inline" (home #reserve, ux-spec 2.14): calendar always open on desktop (cols 1 to 7), ledger
 *   on the right (cols 9 to 12, sticky). Below lg the calendar is not inlined: the ledger cells open the
 *   reservation sheet. "Request these dates" goes to /book with the stay in the query string.
 * variant "page" (/book, ux-spec 3.3): the full request form with a sticky ledger summary.
 *
 * Pricing is computeQuote() from site.config.ts; the server recomputes everything on submit.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import { policies } from "@/content/policies";
import { diffDays, formatClock, formatMoney, formatRangeCompact, formatShort } from "@/lib/booking/dates";
import { responseLine } from "@/lib/booking/owner-tokens";
import { ARRIVAL_TIMES, countedGuests, fieldErrors, inquirySchema } from "@/lib/booking/schemas";
import { DateRangeCalendar } from "./DateRangeCalendar";
import { Dialog } from "./Dialog";
import { Checkbox, SelectField, TextField, TextareaField } from "./fields";
import { GuestFields, guestLine } from "./GuestFields";
import { QuoteLedger, useQuote } from "./QuoteLedger";
import { ReservationSheet } from "./ReservationSheet";
import { stayToQuery, useAvailability, useStay, type Stay } from "./state";

const INSTANT = siteConfig.booking.mode === "instant" && siteConfig.features.stripeCheckout;

const primaryBtn =
  "flex w-full items-center justify-center bg-marsh px-6 text-body font-medium tracking-[0.01em] text-sheet transition-colors duration-[var(--duration-fast)] hover:bg-marsh-hover aria-disabled:cursor-not-allowed aria-disabled:bg-stone aria-disabled:text-ink-faint";
const textBtn =
  "min-h-11 text-small text-ink underline decoration-rule-strong underline-offset-[0.22em] transition-colors duration-[var(--duration-fast)] hover:decoration-ink";

export function ReservationForm({ variant = "inline" }: { variant?: "inline" | "page" }) {
  return variant === "page" ? <RequestPage /> : <InlineReservation />;
}

/* ------------------------------------------------------------------ */
/* Ledger header + cells (shared)                                      */
/* ------------------------------------------------------------------ */

function LedgerHead({ headingId }: { headingId: string }) {
  return (
    <>
      <p className="text-label text-ink-muted">Reservation</p>
      <h3 id={headingId} className="mt-1 font-serif text-h3">
        {siteConfig.brand.name}, Hilton Head Resort
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
      className="flex min-h-16 flex-col items-start justify-center px-3 py-2 text-left transition-colors duration-[var(--duration-fast)] first:pl-0 hover:bg-stone/60 focus-visible:outline-offset-[-2px]"
    >
      <span className="text-label text-ink-muted">{label}</span>
      <span className="mt-0.5 text-body text-ink tabular">{value}</span>
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
        <section aria-labelledby={headingId} className="border border-rule-strong bg-sheet p-6 lg:sticky lg:top-32 lg:p-8">
          <LedgerHead headingId={headingId} />
          <div className="mt-5 grid grid-cols-3 divide-x divide-rule border-y border-rule">
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
            <QuoteLedger quote={quote} compact />
          </div>
          {/* Not a disabled control: before dates are chosen it opens the calendar, set as a secondary action. */}
          <button
            type="button"
            onClick={(e) => {
              if (ready) router.push(`/book?${stayToQuery(stay)}`);
              else openDates(e);
            }}
            className={
              ready
                ? `${primaryBtn} mt-6 h-14`
                : "mt-6 flex h-14 w-full items-center justify-center border border-ink px-6 text-body font-medium text-ink transition-colors duration-[var(--duration-fast)] hover:bg-ink hover:text-paper"
            }
          >
            {ready ? "Request these dates" : bookingCopy.buttons.checkDates}
          </button>
          <p className="mt-3 text-caption text-ink-muted">No payment is taken now. The host confirms availability and sends an invoice.</p>
        </section>
      </div>
      <ReservationSheet open={sheetOpen} onClose={() => setSheetOpen(false)} returnFocusTo={triggerRef} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page (/book)                                                        */
/* ------------------------------------------------------------------ */

type Contact = {
  name: string;
  email: string;
  phone: string;
  arrivalTime: string;
  message: string;
  agreeRules: boolean;
  agree21: boolean;
  acceptAgreement: boolean;
  company: string;
};

const EMPTY_CONTACT: Contact = {
  name: "",
  email: "",
  phone: "",
  arrivalTime: "",
  message: "",
  agreeRules: false,
  agree21: false,
  acceptAgreement: false,
  company: "",
};

const FIELD_ORDER = ["dates", "adults", "children", "infants", "name", "email", "phone", "arrivalTime", "message", "agreeRules", "agree21", "acceptAgreement"];
const FIELD_LABEL: Record<string, string> = {
  dates: "Dates",
  checkIn: "Dates",
  checkOut: "Dates",
  adults: "Adults",
  children: "Guests",
  infants: "Infants",
  name: "Full name",
  email: "Email",
  phone: "Phone",
  arrivalTime: "Estimated arrival time",
  message: "Message to the host",
  agreeRules: "House rules",
  agree21: "Age",
  acceptAgreement: "Rental agreement",
};

function withFieldName(field: string, msg: string) {
  const name = FIELD_LABEL[field] ?? field;
  return msg.startsWith(`${name}:`) ? msg : `${name}: ${msg}`;
}

function RequestPage() {
  const [stay, setStay] = useStay();
  const avail = useAvailability();
  const router = useRouter();
  const quote = useQuote(stay.checkIn, stay.checkOut, countedGuests(stay));
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<{ field: string; message: string }[]>([]);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingDates, setEditingDates] = useState(false);
  // Once the guest picks dates here, keep the calendar open; it collapses only for prefilled dates.
  const [pickedHere, setPickedHere] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const datesRef = useRef<HTMLFieldSetElement>(null);
  const rulesLinkRef = useRef<HTMLAnchorElement>(null);
  const uid = useId();

  const hasDates = Boolean(stay.checkIn && stay.checkOut);
  const showCalendar = !hasDates || editingDates || pickedHere;

  const payload = useCallback(
    () => ({
      checkIn: stay.checkIn ?? "",
      checkOut: stay.checkOut ?? "",
      adults: stay.adults,
      children: stay.children,
      infants: stay.infants,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      arrivalTime: contact.arrivalTime,
      message: contact.message,
      agreeRules: contact.agreeRules,
      agree21: contact.agree21,
      company: contact.company,
      source: typeof document !== "undefined" ? document.referrer.slice(0, 300) || undefined : undefined,
      quotedTotal: quote && quote.errors.length === 0 ? quote.total : undefined,
    }),
    [stay, contact, quote],
  );

  /** Client validation: schema plus the stay rules the calendar enforces. */
  const validate = useCallback((): Record<string, string> => {
    const out: Record<string, string> = {};
    const parsed = inquirySchema.safeParse(payload());
    if (!parsed.success) {
      for (const [k, v] of Object.entries(fieldErrors(parsed.error))) {
        const key = k === "checkIn" || k === "checkOut" ? "dates" : k;
        if (!out[key]) out[key] = withFieldName(key, v);
      }
    }
    if (!hasDates) out.dates = withFieldName("dates", bookingCopy.validation.datesRequired);
    else if (quote && !quote.meetsMinNights) out.dates = withFieldName("dates", bookingCopy.minNightsMessage.replace("{{minNights}}", String(quote.minNightsRequired)));
    if (INSTANT && !contact.acceptAgreement) out.acceptAgreement = withFieldName("acceptAgreement", "Please accept the rental agreement to continue.");
    delete out.company;
    delete out.quotedTotal;
    delete out.source;
    return out;
  }, [payload, hasDates, quote, contact.acceptAgreement]);

  // Re-validate touched fields as values change, so fixed errors clear.
  useEffect(() => {
    if (!Object.keys(touched).length) return;
    const all = validate();
    const next = Object.fromEntries(Object.entries(all).filter(([k]) => touched[k]));
    setErrors((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [validate, touched]);

  const blur = (field: string) => () => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const set = <K extends keyof Contact>(k: K) => (v: Contact[K]) => setContact((c) => ({ ...c, [k]: v }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormMessage(null);
    const all = validate();
    setTouched(Object.fromEntries(FIELD_ORDER.map((f) => [f, true])));
    setErrors(all);
    const list = FIELD_ORDER.filter((f) => all[f]).map((f) => ({ field: f, message: all[f] }));
    setSummary(list);
    if (list.length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSubmitting(true);
    try {
      const body = payload();
      let res: Response | null = null;
      if (INSTANT) {
        res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...body, acceptAgreement: contact.acceptAgreement }),
        });
        if (res.ok) {
          const data = (await res.json()) as { url?: string };
          if (data.url) {
            window.location.assign(data.url);
            return;
          }
        }
        // 404 (Stripe not configured) or 503 (availability unknown): fall back to a request.
        if (res.status !== 404 && res.status !== 503 && res.status !== 502) {
          await handleError(res);
          return;
        }
      }
      res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string; quote: { total: number } };
        try {
          sessionStorage.setItem(
            `pot:request:${data.id}`,
            JSON.stringify({
              id: data.id,
              name: body.name,
              email: body.email,
              checkIn: body.checkIn,
              checkOut: body.checkOut,
              adults: body.adults,
              children: body.children,
              infants: body.infants,
              total: data.quote.total,
            }),
          );
        } catch {
          // Storage unavailable: the success page reads the stored request instead.
        }
        router.push(`/booking/success?id=${encodeURIComponent(data.id)}`);
        return;
      }
      await handleError(res);
    } catch {
      setFormMessage(`${bookingCopy.failure.title} ${bookingCopy.failure.body}`);
      requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setSubmitting(false);
    }
  }

  async function handleError(res: Response) {
    let data: { message?: string; fields?: Record<string, string>; error?: string } = {};
    try {
      data = await res.json();
    } catch {
      // non-JSON error
    }
    if (data.fields) {
      const mapped: Record<string, string> = {};
      for (const [k, v] of Object.entries(data.fields)) {
        const key = k === "checkIn" || k === "checkOut" ? "dates" : k;
        mapped[key] = withFieldName(key, v);
      }
      setErrors(mapped);
      setSummary(FIELD_ORDER.filter((f) => mapped[f]).map((f) => ({ field: f, message: mapped[f] })));
    } else if (data.error === "unavailable" || data.error === "rules") {
      const msg = withFieldName("dates", data.message ?? bookingCopy.unavailableDatesMessage);
      setErrors({ dates: msg });
      setSummary([{ field: "dates", message: msg }]);
      setEditingDates(true);
    } else {
      setFormMessage(data.message ?? `${bookingCopy.failure.title} ${bookingCopy.failure.body}`);
    }
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  function focusField(field: string) {
    if (field === "dates") {
      setEditingDates(true);
      requestAnimationFrame(() => {
        datesRef.current?.scrollIntoView({ block: "start" });
        datesRef.current?.querySelector<HTMLElement>('button[data-iso][tabindex="0"], button')?.focus();
      });
      return;
    }
    const id = field === "adults" || field === "children" || field === "infants" ? `${uid}-guests` : `${uid}-${field}`;
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "center" });
    (el?.matches("input,select,textarea,button") ? el : el?.querySelector<HTMLElement>("button"))?.focus();
  }

  const nights = hasDates ? diffDays(stay.checkIn!, stay.checkOut!) : 0;
  const estimate = quote && quote.errors.length === 0 ? formatMoney(quote.total) : null;

  return (
    <div className="grid grid-cols-4 gap-x-col md:grid-cols-8 lg:grid-cols-12">
      {/* Mobile summary row (ux-spec 3.3) */}
      <div className="col-span-4 mb-8 flex items-center justify-between gap-4 border-y border-rule py-3 md:col-span-8 lg:hidden">
        <p className="text-small text-ink tabular" aria-live="polite">
          {hasDates ? `${formatRangeCompact(stay.checkIn!, stay.checkOut!)}, ${guestLine(stay)}${estimate ? `, est. ${estimate}` : ""}` : "Add your dates for an estimated total."}
        </p>
        <button type="button" className={textBtn} onClick={() => focusField("dates")} aria-label="Edit dates">
          Edit
        </button>
      </div>

      <form noValidate onSubmit={onSubmit} className="col-span-4 md:col-span-8 lg:col-span-7" aria-describedby={`${uid}-intro`} data-testid="request-form">
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className={summary.length || formMessage ? "mb-8 border-t border-danger pt-4 focus:outline-none" : "sr-only"}
        >
          {formMessage && <p className="text-small text-danger">{formMessage}</p>}
          {summary.length > 0 && (
            <>
              <h2 className="text-body font-medium text-danger">
                {summary.length === 1 ? "One thing to fix before sending" : `${summary.length} things to fix before sending`}
              </h2>
              <ul className="mt-2 space-y-1">
                {summary.map((s) => (
                  <li key={s.field}>
                    <a
                      href={`#${uid}-${s.field}`}
                      onClick={(e) => {
                        e.preventDefault();
                        focusField(s.field);
                      }}
                      className="text-small text-danger decoration-danger"
                    >
                      {s.message}
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <p id={`${uid}-intro`} className="text-small text-ink-muted">
          All fields are required unless marked optional.
        </p>

        {/* 1. Dates */}
        <fieldset ref={datesRef} id={`${uid}-dates`} className="mt-8 border-t border-ink pt-5" aria-describedby={errors.dates ? `${uid}-dates-error` : undefined}>
          <legend className="float-left w-full"><h2 className="font-serif text-h3"><span aria-hidden="true" className="mr-3 inline-block min-w-[1.5ch] align-top mt-[0.45em] font-serif text-[0.9375rem] leading-none text-ink-muted">1</span>Your dates</h2></legend>
          <p className="clear-both pt-1 text-small text-ink-muted">
            Check-in {formatClock(siteConfig.times.checkIn)}. Check-out {formatClock(siteConfig.times.checkOut)}.
          </p>
          {showCalendar ? (
            <DateRangeCalendar
              className="mt-5"
              selection={{ checkIn: stay.checkIn, checkOut: stay.checkOut }}
              onChange={(s) => {
                setStay(s);
                setPickedHere(true);
                setTouched((t) => ({ ...t, dates: true }));
              }}
              blocked={avail.blocked}
              today={avail.today}
              status={avail.status}
              complete={avail.complete}
            />
          ) : (
            <div className="mt-5">
              <dl className="grid grid-cols-3 divide-x divide-rule border-y border-rule">
                {[
                  [bookingCopy.labels.checkIn, formatShort(stay.checkIn!)],
                  [bookingCopy.labels.checkOut, formatShort(stay.checkOut!)],
                  ["Nights", String(nights)],
                ].map(([k, v]) => (
                  <div key={k} className="px-3 py-3 first:pl-0">
                    <dt className="text-label text-ink-muted">{k}</dt>
                    <dd className="mt-0.5 text-body tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              <button type="button" className={`${textBtn} mt-1`} onClick={() => setEditingDates(true)} data-testid="change-dates">
                {bookingCopy.buttons.edit}
              </button>
            </div>
          )}
          {errors.dates && (
            <p id={`${uid}-dates-error`} className="mt-2 text-small text-danger">
              {errors.dates}
            </p>
          )}
          {showCalendar && hasDates && (editingDates || pickedHere) && (
            <button
              type="button"
              className={`${textBtn} mt-2`}
              onClick={() => {
                setEditingDates(false);
                setPickedHere(false);
              }}
            >
              Done
            </button>
          )}
        </fieldset>

        {/* 2. Guests */}
        <fieldset id={`${uid}-guests`} className="mt-12 border-t border-ink pt-5" aria-describedby={errors.children ? `${uid}-guests-error` : undefined}>
          <legend className="float-left w-full"><h2 className="font-serif text-h3"><span aria-hidden="true" className="mr-3 inline-block min-w-[1.5ch] align-top mt-[0.45em] font-serif text-[0.9375rem] leading-none text-ink-muted">2</span>Guests</h2></legend>
          <div className="clear-both pt-4">
            <GuestFields idPrefix={`${uid}-g`} value={stay} onChange={setStay} />
          </div>
          {errors.children && (
            <p id={`${uid}-guests-error`} className="mt-2 text-small text-danger">
              {errors.children}
            </p>
          )}
        </fieldset>

        {/* 3. Contact */}
        <fieldset className="mt-12 border-t border-ink pt-5">
          <legend className="float-left w-full"><h2 className="font-serif text-h3"><span aria-hidden="true" className="mr-3 inline-block min-w-[1.5ch] align-top mt-[0.45em] font-serif text-[0.9375rem] leading-none text-ink-muted">3</span>Your details</h2></legend>
          <div className="clear-both max-w-measure space-y-6 pt-5">
            <TextField
              id={`${uid}-name`}
              label="Full name"
              autoComplete="name"
              value={contact.name}
              onChange={(e) => set("name")(e.target.value)}
              onBlur={blur("name")}
              error={errors.name}
            />
            <TextField
              id={`${uid}-email`}
              label={bookingCopy.labels.email}
              type="email"
              autoComplete="email"
              inputMode="email"
              value={contact.email}
              onChange={(e) => set("email")(e.target.value)}
              onBlur={blur("email")}
              help={bookingCopy.helperText.email}
              error={errors.email}
            />
            <TextField
              id={`${uid}-phone`}
              label={bookingCopy.labels.phone}
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              value={contact.phone}
              onChange={(e) => set("phone")(e.target.value)}
              onBlur={blur("phone")}
              help="For arrival-day questions only."
              error={errors.phone}
            />
          </div>
        </fieldset>

        {/* 4. Arrival and note */}
        <fieldset className="mt-12 border-t border-ink pt-5">
          <legend className="float-left w-full"><h2 className="font-serif text-h3"><span aria-hidden="true" className="mr-3 inline-block min-w-[1.5ch] align-top mt-[0.45em] font-serif text-[0.9375rem] leading-none text-ink-muted">4</span>Arrival and a note</h2></legend>
          <div className="clear-both max-w-measure space-y-6 pt-5">
            <SelectField
              id={`${uid}-arrivalTime`}
              label="Estimated arrival time"
              optional
              options={ARRIVAL_TIMES}
              value={contact.arrivalTime}
              onChange={(e) => set("arrivalTime")(e.target.value)}
              help={
                contact.arrivalTime === "I would like to ask about early check-in"
                  ? `Check-in is ${formatClock(siteConfig.times.checkIn)}. Early check-in is confirmed only when the calendar allows; mention it in your note and we will reply with what is possible, including where to leave luggage.`
                  : undefined
              }
            />
            <TextareaField
              id={`${uid}-message`}
              label="Message to the host"
              optional
              maxLength={1000}
              value={contact.message}
              onChange={(e) => set("message")(e.target.value)}
              onBlur={blur("message")}
              placeholder={bookingCopy.placeholders.message}
              error={errors.message}
            />
          </div>
        </fieldset>

        {/* 5. Consent */}
        <fieldset className="mt-12 border-t border-ink pt-5">
          <legend className="sr-only">Agreements</legend>
          <div className="max-w-measure space-y-2">
            <Checkbox id={`${uid}-agreeRules`} checked={contact.agreeRules} onChange={set("agreeRules")} onBlur={blur("agreeRules")} error={errors.agreeRules}>
              I have read and agree to the{" "}
              <Link
                ref={rulesLinkRef}
                href="/policies#house-rules"
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  setRulesOpen(true);
                }}
                aria-haspopup="dialog"
              >
                house rules
              </Link>
              .
            </Checkbox>
            <Checkbox id={`${uid}-agree21`} checked={contact.agree21} onChange={set("agree21")} onBlur={blur("agree21")} error={errors.agree21}>
              I am 21 or older and will be on the reservation.
            </Checkbox>
            {INSTANT && (
              <Checkbox id={`${uid}-acceptAgreement`} checked={contact.acceptAgreement} onChange={set("acceptAgreement")} error={errors.acceptAgreement}>
                I accept the rental agreement, including the <Link href="/policies#cancellation">cancellation policy</Link>.
              </Checkbox>
            )}
          </div>
        </fieldset>

        {/* Honeypot: hidden from people and assistive tech. */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" value={contact.company} onChange={(e) => set("company")(e.target.value)} />
        </div>

        <div className="mt-10 max-w-measure">
          <button type="submit" aria-busy={submitting || undefined} aria-disabled={submitting || undefined} className={`${primaryBtn} h-14 sm:w-auto sm:px-8`}>
            {submitting ? (INSTANT ? "Opening payment" : "Sending request") : INSTANT ? "Continue to payment" : bookingCopy.buttons.submit}
          </button>
          <p className="mt-3 text-small text-ink-muted">{INSTANT ? "You pay on the next page. Nothing is charged until you confirm there." : responseLine()}</p>
        </div>
      </form>

      {/* Ledger summary (desktop) */}
      <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block" aria-labelledby={`${uid}-ledger`}>
        <div className="sticky top-24 border border-rule-strong bg-sheet p-8">
          <LedgerHead headingId={`${uid}-ledger`} />
          <dl className="mt-5 grid grid-cols-3 divide-x divide-rule border-y border-rule">
            {[
              [bookingCopy.labels.checkIn, stay.checkIn ? formatShort(stay.checkIn) : "Not set"],
              [bookingCopy.labels.checkOut, stay.checkOut ? formatShort(stay.checkOut) : "Not set"],
              [bookingCopy.labels.guests, guestLine(stay).replace(/, \d+ infants?$/, "")],
            ].map(([k, v]) => (
              <div key={k} className="px-3 py-3 first:pl-0">
                <dt className="text-label text-ink-muted">{k}</dt>
                <dd className="mt-0.5 text-body tabular">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5">
            <QuoteLedger quote={quote} />
          </div>
          <button type="button" className={`${textBtn} mt-2`} onClick={() => focusField("dates")}>
            {bookingCopy.buttons.edit}
          </button>
        </div>
      </aside>

      <Dialog open={rulesOpen} onClose={() => setRulesOpen(false)} title={bookingCopy.policiesHeading} returnFocusTo={rulesLinkRef}>
        <ol className="list-decimal space-y-3 pl-5 text-body marker:text-small marker:text-ink-muted">
          {policies.houseRules.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p className="mt-6 text-small">
          <Link href="/policies#house-rules" target="_blank" rel="noopener">
            Open all policies in a new tab
          </Link>
        </p>
      </Dialog>
    </div>
  );
}
