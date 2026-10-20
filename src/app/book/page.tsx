import Link from "next/link";
import { ReservationForm } from "@/components/booking/ReservationForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { pageBreadcrumb } from "@/lib/seo/schema";
import { booking as bookingCopy } from "@/content/copy";

export const metadata = pageMetadata("book");

/**
 * /book: focused request page (ux-spec 3.3). The form reads the stay from the query string
 * (checkIn, checkOut, adults, children, infants; arrive/depart also accepted) on the client.
 */
export default function BookPage() {
  return (
    <div className="mx-auto max-w-page px-gutter pt-10 pb-section lg:pt-14">
      <JsonLd data={pageBreadcrumb("book")} />
      <p className="text-small">
        <Link href="/">Back to the residence</Link>
      </p>
      <div className="mt-8 grid grid-cols-4 gap-x-col md:grid-cols-8 lg:grid-cols-12">
        <header className="col-span-4 md:col-span-8 lg:col-span-7">
          <h1 className="font-serif text-h1">Request a stay</h1>
          <p className="mt-4 max-w-measure font-serif text-lead">{bookingCopy.reassurance.body}</p>
        </header>
      </div>
      <div className="mt-10 lg:mt-14">
        <ReservationForm variant="page" />
      </div>
    </div>
  );
}
