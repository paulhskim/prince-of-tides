import { CreditedPhoto } from "./CreditedPhoto";
import { smart } from "@/components/site/text";
import type { Season } from "@/content/experiences";
import type { AreaPhotoId } from "@/lib/area-photos";

/** The four seasons as a night passage, opened by a credited plate. */
export function Seasons({ seasons, plate }: { seasons: Season[]; plate?: AreaPhotoId }) {
  return (
    <section
      id="seasons"
      aria-labelledby="seasons-title"
      data-surface="dark"
      className="scroll-mt-28 bg-pluff py-section text-on-dark"
    >
      <div className="mx-auto max-w-page px-gutter">
        <div className="grid grid-cols-4 gap-x-col gap-y-10 md:grid-cols-8 lg:grid-cols-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <p className="smallcaps border-t border-on-dark/25 pt-3 text-brass-light">The seasons</p>
            <h2 id="seasons-title" className="mt-6 display-cut text-h1">
              Through <span className="display-italic">the</span> year
            </h2>
            <p className="mt-6 max-w-measure font-serif text-lead text-on-dark-muted">
              {smart("What each season is good for, and what to plan around.")}
            </p>
          </div>
          {plate ? (
            <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6 lg:self-end">
              <CreditedPhoto id={plate} tone="dark" sizes="(min-width:1280px) 720px, (min-width:1024px) 57vw, 100vw" />
            </div>
          ) : null}
        </div>

        <dl className="mt-16 grid grid-cols-1 gap-x-col gap-y-12 md:grid-cols-2 lg:grid-cols-4">
          {seasons.map((s) => (
            <div key={s.id} className="border-t border-on-dark/25 pt-4">
              <dt>
                <span className="smallcaps block text-brass-light">{s.months}</span>
                <span className="mt-2 block font-serif text-h3 font-light">{s.name}</span>
              </dt>
              <dd className="mt-3">
                <p className="font-serif text-body italic text-on-dark">{smart(s.body)}</p>
                <ul className="mt-4 space-y-3 text-small text-on-dark-muted">
                  {s.notes.map((n) => (
                    <li key={n} className="border-t border-on-dark/15 pt-3">
                      {smart(n)}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
