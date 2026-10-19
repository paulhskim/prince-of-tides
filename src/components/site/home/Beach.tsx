import { beachAccess, particulars } from "@/content/copy";
import { areaGuide } from "@/content/area-guide";
import { photoFor } from "@/lib/photos";
import { Grid, MarginLabel } from "../layout";
import { Photo } from "../Photo";
import { splitHeading } from "../text";

/** The route as a genuine sequence. Stop notes are fragments of the copy. */
const ROUTE = [
  { name: "Building 3", note: "Beside the indoor atrium" },
  { name: "Marsh boardwalk", note: "A private raised walk over the salt marsh" },
  { name: "The beach", note: "Coco's on the Beach at the far end" },
];

export function Beach() {
  const { numeral, title } = splitHeading(beachAccess.heading);
  const wide = photoFor("boardwalk");
  const beachDistance = particulars.items.find((p) => p.label === "Beach")?.value;
  const beaches = areaGuide.categories.find((c) => c.id === "beaches")?.places ?? [];

  return (
    <section id="beach" aria-labelledby="beach-title" className="py-section-lg">
      <figure className="mx-auto max-w-bleed">
        <Photo
          photo={wide}
          slot="boardwalk"
          ratioClass="aspect-[4/3] md:aspect-[21/9]"
          sizes="100vw"
          placeholderLabel="the boardwalk across the salt marsh, wide, toward the beach"
        />
        {wide ? (
          <figcaption className="mx-auto mt-2 max-w-page px-gutter text-caption text-ink-muted">{wide.caption}</figcaption>
        ) : null}
      </figure>

      <Grid className="mt-14 lg:mt-20">
        <MarginLabel numeral={numeral} className="col-span-4 mb-3 md:col-span-8 lg:col-span-3 lg:mb-0">
          The trade-off, plainly
        </MarginLabel>
        <div className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-4">
          <h2 id="beach-title" className="text-h2">
            {title}
          </h2>
          <p className="mt-6 max-w-measure font-serif text-prose">{beachAccess.body}</p>

          {/* Route line */}
          <div className="mt-14">
            <ol className="grid gap-0 md:grid-cols-3">
              {ROUTE.map((stop, i) => (
                <li key={stop.name} className="relative pb-8 pl-8 md:pb-0 md:pl-0 md:pt-8 md:pr-6">
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1.5 size-[9px] rounded-round border border-ink bg-paper md:top-0"
                  />
                  {i < ROUTE.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-[4px] top-[15px] w-px bg-ink md:bottom-auto md:left-[9px] md:right-0 md:top-[4px] md:h-px md:w-auto"
                    />
                  ) : null}
                  <span className="block font-serif text-h3">{stop.name}</span>
                  <span className="mt-1 block text-small text-ink-muted">{stop.note}</span>
                </li>
              ))}
            </ol>
            {beachDistance ? (
              <p className="mt-6 border-t border-rule pt-3 text-small tabular md:mt-8">{beachDistance}</p>
            ) : null}
          </div>

          <div className="mt-14 grid gap-x-col gap-y-12 md:grid-cols-8 lg:grid-cols-9">
            <div className="md:col-span-4 lg:col-span-5">
              <h3 className="font-sans text-label font-medium">An afternoon, in order</h3>
              <ol className="mt-3 border-t border-ink">
                {beachAccess.steps.map((s, i) => (
                  <li key={s} className="grid grid-cols-[2.5rem_1fr] border-b border-rule py-3 text-small">
                    <span className="font-serif text-body text-ink-muted tabular">{i + 1}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-caption text-ink-muted">{beachAccess.footnote}</p>
            </div>

            {beaches.length ? (
              <div className="md:col-span-4 lg:col-span-4">
                <table className="w-full text-left text-small">
                  <caption className="pb-3 text-left font-sans text-label font-medium">
                    Nearby beaches, distances approx.
                  </caption>
                  <tbody className="border-t border-ink">
                    {beaches.map((b) => (
                      <tr key={b.name} className="border-b border-rule align-top">
                        <th scope="row" className="py-3 pr-4 font-normal">
                          {b.name}
                        </th>
                        <td className="whitespace-nowrap py-3 text-right tabular">
                          {b.distanceMiles !== null ? `${b.distanceMiles} mi` : ""}
                          <span className="block text-caption text-ink-muted">
                            {b.mode === "walk" ? "on foot" : b.driveMinutes ? `${b.driveMinutes} min drive` : ""}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </Grid>
    </section>
  );
}
