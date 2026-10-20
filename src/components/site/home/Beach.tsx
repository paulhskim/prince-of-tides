import Link from "next/link";
import { beachAccess, footer } from "@/content/copy";
import { areaGuide, type AreaPlace } from "@/content/area-guide";
import { photoFor } from "@/lib/photos";
import { Grid, SectionTitle } from "../layout";
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
 * V. To the beach: the honest trade-off, given the page's one large figure. The walk, in order, on
 * the left; the island by distance on the right (beaches, then errands and airports).
 */
export function Beach() {
  const { numeral, title } = splitHeading(beachAccess.heading);
  const wide = photoFor("boardwalk");
  const beaches = areaGuide.categories.find((c) => c.id === "beaches")?.places ?? [];
  const places = PICKS.map(find).filter((p): p is AreaPlace => !!p);
  const addressNote = footer.smallPrint[0].split(". ").slice(1).join(". ");

  return (
    <section id="beach" aria-labelledby="beach-title" className="pb-section-sm pt-section">
      {wide ? (
        <figure className="mx-auto mb-14 max-w-bleed lg:mb-20">
          <Photo photo={wide} slot="boardwalk" ratioClass="aspect-[4/3] md:aspect-[21/9]" sizes="100vw" />
          <figcaption className="mx-auto mt-2 max-w-page px-gutter text-caption text-ink-muted">{wide.caption}</figcaption>
        </figure>
      ) : null}

      <Grid className="gap-y-14">
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
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

          <h3 className="apparatus mt-12 border-b border-ink pb-2">An afternoon, in order</h3>
          <ol>
            {beachAccess.steps.map((s, i) => (
              <li key={s} className="grid grid-cols-[2.25rem_1fr] border-b border-rule py-3.5">
                <span className="font-serif text-body italic text-brass">{i + 1}</span>
                <span className="font-serif text-prose leading-snug oldstyle">{smart(s)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-caption text-ink-muted">{beachAccess.footnote}</p>
        </div>

        <div className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9 lg:pt-[clamp(4rem,2rem+3vw,6rem)]">
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

          <table id="location" className="mt-10 w-full scroll-mt-24 text-left text-small">
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
