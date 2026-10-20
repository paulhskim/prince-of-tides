"use client";

/**
 * Accessible date-range calendar (design-system 8.8).
 * - One `role="grid"` table per month, week starting Sunday, roving tabindex on day buttons.
 * - Keys: arrows (day / week), Home / End (start / end of week), PageUp / PageDown (month),
 *   Shift+PageUp / PageDown (year), Enter / Space (select), Escape (onEscape).
 * - Every day has a full-date aria-label with its state; unavailable nights are struck through, not
 *   conveyed by color alone. Hints and the nights count are announced in a polite live region.
 */
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { siteConfig } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import {
  addDays,
  addMonths,
  diffDays,
  formatMonth,
  monthStart,
  shiftMonthsKeepDay,
  weekday,
  type ISODate,
} from "@/lib/booking/dates";
import { dayInfo, monthMatrix, selectDay, selectionHint, type DayInfo, type Selection } from "@/lib/booking/calendar";
import { lastBookableDate } from "@/lib/booking/rules";
import { ChevronLeft, ChevronRight } from "./icons";
import { useIsDesktop } from "./state";

const WEEKDAYS = [
  ["Su", "Sunday"],
  ["Mo", "Monday"],
  ["Tu", "Tuesday"],
  ["We", "Wednesday"],
  ["Th", "Thursday"],
  ["Fr", "Friday"],
  ["Sa", "Saturday"],
] as const;

const STRIKE =
  "bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--color-ink-faint)_calc(50%-0.5px),var(--color-ink-faint)_calc(50%+0.5px),transparent_calc(50%+0.5px))]";

export type DateRangeCalendarProps = {
  selection: Selection;
  onChange: (next: Selection) => void;
  blocked: ReadonlySet<ISODate>;
  today: ISODate;
  /** Force one month (popover on small widths, sheet). Default: two months at lg, one below. */
  months?: 1 | 2;
  /** Move focus into the grid on mount (popover, sheet). */
  autoFocus?: boolean;
  onEscape?: () => void;
  /** Called after a departure date is chosen. */
  onComplete?: (sel: Selection) => void;
  /** Availability note shown under the legend. */
  status?: "loading" | "ready" | "error";
  complete?: boolean;
  className?: string;
};

export function minimumStaySummary(): string {
  const def = siteConfig.booking.minNightsDefault;
  const md = (s: string) => {
    const [m, d] = s.split("-").map(Number);
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(2027, m - 1, d)));
  };
  const exceptions = siteConfig.pricing.seasons
    .filter((s) => s.minNights !== def)
    .map((s) => `${s.minNights} in ${s.name.toLowerCase()} (${md(s.start)} to ${md(s.end)})`);
  return `Minimum stay ${def} nights${exceptions.length ? `; ${exceptions.join(", ")}` : ""}.`;
}

export function DateRangeCalendar({
  selection,
  onChange,
  blocked,
  today,
  months,
  autoFocus,
  onEscape,
  onComplete,
  status = "ready",
  complete = true,
  className = "",
}: DateRangeCalendarProps) {
  const isDesktop = useIsDesktop();
  const shown = months ?? (isDesktop ? 2 : 1);
  const minMonth = monthStart(today);
  const lastArrival = lastBookableDate(today);
  const maxMonth = monthStart(lastArrival);
  const lastDay = addDays(lastArrival, siteConfig.booking.maxNights);

  const [view, setView] = useState<ISODate>(() => monthStart(selection.checkIn ?? today));
  const [focusDate, setFocusDate] = useState<ISODate>(() => selection.checkIn ?? today);
  const pendingFocus = useRef(Boolean(autoFocus));
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  // Keep the first visible month valid once "today" is known on the client.
  useEffect(() => {
    if (view < minMonth) setView(minMonth);
  }, [minMonth, view]);

  // The stay can arrive after mount (URL read after hydration, or another widget on the page):
  // bring the arrival month into view when it is not visible.
  const lastVisible = addDays(addMonths(view, shown), -1);
  useEffect(() => {
    const ci = selection.checkIn;
    if (ci && (ci < view || ci > lastVisible)) {
      setView(monthStart(ci));
      setFocusDate(ci);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection.checkIn]);

  const visibleMonths = useMemo(() => Array.from({ length: shown }, (_, i) => addMonths(view, i)), [view, shown]);
  const lastVisibleDay = addDays(addMonths(view, shown), -1);
  const ctx = useMemo(() => ({ today, blocked, selection }), [today, blocked, selection]);

  // The tabbable day must be visible; otherwise use the selection or the first of the view.
  const tabbable =
    focusDate >= view && focusDate <= lastVisibleDay
      ? focusDate
      : selection.checkIn && selection.checkIn >= view && selection.checkIn <= lastVisibleDay
        ? selection.checkIn
        : view < today && today <= lastVisibleDay
          ? today
          : view;

  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    rootRef.current?.querySelector<HTMLButtonElement>(`button[data-iso="${tabbable}"]`)?.focus();
  });

  function moveFocus(target: ISODate) {
    const clamped = target < minMonth ? minMonth : target > lastDay ? lastDay : target;
    let nextView = view;
    if (clamped < view) nextView = monthStart(clamped);
    else if (clamped > lastVisibleDay) nextView = addMonths(monthStart(clamped), -(shown - 1));
    if (nextView < minMonth) nextView = minMonth;
    setView(nextView);
    setFocusDate(clamped);
    pendingFocus.current = true;
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, iso: ISODate) {
    let target: ISODate | null = null;
    switch (e.key) {
      case "ArrowLeft":
        target = addDays(iso, -1);
        break;
      case "ArrowRight":
        target = addDays(iso, 1);
        break;
      case "ArrowUp":
        target = addDays(iso, -7);
        break;
      case "ArrowDown":
        target = addDays(iso, 7);
        break;
      case "Home":
        target = addDays(iso, -weekday(iso));
        break;
      case "End":
        target = addDays(iso, 6 - weekday(iso));
        break;
      case "PageUp":
        target = shiftMonthsKeepDay(iso, e.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        target = shiftMonthsKeepDay(iso, e.shiftKey ? 12 : 1);
        break;
      case "Escape":
        if (onEscape) {
          e.preventDefault();
          e.stopPropagation();
          onEscape();
        }
        return;
      default:
        return;
    }
    e.preventDefault();
    moveFocus(target);
  }

  function choose(info: DayInfo) {
    setFocusDate(info.iso);
    if (!info.selectable) return;
    const next = selectDay(info.iso, ctx);
    if (!next) return;
    onChange(next);
    if (next.checkIn && next.checkOut) onComplete?.(next);
  }

  const hint = selectionHint(selection);
  const nights = selection.checkIn && selection.checkOut ? diffDays(selection.checkIn, selection.checkOut) : 0;
  const canPrev = view > minMonth;
  const canNext = addMonths(view, shown - 1) < maxMonth;

  return (
    <div
      ref={rootRef}
      className={`relative ${className}`}
      data-availability={status}
      data-testid="date-range-calendar"
    >
      <div className="absolute top-0 right-0 flex">
        <button
          type="button"
          onClick={() => {
            setView(addMonths(view, -1));
          }}
          disabled={!canPrev}
          aria-label="Previous month"
          className="flex size-11 items-center justify-center text-ink transition-colors duration-[var(--duration-fast)] hover:bg-stone disabled:text-ink-faint disabled:hover:bg-transparent"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => {
            setView(addMonths(view, 1));
          }}
          disabled={!canNext}
          aria-label="Next month"
          className="flex size-11 items-center justify-center text-ink transition-colors duration-[var(--duration-fast)] hover:bg-stone disabled:text-ink-faint disabled:hover:bg-transparent"
        >
          <ChevronRight />
        </button>
      </div>

      <div className={`grid gap-x-8 ${shown === 2 ? "lg:grid-cols-2" : ""}`}>
        {visibleMonths.map((month, i) => {
          const headingId = `${uid}-m${i}`;
          return (
            <div
              key={month}
              className={i === 1 ? "hidden lg:block" : undefined}
            >
              <h3 id={headingId} className="flex h-11 items-center pr-24 font-serif text-[1.5rem] font-light tracking-[-0.015em]" aria-live={i === 0 ? "polite" : undefined}>
                {formatMonth(month)}
              </h3>
              <table role="grid" aria-labelledby={headingId} className="mt-3 w-full table-fixed border-collapse">
                <thead>
                  <tr>
                    {WEEKDAYS.map(([short, long]) => (
                      <th key={short} scope="col" className="smallcaps pb-3 text-center text-ink-muted">
                        <abbr title={long} className="no-underline">
                          {short}
                        </abbr>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthMatrix(month).map((week, w) => (
                    <tr key={w}>
                      {week.map((iso, d) =>
                        iso ? (
                          <DayCell
                            key={iso}
                            info={dayInfo(iso, ctx)}
                            tabbable={iso === tabbable}
                            onChoose={choose}
                            onKeyDown={onKeyDown}
                          />
                        ) : (
                          <td key={`e${d}`} role="presentation" />
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      <p
        aria-live="polite"
        className={`mt-4 min-h-[1.5em] text-small ${hint.tone === "warning" ? "text-warning" : "text-ink"}`}
        data-testid="calendar-hint"
      >
        {hint.text}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-caption text-ink-muted">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-3.5 bg-marsh" />
          Selected
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className="inline-block size-3.5 bg-marsh-soft" />
          {bookingCopy.calendar.legendSelected}
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden="true" className={`inline-block size-3.5 ${STRIKE} shadow-[inset_0_0_0_1px_var(--color-rule)]`} />
          Unavailable
        </span>
      </div>
      <p className="mt-2 text-caption text-ink-muted">{minimumStaySummary()}</p>
      {status === "loading" && <p className="mt-1 text-caption text-ink-muted">Checking the calendar.</p>}
      {(status === "error" || !complete) && (
        <p className="mt-1 text-caption text-ink-muted">
          Some reserved dates may not show here yet. The host confirms availability before anything is charged.
        </p>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-rule pt-3">
        <button
          type="button"
          onClick={() => {
            onChange({ checkIn: null, checkOut: null });
            setFocusDate(today);
          }}
          disabled={!selection.checkIn}
          className="link-caps text-ink disabled:text-ink-faint disabled:no-underline"
        >
          {bookingCopy.calendar.clearDates}
        </button>
        <span className="font-serif text-small italic text-ink-muted tabular">{nights ? `${nights} ${nights === 1 ? "night" : "nights"}` : ""}</span>
      </div>
    </div>
  );
}

function DayCell({
  info,
  tabbable,
  onChoose,
  onKeyDown,
}: {
  info: DayInfo;
  tabbable: boolean;
  onChoose: (info: DayInfo) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, iso: ISODate) => void;
}) {
  const { kind } = info;
  const tone =
    kind === "arrival" || kind === "departure"
      ? "bg-marsh text-sheet"
      : kind === "in-range"
        ? "bg-marsh-soft text-ink"
        : info.struck
          ? "text-ink-faint"
          : info.selectable || kind === "departure-only"
            ? "text-ink"
            : "text-ink-faint";
  const hover = info.selectable && !info.selected ? "hover:outline hover:outline-1 hover:-outline-offset-1 hover:outline-ink" : "";
  return (
    <td role="gridcell" aria-selected={info.selected || undefined} className="p-0">
      <button
        type="button"
        data-iso={info.iso}
        data-kind={kind}
        tabIndex={tabbable ? 0 : -1}
        aria-label={info.label}
        aria-disabled={!info.selectable || undefined}
        onClick={() => onChoose(info)}
        onKeyDown={(e) => onKeyDown(e, info.iso)}
        className={`flex h-11 w-full items-center justify-center font-serif text-[1rem] tabular transition-colors duration-[var(--duration-fast)] focus-visible:outline-offset-1 lg:h-12 ${tone} ${hover} ${info.selectable ? "cursor-pointer" : "cursor-default"}`}
      >
        <span
          aria-hidden="true"
          className={`flex size-7 items-center justify-center ${info.struck ? STRIKE : ""} ${info.isToday ? "underline decoration-1 underline-offset-[3px]" : ""}`}
        >
          {Number(info.iso.slice(8, 10))}
        </span>
      </button>
    </td>
  );
}
