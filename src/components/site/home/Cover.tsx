import { ReservationBar } from "@/components/booking/ReservationBar";
import { hero, particulars, reviewsSection } from "@/content/copy";
import { getGalleryPhotos, photoFor } from "@/lib/photos";
import { NameSet, RunningHead } from "../layout";
import { Crest } from "../Monogram";
import { Photo } from "../Photo";

/**
 * The cover: arriving at night. A running head between hairlines, the name set very large in the
 * display cut with its connective in italic, the tagline, then Plate I: the first owner photograph,
 * shown whole at its own 3:2 ratio, straddling the change from night to paper. The standfirst,
 * the record and the reservation bar sit on the paper below.
 */
export function Cover() {
  const photo = photoFor("hero") ?? getGalleryPhotos()[0];
  const r = reviewsSection.ratingSummary;
  const sleeps = particulars.items.find((p) => p.label === "Sleeps")?.value ?? "6";

  return (
    <section aria-labelledby="cover-title" className="relative pb-section-sm">
      <div data-surface="dark" className="bg-pluff text-on-dark">
        <div className="mx-auto max-w-page px-gutter pt-2 lg:pt-4">
          <RunningHead tone="dark" left="A privately kept residence at Hilton Head Resort" right="Building 3, Hilton Head Island, South Carolina" />

          <h1
            id="cover-title"
            className="cover-reveal-late display-cut mt-[clamp(2.75rem,1rem+5vw,5.5rem)] text-display whitespace-nowrap"
          >
            <NameSet name="Prince of Tides" />
          </h1>

          <div className="cover-reveal-late mt-6 flex flex-wrap items-center justify-between gap-x-10 gap-y-5 pb-8 lg:mt-9 lg:pb-14">
            <p className="font-serif text-[clamp(1.375rem,1.1rem+1.1vw,2rem)] font-light italic leading-tight tracking-[-0.01em]">
              {hero.headline}
            </p>
            <div className="flex items-center gap-5">
              <p className="smallcaps text-right leading-[1.9] text-on-dark-muted">
                Two bedrooms, two baths
                <br />
                Sleeps {sleeps}, approx. 831 sq ft
              </p>
              <Crest size={96} id="cover-crest" className="hidden text-brass-light sm:block" />
            </div>
          </div>
        </div>
      </div>

      {photo ? (
        <div className="relative">
          {/* The night continues behind the upper part of the plate, so the photograph bridges the two. */}
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[56%] bg-pluff" />
          <figure className="relative mx-auto grid max-w-page grid-cols-4 gap-x-col md:grid-cols-8 md:px-gutter lg:grid-cols-12">
            <div className="cover-reveal col-span-4 md:col-span-8 lg:col-span-10 lg:col-start-3">
              <Photo photo={photo} slot="hero" ratio="3/2" sizes="(min-width:1280px) 1060px, (min-width:1024px) 82vw, 100vw" priority />
            </div>
            <figcaption className="col-span-4 mt-3 px-gutter md:col-span-8 md:px-0 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:mt-0 lg:self-end">
              <span className="smallcaps block text-brass">Plate I</span>
              <span className="mt-1.5 block font-serif text-small italic leading-snug text-ink-muted">{photo.caption}</span>
            </figcaption>
          </figure>
        </div>
      ) : null}

      <div className="mx-auto max-w-page px-gutter">
        <div className="mt-8 grid grid-cols-4 gap-x-col gap-y-8 md:grid-cols-8 lg:mt-[clamp(3rem,1rem+4vw,5rem)] lg:grid-cols-12">
          <p className="col-span-4 max-w-[34rem] font-serif text-lead oldstyle md:col-span-5 lg:col-span-6 lg:col-start-3">{hero.subhead}</p>

          <div className="col-span-4 md:col-span-3 lg:col-span-3 lg:col-start-10">
            <a href="#reviews" className="group block border-t border-ink pt-3 no-underline">
              {/* No aria-label: the visible text is the accessible name (WCAG 2.5.3 label in name). */}
              <span className="smallcaps block text-ink-muted">Guest rating</span>
              <span className="mt-2 block font-serif text-[1.75rem] font-light leading-none tabular">
                {r.overall}
                <span className="text-ink-muted">
                  <span className="italic"> of </span>
                  {r.outOf}
                </span>
              </span>
              <span className="mt-2 block text-small text-ink-muted underline decoration-rule-strong underline-offset-[0.26em] transition-[text-decoration-color] duration-200 group-hover:decoration-ink">
                {r.count} reviews on {r.source}
              </span>
            </a>
          </div>

          {/* Below lg the reservation bar is a fixed bottom bar, so the cover carries the action. */}
          <div className="order-first col-span-4 md:col-span-8 lg:hidden">
            <a href={hero.primaryCta.href} className="btn btn-primary h-14 w-full sm:w-auto">
              {hero.primaryCta.label}
            </a>
            <p className="mt-3 text-caption text-ink-muted">By request. Nothing is charged; your host confirms the dates and the quote.</p>
          </div>
        </div>

        {/* Desktop: the bar is the lower edge of the cover. Below lg it renders the fixed bottom bar. */}
        <div className="lg:mt-14">
          <ReservationBar />
        </div>
      </div>
    </section>
  );
}
