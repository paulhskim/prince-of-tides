import Link from "next/link";
import { getGalleryPhotos, type Photo as PhotoType } from "@/lib/photos";
import { Grid, RunningHead } from "../layout";
import { Photo } from "../Photo";
import { frame, roman } from "../text";

/**
 * The plates: a night passage after the rooms, where the photographs are given room. Each is shown
 * whole at its own ratio, numbered like a plate in a monograph and captioned beside it. Plate I is
 * the cover; this passage carries the next three, then leads to the full set.
 */
export function ContactSheet() {
  const all = getGalleryPhotos();
  // Without photographs the home page shows no empty frames; the rooms section links the plate list.
  if (all.length < 2) return null;
  const numbered = all.map((p, i) => ({ photo: p, n: i + 1 }));
  const [lead, ...pair] = numbered.slice(1, 4);

  return (
    <section data-surface="dark" aria-labelledby="sheet-title" className="bg-pluff pb-section-lg pt-section text-on-dark">
      <div className="mx-auto max-w-page px-gutter">
        <RunningHead tone="dark" left={<span id="sheet-title">The plates</span>} right={`${all.length} photographs of the residence`} />
      </div>

      <Grid className="mt-12 gap-y-14 lg:mt-20 lg:gap-y-0">
        {lead ? (
          <Plate
            item={lead}
            className="col-span-4 md:col-span-8 lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-col"
            frameClass="lg:col-span-8"
            captionClass="lg:col-span-3 lg:col-start-10 lg:mt-0 lg:self-end"
            sizes="(min-width:1280px) 840px, (min-width:1024px) 64vw, 100vw"
          />
        ) : null}
        {pair[0] ? (
          <Plate item={pair[0]} className="col-span-4 md:col-span-5 lg:col-span-5 lg:col-start-2 lg:mt-28" sizes="(min-width:1024px) 40vw, 100vw" />
        ) : null}
        {pair[1] ? (
          <Plate item={pair[1]} className="col-span-4 md:col-span-6 md:col-start-3 lg:col-span-5 lg:col-start-8 lg:mt-56" sizes="(min-width:1024px) 40vw, 100vw" />
        ) : null}
      </Grid>

      <Grid className="mt-16 lg:mt-24">
        <div className="col-span-full flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-t border-on-dark/25 pt-6">
          <p className="font-serif text-lead font-light italic text-on-dark-muted">
            Plates I to {roman(all.length)}, captioned room by room.
          </p>
          <Link href="/gallery" className="btn btn-on-dark min-h-12">
            View all photographs
          </Link>
        </div>
      </Grid>
    </section>
  );
}

function Plate({
  item,
  className,
  frameClass = "",
  captionClass = "",
  sizes,
}: {
  item: { photo: PhotoType; n: number };
  className: string;
  frameClass?: string;
  captionClass?: string;
  sizes: string;
}) {
  const { photo, n } = item;
  return (
    <figure data-reveal="plate" className={className}>
      <Link href={`/gallery#frame-${frame(n)}`} className={`block no-underline ${frameClass}`}>
        <Photo photo={photo} slot={photo.slot} ratio="3/2" sizes={sizes} />
        <span className="sr-only">View plate {roman(n)} in the photographs</span>
      </Link>
      <figcaption className={`mt-4 ${captionClass}`}>
        <span className="smallcaps block text-brass-light">Plate {roman(n)}</span>
        <span className="mt-1.5 block max-w-[18rem] font-serif text-body italic leading-snug text-on-dark-muted">{photo.caption}</span>
      </figcaption>
    </figure>
  );
}
