import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { propertySchema, websiteSchema } from "@/lib/seo/schema";
import { getPhotos } from "@/lib/photos";
import { ReservationBar } from "@/components/booking/ReservationBar";
import { Amenities } from "@/components/site/home/Amenities";
import { Arrival } from "@/components/site/home/Arrival";
import { Beach } from "@/components/site/home/Beach";
import { ContactSheet } from "@/components/site/home/ContactSheet";
import { Cover } from "@/components/site/home/Cover";
import { Highlights } from "@/components/site/home/Highlights";
import { Host } from "@/components/site/home/Host";
import { Location } from "@/components/site/home/Location";
import { Questions } from "@/components/site/home/Questions";
import { Reserve } from "@/components/site/home/Reserve";
import { Residence } from "@/components/site/home/Residence";
import { Resort } from "@/components/site/home/Resort";
import { TheSpace } from "@/components/site/home/TheSpace";
import { Testimony } from "@/components/site/home/Testimony";

export const metadata = pageMetadata("home");

export default function Home() {
  return (
    <>
      <JsonLd data={[websiteSchema(), propertySchema(getPhotos())]} />
      <Cover />
      {/* Docks under the masthead once the cover has scrolled past (design-system 8.5). On small
          screens the bar renders its own fixed bottom bar instead. */}
      <div className="z-40 lg:sticky lg:top-14">
        <div className="mx-auto max-w-page px-gutter">
          <ReservationBar />
        </div>
      </div>
      <Residence />
      <Highlights />
      <TheSpace />
      <ContactSheet />
      <Amenities />
      <Resort />
      <Beach />
      <Location />
      <Testimony />
      <Host />
      <Arrival />
      <Questions />
      <Reserve />
    </>
  );
}
