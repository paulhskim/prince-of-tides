import Link from "next/link";
import { RateCard } from "@/components/reserve/RateCard";
import { bookDirect } from "@/content/experiences";
import { hero } from "@/content/copy";
import { Grid, SectionTitle } from "../layout";
import { roman, smart } from "../text";

/**
 * V. Rates: the price, stated in full before anyone asks. The seasonal rate card (owned by the
 * reservation flow, so the figures always match the quote) on a cream sheet, the honest reasons to
 * reserve here below it, and one action.
 */
export function Rates() {
  return (
    <section id="rates" aria-labelledby="rates-title" className="pb-section pt-section-sm">
      <Grid className="gap-y-10">
        <div className="col-span-4 border-t border-ink pt-6 md:col-span-8 lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-col">
          <SectionTitle id="rates-title" numeral="V" className="lg:col-span-5">
            Rates
          </SectionTitle>
          <p className="mt-5 max-w-measure font-serif text-lead oldstyle lg:col-span-6 lg:col-start-7 lg:mt-2">
            The nightly rate by season, the cleaning fee and the lodging taxes, set out in full. Choose dates on the reservation page for an exact, itemized quote.
          </p>
        </div>

        <div className="col-span-4 bg-sheet px-[clamp(1.25rem,0.5rem+2.5vw,3rem)] py-[clamp(1.5rem,1rem+2vw,3rem)] shadow-[inset_0_0_0_1px_var(--color-rule)] md:col-span-8 lg:col-span-12">
          <RateCard headingLevel={3} columns={2} id="home-rate-card" />
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-12">
          <h3 className="smallcaps border-b border-ink pb-2">Reserving here</h3>
          <ol className="grid gap-x-col md:grid-cols-2 lg:grid-cols-4">
            {bookDirect.map((r, i) => (
              <li key={r.id} className="grid grid-cols-[2rem_1fr] border-b border-rule py-4 lg:border-b-0 lg:pr-4">
                <span aria-hidden="true" className="font-serif text-body italic text-brass">
                  {roman(i + 1)}
                </span>
                <span>
                  <span className="block font-serif text-[1.1875rem] leading-snug">{smart(r.title)}</span>
                  <span className="mt-1 block text-small text-ink-muted">{smart(r.body)}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink pt-6">
            <Link href={hero.primaryCta.href} className="btn btn-primary h-14 w-full sm:w-auto sm:px-10">
              {hero.primaryCta.label}
            </Link>
            <p className="text-caption text-ink-muted">By request. Nothing is charged until your host confirms the dates.</p>
          </div>
        </div>
      </Grid>
    </section>
  );
}
