import Link from "next/link";
import { ReservationForm } from "@/components/booking/ReservationForm";
import { booking, bookingCta } from "@/content/copy";
import { Accordion } from "../Accordion";
import { faqAnswer, faqId, featuredFaq } from "../faq-data";
import { Grid } from "../layout";

/**
 * Reservations: the ledger, then the questions people ask at this point, beside the house rules.
 * The questions sit here rather than in a section of their own, because this is where they arise.
 */
export function Reserve() {
  const questions = featuredFaq().map((f) => ({ id: `home-${faqId(f.q)}`, question: f.q, answer: faqAnswer(f.a) }));
  return (
    <section id="reserve" aria-labelledby="reserve-title" className="pb-section pt-section">
      <Grid>
        <div className="col-span-4 border-t-2 border-ink pt-6 md:col-span-8 lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-col">
          <h2 id="reserve-title" className="text-h2 lg:col-span-5">
            {bookingCta.heading}
          </h2>
          <p className="mt-5 max-w-measure font-serif text-lead lg:col-span-6 lg:col-start-7 lg:mt-2">{bookingCta.body}</p>
        </div>

        <div className="col-span-4 mt-10 md:col-span-8 lg:col-span-12 lg:mt-14">
          <ReservationForm variant="inline" />
        </div>

        <div className="col-span-4 mt-16 grid gap-x-col gap-y-12 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:mt-20 lg:grid-cols-12">
          <div className="md:col-span-8 lg:col-span-7">
            <h3 className="apparatus border-b border-ink pb-2">Before you book</h3>
            <Accordion items={questions} headingLevel={4} />
            <Link href="/faq" className="mt-4 inline-flex min-h-11 items-center text-small font-medium">
              All questions
            </Link>
          </div>
          <div className="md:col-span-8 lg:col-span-4 lg:col-start-9">
            <h3 className="apparatus border-b border-ink pb-2">{booking.policiesHeading}</h3>
            <ul className="text-small">
              {booking.policiesSummary.map((line) => (
                <li key={line} className="border-b border-rule py-2">
                  {line}
                </li>
              ))}
            </ul>
            <Link href="/policies#house-rules" className="mt-2 inline-flex min-h-11 items-center text-small font-medium">
              Read the house rules
            </Link>
            <div className="mt-8 bg-stone p-5">
              <p className="font-serif text-h3">{booking.reassurance.title}</p>
              <p className="mt-2 text-small">{booking.reassurance.body}</p>
            </div>
          </div>
        </div>
      </Grid>
    </section>
  );
}
