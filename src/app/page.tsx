import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { propertySchema, websiteSchema } from "@/lib/seo/schema";
import { getPhotos } from "@/lib/photos";
import { Amenities } from "@/components/site/home/Amenities";
import { Arrival } from "@/components/site/home/Arrival";
import { Beach } from "@/components/site/home/Beach";
import { Cover } from "@/components/site/home/Cover";
import { Day } from "@/components/site/home/Day";
import { Host } from "@/components/site/home/Host";
import { Island } from "@/components/site/home/Island";
import { Privileges } from "@/components/site/home/Privileges";
import { Reserve } from "@/components/site/home/Reserve";
import { Residence } from "@/components/site/home/Residence";
import { Rooms } from "@/components/site/home/Rooms";
import { Seasons } from "@/components/site/home/Seasons";
import { Testimony } from "@/components/site/home/Testimony";

export const metadata = pageMetadata("home");

/*
 * The home page, in the order of the masthead: I residence, II rooms, III privileges (with the beach),
 * IV the island (with a day and the seasons), the guests' words, the arrival dossier, then the
 * reservation itself. There is no public rate table: prices appear only on /reserve, in the itemized
 * quote, after a guest chooses dates. Night passages: the cover, the island, the arrival dossier, the footer.
 */
export default function Home() {
  return (
    <>
      <JsonLd data={[websiteSchema(), propertySchema(getPhotos())]} />
      {/* The cover carries the reservation bar (desktop) and mounts the fixed mobile bar. */}
      <Cover />
      <Residence />
      <Rooms />
      <Amenities />
      <Privileges />
      <Beach />
      <Island />
      <Day />
      <Seasons />
      <Testimony />
      <Host />
      <Arrival />
      <Reserve />
    </>
  );
}
