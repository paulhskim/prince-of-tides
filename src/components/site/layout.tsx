import type { ReactNode } from "react";

type Props = { children: ReactNode; className?: string };

/** The 12-column page grid inside the page container. */
export function Grid({ children, className = "" }: Props) {
  return (
    <div className={`mx-auto grid max-w-page grid-cols-4 gap-x-col px-gutter md:grid-cols-8 lg:grid-cols-12 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Margin label for the left sidenote column. When a section numeral exists (from the copy
 * headings, "I.", "II." ...) it is set as a quiet serif figure above the label.
 */
export function MarginLabel({
  children,
  numeral,
  sticky = true,
  className = "",
  tone = "light",
}: {
  children: ReactNode;
  numeral?: string | null;
  sticky?: boolean;
  className?: string;
  tone?: "light" | "dark";
}) {
  const muted = tone === "dark" ? "text-on-dark-muted" : "text-ink-muted";
  return (
    <div className={`${sticky ? "lg:sticky lg:top-36 lg:self-start" : ""} ${className}`}>
      {numeral ? (
        <span aria-hidden="true" className={`block font-serif text-h3 leading-none ${muted}`}>
          {numeral}
        </span>
      ) : null}
      <p className={`text-label ${muted} ${numeral ? "mt-2" : ""}`}>{children}</p>
    </div>
  );
}
