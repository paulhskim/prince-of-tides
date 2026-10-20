import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { pageBreadcrumb } from "@/lib/seo/schema";
import Link from "next/link";
import { GalleryGroups, type FrameGroup } from "@/components/site/gallery/GalleryGroups";
import { PLANNED_SHOTS } from "@/components/site/gallery/plan";
import { Grid } from "@/components/site/layout";
import { hero } from "@/content/copy";
import { getGalleryPhotos, GROUP_LABELS, type PhotoGroup } from "@/lib/photos";

export const metadata = pageMetadata("gallery");

const ORDER: PhotoGroup[] = ["residence", "resort", "beach"];

export default function GalleryPage() {
  const photos = getGalleryPhotos();
  const hasPhotos = photos.length > 0;

  // Number frames in the order photos were supplied, then group them.
  const source = hasPhotos
    ? photos.map((p, i) => ({ group: p.group, frame: { n: i + 1, src: p.src, alt: p.alt, caption: p.caption } }))
    : PLANNED_SHOTS.map((s) => ({ group: s.group, frame: { n: 0, alt: s.shot, caption: s.shot } }));

  let counter = 0;
  const groups: FrameGroup[] = ORDER.map((g) => ({
    id: g,
    label: GROUP_LABELS[g],
    frames: source
      .filter((s) => s.group === g)
      .map((s) => ({ ...s.frame, caption: s.frame.caption.charAt(0).toUpperCase() + s.frame.caption.slice(1) })),
  }))
    .filter((g) => g.frames.length > 0)
    .map((g) => ({
      ...g,
      // Placeholders are numbered in display order; real photos keep their supplied order.
      frames: g.frames.map((f) => (hasPhotos ? f : { ...f, n: ++counter })),
    }));

  return (
    <>
      <JsonLd data={pageBreadcrumb("gallery")} />
      <header className="pb-section-sm pt-10 lg:pt-16">
        <Grid>
          <p className="col-span-4 mb-3 text-label text-ink-muted md:col-span-8 lg:col-span-3 lg:mb-0">{hero.eyebrow}</p>
          <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-4">
            <h1 className="text-h1">Photographs</h1>
            <p className="mt-5 max-w-measure font-serif text-lead">
              {hasPhotos
                ? `${photos.length} photographs of the residence, the resort and the way to the beach. Select any frame to view it larger.`
                : "Photographs of the residence, the resort and the way to the beach are being made. Until they arrive, this is the list of plates: what each frame will show."}
            </p>
          </div>
          <nav aria-label="Photograph sections" className="col-span-4 mt-8 md:col-span-8 lg:col-span-9 lg:col-start-4">
            <ul className="flex flex-wrap gap-x-6 text-small">
              {groups.map((g) => (
                <li key={g.id}>
                  <a href={`#${g.id}`} className="inline-flex min-h-11 items-center">
                    {g.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Grid>
      </header>

      <GalleryGroups groups={groups} />

      <div className="py-section-sm">
        <Grid>
          <div className="col-span-full flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
            <p className="font-serif text-lead">{hero.headline}</p>
            <Link
              href="/#reserve"
              className="inline-flex h-12 items-center bg-marsh px-6 font-medium text-sheet no-underline hover:bg-marsh-hover"
            >
              {hero.primaryCta.label}
            </Link>
          </div>
        </Grid>
      </div>
    </>
  );
}
