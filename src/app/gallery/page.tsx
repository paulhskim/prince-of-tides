import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { pageBreadcrumb } from "@/lib/seo/schema";
import Link from "next/link";
import { GalleryGroups, type FrameGroup } from "@/components/site/gallery/GalleryGroups";
import { PLANNED_SHOTS } from "@/components/site/gallery/plan";
import { Grid, PageHeader } from "@/components/site/layout";
import { roman } from "@/components/site/text";
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
      <PageHeader
        eyebrow={hero.eyebrow}
        folio={hasPhotos ? `Plates I to ${roman(photos.length)}` : "The list of plates"}
        title="Photographs"
        lead={
          hasPhotos
            ? `${photos.length} photographs of the residence, the resort and the way to the beach. Select any plate to view it larger.`
            : "Photographs of the residence, the resort and the way to the beach are being made. Until they arrive, this is the list of plates: what each frame will show."
        }
        aside={
          groups.length > 1 ? (
            <nav aria-label="Photograph sections">
              <ul className="border-t border-ink">
                {groups.map((g) => (
                  <li key={g.id} className="border-b border-rule">
                    <a href={`#${g.id}`} className="flex min-h-11 items-center font-serif text-body no-underline hover:underline">
                      {g.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : (
            <nav aria-label="Photograph sections">
              <a href={`#${groups[0]?.id ?? "residence"}`} className="link-caps">
                {groups[0]?.label ?? "The residence"}
              </a>
            </nav>
          )
        }
      />

      <GalleryGroups groups={groups} />

      <div className="py-section-sm">
        <Grid>
          <div className="col-span-full flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-5">
            <p className="font-serif text-lead font-light italic">{hero.headline}</p>
            <Link href="/#reserve" className="btn btn-primary min-h-13">
              {hero.primaryCta.label}
            </Link>
          </div>
        </Grid>
      </div>
    </>
  );
}
