"use client";

/**
 * /reserve: the reservation page. One page, five steps, a progress index beside them:
 *   I Dates (calendar with the nightly rate on each date, seasonal rate card below)
 *   II Guests  III Your stay (folio, payment schedule, cancellation dates)
 *   IV Your details  V Review and request
 * The stay lives in the URL (useStay), so it is shareable and survives refresh. "Request this
 * reservation" posts to /api/inquiry, which revalidates and recomputes the quote on the server; the
 * confirmation view then shows the server's quote.
 *
 * No payment happens here and no card details are ever asked for. The payment panel on the
 * confirmation is a preview of what the host's secure link will ask for once the dates are confirmed.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { siteConfig, type Quote } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import { policies } from "@/content/policies";
import { formatClock, formatMoney, formatRangeCompact, formatShort, formatShortYear } from "@/lib/booking/dates";
import { ARRIVAL_TIMES, countedGuests, fieldErrors, inquirySchema } from "@/lib/booking/schemas";
import { guestSummary } from "@/lib/booking/guest-summary";
import { nightsOf, paymentSchedule } from "@/lib/booking/reserve";
import { DateRangeCalendar } from "@/components/booking/DateRangeCalendar";
import { Dialog } from "@/components/booking/Dialog";
import { Checkbox, SelectField, TextField, TextareaField } from "@/components/booking/fields";
import { GuestFields, guestLine } from "@/components/booking/GuestFields";
import { useQuote } from "@/components/booking/QuoteLedger";
import { useAvailability, useStay } from "@/components/booking/state";
import { RunningHead } from "@/components/site/layout";
import { Folio, StayTerms } from "./Folio";
import { RateCard } from "./RateCard";
import { Confirmation, type ConfirmationData } from "./Confirmation";

/* ------------------------------------------------------------------ */
/* Contact fields and validation (same rules as the server)            */
/* ------------------------------------------------------------------ */

type Contact = {
  name: string;
  email: string;
  phone: string;
  arrivalTime: string;
  message: string;
  agreeRules: boolean;
  agree21: boolean;
  company: string;
};

const EMPTY_CONTACT: Contact = { name: "", email: "", phone: "", arrivalTime: "", message: "", agreeRules: false, agree21: false, company: "" };

const FIELD_ORDER = ["dates", "adults", "children", "infants", "name", "email", "phone", "arrivalTime", "message", "agreeRules", "agree21"];
const FIELD_LABEL: Record<string, string> = {
  dates: "Dates",
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
};
const CONTACT_FIELDS = ["name", "email", "phone", "arrivalTime", "message", "agreeRules", "agree21"];

function withFieldName(field: string, msg: string) {
  const name = FIELD_LABEL[field] ?? field;
  return msg.startsWith(`${name}:`) ? msg : `${name}: ${msg}`;
}

const STORAGE_PREFIX = "pot:reserve:";

/* ------------------------------------------------------------------ */
/* Steps                                                               */
/* ------------------------------------------------------------------ */

const STEPS = [
  { id: "dates", numeral: "I", label: "Dates" },
  { id: "guests", numeral: "II", label: "Guests" },
  { id: "stay", numeral: "III", label: "Your stay" },
  { id: "details", numeral: "IV", label: "Your details" },
  { id: "review", numeral: "V", label: "Review and request" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

function StepHeading({ id, numeral, children, aside }: { id: string; numeral: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-ink pt-5">
      <h2 id={`${id}-title`} className="font-serif text-[clamp(1.75rem,1.35rem+1.3vw,2.5rem)] font-light leading-tight tracking-[-0.02em]">
        <span aria-hidden="true" className="mr-3 inline-block min-w-[2.2ch] align-top mt-[0.55em] font-serif text-[0.9375rem] italic leading-none text-brass">
          {numeral}
        </span>
        {children}
      </h2>
      {aside ? <div className="smallcaps text-ink-muted">{aside}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export function ReserveFlow() {
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);

  // The confirmation URL (/reserve?confirmed=ID) shows it again from this browser's session copy, on
  // refresh and on Forward; Back to the form URL shows the request as it was filled in.
  useEffect(() => {
    const sync = () => {
      const id = new URLSearchParams(window.location.search).get("confirmed");
      let data: ConfirmationData | null = null;
      if (id) {
        try {
          const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`);
          const parsed = raw ? (JSON.parse(raw) as ConfirmationData) : null;
          data = parsed && parsed.id === id ? parsed : null;
        } catch {
          data = null;
        }
      }
      setConfirmation(data);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  return (
    <>
      {confirmation && <Confirmation key={confirmation.id} data={confirmation} />}
      {/* Kept mounted (hidden) under the confirmation, so Back returns to the filled request. */}
      <div hidden={Boolean(confirmation)}>
        <Flow onConfirmed={setConfirmation} />
      </div>
    </>
  );
}

function Flow({ onConfirmed }: { onConfirmed: (d: ConfirmationData) => void }) {
  const [stay, setStay] = useStay();
  const avail = useAvailability();
  const quote = useQuote(stay.checkIn, stay.checkOut, countedGuests(stay));
  const [contact, setContact] = useState<Contact>(EMPTY_CONTACT);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<{ field: string; message: string }[]>([]);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const rulesLinkRef = useRef<HTMLAnchorElement>(null);
  const uid = useId();

  const hasDates = Boolean(stay.checkIn && stay.checkOut);
  const stayReady = Boolean(hasDates && quote && quote.errors.length === 0 && quote.meetsMinNights);
  const nights = nightsOf(stay.checkIn, stay.checkOut);
  const today = avail.today;

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
    delete out.company;
    delete out.quotedTotal;
    delete out.source;
    return out;
  }, [payload, hasDates, quote]);

  useEffect(() => {
    if (!Object.keys(touched).length) return;
    const all = validate();
    const next = Object.fromEntries(Object.entries(all).filter(([k]) => touched[k]));
    setErrors((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [validate, touched]);

  const blur = (field: string) => () => setTouched((t) => (t[field] ? t : { ...t, [field]: true }));
  const set = <K extends keyof Contact>(k: K) => (v: Contact[K]) => setContact((c) => ({ ...c, [k]: v }));

  const contactDone = CONTACT_FIELDS.every((f) => !validate()[f]);
  const done: Record<StepId, boolean> = {
    dates: stayReady,
    guests: stayReady,
    stay: stayReady,
    details: contactDone,
    review: false,
  };
  const current: StepId = STEPS.find((s) => !done[s.id])?.id ?? "review";

  function focusField(field: string) {
    if (field === "dates") {
      const root = document.getElementById("dates");
      root?.scrollIntoView({ block: "start" });
      root?.querySelector<HTMLElement>('button[data-iso][tabindex="0"]')?.focus({ preventScroll: true });
      return;
    }
    const id = field === "adults" || field === "children" || field === "infants" ? "guests" : `${uid}-${field}`;
    const el = document.getElementById(id);
    el?.scrollIntoView({ block: "center" });
    (el?.matches("input,select,textarea,button") ? el : el?.querySelector<HTMLElement>("button"))?.focus({ preventScroll: true });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
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
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = (await res.json()) as { id: string; quote: Quote };
        const conf: ConfirmationData = {
          id: data.id,
          name: body.name,
          email: body.email,
          checkIn: body.checkIn,
          checkOut: body.checkOut,
          adults: body.adults,
          children: body.children,
          infants: body.infants,
          quote: data.quote,
          requestedOn: today,
        };
        try {
          sessionStorage.setItem(`${STORAGE_PREFIX}${data.id}`, JSON.stringify(conf));
          // The /booking/success page reads this shape.
          sessionStorage.setItem(
            `pot:request:${data.id}`,
            JSON.stringify({ id: data.id, name: body.name, email: body.email, checkIn: body.checkIn, checkOut: body.checkOut, adults: body.adults, children: body.children, infants: body.infants, total: data.quote.total }),
          );
        } catch {
          // Storage unavailable: the confirmation still shows now.
        }
        // A new history entry, so Back returns to the filled request rather than leaving the page.
        window.history.pushState(null, "", `/reserve?confirmed=${encodeURIComponent(data.id)}`);
        onConfirmed(conf);
        window.scrollTo({ top: 0 });
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
    } else {
      setFormMessage(data.message ?? `${bookingCopy.failure.title} ${bookingCopy.failure.body}`);
    }
    requestAnimationFrame(() => summaryRef.current?.focus());
  }

  const pay = stayReady && quote && stay.checkIn ? paymentSchedule(quote.total, stay.checkIn, today) : null;

  return (
    <>
      <header className="pb-10 pt-6 lg:pb-14 lg:pt-8">
        <div className="mx-auto max-w-page px-gutter">
          <RunningHead left="Reservations" right="Nothing is charged today" />
          <div className="mt-[clamp(1.75rem,1rem+2.4vw,3.25rem)] grid grid-cols-4 gap-x-col gap-y-6 md:grid-cols-8 lg:grid-cols-12">
            <h1 className="display-cut col-span-4 text-h1 md:col-span-8 lg:col-span-7">Reserve your stay</h1>
            <p className="col-span-4 max-w-measure font-serif text-lead oldstyle md:col-span-7 lg:col-span-4 lg:col-start-9 lg:self-end">
              Every night priced on the calendar, every tax itemized, the payment and cancellation dates set out. Send it as a request; the host confirms before anything is paid.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-page px-gutter pb-section">
        <div className="grid grid-cols-4 gap-x-col md:grid-cols-8 lg:grid-cols-12">
          {/* Progress, mobile and tablet */}
          <nav aria-label="Reservation steps" className="col-span-4 mb-10 md:col-span-8 lg:hidden">
            <Progress done={done} current={current} compact />
          </nav>

          <form
            noValidate
            onSubmit={onSubmit}
            className="col-span-4 md:col-span-8 lg:col-span-8"
            aria-describedby={`${uid}-intro`}
            data-testid="request-form"
          >
            <p id={`${uid}-intro`} className="sr-only">
              Five steps. All fields are required unless marked optional.
            </p>

            {/* I. Dates */}
            <section id="dates" aria-labelledby="dates-title" className="scroll-mt-28">
              <StepHeading id="dates" numeral="I" aside={hasDates ? `${formatRangeCompact(stay.checkIn!, stay.checkOut!)}, ${nights} ${nights === 1 ? "night" : "nights"}` : "Choose arrival, then departure"}>
                Dates
              </StepHeading>
              <p className="mt-3 max-w-measure text-small text-ink-muted">
                Check-in {formatClock(siteConfig.times.checkIn)}, check-out {formatClock(siteConfig.times.checkOut)}. The figure under each date is that night&rsquo;s rate.
              </p>
              <DateRangeCalendar
                className="mt-6"
                showRates
                selection={{ checkIn: stay.checkIn, checkOut: stay.checkOut }}
                onChange={(s) => {
                  setStay(s);
                  setTouched((t) => ({ ...t, dates: true }));
                }}
                blocked={avail.blocked}
                today={avail.today}
                status={avail.status}
                complete={avail.complete}
              />
              {errors.dates && (
                <p id={`${uid}-dates-error`} className="mt-2 text-small text-danger">
                  {errors.dates}
                </p>
              )}
              <div className="mt-12">
                <RateCard id="reserve-rates" />
              </div>
            </section>

            {/* II. Guests */}
            <section id="guests" aria-labelledby="guests-title" className="mt-section-sm scroll-mt-28">
              <StepHeading id="guests" numeral="II" aside={guestLine(stay)}>
                Guests
              </StepHeading>
              <div className="mt-5 max-w-xl">
                <GuestFields idPrefix={`${uid}-g`} value={stay} onChange={setStay} />
              </div>
              {errors.children && <p className="mt-2 text-small text-danger">{errors.children}</p>}
            </section>

            {/* III. Your stay */}
            <section id="stay" aria-labelledby="stay-title" className="mt-section-sm scroll-mt-28" aria-live="polite">
              <StepHeading id="stay" numeral="III" aside={quote && stayReady ? `${formatMoney(quote.total)} total` : undefined}>
                Your stay
              </StepHeading>
              {stayReady && quote && stay.checkIn ? (
                <div className="mt-6 space-y-12">
                  <Folio quote={quote} />
                  <StayTerms total={quote.total} checkIn={stay.checkIn} today={today} />
                </div>
              ) : (
                <p className="mt-5 max-w-measure font-serif text-prose text-ink-muted" data-testid="stay-empty">
                  {hasDates && quote && !quote.meetsMinNights
                    ? bookingCopy.minNightsMessage.replace("{{minNights}}", String(quote.minNightsRequired))
                    : "Choose your arrival and departure above. The folio appears here: every night and its rate, the cleaning fee, each tax with its rate, the payment schedule and the cancellation dates."}
                </p>
              )}
            </section>

            {/* IV. Your details */}
            <section id="details" aria-labelledby="details-title" className="mt-section-sm scroll-mt-28">
              <StepHeading id="details" numeral="IV" aside="All fields required unless marked optional">
                Your details
              </StepHeading>
              <div className="mt-6 grid max-w-2xl gap-x-col gap-y-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <TextField id={`${uid}-name`} label="Full name" autoComplete="name" value={contact.name} onChange={(e) => set("name")(e.target.value)} onBlur={blur("name")} error={errors.name} />
                </div>
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
                <div className="md:col-span-2">
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
                </div>
                <div className="md:col-span-2">
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
              </div>

              <fieldset className="mt-8 max-w-2xl border-t border-rule pt-4">
                <legend className="smallcaps float-left w-full pt-1 text-ink-muted">Agreements</legend>
                <div className="clear-both space-y-1 pt-2">
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
                </div>
                <p className="mt-3 text-caption text-ink-muted">
                  The <Link href="/policies#cancellation">cancellation policy</Link> and payment schedule above are part of the rental agreement the host sends with the confirmation.
                </p>
              </fieldset>

              {/* Honeypot: hidden from people and assistive tech. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor={`${uid}-company`}>Company</label>
                <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" value={contact.company} onChange={(e) => set("company")(e.target.value)} />
              </div>
            </section>

            {/* V. Review and request */}
            <section id="review" aria-labelledby="review-title" className="mt-section-sm scroll-mt-28">
              <StepHeading id="review" numeral="V">
                Review and request
              </StepHeading>

              <div
                ref={summaryRef}
                tabIndex={-1}
                role="alert"
                className={summary.length || formMessage ? "mt-6 border-t-2 border-danger pt-4 focus:outline-none" : "sr-only"}
              >
                {formMessage && <p className="text-small text-danger">{formMessage}</p>}
                {summary.length > 0 && (
                  <>
                    <h3 className="text-body font-medium text-danger">
                      {summary.length === 1 ? "One thing to settle before sending" : `${summary.length} things to settle before sending`}
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {summary.map((s) => (
                        <li key={s.field}>
                          <a
                            href={s.field === "dates" ? "#dates" : `#${uid}-${s.field}`}
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

              <div className="mt-6 border-t-2 border-ink bg-sheet p-6 shadow-[inset_0_0_0_1px_var(--color-rule)] md:p-9" data-testid="review-card">
                <p className="smallcaps flex items-center justify-between text-ink-muted">
                  <span>Reservation request</span>
                  <span className="text-brass">{siteConfig.brand.name}</span>
                </p>
                <dl className="mt-5 grid grid-cols-2 border-y border-ink text-small md:grid-cols-4">
                  {[
                    [bookingCopy.labels.checkIn, stay.checkIn ? formatShortYear(stay.checkIn) : "Not chosen"],
                    [bookingCopy.labels.checkOut, stay.checkOut ? formatShortYear(stay.checkOut) : "Not chosen"],
                    ["Nights", nights ? String(nights) : "None"],
                    [bookingCopy.labels.guests, guestSummary(stay)],
                  ].map(([k, v], i) => (
                    <div key={k} className={`border-rule py-3.5 pr-3 ${i % 2 ? "border-l pl-3" : ""} ${i === 2 ? "md:border-l md:pl-3" : ""} ${i > 1 ? "border-t md:border-t-0" : ""}`}>
                      <dt className="smallcaps text-ink-muted">{k}</dt>
                      <dd className="mt-1.5 font-serif text-[1.0625rem] leading-tight tabular">{v}</dd>
                    </div>
                  ))}
                </dl>
                <dl className="mt-1 text-small">
                  <div className="flex justify-between gap-4 border-b border-rule py-3">
                    <dt className="text-ink-muted">Guest</dt>
                    <dd className="text-right break-all">{contact.name || contact.email ? [contact.name, contact.email].filter(Boolean).join(", ") : <span className="text-ink-muted">Add your details above</span>}</dd>
                  </div>
                  {pay && (
                    <>
                      <div className="flex justify-between gap-4 border-b border-rule py-3">
                        <dt className="text-ink-muted">{pay.fullAtConfirmation ? "Due at confirmation" : `Deposit at confirmation, ${pay.depositPct}%`}</dt>
                        <dd className="tabular">{formatMoney(pay.deposit)}</dd>
                      </div>
                      {pay.balanceDue && (
                        <div className="flex justify-between gap-4 border-b border-rule py-3">
                          <dt className="text-ink-muted">Balance due {formatShort(pay.balanceDue)}</dt>
                          <dd className="tabular">{formatMoney(pay.balance)}</dd>
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex items-baseline justify-between gap-4 pt-4">
                    <dt className="smallcaps text-ink">Total{quote?.isPlaceholder ? ", estimated" : ""}</dt>
                    <dd className="font-serif text-[2.25rem] font-light leading-none tracking-[-0.02em] tabular" data-testid="review-total">
                      {stayReady && quote ? formatMoney(quote.total) : "Choose dates"}
                    </dd>
                  </div>
                </dl>

                <button
                  type="submit"
                  aria-busy={submitting || undefined}
                  aria-disabled={submitting || undefined}
                  className="btn btn-primary mt-8 flex h-14 w-full aria-disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending request" : "Request this reservation"}
                </button>
                <p className="mt-4 font-serif text-small italic leading-snug text-ink-muted">
                  Nothing is charged today. The host confirms your dates within {siteConfig.contact.responseTimeHours} hours, then sends the rental agreement and a secure
                  payment link for the deposit.
                </p>
              </div>
            </section>
          </form>

          {/* Progress and running summary, desktop */}
          <aside className="hidden lg:col-span-4 lg:col-start-9 lg:block" aria-label="Reservation summary">
            <div className="sticky top-24 border-t-2 border-ink bg-sheet p-8 shadow-[inset_0_0_0_1px_var(--color-rule)]" data-testid="reserve-summary">
              <p className="smallcaps flex items-center justify-between text-ink-muted">
                <span>Reservation</span>
                <span className="text-brass">Hilton Head Resort</span>
              </p>
              <p className="mt-3 font-serif text-[1.75rem] font-light leading-none tracking-[-0.02em]">{siteConfig.brand.name}</p>
              <dl className="mt-5 grid grid-cols-3 divide-x divide-rule border-y border-ink">
                {[
                  [bookingCopy.labels.checkIn, stay.checkIn ? formatShort(stay.checkIn) : "Not set"],
                  [bookingCopy.labels.checkOut, stay.checkOut ? formatShort(stay.checkOut) : "Not set"],
                  [bookingCopy.labels.guests, String(countedGuests(stay))],
                ].map(([k, v]) => (
                  <div key={k} className="px-3 py-3 first:pl-0">
                    <dt className="smallcaps text-ink-muted">{k}</dt>
                    <dd className="mt-1 font-serif text-[1.0625rem] leading-tight tabular">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-baseline justify-between gap-4 pt-4">
                <p className="smallcaps text-ink">{quote?.isPlaceholder ? "Estimated total" : "Total"}</p>
                <p className="font-serif text-[1.875rem] font-light leading-none tracking-[-0.02em] tabular" data-testid="summary-total" aria-live="polite">
                  {stayReady && quote ? formatMoney(quote.total) : "None yet"}
                </p>
              </div>
              {stayReady && quote && (
                <p className="mt-2 text-right text-caption text-ink-muted tabular">
                  {nights} nights, {formatMoney(quote.total / nights)} a night all in
                </p>
              )}
              <nav aria-label="Reservation steps" className="mt-6 border-t border-rule pt-4">
                <Progress done={done} current={current} />
              </nav>
            </div>
          </aside>
        </div>
      </div>

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
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Progress index                                                      */
/* ------------------------------------------------------------------ */

function Progress({ done, current, compact = false }: { done: Record<StepId, boolean>; current: StepId; compact?: boolean }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <>
      {compact && (
        <p className="smallcaps mb-2 text-ink-muted">
          Step {idx + 1} of {STEPS.length}: <span className="text-ink">{STEPS[idx].label}</span>
        </p>
      )}
      <ol className={compact ? "grid grid-cols-5 border-y border-ink" : "space-y-0"} data-testid="reserve-progress">
        {STEPS.map((s) => {
          const isCurrent = s.id === current;
          const isDone = done[s.id];
          const state = isDone ? "complete" : isCurrent ? "current" : "upcoming";
          return (
            <li key={s.id} data-state={state} className={compact ? "border-l border-rule first:border-l-0" : "border-b border-rule last:border-b-0"}>
              <a
                href={`#${s.id}`}
                aria-current={isCurrent ? "step" : undefined}
                className={`group flex no-underline ${
                  compact ? "min-h-14 flex-col items-center justify-center gap-1 px-1 text-center" : "min-h-11 items-baseline gap-3 py-2"
                } ${isCurrent ? "text-ink" : isDone ? "text-ink" : "text-ink-muted"}`}
              >
                <span aria-hidden="true" className={`font-serif text-[0.9375rem] italic leading-none ${isCurrent || isDone ? "text-brass" : "text-ink-muted"} ${compact ? "" : "w-8"}`}>
                  {s.numeral}
                </span>
                <span className={`${compact ? "sr-only sm:not-sr-only sm:text-caption" : "flex-1 text-small"} ${isCurrent ? "font-medium underline decoration-brass decoration-1 underline-offset-[6px]" : "group-hover:underline"}`}>
                  {s.label}
                </span>
                {!compact && <span className="smallcaps text-ink-muted">{isDone ? "Done" : isCurrent ? "Now" : ""}</span>}
                {compact && <span className="sr-only">{isDone ? ", complete" : isCurrent ? ", current step" : ""}</span>}
              </a>
            </li>
          );
        })}
      </ol>
    </>
  );
}
