# Creative director review

Reviewed the production build at 1440x900 and 390x844 (screenshots in `.screens/cd-before/`): `/`, `/book`,
`/gallery`, `/area`, `/faq`, `/policies`. The palette and the type families are good choices. The problem is
the composition: the site behaves like a well-behaved template that has been told the rules of quiet luxury,
then applied one safe pattern everywhere. These are the ten strongest tells, in order of damage.

## The ten tells

### 1. One section scaffold, used nine times
**Where:** home Residence, The Space, Provisions, Resort, Beach, Testimony, Arrival, Questions, Reservations;
FAQ categories; policies.
**Evidence:** every section opens with a full-width hairline, a grey roman numeral at h3 size, a grey 13px
label in columns 1 to 3 (sticky), and the heading in column 4. The left column is empty for most of each
section's height (Residence: 600px of blank sidenote column beside the particulars).
**Why it reads as AI:** a generator finds one acceptable pattern and repeats it; a designer composes each
section for its content. The numerals are decoration, not navigation.
**Fix:** retire the margin-label column on the home page. Give each section a structure that comes from its
content (a spread, a schedule, a directory, a route, a timetable, a ledger). Keep numbered titles, but set
the numeral inline in the heading as a small sans figure, so the system is visible without a dead column.

### 2. A page of grey boxes
**Where:** home cover (58vw x 84vh stone panel), Highlights (4:5), The Space (two), contact sheet (five),
Beach (21:9 full bleed), map facade; `/gallery` is 8,450px of 19 empty frames.
**Evidence:** about 40% of the home page's area is flat stone panels with a 12px caption in the corner.
**Why it reads as AI:** this is a wireframe shipped as a design. It also means the layout has never been
judged without the pictures it assumes.
**Fix:** design two states. With photographs: plates placed where they earn it. Without: no empty frames on
the home page at all; the cover becomes a typographic title page, rooms become a schedule, the contact sheet
becomes a short shot list. `/gallery` becomes a "list of plates": small, numbered, captioned plates in a
dense grid, reading as a deliberate catalogue in preparation rather than a broken page.

### 3. The hero is the stock split hero with a stats strip
**Where:** home cover.
**Evidence:** eyebrow, big name, tagline, grey subhead, a four-cell "2 / 2 / 6 / 9.2" stat strip, a filled
button plus a text link, image on the right. The name breaks "Prince of / Tides" at 76px.
**Why it reads as AI:** this is the default SaaS hero with the nouns swapped. The stat strip is the
"10k+ users" device in a linen jacket.
**Fix:** a title page. A running head between two rules (place, building), the name set very large on one
line in a light optical size, the tagline beneath, then a three-part base: the standfirst, a small
specification, and the single action. The reservation bar becomes the cover's bottom edge instead of a second
sticky toolbar.

### 4. Competing calls to action in five wordings
**Where:** sitewide.
**Evidence:** masthead "Check dates", docked bar "Request to book" 50px below it (two green buttons on
screen at once), hero "Check dates", ledger "Check availability" (rendered as a disabled-looking grey slab),
mobile bar "Check availability", `/book` titled "Request to book", footer "Send a request with your dates"
and "Request a stay".
**Why it reads as AI:** each component was written in isolation, so each invented its own verb.
**Fix:** one verb, "Request". Entry points say "Request a stay"; once dates are chosen, "Request these
dates"; the form submits with "Send request". The not-ready ledger button says "Choose dates" and looks like
an action, not a disabled control. One green button per view.

### 5. Exhaustive repetition instead of editing
**Where:** home.
**Evidence:** the beach distance appears seven times (hero subhead, particulars, Highlights, Beach copy,
beach steps, "not included", nearby-beaches table). Bedrooms/baths/sleeps appear in the stat strip,
particulars, Highlights and the rooms table. Highlights restates the Residence copy line for line. Each room
is described twice (prose, then a table of the same facts). Home: 13,500px desktop, 18,850px mobile.
**Why it reads as AI:** a model includes everything it was given in every format it knows. An editor
says each thing once, in the best place.
**Fix:** cut Highlights. Merge each room's prose and details into one schedule row. Merge the location
teaser into the beach section. Put the questions next to the reservation ledger, where they are asked.

### 6. Flat typographic hierarchy
**Where:** sitewide.
**Evidence:** h3 (26px), lead (22px), Highlights titles (21px) and prose (18px) are all Newsreader 400 at
nearly the same size and colour; labels, captions, numerals and secondary text are all 12 to 13px grey sans.
The display size appears once. Grey serif lead on grey paper (hero subhead) reads as disabled.
**Why it reads as AI:** the scale exists in tokens but is applied by habit, so there is no true contrast
between display, text and apparatus.
**Fix:** a real system. Display: Newsreader light at a large optical size, reserved for the name and two
figures. Section titles in two tiers (primary narrative sections larger, reference sections set small).
Text in ink, not grey. Apparatus (labels, figures, folios) in the sans at 12px medium in ink with tabular
figures; grey only for captions and notes. Old-style numerals in serif prose, lining in data.

### 7. Uniform, long gaps
**Where:** home, between nearly every section.
**Evidence:** 150 to 220px of empty paper repeatedly (after particulars, after Highlights, after Beach,
after Location, after Testimony), plus the sticky label columns leave vertical voids.
**Why it reads as AI:** "luxury" interpreted as whitespace; the brief explicitly bans it.
**Fix:** spacing by relationship. Tight inside a section, generous only at real changes of subject; dense
reference sections sit close to the narrative they support.

### 8. Generic widgets
**Where:** home Beach route, Provisions, Testimony.
**Evidence:** a three-stop timeline with circles and connector lines; 01 to 29 numbering on an amenity list
(precision that means nothing); a giant "9.2" stat beside the quote, repeating the hero's figure.
**Why it reads as AI:** stock UI devices chosen for looking designed, not for what they say.
**Fix:** delete the timeline (the five steps already are the route); drop the provision numbering; set
the rating as a single line of record under the testimony.

### 9. Everything is a hairline ledger
**Where:** particulars, Highlights, rooms table, resort directory, beaches, getting about, rating, house
rules, arrival notes.
**Evidence:** nine consecutive blocks of label/value rows with 1px rules and the same 14px type.
**Why it reads as AI:** one container idea substituted for composition; nothing is ever a spread, a
column of text or a single strong figure.
**Fix:** keep the ledger for true data (specification, distances, policies). Elsewhere use a spread, a
directory set in columns, a timetable, a schedule.

### 10. Mobile is the desktop, stacked
**Where:** home at 390px.
**Evidence:** first screen is the name and a full-width grey box; the tagline, the action and any fact are
below the fold. The fixed bottom bar repeats the masthead action. Sections stack in desktop order, so the
mobile reader scrolls past a grey panel, then a table, then another grey panel.
**Why it reads as AI:** responsive by collapse, not designed.
**Fix:** a mobile cover that holds the name, tagline, standfirst, three facts and the action within the
first screen; schedule rows that reflow into a readable rhythm (name, prose, details); directories that go
to one column with a compact rhythm; the bottom bar as the only persistent action on mobile.

## What changed

Implemented after this review; screenshots in `.screens/cd-after/` (home 13,533px to 8,908px desktop,
18,851px to 13,721px mobile; `/gallery` 8,450px to 2,376px). Tests: 42/42 unit, 4/4 e2e. No horizontal
scroll at 360px.

- **Type system** (`tokens.css`): display is now Newsreader light at the largest optical size, up to 160px,
  used only for the name; a new `figure` size for the two numbers that carry a section (0.8 to 1.1 mi,
  4:00 PM / 10:00 AM); h2 enlarged and tightened; new `apparatus` layer (12px sans, medium, tabular, ink)
  for running heads, table heads and labels; `oldstyle` figures in serif reading text. Grey is reserved
  for captions and notes.
- **Section titles** (`layout.tsx` `SectionTitle`): numbered titles keep the I to VII structure with the
  numeral set inline as a small serif figure. Two tiers: primary (narrative) and reference (Provisions,
  Testimony). The margin-label column is gone from the home page.
- **Cover**: a title page. Running head between rules, "Prince of Tides" on one line, tagline, then
  standfirst and the guest rating as a plain record. The reservation bar is the cover's lower edge on
  desktop (no longer a second sticky toolbar). With a cover photograph, a 21:9 plate appears; without one,
  nothing stands in. Mobile first screen holds name, tagline, standfirst, rating and the action.
- **Residence**: a spread (large opening paragraph, two short columns) beside a two-column specification
  sheet. Highlights section removed (it repeated this section).
- **Rooms**: one schedule (room, a sentence, particulars) replaces prose plus a duplicate table. Room photos
  appear under room names only when supplied.
- **Provisions**: six dense columns, meaningless 01 to 29 numbering removed, "Not included" in an ink frame.
- **Resort**: introduction left, two-column directory right, no orphan cells.
- **Beach**: the distance as the page's one large figure; the timeline widget removed; the location teaser
  merged in (beaches and drive times as two tables); the map is a one-line "Show map" until requested.
- **Testimony**: one quotation set large, then a row of record (rating, sub-scores, three reviews).
- **Arrival**: a timetable: the two times as figures, the four steps left to right, notes in three columns.
- **Reservations**: the questions moved beside the ledger and house rules.
- **Photographs without photographs**: no empty frames on the home page; `/gallery` is a list of plates
  (small numbered plates with captions).
- **CTAs**: one verb. "Request a stay" (masthead, cover, bar, mobile bar, gallery, FAQ), "Request these
  dates" once dates are chosen, "Send request" to submit; `/book` is titled "Request a stay". The masthead
  action is a secondary outline so there is one green button per view, and it is hidden on `/book`. The
  not-ready ledger button reads "Choose dates" as a real secondary action instead of a fake disabled slab.
- **/book**: form steps carry the same inline numerals (1 to 4).
- Removed: `Highlights.tsx`, `Location.tsx`, `Questions.tsx` (merged). `docs/brand-voice.md` still lists
  "Check dates" as a CTA example; the implemented rule is the one above.
