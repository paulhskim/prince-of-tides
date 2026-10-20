import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { ReserveFlow } from "@/components/reserve/ReserveFlow";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { absoluteUrl } from "@/lib/seo/site-url";

/**
 * /reserve: the reservation page (dates with nightly rates, guests, folio, details, review and
 * request, confirmation). Titles and descriptions come from the "book" entry in src/content/seo.ts;
 * the canonical points here because /book now redirects to this page.
 */
const base = pageMetadata("book");
export const metadata: Metadata = {
  ...base,
  alternates: { canonical: absoluteUrl("/reserve") },
  openGraph: { ...base.openGraph, url: absoluteUrl("/reserve") },
};

export default function ReservePage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Reserve", path: "/reserve" },
        ])}
      />
      <ReserveFlow />
    </>
  );
}
