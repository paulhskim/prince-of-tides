// Quick checks for computeQuote and the tailored rate plan. Run: npx tsx scripts/test-quote.mjs
// (Also try: TZ=Pacific/Auckland npx tsx scripts/test-quote.mjs and TZ=America/Los_Angeles ...)
import assert from "node:assert/strict";
import { computeQuote, getNightlyRate, rateForISO, siteConfig } from "../src/content/site.config.ts";

const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const TAX = siteConfig.pricing.taxes.reduce((s, t) => s + t.rate, 0);
let failures = 0;

/** Expected totals from a subtotal, the way computeQuote rounds them (per tax line). */
function totalsFor(subtotal, discountPct = 0) {
  const discounts = r2((subtotal * discountPct) / 100);
  const taxableAmount = r2(subtotal - discounts + siteConfig.pricing.cleaningFee);
  const taxTotal = r2(siteConfig.pricing.taxes.reduce((s, t) => s + r2(taxableAmount * t.rate), 0));
  return { discounts, taxableAmount, taxTotal, total: r2(taxableAmount + taxTotal) };
}

function check(label, q, expect) {
  try {
    for (const [k, v] of Object.entries(expect)) assert.deepEqual(q[k], v, `${label}: ${k}`);
    // Invariants
    const sum = r2(q.nightlyBreakdown.reduce((s, n) => s + n.rate, 0));
    assert.equal(q.subtotal, sum, `${label}: subtotal = sum of nights`);
    assert.equal(q.taxableAmount, r2(q.subtotal - q.discounts + q.cleaningFee), `${label}: taxable`);
    assert.equal(q.total, r2(q.taxableAmount + q.taxTotal), `${label}: total`);
    assert.ok(Math.abs(q.taxTotal - q.taxableAmount * TAX) < 0.03, `${label}: tax approx`);
    for (const n of q.nightlyBreakdown) {
      assert.ok(["event", "weekend", "weeknight"].includes(n.kind), `${label}: kind ${n.kind}`);
      assert.ok(n.label.length > 0, `${label}: label`);
    }
    console.log(`PASS ${label}: ${q.nights} nights, subtotal ${q.subtotal}, discount ${q.discounts}, tax ${q.taxTotal}, total ${q.total}, min ${q.minNightsRequired}, errors ${JSON.stringify(q.errors)}`);
  } catch (e) {
    failures++;
    console.error(`FAIL ${e.message}`);
    console.error(JSON.stringify(q, null, 2));
  }
}

const night = (date, rate, season, label, kind) => ({ date, rate, season, label, kind });

// 1. High summer week: Sat 2027-07-10 to Sat 2027-07-17. Fri/Sat 285, Sun to Thu 255, weekly 10% off.
{
  const q = computeQuote("2027-07-10", "2027-07-17", 4);
  const sub = 2 * 285 + 5 * 255;
  check("high summer week", q, {
    nights: 7,
    subtotal: sub,
    discountLabel: "Weekly stay discount (10%)",
    ...totalsFor(sub, 10),
    minNightsRequired: 5,
    meetsMinNights: true,
    errors: [],
  });
}

// 2. Winter month: 2027-01-04 (Mon) to 2027-02-01 = 28 nights, 8 weekend nights at 155, 20 weeknights at 135; monthly 25% off.
{
  const q = computeQuote("2027-01-04", "2027-02-01", 2);
  const sub = 8 * 155 + 20 * 135;
  check("winter month", q, {
    nights: 28,
    subtotal: sub,
    discountLabel: "Monthly stay discount (25%)",
    ...totalsFor(sub, 25),
    minNightsRequired: 3,
    meetsMinNights: true,
  });
}

// 3. Season boundary: Thu 2027-05-20 to Mon 2027-05-24 (Spring into Early summer).
{
  const q = computeQuote("2027-05-20", "2027-05-24", 6);
  check("season boundary", q, {
    nights: 4,
    nightlyBreakdown: [
      night("2027-05-20", 190, "Spring", "Spring weeknight", "weeknight"),
      night("2027-05-21", 225, "Spring", "Spring weekend", "weekend"),
      night("2027-05-22", 255, "Early summer", "Early summer weekend", "weekend"),
      night("2027-05-23", 225, "Early summer", "Early summer weeknight", "weeknight"),
    ],
    subtotal: 895,
    discounts: 0,
    minNightsRequired: 4, // the Early summer nights ask for 4
    meetsMinNights: true,
  });
}

// 4. Year-end wrap: 2026-12-30 to 2027-01-05. New Year's event (225) Dec 30 to Jan 1, Holidays weekend Jan 2, Winter after.
{
  const q = computeQuote("2026-12-30", "2027-01-05", 3);
  check("year-end wrap", q, {
    nights: 6,
    nightlyBreakdown: [
      night("2026-12-30", 225, "Holidays", "New Year's", "event"),
      night("2026-12-31", 225, "Holidays", "New Year's", "event"),
      night("2027-01-01", 225, "Holidays", "New Year's", "event"),
      night("2027-01-02", 185, "Holidays", "Holidays weekend", "weekend"),
      night("2027-01-03", 135, "Winter", "Winter weeknight", "weeknight"),
      night("2027-01-04", 135, "Winter", "Winter weeknight", "weeknight"),
    ],
    subtotal: 1130,
    minNightsRequired: 3,
    meetsMinNights: true,
  });
}

// 5. Below minimum: 2 nights in high summer (min 5).
{
  const q = computeQuote("2027-06-14", "2027-06-16", 2);
  check("below min nights", q, {
    nights: 2,
    subtotal: 510,
    minNightsRequired: 5,
    meetsMinNights: false,
    errors: ["This season has a 5-night minimum."],
  });
}

// 6. Spring break into RBC Heritage week: Wed 2027-04-07 to Mon 2027-04-12.
{
  const q = computeQuote("2027-04-07", "2027-04-12", 2);
  check("spring break into RBC Heritage week", q, {
    nights: 5,
    nightlyBreakdown: [
      night("2027-04-07", 230, "Spring", "Spring break weeks", "event"),
      night("2027-04-08", 230, "Spring", "Spring break weeks", "event"),
      night("2027-04-09", 255, "Spring", "Spring break weeks", "event"),
      night("2027-04-10", 345, "Spring", "RBC Heritage week", "event"),
      night("2027-04-11", 325, "Spring", "RBC Heritage week", "event"),
    ],
    subtotal: 1385,
    minNightsRequired: 5,
    minNightsReason: "RBC Heritage week",
    meetsMinNights: true,
    meetsArrivalDay: true,
    errors: [],
  });
}

// 7. Event minimum: a 4-night stay touching RBC Heritage week fails its 5-night minimum.
{
  const q = computeQuote("2027-04-07", "2027-04-11", 2);
  check("RBC Heritage minimum", q, {
    nights: 4,
    minNightsRequired: 5,
    meetsMinNights: false,
    errors: ["Stays that include RBC Heritage week have a 5-night minimum."],
  });
}

// 8. Arrival day: RBC Heritage week arrivals are Saturday or Sunday.
{
  const bad = computeQuote("2027-04-14", "2027-04-19", 2); // Wednesday
  check("RBC Heritage arrival day", bad, {
    meetsArrivalDay: false,
    arrivalRule: "Arrivals during RBC Heritage week are on Saturday or Sunday.",
    errors: ["Arrivals during RBC Heritage week are on Saturday or Sunday."],
  });
  const ok = computeQuote("2027-04-10", "2027-04-17", 2); // Saturday to Saturday
  check("RBC Heritage golf week", ok, {
    nights: 7,
    subtotal: 345 + 5 * 325 + 345,
    meetsArrivalDay: true,
    discountLabel: "Weekly stay discount (10%)",
    errors: [],
  });
}

// 9. Memorial Day weekend: 3 nights are enough inside the event even though Early summer asks for 4.
{
  const q = computeQuote("2027-05-28", "2027-05-31", 2);
  check("Memorial Day weekend", q, { nights: 3, subtotal: 3 * 265, minNightsRequired: 3, meetsMinNights: true, errors: [] });
}

// 10. Late fall into Thanksgiving week 2026: Wed Nov 18 to Mon Nov 23.
{
  const q = computeQuote("2026-11-18", "2026-11-23", 4);
  check("late fall into Thanksgiving", q, {
    nights: 5,
    subtotal: 140 + 140 + 160 + 195 + 185,
    minNightsRequired: 4,
    meetsMinNights: true,
  });
}

// 11. Leap day, timezone-safe weekday, and invalid inputs.
{
  assert.equal(getNightlyRate(new Date(2028, 1, 29, 12)).season, "Early spring");
  assert.equal(rateForISO("2027-03-05").kind, "weekend"); // a Friday
  assert.equal(rateForISO("2027-03-07").kind, "weeknight"); // a Sunday
  const bad = computeQuote("2027-02-30", "2027-03-02", 2);
  assert.deepEqual(bad.errors, ["Invalid check-in date."]);
  const over = computeQuote("2027-03-01", "2027-03-05", 7);
  assert.ok(over.errors.includes("The condo sleeps up to 6 guests."));
  const reversed = computeQuote("2027-03-05", "2027-03-01", 2);
  assert.deepEqual(reversed.errors, ["Check-out must be after check-in."]);
  console.log("PASS leap day, weekday and validation");
}

console.log(`\nTimezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.log("All quote tests passed.");
