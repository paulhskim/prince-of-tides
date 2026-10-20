import Link from "next/link";
import { theSpace } from "@/content/copy";
import { getGalleryPhotos } from "@/lib/photos";
import { Grid, SectionTitle } from "../layout";
import { sentenceCase, smart, splitHeading } from "../text";

/**
 * II. The rooms: a schedule, set as type alone. Each room is one row: its name, a sentence about
 * it, and what is in it. The photographs have their own passage (the plates) directly after.
 */
export function TheSpace() {
  const { numeral, title } = splitHeading(theSpace.heading);
  const hasAnyPhoto = getGalleryPhotos().length > 0;

  return (
    <section id="the-space" aria-labelledby="space-title" className="py-section">
      <Grid>
        <div className="col-span-4 border-t border-ink pt-6 md:col-span-8 lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-col">
          <SectionTitle id="space-title" numeral={numeral} className="lg:col-span-5">
            {title}
          </SectionTitle>
          <p className="mt-5 max-w-measure font-serif text-lead oldstyle lg:col-span-6 lg:col-start-7 lg:mt-2">
            {theSpace.intro}
          </p>
        </div>

        <div className="col-span-4 mt-10 md:col-span-8 lg:col-span-12 lg:mt-14">
          <div className="hidden grid-cols-12 gap-x-col border-b border-ink pb-2 lg:grid">
            <span className="smallcaps col-span-3 text-ink-muted">Room</span>
            <span className="smallcaps col-span-5 col-start-4 text-ink-muted">Character</span>
            <span className="smallcaps col-span-4 col-start-9 text-ink-muted">Particulars</span>
          </div>
          <ol>
            {theSpace.rooms.map((room) => {
              return (
                <li
                  key={room.name}
                  className="grid grid-cols-4 gap-x-col border-b border-rule py-6 first:border-t first:border-t-ink md:grid-cols-8 lg:grid-cols-12 lg:py-7 lg:first:border-t-0"
                >
                  <div className="col-span-4 md:col-span-3 lg:col-span-3">
                    <h3 className="font-serif text-[clamp(1.5rem,1.25rem+0.9vw,2rem)] font-light leading-tight tracking-[-0.015em]">
                      {sentenceCase(room.name).replace("&", "and")}
                    </h3>
                  </div>
                  <p className="col-span-4 mt-2 max-w-[30rem] font-serif text-prose oldstyle md:col-span-5 md:mt-0 lg:col-span-5 lg:col-start-4">
                    {smart(room.body)}
                  </p>
                  <ul className="col-span-4 mt-4 text-small md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:mt-1">
                    {room.details.map((d) => (
                      <li key={d} className="py-0.5">
                        {d}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
          {!hasAnyPhoto ? (
            <p className="mt-4 text-caption text-ink-muted">
              Photographs of the rooms are being made. <Link href="/gallery">The list of plates</Link>
            </p>
          ) : null}
        </div>
      </Grid>
    </section>
  );
}
