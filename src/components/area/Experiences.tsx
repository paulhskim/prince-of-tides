import { CreditedPhoto } from "./CreditedPhoto";
import { roman, smart } from "@/components/site/text";
import { areaPhoto } from "@/lib/area-photos";
import type { Experience } from "@/content/experiences";

function access(e: Experience): string {
  if (e.approxDriveMinutes !== null) return `approx. ${e.approxDriveMinutes} min drive`;
  return e.access ?? "";
}

/** The place, the way there and the season, as a two-row ledger under the text. */
function Particulars({ e }: { e: Experience }) {
  const rows: [string, string][] = [["Where", e.place]];
  const how = access(e);
  if (how) rows.push(["Getting there", how]);
  if (e.season) rows.push(["When", e.season]);
  return (
    <dl className="mt-6 border-t border-ink text-small">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 border-b border-rule py-2.5">
          <dt className="smallcaps pt-0.5 text-ink-muted">{k}</dt>
          <dd className="tabular">{smart(v)}</dd>
        </div>
      ))}
    </dl>
  );
}

function Text({ e, n }: { e: Experience; n: number }) {
  return (
    <div>
      <p className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-serif text-body italic text-brass">
          {roman(n)}
        </span>
        <span className="smallcaps text-ink-muted">{e.kicker}</span>
      </p>
      <h3 id={`exp-${e.id}`} className="mt-3 display-cut text-h2">
        {smart(e.title)}
      </h3>
      <p className="mt-5 max-w-measure font-serif text-prose oldstyle">{smart(e.body)}</p>
      <Particulars e={e} />
    </div>
  );
}

/**
 * The experiences as a sequence of spreads. Photographs alternate sides; tall photographs get a
 * narrower column so they are shown whole without towering. Experiences without a photograph are
 * paired side by side at the end, as a quieter coda.
 */
export function Experiences({ items }: { items: Experience[] }) {
  const withPhoto = items.filter((e) => e.photoId);
  const textOnly = items.filter((e) => !e.photoId);

  return (
    <div>
      <ol className="space-y-[clamp(4rem,2.5rem+5vw,8rem)]">
        {withPhoto.map((e, i) => {
          const photo = areaPhoto(e.photoId!);
          const tall = photo.height > photo.width;
          const flip = i % 2 === 1;
          const photoCols = tall
            ? `lg:col-span-4 ${flip ? "lg:col-start-8" : "lg:col-start-2"}`
            : `lg:col-span-7 ${flip ? "lg:col-start-6" : "lg:col-start-1"}`;
          const textCols = tall
            ? `lg:col-span-5 ${flip ? "lg:col-start-2" : "lg:col-start-7"}`
            : `lg:col-span-4 ${flip ? "lg:col-start-1" : "lg:col-start-9"}`;
          return (
            <li
              key={e.id}
              aria-labelledby={`exp-${e.id}`}
              className="grid grid-cols-4 gap-x-col gap-y-8 md:grid-cols-8 lg:grid-cols-12 lg:items-center"
            >
              <div className={`col-span-4 md:col-span-8 lg:row-start-1 ${tall ? "max-w-sm lg:max-w-none" : ""} ${photoCols}`}>
                <CreditedPhoto
                  id={e.photoId!}
                  sizes={tall ? "(min-width:1280px) 400px, (min-width:1024px) 32vw, 100vw" : "(min-width:1280px) 720px, (min-width:1024px) 57vw, 100vw"}
                />
              </div>
              <div className={`col-span-4 md:col-span-6 lg:row-start-1 ${textCols}`}>
                <Text e={e} n={i + 1} />
              </div>
            </li>
          );
        })}
      </ol>

      {textOnly.length ? (
        <ol
          start={withPhoto.length + 1}
          className="mt-[clamp(4rem,2.5rem+5vw,8rem)] grid grid-cols-4 gap-x-col gap-y-14 border-t border-ink pt-10 md:grid-cols-8 lg:grid-cols-12"
        >
          {textOnly.map((e, i) => (
            <li
              key={e.id}
              aria-labelledby={`exp-${e.id}`}
              className={`col-span-4 md:col-span-4 lg:col-span-5 ${i % 2 === 1 ? "lg:col-start-8" : "lg:col-start-1"}`}
            >
              <Text e={e} n={withPhoto.length + i + 1} />
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
