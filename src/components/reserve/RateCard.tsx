/**
 * <RateCard />: the seasonal rate table, fees and taxes, generated from src/content/site.config.ts.
 * No client code, so it renders on the server anywhere (the home page, /reserve, /policies).
 *
 * Props
 * - headingLevel: 2 or 3 (default 3) for the "Seasonal rates" heading; pass `hideHeading` to omit it
 *   when the surrounding section already names the table.
 * - showFees: list the cleaning fee, stay discounts, taxes and the security deposit (default true).
 * - tone: "light" (paper, sheet) or "dark" (pluff night passages). Default "light".
 * - compact: tighter rows for a side panel (dates move under the season name).
 * - columns: 2 sets the fees beside the table from md up (default 1, stacked).
 * - id: id for the heading (aria-labelledby), default "rate-card".
 */
import { siteConfig } from "@/content/site.config";
import { formatMoney } from "@/lib/booking/dates";
import { ILLUSTRATIVE_NOTE, pct, seasonRows, securityDepositAmount } from "@/lib/booking/reserve";

export type RateCardProps = {
  headingLevel?: 2 | 3;
  hideHeading?: boolean;
  showFees?: boolean;
  tone?: "light" | "dark";
  compact?: boolean;
  columns?: 1 | 2;
  id?: string;
  className?: string;
};

export function RateCard({
  headingLevel = 3,
  hideHeading = false,
  showFees = true,
  tone = "light",
  compact = false,
  columns = 1,
  id = "rate-card",
  className = "",
}: RateCardProps) {
  const { pricing } = siteConfig;
  const rows = seasonRows();
  const dark = tone === "dark";
  const ink = dark ? "text-on-dark" : "text-ink";
  const muted = dark ? "text-on-dark-muted" : "text-ink-muted";
  const rule = dark ? "border-on-dark/20" : "border-rule";
  const strong = dark ? "border-on-dark/60" : "border-ink";
  const accent = dark ? "text-brass-light" : "text-brass";
  const py = compact ? "py-2" : "py-3";
  const H = headingLevel === 2 ? "h2" : "h3";
  const deposit = securityDepositAmount();
  const combined = pricing.taxes.reduce((s, t) => s + t.rate, 0);

  return (
    <section aria-labelledby={id} className={`${ink} ${className}`} data-testid="rate-card">
      <div className={`flex items-baseline justify-between gap-4 border-b pb-2 ${strong}`}>
        <H id={id} className={hideHeading ? "sr-only" : "smallcaps"}>
          Seasonal rates
        </H>
        {!hideHeading && <span className={`smallcaps ${accent}`}>Per night, {pricing.currency}</span>}
      </div>

      <div className={columns === 2 && showFees ? "md:grid md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:gap-x-col" : ""}>
      <table className="w-full border-collapse self-start text-small tabular">
        <caption className="sr-only">
          Nightly rates by season in US dollars, with minimum stay. {pricing.isPlaceholder ? ILLUSTRATIVE_NOTE : ""}
        </caption>
        <thead>
          <tr className={`border-b ${rule}`}>
            <th scope="col" className={`smallcaps py-2.5 pr-3 text-left ${muted}`}>
              Season
            </th>
            <th scope="col" className={`smallcaps py-2.5 pr-3 text-left ${muted} ${compact ? "sr-only" : ""}`}>
              Dates
            </th>
            <th scope="col" className={`smallcaps py-2.5 pr-3 text-right ${muted}`}>
              Nightly from
            </th>
            <th scope="col" className={`smallcaps py-2.5 text-right ${muted}`}>
              Minimum
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className={`border-b ${rule} align-baseline`}>
              <th scope="row" className={`${py} pr-3 text-left font-normal`}>
                <span className="font-serif text-[1.0625rem] leading-snug">{r.name}</span>
                {compact && <span className={`block text-caption ${muted}`}>{r.dates}</span>}
              </th>
              <td className={`${py} pr-3 ${muted} ${compact ? "sr-only" : ""}`}>{r.dates}</td>
              <td className={`${py} pr-3 text-right`}>
                <span className="font-serif text-[1.0625rem]">{formatMoney(r.from)}</span>
                {r.weekend !== null && (
                  <span className={`block text-caption ${muted}`}>
                    {formatMoney(r.weekend)} Fri, Sat
                  </span>
                )}
              </td>
              <td className={`${py} text-right`}>{r.minNights} nights</td>
            </tr>
          ))}
        </tbody>
      </table>

      {showFees && (
        <dl className={`mt-6 text-small ${columns === 2 ? "md:mt-0" : "md:grid md:grid-cols-2 md:gap-x-col"}`} data-testid="rate-card-fees">
          <div className={`flex items-baseline justify-between gap-4 border-b ${rule} ${py}`}>
            <dt>Cleaning fee</dt>
            <dd className="text-right tabular">{formatMoney(pricing.cleaningFee)} per stay</dd>
          </div>
          {pricing.weeklyDiscountPct > 0 && (
            <div className={`flex items-baseline justify-between gap-4 border-b ${rule} ${py}`}>
              <dt>Weekly stay</dt>
              <dd className="text-right tabular">
                {pricing.weeklyDiscountPct}% off lodging, {pricing.weeklyMinNights}+ nights
              </dd>
            </div>
          )}
          {pricing.monthlyDiscountPct > 0 && (
            <div className={`flex items-baseline justify-between gap-4 border-b ${rule} ${py}`}>
              <dt>Monthly stay</dt>
              <dd className="text-right tabular">
                {pricing.monthlyDiscountPct}% off lodging, {pricing.monthlyMinNights}+ nights
              </dd>
            </div>
          )}
          <div className={`flex flex-wrap items-baseline justify-between gap-x-4 border-b ${rule} ${py}`}>
            <dt>Taxes on lodging and cleaning</dt>
            <dd className="text-right tabular">{pct(combined)} combined</dd>
            <dd className="basis-full">
              <ul className={`mt-1.5 space-y-1 text-caption ${muted}`}>
                {pricing.taxes.map((t) => (
                  <li key={t.name} className="flex justify-between gap-4">
                    <span>{t.name}</span>
                    <span className="tabular">{pct(t.rate)}</span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div className={`flex items-baseline justify-between gap-4 border-b ${rule} ${py}`}>
            <dt>Refundable security deposit</dt>
            <dd className="text-right tabular">{deposit !== null ? formatMoney(deposit) : "Confirmed by the host"}</dd>
          </div>
          <div className={`flex items-baseline justify-between gap-4 ${py}`}>
            <dt>Platform service fee</dt>
            <dd className="text-right">None when you book direct</dd>
          </div>
        </dl>
      )}
      </div>

      {pricing.isPlaceholder && (
        <p className={`mt-3 font-serif text-small italic ${muted}`} data-testid="illustrative-note">
          {ILLUSTRATIVE_NOTE}
        </p>
      )}
    </section>
  );
}
