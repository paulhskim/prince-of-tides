import type { Metadata } from "next";
import { MapDemo } from "./MapDemo";

/** Internal test page for the estate map. Not linked, not in the sitemap, never indexed. */
export const metadata: Metadata = {
  title: "Map test",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function DevMapPage() {
  return <MapDemo />;
}
