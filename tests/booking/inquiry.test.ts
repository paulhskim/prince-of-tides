// Run: npx tsx --test tests/booking/*.test.ts
import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { computeQuote } from "../../src/content/site.config";
import { processInquiry } from "../../src/lib/booking/inquiry";
import { inquirySchema } from "../../src/lib/booking/schemas";
import { createStore, type BookingStore } from "../../src/lib/booking/store";
import { resetRateLimitForTests } from "../../src/lib/booking/rate-limit";
import type { BlockedRange } from "../../src/lib/booking/ranges";

const NOW = new Date("2026-10-19T15:00:00Z");

const valid = () => ({
  checkIn: "2027-07-10",
  checkOut: "2027-07-17",
  adults: 2,
  children: 2,
  infants: 1,
  name: "Ada Guest",
  email: "ada@example.com",
  phone: "(843) 555-0100",
  arrivalTime: "4 to 6 PM",
  message: "Family trip.",
  agreeRules: true,
  agree21: true,
  company: "",
});

let store: BookingStore;
let blocked: BlockedRange[];
const sent: string[] = [];
const deps = () => ({
  store,
  now: NOW,
  getBlocked: async () => blocked,
  sendEmails: async (r: { id: string }) => {
    sent.push(r.id);
    return "logged" as const;
  },
});

beforeEach(() => {
  store = createStore("memory");
  blocked = [];
  sent.length = 0;
  resetRateLimitForTests();
});

describe("inquiry validation", () => {
  test("a complete request passes the shared schema", () => {
    assert.equal(inquirySchema.safeParse(valid()).success, true);
  });

  test("required fields and consents are enforced", () => {
    const r = inquirySchema.safeParse({ ...valid(), name: "A", email: "nope", phone: "12", agreeRules: false, agree21: false });
    assert.equal(r.success, false);
    const paths = new Set(r.error!.issues.map((i) => String(i.path[0])));
    for (const f of ["name", "email", "phone", "agreeRules", "agree21"]) assert.ok(paths.has(f), `missing error for ${f}`);
  });

  test("guest limits: 6 counted guests, infants not counted but capped at 2", () => {
    assert.equal(inquirySchema.safeParse({ ...valid(), adults: 4, children: 3 }).success, false);
    assert.equal(inquirySchema.safeParse({ ...valid(), adults: 4, children: 2, infants: 2 }).success, true);
    assert.equal(inquirySchema.safeParse({ ...valid(), infants: 3 }).success, false);
    assert.equal(inquirySchema.safeParse({ ...valid(), adults: 0, children: 2 }).success, false);
  });

  test("check-out must follow check-in", () => {
    assert.equal(inquirySchema.safeParse({ ...valid(), checkOut: "2027-07-10" }).success, false);
  });

  test("400 with field errors from the API", async () => {
    const res = await processInquiry({ ...valid(), email: "bad" }, deps());
    assert.equal(res.status, 400);
    assert.ok(!res.body.ok && res.body.fields?.email);
  });

  test("honeypot looks like success but stores and sends nothing", async () => {
    const res = await processInquiry({ ...valid(), company: "Acme SEO" }, deps());
    assert.equal(res.status, 200);
    assert.equal((await store.listActive()).length, 0);
    assert.equal(sent.length, 0);
  });

  test("more than two links in the message is rejected", async () => {
    const res = await processInquiry({ ...valid(), message: "http://a http://b https://c" }, deps());
    assert.equal(res.status, 400);
  });
});

describe("server rules", () => {
  test("past dates are rejected", async () => {
    const res = await processInquiry({ ...valid(), checkIn: "2026-10-01", checkOut: "2026-10-05" }, deps());
    assert.equal(res.status, 422);
    assert.ok(!res.body.ok && res.body.problems?.some((p) => p.code === "past"));
  });

  test("seasonal minimum nights are re-checked on the server", async () => {
    // Summer has a 5-night minimum.
    const res = await processInquiry({ ...valid(), checkIn: "2027-07-10", checkOut: "2027-07-13" }, deps());
    assert.equal(res.status, 422);
    assert.ok(!res.body.ok && res.body.problems?.some((p) => p.code === "min_nights"));
  });

  test("unavailable dates return 409; turnover dates are accepted", async () => {
    blocked = [{ start: "2027-07-14", end: "2027-07-20" }];
    const clash = await processInquiry(valid(), deps());
    assert.equal(clash.status, 409);
    blocked = [{ start: "2027-07-17", end: "2027-07-20" }, { start: "2027-07-01", end: "2027-07-10" }];
    const turnover = await processInquiry(valid(), deps());
    assert.equal(turnover.status, 200);
  });
});

describe("server quote recompute", () => {
  test("stored and returned totals come from computeQuote, never the client", async () => {
    const expected = computeQuote("2027-07-10", "2027-07-17", 4);
    const res = await processInquiry({ ...valid(), quotedTotal: expected.total, total: 1, subtotal: 1 }, deps());
    assert.equal(res.status, 200);
    assert.ok(res.body.ok);
    const rec = await store.get(res.body.id);
    assert.ok(rec);
    assert.equal(rec.quote.total, expected.total);
    assert.deepEqual(rec.quote, expected);
    assert.equal(rec.status, "requested");
    assert.equal(rec.emailStatus, "logged");
    assert.match(rec.id, /^POT-2610-[2-9A-Z]{4}$/);
    assert.deepEqual(sent, [rec.id]);
  });

  test("a tampered client total is rejected with the server quote", async () => {
    const expected = computeQuote("2027-07-10", "2027-07-17", 4);
    const res = await processInquiry({ ...valid(), quotedTotal: 99 }, deps());
    assert.equal(res.status, 409);
    assert.ok(!res.body.ok && res.body.error === "quote_changed");
    assert.equal(res.body.quote?.total, expected.total);
    assert.equal(sent.length, 0, "nothing persisted or emailed");
  });

  test("rate limit: 5 per IP per hour", async () => {
    const d = { ...deps(), ip: "203.0.113.9" };
    for (let i = 0; i < 5; i++) assert.notEqual((await processInquiry({ ...valid(), email: "x" }, d)).status, 429);
    assert.equal((await processInquiry(valid(), d)).status, 429);
    assert.notEqual((await processInquiry(valid(), { ...deps(), ip: "203.0.113.10" })).status, 429);
  });
});

describe("store holds (phase 3)", () => {
  test("createHoldIfFree refuses overlaps but allows turnover", async () => {
    const q = computeQuote("2027-07-10", "2027-07-17", 2);
    const base = {
      createdAt: "",
      updatedAt: "",
      status: "hold" as const,
      kind: "checkout" as const,
      adults: 2,
      children: 0,
      infants: 0,
      name: "A",
      email: "a@example.com",
      phone: "5555555",
      quote: q,
      emailStatus: "pending" as const,
      holdExpiresAt: new Date(Date.now() + 60_000).toISOString(),
    };
    assert.ok(await store.createHoldIfFree({ ...base, id: "A", checkIn: "2027-07-10", checkOut: "2027-07-17" }));
    assert.equal(await store.createHoldIfFree({ ...base, id: "B", checkIn: "2027-07-16", checkOut: "2027-07-20" }), null);
    assert.ok(await store.createHoldIfFree({ ...base, id: "C", checkIn: "2027-07-17", checkOut: "2027-07-22" }));
    assert.equal(await store.recordEvent("evt_1"), true);
    assert.equal(await store.recordEvent("evt_1"), false, "webhook idempotency");
  });
});
