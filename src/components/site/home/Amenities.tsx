import { amenities } from "@/content/copy";
import { Grid, SectionTitle } from "../layout";
import { sentenceCase, smart, splitHeading } from "../text";

/**
 * III. Provisions: a reference index, set small and dense, closer to an inventory than a feature
 * list. What is not provided gets its own row, typeset as plainly as the rest.
 */
export function Amenities() {
  const { numeral, title } = splitHeading(amenities.heading);
  const groups = amenities.groups.slice(0, -1);
  const notProvided = amenities.groups[amenities.groups.length - 1];

  return (
    <section id="amenities" aria-labelledby="amenities-title" className="py-section">
      <Grid>
        <div className="col-span-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-ink pt-5 md:col-span-8 lg:col-span-12">
          <SectionTitle id="amenities-title" numeral={numeral} tier="reference">
            {title}
          </SectionTitle>
          <p className="font-serif text-lead italic text-ink-muted">{amenities.intro}</p>
        </div>

        <div data-reveal className="col-span-4 mt-10 grid grid-cols-2 gap-x-col gap-y-8 md:col-span-8 md:grid-cols-3 lg:col-span-12 lg:grid-cols-6">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="smallcaps border-b border-rule pb-2.5">{sentenceCase(g.title).replace(" & ", " and ")}</h3>
              <ul className="mt-3 space-y-1.5 text-small">
                {g.items.map((item) => (
                  <li key={item}>{smart(item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {notProvided ? (
          <div data-reveal className="col-span-4 mt-14 grid gap-x-col gap-y-4 border-y border-ink py-6 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:grid-cols-12">
            <h3 className="md:col-span-2 lg:col-span-2">
              <span className="block font-serif text-h3 font-light italic">Plainly stated</span>
              <span className="smallcaps mt-1 block text-ink-muted">{sentenceCase(notProvided.title).replace(" / ", ", ")}</span>
            </h3>
            <ul className="grid gap-x-col gap-y-2 text-small md:col-span-6 md:grid-cols-2 lg:col-span-9 lg:col-start-4 lg:grid-cols-3">
              {notProvided.items.map((item) => (
                <li key={item}>{smart(item)}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </Grid>
    </section>
  );
}
