// Run: npx tsx --test tests/booking/reserve.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeQuote, siteConfig } from "../../src/content/site.config";
import { policies } from "../../src/content/policies";
import {
  averagePerNight,
  balanceDueDate,
  cancellationDates,
  formatMonthDay,
  groupNightsBySeasonRate,
  isSeasonStart,
  paymentSchedule,
  paymentTerms,
  pct,
  rateForNight,
  seasonRows,
  seasonSpansInMonth,
  securityDepositAmount,
  tierDayBounds,
} from "../../src/lib/booking/reserve";

describe("nightly rates and folio grouping", () => {
  test("rateForNight matches computeQuote's nightly breakdown", () => {
    const q = computeQuote("2027-04-15", "2027-04-25", 2);
    for (const n of q.nightlyBreakdown) assert.equal(rateForNight(n.date).nightly, n.rate, n.date);
  });

  test("groups nights by season and rate, in order, and the groups add up to the subtotal", () => {
    // Thu 15 Apr to Mon 19 Apr 2027, spring: Thu and Sun at the weeknight rate, Fri and Sat at the weekend rate.
    const q = computeQuote("2027-04-15", "2027-04-19", 2);
    const g = groupNightsBySeasonRate(q);
    assert.deepEqual(
      g.map((x) => [x.season, x.rate, x.nights, x.amount, x.first, x.last]),
      [
        ["Spring", 195, 2, 390, "2027-04-15", "2027-04-18"],
        ["Spring", 215, 2, 430, "2027-04-16", "2027-04-17"],
      ],
    );
    assert.equal(g.reduce((s, x) => s + x.amount, 0), q.subtotal);
  });

  test("a stay across a season change keeps each season's rate apart", () => {
    const q = computeQuote("2027-05-19", "2027-05-26", 2);
    const seasons = new Set(groupNightsBySeasonRate(q).map((x) => x.season));
    assert.deepEqual([...seasons], ["Spring", "Summer"]);
    assert.equal(groupNightsBySeasonRate(q).reduce((s, x) => s + x.amount, 0), q.subtotal);
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

describe("seasons", () => {
  test("rate table rows come straight from the config", () => {
    const rows = seasonRows();
    assert.equal(rows.length, siteConfig.pricing.seasons.length);
    const spring = rows.find((r) => r.name === "Spring")!;
    assert.deepEqual(spring, { name: "Spring", dates: "Mar 1 to May 21", from: 195, weekend: 215, weeknight: 195, minNights: 3 });
    const winter = rows.find((r) => r.name === "Winter")!;
    assert.equal(winter.weekend, null);
    assert.equal(winter.from, 145);
    assert.equal(formatMonthDay("12-20"), "Dec 20");
  });

  test("season spans within a month and season starts", () => {
    assert.deepEqual(seasonSpansInMonth("2027-05-01"), [
      { season: "Spring", from: "2027-05-01", to: "2027-05-21" },
      { season: "Summer", from: "2027-05-22", to: "2027-05-31" },
    ]);
    assert.deepEqual(
      seasonSpansInMonth("2027-01-01").map((s) => s.season),
      ["Holidays", "Winter"],
    );
    assert.equal(seasonSpansInMonth("2027-07-01").length, 1);
    assert.equal(isSeasonStart("2027-05-22"), true);
    assert.equal(isSeasonStart("2027-05-21"), false);
    assert.equal(isSeasonStart("2026-12-20"), true);
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
