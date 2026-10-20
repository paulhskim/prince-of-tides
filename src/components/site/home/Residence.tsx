import { intro, particulars } from "@/content/copy";
import { Grid, SectionTitle } from "../layout";
import { smart, splitHeading } from "../text";

/**
 * I. The residence: a spread. The opening paragraph is set large, the rest runs in two short
 * columns, and the particulars stand beside it as a specification sheet.
 */
export function Residence() {
  const { numeral, title } = splitHeading(intro.heading);
  const [first, ...rest] = intro.paragraphs.map(smart);
  // A book-style lead-in: the opening words set in letterspaced capitals.
  const lead = first.startsWith("Prince of Tides") ? "Prince of Tides" : "";
  return (
    <section id="residence" aria-labelledby="residence-title" className="pb-section-sm pt-section-sm lg:pt-section">
      <Grid className="gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <SectionTitle id="residence-title" numeral={numeral}>
            {title}
          </SectionTitle>
          <p data-reveal className="mt-8 font-serif text-[clamp(1.375rem,1.1rem+1.1vw,1.9375rem)] font-light leading-[1.3] tracking-[-0.008em] oldstyle lg:mt-12">
            {lead ? (
              <>
                <span className="text-[0.78em] font-normal uppercase tracking-[0.09em]">{lead}</span>
                {first.slice(lead.length)}
              </>
            ) : (
              first
            )}
          </p>
          <div data-reveal className="mt-10 gap-x-col font-serif text-prose oldstyle md:columns-2 [&>p]:mb-[1em] [&>p]:break-inside-avoid">
            {rest.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:pl-[clamp(0rem,-2rem+3vw,2rem)] lg:pt-3">
          <h3 className="smallcaps flex items-baseline justify-between border-y border-ink py-3">
            {particulars.heading}
            <span className="font-serif text-small normal-case italic tracking-normal text-ink-muted">The residence at a glance</span>
          </h3>
          <dl className="grid grid-cols-2 gap-x-col text-small">
            {particulars.items.map((item) => (
              <div key={item.label} className="border-b border-rule py-3">
                <dt className="smallcaps text-ink-muted">{item.label}</dt>
                <dd className="mt-1 tabular">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Grid>
    </section>
  );
}
