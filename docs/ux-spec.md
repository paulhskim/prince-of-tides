# Prince of Tides: UX Specification

Read with `docs/design-system.md` (tokens, components, banned patterns) and `docs/BRIEF.md` (facts). Grid diagrams use the 12-column `lg` grid; `[ ]` is a photo, `~~~` is text, `---` is a 1px rule.

---

## 1. Sitemap

| Route | Purpose | Why it exists |
|---|---|---|
| `/` | Long-scroll home with anchors: `#residence`, `#amenities`, `#resort`, `#beach`, `#location`, `#reviews`, `#arrival`, `#reserve` | Fastest path to conversion: everything a returning Airbnb/Vrbo browser needs to decide, on one page, with the reservation ledger always one tap away |
| `/book` | Focused request page: ledger + request form, no masthead links except wordmark and "Back to the residence" | Removes distraction once intent is shown; receives `?arrive=YYYY-MM-DD&depart=YYYY-MM-DD&adults=&children=&infants=` |
| `/booking/success` | Confirmation of request sent | Sets expectations, reduces "did it work?" emails |
| `/gallery` | All photographs, grouped by room, captioned | Deep photo browsing without weighing down home |
| `/area` | Local guide from `src/content/area-guide.ts` | SEO ("Hilton Head mid-island condo"), trip planning, sharable |
| `/policies` | House rules, cancellation, deposit, permit, from `src/content/policies.ts` | Linked from the required house-rules checkbox; trust |
| `/faq` | Full FAQ from `src/content/faq.ts` | Pre-empts known pain points (parking, door code, heat, early arrival, beach walk) |

Masthead labels map: The residence (`/#residence`), Resort and beach (`/#resort`), Photographs (`/gallery`), Area guide (`/area`), Questions (`/faq`), primary "Check availability".

## 2. Home page: sections, purpose, content, composition

Every section has its own composition. Density alternates. Section numbers below are build order, not displayed.

### 2.1 Cover (`copy.hero`) `py-section-lg`, paper

Purpose: name, place, honest one-line promise, proof (rating), path to dates. LCP.

```
lg:
| 1  2  3  4  5 | 6  7  8  9  10 11 12 |bleed->
| "Hilton Head  | [                     ]
|  Resort,      | [   cover photo 4:5    ]
|  mid-island"  | [   (bleeds to right   ]
|  label        | [    viewport edge)    ]
|               | [                     ]
| Prince of     | [                     ]
| Tides display | [                     ]
| (set in 2     | [                     ]
|  lines, serif)| caption: "The marsh boardwalk from
| ~~~ lead ~~~  |  the resort to the beach"
| ---------------
| 2      2      6      9.2    <- particulars line: 4 cells, rule between,
| bedrooms baths guests of 10    figures serif h3, labels text-caption muted
| ---------------
| [Check availability] View the photographs (text link)
```
- Text column cols 1 to 5, vertically aligned to bottom of photo (`self-end`), so the composition reads as a book cover with the type anchored low.
- Particulars line: "2 bedrooms", "2 baths", "Sleeps 6", "9.2 of 10 on Vrbo (10 reviews)". The rating cell links to `#reviews`.
- Mobile: label, name (display), photo full-bleed 4:5 (`-mx-gutter`), caption, lead, particulars as 2x2 ledger, primary button full width.
- No overlay text on photo, so no scrim needed and the photo stays honest and clean.

### 2.2 Standfirst and particulars (`copy.intro`) `py-section-lg`, paper, id `residence`

Purpose: the human pitch plus a fact sheet that answers spec questions at a glance.

```
| 1  2  3 | 4  5  6  7  8  9 | 10 11 12          |
| --------------------------------------------- |
| label   | ~~ standfirst ~~ | Particulars       |
| "The    | serif text-lead, | ----------------- |
|  stay"  | 2 short paras    | Residence  Bldg 3 |
|         | text-prose       | Size  ~831 sq ft  |
|         |                  | Bedrooms  2       |
|         |                  | Baths  2 full     |
|         |                  | Sleeps  6         |
|         |                  | Check-in  4:00 PM |
|         |                  | Check-out 10:00 AM|
|         |                  | Parking  2 cars   |
|         |                  | Laundry  On-site, |
|         |                  |   shared          |
|         |                  | Permit  029008    |
```
- Particulars is a `<dl>` in `text-small`, term `ink-muted` left, value `ink` right, 1px `rule` between rows, `ink` rule on top with heading "Particulars" `text-label`. Values come from `site.config.ts`/copy, not hardcoded.
- Mobile: label, standfirst, then particulars full width.

### 2.3 Highlights (`copy.highlights`) `py-section`, paper

Purpose: 4 to 5 reasons this unit, as statements with evidence. Not cards.

```
| 1  2  3  4  5 | 6 | 7  8  9 | 10 11 12          |
| [ indoor pool | . | ---------------------------- |
|   atrium 4:5 ]| . | Next to   | Building 3 sits  |
|               | . | the indoor| beside the heated|
|               | . | pool      | indoor pool, ... |
|               | . | ---------------------------- |
| caption       | . | Gated and | 24-hour guard... |
|               | . | quiet     |                  |
|               | . | ---------------------------- |
```
- Definition list: term serif `text-h3` cols 7 to 9, description `text-small`/`text-body` cols 10 to 12; rows split by `rule`. Photo cols 1 to 5, top aligned with first rule.
- No section h2; margin label "Why guests choose it" sits above the list (cols 7 to 12).
- Mobile: photo, then stacked term over description rows.

### 2.4 The space (`copy.theSpace`) `py-section`, paper

Purpose: room-by-room description as a two-column editorial spread, plus sleeping arrangements table.

```
| 1  2  3  4  5  6 | 7  8  9  10 11 12              |
| ---------------------------------------------------|
| [ living 3:2     ] | label "The space"              |
| [                ] | h2                             |
| caption          | ~~ text-prose, max-w-measure ~~ |
|      [ kitchen  ]| Run-in heads: "Kitchen." text   |
|      [ 4:5,     ]| "Living." text  "Bedrooms." text|
|      [ offset   ]|                                 |
|      [ cols 3-6 ]| Sleeping arrangements (table)   |
|                  | Room      | Beds        | Bath  |
|                  | --------------------------------|
|                  | Bedroom 1 | King        | Ensuite, shower/tub |
|                  | Bedroom 2 | Queen + full| Hall bath, shower/tub|
```
- Left page: two photos, second offset down 96px and indented to cols 3 to 6 (asymmetric).
- Run-in heads: sans 500 `text-body` followed by serif prose on the same line.
- Table: `text-small`, `ink` rule under head row, `rule` between rows.
- Mobile: h2, prose, photo 1, table, photo 2.

### 2.5 Contact sheet (photo preview, from photo manifest) `py-section-sm`, paper

```
| 1  2  3  4 | 5  6  7  8 | 9  10 | 11 12 |
| [ 01 4:5  ]| [ 02 3:2  ]| [03 ] | [04 ] |
| [         ]| [ 05 3:2  ]| [   ] | [   ] |
| 01 caption | 02 / 05    | 03    | 04    |
| ------------------------------------------ |
| 24 photographs           [View all photographs] (secondary) |
```
- Frame numbers in captions (genuine catalog reference to `/gallery`).
- Mobile: horizontal scroll-snap strip of 5 frames at 78vw each, with visible next-frame peek; button below.

### 2.6 Amenities index (`copy.amenities`) `py-section-sm`, paper, id `amenities`

Purpose: complete, scannable inventory. Dense by design.

```
| 1  2  3 | 4  5  6  7  8  9  10 11 12                       |
| ---------------------------------------------------------- |
| label   | Kitchen            | Sleeping and bath | Living   |
| "What is| ------------------ | ----------------- | -------- |
|  provided" 01 Refrigerator   | 12 King bed ...   | 19 Board |
| short   | 02 Oven            | 13 Queen + full   |    games |
| note:   | 03 Stovetop        | ...               | ...      |
| "Kitchen| ...                | Included          | Not      |
|  basics | Outdoor, parking   | ------------      | provided |
|  like   | ...                | 24 Linens...      | Salt,... |
|  salt   |                    |                   | In-unit  |
|  are not|                    |                   | laundry  |
|  stocked"                    |                   |          |
```
- Component: Amenity index (design-system 8.14), 3 CSS columns in cols 4 to 12.
- Groups (from facts): Kitchen; Sleeping and bath; Living and entertainment; Included in every stay; Outdoor, parking, laundry; Safety; Not provided.
- No h2; label + a one-sentence note in the margin column.

### 2.7 The resort (`copy.resort`) `py-section`, `bg-stone` band, id `resort`

Purpose: shared HOA amenities as a directory table (like a building directory).

```
| 1  2  3  4 | 5  6  7  8  9  10 11 12                    |
| label      | Facility            | Notes                |
| h2         | ---------------------------------------- ink |
| lead       | Marsh boardwalk     | Private, to the beach|
| caption:   | Beach shuttle       | Complimentary [Seasonal] |
| "Shared    | Indoor pool, heated | Beside Building 3    |
|  amenities,| Outdoor pools (2)   |                      |
|  run by the| Hot tub, sauna,     | Beside Building 3    |
|  HOA. Hours|  steam room         |                      |
|  and       | Fitness, indoor track | Beside Building 3  |
|  seasons   | Tennis, pickleball  | Lighted              |
|  vary."    | ... Beach Bear Deli | Near Bldg 1 [Seasonal] |
|            | Coco's on the Beach | End of the boardwalk |
```
- Table `text-small`, two columns on mobile collapse to stacked rows (facility `ink` 500 over note `ink-muted`).
- Labels (design-system 8.2) only for "Seasonal". Facts only from BRIEF.md.

### 2.8 The way to the beach (`copy.beachAccess`) `py-section-lg`, paper, id `beach`

Purpose: turn the main trade-off (a walk, not beachfront) into a positive, exact story.

```
| full-bleed [ boardwalk 21:9 (mobile 4:3) ]                  |
| caption                                                      |
| 1  2  3 | 4  5  6  7  8  9  10 11 12                         |
| label   | h2 + text-prose (max-w-measure)                    |
|         |                                                     |
|         | Route (ordered list rendered as a line):           |
|         | o-------------o-----------------------o            |
|         | Building 3    Marsh boardwalk         Beach and     |
|         |               through the spartina    Coco's        |
|         |               about 0.8 to 1.1 mi total             |
|         | Seasonal shuttle runs the same route (caption)     |
|         |                                                     |
|         | Nearby beaches (table)                             |
|         | Palmetto Dunes beach area  0.8 mi                   |
|         | Singleton Beach            0.9 mi                   |
|         | Burkes Beach               1.1 mi                   |
|         | Driessen Beach Park        1.7 mi                   |
```
- Route: `<ol>` with 3 stops; desktop horizontal 1px `ink` line with 9px open circles (`border ink`, `rounded-round` allowed here as a map symbol), labels below; mobile vertical line left. A genuine sequence, so numbering/line is justified.
- Distance table right-aligned tabular figures, "approx." in the table caption.
- Never "beachfront", "oceanfront", "ocean view".

### 2.9 Location (`area-guide.ts` teaser + config) `py-section-sm`, paper, id `location`

```
| 1  2  3 | 4  5  6  7  8  9  10 | 11 12            |
| label   | [ map facade 16:10  ] | Getting here     |
|         | [ "Show map" button ] | HHH airport 12 min|
|         |                       | SAV airport 50 min|
|         |                       | Shelter Cove  short drive |
|         |                       | Adventure Cove 1.5 mi |
|         |                       | [Area guide] text link |
```
- Public location text: "Hilton Head Resort, mid-island". Full address only after confirmation.
- Mobile: label, list, map facade.

### 2.10 Testimony (`copy.reviewsSection`) `py-section-lg`, paper, id `reviews`

Purpose: proof without cards or stars.

```
| 1  2  3 | 4  5  6  7  8  9  10 11 12                       |
| ------------------------------------------------------------ |
| 9.2     |  "We enjoyed ourselves immensely. We have stayed   |
| of 10   |   at this complex 2 other times and this one was   |
| (display|   the best. ... We loved walking over the marsh    |
|  serif) |   to the beach!"   (text-quote italic, hanging ") |
| ------- |   Teresa K., October 2025                           |
| Clean-  |   Verified guest via Vrbo/Expedia, 10 of 10        |
| liness  | ---------------  ---------------  ---------------  |
| 9.4     | "We loved this   "Clean, super    "Unit was        |
| Location|  condo..."        cute place..."   updated..."     |
| 9.6     | Wendy D.,        Elizabeth,       Susan P.,        |
| 10      | June 2026, 10/10 April 2026 10/10 April 2026 8/10  |
| reviews |                                                    |
```
- Rating column: `9.2` in `text-display` serif, "of 10" `text-label`, then a mini `<dl>`: Cleanliness 9.4, Location 9.6, "From 10 reviews on Vrbo/Expedia".
- Exactly the 4 reviews in BRIEF.md, verbatim, with month/year and score. Susan's 8/10 is shown (honesty). Placeholder slot for Airbnb reviews exists in data but renders nothing until filled.
- Mobile: rating block as a horizontal ledger row, featured quote, then secondary quotes stacked with rules.

### 2.11 From the host (`copy.host`) `py-section`, paper

A letter, not a profile card.

```
| 1  2  3   | 4  5  6  7  8  9 | 10 11 12 |
| [portrait | ~~ text-prose ~~ |          |
|  4:5, if  | ~~ letter     ~~ |          |
|  supplied]| signature serif  |          |
| label     | italic: host name|          |
|           | Replies within   |          |
|           | TODO_OWNER hours |          |
|           | (text-small)     |          |
```
- Name, photo, bio, response time are `TODO_OWNER` config. If no portrait, the label alone occupies cols 1 to 3. No fake "Superhost" style claims.

### 2.12 Arrival (`copy.arrival`) `py-section`, `bg-pluff` band (`data-surface="dark"`), id `arrival`

Purpose: pre-empt the known pain points (gate, parking, door code, early arrival, warm bedrooms).

```
| 1  2  3  4  5      | 6 | 7  8  9  10 11 12                  |
| label "Arrival"    |   | 1  Before you travel               |
| 4:00 PM            |   |    Door code and directions by     |
| check-in           |   |    email before arrival ...        |
| ---------          |   | ---------------------------------- |
| 10:00 AM           |   | 2  At the gate                     |
| check-out          |   | ---------------------------------- |
| (serif text-h1,    |   | 3  Parking passes (2 vehicles,     |
|  on-dark)          |   |    unassigned lot)                 |
| note: early arrival|   | ---------------------------------- |
| requests, ask      |   | 4  Building 3, elevator or stairs  |
|                    |   | ---------------------------------- |
|                    |   | 5  Settling in: thermostat and fan |
|                    |   |    tips for cool bedrooms          |
```
- Numbered steps are a genuine sequence: numerals serif `text-h3` `on-dark-muted`, step title sans 500 `on-dark`, body `text-small on-dark-muted`.
- Times in serif `text-h1`.

### 2.13 Questions (`faq.ts`, first 5 flagged `featured`) `py-section-sm`, paper

```
| 1  2  3 | 4  5  6  7  8  9  10 11 12 |
| label   | FAQ accordion (8.16)       |
| "Before | ...                        |
| you     | [All questions] text link  |
| book"   |                            |
```

### 2.14 Reservations (`copy.bookingCta` + `copy.booking`) `py-section`, paper, id `reserve`

The full concierge ledger inline.

```
| 1  2  3  4  5  6  7 | 8 | 9  10 11 12              |
| label "Reservations"|   | [ Reservation ledger   ] |
| h2 (bookingCta)     |   | [ Arrive|Depart|Guests ] |
| lead                |   | [ quote table          ] |
| [ calendar, 2 months| . | [ Request these dates  ] |
|   always open here ]|   | [ no payment note      ] |
| legend, min-night   |   |                          |
| ---------------------------------------------------|
| Why book direct (3 ruled lines, text-small):        |
| "No platform service fee." "Reply from the host,    |
|  not a call center." "Same home, same house rules." |
```
- Calendar left (cols 1 to 7) is always expanded in this section; ledger right (cols 9 to 12), `lg:sticky lg:top-24`.
- Mobile: h2, lead, ledger fields open the sheet; calendar not inlined.

### 2.15 Footer (`copy.footer`): colophon, see design-system 8.17.

## 3. Booking funnel

### 3.1 Entry points

| Device | Entry | Behavior |
|---|---|---|
| Desktop | Cover CTA, masthead CTA | Scroll to `#reserve`, focus "Arrive" field |
| Desktop | Reservation bar (appears under masthead after cover) | Opens popover calendar anchored to bar; after dates, guests popover; then "Check availability" goes to `/book?...` |
| Desktop | `#reserve` section | Inline calendar + ledger; "Request these dates" goes to `/book?...` |
| Mobile | Sticky bottom bar, cover CTA, `#reserve` | Opens reservation sheet |

Desktop deliberately uses a docked reservation bar plus an inline reservation section (hotel convention) instead of an Airbnb-style floating right-column card, per owner direction.

### 3.2 Date selection flow

1. Calendar opens on the current month (or the month of `arrive` if set). Unavailable dates struck through. Phase 1 availability comes from `site.config.ts` blocked ranges; Phase 2 from iCal (same component, data source swapped).
2. First tap = arrival. Hint line: "Choose a departure date." Dates within the minimum-night window become not selectable with hint "N-night minimum...". Dates past the next unavailable night are not selectable (no range across bookings).
3. Second tap = departure. Range fills, nights count updates, quote calculates instantly (client-side from config, no network).
4. Tapping an earlier date than arrival resets arrival. "Clear dates" resets.
5. Guests: stepper; default 2 adults.
6. Quote updates live; URL params update (`replaceState`) so the state is shareable and survives refresh.

Edge states: no dates yet ("Add your dates for an estimated total"); rates not configured ("Rates for these dates are confirmed by the host"); dates beyond calendar horizon (12 months) not shown.

### 3.3 `/book` page

```
lg: | 1  2  3  4  5  6  7 | 8 | 9  10 11 12 |
    | h1 "Request to book"|   | Ledger summary (sticky): dates, guests,
    | intro line          |   | quote table, "Change dates" text button |
    | form                |   |             |
mobile: summary collapsed into a ledger row "Jun 12 to 15, 4 guests, est. $X  [Edit]" at top, form below.
```

Form fields (single column, `max-w-measure`), in order:

| # | Field | Type | Required | Validation / notes |
|---|---|---|---|---|
| 1 | Full name | text, `autocomplete="name"` | Yes | 2+ characters |
| 2 | Email | email, `autocomplete="email"` | Yes | Valid email |
| 3 | Phone | tel, `autocomplete="tel"` | Yes | 7+ digits. Helper: "For arrival-day questions only." |
| 4 | Adults | stepper | Yes | min 1 |
| 5 | Children (2 to 12) | stepper | No | adults + children max 6 |
| 6 | Infants (under 2) | stepper | No | per config |
| 7 | Estimated arrival time | select: "4 to 6 PM", "6 to 8 PM", "After 8 PM", "I would like to ask about early check-in", "Not sure yet" | No | Early option reveals helper about luggage and early check-in requests |
| 8 | Message to the host | textarea | No | max 1000 chars, counter |
| 9 | I have read and agree to the house rules | checkbox, link opens `/policies#house-rules` in a dialog | Yes | |
| 10 | I am 21 or older and will be on the reservation | checkbox | Yes | |
| hidden | arrive, depart, quote snapshot, source (utm/referrer) | hidden | | Server recalculates quote; never trusts client |
| hidden | Honeypot field `company` | text, visually hidden, `tabindex=-1` | | Spam |

- Steppers 4 to 6 are pre-filled from the ledger; repeated here so the form is self-contained.
- Submit: Primary lg "Send request". Under it: "No payment is taken now. You will hear from the host within TODO_OWNER hours." Validation on blur and submit, error summary on submit.
- On success: navigate to `/booking/success?ref=XXXX`.

### 3.4 `/booking/success`

- h1 "Request sent". Ledger summary of dates, guests, estimated total, reference number.
- "What happens next" ordered list: 1 Host checks the calendar and replies by email; 2 You receive an invoice to confirm; 3 Door code and full address arrive before your stay.
- Secondary: "Read arrival details" (`/#arrival`), "Browse the area guide". No upsells.

## 4. Trust and conversion devices

| Device | Placement | Rule |
|---|---|---|
| Rating summary 9.2 of 10, 10 reviews, cleanliness 9.4, location 9.6 | Cover particulars, mobile bar, testimony | Verified figures only, source named |
| Short-term rental permit 029008 | Particulars, footer, policies | Always visible |
| Book direct message | Reservations section, quote note | "No platform service fee." Savings figure only if config provides one |
| Response-time promise | Host letter, form note | `TODO_OWNER` value; hidden if unset |
| No charge now | Ledger, form, success | Plain line, no lock icons or "secure" badges |
| Honest trade-offs | Beach route, resort notes, amenities "Not provided", arrival | Treated as content, not fine print |
| Also on Airbnb/Vrbo | Footer | Links (from config) show the listing is real |
| Scarcity | Nowhere unless real | May show "Next available: Fri 12 Jun" computed from the calendar. No viewer counts, no countdowns |

## 5. Accessibility checklist (WCAG 2.1 AA)

- [ ] Skip link "Skip to content" first in tab order, targets `<main id="main">`.
- [ ] Landmarks: one `header`, `nav` (labelled), `main`, `footer`; each section an `aria-labelledby` region.
- [ ] Heading order: one h1 per page (cover name on home), h2 per section, no skipped levels.
- [ ] Contrast per design-system 3.1; `ink-faint` never for small readable text.
- [ ] Calendar: grid semantics, roving tabindex, full keyboard map (design-system 8.8), full-date `aria-label` with state, live region for hints and nights count, unavailable not conveyed by color alone (strike + label).
- [ ] Dialogs (sheet, lightbox, drawer, house-rules): `role="dialog" aria-modal="true"`, labelled, focus moved in, trapped, Esc closes, focus returned to trigger, background `inert`, scroll locked.
- [ ] Popover calendar: `aria-expanded` on trigger, closes on Esc and outside click.
- [ ] Forms: visible labels, `autocomplete` tokens, `aria-describedby` for helper/error, `aria-invalid`, error summary with links, no placeholder-as-label, required announced.
- [ ] Steppers: buttons labelled "Add adult", "Remove adult"; live count.
- [ ] Targets 44x44 minimum; visible 2px focus on every interactive element.
- [ ] Images: meaningful alt from manifest (what and where, honest), decorative none; placeholders `role="img"` with "Photograph to come" label.
- [ ] Map iframe has `title`; facade button is keyboard reachable; distances also available as text.
- [ ] Reduced motion respected; no autoplay; no content flashes.
- [ ] Text resizes to 200% without loss; layout works at 320px width and 400% zoom (reflow).
- [ ] `lang="en"`; prices include currency in accessible text.

## 6. Performance budget

| Metric | Budget (Moto G Power class, 4G) |
|---|---|
| LCP | < 2.5s (target 1.8s); LCP element is the cover photo |
| CLS | < 0.05 |
| INP | < 200ms |
| First-load JS (home) | < 130KB gzip |
| Cover image transfer | < 180KB at 1080w AVIF/WebP |
| Fonts | 2 families, latin subset, variable files only, < 120KB total |

Implementation rules:
- `next/image` everywhere; cover with `priority`, `fetchPriority="high"`, explicit `sizes` (design-system 9.2), `quality={70}`; formats `["image/avif","image/webp"]` in `next.config.ts`; blur placeholders only for owner photos (static import or manifest `blurDataURL`).
- Fonts via `next/font` with `display: "swap"` (self-hosted, preloaded automatically). No other font sources.
- Home is a Server Component. Client components only: calendar/ledger, steppers, masthead scroll state, mobile bar and sheet, lightbox, FAQ (if not `<details>`), map facade.
- Lightbox and calendar sheet code `next/dynamic` imported on first interaction. Map iframe loads only on click.
- Below-fold images `loading="lazy"` (default). No third-party scripts on load; analytics (if any) deferred.
- Static generation for all routes except form submission handler.
