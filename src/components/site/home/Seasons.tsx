import { seasons } from "@/content/experiences";
import { Grid } from "../layout";
import { smart } from "../text";

/**
 * The seasons: an almanac in four columns. The season's name in the display italic, its months in
 * small capitals, one line of character, then the particulars that are worth planning around.
 */
export function Seasons() {
  return (
    <section id="seasons" aria-labelledby="seasons-title" className="pb-section-sm pt-section-sm">
      <Grid>
        <div className="col-span-4 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-ink pt-5 md:col-span-8 lg:col-span-12">
          <h2 id="seasons-title" className="text-h3">
            The island <span className="italic">through the year</span>
          </h2>
          <p className="font-serif text-body italic text-ink-muted">Four seasons, each with its own reasons to come.</p>
        </div>
        <ol className="col-span-4 mt-8 grid gap-x-col gap-y-10 md:col-span-8 md:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
          {seasons.map((s, i) => (
            <li key={s.id} className={`${i ? "lg:border-l lg:border-rule lg:pl-6" : ""}`}>
              <h3 className="display-cut text-[clamp(2rem,1.5rem+1.6vw,2.75rem)] italic leading-none">{s.name}</h3>
              <p className="smallcaps mt-3 text-brass">{s.months}</p>
              <p className="mt-4 font-serif text-body leading-relaxed oldstyle">{smart(s.body)}</p>
              <ul className="mt-4 space-y-2 border-t border-rule pt-3 text-small text-ink-muted">
                {s.notes.map((n) => (
                  <li key={n}>{smart(n)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Grid>
    </section>
  );
}
