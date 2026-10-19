import type { Metadata } from "next";
import { noindexMetadata } from "@/lib/seo/metadata";
import { SuccessSummary, type RequestSummary } from "@/components/booking/SuccessSummary";
import { getStore } from "@/lib/booking/store";

export const metadata: Metadata = { ...noindexMetadata, title: "Request received" };
export const dynamic = "force-dynamic";

/** /booking/success?id=POT-XXXX-XXXX (also accepts ?ref=). */
export default async function SuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const raw = sp.id ?? sp.ref;
  const id = typeof raw === "string" && /^POT-[0-9]{4}-[A-Z0-9]{4}$/.test(raw) ? raw : null;
  let initial: RequestSummary | null = null;
  if (id) {
    try {
      const r = await getStore().get(id);
      if (r) {
        initial = {
          id: r.id,
          name: r.name,
          email: r.email,
          checkIn: r.checkIn,
          checkOut: r.checkOut,
          adults: r.adults,
          children: r.children,
          infants: r.infants,
          total: r.quote.total,
          status: r.status,
        };
      }
    } catch (err) {
      console.error("[booking/success] store lookup failed", err);
    }
  }
  return (
    <div className="mx-auto max-w-page px-gutter pt-12 pb-section lg:pt-16">
      <SuccessSummary id={id} initial={initial} paid={sp.paid === "1"} />
    </div>
  );
}
