/**
 * Area guide content for the /area page.
 *
 * Research notes (October 2026):
 * - Distances and drive times are approximate. Origin is Hilton Head Resort,
 *   663 William Hilton Parkway (approx. 32.19051, -80.70688). Road distances were
 *   computed with OpenStreetMap routing (OSRM) against US Census geocoded addresses,
 *   then drive times were padded for traffic lights and seasonal traffic.
 *   Always label them "approx." in the UI.
 * - Every URL below was fetched and confirmed to load during research.
 * - Restaurants were only included when there was 2026 evidence they are operating
 *   (2026 site updates, 2026 event listings, or 2026 local news). Hours change
 *   seasonally, so the UI should tell guests to check before going.
 * - Re-verify this file before each peak season (suggested: every March).
 */

export type TravelMode = "walk" | "drive" | "on-site";

export interface AreaPlace {
  name: string;
  /** 1 to 2 sentences, useful and specific. */
  description: string;
  /** Approx. road distance in miles from the resort. null when not a single point (e.g. island-wide). */
  distanceMiles: number | null;
  /** Approx. drive time in minutes. null when walking or on-site. */
  driveMinutes: number | null;
  /** How guests usually get there. */
  mode: TravelMode;
  /** Optional short note shown next to the distance (e.g. walking route). */
  travelNote?: string;
  /** Official website, verified to load. null for on-site resort amenities with no public page. */
  url: string | null;
  tags: string[];
}

export interface AreaCategory {
  id: string;
  title: string;
  blurb: string;
  places: AreaPlace[];
}

export interface SeasonalNote {
  id: string;
  title: string;
  months: string;
  body: string;
}

export interface AreaGuide {
  lastVerified: string;
  distanceDisclaimer: string;
  intro: { heading: string; body: string };
  categories: AreaCategory[];
  seasonalNotes: SeasonalNote[];
}

export const areaGuide: AreaGuide = {
  lastVerified: "2026-10",
  distanceDisclaimer:
    "Distances and drive times are approximate and measured from Hilton Head Resort. Hours and prices change with the seasons, so check each website before you go.",

  intro: {
    heading: "Mid-island, in the middle of it all",
    body:
      "Hilton Head Resort sits mid-island, a short drive from Shelter Cove, Palmetto Dunes and the town beach parks. Walk the marsh boardwalk to the sand in the morning, then pick a dinner spot within about 10 minutes of the gate. Here is our short list, checked for 2026.",
  },

  categories: [
    {
      id: "beaches",
      title: "Beaches",
      blurb:
        "Start with the resort's own boardwalk, then branch out to the Town beach parks with restrooms, showers and seasonal lifeguards.",
      places: [
        {
          name: "Hilton Head Resort beach (via the marsh boardwalk)",
          description:
            "The resort's private elevated boardwalk crosses the salt marsh to the beach, with Coco's on the Beach waiting at the end. Beach chairs from the unit's storage locker make the walk easy; in season, the complimentary resort shuttle saves your legs.",
          distanceMiles: 1,
          driveMinutes: null,
          mode: "walk",
          travelNote: "About 0.8 to 1.1 mi on foot via the boardwalk, or the seasonal resort shuttle.",
          url: null,
          tags: ["resort", "boardwalk", "walkable", "no parking needed"],
        },
        {
          name: "Burkes Beach Access",
          description:
            "A quieter mid-island access at the end of Burkes Beach Road with beach matting, outdoor showers and seasonal lifeguards. Parking is at Chaplin Community Park on Cast Net Drive (paid for visitors).",
          distanceMiles: 1.2,
          driveMinutes: 6,
          mode: "drive",
          url: "https://hiltonheadislandsc.gov/business_detail_T4_R195.php",
          tags: ["town beach", "quiet", "showers", "paid parking"],
        },
        {
          name: "Driessen Beach Park",
          description:
            "A family favorite at the end of Bradley Beach Road with restrooms, outdoor showers and a playground. Metered parking for visitors; lifeguards in beach season.",
          distanceMiles: 1.3,
          driveMinutes: 6,
          mode: "drive",
          url: "https://hiltonheadislandsc.gov/business_detail_T4_R197.php",
          tags: ["town beach", "restrooms", "playground", "paid parking"],
        },
        {
          name: "Folly Field Beach Park",
          description:
            "A boardwalk winds through natural dunes to a wide stretch of sand. Restrooms, outdoor showers, beach matting and free beach wheelchair reservations; metered parking for visitors.",
          distanceMiles: 1.8,
          driveMinutes: 8,
          mode: "drive",
          url: "https://hiltonheadislandsc.gov/business_detail_T4_R199.php",
          tags: ["town beach", "restrooms", "accessible", "paid parking"],
        },
        {
          name: "Coligny Beach Park",
          description:
            "The island's most popular oceanfront park, at the end of Pope Avenue, with free parking, restrooms, showers and Wi-Fi. Shops and casual food at Coligny are across the street, so expect crowds in summer.",
          distanceMiles: 5.6,
          driveMinutes: 15,
          mode: "drive",
          url: "https://hiltonheadislandsc.gov/business_detail_T4_R196.php",
          tags: ["town beach", "busy", "free parking", "shops nearby"],
        },
      ],
    },

    {
      id: "eat-drink",
      title: "Eat & Drink",
      blurb:
        "From a barefoot beach bar to a jazz supper club, all within about 20 minutes. Each spot showed signs of operating in 2026 when we checked.",
      places: [
        {
          name: "Coco's on the Beach",
          description:
            "The beach bar at the end of the resort's boardwalk, for a cold drink with your toes in the sand. Hours are seasonal, so check before you walk over.",
          distanceMiles: 1,
          driveMinutes: null,
          mode: "walk",
          travelNote: "At the beach end of the resort boardwalk.",
          url: "https://www.cocosonthebeach.com/",
          tags: ["beach bar", "walkable", "casual", "seasonal"],
        },
        {
          name: "Poseidon",
          description:
            "Seafood, steaks and a raw bar in Shelter Cove Towne Centre, with a rooftop bar that hosts music in the evenings.",
          distanceMiles: 1.2,
          driveMinutes: 6,
          mode: "drive",
          url: "https://www.poseidonhhi.com/",
          tags: ["seafood", "rooftop", "Shelter Cove", "raw bar"],
        },
        {
          name: "Santa Fe Cafe",
          description:
            "Southwestern and Mexican plates with a rooftop cantina, mid-island. Closed Sundays and Mondays; lunch Tuesday to Friday, dinner Tuesday to Saturday.",
          distanceMiles: 2.1,
          driveMinutes: 7,
          mode: "drive",
          url: "https://www.santafehhi.com/",
          tags: ["southwestern", "rooftop", "date night"],
        },
        {
          name: "ELA's On the Water",
          description:
            "Seafood and prime steaks overlooking Shelter Cove Harbour and Broad Creek, with a wraparound patio. Dinner nightly and brunch most days; book ahead for sunset.",
          distanceMiles: 2.4,
          driveMinutes: 10,
          mode: "drive",
          url: "http://www.elasgrille.com",
          tags: ["waterfront", "special occasion", "Shelter Cove"],
        },
        {
          name: "Big Jim's BBQ, Burgers & Pizza",
          description:
            "Casual barbecue, burgers and grilled pizza at the Robert Trent Jones course clubhouse in Palmetto Dunes, open from breakfast through dinner. Kids' menu and outdoor seating overlooking the course.",
          distanceMiles: 2.5,
          driveMinutes: 11,
          mode: "drive",
          url: "https://www.bigjimsbbqcatering.com/",
          tags: ["casual", "family", "breakfast", "Palmetto Dunes"],
        },
        {
          name: "OMBRA Cucina Italiana",
          description:
            "Chef-driven Italian with a strong Italian wine list. Daily happy hour (4:30 to 6:30 PM) and an early three-course dinner menu make it easier on the budget.",
          distanceMiles: 4,
          driveMinutes: 10,
          mode: "drive",
          url: "https://www.ombrahhi.com/",
          tags: ["Italian", "date night", "happy hour"],
        },
        {
          name: "The Jazz Corner",
          description:
            "A jazz supper club operating since 1999, with live shows most nights and dinner served during the music. Reservations are the way in, especially on weekends.",
          distanceMiles: 4,
          driveMinutes: 10,
          mode: "drive",
          url: "https://www.thejazzcorner.com/",
          tags: ["live music", "date night", "rainy day", "reservations"],
        },
        {
          name: "Up the Creek Pub & Grill",
          description:
            "A laid-back locals' spot at Broad Creek Marina for burgers, smoked wings and seafood on the deck. Open daily from 11 AM.",
          distanceMiles: 5.2,
          driveMinutes: 18,
          mode: "drive",
          url: "https://www.upthecreekpubandgrill.com/",
          tags: ["waterfront", "casual", "locals", "sunset"],
        },
        {
          name: "Fishcamp on Broad Creek",
          description:
            "Fresh seafood, oysters and steaks on the water beside Broad Creek Marina, with weekly entertainment.",
          distanceMiles: 5.2,
          driveMinutes: 18,
          mode: "drive",
          url: "https://www.fishcampwaterfront.com/",
          tags: ["waterfront", "seafood", "oysters", "family"],
        },
      ],
    },

    {
      id: "groceries",
      title: "Groceries & Essentials",
      blurb:
        "Stock the kitchen on your way in. The two big grocery stores are about five minutes away in Shelter Cove Towne Centre. (Remember: salt, pepper and cooking oil are not provided.)",
      places: [
        {
          name: "Kroger (Shelter Cove)",
          description:
            "Full-size grocery with bakery, deli, seafood, a large wine and beer selection, a Starbucks inside and a gas station. Online pickup is available if you want groceries ready when you land.",
          distanceMiles: 1,
          driveMinutes: 5,
          mode: "drive",
          url: "https://www.kroger.com/stores/grocery/sc/hilton-head/shelter-cove/011/00671",
          tags: ["groceries", "wine & beer", "gas", "pickup"],
        },
        {
          name: "Kroger Pharmacy (Shelter Cove)",
          description:
            "The closest pharmacy, inside the Shelter Cove Kroger with a drive-thru window. Recent hours: Mon to Fri 9 AM to 8 PM, Sat 9 AM to 6 PM, Sun 10 AM to 5 PM (closed 1 to 1:30 PM daily).",
          distanceMiles: 1,
          driveMinutes: 5,
          mode: "drive",
          url: "https://www.kroger.com/stores/grocery/sc/hilton-head/shelter-cove/011/00671",
          tags: ["pharmacy", "drive-thru"],
        },
        {
          name: "Whole Foods Market",
          description:
            "Natural and organic groceries plus prepared foods, a few doors from Kroger in Shelter Cove Towne Centre. Open daily 8 AM to 9 PM.",
          distanceMiles: 1.1,
          driveMinutes: 5,
          mode: "drive",
          url: "https://www.wholefoodsmarket.com/stores/hiltonheadisland",
          tags: ["groceries", "organic", "prepared foods"],
        },
      ],
    },

    {
      id: "things-to-do",
      title: "Things to Do",
      blurb:
        "Harbors, lighthouses, wildlife and golf. Most of the island's classics are within 25 minutes.",
      places: [
        {
          name: "Shelter Cove Harbour & Marina",
          description:
            "The island's largest marina, with a waterfront promenade, shops, restaurants and the King Neptune statue. In summer, HarbourFest brings music, family entertainment and weekly fireworks.",
          distanceMiles: 2.4,
          driveMinutes: 10,
          mode: "drive",
          url: "https://palmettodunes.com/shelter-cove",
          tags: ["harbor", "shopping", "summer fireworks", "sunset"],
        },
        {
          name: "Dolphin & nature cruises",
          description:
            "Dolphin tours, sunset sails, nature cruises on Broad Creek and fishing charters depart from Shelter Cove Marina. Book a day or two ahead in summer.",
          distanceMiles: 2.4,
          driveMinutes: 10,
          mode: "drive",
          url: "https://palmettodunes.com/shelter-cove/hilton-head-boat-tours",
          tags: ["dolphins", "boat tour", "family", "sunset"],
        },
        {
          name: "Golf at Palmetto Dunes",
          description:
            "Three courses open to the public right next door: Robert Trent Jones, George Fazio and Arthur Hills.",
          distanceMiles: 1.6,
          driveMinutes: 6,
          mode: "drive",
          url: "https://www.palmettodunes.com/golf",
          tags: ["golf", "Palmetto Dunes"],
        },
        {
          name: "Coastal Discovery Museum at Honey Horn",
          description:
            "Free admission to exhibits, gardens and trails on a 70-acre historic property, plus a butterfly learning station and Lowcountry history programs. Open daily (Sundays from 11 AM).",
          distanceMiles: 5.3,
          driveMinutes: 13,
          mode: "drive",
          url: "https://www.coastaldiscovery.org/",
          tags: ["museum", "free", "history", "nature", "rainy day"],
        },
        {
          name: "Harbour Town Lighthouse & Sea Pines",
          description:
            "Climb the 93-foot lighthouse at Harbour Town (open daily from 10 AM to sundown; small climbing fee) for the view from the top. Sea Pines charges a separate vehicle day-pass fee at the gate.",
          distanceMiles: 7.6,
          driveMinutes: 25,
          mode: "drive",
          url: "https://harbourtownlighthouse.com/",
          tags: ["landmark", "views", "Sea Pines", "gate fee"],
        },
        {
          name: "Pinckney Island National Wildlife Refuge",
          description:
            "About 10 miles of trails across a refuge that is mostly salt marsh and tidal creeks, with a wading-bird rookery (ibis, egrets, herons). Open sunrise to sunset; no restrooms or water, and no pets, so pack accordingly.",
          distanceMiles: 8.7,
          driveMinutes: 20,
          mode: "drive",
          url: "https://www.fws.gov/refuge/pinckney-island",
          tags: ["nature", "birding", "hiking", "biking", "free"],
        },
        {
          name: "Island bike pathways",
          description:
            "The Town maintains over 72 miles of public pathways, plus about 12 miles of beach you can ride at low tide. Bikes are available to rent at the resort, and Class 1 and 2 e-bikes are allowed on Town paths.",
          distanceMiles: null,
          driveMinutes: null,
          mode: "on-site",
          travelNote: "Island-wide. See the Town's pathway map for routes.",
          url: "https://hiltonheadislandsc.gov/pathways",
          tags: ["biking", "free", "family"],
        },
      ],
    },

    {
      id: "family-fun",
      title: "Family Fun",
      blurb: "Easy wins for kids, most of them five to 15 minutes from the gate.",
      places: [
        {
          name: "Resort pools and kiddie pool",
          description:
            "Two outdoor pools, a kiddie pool and the heated indoor pool are all inside the gate. The indoor pool is steps from Building 3.",
          distanceMiles: 0,
          driveMinutes: null,
          mode: "on-site",
          url: null,
          tags: ["resort", "pool", "kids"],
        },
        {
          name: "Adventure Cove",
          description:
            "Two 18-hole mini golf courses (Paradise Falls and Lost Lagoon) plus an arcade with prize redemption. Open daily; a good after-dinner outing.",
          distanceMiles: 1.3,
          driveMinutes: 5,
          mode: "drive",
          url: "https://www.adventurecove.com/",
          tags: ["mini golf", "arcade", "kids", "evening"],
        },
        {
          name: "Palmetto Dunes lagoon paddling and bike rentals",
          description:
            "Rent kayaks or canoes for Palmetto Dunes' 11-mile lagoon, or bikes and e-bikes for the paths.",
          distanceMiles: 1.6,
          driveMinutes: 6,
          mode: "drive",
          url: "https://www.palmettodunes.com/",
          tags: ["kayak", "canoe", "bikes", "family"],
        },
        {
          name: "The Sandbox Children's Museum",
          description:
            "A nonprofit interactive museum for preschool and elementary-age kids at Lowcountry Celebration Park, near Coligny.",
          distanceMiles: 4.7,
          driveMinutes: 12,
          mode: "drive",
          url: "https://thesandbox.org/",
          tags: ["kids", "museum", "rainy day"],
        },
      ],
    },

    {
      id: "rainy-day",
      title: "Rainy Day Ideas",
      blurb:
        "The unit's home base is built for gray days: the heated indoor pool, sauna and steam room are steps away. Here is what else works when it pours.",
      places: [
        {
          name: "Indoor pool, sauna, steam room and gym",
          description:
            "Building 3 sits right by the resort's indoor atrium: heated pool, sauna, steam room, fitness center and an indoor walking track.",
          distanceMiles: 0,
          driveMinutes: null,
          mode: "on-site",
          url: null,
          tags: ["resort", "indoor", "wellness"],
        },
        {
          name: "Arts Center of Coastal Carolina",
          description:
            "Professional theater and touring concerts on a 349-seat main stage in Shelter Cove. Check the season calendar for matinees.",
          distanceMiles: 1.7,
          driveMinutes: 7,
          mode: "drive",
          url: "http://www.artshhi.com",
          tags: ["theater", "music", "indoor"],
        },
        {
          name: "Coastal Discovery Museum exhibits",
          description:
            "Indoor exhibits on island history, including Santa Elena and the historic Honey Horn buildings, with free admission.",
          distanceMiles: 5.3,
          driveMinutes: 13,
          mode: "drive",
          url: "https://www.coastaldiscovery.org/",
          tags: ["museum", "free", "indoor"],
        },
        {
          name: "Board games and streaming at the condo",
          description:
            "The living area has board games, a game console and streaming, and both bedrooms have Smart TVs.",
          distanceMiles: 0,
          driveMinutes: null,
          mode: "on-site",
          url: null,
          tags: ["in-unit", "family"],
        },
      ],
    },

    {
      id: "getting-here",
      title: "Getting Here",
      blurb:
        "Fly into Hilton Head for the shortest transfer, or Savannah for more airlines and nonstop routes.",
      places: [
        {
          name: "Hilton Head Island Airport (HHH)",
          description:
            "On-island airport served by American, Delta and United (routes include Charlotte, Atlanta, New York-LaGuardia, Newark, Chicago, Washington, Philadelphia and Boston, several of them seasonal).",
          distanceMiles: 3.3,
          driveMinutes: 12,
          mode: "drive",
          url: "https://www.thehiltonheadislandairport.com/",
          tags: ["airport", "closest"],
        },
        {
          name: "Savannah/Hilton Head International Airport (SAV)",
          description:
            "The larger regional airport, in Savannah, Georgia, with more airlines and nonstop routes. Allow about 50 to 60 minutes each way.",
          distanceMiles: 45.6,
          driveMinutes: 55,
          mode: "drive",
          url: "https://www.savannahairport.com/",
          tags: ["airport", "more flights"],
        },
      ],
    },
  ],

  seasonalNotes: [
    {
      id: "summer",
      title: "Summer peak",
      months: "Late May to mid-August",
      body:
        "Peak season. Beaches have lifeguards, the resort shuttle runs, and Shelter Cove hosts HarbourFest with weekly fireworks. Book early and plan dinners ahead. Dogs are not allowed on the beach from 10 AM to 5 PM between the Friday before Memorial Day and Labor Day, and alcohol and glass are banned on all beaches year-round.",
    },
    {
      id: "rbc-heritage",
      title: "RBC Heritage golf week",
      months: "April 15 to 18, 2027",
      body:
        "The PGA TOUR's RBC Heritage returns to Harbour Town Golf Links in Sea Pines on April 15 to 18, 2027. It is one of the island's busiest weeks: book early and expect heavier traffic toward the south end.",
    },
    {
      id: "shoulder",
      title: "Spring and fall shoulder seasons",
      months: "March to May, September to November",
      body:
        "Our favorite time on the island: easier dinner reservations, quieter beaches and outdoor events like the Saturday Shelter Cove Community Market. Bring a light layer for evenings and enjoy the heated indoor pool.",
    },
    {
      id: "winter",
      title: "Winter and snowbird stays",
      months: "December to February",
      body:
        "A calm season for longer stays. The heated indoor pool, sauna, steam room, gym and indoor walking track keep a routine going on any weather day, and the grocery stores are about five minutes away.",
    },
  ],
};
