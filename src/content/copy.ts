/**
 * Prince of Tides: all marketing copy for the site.
 *
 * Register: quiet luxury (see docs/brand-voice.md). Understated, precise, calm.
 * Rules (see docs/BRIEF.md):
 * - No em dashes anywhere. No exclamation points in our own copy.
 * - No invented facts. Unknowns are marked TODO_OWNER and must be replaced before launch.
 * - Reviews are real, verbatim, from the Vrbo/Expedia listing only.
 * - Never claim ocean views or beachfront.
 *
 * Template tokens like {{minNights}} are replaced at render time by the UI.
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type Cta = { label: string; href: string };

export type HeroCopy = {
  eyebrow: string;
  headline: string;
  subhead: string;
  primaryCta: Cta;
  secondaryCta: Cta;
  /** Plain factual statements, not marketing chips. */
  trustBadges: string[];
};

export type IntroCopy = { heading: string; paragraphs: string[] };

export type IconItem = { icon: string; title: string; body: string };

export type HighlightsCopy = { heading: string; items: IconItem[] };

export type Particular = { label: string; value: string };

export type ParticularsCopy = { heading: string; items: Particular[] };

export type Room = { name: string; details: string[]; body: string };

export type TheSpaceCopy = { heading: string; intro: string; rooms: Room[] };

export type AmenityGroup = { title: string; items: string[] };

export type AmenitiesCopy = { heading: string; intro: string; groups: AmenityGroup[] };

export type ResortCopy = { heading: string; intro: string; features: IconItem[]; footnote: string };

export type BeachAccessCopy = { heading: string; body: string; steps: string[]; footnote: string };

export type RatingSummary = {
  overall: number;
  outOf: number;
  count: number;
  cleanliness: number;
  location: number;
  source: string;
};

export type Review = {
  name: string;
  date: string;
  rating: number;
  outOf: number;
  text: string;
  source: string;
};

export type ReviewsSectionCopy = {
  heading: string;
  subhead: string;
  ratingSummary: RatingSummary;
  ratingLabels: { overall: string; cleanliness: string; location: string; basedOn: string };
  /** Short verbatim excerpt suitable for a pull quote. */
  pullQuote: { text: string; attribution: string };
  reviews: Review[];
};

export type HostCopy = { heading: string; body: string; placeholderNote: string };

export type BookingCtaCopy = { heading: string; body: string; button: Cta };

export type BookingCopy = {
  widgetHeading: string;
  widgetSubhead: string;
  fromPriceLabel: string;
  perNight: string;
  labels: {
    checkIn: string;
    checkOut: string;
    guests: string;
    adults: string;
    children: string;
    infants: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
    agreeHouseRules: string;
    agreeAge: string;
  };
  placeholders: {
    selectDate: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    message: string;
  };
  helperText: {
    dates: string;
    guests: string;
    infants: string;
    email: string;
    phone: string;
    message: string;
  };
  calendar: {
    legendAvailable: string;
    legendUnavailable: string;
    legendSelected: string;
    clearDates: string;
    checkoutOnly: string;
  };
  buttons: {
    checkDates: string;
    continue: string;
    submit: string;
    submitting: string;
    back: string;
    edit: string;
  };
  reassurance: { title: string; body: string };
  quote: {
    heading: string;
    nightlySubtotal: string;
    nightsTemplate: string;
    cleaningFee: string;
    taxes: string;
    totalEstimate: string;
    disclaimer: string;
    pendingRates: string;
  };
  validation: {
    required: string;
    datesRequired: string;
    checkOutAfterCheckIn: string;
    pastDate: string;
    invalidEmail: string;
    invalidPhone: string;
    maxGuests: string;
    minAdults: string;
    mustAgreeRules: string;
    mustBe21: string;
  };
  minNightsMessage: string;
  unavailableDatesMessage: string;
  maxGuestsMessage: string;
  success: { title: string; body: string; nextStepsHeading: string; nextSteps: string[]; button: Cta };
  failure: { title: string; body: string; retry: string; fallbackContact: string };
  policiesHeading: string;
  policiesSummary: string[];
};

export type ArrivalItem = { title: string; body: string };

export type ArrivalCopy = { heading: string; intro: string; items: ArrivalItem[] };

export type FooterCopy = { tagline: string; smallPrint: string[] };

export type EmailTemplate = { subject: string; body: string };

export type EmailsCopy = {
  guestRequestReceived: EmailTemplate;
  hostNewRequest: EmailTemplate;
};

export type MetaCopy = { siteName: string; title: string; shortDescription: string; tagline: string };

/* ------------------------------------------------------------------ */
/* Copy                                                                */
/* ------------------------------------------------------------------ */

export const meta: MetaCopy = {
  siteName: "Prince of Tides",
  title: "Prince of Tides | Two-bedroom residence at Hilton Head Resort",
  tagline: "Rest, at the pace of the tide.",
  shortDescription:
    "A two-bedroom, two-bath condo in gated Hilton Head Resort. Sleeps 6. Indoor pool and steam room steps away, a marsh boardwalk to the beach.",
};

export const hero: HeroCopy = {
  eyebrow: "Hilton Head Resort, mid-island",
  headline: "Rest, at the pace of the tide.",
  subhead:
    "Two bedrooms, two baths, inside a gated resort. A heated pool and steam room down the corridor. A boardwalk over the marsh to the sea.",
  primaryCta: { label: "Check dates", href: "#book" },
  secondaryCta: { label: "See the rooms", href: "#the-space" },
  trustBadges: [
    "Guest rating 9.2 / 10 on Vrbo",
    "24-hour gated resort",
    "Sleeps 6",
    "Town STR permit 029008",
  ],
};

export const intro: IntroCopy = {
  heading: "I. The Residence",
  paragraphs: [
    "Prince of Tides occupies a two-bedroom condo in Building 3 of Hilton Head Resort, a guard-gated community in the middle of the island. It has been updated, it is kept clean, and it asks very little of you.",
    "There is no ocean view. The windows look onto the parking lot and the resort's indoor atrium, where a heated pool, a sauna and a steam room are a few steps from the door. On a grey February afternoon, this is the better arrangement.",
    "When the weather turns kind, a raised boardwalk crosses the salt marsh to the beach. Chairs wait in your locker. Coco's on the Beach is at the far end.",
  ],
};

export const highlights: HighlightsCopy = {
  heading: "In brief",
  items: [
    {
      icon: "Waves",
      title: "The indoor pool, close at hand",
      body: "A heated pool, hot tub, sauna and steam room in the atrium outside your door. Indifferent to weather.",
    },
    {
      icon: "Footprints",
      title: "A boardwalk over the marsh",
      body: "A private raised walk across the salt marsh to the sand, 0.8 to 1.1 miles. A complimentary shuttle runs in season.",
    },
    {
      icon: "ShieldCheck",
      title: "A gate, attended",
      body: "Guard-gated entry, around the clock.",
    },
    {
      icon: "BedDouble",
      title: "Two bedrooms, two full baths",
      body: "A king bed with its own bath. A second room with a queen and a full. No one sleeps on the sofa.",
    },
    {
      icon: "CookingPot",
      title: "A kitchen for actual cooking",
      body: "Oven, stovetop, dishwasher, real cookware and bakeware. A dining table to sit at afterward.",
    },
    {
      icon: "Umbrella",
      title: "Beach chairs, already there",
      body: "Chairs and beach gear are kept in a resort storage locker. Pack accordingly light.",
    },
    {
      icon: "Dumbbell",
      title: "Routine, uninterrupted",
      body: "A fitness center and an indoor walking track under the same roof. Lit tennis and pickleball courts outside.",
    },
    {
      icon: "MapPin",
      title: "Mid-island",
      body: "Near Palmetto Dunes, Shelter Cove Harbour and Towne Centre. About 12 minutes from Hilton Head Island Airport.",
    },
  ],
};

export const particulars: ParticularsCopy = {
  heading: "Particulars",
  items: [
    { label: "Location", value: "Hilton Head Resort, Building 3, mid-island" },
    { label: "Size", value: "Approx. 831 sq ft" },
    { label: "Bedrooms", value: "2" },
    { label: "Beds", value: "1 king, 1 queen, 1 full" },
    { label: "Bathrooms", value: "2 full, each with shower/tub" },
    { label: "Sleeps", value: "6" },
    { label: "Outlook", value: "Parking lot and indoor pool atrium" },
    { label: "Beach", value: "0.8 to 1.1 mi by marsh boardwalk; seasonal shuttle" },
    { label: "Check-in", value: "4:00 PM, self check-in" },
    { label: "Check-out", value: "10:00 AM" },
    { label: "Parking", value: "Up to 2 vehicles, unassigned" },
    { label: "Laundry", value: "Community laundry on-site" },
    { label: "Airports", value: "HHH approx. 12 min; SAV approx. 50 min" },
    { label: "Booking age", value: "21 and over" },
    { label: "Pets / smoking", value: "Neither" },
    { label: "STR permit", value: "Town of Hilton Head Island, 029008" },
  ],
};

export const theSpace: TheSpaceCopy = {
  heading: "II. The Rooms",
  intro: "About 831 square feet, arranged for six. Each bedroom has its own Smart TV. Each bathroom is a full one.",
  rooms: [
    {
      name: "Bedroom 1",
      details: ["King bed", "Smart TV", "Ensuite bath, single vanity, shower/tub"],
      body: "A king bed and a bath of its own. Mornings here tend to be unhurried.",
    },
    {
      name: "Bedroom 2",
      details: ["1 queen bed", "1 full bed", "Smart TV", "Sleeps up to 4"],
      body: "A queen and a full in one room, for children, cousins or friends who do not mind each other.",
    },
    {
      name: "Bathrooms",
      details: [
        "Two full bathrooms",
        "Ensuite: single vanity, shower/tub",
        "Hall: single vanity, shower/tub",
        "Fresh towels, starter soaps, hair dryer",
      ],
      body: "Two full baths, so the morning queue is short. A tub in each, useful after a sandy afternoon.",
    },
    {
      name: "Kitchen & Dining",
      details: [
        "Refrigerator, oven, stovetop",
        "Microwave, dishwasher",
        "Toaster, blender, coffee maker",
        "Cookware, bakeware, utensils",
        "Dining table",
      ],
      body: "Equipped for a proper dinner rather than a reheated one. Bring salt, pepper and oil; the rest is here.",
    },
    {
      name: "Living",
      details: ["Streaming", "Game console", "Board games", "Wi-Fi", "A/C and heat"],
      body: "A film, a console game or an old board game. The evening sorts itself out.",
    },
  ],
};

export const amenities: AmenitiesCopy = {
  heading: "III. Provisions",
  intro: "What is here, and what is not.",
  groups: [
    {
      title: "Sleep & bath",
      items: [
        "Fresh linens and towels",
        "King, queen and full beds",
        "Pack 'n play / travel crib",
        "Hair dryer",
        "Starter soaps",
      ],
    },
    {
      title: "Kitchen",
      items: [
        "Oven and stovetop",
        "Refrigerator",
        "Microwave",
        "Dishwasher",
        "Toaster, blender, coffee maker",
        "Cookware, bakeware, utensils",
        "Dining table",
        "Starter paper goods and trash bags",
      ],
    },
    {
      title: "Diversions & work",
      items: ["Wi-Fi", "Smart TVs in both bedrooms", "Streaming", "Game console", "Board games"],
    },
    {
      title: "Comfort",
      items: ["Air conditioning", "Heat", "Iron and ironing board", "Outdoor seating"],
    },
    {
      title: "Beach & outdoors",
      items: [
        "Beach chairs and gear, in a resort storage locker",
        "Community BBQ grills",
        "Parking for up to 2 vehicles",
      ],
    },
    {
      title: "Safety",
      items: ["Smoke detector", "Carbon monoxide detector", "Fire extinguisher", "First aid kit"],
    },
    {
      title: "Not included / good to know",
      items: [
        "No washer or dryer in the unit. Community laundry is on-site.",
        "Salt, pepper and cooking oil are not provided.",
        "The windows face the parking lot and the indoor pool atrium. There is no ocean view.",
        "The beach is 0.8 to 1.1 miles away, by boardwalk or seasonal shuttle.",
        "The elevator is maintained by the HOA. Stairs, should it rest.",
        "Parking is unassigned.",
      ],
    },
  ],
};

export const resort: ResortCopy = {
  heading: "IV. The Resort",
  intro:
    "Hilton Head Resort is a gated community with more amenities than a week can reasonably use. Building 3 sits beside the indoor atrium, which is to say near the warm water.",
  features: [
    {
      icon: "Footprints",
      title: "Marsh boardwalk",
      body: "A private raised walk over the salt marsh to the beach. Herons, at a polite distance.",
    },
    {
      icon: "Bus",
      title: "Beach shuttle",
      body: "Complimentary and seasonal. For coolers, small children and tired legs.",
    },
    {
      icon: "Waves",
      title: "Pools",
      body: "A heated indoor pool, two outdoor pools, a kiddie pool and a hot tub.",
    },
    {
      icon: "Flame",
      title: "Sauna and steam room",
      body: "Close by. A fitting end to a beach day, or a fair substitute for one.",
    },
    {
      icon: "Dumbbell",
      title: "Fitness center and indoor track",
      body: "A gym and an indoor jogging and walking track, open whatever the weather.",
    },
    {
      icon: "Trophy",
      title: "Courts",
      body: "Lit tennis and pickleball courts. Sand volleyball.",
    },
    {
      icon: "Bike",
      title: "Bicycles",
      body: "Rentals and storage on-site. The island is flat and agreeable to cycling.",
    },
    {
      icon: "Utensils",
      title: "Grills, deli and beach bar",
      body: "Grilling and picnic stations. Beach Bear Deli & Bar by the Building 1 pool, in season. Coco's on the Beach at the end of the boardwalk.",
    },
    {
      icon: "Sun",
      title: "Sun decks and gardens",
      body: "For an afternoon with a book and no particular plan.",
    },
    {
      icon: "ShieldCheck",
      title: "Security",
      body: "A staffed gate, 24 hours.",
    },
  ],
  footnote:
    "Resort amenities are shared and operated by the HOA. Hours, seasons and availability are the resort's to set.",
};

export const beachAccess: BeachAccessCopy = {
  heading: "V. To the Beach",
  body: "The beach is 0.8 to 1.1 miles from the door. Most guests walk, by a private boardwalk raised over the salt marsh. It is, by some accounts, the best part of the day. In season, a complimentary shuttle will take you instead.",
  steps: [
    "Collect chairs and gear from your resort storage locker.",
    "Take the boardwalk across the marsh. At low tide, watch for egrets and fiddler crabs.",
    "Or, in season, take the resort shuttle.",
    "Coco's on the Beach waits at the end, for lunch or something cold.",
    "Return by way of the indoor pool, sauna or steam room. They are on the way home, more or less.",
  ],
  footnote: "The shuttle season and schedule are set by the resort. Ask us for current times before your stay.",
};

const reviewSource = "Verified guest via Vrbo/Expedia";

export const reviewsSection: ReviewsSectionCopy = {
  heading: "VI. Guests, in Their Words",
  subhead: "Unedited, from our Vrbo/Expedia listing.",
  ratingSummary: {
    overall: 9.2,
    outOf: 10,
    count: 10,
    cleanliness: 9.4,
    location: 9.6,
    source: "Vrbo/Expedia",
  },
  ratingLabels: {
    overall: "Overall",
    cleanliness: "Cleanliness",
    location: "Location",
    basedOn: "{{count}} reviews on {{source}}",
  },
  pullQuote: {
    text: "We loved walking over the marsh to the beach!",
    attribution: "Teresa K., Oct 2025, via Vrbo/Expedia",
  },
  reviews: [
    {
      name: "Teresa K.",
      date: "Oct 2025",
      rating: 10,
      outOf: 10,
      text: "We enjoyed ourselves immensely. We have stayed at this complex 2 other times and this one was the best. The unit was clean and nicely designed. It was surprisingly quiet most of the time. We loved walking over the marsh to the beach!",
      source: reviewSource,
    },
    {
      name: "Susan P.",
      date: "Apr 2026",
      rating: 8,
      outOf: 10,
      text: "Unit was updated, clean, and amenities were great... Plenty of bed space, two bathrooms, fully equipped kitchen, and convenient to locations we wanted to visit - it was perfect for our short stay... the sauna and steam room were appreciated and the indoor pool was good... The storage locker was well equipped with beach chairs... Overall, we enjoyed our stay and would stay here again.",
      source: reviewSource,
    },
    {
      name: "Elizabeth",
      date: "Apr 2026",
      rating: 10,
      outOf: 10,
      text: "Clean, super cute place, right by the indoor pool area which was great!!",
      source: reviewSource,
    },
    {
      name: "Wendy D.",
      date: "Jun 2026",
      rating: 10,
      outOf: 10,
      text: "We loved this condo. Hope to come back soon.",
      source: reviewSource,
    },
  ],
};

export const arrival: ArrivalCopy = {
  heading: "VII. Before You Arrive",
  intro: "A few notes, gathered from previous stays, so the first hour goes quietly.",
  items: [
    {
      title: "At the gate",
      body: "The resort is guard-gated. Give your name and unit number and you will be issued passes for up to two vehicles. Parking is unassigned; any open space near Building 3 will do.",
    },
    {
      title: "Your door code",
      body: "Check-in is self-guided. The door code is emailed before arrival; look for it the day before, and in your spam folder if need be. Should it misbehave, call or text TODO_OWNER: backup contact phone.",
    },
    {
      title: "Check-in, 4:00 PM",
      body: "The condo is being prepared until then, and the time is firm. If you arrive early, Shelter Cove Harbour makes a reasonable place for lunch. Early check-in may be requested in your booking message; we grant it when the schedule allows.",
    },
    {
      title: "Check-out, 10:00 AM",
      body: "Start the dishwasher, take out the trash, lock the door. Nothing more is asked.",
    },
    {
      title: "Sleeping cool",
      body: "The bedrooms can run warm on summer nights. Lower the thermostat a few degrees an hour before bed. TODO_OWNER: confirm whether portable fans are provided, and note it here.",
    },
    {
      title: "The elevator",
      body: "Building 3 has an elevator, maintained by the HOA. If it is out of service, there are stairs. If that would be a difficulty for your party, tell us beforehand.",
    },
    {
      title: "Pantry and laundry",
      body: "Salt, pepper and cooking oil are not provided. Laundry is a community facility on-site; bring detergent if you plan to use it.",
    },
    {
      title: "Beach chairs",
      body: "Chairs and gear are kept in a resort storage locker. TODO_OWNER: locker location and access instructions.",
    },
    {
      title: "By air",
      body: "Hilton Head Island Airport (HHH) is about 12 minutes by car. Savannah/Hilton Head International (SAV), about 50.",
    },
  ],
};

export const host: HostCopy = {
  heading: "VIII. Your Host",
  body: "TODO_OWNER: host name. TODO_OWNER: two or three sentences on who you are, what keeps you on Hilton Head, and how quickly you reply. When you book directly, your questions go to the person who looks after the condo.",
  placeholderNote:
    "TODO_OWNER: replace host name, bio and photo (/public/photos/host.jpg) before launch. Do not publish this section with placeholders visible.",
};

export const bookingCta: BookingCtaCopy = {
  heading: "Request a stay",
  body: "Choose your dates and see an estimate. Send a request; nothing is charged. We confirm availability and the final figure ourselves.",
  button: { label: "Check dates", href: "#book" },
};

export const booking: BookingCopy = {
  widgetHeading: "Request a stay",
  widgetSubhead: "Select dates for an estimate.",
  fromPriceLabel: "From",
  perNight: "per night",
  labels: {
    checkIn: "Arrive",
    checkOut: "Depart",
    guests: "Guests",
    adults: "Adults",
    children: "Children",
    infants: "Infants",
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    phone: "Phone",
    message: "A note to your host (optional)",
    agreeHouseRules: "I have read and accept the house rules.",
    agreeAge: "I am 21 or older and will be staying at the property.",
  },
  placeholders: {
    selectDate: "Add date",
    firstName: "First name",
    lastName: "Last name",
    email: "name@example.com",
    phone: "(555) 555-5555",
    message: "Who is traveling, the occasion if any, and any requests, such as early check-in.",
  },
  helperText: {
    dates: "Check-in 4:00 PM. Check-out 10:00 AM.",
    guests: "Up to 6, children included.",
    infants: "Infants under 2 are not counted. A travel crib is provided.",
    email: "Your confirmation and our reply will come here.",
    phone: "Used only for arrival-day matters. Never shared.",
    message: "Optional. It helps us prepare.",
  },
  calendar: {
    legendAvailable: "Available",
    legendUnavailable: "Reserved",
    legendSelected: "Your stay",
    clearDates: "Clear dates",
    checkoutOnly: "Departure only",
  },
  buttons: {
    checkDates: "Check dates",
    continue: "Continue",
    submit: "Send request",
    submitting: "Sending",
    back: "Back",
    edit: "Change dates",
  },
  reassurance: {
    title: "A request, not a charge.",
    body: "Nothing is paid today. We confirm your dates and send a final quote. The stay is booked only once you accept it.",
  },
  quote: {
    heading: "Estimate",
    nightlySubtotal: "Nightly subtotal",
    nightsTemplate: "{{nights}} nights at {{rate}}",
    cleaningFee: "Cleaning",
    taxes: "Taxes, estimated",
    totalEstimate: "Estimated total",
    disclaimer:
      "An estimate only. The final quote, including exact lodging taxes, is confirmed by your host before any payment.",
    pendingRates: "Rates for these dates are confirmed by your host. Send a request for an exact quote.",
  },
  validation: {
    required: "Required.",
    datesRequired: "Choose arrival and departure dates.",
    checkOutAfterCheckIn: "Departure must follow arrival.",
    pastDate: "That date has passed.",
    invalidEmail: "Please enter a valid email address.",
    invalidPhone: "Please enter a valid phone number.",
    maxGuests: "The condo sleeps up to 6.",
    minAdults: "At least one adult is required.",
    mustAgreeRules: "Please accept the house rules to continue.",
    mustBe21: "The primary guest must be 21 or older.",
  },
  minNightsMessage: "These dates require a stay of at least {{minNights}} nights.",
  unavailableDatesMessage:
    "Some of those nights are reserved. Try other dates, or send a request and we will suggest the nearest opening.",
  maxGuestsMessage: "Prince of Tides sleeps up to 6. Infants under 2 are welcome and not counted.",
  success: {
    title: "Request received.",
    body: "Thank you, {{guestName}}. Your request for {{checkIn}} to {{checkOut}} is with us. A confirmation has been sent to {{email}}.",
    nextStepsHeading: "What follows",
    nextSteps: [
      "We review your dates, typically within TODO_OWNER: response time.",
      "We send a final quote with exact taxes and fees.",
      "You accept and pay by secure invoice. Your dates are held once payment is received.",
      "Before arrival: the door code, parking notes and the full address.",
    ],
    button: { label: "Return to the residence", href: "/" },
  },
  failure: {
    title: "The request did not go through.",
    body: "Something failed on our side. Nothing was charged. Please try again in a moment.",
    retry: "Try again",
    fallbackContact: "If it persists, email TODO_OWNER: contact email with your dates.",
  },
  policiesHeading: "House rules",
  policiesSummary: [
    "Primary guest 21 or older",
    "No pets (an additional cleaning fee applies if evidence is found)",
    "No smoking or vaping",
    "No events, parties or gatherings unless agreed in advance",
    "Check-in 4:00 PM, check-out 10:00 AM",
  ],
};

export const footer: FooterCopy = {
  tagline: "Rest, at the pace of the tide.",
  smallPrint: [
    "Prince of Tides, Hilton Head Resort, Hilton Head Island, South Carolina. The full address is provided on confirmation.",
    "Town of Hilton Head Island Short-Term Rental Permit 029008.",
    "Resort amenities are shared, operated by the HOA and subject to seasonal hours.",
    "An independently managed vacation rental. Not affiliated with any book, film or publisher.",
  ],
};

export const emails: EmailsCopy = {
  guestRequestReceived: {
    subject: "Your request: Prince of Tides, {{checkIn}} to {{checkOut}}",
    body: `Dear {{guestName}},

Thank you for your request. It has been received, and nothing has been charged.

Arrive: {{checkIn}}, from 4:00 PM
Depart: {{checkOut}}, by 10:00 AM
Guests: {{guests}}
Estimated total: {{estimateTotal}}

What follows
1. We review your dates, typically within TODO_OWNER: response time.
2. We send a final quote with exact taxes and fees.
3. You accept and pay by secure invoice. Your dates are held once payment is received.
4. Before arrival, we send the door code, parking notes and the full address.

The figure above is an estimate. The final quote is confirmed by your host before any payment.

Should you have questions in the meantime, simply reply.

With regards,
TODO_OWNER: host name
Prince of Tides, Hilton Head Resort
Town of Hilton Head Island STR Permit 029008`,
  },
  hostNewRequest: {
    subject: "New request: {{guestName}}, {{checkIn}} to {{checkOut}}",
    body: `A new request to book Prince of Tides.

Guest: {{guestName}}
Email: {{guestEmail}}
Phone: {{guestPhone}}

Arrive: {{checkIn}}
Depart: {{checkOut}}
Nights: {{nights}}
Guests: {{guests}}
Estimate shown to guest: {{estimateTotal}}

Note from guest:
{{message}}

To do
1. Confirm the dates are still open on Airbnb and Vrbo.
2. Reply with a final quote and invoice.
3. Block the dates on all calendars once paid.

Submitted: {{submittedAt}}`,
  },
};
