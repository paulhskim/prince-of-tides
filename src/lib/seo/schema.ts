/**
 * JSON-LD builders. Strategy: docs/seo.md section 4. Wiring: docs/seo-implementation.md.
 *
 * Rules enforced here:
 * - No AggregateRating or Review markup, ever (self-serving reviews and reviews aggregated from Vrbo are
 *   ineligible under Google's review snippet guidelines; docs/seo.md 4.4).
 * - Public address only: the unit number is never emitted.
 * - All URLs absolute, built from siteUrl().
 *
 * Property entity decision (docs/seo.md 4.2 and 4.3):
 * - With 8 or more owner photos that include a bedroom, a bathroom and a common area (Google's
 *   VacationRental image requirement), propertySchema() emits a full `VacationRental`.
 * - Otherwise it emits a `LodgingBusiness` (lite) for the same entity, with images when any exist.
 *   VacationRental is a LodgingBusiness subtype, so exactly one of the two is emitted, never both.
 * The switch is automatic: when the owner adds photos to public/photos, the next build upgrades it.
 */
import { seo } from "@/content/seo";
import { siteConfig } from "@/content/site.config";
import type { FaqItem } from "@/content/faq";
import { absoluteUrl, siteUrl } from "./site-url";

export type JsonLdObject = { "@context"?: string; "@type": string | string[]; [key: string]: unknown };

/** Minimal photo shape. getPhotos() from "@/lib/photos" satisfies it. */
export type SchemaPhoto = { src: string; alt?: string; slot?: string };

export const MIN_VACATION_RENTAL_PHOTOS = 8;

const CONTEXT = "https://schema.org";
const ids = {
  website: () => `${siteUrl()}/#website`,
  rental: () => `${siteUrl()}/#rental`,
};

function postalAddress() {
  return { "@type": "PostalAddress", ...seo.address };
}

function geo() {
  return { "@type": "GeoCoordinates", latitude: seo.geo.latitude, longitude: seo.geo.longitude };
}

function amenityFeatures() {
  return seo.vacationRentalSchemaFields.containsPlace.amenityFeature.map((a) => ({
    "@type": "LocationFeatureSpecification",
    name: a.name,
    value: a.value,
  }));
}

function accommodation() {
  const c = seo.vacationRentalSchemaFields.containsPlace;
  return {
    "@type": "Accommodation",
    additionalType: c.additionalType,
    occupancy: { "@type": "QuantitativeValue", value: c.occupancy.value },
    numberOfBedrooms: c.numberOfBedrooms,
    numberOfBathroomsTotal: c.numberOfBathroomsTotal,
    floorSize: { "@type": "QuantitativeValue", value: c.floorSize.value, unitCode: c.floorSize.unitCode },
    bed: c.bed.map((b) => ({ "@type": "BedDetails", numberOfBeds: b.numberOfBeds, typeOfBed: b.typeOfBed })),
    amenityFeature: amenityFeatures(),
  };
}

const BEDROOM_SLOTS = new Set(["bedroom1", "bedroom2"]);
const BATH_SLOTS = new Set(["bath"]);
const COMMON_SLOTS = new Set(["living", "kitchen", "dining"]);

/**
 * Google VacationRental image rule: 8+ images including at least one bedroom, one bathroom and one
 * common area. Photos without a slot are counted but cannot prove coverage.
 */
export function qualifiesForVacationRental(photos: SchemaPhoto[]): boolean {
  if (photos.length < MIN_VACATION_RENTAL_PHOTOS) return false;
  const slots = new Set(photos.map((p) => p.slot ?? ""));
  const has = (set: Set<string>) => [...slots].some((s) => set.has(s));
  return has(BEDROOM_SLOTS) && has(BATH_SLOTS) && has(COMMON_SLOTS);
}

/** Host portrait is never part of the property imagery. */
function propertyImages(photos: SchemaPhoto[]): string[] {
  return photos.filter((p) => p.slot !== "host").map((p) => absoluteUrl(p.src));
}

/** Full Google VacationRental entity. Callers normally use propertySchema(), which checks eligibility. */
export function vacationRentalSchema(photos: SchemaPhoto[]): JsonLdObject {
  const f = seo.vacationRentalSchemaFields;
  return {
    "@context": CONTEXT,
    "@type": "VacationRental",
    "@id": ids.rental(),
    additionalType: f.additionalType,
    identifier: f.identifier,
    name: seo.siteName,
    url: absoluteUrl("/"),
    description: seo.defaultDescription,
    brand: { "@type": "Brand", name: seo.siteName },
    image: propertyImages(photos),
    latitude: seo.geo.latitude,
    longitude: seo.geo.longitude,
    address: postalAddress(),
    checkinTime: f.checkinTime,
    checkoutTime: f.checkoutTime,
    knowsLanguage: f.knowsLanguage,
    containsPlace: accommodation(),
  };
}

/** LodgingBusiness (lite), docs/seo.md 4.3. Used until the photo requirement for VacationRental is met. */
export function lodgingBusinessSchema(photos: SchemaPhoto[]): JsonLdObject {
  const f = seo.vacationRentalSchemaFields;
  const images = propertyImages(photos);
  return {
    "@context": CONTEXT,
    "@type": "LodgingBusiness",
    "@id": ids.rental(),
    name: seo.siteName,
    url: absoluteUrl("/"),
    description: seo.defaultDescription,
    ...(images.length ? { image: images } : {}),
    address: postalAddress(),
    geo: geo(),
    checkinTime: f.checkinTime,
    checkoutTime: f.checkoutTime,
    petsAllowed: siteConfig.capacity.petsAllowed,
    knowsLanguage: f.knowsLanguage,
    amenityFeature: amenityFeatures(),
    containsPlace: accommodation(),
  };
}

/** The one property entity for the home page: VacationRental when eligible, else LodgingBusiness. */
export function propertySchema(photos: SchemaPhoto[]): JsonLdObject {
  return qualifiesForVacationRental(photos) ? vacationRentalSchema(photos) : lodgingBusinessSchema(photos);
}

/** WebSite entity for the home page (no SearchAction: there is no site search). */
export function websiteSchema(): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "WebSite",
    "@id": ids.website(),
    name: seo.siteName,
    url: absoluteUrl("/"),
    inLanguage: "en-US",
  };
}

/** Values for {{tokens}} used in content files, so JSON-LD text matches the visible text. */
export const contentTokens: Record<string, string | number> = {
  responseTimeHours: siteConfig.contact.responseTimeHours,
  minNights: siteConfig.booking.minNightsDefault,
  maxGuests: siteConfig.capacity.maxGuests,
  minAge: siteConfig.capacity.minAge,
  permit: siteConfig.permit.townStrPermit,
};

export function fillTokens(text: string, tokens: Record<string, string | number> = contentTokens): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key: string) =>
    key in tokens ? String(tokens[key]) : match,
  );
}

/**
 * FAQPage for /faq. Pass exactly the items rendered on the page. If the page renders answers through
 * its own token function, pass it as `render` so the markup matches the visible text.
 */
export function faqPageSchema(items: FaqItem[], render: (text: string) => string = fillTokens): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "FAQPage",
    url: absoluteUrl("/faq"),
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: render(item.q),
      acceptedAnswer: { "@type": "Answer", text: render(item.a) },
    })),
  };
}

export type Crumb = { name: string; path: string };

/** BreadcrumbList from ordered crumbs (Home first). */
export function breadcrumbSchema(items: Crumb[]): JsonLdObject {
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Breadcrumb labels match the masthead and footer link labels. */
export const PAGE_LABELS = {
  home: "Home",
  book: "Book direct",
  gallery: "Photographs",
  area: "Area guide",
  faq: "Questions",
  policies: "Policies",
} as const;

/** Home > Page, for every page except "/". */
export function pageBreadcrumb(page: Exclude<keyof typeof PAGE_LABELS, "home">): JsonLdObject {
  return breadcrumbSchema([
    { name: PAGE_LABELS.home, path: "/" },
    { name: PAGE_LABELS[page], path: seo.pages[page].path },
  ]);
}
