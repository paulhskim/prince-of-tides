import Link from "next/link";
import { ReservationForm } from "@/components/booking/ReservationForm";
import { booking, bookingCta } from "@/content/copy";
import { Grid } from "../layout";

export function Reserve() {
  return (
    <section id="reserve" aria-labelledby="reserve-title" className="py-section">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-ink" />
        <p className="col-span-4 mb-3 text-label text-ink-muted md:col-span-8 lg:col-span-3 lg:mb-0">Reservations</p>
        <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-4">
          <h2 id="reserve-title" className="text-h2">
            {bookingCta.heading}
          </h2>
          <p className="mt-5 max-w-measure font-serif text-lead">{bookingCta.body}</p>
        </div>

        <div className="col-span-4 mt-10 md:col-span-8 lg:col-span-12 lg:mt-14">
          <ReservationForm variant="inline" />
        </div>

        <div className="col-span-4 mt-12 grid gap-x-col gap-y-8 border-t border-rule pt-6 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:grid-cols-12">
          <div className="md:col-span-4 lg:col-span-4">
            <h3 className="font-serif text-h3">{booking.reassurance.title}</h3>
            <p className="mt-2 text-small text-ink-muted">{booking.reassurance.body}</p>
          </div>
          <div className="md:col-span-4 lg:col-span-6 lg:col-start-7">
            <h3 className="font-sans text-label font-medium">{booking.policiesHeading}</h3>
            <ul className="mt-2 text-small">
              {booking.policiesSummary.map((line) => (
                <li key={line} className="border-b border-rule py-2">
                  {line}
                </li>
              ))}
            </ul>
            <Link href="/policies#house-rules" className="mt-3 inline-flex min-h-11 items-center text-small">
              Read the house rules
            </Link>
          </div>
        </div>
      </Grid>
    </section>
  );
}
