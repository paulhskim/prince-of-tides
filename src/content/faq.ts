/**
 * Prince of Tides: frequently asked questions.
 *
 * Only verified facts from docs/BRIEF.md are stated as fact. Anything the HOA controls (amenity hours,
 * shuttle schedule, elevator) is described as set by the HOA and subject to change.
 * Template tokens like {{responseTimeHours}} are replaced at render time from siteConfig.
 */

export type FaqCategory =
  | "Booking"
  | "Payment and cancellation"
  | "Arrival and departure"
  | "The condo"
  | "The resort"
  | "Guests and rules"
  | "Getting here";

export type FaqItem = { category: FaqCategory; q: string; a: string };

export const faq: FaqItem[] = [
  // Booking
  {
    category: "Booking",
    q: "Why book direct instead of on Airbnb or Vrbo?",
    a: "It is the same condo, the same cleaning standard and the same host. Booking direct means no platform guest service fee, a direct line to the person who manages the condo, and flexibility on things like early check-in requests. Taxes are the same either way. If you prefer the protections of a platform, you are welcome to book there too.",
  },
  {
    category: "Booking",
    q: "How does a booking request work?",
    a: "Choose your dates and number of guests, review the estimated quote, and send the request. Nothing is charged. We reply within {{responseTimeHours}} hours to confirm availability and send a final quote, a short rental agreement and a secure payment link. Your dates are reserved once the agreement is signed and the first payment is received.",
  },
  {
    category: "Booking",
    q: "Is the price on the calendar final?",
    a: "The quote on this site is an estimate. Your written quote from the host is final and includes the nightly rate, cleaning fee and South Carolina and Hilton Head Island accommodations taxes, listed line by line.",
  },
  {
    category: "Booking",
    q: "Is there a minimum stay?",
    a: "Yes. Minimum stays vary by season and are shown on the calendar when you pick dates. Summer stays are usually longer. Stays of a week or more, and a month or more, receive a discount.",
  },
  // Payment and cancellation
  {
    category: "Payment and cancellation",
    q: "When do I pay?",
    a: "50% when you sign the rental agreement, and the balance 30 days before check-in. If you book within 30 days of arrival, the full amount is due at confirmation. A refundable security deposit is collected with the final payment.",
  },
  {
    category: "Payment and cancellation",
    q: "What is the cancellation policy?",
    a: "Full refund 60 or more days before check-in, 50% refund 30 to 59 days before, and no refund within 30 days unless we rebook the nights. If a mandatory evacuation order for Hilton Head Island affects your stay, unused nights are refunded. We recommend travel insurance.",
  },
  // Arrival and departure
  {
    category: "Arrival and departure",
    q: "What are check-in and check-out times?",
    a: "Check-in is 4:00 PM and check-out is 10:00 AM. Check-in is self-service with a door code.",
  },
  {
    category: "Arrival and departure",
    q: "Can we check in early or check out late?",
    a: "Ask when you book or up to a few days before arrival. We can only say yes when there is no guest leaving or arriving that day, and we confirm the day before. The condo cannot be opened before 4:00 PM without confirmation because cleaners need the full turnover window. Arriving early anyway? The resort's pools, beach and the Shelter Cove area make good first stops.",
  },
  {
    category: "Arrival and departure",
    q: "How do we get the door code?",
    a: "Your personal door code and arrival instructions are emailed before arrival, with a reminder the day before. Save the email offline in case cell service is slow at the gate. If the code does not work, call or text the host number in your arrival email and we will help right away.",
  },
  {
    category: "Arrival and departure",
    q: "How does parking work?",
    a: "Hilton Head Resort is a gated community. Parking passes are issued at arrival, and the condo includes parking for up to 2 vehicles in the unassigned lot near Building 3. Your arrival email explains exactly where to stop for passes and where to park, which saves a loop around the resort.",
  },
  // The condo
  {
    category: "The condo",
    q: "What is in the kitchen?",
    a: "A full kitchen with refrigerator, oven, stovetop, microwave, dishwasher, toaster, blender and coffee maker, plus cookware, bakeware, utensils and a dining table. Salt, pepper and cooking oil are not provided, so add them to your first grocery run.",
  },
  {
    category: "The condo",
    q: "Is there a washer and dryer?",
    a: "There is no washer or dryer in the condo. Hilton Head Resort has community laundry on site. Fresh linens and towels are provided for your stay.",
  },
  {
    category: "The condo",
    q: "Is there Wi-Fi, and can I work remotely?",
    a: "Yes, Wi-Fi is included and the dining table works as a desk. If your work depends on video calls, ask us before booking and we will share what we know about the connection.",
  },
  {
    category: "The condo",
    q: "The bedrooms feel warm at night. Any tips?",
    a: "Lowcountry nights can be humid. Set the thermostat a few degrees cooler in the early evening rather than at bedtime, keep bedroom doors open so cool air circulates, and close blinds during the afternoon. If it still feels warm, message us.",
  },
  {
    category: "The condo",
    q: "What is the view like?",
    a: "Honest answer: the windows look over the parking area and the resort's interior pool atrium, not the ocean. In exchange you are steps from the indoor pool, sauna, steam room and gym, and it is a quiet spot.",
  },
  // The resort
  {
    category: "The resort",
    q: "How far is the beach?",
    a: "About 0.8 to 1.1 miles. Most guests walk the resort's private elevated boardwalk over the marsh, which ends near Coco's on the Beach. The resort also runs a complimentary beach shuttle in season; the schedule is set by the HOA.",
  },
  {
    category: "The resort",
    q: "Is beach gear included?",
    a: "Yes. Beach chairs and other gear are kept in the condo's storage locker at the resort. Directions to the locker are in your arrival email.",
  },
  {
    category: "The resort",
    q: "When are the pools, hot tub and sauna open?",
    a: "The resort has two outdoor pools, a heated indoor pool, a kiddie pool, a hot tub, sauna, steam room and fitness center. Hours are set by the Hilton Head Resort HOA and vary by season, so check the posted hours on site. The indoor pool, sauna, steam room and gym are right by Building 3.",
  },
  // Guests and rules
  {
    category: "Guests and rules",
    q: "Is the condo good for kids? Is there a crib?",
    a: "Yes. A pack 'n play travel crib is provided, and the resort has a kiddie pool. Board games, a game console and streaming are in the living area. The 21+ rule applies to the person booking, not to everyone in the group.",
  },
  {
    category: "Guests and rules",
    q: "Do I have to be 21 to book?",
    a: "Yes. The person who books must be at least 21, must be staying in the condo, and will be asked to verify their identity before arrival.",
  },
  {
    category: "Guests and rules",
    q: "Can we bring a pet?",
    a: "Sorry, no pets. An additional cleaning fee applies if evidence of a pet is found.",
  },
  {
    category: "Guests and rules",
    q: "Can we host a party or event?",
    a: "No events, parties or gatherings unless approved in writing before arrival. Town quiet hours are 10:00 PM to 7:00 AM.",
  },
  {
    category: "Guests and rules",
    q: "Is the condo accessible? Is there an elevator?",
    a: "Building 3 has an elevator, but it is run by the HOA and we cannot guarantee it is in service; if it is not, access is by stairs. The condo is not a certified accessible unit and both bathrooms have shower/tub combinations. Please ask before booking if you have specific needs.",
  },
  // Getting here
  {
    category: "Getting here",
    q: "Which airport should we fly into?",
    a: "Hilton Head Island Airport (HHH) is about a 12 minute drive. Savannah/Hilton Head International (SAV) is about 50 minutes and usually has more flights.",
  },
  {
    category: "Getting here",
    q: "Where is the nearest grocery store?",
    a: "Grocery stores are a short drive away along William Hilton Parkway. We include our current recommendations in your arrival email.",
  },
];
