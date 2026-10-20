import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Grid, PageHeader } from "@/components/site/layout";
import { roman } from "@/components/site/text";
import { areaPhotos } from "@/lib/area-photos";

export const metadata: Metadata = {
  title: "Photography and credits",
  description:
    "Credits and licenses for the Hilton Head Island area photographs and the map used on the Prince of Tides website.",
  alternates: { canonical: "/credits" },
};

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-baseline gap-1">
      {children}
      <ArrowUpRight aria-hidden="true" size={12} strokeWidth={1.25} className="shrink-0 self-center" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}

export default function CreditsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Credits"
        folio="Photography, maps and licenses"
        title="Photography and credits"
        lead={
          <p>
            The photographs of the residence are of the residence itself. The island photographs are the work of other
            photographers, shared under open licenses, and are credited here in full. They show places on Hilton Head
            Island, not the residence or Hilton Head Resort.
          </p>
        }
        aside={
          <p className="border-t border-ink pt-3 text-caption text-ink-muted">
            Every island photograph on this site has been resized and compressed for the web. No other changes have been
            made.
          </p>
        }
      />

      <Grid className="pb-section">
        <section aria-labelledby="island-title" className="col-span-4 md:col-span-8 lg:col-span-12">
          <div className="flex items-baseline justify-between gap-6 border-t border-ink pt-3">
            <h2 id="island-title" className="text-h3">
              <span aria-hidden="true" className="mr-3 font-serif text-body italic text-brass">
                I
              </span>
              The island photographs
            </h2>
            <p className="smallcaps hidden text-ink-muted md:block">{areaPhotos.length} plates</p>
          </div>

          <div className="smallcaps mt-8 hidden grid-cols-12 gap-x-col border-b border-ink pb-2.5 text-ink-muted lg:grid" aria-hidden="true">
            <span className="col-span-2">Plate</span>
            <span className="col-span-4">Subject</span>
            <span className="col-span-3">Photographer and license</span>
            <span className="col-span-3">Source</span>
          </div>

          <ol className="mt-6 border-t border-ink lg:mt-0 lg:border-t-0">
            {areaPhotos.map((p, i) => (
              <li
                key={p.id}
                id={p.id}
                className="grid scroll-mt-28 grid-cols-[6rem_minmax(0,1fr)] gap-x-col gap-y-3 border-b border-rule py-5 md:grid-cols-[9rem_minmax(0,1fr)] lg:grid-cols-12"
              >
                <div className="lg:col-span-2">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    width={p.width}
                    height={p.height}
                    sizes="(min-width:1024px) 160px, (min-width:768px) 144px, 96px"
                    quality={65}
                    className="block h-auto w-full bg-stone"
                  />
                  <p className="mt-2 font-serif text-small italic text-brass">Plate {roman(i + 1)}</p>
                </div>
                <div className="lg:col-span-4">
                  <p className="font-serif text-[1.125rem] leading-snug">{p.caption}</p>
                  <p className="mt-2 text-caption text-ink-muted">{p.changes}</p>
                </div>
                <div className="col-start-2 text-small lg:col-span-3 lg:col-start-auto">
                  <p>{p.creator}</p>
                  <p className="mt-1">
                    <External href={p.licenseUrl}>{p.license}</External>
                  </p>
                </div>
                <div className="col-start-2 text-small lg:col-span-3 lg:col-start-auto">
                  <External href={p.sourceUrl}>Wikimedia Commons</External>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="map-title" className="col-span-4 mt-16 md:col-span-8 lg:col-span-6 lg:mt-20">
          <h2 id="map-title" className="border-t border-ink pt-3 text-h3">
            <span aria-hidden="true" className="mr-3 font-serif text-body italic text-brass">
              II
            </span>
            The map
          </h2>
          <p className="mt-4 max-w-measure font-serif text-prose">
            The area map is drawn with tiles from <External href="https://openfreemap.org">OpenFreeMap</External>, using
            the <External href="https://www.openmaptiles.org/">OpenMapTiles</External> schema, from map data by{" "}
            <External href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</External>, available
            under the Open Database License.
          </p>
        </section>

        <section aria-labelledby="residence-title" className="col-span-4 mt-16 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:mt-20">
          <h2 id="residence-title" className="border-t border-ink pt-3 text-h3">
            <span aria-hidden="true" className="mr-3 font-serif text-body italic text-brass">
              III
            </span>
            The residence
          </h2>
          <p className="mt-4 max-w-measure font-serif text-prose">
            Interior photographs are of the residence itself, Prince of Tides at Hilton Head Resort. Island photographs
            are captioned with what they show and where; none of them shows the residence or the resort.
          </p>
        </section>
      </Grid>
    </>
  );
}
