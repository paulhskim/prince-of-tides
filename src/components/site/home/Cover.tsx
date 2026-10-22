import { ReservationBar } from "@/components/booking/ReservationBar";
import { hero, particulars, reviewsSection } from "@/content/copy";
import { getGalleryPhotos, photoFor } from "@/lib/photos";
import { NameSet, RunningHead } from "../layout";
import { Crest } from "../Monogram";
import { Photo } from "../Photo";

/**
 * The cover: arriving at night. A running head between hairlines, the name set very large in the
 * display cut with its connective in italic, then a two-column spread. The frontispiece, the owner's portrait
 * photograph of a heron on the boardwalk rail, hangs on the right at its own 3:4 ratio, shown whole
 * and straddling the change from night to paper. On the left the tagline and the particulars sit on
 * the night; the standfirst and the record sit on the paper below the edge. On a phone the plate is
 * inset three columns of four, so the frame stays whole without pushing the action off the first
 * screen. The reservation bar is the lower edge of the cover.
 */
export function Cover() {
  const photo = photoFor("hero") ?? getGalleryPhotos()[0];
  const r = reviewsSection.ratingSummary;
  const sleeps = particulars.items.find((p) => p.label === "Sleeps")?.value ?? "6";

  return (
    <section aria-labelledby="cover-title" className="relative overflow-x-clip pb-section-sm">
      <div data-surface="dark" className="bg-pluff text-on-dark">
        <div className="mx-auto max-w-page px-gutter pt-2 lg:pt-4">
          <RunningHead tone="dark" left="A privately kept residence at Hilton Head Resort" right="Building 3, Hilton Head Island, South Carolina" />

          <h1
            id="cover-title"
            className="cover-reveal-late display-cut mt-[clamp(2.75rem,1rem+5vw,5.5rem)] text-display whitespace-nowrap lg:pb-6"
          >
            <NameSet name="Prince of Tides" />
          </h1>
        </div>
      </div>

      <div className="mx-auto grid max-w-page grid-cols-4 gap-x-col px-gutter md:grid-cols-8 lg:grid-cols-12 lg:grid-rows-[auto_1fr]">
        {/* The tagline and particulars: always on the night (its own ground below lg, the band behind the plate above). */}
        <div
          data-surface="dark"
          className="cover-reveal-late relative z-10 col-span-4 bg-pluff pb-8 pt-6 text-on-dark [box-shadow:0_0_0_100vmax_var(--color-pluff)] [clip-path:inset(0_-100vmax)] md:col-span-8 lg:col-span-6 lg:row-start-1 lg:bg-transparent lg:pb-0 lg:pt-10 lg:[box-shadow:none] lg:[clip-path:none]"
        >
          <p className="font-serif text-[clamp(1.375rem,1.1rem+1.1vw,2rem)] font-light italic leading-tight tracking-[-0.01em]">{hero.headline}</p>
          <div className="mt-5 flex items-center gap-5 lg:mt-8">
            <Crest size={96} id="cover-crest" className="hidden shrink-0 text-brass-light sm:block" />
            <p className="smallcaps leading-[1.9] text-on-dark-muted">
              Two bedrooms, two baths
              <br />
              Sleeps {sleeps}, approx. 831 sq ft
            </p>
          </div>
        </div>

        {photo ? (
          <figure className="relative col-span-3 col-start-2 md:col-span-5 md:col-start-4 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1">
            {/* The night continues behind the upper part of the plate, edge to edge, so the photograph bridges the two. */}
            <div aria-hidden="true" className="absolute -left-[100vw] -right-[100vw] top-0 h-[46%] bg-pluff lg:h-[40%]" />
            <div className="cover-reveal relative">
              <Photo
                photo={photo}
                slot="hero"
                ratio="native"
                sizes="(min-width:1280px) 480px, (min-width:1024px) 38vw, (min-width:768px) 58vw, 72vw"
                priority
              />
              {/* Below lg the label runs up the margin beside the inset plate, so the space reads as a set page. */}
              <span
                aria-hidden="true"
                className="smallcaps absolute bottom-0 right-full mr-[clamp(0.75rem,4vw,2rem)] rotate-180 text-brass [writing-mode:vertical-rl] lg:hidden"
              >
                Frontispiece
              </span>
            </div>
            <figcaption className="mt-3">
              <span className="smallcaps hidden text-brass lg:block">Frontispiece</span>
              <span className="mt-1.5 block font-serif text-small italic leading-snug text-ink-muted">{photo.caption}</span>
            </figcaption>
          </figure>
        ) : null}

        {/* Below lg the reservation bar is a fixed bottom bar, so the cover carries the action. */}
        <div className="col-span-4 mt-8 md:col-span-8 lg:hidden">
          <a href={hero.primaryCta.href} className="btn btn-primary h-14 w-full sm:w-auto">
            {hero.primaryCta.label}
          </a>
          <p className="mt-3 text-caption text-ink-muted">By request. Nothing is charged; your host confirms the dates and the quote.</p>
        </div>

        {/* The standfirst and the record, on the paper, level with the foot of the plate. */}
        <div className="col-span-4 mt-10 grid gap-x-col gap-y-8 md:col-span-8 md:grid-cols-8 lg:col-span-6 lg:row-start-2 lg:mt-0 lg:grid-cols-6 lg:self-end lg:pb-[4.25rem]">
          <p className="max-w-[34rem] font-serif text-lead oldstyle md:col-span-5 lg:col-span-6">{hero.subhead}</p>

          <div className="md:col-span-3 lg:col-span-3">
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
        </div>
      </div>

      {/* Desktop: the bar is the lower edge of the cover. Below lg it renders the fixed bottom bar. */}
      <div className="mx-auto max-w-page px-gutter lg:mt-14">
        <ReservationBar />
      </div>
    </section>
  );
}
