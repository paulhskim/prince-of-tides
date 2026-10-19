// Run: npx tsx --test tests/booking/*.test.ts
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { siteConfig } from "../../src/content/site.config";
import { parseIcsToRanges, buildIcs } from "../../src/lib/booking/ical";
import { blockedNightsBetween, isRangeFree, mergeRanges } from "../../src/lib/booking/ranges";
import { getBlockedRanges, publicAvailability } from "../../src/lib/booking/availability";
import { createStore, type BookingRecord } from "../../src/lib/booking/store";
import { canArriveOn, dayInfo, selectDay } from "../../src/lib/booking/calendar";
import { computeQuote } from "../../src/content/site.config";

const ics = (events: string) => `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Airbnb Inc//Hosting Calendar//EN\r\n${events}END:VCALENDAR\r\n`;

const AIRBNB = ics(
  [
    "BEGIN:VEVENT",
    "DTSTAMP:20261019T120000Z",
    "DTSTART;VALUE=DATE:20270110",
    "DTEND;VALUE=DATE:20270113",
    "SUMMARY:Reserved",
    "UID:1418fb94e984-abc@airbnb.com",
    "END:VEVENT",
    "BEGIN:VEVENT",
    "DTSTAMP:20261019T120000Z",
    "DTSTART;VALUE=DATE:20270113",
    "DTEND;VALUE=DATE:20270115",
    "SUMMARY:Airbnb (Not available)",
    "UID:1418fb94e984-def@airbnb.com",
    "END:VEVENT",
    "",
  ].join("\r\n"),
);

const VRBO_TIMED = ics(
  [
    "BEGIN:VEVENT",
    "UID:vrbo-1",
    "DTSTART;TZID=America/New_York:20270120T160000",
    "DTEND;TZID=America/New_York:20270122T100000",
    "SUMMARY:Reserved - Guest",
    "END:VEVENT",
    // 03:00Z on Feb 1 is 22:00 on Jan 31 in New York: blocks the night of Jan 31.
    "BEGIN:VEVENT",
    "UID:vrbo-2",
    "DTSTART:20270201T030000Z",
    "DTEND:20270203T150000Z",
    "END:VEVENT",
    // Malformed: no DTSTART. Must be skipped, not crash.
    "BEGIN:VEVENT",
    "UID:vrbo-bad",
    "SUMMARY:Broken",
    "END:VEVENT",
    // Cancelled events do not block.
    "BEGIN:VEVENT",
    "UID:vrbo-cancelled",
    "STATUS:CANCELLED",
    "DTSTART;VALUE=DATE:20270301",
    "DTEND;VALUE=DATE:20270305",
    "END:VEVENT",
    "",
  ].join("\r\n"),
);

describe("iCal parsing", () => {
  test("all-day events: DTEND is the exclusive checkout day", () => {
    const { ranges } = parseIcsToRanges(AIRBNB, "airbnb");
    assert.deepEqual(
      ranges.map((r) => [r.start, r.end]),
      [
        ["2027-01-10", "2027-01-13"],
        ["2027-01-13", "2027-01-15"],
      ],
    );
    assert.deepEqual(blockedNightsBetween(ranges, "2027-01-01", "2027-02-01"), [
      "2027-01-10",
      "2027-01-11",
      "2027-01-12",
      "2027-01-13",
      "2027-01-14",
    ]);
  });

  test("timed events map to the property's calendar day; malformed and cancelled are skipped", () => {
    const { ranges, skipped } = parseIcsToRanges(VRBO_TIMED, "vrbo");
    assert.equal(skipped, 1);
    assert.deepEqual(
      ranges.map((r) => [r.start, r.end]),
      [
        ["2027-01-20", "2027-01-22"],
        ["2027-01-31", "2027-02-03"],
      ],
    );
  });

  test("garbage input never throws", () => {
    assert.deepEqual(parseIcsToRanges("not a calendar", "airbnb").ranges, []);
  });

  test("export round-trips through the parser", () => {
    const text = buildIcs([{ uid: "POT-2610-ABCD", start: "2027-06-12", end: "2027-06-15" }]);
    assert.match(text, /DTSTART;VALUE=DATE:20270612/);
    assert.match(text, /SUMMARY:Reserved/);
    const { ranges } = parseIcsToRanges(text, "direct");
    assert.deepEqual([ranges[0].start, ranges[0].end], ["2027-06-12", "2027-06-15"]);
  });
});

describe("range merging and turnover", () => {
  test("touching and overlapping ranges coalesce", () => {
    assert.deepEqual(
      mergeRanges([
        { start: "2027-01-13", end: "2027-01-15" },
        { start: "2027-01-10", end: "2027-01-13" },
        { start: "2027-01-20", end: "2027-01-25" },
        { start: "2027-01-22", end: "2027-01-23" },
        { start: "2027-02-01", end: "2027-02-01" }, // empty, dropped
      ]),
      [
        { start: "2027-01-10", end: "2027-01-15" },
        { start: "2027-01-20", end: "2027-01-25" },
      ],
    );
  });

  test("same-day turnover is allowed on both sides", () => {
    const blocked = [{ start: "2027-01-10", end: "2027-01-13" }];
    assert.equal(isRangeFree(blocked, "2027-01-07", "2027-01-10"), true, "check out on a block's first night");
    assert.equal(isRangeFree(blocked, "2027-01-13", "2027-01-16"), true, "check in on a block's checkout day");
  });

  test("stays spanning or overlapping a block are rejected", () => {
    const blocked = [{ start: "2027-01-10", end: "2027-01-13" }];
    assert.equal(isRangeFree(blocked, "2027-01-08", "2027-01-16"), false, "spans the block");
    assert.equal(isRangeFree(blocked, "2027-01-12", "2027-01-15"), false, "overlaps the end");
    assert.equal(isRangeFree(blocked, "2027-01-11", "2027-01-12"), false, "inside");
  });
});

describe("getBlockedRanges merges manual, iCal and direct bookings", () => {
  let dir: string;
  const env = { ...process.env };
  const icalFlag = siteConfig.features.icalSync;

  before(() => {
    dir = mkdtempSync(path.join(tmpdir(), "pot-avail-"));
    const blocksFile = path.join(dir, "blocked.json");
    writeFileSync(blocksFile, JSON.stringify([{ start: "2027-03-01", end: "2027-03-04", note: "Owner stay" }, { start: "bad", end: "x" }]));
    process.env.BLOCKED_DATES_FILE = blocksFile;
    process.env.AIRBNB_ICAL_URL = "https://example.test/airbnb.ics";
    process.env.VRBO_ICAL_URL = "https://example.test/vrbo.ics";
    siteConfig.features.icalSync = true;
  });
  after(() => {
    process.env = env;
    siteConfig.features.icalSync = icalFlag;
    rmSync(dir, { recursive: true, force: true });
  });

  const direct = (over: Partial<BookingRecord>): BookingRecord => ({
    id: "POT-2610-TEST",
    createdAt: "2026-10-19T00:00:00Z",
    updatedAt: "2026-10-19T00:00:00Z",
    status: "confirmed",
    kind: "checkout",
    checkIn: "2027-04-10",
    checkOut: "2027-04-14",
    adults: 2,
    children: 0,
    infants: 0,
    name: "Test",
    email: "t@example.com",
    phone: "5555555555",
    quote: computeQuote("2027-04-10", "2027-04-14", 2),
    emailStatus: "sent",
    ...over,
  });

  test("all sources merge; a failing feed degrades and is reported", async () => {
    const store = createStore("memory");
    await store.create(direct({}));
    await store.create(direct({ id: "POT-2610-REQ1", status: "requested", checkIn: "2027-05-01", checkOut: "2027-05-05" }));
    await store.create(direct({ id: "POT-2610-HOLD", status: "hold", holdExpiresAt: "2020-01-01T00:00:00Z", checkIn: "2027-06-01", checkOut: "2027-06-05" }));
    const fetcher = async (url: string) =>
      url.includes("airbnb") ? new Response(AIRBNB, { status: 200 }) : new Response("boom", { status: 500 });

    const snap = await getBlockedRanges({ store, fetcher: fetcher as never });
    const pub = publicAvailability(snap, "2027-01-01", "2027-12-31");
    assert.deepEqual(pub.blocked, [
      { start: "2027-01-10", end: "2027-01-15" }, // airbnb, coalesced
      { start: "2027-03-01", end: "2027-03-04" }, // manual
      { start: "2027-04-10", end: "2027-04-14" }, // confirmed direct
    ]);
    assert.equal(pub.complete, false, "vrbo failed with no cached copy");
    assert.equal(snap.feeds.find((f) => f.source === "vrbo")?.ok, false);
    assert.ok(!("source" in pub.blocked[0]), "public shape has no sources");

    // Second call: vrbo still failing, airbnb now failing too but served from the last good copy.
    const failing = async () => new Response("down", { status: 503 });
    const snap2 = await getBlockedRanges({ store, fetcher: failing as never });
    assert.ok(isRangeFree(snap2.ranges, "2027-01-15", "2027-01-18"));
    assert.equal(isRangeFree(snap2.ranges, "2027-01-11", "2027-01-12"), false, "stale airbnb copy still blocks");
  });
});

describe("calendar selection rules", () => {
  const today = "2026-11-02"; // late fall, 3-night minimum
  const blocked = new Set(["2026-11-20", "2026-11-21", "2026-11-22"]);
  const base = { today, blocked };

  test("departure may land on a blocked night's start (turnover)", () => {
    const ctx = { ...base, selection: { checkIn: "2026-11-16", checkOut: null } };
    const info = dayInfo("2026-11-20", ctx);
    assert.equal(info.selectable, true);
    assert.equal(info.kind, "departure-only");
    assert.match(info.label, /Friday, November 20, 2026, available for departure only/);
    assert.deepEqual(selectDay("2026-11-20", ctx), { checkIn: "2026-11-16", checkOut: "2026-11-20" });
  });

  test("a departure that would span blocked nights is not selectable", () => {
    const ctx = { ...base, selection: { checkIn: "2026-11-16", checkOut: null } };
    assert.equal(dayInfo("2026-11-24", ctx).selectable, false);
    assert.equal(selectDay("2026-11-24", ctx), null);
  });

  test("below the seasonal minimum is not selectable", () => {
    const ctx = { ...base, selection: { checkIn: "2026-11-05", checkOut: null } };
    const info = dayInfo("2026-11-07", ctx);
    assert.equal(info.kind, "below-min");
    assert.match(info.label, /below the 3-night minimum/);
  });

  test("arrival needs enough open nights before the next block", () => {
    assert.equal(canArriveOn("2026-11-18", base), "gap-too-short");
    assert.equal(canArriveOn("2026-11-17", base), true);
    assert.equal(canArriveOn("2026-11-21", base), "blocked");
    assert.equal(canArriveOn("2026-11-01", base), "past");
  });
});
