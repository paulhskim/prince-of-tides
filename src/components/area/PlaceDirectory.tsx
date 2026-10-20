import { ArrowUpRight } from "lucide-react";
import { CreditedPhoto } from "./CreditedPhoto";
import { roman, sentenceCase, smart } from "@/components/site/text";
import type { AreaCategory, AreaPlace } from "@/content/area-guide";
import { areaPhoto, type AreaPhotoId } from "@/lib/area-photos";
import { getGuidePlaces } from "@/lib/maps/places";

function distance(p: AreaPlace): string {
  if (p.mode === "on-site") return p.distanceMiles === 0 ? "On site" : "Island-wide";
  if (p.distanceMiles === null) return "";
  return `approx. ${p.distanceMiles} mi`;
}

function how(p: AreaPlace): string {
  if (p.mode === "walk") return "On foot";
  if (p.mode === "on-site") return "";
  return p.driveMinutes ? `${p.driveMinutes} min drive` : "Drive";
}

function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Website";
  }
}

/** Guide numbers, shared with the map and its typographic list (src/lib/maps/places.ts). */
function mapNumbers(): Map<string, number> {
  return new Map(
    getGuidePlaces()
      .filter((p) => typeof p.number === "number")
      .map((p) => [p.name, p.number as number]),
  );
}

/**
 * One area guide category: an optional credited photo plate, the heading and blurb, then the
 * places as a ledger (place, approx. distance, website).
 */
export function PlaceCategory({
  category,
  numeral,
  plate,
}: {
  category: AreaCategory;
  numeral: number;
  plate?: AreaPhotoId;
}) {
  const numbers = mapNumbers();
  const tall = plate ? areaPhoto(plate).height > areaPhoto(plate).width : false;
  const heading = (
    <div className="border-t border-ink pt-3">
      <p aria-hidden="true" className="font-serif text-body italic text-brass">
        {roman(numeral)}
      </p>
      <h2 id={`${category.id}-title`} className="mt-3 text-h2 font-light">
        {sentenceCase(category.title.replace("&", "and"))}
      </h2>
      <p className="mt-3 max-w-measure font-serif text-prose text-ink-muted">{smart(category.blurb)}</p>
    </div>
  );
  return (
    <section id={category.id} aria-labelledby={`${category.id}-title`} className="scroll-mt-36">
      {plate && tall ? (
        <div className="grid gap-x-col gap-y-10 md:grid-cols-9 md:items-end">
          <div className="md:col-span-4">
            <CreditedPhoto id={plate} sizes="(min-width:1280px) 380px, (min-width:768px) 40vw, 100vw" />
          </div>
          <div className="md:col-span-5">{heading}</div>
        </div>
      ) : (
        <>
          {plate ? (
            <CreditedPhoto id={plate} sizes="(min-width:1280px) 900px, (min-width:1024px) 70vw, 100vw" className="mb-10" />
          ) : null}
          {heading}
        </>
      )}

      <div className="smallcaps mt-8 hidden grid-cols-9 gap-x-col border-b border-ink pb-2.5 text-ink-muted md:grid" aria-hidden="true">
        <span className="col-span-5">Place</span>
        <span className="col-span-2 text-right">Approx.</span>
        <span className="col-span-2">Website</span>
      </div>
      <ul className="mt-6 border-t border-ink md:mt-0 md:border-t-0">
        {category.places.map((p) => {
          const n = numbers.get(p.name);
          return (
            <li key={p.name} className="grid gap-x-col gap-y-2 border-b border-rule py-4 md:grid-cols-9">
              <div className="md:col-span-5">
                <h3 className="font-serif text-[1.25rem] leading-snug">
                  {n ? (
                    <span className="mr-2 inline-block min-w-[1.5rem] font-sans text-caption font-medium tabular text-brass" title="Number on the map list">
                      <span className="sr-only">Map marker </span>
                      {n}
                    </span>
                  ) : null}
                  {smart(p.name)}
                </h3>
                <p className="mt-1 max-w-measure text-small">{smart(p.description)}</p>
                {p.travelNote ? <p className="mt-1 text-caption text-ink-muted">{smart(p.travelNote)}</p> : null}
              </div>
              <p className="text-small tabular md:col-span-2 md:text-right">
                {distance(p)}
                {how(p) ? <span className="block text-caption text-ink-muted">{how(p)}</span> : null}
              </p>
              <div className="text-small md:col-span-2">
                {p.url ? (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-start gap-1 break-all pt-0.5 md:min-h-0"
                  >
                    {host(p.url)}
                    <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.25} className="mt-0.5 shrink-0" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                ) : (
                  <span className="text-ink-muted">Inside the resort</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
