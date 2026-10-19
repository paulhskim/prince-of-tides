import { arrival, particulars } from "@/content/copy";
import { Grid } from "../layout";
import { splitHeading, withoutTodos } from "../text";

export function Arrival() {
  const { numeral, title } = splitHeading(arrival.heading);
  const items = arrival.items.map((it) => ({ ...it, body: withoutTodos(it.body) })).filter((it) => it.body);
  // The first four notes run in the order of a stay: gate, code, check-in, check-out.
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
      <Grid>
        <div className="col-span-4 md:col-span-8 lg:col-span-5">
          {numeral ? (
            <span aria-hidden="true" className="block font-serif text-h3 leading-none text-on-dark-muted">
              {numeral}
            </span>
          ) : null}
          <p className="mt-2 text-label text-on-dark-muted">Arrival</p>
          <h2 id="arrival-title" className="mt-6 text-h2">
            {title}
          </h2>
          <p className="mt-5 max-w-[26rem] font-serif text-lead text-on-dark-muted">{arrival.intro}</p>

          <dl className="mt-10 grid grid-cols-2 border-t border-on-dark-muted/50 lg:mt-14 lg:block">
            <div className="flex flex-col-reverse justify-end py-5 pr-4 lg:border-b lg:border-on-dark-muted/30">
              <dt className="mt-2 text-label text-on-dark-muted">
                Check-in{inRest.length ? `, ${inRest.join(", ")}` : ""}
              </dt>
              <dd className="font-serif text-h1 tabular">{inTime}</dd>
            </div>
            <div className="flex flex-col-reverse justify-end border-l border-on-dark-muted/30 py-5 pl-4 lg:border-l-0 lg:pl-0">
              <dt className="mt-2 text-label text-on-dark-muted">Check-out</dt>
              <dd className="font-serif text-h1 tabular">{checkOut}</dd>
            </div>
          </dl>
        </div>

        <div className="col-span-4 mt-14 md:col-span-8 lg:col-span-6 lg:col-start-7 lg:mt-0">
          <ol className="border-t border-on-dark-muted/50">
            {sequence.map((it, i) => (
              <li key={it.title} className="grid grid-cols-[2.75rem_1fr] border-b border-on-dark-muted/30 py-5">
                <span aria-hidden="true" className="font-serif text-h3 leading-none text-on-dark-muted tabular">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-sans text-body font-medium">{it.title}</h3>
                  <p className="mt-1.5 text-small text-on-dark-muted">{it.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <h3 className="mt-12 font-sans text-label font-medium text-on-dark-muted">Also worth knowing</h3>
          <div className="mt-3 grid gap-x-col border-t border-on-dark-muted/50 md:grid-cols-2">
            {notes.map((it, i) => (
              <div
                key={it.title}
                className={`border-b border-on-dark-muted/30 py-4 ${
                  notes.length % 2 === 1 && i === notes.length - 1 ? "md:col-span-2" : ""
                }`}
              >
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
