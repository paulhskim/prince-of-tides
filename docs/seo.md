# Prince of Tides: SEO and Local Search Plan

Owner of this doc: SEO / destination research agent. Last researched: October 2026.
Config that implements this plan: `src/content/seo.ts` (titles, descriptions, keywords, geo, schema fields)
and `src/content/area-guide.ts` (area page content).

---

## 1. Positioning for search

We cannot outrank Airbnb, Vrbo or the big Hilton Head property managers on broad terms like
"Hilton Head vacation rentals". We can win on:

1. **Complex-name searches**: people who already chose Hilton Head Resort (returning guests, friends of
   owners, people who saw it on Vrbo) search "Hilton Head Resort condo", "Hilton Head Resort indoor pool".
2. **Feature + place long tail**: "2 bedroom condo indoor pool Hilton Head", "gated condo mid-island".
3. **Brand searches**: "Prince of Tides Hilton Head" from past guests and word of mouth.
4. **Honest-answer queries**: "how far is Hilton Head Resort from the beach", "Hilton Head Resort parking".
   Our FAQ answers these better than any OTA listing can.

Honesty rule applies to SEO copy too: never target "oceanfront", "beachfront", "ocean view" or
"steps to the beach" keywords (BRIEF rule 4, brand-voice words to avoid).

---

## 2. Keyword strategy and page mapping

| Tier | Keyword | Intent | Page |
| --- | --- | --- | --- |
| Primary | Hilton Head Resort condo rental | Commercial | `/` |
| Primary | Hilton Head 2 bedroom condo indoor pool | Commercial | `/` |
| Primary | book direct Hilton Head (condo) | Transactional | `/book` |
| Secondary | mid-island Hilton Head vacation rental | Commercial | `/`, `/area` |
| Secondary | gated Hilton Head vacation rental | Commercial | `/` |
| Secondary | Hilton Head condo near Shelter Cove | Commercial / local | `/area` |
| Secondary | Hilton Head vacation rental near Palmetto Dunes | Commercial / local | `/area` |
| Secondary | Hilton Head Resort indoor pool / boardwalk | Research | `/gallery`, `/` |
| Long tail | how far is Hilton Head Resort from the beach | Informational | `/faq` |
| Long tail | Hilton Head Resort parking / beach shuttle / check-in | Informational | `/faq` |
| Long tail | Hilton Head condo sleeps 6 with 2 bathrooms | Commercial | `/` |
| Long tail | Hilton Head winter rental heated indoor pool | Commercial (snowbird) | `/`, `/area` |
| Long tail | things to do mid-island Hilton Head | Informational | `/area` |
| Long tail | restaurants near Shelter Cove Hilton Head | Informational | `/area` |
| Long tail | RBC Heritage 2027 rental (Apr 15 to 18, 2027) | Seasonal | `/area` (seasonal notes), `/book` |
| Brand | Prince of Tides Hilton Head | Navigational | `/` |
| Trust | Hilton Head short term rental permit 029008 | Navigational / trust | `/policies` |

Usage rules:
- One primary keyword per page in the `<title>`, H1 and first paragraph. Do not stuff.
- `<meta name="keywords">` is ignored by Google. The `keywords` arrays in `seo.ts` are a copy brief for
  writers and for internal linking anchors, not a meta tag.
- Internal links: home links to `/area` with anchor "mid-island area guide" and to `/faq` with
  "how far is the beach"; `/area` beach section links to `/faq#beach`; every page links to `/book`.

---

## 3. Title tags and meta descriptions

Rendered titles (template `%s | Prince of Tides`, home rendered as-is). All verified at build of this doc:
titles 60 characters or fewer, descriptions 155 or fewer.

| Page | Title (rendered) | Chars | Meta description | Chars |
| --- | --- | --- | --- | --- |
| `/` | Prince of Tides \| Hilton Head Resort 2BR Condo Rental | 53 | Updated 2-bedroom, 2-bath condo for 6 at gated Hilton Head Resort, mid-island. Steps to the heated indoor pool, sauna and gym. Book direct. | 139 |
| `/book` | Book Direct: Check Dates & Request \| Prince of Tides | 52 | Pick your dates, see an estimated quote and request your stay at Prince of Tides, a 2BR condo at Hilton Head Resort. Book direct with the host. | 143 |
| `/gallery` | Photos: 2BR Condo at Hilton Head Resort \| Prince of Tides | 57 | See the king suite, queen and full bedroom, two baths, full kitchen and the indoor pool atrium steps from Building 3 at Hilton Head Resort. | 139 |
| `/area` | Mid-Island Hilton Head Area Guide \| Prince of Tides | 51 | Beaches, restaurants, groceries and things to do near Hilton Head Resort, with approx. drive times to Shelter Cove, Palmetto Dunes and the airports. | 148 |
| `/faq` | FAQ: Parking, Check-In, Beach Access \| Prince of Tides | 54 | How far is the beach, where to park, how self check-in works, what is in the kitchen and more. Straight answers about Prince of Tides, Hilton Head Resort. | 154 |
| `/policies` | House Rules, Policies & STR Permit \| Prince of Tides | 52 | Check-in 4 PM, check-out 10 AM, 21+ to book, no pets, no smoking. Full house rules and Town of Hilton Head Island STR Permit 029008. | 132 |

---

## 4. Structured data plan

### 4.1 Important eligibility fact

Google's **VacationRental rich result is limited**: the documentation says it is for sites already working
with a Google Technical Account Manager and with access to Hotel Center; other sites can only submit an
interest form. Google's Vacation Rentals eligibility page also states "Individually owned rentals are not
eligible to participate in Vacation Rentals at this time." (sources below)

**Recommendation:** still ship valid `VacationRental` JSON-LD on `/`. It is harmless, it describes the
entity precisely for search engines and AI answer engines, and it is ready if the owner later connects
through a connectivity partner (section 6.2). Do not expect a rich result from it on its own.

### 4.2 `VacationRental` (home page `/` only)

Build from `seo.vacationRentalSchemaFields`, `seo.geo` and `seo.address`.

Required by Google:
| Property | Value / source |
| --- | --- |
| `containsPlace` (`Accommodation`) | from config |
| `containsPlace.occupancy.value` | 6 |
| `identifier` | `prince-of-tides-hilton-head-resort` (must never change) |
| `image` | at least 8 absolute URLs, including at least one bedroom, one bathroom, one common area. Blocked until owner photos land in `/public/photos`. |
| `latitude` / `longitude` | 32.19051 / -80.70688 (5+ decimals required) |
| `name` | "Prince of Tides" |

Recommended (we include): `additionalType` ("Apartment", Google's closest suggested value for a condo),
`address` (Google wants the unit number; we deliberately omit "Unit 3206" for guest-privacy and security,
an accepted trade-off), `brand`, `checkinTime` "16:00:00", `checkoutTime` "10:00:00",
`containsPlace.additionalType` "EntirePlace", `containsPlace.bed` (King 1, Queen 1, Full 1),
`containsPlace.floorSize` 831 `FTK`, `numberOfBathroomsTotal` 2, `numberOfBedrooms` 2,
`containsPlace.amenityFeature` (Google's English names only), `description`, `knowsLanguage` ["en-US"].
Skip `numberOfRooms` (not verified). Add `review` only under the rules in 4.4.

Amenities used (all from Google's accepted list, all backed by BRIEF facts): `ac`, `heating`, `wifi`,
`internetType: Free`, `tv`, `kitchen`, `microwave`, `ovenStove`, `ironingBoard`, `crib` (pack 'n play),
`childFriendly`, `selfCheckinCheckout`, `elevator`, `pool`, `poolType: Indoor`, `poolType: Outdoor`,
`hotTub`, `gymFitnessEquipment`, `outdoorGrill` (community grills), `beachAccess` (resort boardwalk),
`washerDryer: false` (community laundry only), `petsAllowed: false`, `smokingAllowed: false`,
`instantBookable: false` (Phase 1 is request-to-book; flip to true when Phase 3 Stripe goes live),
`licenseNum: "Town of Hilton Head Island STR Permit: 029008"`.
Not included pending owner confirmation: `parkingType` (fee status), `wheelchairAccessible`.
Never use `privateBeachAccess` (the boardwalk is private, the beach is public).

Example skeleton (developer builds this from config; placeholders in caps):

```json
{
  "@context": "https://schema.org",
  "@type": "VacationRental",
  "additionalType": "Apartment",
  "identifier": "prince-of-tides-hilton-head-resort",
  "name": "Prince of Tides",
  "url": "https://TODO_OWNER_DOMAIN/",
  "description": "...defaultDescription...",
  "image": ["https://TODO_OWNER_DOMAIN/photos/... (8+)"],
  "latitude": 32.19051,
  "longitude": -80.70688,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "663 William Hilton Parkway",
    "addressLocality": "Hilton Head Island",
    "addressRegion": "SC",
    "postalCode": "29928",
    "addressCountry": "US"
  },
  "checkinTime": "16:00:00",
  "checkoutTime": "10:00:00",
  "knowsLanguage": ["en-US"],
  "containsPlace": {
    "@type": "Accommodation",
    "additionalType": "EntirePlace",
    "occupancy": { "@type": "QuantitativeValue", "value": 6 },
    "numberOfBedrooms": 2,
    "numberOfBathroomsTotal": 2,
    "floorSize": { "@type": "QuantitativeValue", "value": 831, "unitCode": "FTK" },
    "bed": [
      { "@type": "BedDetails", "numberOfBeds": 1, "typeOfBed": "King" },
      { "@type": "BedDetails", "numberOfBeds": 1, "typeOfBed": "Queen" },
      { "@type": "BedDetails", "numberOfBeds": 1, "typeOfBed": "Full" }
    ],
    "amenityFeature": [
      { "@type": "LocationFeatureSpecification", "name": "wifi", "value": true },
      { "@type": "LocationFeatureSpecification", "name": "poolType", "value": "Indoor" }
    ]
  }
}
```

### 4.3 `LodgingBusiness` fallback

If the developer prefers not to emit `VacationRental` (for example, before 8 real photos exist), emit a
minimal `LodgingBusiness` with `name`, `url`, `image`, `address`, `geo`, `checkinTime`, `checkoutTime`,
`amenityFeature` and `petsAllowed: false`. Note: `VacationRental` is itself a schema.org subtype of
`LodgingBusiness`, so do not emit both for the same entity on the same page. Pick one.

### 4.4 Reviews and `AggregateRating`: recommendation is DO NOT mark up

Google's review snippet guidelines say:
- Self-serving reviews: if the entity being reviewed controls the reviews about itself, pages using
  `LocalBusiness` or any other `Organization` type are ineligible for star review features.
  `VacationRental` is a `LodgingBusiness`, which is a `LocalBusiness`.
- "Don't aggregate reviews or ratings from other websites." Our only reviews come from Vrbo/Expedia.
- Ratings must be sourced directly from users and be visible on the page.

The VacationRental doc lists `aggregateRating` and `review` as recommended, but defers to those same
review snippet rules, and the feature is only for Hotel Center partners whose reviews come through the
partner feed.

**Do this:** show the four real Vrbo/Expedia reviews as plain HTML, attributed "Verified guest via
Vrbo/Expedia" with month/year, plus the "9.2/10 across 10 reviews on Vrbo/Expedia" line as text with a
link to the listing. **Do not** emit `AggregateRating` or `Review` JSON-LD for them. Revisit only if the
site later collects first-party reviews from direct guests (still self-serving for a LocalBusiness, so
still no stars expected).

### 4.5 `FAQPage` on `/faq`

Emit `FAQPage` with every visible question/answer (answers must match the visible text). Note: since
2023 Google shows FAQ rich results only for well-known authoritative government and health sites, so this
will not produce a rich result for us. Keep it anyway: it is cheap, valid, and helps other search and
AI engines parse the answers. Priority questions (from BRIEF guest pain points): beach distance and
shuttle, parking passes, door-code check-in, early arrival / luggage, bedroom temperature tips, what the
kitchen lacks (salt, pepper, oil), laundry, elevator.

### 4.6 `BreadcrumbList`

On every page except `/`: Home > Page name (for example Home > Area Guide). Use absolute URLs from
`siteUrl`. Matches visible breadcrumbs if the design shows them; if not, it is still valid.

### 4.7 `WebSite`

On `/` only: `WebSite` with `name: "Prince of Tides"` and `url`. Helps Google show the correct site name.
No SearchAction (there is no site search).

---

## 5. Technical SEO checklist

- [ ] **Domain**: set `siteUrl` (replace `TODO_OWNER_DOMAIN`) in one place; every canonical, OG URL,
      sitemap and JSON-LD reads from it. Force HTTPS and a single host (www or apex, redirect the other).
- [ ] **Canonical**: self-referencing canonical on every page via Next.js `metadata.alternates.canonical`.
      Strip query strings (`?checkin=` etc. on `/book` must canonicalize to `/book`).
- [ ] **Sitemap**: `src/app/sitemap.ts` listing the six pages with `lastModified`. Submit in Google
      Search Console and Bing Webmaster Tools.
- [ ] **Robots**: `src/app/robots.ts` allowing all, pointing to the sitemap. Disallow `/api/` and any
      booking confirmation or thank-you routes. Add `noindex` to preview deployments (Vercel preview URLs).
- [ ] **Open Graph / Twitter**: `og:title`, `og:description`, `og:image` (1200x630 real photo, owner to
      supply), `og:image:alt` (`seo.ogImageAlt`), `og:type=website`, `og:locale=en_US`,
      `og:site_name`; `twitter:card=summary_large_image`. One OG image per page where possible (gallery
      uses a bedroom shot, area uses the boardwalk).
- [ ] **Image alt text convention**: describe what is in the photo, then where, plainly, no keyword lists.
      Pattern: "[subject], [detail], [location context]". Examples: "King bed with white linens in the
      primary bedroom, Prince of Tides condo"; "Heated indoor pool in the Hilton Head Resort atrium";
      "Elevated boardwalk over the salt marsh to the beach at Hilton Head Resort". Never write "ocean view".
      Decorative images get `alt=""`.
- [ ] **Image files**: descriptive filenames (`primary-bedroom-king-bed.jpg`), served through
      `next/image` (AVIF/WebP, responsive `sizes`), explicit width/height to prevent layout shift.
- [ ] **Core Web Vitals targets** (good thresholds): LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less.
      - LCP: hero image with `priority`, preloaded, under about 200 KB at mobile size; self-host fonts with
        `next/font` and `display: swap`.
      - INP: keep the availability calendar light; lazy-load it below the fold on `/`; no heavy third-party
        widgets on first load.
      - CLS: reserve space for images, the calendar and any review carousel.
- [ ] **Rendering**: all marketing pages statically generated. `/book` page shell static, calendar data
      client-fetched.
- [ ] **Headings**: exactly one H1 per page containing the primary keyword.
- [ ] **NAP consistency**: public address everywhere is "Hilton Head Resort, 663 William Hilton Parkway,
      Hilton Head Island, SC 29928" (no unit). Same phone/email in footer and schema once the owner sets them.
- [ ] **Analytics**: Vercel Analytics or GA4 plus Search Console. Track `request_submitted` as the conversion.
- [ ] **404 and redirects**: custom 404 that links to `/book` and `/area`.
- [ ] **Accessibility overlaps SEO**: descriptive link text, form labels on the booking request, color contrast.

---

## 6. Off-site plan

### 6.1 Google Business Profile: not eligible

Google's Business Profile eligibility guidelines list as ineligible: "Rental or for-sale properties such
as vacation homes, model homes, or vacant apartments", and require that a business "make in-person contact
with customers during its stated hours." A single self-check-in condo does not qualify. Creating one
risks suspension.

What is allowed: if the managing host's business has a real office that
meets customers in person during posted hours, that management business could have its own profile.
That is a separate decision for the owner. Do not create a profile at the condo address.

### 6.2 Google Vacation Rentals (appear in Google Travel / Maps rental results)

- Google: "Individually owned rentals are not eligible to participate in Vacation Rentals at this time."
  To appear, you must be "a registered property management business with a direct booking website, or
  listed on a booking site that is integrated with Vacation Rentals on Google."
- Practical path: run the direct site's booking engine through a property management system that is a
  Google Vacation Rentals connectivity partner. Google's partner list (63 partners when checked) includes
  US-focused tools such as **OwnerRez, Hostaway, Guesty, Lodgify, Hostfully, Hospitable, Uplisting,
  iGMS, Tokeet, Beds24, BookingPal, Rentals United, Bluetent, Futurestay, Channex**.
- Each partner sets its own rules (plan tier, whether payments must run through its booking engine,
  fees). Confirm with the chosen partner before committing. This fits Phase 2/3 of the roadmap: the
  partner would replace or feed the iCal sync and payments.

### 6.3 Backlinks and citations (quality over quantity)

1. **Hilton Head Island visitor site (hiltonheadisland.org)**: lists restaurants and attractions with
   "Visit Partner Site" links; investigate whether lodging listings are open to a single managed rental
   and what membership costs.
2. **Partners we feature in the area guide**: we link out to them; a polite note to Coco's on the Beach
   or a local tour operator may earn a "where to stay" mention. Never pay for links.
3. **HOA / resort**: if Hilton Head Resort's owners' association publishes a rental directory, ask to be listed.
4. **Event pages**: an RBC Heritage week (April 15 to 18, 2027) landing section is linkable for golf
   travel blogs and forums; pitch only if genuinely useful.
5. **Direct-booking directories** that link to owner sites (evaluate case by case; avoid link farms).
6. **Social profiles** (Instagram, Facebook page) with the website link: brand-search signals and an
   owned channel for past direct guests.

### 6.4 Turning Airbnb / Vrbo guests into direct guests, within the rules

Airbnb's Off-Platform and Fee Transparency Policy (help article 2799) prohibits:
- Including links that take people off Airbnb in listings or messages.
- Encouraging guests to book current, future or repeat stays (including extensions) off Airbnb, or
  offering off-platform discounts.
- Requesting or receiving payment outside Airbnb.
- Asking for a guest's contact details before booking (all pre-booking communication stays on Airbnb).
- Soliciting a guest's email or other contact channels through Airbnb messages, and using guest contact
  info for marketing or mailing lists.
- Asking guests to review an Airbnb stay on another website.
- Enforcement can include listing or account suspension or removal for repeated or severe violations.

So, for Airbnb-sourced guests: **no website link in the listing, messages, welcome book or check-out
note aimed at rebooking, no "book direct next time and save" cards, no adding them to an email list.**

What is allowed and works:
- **Be findable by brand.** Use the name "Prince of Tides" consistently (listing title on platforms where
  allowed, in-unit decor, Wi-Fi network name). A guest who later searches "Prince of Tides Hilton Head"
  finds the site on their own. Brand alone is not a link or a solicitation.
- **Own the search results** for the complex and features (sections 2 to 5), so new guests find the site
  before an OTA.
- **Direct guests are yours.** Anyone who booked on the website can be emailed (with consent and an
  unsubscribe link) about return dates. Build the list only from direct bookings and website sign-ups.
- **Social and referrals**: an Instagram presence and a referral offer for direct guests.
- **Vrbo**: Vrbo has its own terms on guest contact and off-platform bookings. Review them before any
  outreach to Vrbo guests; do not assume they match Airbnb's.

---

## 7. Area guide notes (for content and developers)

- Distances in `area-guide.ts` are road distances from OSRM routing between Census-geocoded addresses,
  with drive times padded for lights and traffic. Always show "approx." in the UI.
- Computed distances differ slightly from the BRIEF's "nearby" list (for example Driessen Beach Park
  1.3 mi by road vs 1.7 mi in the BRIEF; Adventure Cove 1.3 vs 1.5). The BRIEF figures likely came from
  a listing. Pick one source for UI and keep it consistent; the area guide uses the computed road values.
- SAV routes at about 46 mi and about 59 min free-flow in OSRM, so the guide says "about 50 to 60
  minutes", slightly longer than the BRIEF's "about 50 min".
- Left out because 2026 operation could not be confirmed from a dated source: Scott's Fish Market and
  San Miguel's (Shelter Cove Harbour, sites show 2023 to 2025 content only), Old Oyster Factory, Hilton
  Head Social Bakery (last dated source June 2025). Re-check and add if confirmed.
- Islanders Beach Park is closed for renovation from September 8, 2026 with a target reopening of
  June 1, 2027 (not in the guide; it is north of the resort and not a primary recommendation).
- Re-verify restaurants, hours and URLs every March before peak season.

---

## 8. Sources

- Google, VacationRental structured data: https://developers.google.com/search/docs/appearance/structured-data/vacation-rental
- Google, Review snippet guidelines (self-serving reviews, no aggregation from other sites): https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- Google, Vacation Rentals eligibility starter guide: https://support.google.com/hotelprices/answer/11949903?hl=en
- Google, Vacation rental connectivity partners: https://support.google.com/hotelprices/answer/11946834
- Google Business Profile eligibility guidelines: https://support.google.com/business/answer/13763036
- Airbnb Off-Platform and Fee Transparency Policy: https://www.airbnb.com/help/article/2799
- PGA TOUR, 2027 RBC Heritage (Apr 15 to 18, 2027): https://www.pgatour.com/tournaments/2027/rbc-heritage/R2027012/overview
- Town of Hilton Head Island parks and pathways: https://www.hiltonheadislandsc.gov/parks/parks.cfm , https://hiltonheadislandsc.gov/pathways
- Islanders Beach Park closure: https://deeparrival.com/news/hilton-head-islanders-beach-park-closes-september-2026/
- Beach rules (dogs, alcohol, glass): https://www.hiltonheadisland.com/beaches/beach-information/
- Routing: OSRM (router.project-osrm.org); geocoding: US Census Geocoder (geocoding.geo.census.gov)
