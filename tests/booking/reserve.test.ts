// Run: npx tsx --test tests/booking/reserve.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeQuote, siteConfig } from "../../src/content/site.config";
import { policies } from "../../src/content/policies";
import {
  averagePerNight,
  balanceDueDate,
  cancellationDates,
  eventsInQuote,
  groupNightRuns,
  minimumStaySummary,
  nightsPhrase,
  paymentSchedule,
  paymentTerms,
  pct,
  rateForNight,
  securityDepositAmount,
  tierDayBounds,
} from "../../src/lib/booking/reserve";

describe("nightly rates and folio grouping", () => {
  test("rateForNight matches computeQuote's nightly breakdown", () => {
    const q = computeQuote("2027-04-15", "2027-04-25", 2);
    for (const n of q.nightlyBreakdown) {
      const r = rateForNight(n.date);
      assert.equal(r.nightly, n.rate, n.date);
      assert.equal(r.label, n.label, n.date);
      assert.equal(r.kind, n.kind, n.date);
    }
  });

  test("groups consecutive nights by rate and reason, in date order, adding up to the subtotal", () => {
    // Sat 17 Apr to Fri 23 Apr 2027: the last RBC Heritage night, then Spring weeknights and a weekend night.
    const q = computeQuote("2027-04-17", "2027-04-24", 2);
    const g = groupNightRuns(q);
    assert.deepEqual(
      g.map((x) => [x.name, x.kind, x.rate, x.nights, x.amount, x.first, x.last]),
      [
        ["RBC Heritage week", "event", 345, 1, 345, "2027-04-17", "2027-04-17"],
        ["Spring", "weeknight", 190, 5, 950, "2027-04-18", "2027-04-22"],
        ["Spring", "weekend", 225, 1, 225, "2027-04-23", "2027-04-23"],
      ],
    );
    assert.equal(g.reduce((s, x) => s + x.amount, 0), q.subtotal);
    assert.deepEqual(g.map(nightsPhrase), ["1 weekend night", "5 weeknights", "1 weekend night"]);
    assert.deepEqual(eventsInQuote(q), ["RBC Heritage week"]);
  });

  test("event weekend nights at the event's weekend rate read as weekend nights", () => {
    // Wed 7 Apr to Wed 14 Apr 2027: spring break (Wed, Thu, then Fri at its weekend rate), RBC Heritage (Sat, then Sun to Tue).
    const g = groupNightRuns(computeQuote("2027-04-07", "2027-04-14", 2));
    assert.deepEqual(
      g.map((x) => `${nightsPhrase(x)}, ${x.name}, ${x.rate}`),
      ["2 nights, Spring break weeks, 230", "1 weekend night, Spring break weeks, 255", "1 weekend night, RBC Heritage week, 345", "3 nights, RBC Heritage week, 325"],
    );
    // An event with one flat rate (Easter weekend) does not split out its Friday and Saturday.
    const easter = groupNightRuns(computeQuote("2027-03-25", "2027-03-28", 2));
    assert.deepEqual(easter.map((x) => `${nightsPhrase(x)}, ${x.name}`), ["3 nights, Easter weekend"]);
  });

  test("weekend nights between weeknights start a new line, so the folio reads in date order", () => {
    // Thu 4 Nov to Tue 9 Nov 2027, Late fall: Thu, then Fri and Sat, then Sun and Mon.
    const g = groupNightRuns(computeQuote("2027-11-04", "2027-11-09", 2));
    assert.deepEqual(
      g.map((x) => [x.kind, x.rate, x.nights]),
      [
        ["weeknight", 140, 1],
        ["weekend", 160, 2],
        ["weeknight", 140, 2],
      ],
    );
  });

  test("a stay across a season change keeps each season apart", () => {
    const q = computeQuote("2027-05-19", "2027-05-26", 2);
    const names = new Set(groupNightRuns(q).map((x) => x.name));
    assert.deepEqual([...names], ["Spring", "Early summer"]);
    assert.equal(groupNightRuns(q).reduce((s, x) => s + x.amount, 0), q.subtotal);
  });

  test("averages: lodging after discount, and all in", () => {
    const q = computeQuote("2027-01-10", "2027-01-18", 2); // 8 winter nights, weekly discount
    assert.ok(q.discounts > 0);
    const a = averagePerNight(q);
    assert.equal(a.lodging, Math.round(((q.subtotal - q.discounts) / 8) * 100) / 100);
    assert.equal(a.allIn, Math.round((q.total / 8) * 100) / 100);
    assert.deepEqual(averagePerNight({ nights: 0, subtotal: 0, discounts: 0, total: 0 }), { lodging: 0, allIn: 0 });
  });
});

describe("minimum stay hint", () => {
  test("names minimums only, never a price", () => {
    const s = minimumStaySummary();
    assert.match(s, new RegExp(`^Minimum stay ${siteConfig.booking.minNightsDefault} nights`));
    assert.match(s, /5 in high summer/);
    assert.match(s, /island-event weeks/);
    assert.ok(!s.includes("$"), s);
  });
});

describe("payment schedule", () => {
  test("terms follow the configured policy (50% to confirm, balance 30 days out)", () => {
    assert.equal(siteConfig.booking.depositPolicy, policies.payment.id);
    assert.deepEqual(paymentTerms(), { depositPct: 50, balanceDaysBefore: 30 });
    assert.match(policies.payment.summary, /50%/);
    assert.match(policies.payment.summary, /30 days before check-in/);
  });

  test("balance due date is computed from the arrival", () => {
    assert.equal(balanceDueDate("2027-06-30"), "2027-05-31");
    assert.equal(balanceDueDate("2027-03-15"), "2027-02-13");
    assert.equal(balanceDueDate("2028-03-15"), "2028-02-14"); // leap year
  });

  test("deposit and balance split the total exactly", () => {
    const s = paymentSchedule(1234.57, "2027-06-30", "2027-03-01");
    assert.equal(s.fullAtConfirmation, false);
    assert.equal(s.depositPct, 50);
    assert.equal(s.balanceDue, "2027-05-31");
    assert.equal(Math.round((s.deposit + s.balance) * 100), 123457);
    assert.ok(Math.abs(s.deposit - s.balance) <= 0.01);
  });

  test("inside the balance window everything is due at confirmation", () => {
    for (const today of ["2027-05-31", "2027-06-10"]) {
      const s = paymentSchedule(1000, "2027-06-30", today);
      assert.deepEqual(s, { depositPct: 100, deposit: 1000, balance: 0, balanceDue: null, fullAtConfirmation: true }, today);
    }
    assert.equal(paymentSchedule(1000, "2027-06-30", "2027-05-30").fullAtConfirmation, false);
  });
});

describe("cancellation dates", () => {
  test("tier bounds are read from the policy wording", () => {
    assert.deepEqual(tierDayBounds("60 or more days before check-in"), { minDays: 60, maxDays: null });
    assert.deepEqual(tierDayBounds("30 to 59 days before check-in"), { minDays: 30, maxDays: 59 });
    assert.deepEqual(tierDayBounds("Less than 30 days before check-in"), { minDays: 0, maxDays: 29 });
    assert.equal(tierDayBounds("whenever"), null);
  });

  test("tiers become contiguous dates for an arrival", () => {
    const t = cancellationDates("2027-06-30", "2027-03-01");
    assert.equal(t.length, policies.cancellation.tiers.length);
    assert.deepEqual(
      t.map((x) => [x.from, x.until, x.passed]),
      [
        [null, "2027-05-01", false],
        ["2027-05-02", "2027-05-31", false],
        ["2027-06-01", "2027-06-30", false],
      ],
    );
    assert.equal(t[0].refund, policies.cancellation.tiers[0].refund);
  });

  test("tiers already over are flagged as passed", () => {
    const t = cancellationDates("2027-06-30", "2027-05-15");
    assert.deepEqual(
      t.map((x) => x.passed),
      [true, false, false],
    );
  });
});

describe("security deposit and labels", () => {
  test("no amount while the owner placeholder is set", () => {
    assert.equal(securityDepositAmount("TODO_OWNER: amount (suggested $300)"), null);
    assert.equal(securityDepositAmount("$300"), 300);
    assert.equal(securityDepositAmount("1,250.50"), 1250.5);
  });

  test("percent labels", () => {
    assert.equal(pct(0.05), "5%");
    assert.equal(pct(0.1), "10%");
    assert.equal(pct(0.025), "2.5%");
  });
});
