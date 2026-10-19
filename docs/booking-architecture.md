# Prince of Tides: Booking Architecture

Stack: Next.js 15 App Router, TypeScript, Vercel. Installed packages used here: `resend`, `node-ical`,
`stripe`, `zod`, `date-fns`. Pricing logic lives in `src/content/site.config.ts` (`computeQuote`,
`getNightlyRate`) and is the single source of truth on client and server. Policies live in
`src/content/policies.ts`. Ops/tax background: `docs/booking-ops.md`.

Feature flags (`siteConfig.features`): `emailNotifications` (on), `icalSync` (off), `stripeCheckout`
(off). Every phase-2/3 route must check its flag AND its required env vars and return 404 / fall back
to phase 1 behaviour if either is missing.

---

## Conventions

- **Dates:** `YYYY-MM-DD` strings everywhere (API, DB `date` columns, iCal `VALUE=DATE`). A stay is the
  half-open range `[check_in, check_out)`, which makes same-day turnover natural: a stay ending on the
  10th and one starting on the 10th do not overlap.
- **Money:** quotes are computed in dollars with cent rounding by `computeQuote`; store and send to
  Stripe as integer cents (`Math.round(x * 100)`).
- **Server recomputes everything.** Never trust a client-sent price.
- **Validation:** zod schemas in `src/lib/booking/schemas.ts`.

Suggested files:
```
src/lib/booking/schemas.ts        zod schemas (request, quote query)
src/lib/booking/availability.ts   getBlockedRanges(), isRangeAvailable()
src/lib/booking/ical.ts           fetch + parse platform feeds, build our feed
src/lib/booking/db.ts             SQL client (phase 1b+)
src/lib/booking/email.ts          Resend templates
src/lib/booking/stripe.ts         Stripe client, checkout session builder (phase 3)
src/content/blocked-dates.ts      manual blocks: { start, end, note }[] (phase 1-2, before DB)
```

---

## Phase 1: Request to book (build now)

Flow: guest picks dates and guests, the client shows `computeQuote()` (labelled as an estimate while
`pricing.isPlaceholder`), guest submits the form, `POST /api/booking-request`, server validates, recomputes
the quote, stores the request, emails the host and the guest, returns a reference.

### `POST /api/booking-request`
Body (zod):
```ts
{
  checkIn: string;           // YYYY-MM-DD
  checkOut: string;
  adults: number; children: number;   // adults + children <= 6
  name: string; email: string; phone?: string;
  message?: string;          // trip purpose
  agree21: true;             // must be literally true
  website?: string;          // honeypot, must be empty
  turnstileToken?: string;   // optional Cloudflare Turnstile
}
```
Server steps:
1. Validate. Reject honeypot, past dates, check-in beyond `bookingWindowDays`, guests > 6.
2. `computeQuote()`; reject if `errors` other than min-nights (min-nights can be returned as a soft
   warning so the host can still make exceptions, decision for UI).
3. If `icalSync` is on, `isRangeAvailable()`; if not available return 409 with a friendly message.
4. Rate limit: 5 requests per IP per hour (Vercel KV/Upstash, or in-DB count once the DB exists).
5. Persist (see "Persistent log" below), generate ref like `POT-2610-7F3K`.
6. Send emails via Resend: host notification (all fields + quote table + reply-to guest) and guest
   acknowledgement ("not yet confirmed, we reply within N hours"). Email failure must not lose the
   request: persist first, send second, record `email_status`.
7. Return `{ ok: true, ref }`.

### Persistent log
- **Phase 1a (zero infra):** Resend emails to host are the log, plus a JSON line written to
  `console.log` (visible in Vercel runtime logs, retained per plan). Acceptable for launch.
- **Phase 1b (recommended within weeks):** provision the database below and insert into
  `booking_requests`. This table is reused unchanged by phases 2 and 3.

### Env vars (phase 1)
| Var | Purpose |
|---|---|
| `RESEND_API_KEY` | Resend API key |
| `BOOKING_FROM_EMAIL` | Verified sender, e.g. `bookings@<domain>` (TODO_OWNER domain) |
| `BOOKING_NOTIFY_EMAIL` | Host inbox for notifications |
| `NEXT_PUBLIC_SITE_URL` | Absolute URL for links in emails |
| `TURNSTILE_SECRET_KEY` (optional) | Bot protection |
| `DATABASE_URL` (phase 1b) | Postgres connection |

### Failure modes
| Failure | Handling |
|---|---|
| Resend down / quota | Request already persisted (1b) or logged (1a); return success to guest, mark `email_status='failed'`, retry from an admin action or cron |
| Spam | Honeypot, Turnstile, rate limit, reject URLs in message beyond 2 |
| Guest typo in email | Show the email back on the success screen; host can still reply by phone |
| Price changed between view and submit | Server quote is what is stored and emailed |

---

## Phase 2: iCal availability sync (scaffold now, `icalSync: false`)

### Import
- Inputs: `AIRBNB_ICAL_URL`, `VRBO_ICAL_URL` (exported from each platform's calendar settings),
  plus manual blocks (`src/content/blocked-dates.ts` before the DB, `manual_blocks` table after).
- `getBlockedRanges()` in `src/lib/booking/availability.ts`:
  1. Fetch each feed server-side with `fetch(url, { next: { revalidate: 900, tags: ["availability"] } })`
     (15 minute cache), timeout 8 s.
  2. Parse with `node-ical` (`ical.sync.parseICS(text)`); take `VEVENT`s. Platform feeds use all-day
     `DTSTART;VALUE=DATE` / `DTEND;VALUE=DATE` with DTEND exclusive, which matches our half-open ranges.
     Convert with the date parts only, never via local time, to avoid off-by-one days.
  3. Merge platform, manual and (phase 3) confirmed direct bookings and holds into sorted, coalesced
     ranges `{ start, end, source }[]`.
- `GET /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD` returns `{ blocked: [{start,end}], updatedAt }`
  without source or guest details. Cache header `s-maxage=900, stale-while-revalidate=3600`.
- Calendar UI disables any night inside a blocked range; check-out day may equal a blocked start
  (same-day turnover).
- Platforms refresh imported calendars on their own schedule (Airbnb: about every 3 hours,
  [Airbnb help](https://www.airbnb.com/help/article/99)), so there is always a window where a
  platform booking is not yet visible to us and vice versa. Phase 1/2 mitigates this because the host
  confirms manually; phase 3 mitigates with re-checks (below).

### Export: `GET /api/calendar.ics`
- Returns `text/calendar; charset=utf-8` with one all-day `VEVENT` per confirmed direct booking, active
  checkout hold and manual block: `UID:<booking id>@princeoftides`, `DTSTART;VALUE=DATE`,
  `DTEND;VALUE=DATE` (exclusive), `SUMMARY:Reserved` (no guest names or PII).
- Protect with an unguessable token: `/api/calendar.ics?token=${ICAL_EXPORT_TOKEN}`; return 404 on
  mismatch. Paste this URL into Airbnb ("Import calendar") and Vrbo.
- Do NOT re-export events imported from Airbnb/Vrbo (avoids feedback loops and duplicate blocks).
- `Cache-Control: no-store` or short (300 s): platforms poll on their own schedule.
- Invalidate with `revalidateTag("availability")` whenever a booking or block changes.

### Env vars (phase 2)
`AIRBNB_ICAL_URL`, `VRBO_ICAL_URL`, `ICAL_EXPORT_TOKEN`, `CRON_SECRET` (optional cron to pre-warm
the cache and alert if a feed fails for more than 6 hours).

### Failure modes
| Failure | Handling |
|---|---|
| Feed fetch fails / times out | Serve last good cached result (stale-while-revalidate); if no cache, mark availability as "unknown" and fall back to request mode with a note "host will confirm dates" |
| Feed URL rotated by platform | Cron alert email to host after repeated failures |
| Malformed events | Skip the event, log it; never crash the route |
| Timezone shifts | Use date-only values; unit tests for DTSTART with and without `VALUE=DATE` |

---

## Phase 3: Stripe Checkout instant booking (scaffold now, `stripeCheckout: false`)

Enable only after: DB provisioned, iCal sync on and healthy, real rates entered
(`pricing.isPlaceholder: false`), tax accounts registered, rental agreement terms finalised.
Set `booking.mode: "instant"` together with the flag.

### Database recommendation
**Neon Postgres via the Vercel Marketplace** (serverless, free tier, branching for previews, works with
`@neondatabase/serverless` or any Postgres driver). Supabase is an equal alternative if an admin UI and
auth are wanted out of the box. Avoid SQLite/files on Vercel (read-only, ephemeral filesystem).

The key reason for Postgres: an **exclusion constraint** makes double booking impossible at the database
level, regardless of race conditions.

### Schema
```sql
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TYPE booking_status AS ENUM
  ('requested','hold','confirmed','cancelled','expired','declined');

CREATE TABLE booking_requests (          -- phase 1b+
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref           text UNIQUE NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  check_in      date NOT NULL,
  check_out     date NOT NULL CHECK (check_out > check_in),
  adults        int NOT NULL, children int NOT NULL DEFAULT 0,
  name text NOT NULL, email text NOT NULL, phone text, message text,
  quote         jsonb NOT NULL,           -- full computeQuote() output at request time
  email_status  text NOT NULL DEFAULT 'pending',
  ip_hash       text,
  status        text NOT NULL DEFAULT 'new'   -- new | quoted | converted | declined
);

CREATE TABLE bookings (                  -- phase 3 (and manual confirmations from phase 1b)
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ref             text UNIQUE NOT NULL,
  request_id      uuid REFERENCES booking_requests(id),
  status          booking_status NOT NULL,
  stay            daterange NOT NULL,     -- [check_in, check_out)
  guests          int NOT NULL CHECK (guests BETWEEN 1 AND 6),
  guest_name text NOT NULL, guest_email text NOT NULL, guest_phone text,
  currency        text NOT NULL DEFAULT 'usd',
  subtotal_cents  int NOT NULL, discount_cents int NOT NULL, cleaning_cents int NOT NULL,
  tax_cents       int NOT NULL, total_cents int NOT NULL,
  tax_lines       jsonb NOT NULL,         -- [{name, rate, amountCents}] for tax reporting
  amount_paid_cents     int NOT NULL DEFAULT 0,
  amount_refunded_cents int NOT NULL DEFAULT 0,
  cancellation_policy_id text NOT NULL,
  stripe_checkout_session_id text UNIQUE,
  stripe_payment_intent_id   text,
  stripe_customer_id         text,
  hold_expires_at timestamptz,            -- for status = 'hold'
  agreement_accepted_at timestamptz, agreement_version text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- No two active bookings may overlap. '[)' ranges allow same-day turnover.
  EXCLUDE USING gist (stay WITH &&) WHERE (status IN ('hold','confirmed'))
);

CREATE TABLE manual_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stay daterange NOT NULL, note text, created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE payments (                  -- one row per charge or refund, for reconciliation
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  kind text NOT NULL,                     -- deposit | balance | security_deposit | refund
  amount_cents int NOT NULL,
  stripe_object_id text UNIQUE,           -- pi_..., re_...
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE stripe_events (             -- webhook idempotency
  id text PRIMARY KEY,                    -- evt_...
  type text NOT NULL, received_at timestamptz NOT NULL DEFAULT now()
);
```
Holds expire via a filter (`hold_expires_at < now()` treated as inactive by availability) plus a cron
that flips them to `expired`; the exclusion constraint only counts rows still in `hold`/`confirmed`, so
the cron must run (every 5 minutes) or the `checkout.session.expired` webhook must flip them.

### Checkout flow
1. `POST /api/checkout` with dates, guests, contact info, `agree21`, `acceptAgreement: true`.
2. Server: validate; `computeQuote()`; reject errors (min nights is hard in instant mode).
3. **Availability re-check #1:** fresh fetch of platform feeds (bypass cache with `cache: "no-store"`)
   + DB. If blocked: 409.
4. Insert `bookings` row with `status='hold'`, `hold_expires_at = now() + 30 min`. If the exclusion
   constraint fires (error code `23P01`), return 409 "just booked".
5. Create Stripe Checkout Session (`mode: "payment"`):
   - Line items: "Lodging, N nights (dates)" (after discount), "Cleaning fee", and one line per tax
     from `quote.taxes` (we compute SC/Town tax ourselves; Stripe Tax does not model SC
     accommodations + Town beach fee reliably, so do not enable automatic tax).
   - Amount due now per payment policy: 50% if check-in is 30+ days out (set
     `payment_intent_data.setup_future_usage: "off_session"` to charge the balance later), else 100%.
     Show both amounts in the line item description.
   - `expires_at`: 30 minutes; `client_reference_id` and `metadata.booking_id`; `customer_email`.
   - Idempotency key = booking id.
6. Store session id; redirect to `session.url`.

### Webhook: `POST /api/stripe/webhook`
- Verify with `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)` using
  `await req.text()` (raw body). `export const runtime = "nodejs"`.
- Idempotency: `INSERT INTO stripe_events ... ON CONFLICT DO NOTHING`; if no row inserted, return 200.
- `checkout.session.completed` (payment_status `paid`):
  - Load booking by metadata. If status `hold`: **availability re-check #2** against platform feeds
    (`no-store`). If clear, set `confirmed`, record payment, email guest (confirmation + agreement copy)
    and host, `revalidateTag("availability")` so `/api/calendar.ics` exports it.
  - If the hold had expired or a platform booking appeared meanwhile: issue a full refund
    automatically, set `cancelled`, email guest an apology and host an alert. (Rare, but this is the
    honest failure mode.)
- `checkout.session.expired`: set hold to `expired`.
- `charge.refunded` / `refund.updated`: update `amount_refunded_cents`, add `payments` row.
- `payment_intent.payment_failed` (balance charge): email host and guest; follow policy (3 days to pay).

### Balance and security deposit
Daily cron `GET /api/cron/balances` (protected by `CRON_SECRET`, Vercel Cron): for confirmed bookings
with check-in in 30 days and balance unpaid, create an off-session PaymentIntent for the balance plus
the security deposit with the saved payment method. On failure, send a payment link. Refund the
security deposit 7 days after checkout unless the host flags a claim (admin action).

### Refunds per cancellation policy
`POST /api/admin/bookings/:id/cancel` (host only) computes the refund from `policies.cancellation`:
```
daysBefore = days from now (America/New_York) to check_in at 16:00
>= 60  -> refund all payments received
30-59  -> refund paid - 50% of total (never negative)
< 30   -> 0 (host may override, e.g. rebooked nights or evacuation clause)
```
Create `stripe.refunds.create({ payment_intent, amount })` per payment, oldest first. Taxes are
refunded proportionally (they are part of the paid amount) and the tax lines for the booking are
adjusted for reporting. Stripe processing fees are not returned by Stripe on refunds (see
`docs/booking-ops.md`). Admin routes are protected by a simple auth (Vercel password protection on
`/admin`, or `ADMIN_TOKEN` header) until a real auth layer exists.

### Tax collection and reporting
- Tax lines come from `siteConfig.pricing.taxes` and are stored per booking in `tax_lines`.
- `GET /api/admin/tax-report?from=&to=` sums taxable amount and each tax for confirmed direct stays
  (by stay date), net of refunds, for the SCDOR ST-388/ST-3T and Town quarterly returns.
- If a rate changes, update config; existing bookings keep their stored rates.

### Env vars (phase 3)
| Var | Purpose |
|---|---|
| `STRIPE_SECRET_KEY` | Server key (test key in preview environments) |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Only if embedded Checkout is used |
| `DATABASE_URL` | Neon/Supabase Postgres |
| `CRON_SECRET` | Protects cron routes |
| `ADMIN_TOKEN` | Admin API auth (interim) |
| plus all phase 1 and 2 vars | |

### Failure modes (phase 3)
| Failure | Handling |
|---|---|
| Two guests check out the same dates at once | DB exclusion constraint; second insert fails with 409 before Stripe |
| Platform booking lands during Checkout | Re-check #2 in webhook; auto refund + apology |
| Webhook delayed or retried | Idempotent by event id; success page polls `GET /api/booking/:ref` and shows "processing" |
| Webhook never arrives | Cron reconciles holds older than 30 min with `stripe.checkout.sessions.retrieve` |
| Guest abandons Checkout | Session expires in 30 min; hold expires; dates reopen |
| Balance charge declined | Email payment link; policy allows cancellation after 3 days |
| Feed down during checkout | Fail closed: refuse instant booking, offer request-to-book |
| Stripe outage | Hide instant button (health check), fall back to request mode |

---

## Migration path

1. **Launch (phase 1a):** request form + Resend emails + console log. Manual blocks in
   `src/content/blocked-dates.ts`. Host invoices with Stripe Payment Links or invoices created in the
   Stripe Dashboard (no code). Add `/api/calendar.ics` from manual blocks if the host wants platform
   syncing early.
2. **Phase 1b:** provision Neon via Vercel Marketplace, run schema, write requests to
   `booking_requests`. Host confirmations create `bookings` rows (`confirmed`) through a minimal admin
   action, which also feeds `/api/calendar.ics`.
3. **Phase 2:** add platform iCal URLs, set `icalSync: true`. Calendar greys out booked nights.
   Request mode continues; the host still confirms.
4. **Phase 3 (soft launch):** Stripe test mode on a preview deployment, run test bookings including
   race, refund and expiry cases. Then live keys, `stripeCheckout: true`, `booking.mode: "instant"`.
   Keep request-to-book as a fallback for dates beyond 6 months, long stays (28+ nights) and anything
   outside the rules.
5. Moving `blocked-dates.ts` into `manual_blocks` is a one-time insert; the availability function reads
   both during the transition.

## Test plan (minimum)
- `scripts/test-quote.mjs` (exists) for pricing, run in several `TZ` values.
- Unit tests: iCal parse with DATE and DATE-TIME values, range coalescing, same-day turnover allowed.
- Integration (phase 3): Stripe CLI `stripe listen --forward-to localhost:3000/api/stripe/webhook`;
  concurrent checkout of the same dates must yield one hold and one 409.

---

## Booking engine: implemented

Phase 1 is live in code; phases 2 and 3 are built behind their flags. Differences from the plan above are
noted.

| Piece | Where |
|---|---|
| Shared zod schemas, guest rules (infants not counted, max 2: TODO_OWNER confirm) | `src/lib/booking/schemas.ts` |
| Stay rules (window, min/max nights, availability) on client and server | `src/lib/booking/rules.ts`, `calendar.ts` |
| Availability merge (manual JSON, iCal, store) | `src/lib/booking/availability.ts`, `ical.ts`, `ranges.ts` |
| Manual blocks (moved from `src/content/blocked-dates.ts`) | `src/lib/booking/blocked-dates.json`, `[{ "start", "end", "note" }]`, `end` exclusive |
| Store interface, file and memory adapters (Postgres adapter still to write) | `src/lib/booking/store.ts`, env `BOOKING_STORE` |
| Request processing, Resend emails, rate limit | `inquiry.ts`, `email.ts`, `rate-limit.ts` |
| Stripe Checkout and webhook logic | `src/lib/booking/stripe.ts` |
| UI | `src/components/booking/*` (`ReservationForm`, `ReservationBar` incl. mobile bar and sheet) |

Routes: `GET /api/availability`, `POST /api/inquiry` (alias `POST /api/booking-request`),
`GET /api/booking/:id`, `GET /api/calendar.ics`, `POST /api/checkout`, `POST /api/stripe/webhook`,
pages `/book` and `/booking/success?id=`.

Notes:
- `/book` accepts `checkIn`, `checkOut`, `adults`, `children`, `infants` (and `arrive`/`depart`).
- The client sends the total it showed (`quotedTotal`); a mismatch returns 409 `quote_changed` with the
  server quote. The stored and emailed quote is always the server's.
- Below the seasonal minimum is a hard 422 in request mode too (the calendar prevents it anyway).
- The file store is for development only. On Vercel the default is the memory store plus a JSON log
  line and the host email; write the Postgres adapter before relying on stored requests.
- Stripe line items are itemized when 100% is due; a deposit (check-in 30+ days out) is one
  "Deposit (50%)" line whose description shows the total and balance.
- Tests: `npx tsx --test tests/booking/*.test.ts` (unit) and `npx playwright test` (e2e).
