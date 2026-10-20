// The tailored rate plan: seasons with weeknight and weekend rates, dated events, stay rules.
// Run: npx tsx --test tests/booking/pricing.test.ts
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeQuote, rateForISO, siteConfig, stayRules } from "../../src/content/site.config";
import { addDays, weekday } from "../../src/lib/booking/dates";
import { canArriveOn, canDepartOn, dayInfo, selectionHint } from "../../src/lib/booking/calendar";
import { checkStay, earliestDeparture, minNightsForStay } from "../../src/lib/booking/rules";

const { seasons, events } = siteConfig.pricing;

const inEvent = (iso: string) => events.some((e) => iso >= e.first && iso <= e.last);

/** First night on or after `from` in `season` with the given weekday and no event, within two years. */
function plainNight(seasonName: string, wd: number, from = "2026-11-01"): string {
  for (let i = 0, d = from; i < 800; i++, d = addDays(d, 1)) {
    if (weekday(d) === wd && !inEvent(d) && rateForISO(d).season === seasonName) return d;
  }
  throw new Error(`no ${wd} night in ${seasonName}`);
}

describe("seasons: weeknight and weekend rates", () => {
  test("every season has a distinct, higher weekend rate", () => {
    for (const s of seasons) {
      assert.ok(Number.isFinite(s.nightly) && Number.isFinite(s.weekendNightly), s.name);
      assert.ok(s.weekendNightly > s.nightly, `${s.name}: weekend ${s.weekendNightly} should exceed weeknight ${s.nightly}`);
    }
  });

  for (const s of seasons) {
    test(`${s.name}: Sunday to Thursday at ${s.nightly}, Friday and Saturday at ${s.weekendNightly}`, () => {
      for (const wd of [0, 1, 2, 3, 4]) {
        const r = rateForISO(plainNight(s.name, wd));
        assert.equal(r.nightly, s.nightly);
        assert.equal(r.kind, "weeknight");
        assert.equal(r.label, `${s.name} weeknight`);
        assert.equal(r.minNights, s.minNights);
      }
      for (const wd of [5, 6]) {
        const r = rateForISO(plainNight(s.name, wd));
        assert.equal(r.nightly, s.weekendNightly);
        assert.equal(r.kind, "weekend");
        assert.equal(r.label, `${s.name} weekend`);
      }
    });
  }

  test("the seasons cover every night of a leap year exactly once", () => {
    for (let d = "2028-01-01"; d <= "2028-12-31"; d = addDays(d, 1)) {
      const [m, day] = [Number(d.slice(5, 7)), Number(d.slice(8, 10))];
      const v = m * 100 + day;
      const hits = seasons.filter((s) => {
        const a = Number(s.start.replace("-", ""));
        const b = Number(s.end.replace("-", ""));
        return a <= b ? v >= a && v <= b : v >= a || v <= b;
      });
      assert.equal(hits.length, 1, d);
    }
  });
});

describe("dated events", () => {
  test("events are well formed, dated within 2026-10 to 2028-01, and cite a source", () => {
    for (const e of events) {
      assert.match(e.first, /^\d{4}-\d{2}-\d{2}$/);
      assert.match(e.last, /^\d{4}-\d{2}-\d{2}$/);
      assert.ok(e.first <= e.last, e.id);
      assert.ok(e.first >= "2026-10-01" && e.last <= "2028-01-01", e.id);
      assert.ok(e.source.length > 10, `${e.id} needs a source`);
      assert.ok(e.minNights >= 1, e.id);
    }
    assert.equal(new Set(events.map((e) => e.id)).size, events.length);
  });

  for (const e of events) {
    test(`${e.name} (${e.first} to ${e.last}) prices exactly its own nights`, () => {
      for (let d = e.first; d <= e.last; d = addDays(d, 1)) {
        const r = rateForISO(d);
        // A night inside an earlier-listed overlapping event (Easter inside spring break) belongs to it.
        const owner = events.find((x) => d >= x.first && d <= x.last)!;
        if (owner.id !== e.id) continue;
        const wkend = weekday(d) === 5 || weekday(d) === 6;
        assert.equal(r.kind, "event", d);
        assert.equal(r.label, e.name, d);
        assert.equal(r.nightly, wkend && e.weekendNightly ? e.weekendNightly : e.nightly, d);
        assert.equal(r.minNights, e.minNights, d);
      }
      // Boundary nights: the night before the first and after the last are not this event.
      assert.notEqual(rateForISO(addDays(e.first, -1)).label, e.name, `night before ${e.first}`);
      assert.notEqual(rateForISO(addDays(e.last, 1)).label, e.name, `night after ${e.last}`);
    });
  }

  test("verified anchor dates", () => {
    // RBC Heritage, Harbour Town Golf Links, Apr 15 to 18, 2027 (pgatour.com): the tournament nights are inside the week.
    for (const d of ["2027-04-14", "2027-04-15", "2027-04-16", "2027-04-17"]) assert.equal(rateForISO(d).label, "RBC Heritage week", d);
    assert.equal(rateForISO("2027-04-18").label, "Spring weeknight");
    // Easter Sunday Mar 28, 2027: Thursday to Saturday nights before it.
    assert.equal(rateForISO("2027-03-27").label, "Easter weekend");
    assert.equal(rateForISO("2027-03-28").label, "Spring break weeks");
    // Thanksgiving Thu Nov 26, 2026 and Thu Nov 25, 2027.
    assert.equal(rateForISO("2026-11-26").label, "Thanksgiving week");
    assert.equal(rateForISO("2027-11-25").label, "Thanksgiving week");
    // Memorial Day Mon May 31, 2027; Labor Day Mon Sep 6, 2027: Friday to Sunday nights.
    assert.deepEqual(["2027-05-27", "2027-05-28", "2027-05-30", "2027-05-31"].map((d) => rateForISO(d).kind), ["weeknight", "event", "event", "weeknight"]);
    assert.deepEqual(["2027-09-02", "2027-09-03", "2027-09-05", "2027-09-06"].map((d) => rateForISO(d).kind), ["weeknight", "event", "event", "weeknight"]);
    // Fourth of July (a Sunday in 2027).
    assert.equal(rateForISO("2027-07-04").label, "Fourth of July week");
  });

  test("events carry a premium over the season they sit in", () => {
    for (const e of events) {
      const season = seasons.find((s) => s.name === rateForISO(e.first).season)!;
      assert.ok(e.nightly > season.nightly, `${e.id}: ${e.nightly} vs ${season.name} ${season.nightly}`);
    }
  });
});

describe("stay rules", () => {
  test("minimum nights is the largest requirement of any night in the stay", () => {
    assert.equal(minNightsForStay("2027-04-07", "2027-04-09"), 4); // spring break only
    assert.equal(minNightsForStay("2027-04-07", "2027-04-11"), 5); // reaches RBC Heritage week
    assert.equal(minNightsForStay("2027-03-01", "2027-03-04"), 3); // Early spring
    assert.equal(stayRules("2027-04-07", "2027-04-11").minNightsReason, "RBC Heritage week");
  });

  test("event minimum is enforced by computeQuote and checkStay", () => {
    const today = "2026-10-20";
    const short = checkStay({ checkIn: "2027-04-10", checkOut: "2027-04-13", guests: 2, today, blocked: [] });
    assert.equal(short.quote.meetsMinNights, false);
    const p = short.problems.find((x) => x.code === "min_nights");
    assert.ok(p && p.message === "Stays that include RBC Heritage week have a 5-night minimum.", JSON.stringify(short.problems));
    const ok = checkStay({ checkIn: "2027-04-10", checkOut: "2027-04-15", guests: 2, today, blocked: [] });
    assert.deepEqual(ok.problems, []);
  });

  test("arrival days: RBC Heritage week arrivals are Saturday or Sunday", () => {
    const today = "2026-10-20";
    const wed = checkStay({ checkIn: "2027-04-14", checkOut: "2027-04-20", guests: 2, today, blocked: [] });
    assert.deepEqual(
      wed.problems.map((x) => x.code),
      ["arrival_day"],
    );
    const sun = checkStay({ checkIn: "2027-04-11", checkOut: "2027-04-17", guests: 2, today, blocked: [] });
    assert.deepEqual(sun.problems, []);
    // Arriving before the event and staying through it is fine.
    const fri = checkStay({ checkIn: "2027-04-09", checkOut: "2027-04-16", guests: 2, today, blocked: [] });
    assert.deepEqual(fri.problems, []);
  });

  test("calendar: arrival-day rule, growing minimum, and the hint", () => {
    const ctx = { today: "2026-10-20", blocked: new Set<string>() };
    assert.equal(canArriveOn("2027-04-14", ctx), "arrival-day");
    assert.equal(canArriveOn("2027-04-10", ctx), true);
    assert.match(dayInfo("2027-04-14", { ...ctx, selection: { checkIn: null, checkOut: null } }).label, /Arrivals during RBC Heritage week are on Saturday or Sunday/);
    // Arriving Wed Apr 7 (spring break, 4-night minimum): 3 nights is short, and a 4-night stay that reaches RBC Heritage week needs 5.
    assert.equal(canDepartOn("2027-04-10", "2027-04-07", ctx.blocked), "below-min"); // 3 nights < 4
    assert.equal(canDepartOn("2027-04-11", "2027-04-07", ctx.blocked), "below-min"); // 4 nights, reaches RBC (5)
    assert.equal(canDepartOn("2027-04-12", "2027-04-07", ctx.blocked), true);
    assert.deepEqual(earliestDeparture("2027-04-07"), { date: "2027-04-12", minNights: 5, reason: "RBC Heritage week", fromEvent: true });
    assert.equal(selectionHint({ checkIn: "2027-04-07", checkOut: null }).text, "Choose a departure date. 5-night minimum for RBC Heritage week: depart on or after Mon 12 Apr.");
    assert.equal(selectionHint({ checkIn: "2027-01-12", checkOut: null }).text, "Choose a departure date. 3-night minimum: depart on or after Fri 15 Jan.");
  });
});

describe("discounts and wraps", () => {
  test("weekly and monthly discounts apply to lodging only and do not stack", () => {
    const week = computeQuote("2027-10-03", "2027-10-10", 2);
    assert.equal(week.discountLabel, `Weekly stay discount (${siteConfig.pricing.weeklyDiscountPct}%)`);
    assert.equal(week.discounts, Math.round(week.subtotal * siteConfig.pricing.weeklyDiscountPct) / 100);
    const month = computeQuote("2027-01-04", "2027-02-04", 2);
    assert.equal(month.discountLabel, `Monthly stay discount (${siteConfig.pricing.monthlyDiscountPct}%)`);
    const six = computeQuote("2027-10-03", "2027-10-09", 2);
    assert.equal(six.discounts, 0);
    assert.equal(week.cleaningFee, siteConfig.pricing.cleaningFee);
  });

  test("taxes stay at the researched 10% on lodging after discount plus cleaning", () => {
    assert.equal(siteConfig.pricing.taxes.reduce((s, t) => s + t.rate, 0).toFixed(4), "0.1000");
    const q = computeQuote("2027-10-03", "2027-10-10", 2);
    assert.equal(q.taxableAmount, Math.round((q.subtotal - q.discounts + q.cleaningFee) * 100) / 100);
  });

  test("a stay over the year end crosses events and seasons", () => {
    const q = computeQuote("2027-12-27", "2028-01-04", 2);
    assert.deepEqual(
      q.nightlyBreakdown.map((n) => n.label),
      [
        "Christmas",
        "Holidays weeknight",
        "New Year's",
        "New Year's",
        "New Year's",
        "New Year's",
        "Holidays weeknight",
        "Winter weeknight",
      ],
    );
    assert.equal(q.minNightsRequired, 4); // the Christmas night asks for 4
  });

  test("placeholder flag stays on until the owner confirms", () => {
    assert.equal(siteConfig.pricing.isPlaceholder, true);
  });
});
