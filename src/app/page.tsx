import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { propertySchema, websiteSchema } from "@/lib/seo/schema";
import { getPhotos } from "@/lib/photos";
import { Amenities } from "@/components/site/home/Amenities";
import { Arrival } from "@/components/site/home/Arrival";
import { Beach } from "@/components/site/home/Beach";
import { ContactSheet } from "@/components/site/home/ContactSheet";
import { Cover } from "@/components/site/home/Cover";
import { Host } from "@/components/site/home/Host";
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
      {/* The cover carries the reservation bar (desktop) and mounts the fixed mobile bar. */}
      <Cover />
      <Residence />
      <TheSpace />
      <ContactSheet />
      <Amenities />
      <Resort />
      <Beach />
      <Testimony />
      <Host />
      <Arrival />
      <Reserve />
    </>
  );
}
