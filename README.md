# Prince of Tides

Direct-booking website for Prince of Tides, a two-bedroom condo at Hilton Head Resort, Hilton Head Island, SC
(Town STR permit 029008).

Next.js 15 (App Router), TypeScript, Tailwind CSS v4. Built to deploy on Vercel.

## Run it locally

```bash
npm install --include=dev
NODE_ENV=development npm run dev     # http://localhost:3000
```

On a Mac where `NODE_ENV=production` is set globally, the `--include=dev` and `NODE_ENV=development` parts are
required, or dev tools are skipped.

## Before launch: what the owner fills in

| What | Where |
| --- | --- |
| Nightly rates, cleaning fee, minimum nights, deposit (currently market-based placeholders, `isPlaceholder: true`) | `src/content/site.config.ts` |
| Host name, email, phone, response time, Airbnb/Vrbo URLs | `src/content/site.config.ts` |
| Host bio, fan question, beach-gear locker details (search `TODO_OWNER`) | `src/content/copy.ts` |
| Infant rule (currently: not counted toward 6, max 2) | `src/lib/booking/schemas.ts` |
| Photos (see naming guide) | `public/photos/README.txt`, `public/photos/manifest.json` |
| Domain, email, storage, calendar and payment keys | `.env.local` (copy from `.env.example`) |

Photo rights: the current photos carry a "REsides 2025" watermark. Get the unwatermarked originals and written
permission (or reshoot) before the site is public. Still needed: both bedrooms, both bathrooms, boardwalk/beach,
indoor pool, building exterior. Google needs 8+ photos including a bedroom and a bathroom before the
VacationRental structured data turns on.

## Booking phases

1. **Request to book (live now).** Guest picks dates, sees an estimate, sends a request. Nothing is charged. The
   host confirms and invoices. Requests are emailed via Resend when `RESEND_API_KEY`, `EMAIL_FROM` and
   `BOOKING_NOTIFY_EMAIL` are set, otherwise logged to the console.
2. **Calendar sync (built, off).** Set `features.icalSync: true` and `AIRBNB_ICAL_URL` / `VRBO_ICAL_URL`. Import
   `/api/calendar.ics?token=ICAL_EXPORT_TOKEN` into Airbnb and Vrbo so direct bookings block those calendars.
3. **Instant booking with Stripe (built, off).** Set `features.stripeCheckout: true`, `booking.mode: "instant"`
   and the Stripe keys. Needs a database first (see below).

Storage: the default file store under `data/` is for local development only. Vercel's filesystem is not
persistent, so production needs the Postgres adapter described in `docs/booking-architecture.md`.

## Launch checklist (from QA)

- Set `NEXT_PUBLIC_SITE_URL` (sitemap and canonical links fall back to localhost otherwise).
- Configure Resend and verify the sending domain.
- Add a bot check (Cloudflare Turnstile) and a shared rate limit (the current one is per server instance).
- Confirm Hilton Head STR compliance: permit number on all ads, 24/7 responsible contact, posted noise rules.
- Confirm whether SC requires a real estate license for managing this property for pay.
- Collect and remit the 10% combined accommodations taxes on direct bookings (see `docs/booking-ops.md`).

## Commands

```bash
npm run build                          # production build
npm run lint
npx tsc --noEmit
npx tsx --test tests/**/*.test.ts      # unit tests
npx playwright test                    # end-to-end (needs a running build; see playwright.config.ts)
```

## Docs

| File | Contents |
| --- | --- |
| `docs/BRIEF.md` | Verified facts and hard rules for all copy |
| `docs/creative-direction.md`, `docs/design-system.md`, `docs/ux-spec.md` | Art direction, tokens, layouts |
| `docs/creative-review.md` | Creative director's AI-tells review and what changed |
| `docs/brand-voice.md` | Voice and tone |
| `docs/seo.md`, `docs/seo-implementation.md` | Keywords, structured data, Google/Airbnb policy research |
| `docs/booking-ops.md` | Taxes, rate research, policies, compliance, operations checklist |
| `docs/booking-architecture.md` | Booking system design, phases 1 to 3 |
| `docs/qa-report.md` | QA findings and open items |
