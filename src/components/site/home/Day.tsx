import { dayInTheLife } from "@/content/experiences";
import { getPhotos } from "@/lib/photos";
import { Photo } from "../Photo";
import { Grid } from "../layout";
import { smart } from "../text";

/** "7:00 AM" becomes ["7:00", "AM"], so the hour can be set as a figure and the meridiem as a small capital. */
function splitTime(t: string): [string, string] {
  const m = /^(\d{1,2}:\d{2})\s*(AM|PM)$/i.exec(t.trim());
  return m ? [m[1], m[2].toUpperCase()] : [t, ""];
}

/**
 * A day, unhurried: a timetable. The hours run down the page as figures; each line says what one
 * might do and where. Under the title, the owner's photograph of the kitchen corner with its two
 * coffee makers, for the first line of the day.
 * A suggestion, not a programme: there is no staff and nothing is arranged for you.
 */
export function Day() {
  const coffee = getPhotos().find((p) => p.file === "kitchen-corner.jpg");
  return (
    <section id="day" aria-labelledby="day-title" className="pb-section-sm pt-section">
      <Grid className="gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <p className="smallcaps text-brass">The island, continued</p>
          <h2 id="day-title" className="mt-3 text-h2">
            A day, <span className="italic">unhurried</span>
          </h2>
          <p className="mt-5 max-w-[26rem] font-serif text-lead oldstyle">
            One way to spend it, using only what is here and nearby. Nothing is arranged for you; that is rather the point.
          </p>
          {coffee ? (
            <figure className="mt-10 hidden max-w-[19rem] lg:block" data-reveal="plate">
              <Photo photo={coffee} slot={coffee.slot} ratio="native" sizes="304px" />
              <figcaption className="mt-2 font-serif text-caption italic text-ink-muted">{coffee.caption}</figcaption>
            </figure>
          ) : null}
        </div>

        <ol className="col-span-4 border-t border-ink md:col-span-8 lg:col-span-7 lg:col-start-6">
          {dayInTheLife.map((d) => {
            const [time, meridiem] = splitTime(d.time);
            return (
              <li key={d.time} className="grid grid-cols-[5.5rem_1fr] gap-x-5 border-b border-rule py-5 sm:grid-cols-[8.5rem_1fr] sm:gap-x-col">
                <p className="leading-none">
                  <span className="display-cut text-[clamp(1.75rem,1.3rem+1.6vw,2.625rem)] leading-none tabular">{time}</span>
                  <span className="smallcaps ml-1.5 text-ink-muted">{meridiem}</span>
                </p>
                <div>
                  <h3 className="font-serif text-[1.25rem] leading-snug">{smart(d.title)}</h3>
                  <p className="mt-1 max-w-[34rem] text-small text-ink-muted">{smart(d.body)}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Grid>
    </section>
  );
}
