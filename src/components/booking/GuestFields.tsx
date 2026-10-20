"use client";

/** Guest steppers (design-system 8.9). Limits come from GUEST_RULES in src/lib/booking/schemas.ts. */
import { booking as bookingCopy } from "@/content/copy";
import { GUEST_RULES, countedGuests } from "@/lib/booking/schemas";
import { Minus, Plus } from "./icons";
import type { Stay } from "./state";

type Key = "adults" | "children" | "infants";

const ROWS: { key: Key; label: string; help: string; singular: string }[] = [
  { key: "adults", label: bookingCopy.labels.adults, help: "Ages 13 and up", singular: "adult" },
  { key: "children", label: bookingCopy.labels.children, help: "Ages 2 to 12", singular: "child" },
  // TODO_OWNER: infants do not count toward the 6-guest maximum and are capped at 2 (see GUEST_RULES).
  { key: "infants", label: bookingCopy.labels.infants, help: "Under 2. A travel crib is provided.", singular: "infant" },
];

export function guestLine(s: Pick<Stay, "adults" | "children" | "infants">): string {
  const n = countedGuests(s);
  const base = `${n} ${n === 1 ? "guest" : "guests"}`;
  return s.infants ? `${base}, ${s.infants} ${s.infants === 1 ? "infant" : "infants"}` : base;
}

export function GuestFields({
  value,
  onChange,
  idPrefix,
}: {
  value: Pick<Stay, "adults" | "children" | "infants">;
  onChange: (patch: Partial<Stay>) => void;
  idPrefix: string;
}) {
  const counted = countedGuests(value);
  const limits: Record<Key, { min: number; max: number }> = {
    adults: { min: GUEST_RULES.minAdults, max: Math.min(GUEST_RULES.maxAdults, value.adults + (GUEST_RULES.maxGuests - counted)) },
    children: { min: 0, max: value.children + (GUEST_RULES.maxGuests - counted) },
    infants: { min: 0, max: GUEST_RULES.maxInfants },
  };
  return (
    <div>
      <ul className="border-t border-rule">
        {ROWS.map((row) => {
          const count = value[row.key];
          const { min, max } = limits[row.key];
          const labelId = `${idPrefix}-${row.key}-label`;
          const plural = row.key === "children" ? "children" : `${row.singular}s`;
          return (
            <li key={row.key} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-rule py-3.5">
              <div>
                <span id={labelId} className="block font-serif text-[1.1875rem] leading-snug text-ink">
                  {row.label}
                </span>
                <span className="mt-0.5 block text-small text-ink-muted">{row.help}</span>
              </div>
              {/* A segmented hairline control: minus, the count in serif figures, plus. */}
              <div role="group" aria-labelledby={labelId} className="flex items-stretch border border-rule-strong">
                <StepButton
                  label={`Remove ${row.singular}`}
                  disabled={count <= min}
                  onClick={() => onChange({ [row.key]: count - 1 })}
                >
                  <Minus />
                </StepButton>
                <output
                  aria-live="polite"
                  aria-label={`${count} ${count === 1 ? row.singular : plural}`}
                  className="flex w-11 items-center justify-center border-x border-rule font-serif text-[1.1875rem] tabular"
                  data-testid={`${row.key}-count`}
                >
                  {count}
                </output>
                <StepButton
                  label={`Add ${row.singular}`}
                  disabled={count >= max}
                  onClick={() => onChange({ [row.key]: count + 1 })}
                >
                  <Plus />
                </StepButton>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-small text-ink-muted" aria-live="polite">
        {guestLine(value)}. {counted >= GUEST_RULES.maxGuests ? bookingCopy.maxGuestsMessage : bookingCopy.helperText.infants}
      </p>
    </div>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (!disabled) onClick();
      }}
      className={`flex size-11 items-center justify-center transition-colors duration-[var(--duration-fast)] focus-visible:outline-offset-2 ${
        disabled ? "cursor-default text-ink-faint" : "text-ink hover:bg-stone"
      }`}
    >
      {children}
    </button>
  );
}
