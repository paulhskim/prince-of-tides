import { amenities } from "@/content/copy";
import { Grid } from "../layout";
import { sentenceCase, splitHeading } from "../text";

export function Amenities() {
  const { numeral, title } = splitHeading(amenities.heading);
  const groups = amenities.groups.slice(0, -1);
  const notProvided = amenities.groups[amenities.groups.length - 1];

  return (
    <section id="amenities" aria-labelledby="amenities-title" className="py-section-sm">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />
        <div className="col-span-4 mb-8 md:col-span-8 lg:sticky lg:top-36 lg:col-span-3 lg:mb-0 lg:self-start">
          {numeral ? (
            <span aria-hidden="true" className="block font-serif text-h3 leading-none text-ink-muted">
              {numeral}
            </span>
          ) : null}
          <h2 id="amenities-title" className="mt-2 font-sans text-label font-medium text-ink-muted">
            {title}
          </h2>
          <p className="mt-4 max-w-[15rem] font-serif text-lead">{amenities.intro}</p>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-4">
          <div className="index-counter gap-x-col md:columns-2 lg:columns-3">
            {groups.map((g) => (
              <div key={g.title} className="mb-8 break-inside-avoid">
                <h3 className="border-t border-ink pt-2 font-sans text-label font-medium">{sentenceCase(g.title)}</h3>
                <ol className="mt-3 space-y-1.5">
                  {g.items.map((item) => (
                    <li key={item} className="index-item relative pl-[2.75ch] text-small">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>

          {notProvided ? (
            <div className="mt-2 grid gap-x-col border-t border-ink pt-2 md:grid-cols-8 lg:grid-cols-9">
              <h3 className="font-sans text-label font-medium md:col-span-2 lg:col-span-3">{sentenceCase(notProvided.title)}</h3>
              <ul className="mt-3 grid gap-x-col gap-y-2 text-small text-ink-muted md:col-span-6 md:mt-0 md:grid-cols-2 lg:col-span-6">
                {notProvided.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </Grid>
    </section>
  );
}
