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
 * A section title with its numeral set as a small brass italic folio at cap height, the way a
 * monograph numbers its chapters. Two tiers: "primary" for narrative sections, "reference" for
 * dense, ledger-like sections that should not shout.
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
  const accent = tone === "dark" ? "text-brass-light" : "text-brass";
  return (
    <h2 id={id} className={`${size} ${className}`}>
      {numeral ? (
        <span
          aria-hidden="true"
          className={`mr-[0.5em] inline-block min-w-[1.6ch] align-top font-serif text-[0.9375rem] font-normal italic leading-none tracking-[0.02em] ${accent} ${
            tier === "primary" ? "mt-[0.42em]" : "mt-[0.3em]"
          }`}
        >
          {numeral}
        </span>
      ) : null}
      {children}
    </h2>
  );
}

/** A running head: small capitals between two hairlines, as at the top of a printed page. */
export function RunningHead({
  left,
  right,
  tone = "light",
  className = "",
}: {
  left: ReactNode;
  right?: ReactNode;
  tone?: "light" | "dark";
  className?: string;
}) {
  const rule = tone === "dark" ? "border-on-dark/25" : "border-ink";
  const muted = tone === "dark" ? "text-on-dark-muted" : "text-ink-muted";
  return (
    <div className={`flex items-baseline justify-between gap-4 border-y py-3 ${rule} ${className}`}>
      <p className="smallcaps">{left}</p>
      {right ? <p className={`smallcaps hidden text-right sm:block ${muted}`}>{right}</p> : null}
    </div>
  );
}

/**
 * Sub-route title page: running head, the title in the display cut, an optional standfirst and an
 * optional aside that hangs to the right on large screens.
 */
export function PageHeader({
  eyebrow,
  folio,
  title,
  lead,
  aside,
  children,
}: {
  eyebrow: ReactNode;
  folio?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="pb-section-sm pt-6 lg:pt-10">
      <div className="mx-auto max-w-page px-gutter">
        <RunningHead left={eyebrow} right={folio} />
      </div>
      <Grid className="mt-[clamp(2.5rem,1.5rem+4vw,5.5rem)] gap-y-8">
        <div className="col-span-4 md:col-span-8 lg:col-span-8">
          <h1 className="cover-reveal-late display-cut text-h1">{title}</h1>
          {lead ? <div className="mt-6 max-w-measure font-serif text-lead oldstyle lg:mt-8">{lead}</div> : null}
        </div>
        {aside ? <div className="col-span-4 md:col-span-8 lg:col-span-3 lg:col-start-10 lg:self-end">{aside}</div> : null}
        {children ? <div className="col-span-4 md:col-span-8 lg:col-span-12">{children}</div> : null}
      </Grid>
    </header>
  );
}

/** "Prince of Tides" with the connective set in the display italic. */
export function NameSet({ name, className = "" }: { name: string; className?: string }) {
  const m = /^(.*?)\s(of)\s(.*)$/.exec(name);
  if (!m) return <span className={className}>{name}</span>;
  return (
    <span className={className}>
      {m[1]} <span className="italic tracking-[-0.01em] pr-[0.08em]">{m[2]}</span> {m[3]}
    </span>
  );
}

/**
 * Margin label for the left sidenote column. Kept for reference pages where a sidenote is the right
 * structure; the home page does not use it.
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
        <span aria-hidden="true" className={`block font-serif text-h3 italic leading-none ${tone === "dark" ? "text-brass-light" : "text-brass"}`}>
          {numeral}
        </span>
      ) : null}
      <p className={`smallcaps ${muted} ${numeral ? "mt-2" : ""}`}>{children}</p>
    </div>
  );
}
