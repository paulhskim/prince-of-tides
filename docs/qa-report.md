# Prince of Tides: QA and Accessibility Report

Date: 2026-10-19. Build: Next.js 15.5 production build (`npm run build`, `next start -p 3400`), Chromium from
`/opt/pw-browsers`, axe-core via `@axe-core/playwright`. Includes the 6 owner photographs added to
`public/photos` during the audit (living x4, dining, kitchen).

## What was tested

| Area | How |
|---|---|
| Functional | Crawl of every internal link and `#anchor` on all pages (all 200 / resolve). Masthead nav, mobile drawer, FAQ accordions, gallery lightbox, house-rules dialog, desktop reservation bar popover, mobile sticky bar and sheet. Booking: mouse and keyboard date selection, blocked nights and same-day turnover, seasonal minimum nights (3 and 5), 90-night maximum, booking window, guest limits (6 counted, infants not counted, max 2), ledger total vs `computeQuote`, submit to success, success with missing / malformed / unknown id, browser back after submit, `/book` query prefill with valid, stale and hostile params. |
| API security | `POST /api/inquiry` with tampered `quotedTotal`, past / reversed / impossible / over-90-night / beyond-window dates, 7 guests, 3 infants, float and negative counts, 5 MB body, HTML and script in name and message, honeypot, rate limit (6th request in an hour is 429), wrong content types, malformed JSON, arrays and null. `/api/checkout` and `/api/stripe/webhook` with flags off. `/api/calendar.ics` with and without token. `/api/booking/[id]` PII and path traversal. Email templates (plain text, logged in dev) for injected markup. |
| Accessibility | axe (WCAG 2.0/2.1 A and AA plus best practice) on all 8 pages at 1440 and 390, plus with the drawer, sheet, lightbox and house-rules dialog open. Keyboard-only request flow, visible focus on 40 consecutive tab stops, focus move / trap / return for every dialog, skip link, landmarks, one h1 per page, heading order, alt text, labelled placeholders, error summary (role="alert", focused) and `aria-invalid` / `aria-describedby`, reduced motion. |
| Responsive | No horizontal scroll on 7 pages at 360, 390, 768, 1024, 1440, 1920, plus a 1000 to 1440 sweep of the home arrival band; `/book` submit button not covered by fixed bars at 360x640; mobile sheet usable. |
| Content / facts | Rendered text and raw HTML of every page: permit 029008 in the footer everywhere, no unit number, no em dash, no `TODO_OWNER`, no ocean-view / beachfront / oceanfront claim about the unit, the 4 reviews verbatim with attribution. Source scan of `src`, `public`, `docs` for em dashes. |
| SEO | Title, description, canonical per indexable page (titles unique), `robots.txt`, `sitemap.xml`, JSON-LD parses, no rating or review markup, `noindex` on `/booking/success` and 404. |
| Photos | Gallery thumbnails and lightbox with real images (keyboard, Esc, focus return), manifest alt text used, all images through `next/image` with `sizes` and `srcset`, AVIF/WebP served, frames keep their ratio, CLS < 0.05 on home and gallery at 1440 and 390 while scrolling through lazy images. |
| Performance | Build output sizes (below). Lighthouse not run. |

## Findings

| # | Severity | Issue | Status |
|---|---|---|---|
| 1 | High | Mobile sheet "Request these dates" navigated to `/book` while the `<dialog>` was open; no `close` event fired, so `html { overflow: hidden }` stayed set and `/book` (and home after Back) could not scroll on phones. | Fixed: `Dialog` releases the scroll lock on unmount; the sheet closes before navigating. Regression test. |
| 2 | High | `/booking/success?id=...` server-rendered the guest's name and email for anyone holding the reference (references are short and guessable over time). | Fixed: server summary carries no PII (dates, party, estimate, status only); name and email come only from the submitting browser's sessionStorage. Regression test loads the URL in a fresh context. |
| 3 | Medium | `POST /api/inquiry` accepted `text/plain` bodies, so a cross-site page could post booking requests (which email a guest address of the attacker's choosing) without a CORS preflight. | Fixed: 415 unless `application/json`. Unit test. |
| 4 | Medium | No request size limit on `/api/inquiry` (a 5 MB body was parsed). | Fixed: 16 KB cap, 413. Unit test. |
| 5 | Medium | `/book` prefill accepted past, beyond-window and over-90-night dates and showed a quote for an impossible stay. | Fixed: `stayFromParams` drops such dates (guests were already clamped). Unit and e2e tests. |
| 6 | Medium | Guest acknowledgement email was signed "TODO_OWNER: host name" in production. | Fixed: production falls back to "Your host" (placeholder stays visible in dev). Unit test. |
| 7 | Serious (a11y) | Cover rating link had an `aria-label` that did not contain its visible text (WCAG 2.5.3). | Fixed: visible text is the name; "/" read as "of". axe test. |
| 8 | Moderate (a11y) | `/book` heading order jumped h1 to h3 (form sections were legends, calendar months h3). | Fixed: section legends contain h2 headings. axe test. |
| 9 | Low (a11y) | Guest-count error on `/book` was not referenced by its fieldset. | Fixed: `aria-describedby`. |
| 10 | Medium (responsive) | Home arrival band: "10:00 AM" set nowrap overflowed its column between 1024 and about 1100 px (page scrolled sideways by 4 px). | Fixed: size capped to the column with a container query unit. Sweep test. |
| 11 | Low | `/booking/success` with no or malformed id said "Request received". | Fixed: "No request to show." with a link to `/book`. e2e test. |
| 12 | Low | Name accepted control characters and links; phone accepted any text. Name is echoed in the guest email subject and body. | Fixed: name refuses control characters, URLs and angle brackets; phone allows digits, separators and extensions. Unit test. |
| 13 | Low | `/api/booking/[id]` looked up any string. It already returned no PII. | Fixed: ids must match `POT-NNNN-XXXX`, else 404. Unit test (traversal ids). |
| 14 | Low | 5 ESLint errors (`no-explicit-any` in `tests/seo/seo.test.ts`) and 2 unused disable directives. | Fixed. |
| 15 | Low (perf) | Images were not configured for AVIF per ux-spec section 6. | Fixed: `images.formats` AVIF then WebP. |
| 16 | Low (SEO) | The 404 page carries both Next's `noindex` and the layout's `index, follow` robots tags. Crawlers apply the most restrictive, so it is not indexed; `not-found.tsx` metadata is ignored by Next 15.5. | Open (accepted). |
| 17 | Low (security) | Rate limit is in process memory and keyed on `x-forwarded-for`. Fine on one server and on Vercel (which overwrites that header), but per instance only. | Open: move to Vercel KV / Upstash or the DB (already noted in booking-architecture.md). |
| 18 | Low (security) | The guest acknowledgement goes to whatever address is entered, so the form can send one templated email to a third party per request (rate limited, no links allowed in the name). | Open: add Cloudflare Turnstile (`TURNSTILE_SECRET_KEY`, planned) before launch. |
| 19 | Medium (perf) | Home first-load JS is 163 KB against the ux-spec budget of 130 KB (shared 103 KB is the Next/React baseline). | Open: lazy-load the desktop reservation bar popover calendar and the mobile sheet with `next/dynamic`. |
| 20 | Info | JSON-LD publishes the resort street address (no unit) and Expedia's resort coordinates. No unit number anywhere public. Visible copy names "Building 3". | Owner decision (see below). |

Passing checks with no defect: tampered totals rejected (409 `quote_changed`, server quote stored); past (422), reversed (400), over 90 nights (422), beyond window (422), below seasonal minimum (422), blocked range (409); 7 guests and 3 infants 400; honeypot returns a decoy success and stores nothing; script in name and message is escaped by React on the success page and emails are plain text; `/api/checkout` and `/api/stripe/webhook` 404 with flags off; `/api/calendar.ics` 404 without a matching token in production, 200 with it; zero serious or critical axe violations after fixes on every page and open dialog at both widths; all dialogs move, trap and return focus; reduced motion disables the cover fade and smooth scroll; the 4 reviews are verbatim; permit 029008 is in every footer.

Counts: High 2, Medium 6 (1 open, perf), Serious a11y 1, Moderate a11y 1, Low 9 (3 open), Info 1. Fixed 15, open 4, owner decision 1.

## Build sizes (first-load JS)

`/` 163 KB, `/book` 153 KB, `/gallery` 114 KB, `/booking/success` 114 KB, `/faq` 109 KB, `/area` 104 KB, `/policies` 103 KB (shared baseline 103 KB). Owner photographs are 2500 px JPEGs of 300 to 400 KB, served resized as AVIF or WebP.

## Open items needing the owner

1. Contact details in `src/content/site.config.ts`: host name, email, phone, Airbnb and Vrbo URLs, and confirm the 12-hour response time. Until then the guest email signs as "Your host".
2. Real rates and fees (`pricing.isPlaceholder` is still true), security deposit amount, infant rule (currently not counted, max 2).
3. Set `NEXT_PUBLIC_SITE_URL` to the real domain: canonical URLs, the sitemap and JSON-LD currently fall back to `http://localhost:3000` outside Vercel.
4. Email: `RESEND_API_KEY`, `EMAIL_FROM`, `BOOKING_NOTIFY_EMAIL`; without them requests are only logged.
5. Store: the default on Vercel is memory plus email; write the Postgres adapter before relying on stored requests or the success page summary across instances.
6. Add Turnstile and a shared rate limit before promoting the site (items 17, 18).
7. Decide whether the resort street address and coordinates should stay in JSON-LD (item 20). They identify the resort, not the unit.
8. Photos: the owner's own 13 photographs are in place (public/photos/manifest.json). Still needed: the primary bedroom (king) and its ensuite, the indoor pool itself, and the Building 3 exterior. Please confirm the dining copy ("four chairs and a bench") against the table.
9. Remaining `TODO_OWNER` copy (backup phone, fans, locker instructions, host bio) is hidden from pages in production; fill it in to show those sentences.

## Tests added

- `tests/qa/qa.test.ts` (node:test, 18 tests): prefill sanitizing, name and phone hardening, production owner-token fallback in the guest email, inquiry 415 / 413 / 400, booking API non-PII and malformed ids, flag-off 404s, `calendar.ics` token rules, em dash and unit-number source scans.
- `tests/qa/qa.spec.ts` (Playwright, 30 tests): axe at two widths and with dialogs open, landmarks and headings, alt text, reduced motion, visible focus, overflow at six widths and the arrival sweep, fixed bars vs submit, link and anchor crawl, drawer / FAQ / lightbox / house-rules keyboard behaviour, sheet scroll-lock regression, hostile prefill, guest limits, seasonal minimum, ledger vs `computeQuote`, keyboard-only submit with back navigation and PII check, error announcement, success without id, rendered hard rules, reviews verbatim, SEO, owner photographs (next/image, alt text, AVIF/WebP, ratio, CLS).
- `playwright.config.ts` now runs every `*.spec.ts` under `tests/`.

Commands (all passing): `npm run build`, `npx tsc --noEmit`, `npm run lint` (0 problems), `npx tsx --test tests/**/*.test.ts` (60 pass), `PW_BASE_URL=http://localhost:3400 npx playwright test` (34 pass).
