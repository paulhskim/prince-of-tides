"use client";

/** Form field primitives (design-system 8.11): label above, helper and error linked by aria-describedby. */
import { Check } from "./icons";

const control =
  "block w-full bg-sheet border text-body text-ink placeholder:text-ink-muted px-3.5 py-3 rounded-none focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ink";

function describedBy(id: string, help?: React.ReactNode, error?: string) {
  return [help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined;
}

function Meta({ id, help, error }: { id: string; help?: React.ReactNode; error?: string }) {
  return (
    <>
      {help && (
        <p id={`${id}-help`} className="mt-1.5 text-small text-ink-muted">
          {help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-small text-danger">
          {error}
        </p>
      )}
    </>
  );
}

function Label({ id, children, optional }: { id: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={id} className="mb-2 block text-label font-medium text-ink">
      {children}
      {optional && <span className="font-normal text-ink-muted"> (optional)</span>}
    </label>
  );
}

type Common = { id: string; label: string; help?: React.ReactNode; error?: string; optional?: boolean };

export function TextField({
  id,
  label,
  help,
  error,
  optional,
  ...input
}: Common & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label id={id} optional={optional}>
        {label}
      </Label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        required={!optional}
        className={`${control} h-12 ${error ? "border-danger" : "border-rule-strong"}`}
        {...input}
      />
      <Meta id={id} help={help} error={error} />
    </div>
  );
}

export function SelectField({
  id,
  label,
  help,
  error,
  optional,
  options,
  ...select
}: Common & { options: readonly string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <Label id={id} optional={optional}>
        {label}
      </Label>
      <select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, help, error)}
        className={`${control} h-12 appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='18'%20height='18'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%2322241f'%20stroke-width='1.25'%20stroke-linecap='round'%20stroke-linejoin='round'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-[position:right_0.875rem_center] bg-no-repeat pr-10 ${error ? "border-danger" : "border-rule-strong"}`}
        {...select}
      >
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <Meta id={id} help={help} error={error} />
    </div>
  );
}

export function TextareaField({
  id,
  label,
  help,
  error,
  optional,
  maxLength,
  value,
  ...rest
}: Common & React.TextareaHTMLAttributes<HTMLTextAreaElement> & { value: string; maxLength: number }) {
  const left = maxLength - value.length;
  return (
    <div>
      <Label id={id} optional={optional}>
        {label}
      </Label>
      <textarea
        id={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={[describedBy(id, help, error), `${id}-count`].filter(Boolean).join(" ")}
        className={`${control} min-h-30 resize-y ${error ? "border-danger" : "border-rule-strong"}`}
        {...rest}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <Meta id={id} help={help} error={error} />
        </div>
        <p id={`${id}-count`} className="mt-1.5 text-small text-ink-muted tabular" aria-live={left < 100 ? "polite" : "off"}>
          {left} characters left
        </p>
      </div>
    </div>
  );
}

export function Checkbox({
  id,
  checked,
  onChange,
  onBlur,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  onBlur?: () => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex min-h-11 items-start gap-3 py-2">
        <span className="relative mt-0.5 flex size-5 shrink-0">
          <input
            id={id}
            type="checkbox"
            checked={checked}
            required
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`peer size-5 cursor-pointer appearance-none rounded-hair border bg-sheet checked:border-marsh checked:bg-marsh ${error ? "border-danger" : "border-rule-strong"}`}
          />
          <Check size={16} className="pointer-events-none absolute inset-0.5 hidden text-sheet peer-checked:block" />
        </span>
        <label htmlFor={id} className="cursor-pointer text-body text-ink">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-error`} className="text-small text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
