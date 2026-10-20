import { resort } from "@/content/copy";
import { photoFor } from "@/lib/photos";
import { Grid, SectionTitle } from "../layout";
import { Photo } from "../Photo";
import { splitHeading } from "../text";

const SEASONAL = /seasonal|in season/i;

/**
 * IV. The resort: the one stone band. The introduction holds the left; the directory runs in two
 * columns on the right. A photograph of the indoor pool, once supplied, sits under the introduction.
 */
export function Resort() {
  const { numeral, title } = splitHeading(resort.heading);
  const pool = photoFor("pool");
  return (
    <section id="resort" aria-labelledby="resort-title" className="bg-stone py-section">
      <Grid className="gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
          <SectionTitle id="resort-title" numeral={numeral}>
            {title}
          </SectionTitle>
          <p className="mt-6 max-w-measure font-serif text-lead oldstyle">{resort.intro}</p>
          {pool ? (
            <figure className="mt-10">
              <Photo photo={pool} slot="pool" ratio="4/5" sizes="(min-width:1024px) 34vw, 100vw" />
              <figcaption className="mt-2 text-caption text-ink-muted">{pool.caption}</figcaption>
            </figure>
          ) : null}
          <p className="mt-8 max-w-[22rem] text-caption text-ink-muted">{resort.footnote}</p>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7 lg:pt-3">
          <dl className="grid gap-x-col border-t border-ink sm:grid-cols-2" aria-label="Hilton Head Resort amenities directory">
            {resort.features.map((f) => (
              <div key={f.title} className="border-b border-rule-strong/40 py-4">
                <dt className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-medium">
                  {f.title}
                  {SEASONAL.test(f.body) ? (
                    <span className="border border-rule-strong px-1.5 py-px text-caption font-medium text-ink-muted">Seasonal</span>
                  ) : null}
                </dt>
                <dd className="mt-1 text-small">{f.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Grid>
    </section>
  );
}
