import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { pageBreadcrumb } from "@/lib/seo/schema";
import { Grid, PageHeader } from "@/components/site/layout";
import { roman, sentenceCase, smart } from "@/components/site/text";
import { areaGuide } from "@/content/area-guide";
import { dayInTheLife, experiences, seasons } from "@/content/experiences";
import { EstateMap } from "@/components/maps/EstateMap";
import { CreditedPhoto } from "@/components/area/CreditedPhoto";
import { Experiences } from "@/components/area/Experiences";
import { DayOnTheIsland } from "@/components/area/DayOnTheIsland";
import { PlaceCategory } from "@/components/area/PlaceDirectory";
import { Seasons } from "@/components/area/Seasons";
import type { AreaPhotoId } from "@/lib/area-photos";

export const metadata = pageMetadata("area");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function verified(v: string): string {
  const [y, m] = v.split("-").map(Number);
  return m ? `${MONTHS[m - 1]} ${y}` : v;
}

/** Category plates. Only where a photograph honestly belongs with the category. */
const PLATES: Partial<Record<string, AreaPhotoId>> = {
  beaches: "hilton-head-beach-driftwood",
  "things-to-do": "harbour-town-marina",
};

function SectionHead({
  id,
  numeral,
  label,
  title,
  lead,
}: {
  id: string;
  numeral: number;
  label: string;
  title: React.ReactNode;
  lead?: string;
}) {
  return (
    <div className="grid grid-cols-4 gap-x-col gap-y-6 md:grid-cols-8 lg:grid-cols-12">
      <div className="col-span-4 border-t border-ink pt-3 md:col-span-8 lg:col-span-3">
        <p className="flex items-baseline gap-3">
          <span aria-hidden="true" className="font-serif text-body italic text-brass">
            {roman(numeral)}
          </span>
          <span className="smallcaps text-ink-muted">{label}</span>
        </p>
      </div>
      <div className="col-span-4 border-t border-ink pt-3 md:col-span-8 lg:col-span-8 lg:col-start-5">
        <h2 id={id} className="display-cut text-h1">
          {title}
        </h2>
        {lead ? <p className="mt-6 max-w-measure font-serif text-lead oldstyle">{smart(lead)}</p> : null}
      </div>
    </div>
  );
}

export default function AreaPage() {
  const { categories } = areaGuide;
  const lastChecked = verified(areaGuide.lastVerified);

  // Contents: the editorial half, then the directory categories, then the seasons.
  const contents: { id: string; title: string; count?: number }[] = [
    { id: "draws", title: "Reasons to come" },
    { id: "day", title: "A day on the island" },
    { id: "map", title: "The map" },
    ...categories.map((c) => ({ id: c.id, title: sentenceCase(c.title.replace("&", "and")), count: c.places.length })),
    { id: "seasons", title: "Through the year" },
  ];
  const offset = 3; // directory numerals continue after the three editorial sections

  return (
    <>
      <JsonLd data={pageBreadcrumb("area")} />
      <PageHeader
        eyebrow="The island"
        folio={`Area guide, last checked ${lastChecked}`}
        title={sentenceCase(areaGuide.intro.heading)}
        lead={smart(areaGuide.intro.body)}
        aside={
          <p className="border-t border-ink pt-3 text-caption text-ink-muted">
            {areaGuide.distanceDisclaimer} Island photographs show places on Hilton Head, not the residence.{" "}
            <Link href="/credits">Photography credits</Link>.
          </p>
        }
      />

      {/* Opening plate: the salt marsh, shown whole. */}
      <div className="mx-auto max-w-bleed px-gutter 2xl:px-0">
        <CreditedPhoto
          id="fish-haul-creek-salt-marsh"
          sizes="(min-width:1600px) 1600px, 100vw"
          priority
          captionPosition="side"
          className="2xl:[&_figcaption]:pr-gutter"
        />
      </div>

      {/* Contents */}
      <Grid className="pt-section-sm">
        <nav aria-label="Area guide contents" className="col-span-4 md:col-span-8 lg:col-span-12">
          <p className="smallcaps border-t border-ink pt-3">Contents</p>
          <ol className="mt-1 grid gap-x-col text-small md:grid-cols-2 lg:grid-cols-4">
            {contents.map((c, i) => (
              <li key={c.id} className="border-b border-rule">
                <a href={`#${c.id}`} className="grid min-h-11 grid-cols-[2.5rem_1fr_auto] items-center no-underline hover:underline">
                  <span className="font-serif text-small italic text-brass">{roman(i + 1)}</span>
                  <span>{c.title}</span>
                  {c.count ? <span className="text-caption text-ink-muted tabular">{c.count}</span> : <span />}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </Grid>

      {/* I. Reasons to come */}
      <section aria-labelledby="draws-title" id="draws" className="scroll-mt-28 py-section">
        <div className="mx-auto max-w-page px-gutter">
          <SectionHead
            id="draws-title"
            numeral={1}
            label="Reasons to come"
            title={
              <>
                Eight reasons <span className="display-italic">to</span> come
              </>
            }
            lead="Dolphins in the sound, a lighthouse to climb, a refuge at dawn and a beach reached on foot. The particulars are under each one."
          />
          <div className="mt-[clamp(3rem,2rem+4vw,6rem)]">
            <Experiences items={experiences} />
          </div>
        </div>
      </section>

      {/* II. A day on the island */}
      <section aria-labelledby="day-title" id="day" className="scroll-mt-28 bg-stone py-section">
        <div className="mx-auto max-w-page px-gutter">
          <SectionHead
            id="day-title"
            numeral={2}
            label="A day on the island"
            title={
              <>
                An unhurried day, <span className="display-italic">by the</span> hour
              </>
            }
            lead="A suggestion, not a schedule. Everything in it is inside the gate or within about 10 minutes of it."
          />
          <div className="mt-12 grid grid-cols-4 gap-x-col md:grid-cols-8 lg:grid-cols-12">
            <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-5">
              <DayOnTheIsland entries={dayInTheLife} />
            </div>
          </div>
        </div>
      </section>

      {/* III. The map */}
      <section aria-labelledby="map-title" id="map" className="scroll-mt-28 pt-section">
        <div className="mx-auto max-w-page px-gutter">
          <SectionHead id="map-title" numeral={3} label="The map" title="Where things are" />
        </div>
        <Grid className="mt-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-12">
            <EstateMap variant="guide" caption="Places in this guide. Numbers match the listings below. Distances are approximate." />
          </div>
        </Grid>
      </section>

      {/* IV onward. The directory */}
      <Grid className="py-section">
        <nav
          aria-label="Directory contents"
          className="col-span-4 mb-10 hidden md:col-span-8 lg:sticky lg:top-36 lg:col-span-3 lg:mb-0 lg:block lg:self-start"
        >
          <p className="smallcaps border-t border-ink pt-3">The directory</p>
          <ol className="mt-1 text-small">
            {categories.map((c, i) => (
              <li key={c.id} className="border-b border-rule">
                <a href={`#${c.id}`} className="grid min-h-11 grid-cols-[2.5rem_1fr_auto] items-center no-underline hover:underline">
                  <span className="font-serif text-small italic text-brass">{roman(i + 1 + offset)}</span>
                  <span>{sentenceCase(c.title.replace("&", "and"))}</span>
                  <span className="text-caption text-ink-muted tabular">{c.places.length}</span>
                </a>
              </li>
            ))}
            <li className="border-b border-rule">
              <a href="#seasons" className="grid min-h-11 grid-cols-[2.5rem_1fr] items-center no-underline hover:underline">
                <span className="font-serif text-small italic text-brass">{roman(categories.length + 1 + offset)}</span>
                <span>Through the year</span>
              </a>
            </li>
          </ol>
          <p className="mt-4 text-caption text-ink-muted">Distances are approximate, from the resort gate. Checked {lastChecked}.</p>
        </nav>

        <div className="col-span-4 space-y-20 md:col-span-8 lg:col-span-9 lg:col-start-4 lg:space-y-24">
          {categories.map((c, i) => (
            <PlaceCategory key={c.id} category={c} numeral={i + 1 + offset} plate={PLATES[c.id]} />
          ))}
        </div>
      </Grid>

      <Seasons seasons={seasons} plate="fish-haul-creek-boardwalk" />

      {/* Close */}
      <Grid className="py-section">
        <div className="col-span-4 border-t border-ink pt-6 md:col-span-8 lg:col-span-7">
          <p className="display-cut text-h2">
            {smart("The residence is mid-island, inside the gate.")}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/reserve" className="btn btn-primary">
              Check dates
            </Link>
            <Link href="/credits" className="link-caps">
              Photography credits
            </Link>
          </div>
        </div>
      </Grid>
    </>
  );
}
