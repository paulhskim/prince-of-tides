import Link from "next/link";
import { ReservationForm } from "@/components/booking/ReservationForm";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHeader } from "@/components/site/layout";
import { pageMetadata } from "@/lib/seo/metadata";
import { pageBreadcrumb } from "@/lib/seo/schema";
import { booking as bookingCopy } from "@/content/copy";

export const metadata = pageMetadata("book");

/**
 * /book: focused request page (ux-spec 3.3), opened like a reservation letter: running head, the
 * title in the display cut, the terms in a sentence, then the four parts of the request beside the
 * reservation card. The form reads the stay from the query string on the client.
 */
export default function BookPage() {
  return (
    <>
      <JsonLd data={pageBreadcrumb("book")} />
      <PageHeader
        eyebrow="Reservations"
        folio="Prince of Tides, Hilton Head Resort"
        title="Request a stay"
        lead={bookingCopy.reassurance.body}
        aside={
          <Link href="/" className="link-caps">
            Back to the residence
          </Link>
        }
      />
      <div className="mx-auto max-w-page px-gutter pb-section">
        <ReservationForm variant="page" />
      </div>
    </>
  );
}
