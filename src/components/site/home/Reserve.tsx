import Link from "next/link";
import { ReservationForm } from "@/components/booking/ReservationForm";
import { booking, bookingCta } from "@/content/copy";
import { bookDirect } from "@/content/experiences";
import { Accordion } from "../Accordion";
import { faqAnswer, faqId, featuredFaq } from "../faq-data";
import { Grid, RunningHead } from "../layout";
import { roman, smart } from "../text";

/**
 * Reservations: the ledger, then the questions people ask at this point, beside the house rules.
 * The questions sit here rather than in a section of their own, because this is where they arise.
 */
export function Reserve() {
  const questions = featuredFaq().map((f) => ({ id: `home-${faqId(f.q)}`, question: f.q, answer: faqAnswer(f.a) }));
  return (
    <section id="reserve" aria-labelledby="reserve-title" className="pb-section pt-section">
      <Grid>
        <div className="col-span-4 md:col-span-8 lg:col-span-12">
          <RunningHead left="Reservations, by request" right="Nothing is charged today" />
        </div>
        <div className="col-span-4 mt-10 md:col-span-8 lg:col-span-12 lg:mt-14 lg:grid lg:grid-cols-12 lg:gap-x-col">
          <h2 id="reserve-title" className="display-cut text-h1 lg:col-span-6">
            {bookingCta.heading}
          </h2>
          <div className="mt-6 lg:col-span-5 lg:col-start-8 lg:mt-3">
            <p className="max-w-measure font-serif text-lead">{bookingCta.body}</p>
            <Link href={bookingCta.button.href} className="link-caps mt-3">
              Open the reservation page
            </Link>
          </div>
        </div>

        <div className="col-span-4 mt-10 md:col-span-8 lg:col-span-12 lg:mt-14">
          <ReservationForm variant="inline" />
        </div>

        <div className="col-span-4 mt-16 md:col-span-8 lg:col-span-12 lg:mt-20">
          <h3 className="smallcaps border-b border-ink pb-2">Reserving here</h3>
          <ol className="grid gap-x-col md:grid-cols-2 lg:grid-cols-4">
            {bookDirect.map((r, i) => (
              <li key={r.id} className="grid grid-cols-[2rem_1fr] border-b border-rule py-4 lg:border-b-0 lg:pr-4">
                <span aria-hidden="true" className="font-serif text-body italic text-brass">
                  {roman(i + 1)}
                </span>
                <span>
                  <span className="block font-serif text-[1.1875rem] leading-snug">{smart(r.title)}</span>
                  <span className="mt-1 block text-small text-ink-muted">{smart(r.body)}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="col-span-4 mt-16 grid gap-x-col gap-y-12 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:mt-20 lg:grid-cols-12">
          <div className="md:col-span-8 lg:col-span-7">
            <h3 className="apparatus border-b border-ink pb-2">Before you book</h3>
            <Accordion items={questions} headingLevel={4} />
            <Link href="/faq" className="link-caps mt-4">
              All questions
            </Link>
          </div>
          <div className="md:col-span-8 lg:col-span-4 lg:col-start-9">
            <h3 className="apparatus border-b border-ink pb-2">{booking.policiesHeading}</h3>
            <ul className="text-small">
              {booking.policiesSummary.map((line) => (
                <li key={line} className="border-b border-rule py-2.5">
                  {line}
                </li>
              ))}
            </ul>
            <Link href="/policies#house-rules" className="link-caps mt-2">
              Read the house rules
            </Link>
            <div className="mt-10 border-t border-ink pt-5">
              <p className="font-serif text-h3 font-light italic">{booking.reassurance.title}</p>
              <p className="mt-2 text-small">{booking.reassurance.body}</p>
            </div>
          </div>
        </div>
      </Grid>
    </section>
  );
}
