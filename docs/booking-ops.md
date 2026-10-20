# Prince of Tides: Booking Operations, Compliance and Pricing

Prepared October 2026 for the owner/co-host. Research is cited inline. Anything marked
**OWNER DECISION** or **TODO_OWNER** must be confirmed before launch. This is operational guidance,
not legal or tax advice: confirm tax registration and licensing questions with a South Carolina CPA
or attorney.

Config that implements this document: `src/content/site.config.ts` (pricing, taxes, booking rules),
`src/content/policies.ts` (house rules, cancellation, payment) and `src/content/faq.ts`.

---

## 1. Town of Hilton Head Island short-term rental (STR) rules

The Town regulates rentals of less than 30 days through its STR permit program. The unit holds
**STR Permit 029008**.

| Requirement | What it means for Prince of Tides | Source |
|---|---|---|
| Permit number on every advertisement | Show "STR Permit #029008" in the site footer and policies page, and on Airbnb/Vrbo. Rules effective May 1, 2026 require the permit number on all ads. | [Town requirements](https://hiltonheadislandsc.gov/short-termrentals/requirements), [Permit checklist PDF](https://hiltonheadislandsc.gov/short-termrentals/docs/STR_PermitChecklist.pdf), [Avalara summary of 2026 rules](https://www.avalara.com/mylodgetax/en/blog/2025/12/hilton-head-island-adds-new-short-term-rental-rules.html) |
| Responsible party reachable 24/7 | Owner or agent "must be available by phone at all times during rental" and "must take responsive action within (1) hour of receiving a complaint." Put a monitored phone number in the arrival email and in-unit binder. | [Permit checklist PDF](https://hiltonheadislandsc.gov/short-termrentals/docs/STR_PermitChecklist.pdf) |
| Noise rules posted in unit | Display the Town's noise rules. Quiet hours 10:00 PM to 7:00 AM; noise rules apply 24 hours. | [Town property display sheet](https://www.hiltonheadislandsc.gov/short-termrentals/docs/STR_Regulations-PropertyDisplay.pdf), [Good Neighbor brochure](https://hiltonheadislandsc.gov/short-termrentals/docs/GoodNeighborBrochure.pdf) |
| Pool / hot tub disclosure | Display whether a pool or hot tub is available and the safety measures. For this unit: resort pools and hot tub, HOA rules posted on site. | [Town requirements](https://hiltonheadislandsc.gov/short-termrentals/requirements) |
| Parking | Park only in designated spots, never on grass, pine straw or street. (The 6-vehicle driveway cap applies to single-family homes; this condo allows 2 vehicles per resort rules.) | [Property display sheet](https://www.hiltonheadislandsc.gov/short-termrentals/docs/STR_Regulations-PropertyDisplay.pdf), [Avalara](https://www.avalara.com/mylodgetax/en/blog/2025/12/hilton-head-island-adds-new-short-term-rental-rules.html) |
| Trash | Garbage kept in containers at all times; give guests disposal instructions. | [Permit checklist PDF](https://hiltonheadislandsc.gov/short-termrentals/docs/STR_PermitChecklist.pdf) |
| Occupancy | The Town page sets no numeric cap; bedrooms must meet code and be used primarily for sleeping. Our cap is the listed 6 guests. | [Town requirements](https://hiltonheadislandsc.gov/short-termrentals/requirements) |
| Safety | At least one charged fire extinguisher, smoke and CO detectors, unobstructed escape routes (the unit has all listed). | [Permit checklist PDF](https://hiltonheadislandsc.gov/short-termrentals/docs/STR_PermitChecklist.pdf) |
| HOA letter | Properties in HOAs need a letter confirming STR use is permitted (new for 2026 permits). Keep a copy on file. | [Avalara](https://www.avalara.com/mylodgetax/en/blog/2025/12/hilton-head-island-adds-new-short-term-rental-rules.html) |
| Permit holder | Permit must be in an individual's name, not an entity. | [Permit checklist PDF](https://hiltonheadislandsc.gov/short-termrentals/docs/STR_PermitChecklist.pdf) |
| Business license | A current-year Town business license is required in addition to the permit. Both renew annually; permits run May 1 to April 30. | [Town STR FAQ](https://hiltonheadislandsc.gov/short-termrentals/faq), [GovOS FAQ](https://hiltonheadislandsc.munirevs.com/faq/) |
| Fines | $250 first offense, $500 second, $1,000 each later offense; 3+ citations in 12 months can lead to revocation. | [Avalara](https://www.avalara.com/mylodgetax/en/blog/2025/06/hilton-head-island-approves-new-fines-for-short-term-rentals-breaking-rules.html) |
| Guest-facing hotline | Town STR Nuisance Hotline (843) 341-6864; Sheriff non-emergency (843) 255-3300. | [Good Neighbor brochure](https://hiltonheadislandsc.gov/short-termrentals/docs/GoodNeighborBrochure.pdf) |

Town STR office: 843-341-4740, STRPlan@hiltonheadislandsc.gov.

### Co-host licensing caution (OWNER DECISION)

South Carolina's real estate licensing law makes it unlawful to act as a "property manager" (someone
who, for compensation, negotiates or offers services in connection with the rental of real estate)
without a license, and the owner-exemption covers only owners renting their own interest
([S.C. Code Title 40 Ch. 57, sections 40-57-20, 40-57-30(20), 40-57-240](https://www.scstatehouse.gov/Archives/CodeofLaws2023/t40c057.php)).
If the site operator is paid to manage a condo they do not own, confirm with SC LLR or an attorney
whether a license or a licensed broker arrangement is needed. Taking direct bookings and payments
on the owner's behalf makes this more relevant, not less.

---

## 2. Taxes

### Rates (Town of Hilton Head Island, October 2026)

| Tax | Rate | Remitted to | Source |
|---|---|---|---|
| SC sales tax on accommodations | 5% | SC Department of Revenue (Form ST-388) | [SCDOR Accommodations Tax fact sheet](https://dor.sc.gov/tax-index/sales-and-use/accommodations/Documents/AccommodationTaxFactSheet.pdf) |
| SC state accommodations tax | 2% | SC Department of Revenue (ST-388 + ST-3T location report) | same |
| Beaufort County local sales tax | 0% now | SC Department of Revenue | Green Space 1% tax expired 2025 ([SCDOR news](https://dor.sc.gov/news/local-sales-tax-changes-coming-five-counties-may-1), [SCDOR IL 25-1](https://dor.sc.gov/resources-site/lawandpolicy/Advisory%20Opinions/IL25-1%20[Revised].pdf)). A 1% transportation "penny" tax is on the November 2026 ballot ([WTOC](https://www.wtoc.com/2026/09/15/beaufort-county-hosting-meeting-proposed-penny-sales-tax/)). If it passes, add 1% from its effective date. |
| Beaufort County 3% accommodations tax | Not applicable | n/a | Applies only in unincorporated Beaufort County, not inside the Town ([Airbnb tax help, SC section](https://www.airbnb.com/help/article/2328)). |
| Town Accommodations Tax | 1% | Town of Hilton Head Island Revenue Services (quarterly) | [Town ATAX page](https://hiltonheadislandsc.gov/business/atax.cfm), [Town taxes](https://www.hiltonheadislandsc.gov/finance/taxes.cfm) |
| Town Beach Preservation Fee | 2% | Town of Hilton Head Island (quarterly, same return) | same |
| **Combined** | **10%** | | |

Notes:
- Airbnb's help article labels the Town pieces as 2% local accommodations + 1% beach preservation,
  while the Town's own page says 1% + 2%. The total (3%) is the same; config follows the Town's labels.
- Some third-party sites (e.g. [BNBCalc](https://www.bnbcalc.com/blog/str-tax/airbnb-vrbo-str-south-carolina-tax))
  list 11% to 14% for Hilton Head by including the expired county Green Space tax or the
  unincorporated-only county 3% tax. We did not use those figures.
- The Town Hospitality Tax (2%) is on prepared food and beverages, not lodging.
- Stays of 90+ continuous days are exempt from SC accommodations tax (fact sheet above); config caps
  stays at 90 nights so the quote engine never applies tax to an exempt stay.

### Tax base

Taxes are applied to **lodging (after discounts) + cleaning fee**. SCDOR taxes the gross charge for
the accommodations, and Airbnb applies every SC and Hilton Head tax "of the listing price, including
cleaning and guest fees" ([Airbnb](https://www.airbnb.com/help/article/2328)). A refundable security
deposit is not taxed when refunded; any amount kept for damage should be reviewed with the CPA.

### Who remits

- **Airbnb bookings:** Airbnb collects and remits the SC 5% + 2% and the Town 3% on its bookings
  ([Airbnb](https://www.airbnb.com/help/article/2328)). The host still files returns as required and
  reports platform-remitted receipts per the return instructions.
- **Vrbo bookings:** confirm in the Vrbo dashboard which taxes Vrbo collects for this address; do not
  assume parity with Airbnb.
- **Direct bookings (this site):** the host/manager collects **all 10%** from the guest and remits:
  - SCDOR: retail license ($50) via SC Business One Stop; file ST-388 (with ST-3T) by the 20th of the
    month after each filing period ([SCDOR fact sheet](https://dor.sc.gov/tax-index/sales-and-use/accommodations/Documents/AccommodationTaxFactSheet.pdf)).
  - Town: open an accommodations tax account with Revenue Services; quarterly returns due April 20,
    July 20, October 20, January 20; file even with zero sales; 5% per month late penalty
    ([Town ATAX page](https://hiltonheadislandsc.gov/business/atax.cfm)). The Town page states owners
    renting on their own or through an unlicensed manager must collect and remit the Town tax
    ([Town requirements](https://hiltonheadislandsc.gov/short-termrentals/requirements)).
  - **OWNER DECISION:** decide whose license/account (owner or manager) the direct-booking receipts
    are reported under, and keep it consistent.

---

## 3. Market rate research and suggested rate card

### Comparable data (public sources, October 2026)

| Source | What it shows |
|---|---|
| [KAYAK: 2BR/2BA condo at Hilton Head Resort](https://www.kayak.com/Hilton-Head-Island-Hotels-Beach-side-condo-at-Hilton-Head-Resort-Villas.1070770445.ksp) | From $159; average about $206/night; cheapest month January about $155; most expensive June about $256 |
| [Evolve: 2BR/2BA Hilton Head Resort, sleeps 6](https://evolve.com/vacation-rentals/385027) | About $201 average/night |
| [Evolve: 2BR/2BA top-floor Hilton Head Resort, sleeps 8](https://careers.evolvevacationrental.com/vacation-rentals/us/sc/hilton-head-island/489880) | About $171 average/night |
| [Emerald Kite: mid-island 2BR, sleeps 6](https://emeraldkite.com/vacation-rentals/hilton-head-condo-1022957/) | From $296/night, 1-week minimum (higher-end comparable) |
| [AirDNA Hilton Head Island overview](https://airdna.co/vacation-rental-data/app/us/south-carolina/hilton-head-island/overview) | Island-wide ADR $426, occupancy 60% (all sizes, includes large oceanfront homes) |
| [BNBCalc Hilton Head market](https://www.bnbcalc.com/markets/us/hilton-head-island-sc) | Island-wide ADR about $354 to $389; RevPAR peaks June/July, lowest January/February; guests book about 53 days ahead |
| [RedAwning on HHI cleaning](https://redawning.com/pm/post/airbnb-cleaner-hilton-head-island) | Island cleaning fee median $298 (all sizes); 2BR turnover cost to host about $150 to $225; average stay 5.6 nights |

Interpretation: island-wide averages are inflated by large homes and oceanfront villas. Direct comps at
Hilton Head Resort cluster at about $155 (winter) to $256 (June), average about $170 to $206. Prince
of Tides has interior views (a discount factor) but strong reviews (9.2/10) and the best location in the
resort for the indoor amenities, so we price at the comp average, slightly above in summer.

### Suggested rate card (SUPERSEDED)

Superseded by the tailored plan in `docs/rate-plan.md` (weeknight and weekend rates for every season,
plus dated holiday and island-event rates such as RBC Heritage week). The site no longer shows any rate
table; rates appear only in the itemized quote on /reserve after dates are chosen. The original card is
kept below for reference.

| Season | Nights (MM-DD) | Sun to Thu | Fri and Sat | Min nights |
|---|---|---|---|---|
| Winter | 01-03 to 02-29 | $145 | $145 | 3 |
| Spring | 03-01 to 05-21 | $195 | $215 | 3 |
| Summer | 05-22 to 08-15 | $265 | $265 | 5 |
| Late summer and fall | 08-16 to 10-31 | $195 | $210 | 3 |
| Late fall | 11-01 to 12-19 | $155 | $155 | 3 |
| Holidays | 12-20 to 01-02 | $195 | $195 | 4 |

- Cleaning fee: **$185** (covers a $150 to $225 turnover plus linens; below the island median because
  it is a 2BR condo).
- Weekly discount (7+ nights): **10%**. Monthly (28+ nights): **25%** (winter snowbird demand).
- Discounts apply to lodging only, not to cleaning or taxes; they do not stack.
- Minimum nights follow the season of the check-in night.
- **Recommended manual overrides** (now in config as dated events, see `docs/rate-plan.md`): RBC Heritage golf week (mid-April, dates change
  yearly), Easter week, July 4 week and Thanksgiving: raise 20% to 35% and hold a 5 to 7 night minimum.
- Direct-booking pricing tip: price direct at the platform nightly rate. The guest still saves the
  Airbnb/Vrbo service fee, which is the honest "book direct" saving.

Example (placeholder rates): a 7-night summer week = 7 x $265 = $1,855, minus 10% ($185.50), plus
$185 cleaning = $1,854.50 taxable; tax $185.46; total $2,039.96.

---

## 4. Direct-booking policies (recommended)

### Payment schedule (`split-50-50`)
1. Request: no charge. Host replies with written quote, agreement and payment link.
2. Confirmation: 50% of the total on signing. Dates are held only after payment.
3. Balance: 50% due 30 days before check-in, plus the refundable security deposit.
4. Bookings within 30 days: 100% at confirmation.
5. Balance unpaid 3 days after due: reservation may be cancelled under the policy.

Why: 50/50 is the norm for Lowcountry vacation rentals, reduces the cost of a late cancellation, and
keeps phase 3 simple (Stripe saved card, charge balance off-session).

### Cancellation policy (`pot-standard-60-30`)
| When | Refund |
|---|---|
| 60+ days before check-in | 100% of payments |
| 30 to 59 days | 50% of total |
| Under 30 days | None, except nights rebooked at the same or higher rate |

Plus a **hurricane clause**: pro-rated refund for nights affected by a mandatory evacuation order
covering Hilton Head Island. This mirrors common coastal practice (South Carolina has no statute that
requires it) and protects reviews during storm season. Recommend travel insurance in every quote.
Payment processing fees on refunds: absorb them (Stripe does not return its fee on refunds), or state
in the agreement that a fixed processing amount is non-refundable. **OWNER DECISION.**

### Security deposit vs damage waiver
| Option | Pros | Cons |
|---|---|---|
| Refundable deposit ($300 suggested) charged with the balance, refunded within 7 days | Simple, strong deterrent, no insurer needed | Must be refunded actively; ties up guest funds |
| Card hold (Stripe manual capture) | No money moves | Online card holds are typically valid only 7 days ([Stripe docs](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method)), so a hold placed at the balance date expires before checkout. Only works if placed at check-in for stays of 5 nights or less |
| Damage waiver ($49 to $69, non-refundable, via a third-party insurer) | Smooth guest experience | Cost to guest, limits on coverage, insurer setup |

Recommendation: **refundable deposit** for phase 1 and 2 (manual invoice). In phase 3, either keep the
charged deposit or add a damage protection product. Any portion kept must be itemized with photos.

### Rental agreement (South Carolina)
- Transient stays subject to accommodations tax are excluded from the SC Residential Landlord and
  Tenant Act (S.C. Code 27-40-120(4)); the exclusion ends when the 90-day accommodations tax period
  ends ([SC Attorney General opinion, Nov 17, 2023, summary](https://ezel.ai/ag-opinions/sc/opinion-addressing-whether-a-guest-staying-in-a-hotel-motel-or-other-facility-meant-for-transient-lodging-can-become-a-tenant-for-purposes-of-the-south-carolina-residential-landlord-tenant-act)).
  This is another reason to cap direct stays below 90 nights.
- Use a short e-signed agreement for every direct booking. Include: parties, address (released after
  signing), dates and times, max occupancy (6), named adult renter 21+ staying on site, total price
  with each tax line, payment schedule, deposit terms, cancellation and hurricane clause, house rules
  and Town noise/parking/trash rules, no pets/smoking/events, HOA rules acknowledgement, elevator and
  amenity disclaimer (HOA controlled, no refund for closures), right of entry for repairs, liability
  release for resort amenities, damage and lost-key charges, eviction for violations without refund,
  STR permit number, 24/7 contact and the Town hotline.
- Have a South Carolina attorney review the template once. **TODO_OWNER.**

### Guest screening and ID verification
1. Request form collects name, email, phone, dates, guests (adults/children), trip purpose, and
   an "I am 21+ and will be staying" checkbox.
2. Host checks: plausible trip purpose, group size within 6, no event signals ("birthday party",
   "graduation", local address with one-night weekend stay).
3. Before the agreement: identity verification. Phase 1: ask for a photo of a government ID matching
   the payment name (store briefly, delete after the stay). Phase 3: Stripe Identity can automate this.
4. Payment name must match the renter. Decline third-party bookings for someone else.
5. Prior platform reviews are a plus: ask returning or Airbnb/Vrbo guests for their profile link.

---

## 5. Operations checklist: handling a booking request

**When a request arrives** (email notification + logged)
- [ ] Reply within **12 hours** (config `contact.responseTimeHours`; target 2 hours in daytime).
- [ ] Check availability against Airbnb, Vrbo and the manual block list. If dates are blocked on a
      platform, offer alternatives.
- [ ] Screen the guest (section 4). Ask follow-up questions if needed.
- [ ] Block the dates manually (manual block list) for 48 hours as a soft hold while the guest decides.

**Quote and confirm**
- [ ] Send written quote: nightly breakdown, discount, cleaning fee, each tax line, total, payment
      schedule, deposit, cancellation policy.
- [ ] Send the rental agreement for e-signature and the payment link (Stripe Payment Link or invoice).
- [ ] On payment: confirm by email, block dates on Airbnb and Vrbo (or rely on our iCal export once
      phase 2 is on), add to the cleaning schedule, record the tax collected.
- [ ] If not paid within 48 hours: release the hold and tell the guest.

**Before arrival**
- [ ] 30 days out: charge/invoice the balance and deposit.
- [ ] **7 days before:** arrival guide: gate and parking pass instructions, where to park near
      Building 3, storage locker location, Wi-Fi, check-in 4:00 PM, early check-in answer, grocery
      tips (salt, pepper and oil not provided), community laundry, beach route and shuttle, HOA amenity
      hours note, quiet hours, emergency and host phone, Town hotline.
- [ ] Set the guest's unique door code; test it.
- [ ] **1 day before:** door code, address, gate/parking steps, host phone, "reply if anything is
      unclear". Confirm the cleaner has finished and the unit is ready (photos).

**During stay**
- [ ] Day-1 check-in message (door code worked? parking OK?).
- [ ] Respond to any complaint within 1 hour (Town requirement).

**After checkout**
- [ ] Cleaner report and photos same day; restock starter supplies.
- [ ] Refund the security deposit within 7 days (or itemize deductions).
- [ ] **Day after checkout:** thank-you and review request (Google Business profile or direct
      testimonial with permission; reviews shown on the site must be real and attributed).
- [ ] Delete the ID image; log the stay and taxes for the SCDOR return (frequency assigned at registration) and the quarterly Town return.
- [ ] Offer a returning-guest direct rate for next year.

**Monthly / quarterly / annual**
- [ ] SCDOR ST-388 by the 20th after each period. Town ATAX by April 20, July 20, October 20, January 20.
- [ ] Renew Town business license and STR permit before April 30 (renewal notices arrive in January).
- [ ] Review rate card each December; update `src/content/site.config.ts` and set
      `pricing.isPlaceholder` to false once real rates are entered.
