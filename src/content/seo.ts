/**
 * SEO configuration: titles, descriptions, keywords, geo and schema.org fields.
 * Strategy and rationale live in docs/seo.md.
 *
 * Title rules: the final rendered <title> must be 60 characters or fewer.
 * - Pages with useTemplate: true render as titleTemplate ("%s | Prince of Tides"),
 *   which adds 18 characters, so their `title` is kept to 42 characters or fewer.
 * - The home page renders its `title` as-is.
 * Description rule: 155 characters or fewer.
 */

export type PageKey = "home" | "book" | "gallery" | "area" | "faq" | "policies";

export interface PageSeo {
  title: string;
  /** true: render through titleTemplate. false: render title as-is. */
  useTemplate: boolean;
  description: string;
  path: string;
  keywords: string[];
}

/** Google vacation rental amenity names (containsPlace.amenityFeature). */
export type BooleanAmenityName =
  | "ac"
  | "airportShuttle"
  | "balcony"
  | "beachAccess"
  | "childFriendly"
  | "crib"
  | "elevator"
  | "fireplace"
  | "freeBreakfast"
  | "gymFitnessEquipment"
  | "heating"
  | "hotTub"
  | "instantBookable"
  | "ironingBoard"
  | "kitchen"
  | "microwave"
  | "outdoorGrill"
  | "ovenStove"
  | "patio"
  | "petsAllowed"
  | "pool"
  | "privateBeachAccess"
  | "selfCheckinCheckout"
  | "smokingAllowed"
  | "tv"
  | "washerDryer"
  | "wheelchairAccessible"
  | "wifi";

export type ValueAmenityName = "internetType" | "parkingType" | "poolType" | "licenseNum";

export type AmenityFeature =
  | { name: BooleanAmenityName; value: boolean }
  | { name: ValueAmenityName; value: string };

export interface BedDetails {
  numberOfBeds: number;
  /** Google suggested values: CaliforniaKing, King, Queen, Full, Double, SemiDouble, Single. */
  typeOfBed: "CaliforniaKing" | "King" | "Queen" | "Full" | "Double" | "SemiDouble" | "Single";
}

export interface SeoConfig {
  siteName: string;
  siteUrlPlaceholder: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  pages: Record<PageKey, PageSeo>;
  ogImageAlt: string;
  /** Path under /public; owner will replace with a real 1200x630 photo. */
  ogImagePath: string;
  locale: "en_US";
  geo: { latitude: number; longitude: number };
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  vacationRentalSchemaFields: {
    /** Stable ID required by Google. Never change it once published. */
    identifier: string;
    /** Google suggested value closest to a condo. */
    additionalType: "Apartment";
    checkinTime: string;
    checkoutTime: string;
    knowsLanguage: string[];
    containsPlace: {
      additionalType: "EntirePlace";
      occupancy: { value: number };
      numberOfBedrooms: number;
      numberOfBathroomsTotal: number;
      floorSize: { value: number; unitCode: "FTK" };
      bed: BedDetails[];
      amenityFeature: AmenityFeature[];
    };
  };
}

export const seo: SeoConfig = {
  siteName: "Prince of Tides",
  siteUrlPlaceholder: "TODO_OWNER_DOMAIN",
  defaultTitle: "Prince of Tides | Hilton Head Resort 2BR Condo Rental",
  titleTemplate: "%s | Prince of Tides",
  defaultDescription:
    "Updated 2-bedroom, 2-bath condo for 6 at gated Hilton Head Resort, mid-island. Steps to the heated indoor pool, sauna and gym. Book direct.",

  pages: {
    home: {
      title: "Prince of Tides | Hilton Head Resort 2BR Condo Rental",
      useTemplate: false,
      description:
        "Updated 2-bedroom, 2-bath condo for 6 at gated Hilton Head Resort, mid-island. Steps to the heated indoor pool, sauna and gym. Book direct.",
      path: "/",
      keywords: [
        "Hilton Head Resort condo rental",
        "Hilton Head 2 bedroom condo",
        "Hilton Head condo with indoor pool",
        "mid-island Hilton Head vacation rental",
        "gated Hilton Head vacation rental",
        "Hilton Head condo sleeps 6",
        "Hilton Head Resort vacation rental",
      ],
    },
    book: {
      title: "Reserve: Rates, Taxes & Request",
      useTemplate: true,
      description:
        "Pick your dates, see an estimated quote and request your stay at Prince of Tides, a 2BR condo at Hilton Head Resort. Book direct with the host.",
      path: "/reserve",
      keywords: [
        "book direct Hilton Head",
        "Hilton Head condo book direct",
        "Hilton Head Resort condo availability",
        "Hilton Head vacation rental no booking fee",
        "Hilton Head Resort rental owner direct",
      ],
    },
    gallery: {
      title: "Photos: 2BR Condo at Hilton Head Resort",
      useTemplate: true,
      description:
        "See the king suite, queen and full bedroom, two baths, full kitchen and the indoor pool atrium steps from Building 3 at Hilton Head Resort.",
      path: "/gallery",
      keywords: [
        "Hilton Head Resort condo photos",
        "Hilton Head Resort indoor pool",
        "Hilton Head Resort boardwalk",
        "Hilton Head 2 bedroom condo pictures",
      ],
    },
    area: {
      title: "Mid-Island Hilton Head Area Guide",
      useTemplate: true,
      description:
        "Beaches, restaurants, groceries and things to do near Hilton Head Resort, with approx. drive times to Shelter Cove, Palmetto Dunes and the airports.",
      path: "/area",
      keywords: [
        "Hilton Head condo near Shelter Cove",
        "things to do mid-island Hilton Head",
        "restaurants near Shelter Cove Hilton Head",
        "Hilton Head Resort to beach",
        "Driessen Beach Park",
        "Folly Field Beach",
        "Hilton Head vacation rental near Palmetto Dunes",
      ],
    },
    faq: {
      title: "FAQ: Parking, Check-In, Beach Access",
      useTemplate: true,
      description:
        "How far is the beach, where to park, how self check-in works, what is in the kitchen and more. Straight answers about Prince of Tides, Hilton Head Resort.",
      path: "/faq",
      keywords: [
        "Hilton Head Resort parking",
        "Hilton Head Resort beach shuttle",
        "how far is Hilton Head Resort from the beach",
        "Hilton Head Resort check-in",
        "Hilton Head Resort amenities",
      ],
    },
    policies: {
      title: "House Rules, Policies & STR Permit",
      useTemplate: true,
      description:
        "Check-in 4 PM, check-out 10 AM, 21+ to book, no pets, no smoking. Full house rules and Town of Hilton Head Island STR Permit 029008.",
      path: "/policies",
      keywords: [
        "Hilton Head short term rental permit",
        "Hilton Head vacation rental policies",
        "Hilton Head condo house rules",
      ],
    },
  },

  ogImageAlt:
    "Prince of Tides, a 2-bedroom condo at Hilton Head Resort on Hilton Head Island, South Carolina",
  ogImagePath: "/photos/og-image.jpg",
  locale: "en_US",

  // Hilton Head Resort, 663 William Hilton Pkwy. Expedia lists 32.19051, -80.70688;
  // the US Census geocoder places the street address at 32.19243, -80.70789 (about 0.15 mi away),
  // which confirms the point. Google requires at least 5 decimal places.
  geo: { latitude: 32.19051, longitude: -80.70688 },

  // Unit number deliberately omitted (public address only; full address is sent after confirmation).
  address: {
    streetAddress: "663 William Hilton Parkway",
    addressLocality: "Hilton Head Island",
    addressRegion: "SC",
    postalCode: "29928",
    addressCountry: "US",
  },

  vacationRentalSchemaFields: {
    identifier: "prince-of-tides-hilton-head-resort",
    additionalType: "Apartment",
    // Local time (America/New_York). No offset, because it changes with daylight saving time.
    checkinTime: "16:00:00",
    checkoutTime: "10:00:00",
    knowsLanguage: ["en-US"],
    containsPlace: {
      additionalType: "EntirePlace",
      occupancy: { value: 6 },
      numberOfBedrooms: 2,
      numberOfBathroomsTotal: 2,
      floorSize: { value: 831, unitCode: "FTK" },
      bed: [
        { numberOfBeds: 1, typeOfBed: "King" },
        { numberOfBeds: 1, typeOfBed: "Queen" },
        { numberOfBeds: 1, typeOfBed: "Full" },
      ],
      amenityFeature: [
        { name: "ac", value: true },
        { name: "heating", value: true },
        { name: "wifi", value: true },
        { name: "internetType", value: "Free" },
        { name: "tv", value: true },
        { name: "kitchen", value: true },
        { name: "microwave", value: true },
        { name: "ovenStove", value: true },
        { name: "ironingBoard", value: true },
        { name: "crib", value: true },
        { name: "childFriendly", value: true },
        { name: "selfCheckinCheckout", value: true },
        { name: "elevator", value: true },
        { name: "pool", value: true },
        { name: "poolType", value: "Indoor" },
        { name: "poolType", value: "Outdoor" },
        { name: "hotTub", value: true },
        { name: "gymFitnessEquipment", value: true },
        { name: "outdoorGrill", value: true },
        { name: "beachAccess", value: true },
        { name: "washerDryer", value: false },
        { name: "petsAllowed", value: false },
        { name: "smokingAllowed", value: false },
        { name: "instantBookable", value: false },
        { name: "licenseNum", value: "Town of Hilton Head Island STR Permit: 029008" },
        // TODO_OWNER: confirm parking is free for guests, then add { name: "parkingType", value: "Free" }.
        // TODO_OWNER: add { name: "wheelchairAccessible", value: ... } only if confirmed.
      ],
    },
  },
};
