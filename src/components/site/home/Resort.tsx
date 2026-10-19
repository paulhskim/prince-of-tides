import { resort } from "@/content/copy";
import { Grid } from "../layout";
import { splitHeading } from "../text";

const SEASONAL = /seasonal|in season/i;

export function Resort() {
  const { numeral, title } = splitHeading(resort.heading);
  return (
    <section id="resort" aria-labelledby="resort-title" className="bg-stone py-section">
      <Grid>
        <div className="col-span-4 md:col-span-8 lg:sticky lg:top-36 lg:col-span-4 lg:self-start lg:pr-6">
          {numeral ? (
            <span aria-hidden="true" className="block font-serif text-h3 leading-none text-ink-muted">
              {numeral}
            </span>
          ) : null}
          <p className="mt-2 text-label text-ink-muted">Shared amenities</p>
          <h2 id="resort-title" className="mt-6 text-h2">
            {title}
          </h2>
          <p className="mt-5 font-serif text-lead">{resort.intro}</p>
          <p className="mt-8 border-t border-rule-strong pt-3 text-caption text-ink-muted">{resort.footnote}</p>
        </div>

        <div className="col-span-4 mt-12 md:col-span-8 lg:col-span-8 lg:col-start-5 lg:mt-0">
          <table className="w-full text-left text-small">
            <caption className="sr-only">Hilton Head Resort amenities directory</caption>
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-ink">
                <th scope="col" className="w-[38%] pb-2 text-label font-medium text-ink-muted">
                  Facility
                </th>
                <th scope="col" className="pb-2 text-label font-medium text-ink-muted">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="border-t border-ink md:border-t-0">
              {resort.features.map((f) => (
                <tr key={f.title} className="flex flex-col border-b border-rule-strong/50 py-3 md:table-row md:py-0">
                  <th scope="row" className="pr-6 align-top font-medium md:py-3.5">
                    <span className="inline-flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      {f.title}
                      {SEASONAL.test(f.body) ? (
                        <span className="border border-rule-strong px-1.5 py-px text-caption font-medium text-ink-muted">
                          Seasonal
                        </span>
                      ) : null}
                    </span>
                  </th>
                  <td className="mt-1 align-top text-ink-muted md:mt-0 md:py-3.5 md:text-ink">{f.body}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Grid>
    </section>
  );
}
