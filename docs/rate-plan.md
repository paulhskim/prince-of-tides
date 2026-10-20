# Rate plan (private, for the owner)

Status: PLACEHOLDER. A tailored, market-based starting plan for Prince of Tides that the owner confirms
before launch. Implemented in `src/content/site.config.ts` (`pricing.seasons`, `pricing.events`,
`computeQuote`); `pricing.isPlaceholder` stays `true` until the owner signs off.

Rates are not published as a chart anywhere on the site. A guest sees them only on `/reserve`, after
choosing arrival and departure, in the itemized quote: each night (grouped into runs) with its rate and
the reason for it ("3 weeknights, Late fall, $140 a night"; "1 weekend night, RBC Heritage week, $345 a
night"), the discount, cleaning fee, each tax, the total, the payment schedule and the cancellation dates.
The calendar shows availability and minimum-stay hints only.

Taxes, cleaning fee and the cancellation and payment terms are unchanged from `docs/booking-ops.md`
(10% combined tax on lodging after discount plus cleaning; $185 cleaning; weekly 10%, monthly 25%).

---

## 1. Why these numbers

The unit: 2 bedrooms, 2 baths, about 831 sq ft, sleeps 6, interior views (parking lot and atrium), about
0.8 to 1.1 miles to the beach by the resort's marsh boardwalk, and the best spot in the resort for the
indoor pool, sauna, steam room and gym (a real winter advantage). Guest score 9.2/10 on Vrbo/Expedia.

Comparables (public, October 2026):

| Source | What it shows |
|---|---|
| [KAYAK: 2BR/2BA condo at Hilton Head Resort](https://www.kayak.com/Hilton-Head-Island-Hotels-Beach-side-condo-at-Hilton-Head-Resort-Villas.1070770445.ksp) | From $159; about $206 a weeknight and $207 a weekend night recently; January about $155, June about $256; Tuesday cheapest (about $178), Thursday dearest (about $241); April listed as high season |
| [Evolve: 2BR/2BA Hilton Head Resort, sleeps 6](https://evolve.com/vacation-rentals/385027) | About $201 average a night |
| [Evolve: 2BR/2BA Hilton Head Resort, sleeps 6](https://evolve.com/516852) | About $140 average a night (dates not set) |
| [Evolve: 2BR/2BA top floor, sleeps 8](https://careers.evolvevacationrental.com/vacation-rentals/us/sc/hilton-head-island/489880) | About $171 average a night |
| [Emerald Kite: mid-island 2BR, sleeps 6](https://emeraldkite.com/vacation-rentals/hilton-head-condo-1022957/) | From $296, 1-week minimum (higher-end comparable) |
| [BNBCalc Hilton Head market](https://www.bnbcalc.com/markets/us/hilton-head-island-sc) | RevPAR peaks June and July, lowest January and February; booked about 53 days ahead |
| [WTOC, Mar 2025](https://www.wtoc.com/2025/03/05/hilton-head-leaders-prepare-peak-tourism-season) | Peak season runs from spring (spring break, the RBC Heritage) through Labor Day |

How the ladder was set:

- Annual average lands near $200 a night, inside the Hilton Head Resort comp band ($171 to $206), a
  little under the top comps for the interior view and a little over the bottom for the reviews and the
  location by the indoor amenities.
- Every season has a weekend premium (Friday and Saturday nights), $20 to $35, matching the weekday
  spread KAYAK reports for the resort.
- Winter is priced low ($135 / $155) to win long stays; the 25% monthly discount brings a snowbird month
  to about $106 a night before fees. The heated indoor pool next door is the winter selling point.
- High summer ($255 / $285) sits at the June comp peak; early summer and late summer step down either side.
- Events carry a premium of roughly 15% to 70% over their season, with longer minimums where demand is
  for whole weeks (RBC Heritage, Fourth of July). RBC Heritage week is the island's biggest week; the
  unit is mid-island, about a 20-minute drive from Harbour Town, so it is priced well below Sea Pines
  golf-week rates.
- Minimum stay for a stay is the largest minimum of any night in it, so a stay that touches RBC Heritage
  week needs 5 nights. Stays that arrive during RBC Heritage week arrive Saturday or Sunday (golf-week
  turnover). Every other arrival day is open.

## 2. Seasons (every year)

| Season | Nights (MM-DD) | Sun to Thu | Fri and Sat | Min nights |
|---|---|---|---|---|
| Winter | 01-03 to 02-14 | $135 | $155 | 3 |
| Early spring | 02-15 to 03-07 | $150 | $175 | 3 |
| Spring | 03-08 to 05-21 | $190 | $225 | 3 |
| Early summer | 05-22 to 06-11 | $225 | $255 | 4 |
| High summer | 06-12 to 08-08 | $255 | $285 | 5 |
| Late summer | 08-09 to 09-30 | $185 | $215 | 3 |
| Fall | 10-01 to 10-31 | $175 | $205 | 3 |
| Late fall | 11-01 to 12-19 | $140 | $160 | 3 |
| Holidays | 12-20 to 01-02 | $165 | $185 | 3 |

## 3. Dated events (Oct 2026 to Dec 2027)

Nights are inclusive; check-out is the morning after the last night or later. Where two events overlap,
the first listed in the config wins (Easter weekend inside spring break).

| Event | Nights | Weeknight | Weekend | Min | Arrival | Source |
|---|---|---|---|---|---|---|
| Concours d'Elegance weekend | Thu Oct 29 to Sat Oct 31, 2026 | $215 | $235 | 3 | Any | [hiltonheadisland.org: Concours d'Elegance and Motoring Festival, Oct 29 to Nov 1, 2026](https://www.hiltonheadisland.org/events/hilton-head-island-concours-d-elegance-motoring-festival-2026) |
| Thanksgiving week | Sat Nov 21 to Sat Nov 28, 2026 | $185 | $195 | 4 | Any | Thanksgiving Thu Nov 26, 2026 (fourth Thursday of November) |
| Christmas | Wed Dec 23 to Sun Dec 27, 2026 | $215 | $215 | 4 | Any | Fixed date |
| New Year's | Tue Dec 29, 2026 to Fri Jan 1, 2027 | $225 | $225 | 3 | Any | Fixed date |
| Presidents' Day weekend | Fri Feb 12 to Sun Feb 14, 2027 | $185 | $185 | 3 | Any | [calendardate.com 2027 holidays](https://www.calendardate.com/year2027_holidays.php): Mon Feb 15, 2027 |
| Hilton Head Island Seafood Festival | Thu Feb 25 to Sat Feb 27, 2027 | $175 | $195 | 3 | Any | [The Local Palate: Feb 22 to 28, 2027](https://thelocalpalate.com/events/hilton-head-seafood-festival-2027/) (the festival site, hiltonheadseafoodfestival.com, could not be checked; confirm there) |
| Easter weekend | Thu Mar 25 to Sat Mar 27, 2027 | $265 | $265 | 3 | Any | [calendardate.com](https://www.calendardate.com/year2027_holidays.php): Easter Sunday Mar 28, 2027 |
| Spring break weeks | Sat Mar 13 to Fri Apr 9, 2027 | $230 | $255 | 4 | Any | Demand window around Easter, not a single event; [WTOC](https://www.wtoc.com/2025/03/05/hilton-head-leaders-prepare-peak-tourism-season) |
| RBC Heritage week | Sat Apr 10 to Sat Apr 17, 2027 | $325 | $345 | 5 | Sat or Sun | [PGA Tour: Apr 15 to 18, 2027](https://www.pgatour.com/tournaments/2027/rbc-heritage/R2027012/overview); [Golf Channel 2027 schedule](https://www.golfchannel.com/pga-tour/news/pga-tour-2027-schedule-36-events-two-at-pebble-more-signature-spacing) (rbcheritage.com could not be checked) |
| Memorial Day weekend | Fri May 28 to Sun May 30, 2027 | $265 | $265 | 3 | Any | [calendardate.com](https://www.calendardate.com/year2027_holidays.php): Mon May 31, 2027 |
| Fourth of July week | Thu Jul 1 to Wed Jul 7, 2027 | $315 | $335 | 5 | Any | [calendardate.com](https://www.calendardate.com/year2027_holidays.php): Sun Jul 4, 2027 |
| Labor Day weekend | Fri Sep 3 to Sun Sep 5, 2027 | $235 | $235 | 3 | Any | [calendardate.com](https://www.calendardate.com/year2027_holidays.php): Mon Sep 6, 2027 |
| Thanksgiving week | Sat Nov 20 to Sat Nov 27, 2027 | $185 | $195 | 4 | Any | [calendardate.com](https://www.calendardate.com/year2027_holidays.php): Thu Nov 25, 2027 |
| Christmas | Thu Dec 23 to Mon Dec 27, 2027 | $215 | $215 | 4 | Any | Fixed date |
| New Year's | Wed Dec 29, 2027 to Sat Jan 1, 2028 | $225 | $225 | 3 | Any | Fixed date |

Left out on purpose (dates not published at the time of writing): the 2027 Concours d'Elegance, the
2027 Hilton Head Island Wine and Food Festival, and anything in 2028. Add them to `pricing.events` with a
source once the dates are announced.

## 4. Month by month

Generated from the config (average is the plain average of every night's rate in the month).

| Month | Seasons (weeknight / weekend) | Event nights | Min nights | Average nightly |
|---|---|---|---|---|
| Oct 2026 (from Oct 20) | Fall $175 / $205 | Concours d'Elegance weekend $215 / $235 | 3 | $193 |
| Nov 2026 | Late fall $140 / $160 | Thanksgiving week $185 / $195 | 3 to 4 | $156 |
| Dec 2026 | Late fall $140 / $160; Holidays $165 / $185 | Christmas $215; New Year's $225 | 3 to 4 | $167 |
| Jan 2027 | Holidays $165 / $185; Winter $135 / $155 | New Year's $225 | 3 | $145 |
| Feb 2027 | Winter $135 / $155; Early spring $150 / $175 | Presidents' Day weekend $185; Seafood Festival $175 / $195 | 3 | $155 |
| Mar 2027 | Early spring $150 / $175; Spring $190 / $225 | Spring break weeks $230 / $255; Easter weekend $265 | 3 to 4 | $214 |
| Apr 2027 | Spring $190 / $225 | Spring break weeks $230 / $255; RBC Heritage week $325 / $345 | 3 to 5 | $246 |
| May 2027 | Spring $190 / $225; Early summer $225 / $255 | Memorial Day weekend $265 | 3 to 4 | $213 |
| Jun 2027 | Early summer $225 / $255; High summer $255 / $285 | None | 4 to 5 | $252 |
| Jul 2027 | High summer $255 / $285 | Fourth of July week $315 / $335 | 5 | $278 |
| Aug 2027 | High summer $255 / $285; Late summer $185 / $215 | None | 3 to 5 | $211 |
| Sep 2027 | Late summer $185 / $215 | Labor Day weekend $235 | 3 | $196 |
| Oct 2027 | Fall $175 / $205 | None | 3 | $185 |
| Nov 2027 | Late fall $140 / $160 | Thanksgiving week $185 / $195 | 3 to 4 | $156 |
| Dec 2027 | Late fall $140 / $160; Holidays $165 / $185 | Christmas $215; New Year's $225 | 3 to 4 | $167 |

Twelve-month average (Nov 2026 to Oct 2027): about $201 a night.

## 5. Worked examples (from computeQuote)

- Golf week, Sat Apr 10 to Sat Apr 17, 2027: 2 weekend nights at $345 and 5 nights at $325 = $2,315;
  weekly discount $231.50; cleaning $185; tax $226.86; total $2,495.36.
- High summer week, Sat Jul 10 to Sat Jul 17, 2027: $1,845; weekly discount $184.50; cleaning $185; tax
  $184.56; total $2,030.06.
- Winter month, Jan 4 to Feb 1, 2027 (28 nights): $3,940; monthly discount $985; total $3,454.

## 6. Owner decisions

- Confirm or change every number above, then set `pricing.isPlaceholder` to `false`.
- Weekly and monthly discounts currently apply to event weeks too (a golf-week guest gets 10% off a
  Saturday-to-Saturday stay). To protect event pricing, ask for discounts to exclude event nights.
- Review the event list every December and add the next year's dates (RBC Heritage, Concours, Seafood
  Festival) once published.
