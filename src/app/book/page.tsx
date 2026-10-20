import { permanentRedirect } from "next/navigation";

/**
 * /book is retired: the reservation page is /reserve. Permanent redirect (308), keeping the query
 * string so links like /book?checkIn=...&checkOut=...&adults=2 open /reserve with the same stay.
 */
export default async function BookPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (Array.isArray(v)) for (const x of v) qs.append(k, x);
    else if (v !== undefined) qs.append(k, v);
  }
  const query = qs.toString();
  permanentRedirect(query ? `/reserve?${query}` : "/reserve");
}
