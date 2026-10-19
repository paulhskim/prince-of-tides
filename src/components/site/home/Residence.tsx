import { intro, particulars } from "@/content/copy";
import { Grid, MarginLabel } from "../layout";
import { splitHeading } from "../text";

export function Residence() {
  const { numeral, title } = splitHeading(intro.heading);
  const [first, ...rest] = intro.paragraphs;
  return (
    <section id="residence" aria-labelledby="residence-title" className="py-section-lg">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />
        <MarginLabel numeral={numeral} className="col-span-4 mb-3 md:col-span-8 lg:col-span-3 lg:mb-0">
          The stay
        </MarginLabel>
        <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-4">
          <h2 id="residence-title" className="text-h2">
            {title}
          </h2>
          <p className="mt-6 max-w-measure font-serif text-lead">{first}</p>
          <div className="mt-5 max-w-measure space-y-[1em] font-serif text-prose">
            {rest.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>
        <div className="col-span-4 mt-12 md:col-span-6 lg:col-span-4 lg:col-start-9 lg:mt-1">
          <h3 className="border-t border-ink pt-3 font-sans text-label font-medium">{particulars.heading}</h3>
          <dl className="mt-2 text-small">
            {particulars.items.map((item) => (
              <div key={item.label} className="grid grid-cols-[7.5rem_1fr] gap-x-4 border-b border-rule py-2.5">
                <dt className="text-ink-muted">{item.label}</dt>
                <dd className="tabular">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Grid>
    </section>
  );
}
