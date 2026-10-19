# Prince of Tides: Project Brief (shared by every agent)

## Goal
A direct advertising + booking website for one vacation rental condo, managed/co-hosted by Bin Ma.
It must (1) sell the stay better than the Airbnb/Vrbo listing does, (2) convert visitors into booking
requests, and (3) be architected so it can later become full direct booking with live availability and
Stripe payment.

Booking roadmap:
- Phase 1 (build now): request-to-book. Guest picks dates on an availability calendar, sees an
  estimated quote, submits a request. Host confirms and invoices. No payment code active.
- Phase 2 (scaffold now, off by default): availability synced from Airbnb/Vrbo iCal feeds.
- Phase 3 (scaffold now, behind a feature flag, off): Stripe Checkout for instant booking.

## HARD RULES for all agents
1. NEVER use em dashes (the long dash character) anywhere: copy, code comments, docs. Use commas,
   periods, colons, parentheses, or a plain hyphen instead. This is a firm owner preference.
2. Do not invent facts about the unit. Use only the facts below. Anything unknown goes in as a clearly
   marked placeholder (e.g. `TODO_OWNER:`) in config, never as fake-but-plausible data shown as real.
3. No fabricated reviews. Only the real guest reviews listed below may be displayed, attributed to
   their source. The owner will add Airbnb reviews later.
4. Honesty about trade-offs builds trust and avoids bad reviews: the beach is a walk (about 0.8 to 1.1
   miles via the resort's marsh boardwalk, seasonal shuttle), and the unit's windows face the parking
   lot / indoor pool atrium, not the ocean. Frame positively but never claim ocean views or beachfront.
5. Brand: "Prince of Tides". Tagline direction: royal-but-relaxed Lowcountry escape.

## Verified facts: the unit
- Name: Prince of Tides
- Address: 663 William Hilton Parkway, Unit 3206, Hilton Head Island, SC 29928
  (show only "Hilton Head Resort, mid-island" publicly; full address is given after booking confirmation)
- Complex: Hilton Head Resort (MLS subdivision "HH Resort/Four Seasons"), Building 3, built 1982,
  24-hour guard-gated community, mid-island near Palmetto Dunes, Shelter Cove Harbour & Towne Centre
- 2 bedrooms, 2 full bathrooms, approx. 831 sq ft, sleeps 6
- Bedroom 1: King bed, Smart TV, ensuite bath (single vanity, shower/tub combo)
- Bedroom 2: One queen + one full bed, Smart TV (sleeps up to 4)
- Hall bathroom: single vanity, shower/tub combo
- Full kitchen: fridge, oven, stovetop, microwave, dishwasher, toaster, blender, coffee maker,
  cookware, bakeware, utensils, dining table. (Salt, pepper, cooking oil NOT provided.)
- Living area: board games, game console, streaming
- Included: fresh linens & towels, starter soaps/paper goods/trash bags, Wi-Fi, A/C & heat,
  hair dryer, iron/board, pack 'n play/travel crib, beach gear (chairs etc.) in a resort storage locker
- Outdoor seating; community BBQ grills
- Laundry: community laundry on-site (NOT in-unit)
- Building has an elevator (managed by HOA, not guaranteed; stairs if out of service)
- Location within resort: Building 3, right by the indoor pool / atrium, sauna, steam room, gym,
  indoor walking track. Window views: parking lot and interior atrium.
- Parking: up to 2 vehicles, unassigned lot, passes issued at arrival
- Check-in 4:00 PM, check-out 10:00 AM. Self check-in with door code emailed before arrival.
- Must be 21+ to book. No pets (extra cleaning fee if evidence found). No smoking/vaping.
  No events, parties or gatherings unless pre-approved.
- Safety: smoke detector, CO detector, fire extinguisher, first aid kit
- Town of Hilton Head Island Short-Term Rental Permit: 029008 (display in footer/policies)
- Nearest airport: Hilton Head Island Airport (HHH) about 12 min drive; Savannah/Hilton Head Intl (SAV)
  about 50 min.
- Nearby (approx.): Palmetto Dunes beach area 0.8 mi, Singleton Beach 0.9 mi, Burkes Beach 1.1 mi,
  Adventure Cove 1.5 mi, Driessen Beach Park 1.7 mi, Shelter Cove a short drive.

## Verified facts: Hilton Head Resort amenities (shared, HOA run)
Private elevated marsh boardwalk to the beach, complimentary seasonal beach shuttle, two outdoor pools,
heated indoor pool, kiddie pool, hot tub, sauna, steam room, fitness center, indoor jogging/walking track,
lighted tennis and pickleball courts, sand volleyball, bike rentals and storage, grilling/picnic stations,
sun decks, garden areas, on-site deli/bar (Beach Bear Deli & Bar near Building 1 pool, seasonal),
Coco's on the Beach (beach bar/restaurant at the end of the boardwalk), 24-hour gated security.

## Real guest reviews (from the Vrbo/Expedia listing, 9.2/10 across 10 reviews; cleanliness 9.4, location 9.6)
Display only these, attributed "Verified guest via Vrbo/Expedia" with month/year:
- Wendy D., Jun 2026, 10/10: "We loved this condo. Hope to come back soon."
- Elizabeth, Apr 2026, 10/10: "Clean, super cute place, right by the indoor pool area which was great!!"
- Teresa K., Oct 2025, 10/10: "We enjoyed ourselves immensely. We have stayed at this complex 2 other
  times and this one was the best. The unit was clean and nicely designed. It was surprisingly quiet most
  of the time. We loved walking over the marsh to the beach!"
- Susan P., Apr 2026, 8/10: "Unit was updated, clean, and amenities were great... Plenty of bed space, two
  bathrooms, fully equipped kitchen, and convenient to locations we wanted to visit - it was perfect for
  our short stay... the sauna and steam room were appreciated and the indoor pool was good... The storage
  locker was well equipped with beach chairs... Overall, we enjoyed our stay and would stay here again."
Known guest pain points to proactively address in copy/FAQ (do not quote these): confusing parking,
door-code trouble, bedrooms warm at night (mention fans / thermostat tips), early arrivals cannot get in
before 4 PM (offer early check-in requests / luggage tips), long-ish walk to beach (shuttle), interior views.

## Owner placeholders (unknown; must be config, clearly marked)
Nightly rates by season, cleaning fee, minimum nights, security deposit, exact lodging tax total,
host name/photo/bio, contact email & phone, Airbnb/Vrbo listing URLs and iCal URLs, Stripe keys,
domain name. Photos: owner will drop real photos into /public/photos later.

## Tech stack (decided)
Next.js 15 App Router, TypeScript, Tailwind CSS v4, deploy target Vercel.
Project root: /home/claude/pot. Content lives in src/content/*.ts (typed). Site-wide owner settings
live in src/content/site.config.ts.
