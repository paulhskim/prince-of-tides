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
 * A section title with its numeral set inline as a small sans folio, so the numbered structure
 * reads without a dedicated sidenote column. Two tiers: "primary" for narrative sections, "reference"
 * for dense, ledger-like sections that should not shout.
 */
export function SectionTitle({
  id,
  numeral,
  children,
  tier = "primary",
  className = "",
  tone = "light",
}: {
  id: string;
  numeral?: string | null;
  children: ReactNode;
  tier?: "primary" | "reference";
  className?: string;
  tone?: "light" | "dark";
}) {
  const size = tier === "primary" ? "text-h2" : "text-h3";
  const muted = tone === "dark" ? "text-on-dark-muted" : "text-ink-muted";
  return (
    <h2 id={id} className={`${size} ${className}`}>
      {numeral ? (
        <span aria-hidden="true" className={`mr-3 inline-block min-w-[2.25ch] align-top font-serif text-[0.9375rem] leading-none tracking-normal ${muted} ${tier === "primary" ? "mt-[0.5em]" : "mt-[0.35em]"}`}>
          {numeral}
        </span>
      ) : null}
      {children}
    </h2>
  );
}

/**
 * Margin label for the left sidenote column. Kept for reference pages (FAQ categories) where a
 * sidenote is the right structure; the home page no longer uses it.
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
    <div className={`${sticky ? "lg:sticky lg:top-24 lg:self-start" : ""} ${className}`}>
      {numeral ? (
        <span aria-hidden="true" className={`block font-serif text-h3 leading-none ${muted}`}>
          {numeral}
        </span>
      ) : null}
      <p className={`text-label ${muted} ${numeral ? "mt-2" : ""}`}>{children}</p>
    </div>
  );
}
