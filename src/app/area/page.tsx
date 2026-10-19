import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { pageBreadcrumb } from "@/lib/seo/schema";
import { ArrowUpRight } from "lucide-react";
import { Grid } from "@/components/site/layout";
import { frame, sentenceCase } from "@/components/site/text";
import { areaGuide, type AreaPlace } from "@/content/area-guide";

export const metadata = pageMetadata("area");

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function verified(v: string): string {
  const [y, m] = v.split("-").map(Number);
  return m ? `${MONTHS[m - 1]} ${y}` : v;
}

function distance(p: AreaPlace): string {
  if (p.mode === "on-site") return p.distanceMiles === 0 ? "On site" : "Island-wide";
  if (p.distanceMiles === null) return "";
  return `${p.distanceMiles} mi`;
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

export default function AreaPage() {
  const { categories, seasonalNotes } = areaGuide;
  return (
    <>
      <JsonLd data={pageBreadcrumb("area")} />
      <header className="pb-section-sm pt-10 lg:pt-16">
        <Grid>
          <p className="col-span-4 mb-3 text-label text-ink-muted md:col-span-8 lg:col-span-3 lg:mb-0">Area guide</p>
          <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-4">
            <h1 className="text-h1">{sentenceCase(areaGuide.intro.heading)}</h1>
            <p className="mt-6 max-w-measure font-serif text-lead">{areaGuide.intro.body}</p>
            <p className="mt-6 max-w-measure border-t border-rule pt-3 text-caption text-ink-muted">
              {areaGuide.distanceDisclaimer} Last checked {verified(areaGuide.lastVerified)}.
            </p>
          </div>
        </Grid>
      </header>

      <Grid className="pb-section">
        {/* Index */}
        <nav aria-label="Area guide contents" className="col-span-4 mb-10 md:col-span-8 lg:sticky lg:top-36 lg:col-span-3 lg:mb-0 lg:self-start">
          <p className="border-t border-ink pt-2 text-label font-medium">Contents</p>
          <ol className="mt-1 text-small">
            {categories.map((c, i) => (
              <li key={c.id} className="border-b border-rule">
                <a href={`#${c.id}`} className="grid min-h-11 grid-cols-[2.25rem_1fr_auto] items-center no-underline hover:underline">
                  <span className="text-caption text-ink-muted tabular">{frame(i + 1)}</span>
                  <span>{sentenceCase(c.title)}</span>
                  <span className="text-caption text-ink-muted tabular">{c.places.length}</span>
                </a>
              </li>
            ))}
            <li className="border-b border-rule">
              <a href="#seasons" className="grid min-h-11 grid-cols-[2.25rem_1fr] items-center no-underline hover:underline">
                <span className="text-caption text-ink-muted tabular">{frame(categories.length + 1)}</span>
                <span>Through the year</span>
              </a>
            </li>
          </ol>
        </nav>

        <div className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-4">
          {categories.map((c, i) => (
            <section key={c.id} id={c.id} aria-labelledby={`${c.id}-title`} className="mb-16 scroll-mt-36 lg:mb-20">
              <div className="border-t border-ink pt-3">
                <p className="text-caption text-ink-muted tabular">{frame(i + 1)}</p>
                <div className="mt-3">
                  <h2 id={`${c.id}-title`} className="text-h2">
                    {sentenceCase(c.title)}
                  </h2>
                  <p className="mt-3 max-w-measure font-serif text-prose text-ink-muted">{c.blurb}</p>
                </div>
              </div>

              <div className="mt-8 hidden grid-cols-9 gap-x-col border-b border-ink pb-2 text-label text-ink-muted md:grid" aria-hidden="true">
                <span className="col-span-5">Place</span>
                <span className="col-span-2 text-right">Approx.</span>
                <span className="col-span-2">Website</span>
              </div>
              <ul className="mt-6 border-t border-ink md:mt-0 md:border-t-0">
                {c.places.map((p) => (
                  <li key={p.name} className="grid gap-x-col gap-y-2 border-b border-rule py-4 md:grid-cols-9">
                    <div className="md:col-span-5">
                      <h3 className="font-serif text-[1.25rem] leading-snug">{p.name}</h3>
                      <p className="mt-1 max-w-measure text-small">{p.description}</p>
                      {p.travelNote ? <p className="mt-1 text-caption text-ink-muted">{p.travelNote}</p> : null}
                    </div>
                    <p className="text-small tabular md:col-span-2 md:text-right">
                      <span className="sr-only">Approximate distance: </span>
                      {p.mode !== "on-site" && p.distanceMiles !== null ? <span className="md:hidden">approx. </span> : null}
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
                ))}
              </ul>
            </section>
          ))}

          <section id="seasons" aria-labelledby="seasons-title" className="scroll-mt-36 bg-stone px-6 py-10 md:px-10">
            <h2 id="seasons-title" className="text-h2">
              Through the year
            </h2>
            <dl className="mt-8 grid gap-x-col gap-y-10 md:grid-cols-2">
              {seasonalNotes.map((s) => (
                <div key={s.id} className="border-t border-rule-strong pt-3">
                  <dt>
                    <span className="block text-label text-ink-muted">{s.months}</span>
                    <span className="mt-2 block font-serif text-h3">{s.title}</span>
                  </dt>
                  <dd className="mt-3 text-small">{s.body}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </Grid>
    </>
  );
}
