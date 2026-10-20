# Prince of Tides: Design System

Owner direction (overrides earlier briefs): quiet luxury in the spirit of Aesop. Editorial, print-inspired, restrained. Mineral paper, ink, marsh-toned neutrals, one quiet accent. Must read as the work of an experienced human design team, never as an AI template.

Source of truth for tokens: `src/styles/tokens.css`. Page compositions: `docs/ux-spec.md`.

> **Luxury pass (current).** The owner asked for "a more luxurious vibe". The rationale and before/after
> notes are in `docs/luxury-pass.md`. Where this section conflicts with older rules further down, this
> section wins:
>
> - **Small capitals** (`smallcaps` utility; `apparatus` is an alias): sans 11px, uppercase, tracking 0.16em,
>   weight 500, tabular lining figures. Used for running heads, labels, table heads, plate numbers, nav, buttons
>   and quiet text actions. Never above every heading, never for prose, never for guest names or review text.
> - **Display italic**: the connective words of a display line ("Prince *of* Tides", "0.8 *to* 1.1") and whole
>   quotations, standfirst asides and captions. Still never for single-word emphasis in running text.
> - **Folios**: section numerals are brass italic roman numerals at cap height (`SectionTitle`); sub-route
>   contents lists and plate numbers use the same roman numerals.
> - **Running head** (`RunningHead`): small capitals between two hairlines, opening the cover, every sub-route
>   (`PageHeader`), the plates and the reservations section.
> - **Typography in code**: kerning, `liga` and `calt` on globally; old-style figures in serif prose, tabular
>   lining figures in data; typographic apostrophes and quotes via `smart()` in `components/site/text.ts`
>   (never applied to guest reviews, which stay verbatim).
> - **Wordmark lockup**: the monogram (italic P over roman T in a hairline ring, `Monogram.tsx`) beside the name
>   with "of" in italic and "Hilton Head Island" in small capitals. The masthead sits on night over the home
>   cover and turns to paper on scroll (or when the drawer opens).
> - **Buttons**: `btn` + `btn-primary` (evergreen fill), `btn-secondary` (ink hairline, fills ink on hover) or
>   `btn-on-dark`; labels in small capitals; text actions use `link-caps` (small capitals with a drawn hairline).
> - **Fields**: ledger lines. No box: one `rule-strong` underline, entry set in the serif at 19px, label in
>   small capitals, "(optional)" in serif italic. Focus firms the line to a 2px ink rule. The textarea keeps a
>   hairline box. Checkbox: 20px square hairline, evergreen when checked.
> - **Guest stepper**: a segmented hairline control (minus, the count in serif figures, plus), 44px cells.
>   The circular buttons are retired.
> - **Reservation card**: `sheet`, a 2px ink top rule over an inset 1px `rule` frame, small-capital labels,
>   serif values and a light serif total.
> - **Focus**: 2px outline, offset 4px, ink (on night, `on-dark`).
> - **Motion**: the cover name settles (opacity and a 14px rise, 1.1s) and its plate fades (1.4s); photographs
>   in the plates and gallery fade in once (1.6s) as they enter the viewport (`RevealObserver`, `data-reveal`).
>   Text never fades. Everything is off under `prefers-reduced-motion`, and nothing is hidden without script.
> - **Photographs**: always shown whole at their native ratio (all current owner photographs are 3:2), with
>   nothing laid over them. No crops to 4:5 or 21:9 for composition; rhythm comes from width and placement.
> - **Night passages**: cover, plates, arrival and footer on `pluff`; the plates passage numbers photographs
>   as Plates I to VI with monograph captions.

---

## 1. Audience and personality

| | |
|---|---|
| Primary guest | Couples and small families (2 to 6), 30 to 65, returning Hilton Head visitors and first-timers who found the unit on Airbnb/Vrbo and are checking whether to book direct |
| What they need | Confidence: what is real, what is included, what the walk to the beach is like, what it costs, how arrival works |
| Personality | Calm, exact, generous with information, quietly confident. A well-run small inn's printed guest book, not a resort brochure |
| Voice | Plain, specific, sentence case. Numbers over adjectives ("0.8 mi by boardwalk" not "steps to paradise") |

## 2. Art direction

**Concept: "The guest ledger."** The site is set like a small institutional publication about one residence: a cover (hero), a standfirst, particulars, an illustrated description, an index of what is provided, a directory of the resort, a route to the beach, testimony, a letter from the host, arrival instructions, and a reservation ledger. Structure comes from typography, hairline rules and a strict 12-column grid, not from boxes, shadows or color.

Principles:
1. **Type does the work.** A serif with optical sizes for headings, reading text and quotations; a quiet grotesk for information, labels and controls. Hierarchy from size, weight, case of content and position, never from color.
2. **Hairlines, not containers.** Content is separated by 1px rules (`rule` or `ink`). Boxes exist only where a boundary is functional (inputs, the reservation ledger, dialogs).
3. **Asymmetry on a strict grid.** Most sections hang off a left margin-label column (cols 1 to 3) with content in cols 4 to 12, like report sidenotes. Photos break that rhythm deliberately.
4. **Varied density.** Opening sections breathe (`section-lg`); reference sections (amenities, resort directory, FAQ) are dense (`section-sm`, small type, multiple columns). No two consecutive sections share a composition.
5. **Honesty is a design feature.** Distances, seasonal caveats and what is not provided are typeset as calmly and visibly as the highlights.
6. **One memorable thing:** the cover (hero) composition, with the name set large in Newsreader beside a tall, quiet photograph and a four-figure particulars line. Everything else stays disciplined.

### 2.1 Banned patterns (reject in review)

| Banned | Use instead |
|---|---|
| Purple/blue gradients, pastel glows, glassmorphism, backdrop blur, floating blobs, noise/grain overlays | Flat paper, stone and pluff fields |
| Gradient text, colored single-word emphasis in headlines, italic emphasis | Plain set headline; italics for whole quotations, captions and the connective of a display line |
| Large rounded rectangles; any radius above 1px except stepper circles | Square corners (`rounded-none`) |
| Pill badges, chips, tag clouds | Text labels, or a 1px square-bordered label (rare) |
| Repetitive card grids (three feature cards, review cards, amenity tiles with icons) | Lists, tables, definition lists, pull quotes, spreads |
| Centered hero + three features + testimonials + generic CTA | The section sequence in `ux-spec.md` |
| Drop shadows on cards/images/buttons | None. One overlay shadow only for dialogs, popovers and the mobile sheet |
| Emojis, decorative icons, icon-per-amenity, illustrated spot graphics | Typographic lists. Lucide only for functional controls (section 6) |
| ALL-CAPS tracked eyebrows above every heading | Small capitals only in running heads, labels and apparatus (see Luxury pass) |
| Middle-dot meta strings ("A · B · C"), "→" appended to links, em dashes anywhere | Line breaks, commas, a ledger row, or a real arrow icon only where it is a control |
| Startup language: "Unlock", "Seamlessly", "Reimagine", "Elevate your", "Experience the magic" | Plain, specific statements |
| Invented stats, logos, badges ("Superhost", "Top 1%"), fake urgency ("3 people are looking") | Only verified facts from BRIEF.md and owner config |
| Fade-and-slide-up on every section, hover-lift on every card, parallax | The cover reveal and slow photograph fades (Luxury pass) |
| Stock photos implying they show the unit, or crops implying an ocean view | Owner photos; stone placeholders with a caption |
| Uniform section spacing and identical heading treatments throughout | Three densities, compositions per section |
| Tinted near-black `#111`/`#0B0B0B`, monospace data labels | `ink` `#22241F`; tabular figures in the grotesk |

## 3. Color

Single light theme with deliberate night passages. Tailwind default colors are disabled in `tokens.css` (`--color-*: initial`); only these exist (`bg-paper`, `text-ink`, `border-rule`, etc.). Token names are kept from the first system; values changed in the luxury pass (`docs/luxury-pass.md`).

| Token | Hex | Role |
|---|---|---|
| `paper` | `#F1ECE2` | Page background. Warm bone paper |
| `sheet` | `#F8F5EE` | Reservation card, dialogs, popovers, the desktop reservation bar |
| `stone` | `#E6DFD1` | The resort band, photo placeholders, hover fills |
| `pluff` | `#1A201C` | Marsh-night. The full-bleed night passages: cover, plates, arrival, footer, area-guide seasons; lightbox backdrop |
| `ink` | `#1E201B` | All headings and body text, secondary button border, focus ring |
| `ink-muted` | `#5C584E` | Captions, helper text, labels, metadata |
| `ink-faint` | `#78736A` | Disabled controls and large numerals only. Not for small readable text |
| `on-dark` | `#EDE7DA` | Text on night |
| `on-dark-muted` | `#ABA696` | Secondary text on night |
| `marsh` | `#2E3B30` | Deep evergreen. Primary button fill, selected dates, checked boxes |
| `marsh-hover` | `#1F2921` | Primary hover/pressed |
| `marsh-soft` | `#E0DECB` | Calendar in-range days, text selection |
| `brass` | `#7A5C34` | **The one accent.** Section folios, plate numbers, the monogram, the current-page mark, the italic "to" in the beach figure |
| `brass-light` | `#C6A774` | The same accent on night |
| `rule` | `#D3CCBD` | Hairlines between content (decorative, not a control boundary) |
| `rule-strong` | `#857E70` | Field underlines, stepper and checkbox borders, calendar outlines (meets 3:1 for UI) |
| `success` | `#3D5E3A` | Request sent, field valid (text only) |
| `warning` | `#7A5410` | Minimum-night notices, seasonal caveats |
| `danger` | `#9A3B2C` | Errors |
| `focus` | `#1E201B` | 2px focus outline, offset 4px. On night, `on-dark` |

Rhythm of the home page: night (cover) / paper / paper / night (plates) / paper / stone (resort) / paper / paper / night (arrival) / paper (reservations) / night (footer). Brass stays under 1% of any screen; it is never a fill, never a heading color and never a button.

### 3.1 Contrast (WCAG 2.1, computed with the relative luminance formula)

| Foreground | Background | Ratio | Use | Pass |
|---|---|---|---|---|
| ink | paper | 13.96 | body, headings | AAA |
| ink | sheet | 15.10 | form text, ledger | AAA |
| ink | stone | 12.40 | band text | AAA |
| ink | marsh-soft | 12.12 | in-range day numerals | AAA |
| ink-muted | paper | 6.02 | captions, labels | AA |
| ink-muted | sheet | 6.51 | helper text | AA |
| ink-muted | stone | 5.35 | captions on band | AA |
| ink-faint | paper / sheet | 4.00 / 4.33 | disabled, large numerals only | AA large |
| sheet | marsh | 10.81 | primary button label | AAA |
| sheet | marsh-hover | 13.80 | primary hover | AAA |
| brass | paper | 5.23 | folios, plate numbers (small caps) | AA |
| brass | sheet / stone | 5.66 / 4.65 | ledger mark, resort band | AA |
| brass-light | pluff | 7.24 | plate numbers on night | AAA |
| on-dark | pluff | 13.45 | night text | AAA |
| on-dark-muted | pluff | 6.81 | night secondary | AA |
| on-dark | marsh | 9.55 | | AAA |
| danger | paper / sheet | 5.88 / 6.35 | errors | AA |
| success | sheet | 6.74 | confirmations | AA |
| warning | sheet | 6.22 | notices | AA |
| rule-strong | paper / sheet | 3.42 / 3.70 | field underlines (non-text 3:1) | AA |
| rule | paper | 1.36 | decorative hairlines only | n/a |

Rules: never convey state by color alone (unavailable dates also get a strike; errors also get text). Placeholder text uses `ink-muted` italic. Text is never animated below full opacity (only photographs fade), so contrast holds at every moment.

## 4. Typography

Luxury pass: families unchanged after reviewing alternatives (Cormorant, Bodoni Moda, Playfair, Fraunces); see `docs/luxury-pass.md`. Display sizes were enlarged and tightened (display up to 184px at -0.042em; h1 up to 92px; h2 up to 62px) and a light weight is used for display and section titles.

### 4.1 Families

| Role | Family | Why |
|---|---|---|
| Serif: display, headings, reading text, quotations, prices total, wordmark | **Newsreader** (variable, `opsz` 6 to 72, wght 200 to 800, roman + italic) | Designed for editorial reading; optical sizes give a refined display cut at large sizes and a sturdy text cut at 18px. Literary, not "luxury-brand Didone" |
| Sans: UI, labels, lists, tables, forms, dense reference text | **Hanken Grotesk** (variable, wght 100 to 900) | Quiet, slightly humanist grotesk in the Swiss tradition; excellent tabular figures for prices and dates. Not Inter |

### 4.2 next/font setup (put in `src/app/layout.tsx`)

```tsx
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  variable: "--font-serif-family",
});

const sans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-family",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

`globals.css` must be exactly:

```css
@import "tailwindcss";
@import "../styles/tokens.css";
```

Utilities: `font-serif`, `font-sans` (default on body), `font-display` (alias of serif).

### 4.3 Scale

Fluid sizes are clamped between 360px and ~1280px viewports.

| Token / utility | Mobile | Desktop | Family, weight | Line height | Tracking | Use |
|---|---|---|---|---|---|---|
| `text-display` | 40px | 76px | serif 400 (opsz auto) | 1.04 | -0.02em | Hero name only |
| `text-h1` | 34px | 56px | serif 400 | 1.08 | -0.015em | Page titles on sub-routes |
| `text-h2` | 28px | 42px | serif 400 | 1.12 | -0.01em | Section headings |
| `text-h3` | 21px | 26px | serif 400 | 1.22 | 0 | Sub-heads, room names, FAQ questions |
| `text-quote` | 24px | 36px | serif 300 italic | 1.28 | -0.005em | Featured pull quote |
| `text-lead` | 19px | 22px | serif 400 | 1.5 | 0 | Standfirsts |
| `text-prose` | 18px | 18px | serif 400 | 1.62 | 0 | Reading paragraphs |
| `text-body` | 16px | 16px | sans 400 | 1.6 | 0 | UI copy, FAQ answers |
| `text-small` | 14px | 14px | sans 400 | 1.5 | 0 | Dense lists, tables, helper text |
| `text-label` | 13px | 13px | sans 500 | 1.35 | 0.01em | Margin labels, form labels, table heads |
| `text-caption` | 12px | 12px | sans 400 | 1.4 | 0.02em | Photo captions, legal lines |

Price figures in the ledger: sans 500 `text-body` with `tabular-nums`; the estimated total: serif 400 `text-h3`.

Rules:
- Measure: reading text max `max-w-measure` (36rem, about 68 characters at 18px serif). Never full-width paragraphs.
- Sentence case in headings and prose. Labels, buttons and nav are written in sentence case and set in small capitals by CSS (see Luxury pass).
- Italic only for full quotations, titles, and the host's signature. Never for single-word emphasis.
- Bold is not used in the serif. Sans uses 400 and 500 only (600 permitted for the ledger total label).
- Left aligned, ragged right. Centered text is permitted only in the lightbox counter and the success page confirmation line.
- Numerals: `tabular-nums lining-nums` in tables, ledger, calendar (base layer applies to `table` and `.tabular`).
- Hanging punctuation for pull quotes: opening quotation mark hangs into the margin (`text-indent: -0.42em`).

## 5. Layout system

### 5.1 Breakpoints (Tailwind defaults)

| Name | Min width | Grid |
|---|---|---|
| base | 0 | 4 columns, gutter `gutter` (20px at 360) |
| `sm` | 640px | 4 columns |
| `md` | 768px | 8 columns |
| `lg` | 1024px | 12 columns |
| `xl` | 1280px | 12 columns, max `max-w-page` 1280px |
| `2xl` | 1536px | 12 columns; full-bleed photos may extend to `max-w-bleed` 1600px |

Grid: `grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-x-col` inside `mx-auto max-w-page px-gutter`.

### 5.2 The margin-label column

```
lg+  | 1  2  3 | 4  5  6  7  8  9  10 11 12 |
     | label   | heading / content          |
     | (sticky | ..........................  |
     |  top-24)|                             |
```
- Label: `text-label text-ink-muted`, sentence case, cols 1 to 3, `lg:sticky lg:top-24` within its section.
- Each section opens with a full-width `rule-top` (1px `rule`) at the top of the grid, label and heading 24px below it.
- Below `lg`: label stacks above heading with 12px gap.

### 5.3 Spacing

Tailwind 4px base scale for components. Section padding uses three densities:

| Utility | Range | Sections |
|---|---|---|
| `py-section-lg` | 80 to 144px | Cover, standfirst, beach route, testimony |
| `py-section` | 56 to 96px | The space, resort, host letter, arrival, reservations |
| `py-section-sm` | 40 to 56px | Contact sheet, amenities index, location, FAQ |

Internal rhythm: label/heading to body 24px; paragraph spacing 1em (no extra margins); list rows 12px vertical padding with hairline; photo to caption 8px.

### 5.4 Radii, rules, shadow

| Token | Value | Only for |
|---|---|---|
| `rounded-none` | 0 | Everything by default |
| `rounded-hair` | 1px | Checkbox boxes |
| `rounded-round` | 9999px | Guest stepper +/- buttons, radio dots |
| `shadow-overlay` | one soft shadow | Popover calendar, dialogs, mobile sheet. Nothing else |
| `rule-top` / `border-rule` | 1px `#C6C8BC` | Section openings, list rows |
| `rule-top-ink` / `border-ink` | 1px `#22241F` | Table heads, ledger total, emphasis rules |

## 6. Iconography

Typographic first. Lucide (`lucide-react`) only for functional controls, `strokeWidth={1.25}`, 18px (20px in lightbox), `aria-hidden` with a text label or `aria-label` on the button.

Allowed: `ChevronLeft`, `ChevronRight` (calendar months, lightbox), `X` (close), `Plus`, `Minus` (stepper, FAQ), `Menu` (mobile masthead), `ArrowUpRight` (external links only, 14px), `Check` (checkbox tick), `Star` is **not** used (ratings are numerals). No amenity icons.

## 7. Motion

One orchestrated moment, everything else answers user action.

| Moment | Spec |
|---|---|
| Cover reveal (on first load) | Hero photo fades opacity 0 to 1 over `duration-slow` 420ms `ease-quiet` once decoded; name and particulars fade in 80ms after. No translate. Skipped under reduced motion |
| Masthead on scroll | Bottom hairline and `bg-paper` opacity transition 220ms; height 72 to 56px |
| Calendar popover / month change | Opacity 0 to 1, 120ms; months crossfade, no sliding |
| Mobile sheet | translateY 100% to 0, 360ms `ease-sheet`; backdrop pluff/40 fade 220ms |
| FAQ accordion | Height via `grid-template-rows: 0fr` to `1fr`, 220ms; plus becomes minus |
| Lightbox | Crossfade 220ms between images |
| Buttons, links | Color only, 120ms. No scale, no lift |

`prefers-reduced-motion: reduce` collapses all durations to near-zero (base layer) and disables smooth scroll. Never autoplay carousels or video.

## 8. Components

All interactive targets min 44x44px (WCAG 2.5.5 target). All components square-cornered unless stated.

### 8.1 Button

| Variant | Rest | Hover / pressed | Use |
|---|---|---|---|
| Primary | `bg-marsh text-sheet`, no border | `bg-marsh-hover` | One per view: "Check availability", "Request these dates", "Send request" |
| Secondary | transparent, 1px `ink` border, `text-ink` | `bg-ink text-paper` | "View all photographs", "Read the house rules" |
| Text | `text-ink` underline (1px, `rule-strong`, offset .22em) | underline `ink` | Inline actions, "Change dates", "Clear" |
| On dark | 1px `on-dark` border, `text-on-dark` | `bg-on-dark text-pluff` | Inside pluff band |

| Size | Height | Padding x | Type |
|---|---|---|---|
| sm | 40px (hit area padded to 44) | 16px | `text-small` sans 500 |
| md (default) | 48px | 24px | `text-body` sans 500, tracking 0.01em |
| lg | 56px | 32px | `text-body` sans 500 |

States: focus-visible 2px ink outline offset 3px; disabled `bg-stone text-ink-faint cursor-not-allowed` plus `aria-disabled`; loading keeps width, label changes ("Sending request"), `aria-busy="true"`, no spinner. Full width on mobile inside the ledger and sheet. No icons in buttons except the external-link arrow.

### 8.2 Label (replaces Badge)

Sans `text-caption` 500, `ink-muted`, 1px `rule-strong` border, 2px 6px padding, square. Allowed values: "Seasonal", "Year round", "Shared", "Optional". Never decorative, never colored. Max one per row.

### 8.3 Containers (replaces Card)

There is no generic card. Allowed bordered containers:
- Reservation ledger: `bg-sheet border border-rule-strong`, 24px padding (32 desktop).
- Dialog/popover: `bg-sheet shadow-overlay`, no border.
Everything else is grouped by rules and whitespace.

### 8.4 Section header (margin label + heading + lead)

```
rule-top (1px, full grid width)
[24px]
cols 1-3: label (text-label, ink-muted)   cols 4-11: h2 (text-h2)
                                           [16px]
                                           cols 4-10: lead (text-lead, serif, ink)
```
- Lead is optional; set in `ink`, max 2 sentences.
- Some sections omit the h2 and let the label plus content speak (amenities index, FAQ teaser) to vary hierarchy.

### 8.5 Masthead (nav) (round 3: private-club IA)

Source of truth: `src/components/site/nav.ts` (`NAV`, `RESERVE`, `SECTION_OWNER`, `MORE`).

- **Utility line** (lg+, above the main row, folds away after 24px of scroll and becomes inert): small capitals in muted ink, "Hilton Head Resort, mid-island · Reservations by request · Check-in 4 PM, check-out 10 AM" on the left; the secondary pages (Photographs, Area guide, Questions) on the right, `aria-current="page"` with a brass underline.
- **Main row**: wordmark left; five plain section links in the order a guest asks, each with its chapter numeral in brass italic (the same numeral the section carries on the page):
  I The Residence `/#residence`, II The Rooms `/#rooms`, III Privileges `/#privileges`, IV The Island `/#island`, V Rates `/#rates`.
  Current section (home only): the label gets a 1px brass underline 9px below the baseline and `aria-current="location"`; `SECTION_OWNER` maps sub-sections to their item (amenities to Rooms, beach to Privileges, day and seasons to Island).
- **Reserve**: a separate outline button, "Reserve", to `/reserve`; hidden on `/reserve` and `/book`. It is the only action in the masthead.
- **Mobile drawer**: the same five items, numbered, each with a one-line gloss ("Who sleeps where, room by room"), then a full-width primary "Reserve", the note "Reservations by request", then the secondary pages (Photographs, Area guide, Questions, Policies) in small capitals. Focus trapped, Esc closes, scroll locked, page inert, focus returns to Menu.
- On the home cover the masthead sits on night (`bg-pluff`), and returns to paper on scroll or when the drawer is open.
- Skip link "Skip to content" is the first focusable element.

### 8.6 Sticky mobile reservation bar (below lg)

- Fixed bottom, `bg-sheet`, 1px `rule-strong` top border, height 64px + `env(safe-area-inset-bottom)`, no shadow.
- Appears when the cover CTA leaves the viewport; hides while `#reserve`, `/book` form or footer are visible.
- Left block (sans): no dates: line 1 `text-small` 500 "Add dates for a quote", line 2 `text-caption ink-muted` "9.2 of 10 from 10 Vrbo reviews". With dates: line 1 "Jun 12 to 15, 3 nights", line 2 "Estimated total $X" (tabular).
- Right: Primary sm button "Check availability" or, with dates, "Request these dates". Opens the bottom sheet (section 8.7).

### 8.7 Reservation ledger and sheet

The booking widget is a concierge ledger: labelled rows, hairlines, right-aligned figures.

```
+--------------------------------------------------+  bg-sheet, 1px rule-strong
| Reservation                      text-label muted |
| Prince of Tides, Hilton Head Resort   serif h3    |
|--------------------------------------------------|  rule
| Arrive        | Depart        | Guests            |  3 cells, each a button
| Fri 12 Jun    | Mon 15 Jun    | 4 guests          |  label 13px muted / value 16px ink
|--------------------------------------------------|
| [ calendar opens inline below on desktop        ] |
|--------------------------------------------------|
| Quote breakdown (section 8.10)                    |
|--------------------------------------------------|
| [ Request these dates            (primary, full)] |
| No payment is taken now. The host confirms        |
| availability and sends an invoice.  caption muted |
+--------------------------------------------------+
```
Mobile sheet: full-height minus 24px top, `bg-sheet`, square corners, 1px `rule-strong` top, `shadow-overlay`, grab line 32x3px `rule-strong` centered, title row with "Close" text button. Steps in one scroll: dates (single-month vertical scroller of 12 months), guests, quote, primary button pinned to the sheet bottom. `role="dialog" aria-modal="true"`, focus moves to the sheet heading, Esc and swipe-down close.

### 8.8 Date range calendar

- Desktop: two months side by side in the popover/ledger; mobile: one column, months stacked, scrollable, current month first.
- Built as `role="grid"` per month (table semantics), week starts Sunday (US). Month heading serif `text-h3` 400 left aligned; prev/next chevron buttons 44px, top right, `aria-label="Previous month"`.
- Weekday heads: sans `text-caption` `ink-muted`, two letters ("Su", "Mo"), `abbr` full name.
- Day cell: 44px min (48px desktop), square, sans `text-small` tabular, centered numeral (exception to left alignment).

| State | Visual | ARIA |
|---|---|---|
| Available | `ink` numeral, transparent | `aria-label="Friday, June 12, 2026, available"` |
| Hover / keyboard focus | 1px inset `ink` outline; focus adds 2px outline offset 1px | roving `tabindex` |
| Unavailable (booked/blocked/past) | `ink-faint` numeral with 1px diagonal strike line (`linear-gradient` 1px `ink-faint`), not clickable | `aria-disabled="true"`, label suffix "unavailable" |
| Departure-only (first booked night after free run) | `ink` numeral, strike hidden, selectable only as departure | label suffix "available for departure only" |
| Today | numeral underlined 1px `ink`, 3px offset | label prefix "Today," |
| Selected arrival / departure | `bg-marsh text-sheet` | `aria-selected="true"`, suffix "arrival date selected" |
| In range | `bg-marsh-soft text-ink` | `aria-selected="true"` |
| Below minimum nights (after arrival chosen) | `ink-faint` numeral, no strike, not selectable | suffix "below the N-night minimum" |
| Min-night hint | Line under the grid, `text-small text-warning`: "N-night minimum. Choose a departure on or after Mon 15 Jun." Announced via `aria-live="polite"` | |

- Legend under the grid (text-caption, muted): small swatches with words "Selected", "Your stay", "Unavailable".
- Footer row: "Clear dates" text button left; "N nights" summary right.
- Keyboard: arrows move by day/week; Home/End start/end of week; PageUp/PageDown previous/next month; Shift+PageUp/PageDown previous/next year; Enter/Space selects; Esc closes popover and returns focus to the field.

### 8.9 Guest stepper

Rows separated by hairlines, `grid-cols-[1fr_auto]`:
- Left: "Adults" sans 500 + "Ages 13 and up" `text-small muted`; "Children" "Ages 2 to 12"; "Infants" "Under 2. A travel crib is provided."
- Right: `-` circle button 40px (44 hit), 1px `rule-strong`, `rounded-round`; count `w-8 text-center tabular`; `+` circle.
- Limits from config: adults min 1, adults + children max 6; infants max and whether infants count toward 6 are `TODO_OWNER` config. Disabled buttons `ink-faint` border and icon, `aria-disabled`.
- Count changes announced: `aria-live="polite"` "4 guests".

### 8.10 Quote breakdown (ledger table)

Semantic `<table>`, caption visually hidden "Estimated price for your dates".

```
$X x 3 nights ............................. $X   (button "Show nightly rates" expands per-night rows)
Cleaning fee .............................. $X
Lodging taxes (estimated) ................. $X
------------------------------------------- 1px ink rule
Estimated total              (sans 600)  $X,XXX   (serif text-h3 tabular)
```
- Rows: `text-small`, label left `ink`, figure right `tabular-nums`, 10px vertical padding, 1px `rule` between rows (no dot leaders in code; leaders shown above for reading).
- Below: `text-caption muted`: "Refundable security deposit of $X is held separately." (only if configured) and "Booking direct means no platform service fee." If config supplies a comparable platform fee percentage, add one row in `success` text: "Platform service fee avoided  -$X"; otherwise text only, never an invented number.
- Missing rates (owner placeholders not filled): show "Rates for these dates are confirmed by the host" instead of figures; button still works.

### 8.11 Form fields

- Label above field, `text-label` `ink` 500. Optional fields append "(optional)" in `ink-muted`; required fields are unmarked by default and the form intro says "All fields are required unless marked optional."
- Input/select/textarea: `bg-sheet`, 1px `rule-strong`, square, 48px height (textarea min 120px), padding 12px 14px, `text-body`. Focus: 2px `ink` outline offset 0 (replaces border emphasis).
- Helper: below, 6px gap, `text-small ink-muted`, linked via `aria-describedby`.
- Error: border 1px `danger` plus message below in `text-small text-danger` beginning with the field name ("Email: enter an address like name@example.com"). `aria-invalid="true"`. On submit, an error summary at form top (`role="alert"`, list of links to fields), focus moved to it.
- Checkbox: 20px square, 1px `rule-strong`, `rounded-hair`, checked `bg-marsh` with `Check` icon `text-sheet`; label to the right, `text-body`, entire row clickable, 44px min height.
- Select: native `<select>` styled, chevron via background SVG in `ink`.

### 8.12 Photo gallery and lightbox

- Home "contact sheet" and `/gallery` compositions in ux-spec. Images square corners, no borders, no hover zoom.
- Caption under each image: `text-caption ink-muted`, starts with frame number in tabular figures then description ("07  Primary bedroom, king bed and ensuite").
- Each image is a `<button>` opening the lightbox at that index.
- Lightbox: `role="dialog" aria-modal`, `bg-pluff` full screen; image `object-contain` max 92vh/92vw; bottom bar `text-small on-dark-muted`: caption left, "7 of 24" right; "Close" text button with `X` top right; prev/next 48px buttons at mid-height edges. Keys: Left/Right, Home/End, Esc. Swipe on touch. Focus trapped, returns to the triggering thumbnail. Preload adjacent images only.

### 8.13 Pull quote and testimony (replaces review card)

- Featured: serif `text-quote` 300 italic, cols 3 to 11, hanging opening quote mark. Attribution beneath, sans `text-label`: "Teresa K., October 2025" new line "Verified guest via Vrbo/Expedia, rated 10 of 10".
- Secondary quotes: serif `text-prose` italic, in a 3-column row (lg) with 1px `rule` above each, no boxes, attribution as above.
- Ratings always numerals ("10 of 10"), never stars. Long quotes may use the original ellipses exactly as in BRIEF.md; never edit wording.

### 8.14 Amenity index (replaces amenity icon list)

- CSS columns: 1 (base), 2 (md), 3 (lg), `gap-col`, `break-inside-avoid` per group.
- Group heading: sans `text-label` 500 `ink`, 1px `ink` rule above.
- Items: `<ol>` continuing numbering across groups (index style, `counter-reset` once), numeral `text-caption ink-muted tabular` in a 2.5ch hanging column, item `text-small ink`, 6px row gap. No icons.
- Final group "Not provided" lists honest exclusions in `ink-muted` with no numerals.

### 8.15 Location block

- Map: click-to-load facade. Stone panel 4:3 (mobile) or 16:10 (lg) with caption "Map of Hilton Head Resort, mid-island" and secondary button "Show map". On click, load a Google Maps embed iframe (query "Hilton Head Resort, Hilton Head Island, SC", never the unit number), `loading="lazy"`, `title` set, CSS `filter: grayscale(1) contrast(0.95)`.
- Beside it a distance table (see ux-spec).

### 8.16 FAQ accordion

- `<details>`/`<summary>` or button with `aria-expanded` + `aria-controls`.
- Each item: 1px `rule` top; summary row min 56px, question serif `text-h3` at 20px (`text-[1.25rem]`), `Plus`/`Minus` 18px at right; answer `text-body`, `max-w-measure`, 0 to 24px bottom padding.
- Multiple can be open. Deep-linkable via `id` per question on `/faq`.

### 8.17 Footer (colophon)

- `bg-paper`, 1px `ink` rule top, `py-section-sm`.
- Grid lg: cols 1 to 4 wordmark (serif 28px) + "Hilton Head Resort, mid-island, Hilton Head Island, South Carolina"; cols 5 to 6 "The stay" links; cols 7 to 8 "Plan" links; cols 9 to 12 contact (TODO_OWNER email/phone), "Also listed on Airbnb and Vrbo" links with `ArrowUpRight`.
- Bottom row after 1px `rule`: `text-caption ink-muted`: "Town of Hilton Head Island Short-Term Rental Permit 029008", copyright, Policies link, and colophon line "Set in Newsreader and Hanken Grotesk."
- Luxury pass: the footer is a night passage (`pluff`) with the monogram, the name in light serif, brass small-capital column heads and serif links.

## 9. Imagery

### 9.1 Policy

- Only owner photographs of the actual unit, building, resort and beach path. No stock, no AI imagery, no illustrations.
- Never crop or caption to imply an ocean view or beachfront. Captions state what is shown and where.
- Fewer, better images. Home uses at most 12. Every image has a caption (print convention) and alt text.
- Grading: natural daylight, neutral to slightly cool white balance, no HDR, no heavy vignettes, no saturation boost. Straight verticals. Lens equivalent 24 to 35mm for rooms, 50mm+ for details.

### 9.2 Slots and aspect ratios

| Slot | Ratio | `sizes` | Notes |
|---|---|---|---|
| Cover (hero) | native (3:2) | `(min-width:1280px) 1060px, 82vw, 100vw` | `priority`, LCP element; first gallery photo until a cover photo exists |
| Standfirst detail | 3:4 | `(min-width:1024px) 25vw, 50vw` | Optional, beside particulars |
| The space spread | 3:2 and 4:5 pair | `(min-width:1024px) 40vw, 100vw` | Two images offset vertically |
| Contact sheet | 3:2 thumbnails, one 4:5 | `(min-width:1024px) 25vw, 50vw` | 5 frames |
| Highlights photo | 4:5 | `(min-width:1024px) 40vw, 100vw` | Indoor pool atrium |
| Beach route | 21:9 (mobile 4:3) | `100vw` | Marsh boardwalk |
| Host portrait | 4:5 | `200px` | Omitted entirely if not supplied |
| Gallery page | mixed 3:2, 4:5, 16:9 | per grid | |
| OG image | 1200x630 | | Cover crop with wordmark |

### 9.3 Placeholder treatment (until photos arrive)

`photo-placeholder` utility: flat `stone` field with an inset 1px `rule` frame. Inside, bottom-left, `text-caption ink-muted`: "Photograph to come: [slot description]". Same aspect ratio as the final slot so layout does not shift. Use `data-placeholder` so they are easy to find. No gradients, patterns or stock.

### 9.4 Owner shot list

Shoot on a clear morning (8 to 10 AM) and late afternoon; lights off unless needed, blinds open, beds made with plain white linens, counters cleared. Landscape and portrait of each.

| # | Subject | Orientation | Suggested file |
|---|---|---|---|
| 1 | Marsh boardwalk at golden hour, looking toward the beach (cover) | Portrait 4:5 and wide 21:9 | `cover-boardwalk.jpg`, `boardwalk-wide.jpg` |
| 2 | Living area, wide from entry, showing dining table | Landscape | `living-wide.jpg` |
| 3 | Living area, reverse angle toward bedrooms | Landscape | `living-reverse.jpg` |
| 4 | Kitchen, full run of appliances | Landscape and portrait | `kitchen.jpg` |
| 5 | Kitchen detail: coffee maker and blender styled simply | Portrait | `kitchen-detail.jpg` |
| 6 | Dining table set for four, natural light | Landscape | `dining.jpg` |
| 7 | Primary bedroom, king bed, from door | Landscape | `bedroom-king.jpg` |
| 8 | Primary ensuite bath | Portrait | `bath-ensuite.jpg` |
| 9 | Second bedroom showing queen and full beds | Landscape | `bedroom-two.jpg` |
| 10 | Hall bathroom | Portrait | `bath-hall.jpg` |
| 11 | Games and console shelf, detail | Portrait | `living-games.jpg` |
| 12 | Linen and towel detail on bed | Portrait | `linen-detail.jpg` |
| 13 | Indoor pool atrium near Building 3 | Portrait and landscape | `resort-indoor-pool.jpg` |
| 14 | Outdoor pool | Landscape | `resort-outdoor-pool.jpg` |
| 15 | Sauna/steam or fitness entry (if permitted) | Landscape | `resort-fitness.jpg` |
| 16 | Tennis/pickleball courts | Landscape | `resort-courts.jpg` |
| 17 | Beach-gear storage locker with chairs | Portrait | `beach-gear.jpg` |
| 18 | Boardwalk mid-marsh, spartina grass detail | Landscape | `marsh-detail.jpg` |
| 19 | The beach at the end of the boardwalk | Landscape | `beach.jpg` |
| 20 | Building 3 exterior and entry | Portrait | `building-3.jpg` |
| 21 | Guard gate (for arrival section) | Landscape | `arrival-gate.jpg` |
| 22 | Outdoor seating | Landscape | `outdoor-seating.jpg` |
| 23 | Host portrait, natural light, plain background (optional) | Portrait | `host.jpg` |

Export: JPEG or WebP, long edge 2400px, sRGB, under 1.5MB each; `next/image` handles resizing. Alt text drafts go in the photo manifest.

## 10. Round 3: the private-club layer

Direction (docs/round3-brief.md): the aesthetic and tone of a private resort, with zero false claims. No
membership, exclusivity, staff or services are implied. The devices below are the honest ones.

### 10.1 Home, in order
Cover (night) / I The residence / II The rooms (sleeping arrangements, common rooms) and Provisions /
III Guest privileges (stone band) and To the beach (with the EstateMap) / IV The island (night, credited
area photographs), A day unhurried, The island through the year / Guests, in their words / V Rates
(RateCard) / The arrival dossier (night) / Request a stay (inline form, links to `/reserve`).
Numerals are reserved for the five nav chapters, so the masthead and the page always agree; sub-sections
are unnumbered.

### 10.2 Components
- **Crest** (`Monogram.tsx`): the PT monogram inside a double ring with "PRINCE OF TIDES · HILTON HEAD
  ISLAND · SOUTH CAROLINA" set on the ring. Decorative, `aria-hidden`, shown only at 88px or more (cover,
  privileges card, footer). It carries no date or claim.
- **Sleeping arrangements** (`home/Rooms.tsx`, data `sleeping` in `copy.ts`): a running head with the
  summary, a three-figure line (bedrooms, beds, full baths), then one plate per bedroom: label, name,
  a bed schematic, and a ledger (Beds, Bath, In the room, Suits). The schematic draws standard mattress
  sizes to proportion from above, in a cream frame captioned "Beds to proportion. Not a floor plan."
  It never draws walls, doors or windows; the real layout is not known. Both schematics share one
  height so the king and the queen compare honestly. Common rooms follow with the owner photographs
  shown whole at 3:2 (watermark untouched).
- **Card of record** (`home/Privileges.tsx`): cream sheet in a double hairline frame, crest and "The
  privileges of the resort", the resort amenities grouped by use. Food and drink are listed as
  "purchased on site". The HOA footnote stays beside it.
- **Island plates** (`home/Island.tsx`): every area photograph goes through the content agent's
  `<CreditedPhoto>` with its caption and credit line, on night (`tone="dark"`). The running head says
  "Photographs of Hilton Head Island, credited. Not the residence." The residence and resort are never
  illustrated with area photographs.
- **Timetable** (`home/Day.tsx`): hours as display figures with small-capital meridiem; a suggestion,
  stated as such ("Nothing is arranged for you").
- **Almanac** (`home/Seasons.tsx`): four columns, the season in the display italic.
- **Rates** (`home/Rates.tsx`): the booking engineer's `<RateCard columns={2}>` on a cream sheet, then
  "Reserving here" (the four true book-direct reasons) and one primary action to `/reserve`.

### 10.3 Footer
Crest, name, place and tagline; "The stay" mirrors the five nav items in order; "Plan" lists Reserve by
request, The arrival dossier, Photographs, Area guide, Questions; the small print carries the permit,
Policies and Credits (`/credits`).

