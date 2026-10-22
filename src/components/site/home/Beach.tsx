import Link from "next/link";
import { beachAccess, footer } from "@/content/copy";
import { areaGuide, type AreaPlace } from "@/content/area-guide";
import { getPhotos, photoFor } from "@/lib/photos";
import { Grid, RunningHead, SectionTitle } from "../layout";
import { EstateMap } from "@/components/maps/EstateMap";
import { Photo } from "../Photo";
import { smart, splitHeading } from "../text";

/** Places for the "getting about" list, by their area-guide names. */
const PICKS = [
  "Hilton Head Island Airport (HHH)",
  "Savannah/Hilton Head International Airport (SAV)",
  "Kroger (Shelter Cove)",
  "Shelter Cove Harbour & Marina",
  "Golf at Palmetto Dunes",
  "Adventure Cove",
];

function find(name: string): AreaPlace | undefined {
  for (const c of areaGuide.categories) {
    const p = c.places.find((x) => x.name === name);
    if (p) return p;
  }
  return undefined;
}

function shortName(name: string): string {
  return name
    .replace(/^Savannah\/Hilton Head International Airport/, "Savannah airport")
    .replace(/^Hilton Head Island Airport/, "Hilton Head airport");
}

/**
 * To the beach (under III, privileges): the honest trade-off, told in the owner's photographs. The
 * boardwalk is a portrait plate, shown whole beside the walk's figures (cropping it to a band would
 * leave only planks); then the beach and Coco's on the Beach, the bar at the end of the boardwalk;
 * then the island by distance (beaches, errands and airports) and the map.
 */
export function Beach() {
  const { numeral, title } = splitHeading(beachAccess.heading);
  const walk = photoFor("boardwalk");
  const sand = getPhotos().find((p) => p.file === "beach-dunes.jpg") ?? photoFor("beach");
  const cocos = getPhotos().find((p) => p.file === "resort-cocos.jpg") ?? photoFor("resort");
  const beaches = areaGuide.categories.find((c) => c.id === "beaches")?.places ?? [];
  const places = PICKS.map(find).filter((p): p is AreaPlace => !!p);
  const addressNote = footer.smallPrint[0].split(". ").slice(1).join(". ");

  return (
    <section id="beach" aria-labelledby="beach-title" className="pb-section-sm pt-section">
      <Grid className="gap-y-14">
        {walk ? (
          <figure data-reveal="plate" className="col-span-4 md:col-span-5 lg:col-span-5">
            <Photo photo={walk} slot="boardwalk" ratio="native" sizes="(min-width:1280px) 480px, (min-width:1024px) 40vw, (min-width:768px) 60vw, 100vw" />
            <figcaption className="mt-2 font-serif text-caption italic text-ink-muted">{walk.caption}</figcaption>
          </figure>
        ) : null}

        <div className={`col-span-4 md:col-span-8 ${walk ? "lg:col-span-6 lg:col-start-7 lg:self-end lg:pb-10" : "lg:col-span-7"}`}>
          <SectionTitle id="beach-title" numeral={numeral}>
            {title}
          </SectionTitle>

          <p className="mt-10 flex flex-wrap items-baseline gap-x-6 gap-y-3 border-t border-ink pt-6">
            <span className="display-cut text-figure">
              0.8<span className="italic text-brass"> to </span>1.1
            </span>
            <span className="max-w-[14rem] font-serif text-body italic leading-snug">miles, by a private boardwalk raised over the salt marsh</span>
          </p>

          <p className="mt-8 max-w-measure font-serif text-prose oldstyle">{smart(beachAccess.body)}</p>

          <p className="mt-6 max-w-measure border-t border-rule pt-3 text-caption text-ink-muted">{beachAccess.footnote}</p>
        </div>

        {sand || cocos ? (
          <div className="col-span-4 mt-4 md:col-span-8 lg:col-span-12 lg:mt-10">
            <RunningHead left="On the sand" right="The owner’s photographs" />
          </div>
        ) : null}
        {sand ? (
          <figure data-reveal="plate" className="col-span-4 md:col-span-8 lg:col-span-7">
            <Photo photo={sand} slot="beach" ratio="native" sizes="(min-width:1280px) 690px, (min-width:1024px) 57vw, 100vw" />
            <figcaption className="mt-2 font-serif text-caption italic text-ink-muted">{sand.caption}</figcaption>
          </figure>
        ) : null}
        {cocos ? (
          <figure data-reveal="plate" className="col-span-4 md:col-span-6 md:col-start-3 lg:col-span-5 lg:col-start-8 lg:mt-[clamp(6rem,2rem+8vw,11rem)]">
            <Photo photo={cocos} slot="resort" ratio="native" sizes="(min-width:1280px) 490px, (min-width:1024px) 40vw, (min-width:768px) 75vw, 100vw" />
            <figcaption className="mt-2">
              <span className="block font-serif text-caption italic text-ink-muted">{cocos.caption}</span>
              <span className="mt-3 block max-w-[26rem] font-serif text-body leading-relaxed oldstyle">
                Lunch, or something cold, before the walk home. Seasonal hours; paid for at the bar, not included in the stay.
              </span>
            </figcaption>
          </figure>
        ) : null}

        <div className="col-span-4 md:col-span-4 lg:col-span-5 lg:mt-6">
          <table className="w-full text-left text-small">
            <caption className="apparatus border-b border-ink pb-2 text-left">Beaches, approx. distance</caption>
            <tbody>
              {beaches.map((b) => (
                <tr key={b.name} className="border-b border-rule align-baseline">
                  <th scope="row" className="py-2.5 pr-4 font-normal">
                    {b.name}
                  </th>
                  <td className="whitespace-nowrap py-2.5 text-right tabular">
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

        <div className="col-span-4 md:col-span-4 lg:col-span-6 lg:col-start-7 lg:mt-6">
          <table id="location" className="w-full scroll-mt-24 text-left text-small">
            <caption className="apparatus border-b border-ink pb-2 text-left">Getting about, approx. drive</caption>
            <tbody>
              {places.map((p) => (
                <tr key={p.name} className="border-b border-rule">
                  <th scope="row" className="py-2.5 pr-4 font-normal">
                    {shortName(p.name)}
                  </th>
                  <td className="py-2.5 text-right tabular">
                    {p.driveMinutes ? `${p.driveMinutes} min` : p.distanceMiles ? `${p.distanceMiles} mi` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-caption text-ink-muted">Drive times from the resort gate. {addressNote}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link href="/area" className="link-caps">
              The area guide
            </Link>
          </div>
        </div>

        <div id="map" className="col-span-4 scroll-mt-24 md:col-span-8 lg:col-span-12">
          <h3 className="apparatus mb-4 border-b border-ink pb-2">The resort on the island</h3>
          <EstateMap variant="locator" focus="resort" caption="Hilton Head Resort, mid-island. Distances are approximate." />
        </div>
      </Grid>
    </section>
  );
}
