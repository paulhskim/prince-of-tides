import { ReservationBar } from "@/components/booking/ReservationBar";
import { hero, reviewsSection } from "@/content/copy";
import { photoFor } from "@/lib/photos";
import { Photo } from "../Photo";

/**
 * The cover is a title page: a running head between rules, the name set large on one line, the
 * tagline, then a base of standfirst, record and action. The reservation bar is the cover's lower
 * edge on large screens. With a cover photograph, a wide plate sits between the name and the base;
 * without one, nothing stands in for it.
 */
export function Cover() {
  const photo = photoFor("hero");
  const r = reviewsSection.ratingSummary;

  return (
    <section aria-labelledby="cover-title" className="pb-section-sm pt-3 lg:pt-6">
      <div className="mx-auto max-w-page px-gutter">
        {/* Running head */}
        <div className="flex items-baseline justify-between gap-4 border-y border-ink py-2.5">
          <p className="apparatus">{hero.eyebrow}</p>
          <p className="apparatus hidden text-ink-muted sm:block">Building 3, Hilton Head Island, South Carolina</p>
        </div>

        <h1
          id="cover-title"
          className="cover-reveal-late display-cut mt-[clamp(2.5rem,1rem+6vw,6.5rem)] text-display text-balance"
        >
          Prince of Tides
        </h1>
        <p className="cover-reveal-late mt-4 font-serif text-h3 lg:mt-6">{hero.headline}</p>
      </div>

      {photo ? (
        <figure className="cover-reveal mx-auto mt-10 max-w-bleed lg:mt-14">
          <Photo
            photo={photo}
            slot="hero"
            ratioClass="aspect-[4/5] sm:aspect-[3/2] lg:aspect-[21/9]"
            sizes="100vw"
            priority
          />
          <figcaption className="mx-auto mt-2 max-w-page px-gutter text-caption text-ink-muted">{photo.caption}</figcaption>
        </figure>
      ) : null}

      <div className="mx-auto max-w-page px-gutter">
        <div className="cover-reveal-late mt-10 grid grid-cols-4 gap-x-col gap-y-8 md:grid-cols-8 lg:mt-[clamp(3rem,1rem+4vw,5.5rem)] lg:grid-cols-12">
          <p className="col-span-4 max-w-[34rem] font-serif text-lead oldstyle md:col-span-5 lg:col-span-6">{hero.subhead}</p>

          <div className="col-span-4 md:col-span-3 lg:col-span-3 lg:col-start-10">
            <a
              href="#reviews"
              className="group block border-t border-ink pt-2.5 no-underline"
            >
              {/* No aria-label: the visible text is the accessible name (WCAG 2.5.3 label in name). */}
              <span className="apparatus block text-ink-muted">Guest rating</span>
              <span className="mt-1 block font-serif text-h3 tabular">
                {r.overall}
                <span className="text-ink-muted">
                  <span aria-hidden="true"> / </span>
                  <span className="sr-only"> of </span>
                  {r.outOf}
                </span>
              </span>
              <span className="mt-1 block text-small text-ink-muted underline decoration-rule-strong underline-offset-[0.22em] group-hover:decoration-ink">
                {r.count} reviews on {r.source}
              </span>
            </a>
          </div>

          {/* Below lg the reservation bar is a fixed bottom bar, so the cover carries the action. */}
          <div className="col-span-4 md:col-span-8 lg:hidden">
            <a
              href="#reserve"
              className="flex h-12 items-center justify-center bg-marsh px-6 font-medium tracking-[0.01em] text-sheet no-underline transition-colors duration-100 hover:bg-marsh-hover sm:inline-flex"
            >
              {hero.primaryCta.label}
            </a>
            <p className="mt-3 text-caption text-ink-muted">Nothing is charged. We confirm the dates and send a quote.</p>
          </div>
        </div>

        {/* Desktop: the bar is the lower edge of the cover. Below lg it renders the fixed bottom bar. */}
        <div className="lg:mt-12">
          <ReservationBar />
        </div>
      </div>
    </section>
  );
}
