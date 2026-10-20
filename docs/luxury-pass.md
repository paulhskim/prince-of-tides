# Luxury pass

Owner request: "give the website a more luxurious vibe." Reviewed the production build at 1440x900 and
390x844 (`.screens/lux-before/`). The editorial "guest ledger" structure is sound and stays. What it lacks is
confidence, warmth and finish: it reads as a carefully kept document, not as arriving somewhere.

## What reads un-luxurious now

1. **No arrival.** The first screen is a grey page with a large name and a booking strip. There is no
   photograph, no change of light, nothing that says "you are somewhere". The best image on the site is
   2,000px down, in a contact sheet.
2. **One temperature throughout.** Cool mineral grey paper, grey stone, a green-grey dark band. Every surface
   sits within a narrow cool range, so the page has no rhythm of light and dark and feels clinical.
3. **Photographs treated as thumbnails.** Small, cropped to 4:5 and 3:4 in a collage, beside and below
   dense text. Luxury publications give a picture a page. (Cropping also cut into the frames; all six owner
   photographs are 3:2 and will now be shown whole, at their native ratio, with nothing laid over them.)
4. **Apparatus typography is plain.** Labels, running heads, table heads and buttons are all 12 to 13px
   sentence-case grotesk. There is no letterspaced, small-capital layer, which is what gives print its finish.
5. **The display setting has no voice.** "Prince of Tides" is set well but neutrally; nothing in the type
   is drawn by hand: no italic, no figure styles, no ligature or quote care.
6. **Controls read stock.** Circular +/- steppers, boxed grey inputs, a default square checkbox, a "Seasonal"
   bordered tag: each is a component-library default.
7. **The footer is an afterthought.** A thin rule and three link columns on the same paper; no colophon.
8. **Static.** Nothing settles into place; images pop in.

## What changes

- **Type.** Keep Newsreader (variable optical size, a genuinely good italic) and Hanken Grotesk (tabular
  figures). Considered alternatives (Cormorant, Bodoni Moda, Playfair, Fraunces): the first three are now the
  default "luxury template" faces, and Fraunces is too soft for this voice; Newsreader at opsz 72, light,
  tightly tracked, is the more distinctive choice. New: a display italic used for the connective words
  ("of", "to"), never for emphasis; a letterspaced small-capital layer (`smallcaps`) for running heads, plate
  numbers, labels, buttons and nav; old-style figures in prose, lining tabular figures in data; ligatures and
  kerning on; typographic quotes and apostrophes at render time.
- **Palette.** Warm bone paper (`#F1ECE2`), cream sheet, warm stone; a deep marsh-night (`#1A201C`) used for
  full-bleed passages (cover, plates, arrival, footer) to give the page a rhythm of light and dark; primary
  actions in deep evergreen; one restrained accent, a dark brass, used only for numerals, the monogram and
  the current-page mark. All pairs rechecked (design-system 3.1).
- **Composition.** Cover becomes a night passage: running head, monogram, the name very large, the tagline
  in italic, and the living-room photograph as Plate I, wide, straddling the change from night to paper.
  The contact sheet becomes "Plates": a dark full-bleed passage with the photographs large, whole and
  numbered, captioned like a monograph. Section numerals become brass italic folios. Fewer boxes: the
  "not included" frame and the reassurance panel become ruled passages.
- **Components.** A monogram lockup in the masthead (which sits on night over the cover, then on paper);
  small-cap navigation; refined buttons (small-cap labels, evergreen fill, ink outline, quiet text links
  with a drawn underline); underlined ledger-style inputs; a segmented hairline stepper replacing the
  circles; a finer checkbox and select; a 1px focus ring offset from the control, doubled to 2px for
  contrast where needed; a colophon footer on night.
- **Booking as concierge.** The reservation ledger is set as a card of record (cream sheet, ink rules,
  small-cap labels, serif figures) and the /book page opens like a reservation letter.
- **Motion.** Slow reveals (opacity and 12px translate over 900ms) for plates and section openings as they
  enter the viewport; images fade in once decoded. Off entirely under `prefers-reduced-motion`, and content
  is never hidden without JavaScript.
