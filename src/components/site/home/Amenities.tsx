import { amenities } from "@/content/copy";
import { Grid, SectionTitle } from "../layout";
import { sentenceCase, splitHeading } from "../text";

/**
 * III. Provisions: a reference index, set small and dense, closer to an inventory than a feature
 * list. What is not provided gets its own row, typeset as plainly as the rest.
 */
export function Amenities() {
  const { numeral, title } = splitHeading(amenities.heading);
  const groups = amenities.groups.slice(0, -1);
  const notProvided = amenities.groups[amenities.groups.length - 1];

  return (
    <section id="amenities" aria-labelledby="amenities-title" className="pb-section pt-4">
      <Grid>
        <div className="col-span-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-ink pt-5 md:col-span-8 lg:col-span-12">
          <SectionTitle id="amenities-title" numeral={numeral} tier="reference">
            {title}
          </SectionTitle>
          <p className="font-serif text-lead text-ink-muted">{amenities.intro}</p>
        </div>

        <div className="col-span-4 mt-8 grid grid-cols-2 gap-x-col gap-y-8 md:col-span-8 md:grid-cols-3 lg:col-span-12 lg:grid-cols-6">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="apparatus border-b border-rule pb-2">{sentenceCase(g.title)}</h3>
              <ul className="mt-2.5 space-y-1 text-small">
                {g.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {notProvided ? (
          <div className="col-span-4 mt-10 grid gap-x-col gap-y-3 border border-ink px-5 py-5 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:grid-cols-12 lg:px-6">
            <h3 className="apparatus md:col-span-2 lg:col-span-2">{sentenceCase(notProvided.title)}</h3>
            <ul className="grid gap-x-col gap-y-1.5 text-small md:col-span-6 md:grid-cols-2 lg:col-span-10 lg:grid-cols-3">
              {notProvided.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Grid>
    </section>
  );
}
