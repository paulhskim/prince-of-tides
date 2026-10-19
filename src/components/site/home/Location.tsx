import Link from "next/link";
import { areaGuide, type AreaPlace } from "@/content/area-guide";
import { footer, hero } from "@/content/copy";
import { Grid } from "../layout";
import { MapFacade } from "../MapFacade";

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

/** Shorter display names for the compact list; the full names live on /area. */
function shortName(name: string): string {
  return name.replace(/^Savannah\/Hilton Head International Airport/, "Savannah airport").replace(/^Hilton Head Island Airport/, "Hilton Head airport");
}

export function Location() {
  const places = PICKS.map(find).filter((p): p is AreaPlace => !!p);
  return (
    <section id="location" aria-labelledby="location-title" className="py-section-sm">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />
        <div className="col-span-4 mb-6 md:col-span-8 lg:col-span-3 lg:mb-0">
          <p className="text-label text-ink-muted">Location</p>
          <h2 id="location-title" className="mt-4 text-h3">
            {hero.eyebrow}
          </h2>
          <p className="mt-3 max-w-[18rem] text-small text-ink-muted">
            {footer.smallPrint[0].split(". ").slice(1).join(". ")}
          </p>
        </div>
        <div className="order-3 col-span-4 mt-10 md:col-span-8 lg:order-none lg:col-span-5 lg:col-start-4 lg:mt-0">
          <MapFacade caption="Map of Hilton Head Resort, mid-island" />
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-4 lg:col-start-9">
          <h3 className="border-t border-ink pt-2 font-sans text-label font-medium">Getting about, approx.</h3>
          <ul className="text-small">
            {places.map((p) => (
              <li key={p.name} className="grid grid-cols-[1fr_auto] gap-4 border-b border-rule py-2.5">
                <span>{shortName(p.name)}</span>
                <span className="text-right tabular text-ink-muted">
                  {p.driveMinutes ? `${p.driveMinutes} min` : p.distanceMiles ? `${p.distanceMiles} mi` : ""}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-caption text-ink-muted">Drive times from the resort gate.</p>
          <Link href="/area" className="mt-5 inline-flex min-h-11 items-center text-body">
            The area guide
          </Link>
        </div>
      </Grid>
    </section>
  );
}
