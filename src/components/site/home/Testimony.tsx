import { reviewsSection, type Review } from "@/content/copy";
import { Grid, SectionTitle } from "../layout";
import { longMonth, splitHeading } from "../text";

function Attribution({ review }: { review: Review }) {
  return (
    <p className="mt-5 text-small">
      <span className="font-medium">{review.name}</span>, {longMonth(review.date)}
      <span className="mt-0.5 block text-caption text-ink-muted">
        {review.source}, rated {review.rating} of {review.outOf}
      </span>
    </p>
  );
}

/**
 * VI. Guests, in their words: one quotation set large, then a row of record. The rating is a
 * line of fact at the head of that row, not a headline number.
 */
export function Testimony() {
  const { numeral, title } = splitHeading(reviewsSection.heading);
  const r = reviewsSection.ratingSummary;
  const featured = reviewsSection.reviews.find((x) => x.name.startsWith("Teresa")) ?? reviewsSection.reviews[0];
  const order = ["Wendy", "Elizabeth", "Susan"];
  const others = reviewsSection.reviews
    .filter((x) => x !== featured)
    .sort((a, b) => order.findIndex((n) => a.name.startsWith(n)) - order.findIndex((n) => b.name.startsWith(n)));
  const basedOn = reviewsSection.ratingLabels.basedOn.replace("{{count}}", String(r.count)).replace("{{source}}", r.source);

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="pb-section-lg pt-section">
      <Grid>
        <div className="col-span-4 border-t border-ink pt-5 md:col-span-8 lg:col-span-12">
          <SectionTitle id="reviews-title" numeral={numeral} tier="reference">
            {title}
          </SectionTitle>
        </div>

        <figure data-reveal className="col-span-4 mt-12 md:col-span-8 lg:col-span-10 lg:col-start-2 lg:mt-20">
          <blockquote className="hang-quote font-serif text-quote font-light italic">
            <p>&ldquo;{featured.text}&rdquo;</p>
          </blockquote>
          <figcaption>
            <Attribution review={featured} />
          </figcaption>
        </figure>

        <div data-reveal className="col-span-4 mt-16 grid gap-x-col gap-y-10 border-t border-rule pt-8 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:mt-20 lg:grid-cols-12">
          <div className="md:col-span-8 lg:col-span-3">
            <p className="smallcaps text-ink-muted">The record</p>
            <p className="mt-3 font-serif text-[2.5rem] font-light leading-none tracking-[-0.02em] tabular">
              {r.overall} <span className="text-[0.6em] italic text-ink-muted">of {r.outOf}</span>
            </p>
            <dl className="mt-3 text-small">
              <div className="flex justify-between border-b border-rule py-1.5">
                <dt className="text-ink-muted">{reviewsSection.ratingLabels.cleanliness}</dt>
                <dd className="tabular">{r.cleanliness}</dd>
              </div>
              <div className="flex justify-between border-b border-rule py-1.5">
                <dt className="text-ink-muted">{reviewsSection.ratingLabels.location}</dt>
                <dd className="tabular">{r.location}</dd>
              </div>
            </dl>
            <p className="mt-3 text-caption text-ink-muted">
              {basedOn}. {reviewsSection.subhead}
            </p>
          </div>
          {others.map((rev, i) => (
            <figure
              key={rev.name}
              className={rev.text.length > 160 ? "md:col-span-8 lg:col-span-4" : i === 0 ? "md:col-span-4 lg:col-span-2" : "md:col-span-4 lg:col-span-3"}
            >
              <blockquote className="hang-quote font-serif text-body leading-relaxed italic">
                <p>&ldquo;{rev.text}&rdquo;</p>
              </blockquote>
              <figcaption>
                <Attribution review={rev} />
              </figcaption>
            </figure>
          ))}
        </div>
      </Grid>
    </section>
  );
}
