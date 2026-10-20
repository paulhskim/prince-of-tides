import Link from "next/link";
import { theSpace } from "@/content/copy";
import { getGalleryPhotos, photoFor, type PhotoSlot } from "@/lib/photos";
import { Grid, SectionTitle } from "../layout";
import { Photo } from "../Photo";
import { sentenceCase, splitHeading } from "../text";

/** Which photograph, if the owner has supplied one, belongs beside each room. */
const ROOM_SLOT: Record<string, PhotoSlot> = {
  "Bedroom 1": "bedroom1",
  "Bedroom 2": "bedroom2",
  Bathrooms: "bath",
  "Kitchen & Dining": "kitchen",
  Living: "living",
};

/**
 * II. The rooms: a schedule. Each room is one row: its name, a sentence about it, and what is in
 * it. When a room has a photograph, a small plate sits under its name; otherwise nothing does.
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
            <span className="apparatus col-span-3 text-ink-muted">Room</span>
            <span className="apparatus col-span-5 col-start-4 text-ink-muted">Character</span>
            <span className="apparatus col-span-4 col-start-9 text-ink-muted">Particulars</span>
          </div>
          <ol>
            {theSpace.rooms.map((room) => {
              const photo = photoFor(ROOM_SLOT[room.name] ?? "other");
              return (
                <li
                  key={room.name}
                  className="grid grid-cols-4 gap-x-col border-b border-rule py-6 first:border-t first:border-t-ink md:grid-cols-8 lg:grid-cols-12 lg:py-7 lg:first:border-t-0"
                >
                  <div className="col-span-4 md:col-span-3 lg:col-span-3">
                    <h3 className="font-serif text-h3">{sentenceCase(room.name)}</h3>
                    {photo ? (
                      <figure className="mt-4">
                        <Photo photo={photo} slot={ROOM_SLOT[room.name]} ratio="4/3" sizes="(min-width:1024px) 22vw, 100vw" />
                      </figure>
                    ) : null}
                  </div>
                  <p className="col-span-4 mt-2 max-w-[30rem] font-serif text-prose oldstyle md:col-span-5 md:mt-0 lg:col-span-5 lg:col-start-4">
                    {room.body}
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
