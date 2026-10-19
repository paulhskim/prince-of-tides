import { reviewsSection, type Review } from "@/content/copy";
import { Grid } from "../layout";
import { longMonth, splitHeading } from "../text";

function Attribution({ review }: { review: Review }) {
  return (
    <p className="mt-4 text-label">
      {review.name}, {longMonth(review.date)}
      <br />
      <span className="text-ink-muted">
        {review.source}, rated {review.rating} of {review.outOf}
      </span>
    </p>
  );
}

export function Testimony() {
  const { numeral, title } = splitHeading(reviewsSection.heading);
  const r = reviewsSection.ratingSummary;
  // Featured: the longest 10 of 10 review that mentions the marsh walk; others follow in spec order.
  const featured = reviewsSection.reviews.find((x) => x.name.startsWith("Teresa")) ?? reviewsSection.reviews[0];
  const order = ["Wendy", "Elizabeth", "Susan"];
  const others = reviewsSection.reviews
    .filter((x) => x !== featured)
    .sort((a, b) => order.findIndex((n) => a.name.startsWith(n)) - order.findIndex((n) => b.name.startsWith(n)));
  const basedOn = reviewsSection.ratingLabels.basedOn.replace("{{count}}", String(r.count)).replace("{{source}}", r.source);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="py-section-lg">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />

        {/* Rating column */}
        <div className="col-span-4 md:col-span-8 lg:sticky lg:top-36 lg:col-span-3 lg:self-start">
          {numeral ? (
            <span aria-hidden="true" className="block font-serif text-h3 leading-none text-ink-muted">
              {numeral}
            </span>
          ) : null}
          <h2 id="reviews-title" className="mt-2 font-sans text-label font-medium text-ink-muted">
            {title}
          </h2>
          <div className="mt-6 flex items-end gap-x-6 border-b border-rule pb-6 lg:block lg:border-0 lg:pb-0">
            <p className="flex items-baseline gap-3 lg:block">
              <span className="font-display text-display leading-none tabular">{r.overall}</span>
              <span className="text-label text-ink-muted lg:mt-2 lg:block">
                {reviewsSection.ratingLabels.overall}, of {r.outOf}
              </span>
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-x-col text-small lg:mt-8 lg:block">
            <div className="flex justify-between border-b border-rule py-2 lg:border-t-0">
              <dt className="text-ink-muted">{reviewsSection.ratingLabels.cleanliness}</dt>
              <dd className="tabular">{r.cleanliness}</dd>
            </div>
            <div className="flex justify-between border-b border-rule py-2">
              <dt className="text-ink-muted">{reviewsSection.ratingLabels.location}</dt>
              <dd className="tabular">{r.location}</dd>
            </div>
          </dl>
          <p className="mt-3 text-caption text-ink-muted">{basedOn}</p>
          <p className="mt-1 text-caption text-ink-muted">{reviewsSection.subhead}</p>
        </div>

        {/* Featured quotation */}
        <div className="col-span-4 mt-12 md:col-span-8 lg:col-span-8 lg:col-start-5 lg:mt-0">
          <figure>
            <blockquote className="hang-quote font-serif text-quote font-light italic">
              <p>&ldquo;{featured.text}&rdquo;</p>
            </blockquote>
            <figcaption>
              <Attribution review={featured} />
            </figcaption>
          </figure>

          <div className="mt-16 grid gap-x-col gap-y-10 md:grid-cols-3">
            {others.map((rev) => (
              <figure
                key={rev.name}
                className={`border-t border-rule pt-4 ${
                  rev.text.length > 160 ? "md:col-span-2 md:col-start-2 md:row-span-2 md:row-start-1" : "md:col-start-1"
                }`}
              >
                <blockquote className="hang-quote font-serif text-prose italic">
                  <p>&ldquo;{rev.text}&rdquo;</p>
                </blockquote>
                <figcaption>
                  <Attribution review={rev} />
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </Grid>
    </section>
  );
}
