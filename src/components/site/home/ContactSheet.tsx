import Link from "next/link";
import { getGalleryPhotos, SLOTS, type Photo as PhotoType, type PhotoSlot } from "@/lib/photos";
import { Grid } from "../layout";
import { Photo } from "../Photo";
import { frame } from "../text";

/** Five frames on the home page once photographs exist. Planned shots fill any gaps. */
const PLANNED: PhotoSlot[] = ["bedroom1", "dining", "bedroom2", "bath", "detail"];

const LAYOUT = [
  // lg: frame 1 tall at left, frames 2 and 5 stacked in the middle, 3 and 4 narrow at right.
  { cls: "lg:col-span-4 lg:row-span-2", ratio: "aspect-[4/5]" },
  { cls: "lg:col-span-4 lg:col-start-5", ratio: "aspect-[3/2]" },
  { cls: "lg:col-span-2 lg:col-start-9 lg:row-span-2", ratio: "aspect-[3/4]" },
  { cls: "lg:col-span-2 lg:col-start-11 lg:row-span-2 lg:mt-16", ratio: "aspect-[3/4]" },
  { cls: "lg:col-span-4 lg:col-start-5 lg:row-start-2", ratio: "aspect-[3/2]" },
];

function shotCaption(slot: PhotoSlot): string {
  const s = SLOTS[slot].shot;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function ContactSheet() {
  const all = getGalleryPhotos();
  // The first five gallery frames, so frame numbers match /gallery.
  const picks: (PhotoType | undefined)[] = all.slice(0, 5);
  while (picks.length < 5) picks.push(undefined);
  const count = all.length;
  // Without photographs the home page shows no empty frames; the rooms section links the plate list.
  if (count === 0) return null;

  return (
    <section aria-labelledby="sheet-title" className="py-section-sm">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />
        <h2 id="sheet-title" className="col-span-4 mb-5 font-sans text-label font-medium text-ink-muted md:col-span-8 lg:col-span-12">
          Contact sheet
        </h2>
      </Grid>

      {/* Mobile and tablet: a scroll-snap strip with a visible next frame */}
      <ol
        aria-label="Selected photographs"
        className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-[var(--spacing-gutter)] px-gutter lg:hidden"
      >
        {picks.map((p, i) => (
          <li key={i} className="w-[78vw] max-w-[26rem] shrink-0 snap-start">
            <Link href={`/gallery#frame-${frame(i + 1)}`} className="block no-underline">
              <Photo photo={p} slot={PLANNED[i]} ratio="3/2" sizes="78vw" quiet />
              <span className="mt-2 block text-caption text-ink-muted">
                <span className="tabular">{frame(i + 1)}</span>&ensp;{p ? p.caption : shotCaption(PLANNED[i])}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* Desktop: the composed sheet */}
      <Grid className="hidden gap-y-6 lg:grid lg:grid-rows-[auto_auto]">
        {picks.map((p, i) => (
          <figure key={i} className={LAYOUT[i].cls}>
            <Link href={`/gallery#frame-${frame(i + 1)}`} className="block no-underline">
              <Photo photo={p} slot={PLANNED[i]} ratioClass={LAYOUT[i].ratio} sizes="(min-width:1024px) 25vw, 50vw" quiet />
            </Link>
            <figcaption className="mt-2 text-caption text-ink-muted">
              <span className="tabular">{frame(i + 1)}</span>&ensp;{p ? p.caption : shotCaption(PLANNED[i])}
            </figcaption>
          </figure>
        ))}
      </Grid>

      <Grid className="mt-8">
        <div className="col-span-full flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
          <p className="text-small text-ink-muted">
            {count > 0 ? `${count} photographs, captioned room by room` : "Photographs of the residence and resort are being made"}
          </p>
          <Link
            href="/gallery"
            className="inline-flex h-12 items-center border border-ink px-6 font-medium text-ink no-underline transition-colors duration-100 hover:bg-ink hover:text-paper"
          >
            View all photographs
          </Link>
        </div>
      </Grid>
    </section>
  );
}
