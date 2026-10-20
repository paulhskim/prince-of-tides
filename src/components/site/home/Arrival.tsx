import { arrival, particulars } from "@/content/copy";
import { Grid, SectionTitle } from "../layout";
import { splitHeading, withoutTodos } from "../text";

/**
 * VII. Before you arrive: the one dark band, set as a timetable. The two times are the figures;
 * the four steps of an arrival run left to right in the order they happen; the remaining notes
 * follow in a smaller register.
 */
export function Arrival() {
  const { numeral, title } = splitHeading(arrival.heading);
  const items = arrival.items.map((it) => ({ ...it, body: withoutTodos(it.body) })).filter((it) => it.body);
  const sequence = items.slice(0, 4);
  const notes = items.slice(4);
  const checkIn = particulars.items.find((p) => p.label === "Check-in")?.value ?? "";
  const checkOut = particulars.items.find((p) => p.label === "Check-out")?.value ?? "";
  const [inTime, ...inRest] = checkIn.split(", ");

  return (
    <section
      id="arrival"
      data-surface="dark"
      aria-labelledby="arrival-title"
      className="bg-pluff py-section text-on-dark [&_a]:decoration-on-dark-muted"
    >
      <Grid className="gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <SectionTitle id="arrival-title" numeral={numeral} tone="dark">
            {title}
          </SectionTitle>
          <p className="mt-5 max-w-[28rem] font-serif text-lead text-on-dark-muted">{arrival.intro}</p>
        </div>

        <dl className="col-span-4 grid grid-cols-2 border-t border-on-dark/60 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:self-end">
          <div className="@container flex flex-col-reverse justify-end pr-4 pt-4">
            <dt className="mt-2 text-small text-on-dark-muted">Check-in{inRest.length ? `, ${inRest.join(", ")}` : ""}</dt>
            <dd className="display-cut whitespace-nowrap text-[length:min(clamp(2rem,1.2rem+2.6vw,3.5rem),20cqw)] leading-none tabular">{inTime}</dd>
          </div>
          <div className="@container flex flex-col-reverse justify-end border-l border-on-dark-muted/40 pl-4 pt-4 lg:pl-6">
            <dt className="mt-2 text-small text-on-dark-muted">Check-out</dt>
            <dd className="display-cut whitespace-nowrap text-[length:min(clamp(2rem,1.2rem+2.6vw,3.5rem),20cqw)] leading-none tabular">{checkOut}</dd>
          </div>
        </dl>

        <ol className="col-span-4 grid gap-x-col border-t border-on-dark/60 md:col-span-8 md:grid-cols-2 lg:col-span-12 lg:grid-cols-4">
          {sequence.map((it, i) => (
            <li key={it.title} className="border-b border-on-dark-muted/30 py-5 md:border-b-0 lg:pr-4">
              <span aria-hidden="true" className="apparatus text-on-dark-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 font-serif text-h3">{it.title}</h3>
              <p className="mt-2 text-small text-on-dark-muted">{it.body}</p>
            </li>
          ))}
        </ol>

        <div className="col-span-4 md:col-span-8 lg:col-span-12">
          <h3 className="apparatus border-b border-on-dark-muted/40 pb-2 text-on-dark-muted">Also worth knowing</h3>
          <div className="grid gap-x-col md:grid-cols-2 lg:grid-cols-3">
            {notes.map((it) => (
              <div key={it.title} className="border-b border-on-dark-muted/25 py-4">
                <h4 className="text-small font-medium">{it.title}</h4>
                <p className="mt-1 text-small text-on-dark-muted">{it.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Grid>
    </section>
  );
}
