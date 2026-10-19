import { hero, reviewsSection } from "@/content/copy";
import { siteConfig } from "@/content/site.config";
import { photoFor } from "@/lib/photos";
import { Photo } from "../Photo";

export function Cover() {
  const photo = photoFor("hero");
  const { capacity } = siteConfig;
  const r = reviewsSection.ratingSummary;
  const particulars: { figure: string; label: string; href?: string }[] = [
    { figure: String(capacity.bedrooms), label: "bedrooms" },
    { figure: String(capacity.bathrooms), label: "full baths" },
    { figure: String(capacity.maxGuests), label: "guests" },
    { figure: String(r.overall), label: `of ${r.outOf} on Vrbo (${r.count} reviews)`, href: "#reviews" },
  ];

  return (
    <section aria-labelledby="cover-title" className="pb-section pt-6 lg:pb-section-lg lg:pt-10">
      <div className="mx-auto grid max-w-page grid-cols-4 gap-x-col px-gutter md:grid-cols-8 lg:grid-cols-12 lg:grid-rows-[1fr_auto]">
        {/* Name block */}
        <div className="cover-reveal-late col-span-4 md:col-span-8 lg:col-span-5 lg:row-start-1 lg:self-end">
          <p className="text-label text-ink-muted">{hero.eyebrow}</p>
          <h1 id="cover-title" className="mt-5 font-display text-display lg:mt-8">
            Prince of
            <br />
            Tides
          </h1>
        </div>

        {/* Photograph: bleeds to the right edge of the viewport on large screens */}
        <figure className="cover-reveal col-span-4 -mx-gutter mt-8 md:col-span-8 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:mt-0 lg:mr-[calc(-1*(var(--spacing-gutter)+max(0px,(min(100vw,100rem)-80rem)/2)))]">
          <Photo
            photo={photo}
            slot="hero"
            ratioClass="aspect-[4/5] md:aspect-[4/3] lg:aspect-auto lg:h-[min(84vh,54rem)] lg:min-h-[36rem]"
            sizes="(min-width:1024px) 58vw, 100vw"
            priority
          />
          {photo ? (
            <figcaption className="mt-2 px-gutter text-caption text-ink-muted lg:px-0">{photo.caption}</figcaption>
          ) : null}
        </figure>

        {/* Lead, particulars line, actions */}
        <div className="cover-reveal-late col-span-4 mt-8 md:col-span-6 lg:col-span-5 lg:row-start-2 lg:mt-10 lg:pr-4">
          <p className="font-serif text-h3">{hero.headline}</p>
          <p className="mt-4 max-w-measure font-serif text-lead text-ink-muted">{hero.subhead}</p>

          <dl className="mt-8 grid grid-cols-2 border-y border-ink sm:grid-cols-4">
            {particulars.map((p, i) => {
              const cell = `flex flex-col-reverse justify-end py-4 ${i % 2 === 1 ? "border-l border-rule pl-4" : "pr-4"} ${
                i >= 2 ? "border-t border-rule sm:border-t-0" : ""
              } ${i === 2 ? "sm:border-l sm:pl-4" : ""}`;
              return (
                <div key={p.label} className={cell}>
                  <dt className="mt-1.5 text-caption text-ink-muted">{p.label}</dt>
                  <dd className="font-serif text-h3 leading-none tabular">
                    {p.href ? (
                      <a href={p.href} aria-label={`${p.figure} ${p.label}, read the reviews`} className="no-underline hover:underline">
                        {p.figure}
                      </a>
                    ) : (
                      p.figure
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
            <a
              href="#reserve"
              className="inline-flex h-12 items-center justify-center bg-marsh px-6 font-medium tracking-[0.01em] text-sheet no-underline transition-colors duration-100 hover:bg-marsh-hover"
            >
              {hero.primaryCta.label}
            </a>
            <a href="#the-space" className="inline-flex min-h-11 items-center text-body">
              {hero.secondaryCta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
