/**
 * The reasons to come: island experiences, guest privileges, a day on the island, the seasons and
 * the honest reasons to book direct. Quiet-luxury voice (docs/brand-voice.md): specific, calm, no
 * superlatives, no exclamation points.
 *
 * Every fact below was checked in October 2026. Sources:
 * - Calibogue Sound dolphin cruises from Harbour Town (Sea Pines watersports page lists dolphin
 *   cruises that "cruise through Calibogue Sound in search of Atlantic bottlenose dolphins", under
 *   Boat Tours (Harbour Town)): https://www.seapines.com/experiences/watersports
 * - Dolphin and nature cruises from Shelter Cove Marina: src/content/area-guide.ts
 *   (https://palmettodunes.com/shelter-cove/hilton-head-boat-tours)
 * - Harbour Town Lighthouse: 114 steps, open daily 10 AM to sundown, view over Calibogue Sound and
 *   the marina, museum displays inside, small climbing fee: https://harbourtownlighthouse.com/
 * - Pinckney Island National Wildlife Refuge: 4,053 acres between the mainland and Hilton Head,
 *   nearly two-thirds salt marsh and tidal creeks, about 10 miles of trails, Ibis Pond walk 1.2 miles
 *   round trip, white ibis, herons and egrets, open sunrise to sunset, no restrooms:
 *   https://www.fws.gov/refuge/pinckney-island and
 *   https://en.wikipedia.org/wiki/Pinckney_Island_National_Wildlife_Refuge
 * - Harbour Town Golf Links: Sea Pines, Pete Dye with Jack Nicklaus as design consultant, opened 1969,
 *   open visitor policy with tee times: https://www.hiltonheadisland.org/golf/golf-courses/sea-pines-resort/harbour-town-golf-links
 * - RBC Heritage 2027: April 15 to 18, 2027, Harbour Town Golf Links:
 *   https://www.pgatour.com/tournaments/2027/rbc-heritage/R2027012/overview
 * - HarbourFest at Shelter Cove Harbour (June to August, evening entertainment, fireworks over the
 *   marina): https://www.hiltonheadisland.com/events/festivals/harbourfest
 * - Fish Haul Beach Park: end of Beach City Road on Port Royal Sound, boardwalk and observation deck
 *   into the salt marsh, herons and egrets:
 *   https://discoversouthcarolina.com/articles/visit-fish-haul-creek-park-in-hilton-head
 * - Beach riding at low tide, pathways, resort bike rentals, resort amenities, drive times:
 *   src/content/area-guide.ts and docs/BRIEF.md.
 * Not verified, therefore left out: specific dolphin tour operators and prices, tide-dependent
 * sighting claims, sunset direction from any particular beach, water temperatures.
 */

import type { AreaPhotoId } from "@/lib/area-photos";

export interface Experience {
  id: string;
  title: string;
  /** A short line set above or beside the title. */
  kicker: string;
  /** Two to three sentences. */
  body: string;
  photoId?: AreaPhotoId;
  /**
   * An owner photograph (a file in public/photos) used instead of an area photograph when the owner
   * has photographed the same subject at the resort. Shown with its manifest caption, never a credit.
   */
  ownerPhoto?: string;
  /** The real place name. */
  place: string;
  /** Approx. drive from the resort gate, from area-guide data. null when on foot or not measured. */
  approxDriveMinutes: number | null;
  /** How you get there when it is not a drive. */
  access?: string;
  season?: string;
}

export const experiences: Experience[] = [
  {
    id: "dolphins",
    title: "Dolphins in Calibogue Sound",
    kicker: "On the water",
    body:
      "Boat tours leave Harbour Town for Calibogue Sound, the broad water off the island's south end, looking for Atlantic bottlenose dolphins. Nearer home, dolphin and nature cruises set out from Shelter Cove Marina, about 10 minutes from the gate. In summer, book a day or two ahead.",
    photoId: "calibogue-sound-dolphin",
    place: "Calibogue Sound, from Harbour Town or Shelter Cove Marina",
    approxDriveMinutes: 10,
    season: "Year round; most departures in the warmer months",
  },
  {
    id: "harbour-town",
    title: "Harbour Town, late in the day",
    kicker: "The lighthouse",
    body:
      "The red-and-white lighthouse at Harbour Town is open to climb from 10 AM until sundown: 114 steps, with small maritime displays on the way up and Calibogue Sound and the yacht basin at the top. Go in the last hour of light, then walk the harbour. Sea Pines charges a day-pass fee at its gate.",
    photoId: "harbour-town-lighthouse",
    place: "Harbour Town, Sea Pines",
    approxDriveMinutes: 25,
  },
  {
    id: "pinckney",
    title: "Pinckney Island at first light",
    kicker: "A refuge",
    body:
      "A 4,053-acre national wildlife refuge between the island and the mainland, nearly two-thirds of it salt marsh and tidal creek. The gates open at sunrise; the 1.2-mile walk to Ibis Pond is the one to take, for white ibis, egrets and herons. There are no restrooms or water, so bring both.",
    photoId: "pinckney-island-marsh",
    place: "Pinckney Island National Wildlife Refuge",
    approxDriveMinutes: 20,
    season: "Sunrise to sunset, year round",
  },
  {
    id: "beach-evening",
    title: "The beach, early or late",
    kicker: "By the boardwalk",
    body:
      "Take the resort's raised boardwalk over the salt marsh, 0.8 to 1.1 miles, with two chairs from your locker. Early, at low tide, the sand runs wide and pale; late in the day it cools and the light runs long across the water line. Coco's on the Beach is at the end of the walk, for something cold.",
    ownerPhoto: "beach-morning.jpg",
    place: "The beach at the end of the Hilton Head Resort boardwalk",
    approxDriveMinutes: null,
    access: "On foot by the marsh boardwalk, or the seasonal resort shuttle",
  },
  {
    id: "herons",
    title: "Herons in the shallows",
    kicker: "The marsh",
    body:
      "Great blue herons and egrets work the island's marsh edges and tidal shallows, standing so still that most people walk past them. At Fish Haul Beach Park, on the north end, a boardwalk and observation deck reach out into the spartina over Port Royal Sound. Bring binoculars and some patience.",
    photoId: "hilton-head-great-blue-heron",
    place: "Fish Haul Beach Park, Beach City Road",
    approxDriveMinutes: null,
    access: "A drive to the north end of the island",
  },
  {
    id: "golf",
    title: "A round at Harbour Town Golf Links",
    kicker: "Golf",
    body:
      "Pete Dye's course in Sea Pines, opened in 1969 with Jack Nicklaus as design consultant, and home each April to the PGA TOUR's RBC Heritage. It keeps an open visitor policy; book a tee time ahead. Closer to home, Palmetto Dunes has three courses open to the public, about six minutes away.",
    photoId: "harbour-town-golf-links",
    place: "Harbour Town Golf Links, Sea Pines",
    approxDriveMinutes: 25,
  },
  {
    id: "shelter-cove",
    title: "Evenings at Shelter Cove Harbour",
    kicker: "Ten minutes away",
    body:
      "A waterfront promenade around the island's largest marina, with the King Neptune statue, shops and dinner on the water at places like ELA's. From June to August, HarbourFest brings music to the harbour on summer evenings and fireworks over the marina. Book dinner ahead if you want a table at sunset.",
    place: "Shelter Cove Harbour & Marina",
    approxDriveMinutes: 10,
    season: "HarbourFest, June to August",
  },
  {
    id: "low-tide",
    title: "The beach by bicycle, at low tide",
    kicker: "Low water",
    body:
      "At low tide the sand goes hard and wide, and about 12 miles of beach can be ridden. Bikes can be rented at the resort, and more than 72 miles of Town pathways run inland. Check the tide table the night before.",
    place: "Hilton Head Island's Atlantic beaches",
    approxDriveMinutes: null,
    access: "Ride from the resort; bike rentals on site",
  },
];

export interface Privilege {
  id: string;
  name: string;
  line: string;
}

/**
 * The shared amenities of Hilton Head Resort (HOA run), open to guests. Only the real list from
 * docs/BRIEF.md. The deli and Coco's are places to buy food and drink, not inclusions.
 */
export const privileges: Privilege[] = [
  { id: "indoor-pool", name: "Heated indoor pool", line: "Under the atrium beside Building 3, a few steps from the door." },
  { id: "outdoor-pools", name: "Two outdoor pools", line: "With sun decks, and a kiddie pool for the smallest guests." },
  { id: "hot-tub", name: "Hot tub", line: "For the end of a long beach day." },
  { id: "sauna", name: "Sauna", line: "Dry heat, off the indoor atrium." },
  { id: "steam", name: "Steam room", line: "Beside the sauna. Guests mention it by name." },
  { id: "fitness", name: "Fitness center", line: "Beside the indoor atrium, out of the weather." },
  { id: "track", name: "Indoor walking track", line: "A routine that survives a rainy week." },
  { id: "courts", name: "Lighted tennis and pickleball courts", line: "Play after dinner, when it is cooler." },
  { id: "volleyball", name: "Sand volleyball", line: "Bring friends." },
  { id: "boardwalk", name: "Private boardwalk to the beach", line: "Raised over the salt marsh, 0.8 to 1.1 miles to the sand." },
  { id: "shuttle", name: "Complimentary beach shuttle", line: "In season, on the resort's schedule." },
  { id: "gate", name: "24-hour guard gate", line: "At the resort entrance, day and night." },
  { id: "cocos", name: "Coco's on the Beach", line: "Beach bar and restaurant at the end of the boardwalk. Seasonal hours." },
  { id: "deli", name: "Beach Bear Deli & Bar", line: "By the Building 1 pool, in season." },
];

export interface DayEntry {
  time: string;
  title: string;
  body: string;
}

/** An unhurried day, as a suggestion. Only real amenities and places. */
export const dayInTheLife: DayEntry[] = [
  {
    time: "7:00 AM",
    title: "Coffee, then the boardwalk",
    body: "The coffee maker is in the kitchen. Walk out over the marsh while the light is low and the beach is nearly empty.",
  },
  {
    time: "9:00 AM",
    title: "Courts before the heat",
    body: "Tennis or pickleball on the resort's courts, or a ride on the hard sand if the tide is out.",
  },
  {
    time: "12:00 PM",
    title: "Lunch at the end of the walk",
    body: "Coco's on the Beach, in season. Chairs from the locker for the afternoon.",
  },
  {
    time: "3:00 PM",
    title: "Indoors, warm",
    body: "Back through the gate to the heated indoor pool, then the sauna and the steam room, all a few steps from Building 3.",
  },
  {
    time: "5:00 PM",
    title: "Supplies",
    body: "Kroger at Shelter Cove is about five minutes away. Salt, pepper and cooking oil are worth adding to the list.",
  },
  {
    time: "7:00 PM",
    title: "Dinner on the water",
    body: "Shelter Cove Harbour, about 10 minutes away. Book ahead in summer.",
  },
  {
    time: "9:00 PM",
    title: "The harbour after dark",
    body: "On summer evenings, HarbourFest at Shelter Cove. Otherwise a walk on the promenade.",
  },
  {
    time: "10:30 PM",
    title: "A board game, then the king bed",
    body: "Games and a console in the living room, a Smart TV in each bedroom, and nowhere to be in the morning.",
  },
];

export interface Season {
  id: string;
  name: string;
  months: string;
  body: string;
  /** Short particulars, each one verifiable. */
  notes: string[];
}

export const seasons: Season[] = [
  {
    id: "spring",
    name: "Spring",
    months: "March to May",
    body: "Mild days, the marsh greening and the island's busiest golf week.",
    notes: [
      "RBC Heritage at Harbour Town Golf Links, April 15 to 18, 2027. Book early; traffic is heavier toward the south end.",
      "Good months for Pinckney Island's trails before the summer heat.",
    ],
  },
  {
    id: "summer",
    name: "Summer",
    months: "June to August",
    body: "Long days and the island in full season.",
    notes: [
      "Lifeguards on the Town beaches and the resort's beach shuttle running.",
      "HarbourFest at Shelter Cove Harbour, with fireworks over the marina.",
      "Dogs are not allowed on the beach from 10 AM to 5 PM, from the Friday before Memorial Day to Labor Day.",
    ],
  },
  {
    id: "autumn",
    name: "Autumn",
    months: "September to November",
    body: "Quieter beaches, easier dinner reservations, evenings for a light layer.",
    notes: [
      "The Saturday Shelter Cove Community Market.",
      "Dolphin and nature cruises are still running; ask the operators for their autumn schedules.",
    ],
  },
  {
    id: "winter",
    name: "Winter",
    months: "December to February",
    body: "The calm season, and the one the residence was made for.",
    notes: [
      "Heated indoor pool, sauna, steam room, fitness center and walking track under one roof.",
      "Groceries and pharmacy about five minutes away, for longer stays.",
    ],
  },
];

export interface BookDirectReason {
  id: string;
  title: string;
  body: string;
}

/** Only true statements. No price claims and no savings figures. */
export const bookDirect: BookDirectReason[] = [
  {
    id: "host",
    title: "You deal with the host",
    body: "Your request and your questions go to the person who looks after the residence, not to a platform inbox.",
  },
  {
    id: "itemized",
    title: "A quote drawn up for your dates",
    body: "Choose your dates and each night is priced for its season or island event, with the cleaning fee and lodging taxes set out line by line before you send anything.",
  },
  {
    id: "no-charge",
    title: "Nothing is charged when you request",
    body: "A request asks for the dates. The host confirms, and payment is arranged after that.",
  },
  {
    id: "no-platform-fee",
    title: "No platform service fee",
    body: "No third-party booking platform sits between you and the host here, so no platform service fee is added.",
  },
];
