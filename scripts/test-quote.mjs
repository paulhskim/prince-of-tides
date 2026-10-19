// Quick checks for computeQuote. Run: npx tsx scripts/test-quote.mjs
// (Also try: TZ=Pacific/Auckland npx tsx scripts/test-quote.mjs and TZ=America/Los_Angeles ...)
import assert from "node:assert/strict";
import { computeQuote, getNightlyRate, siteConfig } from "../src/content/site.config.ts";

const r2 = (n) => Math.round(n * 100) / 100;
const TAX = siteConfig.pricing.taxes.reduce((s, t) => s + t.rate, 0);
let failures = 0;

function check(label, q, expect) {
  try {
    for (const [k, v] of Object.entries(expect)) assert.deepEqual(q[k], v, `${label}: ${k}`);
    // Invariants
    const sum = r2(q.nightlyBreakdown.reduce((s, n) => s + n.rate, 0));
    assert.equal(q.subtotal, sum, `${label}: subtotal = sum of nights`);
    assert.equal(q.taxableAmount, r2(q.subtotal - q.discounts + q.cleaningFee), `${label}: taxable`);
    assert.equal(q.total, r2(q.taxableAmount + q.taxTotal), `${label}: total`);
    assert.ok(Math.abs(q.taxTotal - q.taxableAmount * TAX) < 0.03, `${label}: tax approx`);
    console.log(`PASS ${label}: ${q.nights} nights, subtotal ${q.subtotal}, discount ${q.discounts}, tax ${q.taxTotal}, total ${q.total}, min ${q.minNightsRequired}, errors ${JSON.stringify(q.errors)}`);
  } catch (e) {
    failures++;
    console.error(`FAIL ${e.message}`);
    console.error(JSON.stringify(q, null, 2));
  }
}

// 1. Summer week: Sat 2027-07-10 to Sat 2027-07-17, 7 nights x 265, weekly 10% off.
{
  const q = computeQuote("2027-07-10", "2027-07-17", 4);
  const sub = 7 * 265;
  const disc = r2(sub * 0.1);
  const taxable = r2(sub - disc + 185);
  check("summer week", q, {
    nights: 7,
    subtotal: sub,
    discounts: disc,
    discountLabel: "Weekly stay discount (10%)",
    taxableAmount: taxable,
    // Taxes are rounded per line: 92.73 + 37.09 + 18.55 + 37.09 = 185.46 (not 185.45).
    taxTotal: 185.46,
    total: 2039.96,
    minNightsRequired: 5,
    meetsMinNights: true,
    errors: [],
  });
}

// 2. Winter month: 2027-01-04 to 2027-02-01 = 28 nights x 145, monthly 25% off.
{
  const q = computeQuote("2027-01-04", "2027-02-01", 2);
  const sub = 28 * 145;
  check("winter month", q, {
    nights: 28,
    subtotal: sub,
    discounts: r2(sub * 0.25),
    discountLabel: "Monthly stay discount (25%)",
    minNightsRequired: 3,
    meetsMinNights: true,
  });
}

// 3. Season boundary: Thu 2027-05-20 to Mon 2027-05-24.
//    May 20 Thu spring weekday 195, May 21 Fri spring weekend 215, May 22 Sat summer 265, May 23 Sun summer 265.
{
  const q = computeQuote("2027-05-20", "2027-05-24", 6);
  check("season boundary", q, {
    nights: 4,
    nightlyBreakdown: [
      { date: "2027-05-20", rate: 195, season: "Spring" },
      { date: "2027-05-21", rate: 215, season: "Spring" },
      { date: "2027-05-22", rate: 265, season: "Summer" },
      { date: "2027-05-23", rate: 265, season: "Summer" },
    ],
    subtotal: 940,
    discounts: 0,
    minNightsRequired: 3,
    meetsMinNights: true,
  });
}

// 4. Year-end wrap: 2026-12-30 to 2027-01-05. Dec 30, 31, Jan 1, 2 holidays 195; Jan 3, 4 winter 145.
{
  const q = computeQuote("2026-12-30", "2027-01-05", 3);
  check("year-end wrap", q, {
    nights: 6,
    nightlyBreakdown: [
      { date: "2026-12-30", rate: 195, season: "Holidays" },
      { date: "2026-12-31", rate: 195, season: "Holidays" },
      { date: "2027-01-01", rate: 195, season: "Holidays" },
      { date: "2027-01-02", rate: 195, season: "Holidays" },
      { date: "2027-01-03", rate: 145, season: "Winter" },
      { date: "2027-01-04", rate: 145, season: "Winter" },
    ],
    subtotal: 1070,
    minNightsRequired: 4,
    meetsMinNights: true,
  });
}

// 5. Below minimum: 2 nights in summer (min 5).
{
  const q = computeQuote("2027-06-14", "2027-06-16", 2);
  check("below min nights", q, {
    nights: 2,
    subtotal: 530,
    minNightsRequired: 5,
    meetsMinNights: false,
    errors: ["This season has a 5-night minimum."],
  });
}

// 6. Leap day and invalid inputs.
{
  assert.equal(getNightlyRate(new Date(2028, 1, 29, 12)).season, "Winter");
  const bad = computeQuote("2027-02-30", "2027-03-02", 2);
  assert.deepEqual(bad.errors, ["Invalid check-in date."]);
  const over = computeQuote("2027-03-01", "2027-03-05", 7);
  assert.ok(over.errors.includes("The condo sleeps up to 6 guests."));
  const reversed = computeQuote("2027-03-05", "2027-03-01", 2);
  assert.deepEqual(reversed.errors, ["Check-out must be after check-in."]);
  console.log("PASS leap day and validation");
}

console.log(`\nTimezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log("All quote tests passed.");
