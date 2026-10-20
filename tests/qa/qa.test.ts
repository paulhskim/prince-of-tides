// QA regression tests (docs/qa-report.md). Run: npx tsx --test tests/**/*.test.ts
process.env.BOOKING_STORE = "memory";

import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { stayFromParams } from "../../src/components/booking/state";
import { addDays } from "../../src/lib/booking/dates";
import { inquirySchema } from "../../src/lib/booking/schemas";
import { resolveOwnerTokens } from "../../src/lib/booking/owner-tokens";
import { buildRequestEmails } from "../../src/lib/booking/email";
import { createStore, newRef, setStoreForTests, type BookingRecord } from "../../src/lib/booking/store";
import { resetRateLimitForTests } from "../../src/lib/booking/rate-limit";
import { computeQuote } from "../../src/content/site.config";
import { POST as inquiryPOST } from "../../src/app/api/inquiry/route";
import { GET as bookingGET } from "../../src/app/api/booking/[id]/route";
import { GET as icsGET } from "../../src/app/api/calendar.ics/route";
import { POST as checkoutPOST } from "../../src/app/api/checkout/route";
import { POST as webhookPOST } from "../../src/app/api/stripe/webhook/route";

const env = process.env as Record<string, string | undefined>;
const TODAY = "2026-10-19";

function withEnv<T>(vars: Record<string, string | undefined>, fn: () => T): T {
  const saved = Object.fromEntries(Object.keys(vars).map((k) => [k, env[k]]));
  Object.assign(env, vars);
  for (const [k, v] of Object.entries(vars)) if (v === undefined) delete env[k];
  try {
    return fn();
  } finally {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete env[k];
      else env[k] = v;
    }
  }
}

const validBody = (overrides: Record<string, unknown> = {}) => ({
  checkIn: "2027-03-08",
  checkOut: "2027-03-12",
  adults: 2,
  children: 0,
  infants: 0,
  name: "Ada Guest",
  email: "ada@example.com",
  phone: "(843) 555-0100",
  agreeRules: true,
  agree21: true,
  ...overrides,
});

describe("/book query-param prefill (stayFromParams)", () => {
  const p = (q: string) => stayFromParams(new URLSearchParams(q), TODAY);

  test("valid stay is kept", () => {
    const s = p(`checkIn=${addDays(TODAY, 30)}&checkOut=${addDays(TODAY, 35)}&adults=3&children=1&infants=1`);
    assert.deepEqual(s, { checkIn: addDays(TODAY, 30), checkOut: addDays(TODAY, 35), adults: 3, children: 1, infants: 1 });
  });

  test("past arrival is dropped (was quoted as if bookable)", () => {
    assert.equal(p("checkIn=2020-01-01&checkOut=2020-01-05").checkIn, null);
  });

  test("arrival beyond the booking window is dropped", () => {
    assert.equal(p(`checkIn=${addDays(TODAY, 400)}&checkOut=${addDays(TODAY, 405)}`).checkIn, null);
  });

  test("stay longer than maxNights keeps arrival but drops departure", () => {
    const s = p(`checkIn=${addDays(TODAY, 30)}&checkOut=${addDays(TODAY, 200)}`);
    assert.equal(s.checkIn, addDays(TODAY, 30));
    assert.equal(s.checkOut, null);
  });

  test("garbage and out-of-range guests are clamped", () => {
    assert.deepEqual(p("checkIn=%3Cscript%3E&adults=999&children=-5&infants=abc"), {
      checkIn: null,
      checkOut: null,
      adults: 6,
      children: 0,
      infants: 0,
    });
    assert.equal(p("adults=0").adults, 1);
    const s = p("adults=4&children=6&infants=9");
    assert.equal(s.adults + s.children, 6);
    assert.equal(s.infants, 2);
  });

  test("impossible calendar dates are rejected", () => {
    assert.equal(p("checkIn=2027-02-30&checkOut=2027-03-05").checkIn, null);
  });
});

describe("contact field hardening", () => {
  test("names with links, markup or control characters are refused", () => {
    for (const name of ["Visit https://spam.example", "www.spam.example", "<b>Ada</b>", "Ada\r\nBcc: x@example.com"]) {
      assert.equal(inquirySchema.safeParse(validBody({ name })).success, false, name);
    }
    for (const name of ["Ada Lovelace", "Zoë O'Brien-Smith", "José María"]) {
      assert.equal(inquirySchema.safeParse(validBody({ name })).success, true, name);
    }
  });

  test("phone accepts common formats and extensions only", () => {
    for (const phone of ["(843) 555-0100", "+1 843.555.0100", "843-555-0100 ext. 12", "8435550100x3"]) {
      assert.equal(inquirySchema.safeParse(validBody({ phone })).success, true, phone);
    }
    for (const phone of ["call me 8435550100", "<script>8435550100</script>"]) {
      assert.equal(inquirySchema.safeParse(validBody({ phone })).success, false, phone);
    }
  });
});

describe("owner placeholders never reach guests in production", () => {
  test("resolveOwnerTokens falls back in production and stays visible in development", () => {
    assert.equal(resolveOwnerTokens("With regards,\nTODO_OWNER: host name", true), "With regards,\nYour host");
    assert.match(resolveOwnerTokens("TODO_OWNER: host name", false), /TODO_OWNER/);
    assert.equal(resolveOwnerTokens("within TODO_OWNER: response time.", true), "within 12 hours.");
  });

  test("guest acknowledgement email has no TODO_OWNER in production", () => {
    const record: BookingRecord = {
      id: "POT-2610-ABCD",
      createdAt: "2026-10-19T00:00:00Z",
      updatedAt: "2026-10-19T00:00:00Z",
      status: "requested",
      kind: "request",
      checkIn: "2027-03-08",
      checkOut: "2027-03-12",
      adults: 2,
      children: 0,
      infants: 0,
      name: "Ada Guest",
      email: "ada@example.com",
      phone: "8435550100",
      quote: computeQuote("2027-03-08", "2027-03-12", 2),
      emailStatus: "pending",
    };
    const { guest } = withEnv({ NODE_ENV: "production" }, () => buildRequestEmails(record, "host@example.com"));
    assert.ok(!guest.text.includes("TODO_OWNER"), guest.text);
    assert.ok(!guest.subject.includes("TODO_OWNER"));
  });
});

describe("POST /api/inquiry transport checks", () => {
  beforeEach(() => {
    resetRateLimitForTests();
    setStoreForTests(createStore("memory"));
  });

  const post = (body: string, headers: Record<string, string>) =>
    inquiryPOST(new Request("http://localhost/api/inquiry", { method: "POST", body, headers: { "x-forwarded-for": "192.0.2.10", ...headers } }));

  test("non-JSON content types are refused with 415 (blocks cross-site simple posts)", async () => {
    const body = JSON.stringify(validBody());
    for (const type of ["text/plain", "application/x-www-form-urlencoded", "multipart/form-data", ""]) {
      const res = await post(body, type ? { "content-type": type } : {});
      assert.equal(res.status, 415, `content-type "${type}"`);
    }
  });

  test("oversized bodies are refused with 413", async () => {
    const big = JSON.stringify(validBody({ message: "x".repeat(40_000) }));
    const res = await post(big, { "content-type": "application/json" });
    assert.equal(res.status, 413);
  });

  test("malformed JSON is a 400", async () => {
    const res = await post("{bad", { "content-type": "application/json; charset=utf-8" });
    assert.equal(res.status, 400);
  });
});

describe("GET /api/booking/:id", () => {
  test("returns a non-PII summary and refuses malformed ids", async () => {
    const store = createStore("memory");
    setStoreForTests(store);
    const id = newRef(new Date("2026-10-19T00:00:00Z"));
    await store.create({
      id,
      createdAt: "x",
      updatedAt: "x",
      status: "requested",
      kind: "request",
      checkIn: "2027-03-08",
      checkOut: "2027-03-12",
      adults: 2,
      children: 0,
      infants: 0,
      name: "Ada Guest",
      email: "ada@example.com",
      phone: "8435550100",
      message: "secret",
      quote: computeQuote("2027-03-08", "2027-03-12", 2),
      emailStatus: "logged",
    });
    const res = await bookingGET(new Request(`http://localhost/api/booking/${id}`), { params: Promise.resolve({ id }) });
    assert.equal(res.status, 200);
    const text = await res.text();
    for (const pii of ["Ada", "ada@example.com", "8435550100", "secret"]) assert.ok(!text.includes(pii), `leaks ${pii}`);

    for (const bad of ["../../package.json", "..%2F..%2Fetc%2Fpasswd", "A".repeat(5000), "pot-2610-abcd"]) {
      const r = await bookingGET(new Request("http://localhost/api/booking/x"), { params: Promise.resolve({ id: bad }) });
      assert.equal(r.status, 404, bad);
    }
  });
});

describe("feature-flagged and token-protected routes", () => {
  test("checkout and Stripe webhook 404 while the flags are off", async () => {
    const c = await checkoutPOST(new Request("http://localhost/api/checkout", { method: "POST", body: "{}", headers: { "content-type": "application/json" } }));
    assert.equal(c.status, 404);
    const w = await webhookPOST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body: "{}" }));
    assert.equal(w.status, 404);
  });

  test("calendar.ics: token required in production, must match when set", async () => {
    setStoreForTests(createStore("memory"));
    const get = (q: string) => icsGET(new Request(`http://localhost/api/calendar.ics${q}`));
    assert.equal((await withEnv({ NODE_ENV: "production", ICAL_EXPORT_TOKEN: undefined }, () => get(""))).status, 404);
    assert.equal((await withEnv({ NODE_ENV: "production", ICAL_EXPORT_TOKEN: "s3cret-token" }, () => get("?token=wrong"))).status, 404);
    assert.equal((await withEnv({ NODE_ENV: "production", ICAL_EXPORT_TOKEN: "s3cret-token" }, () => get(""))).status, 404);
    const ok = await withEnv({ NODE_ENV: "production", ICAL_EXPORT_TOKEN: "s3cret-token" }, () => get("?token=s3cret-token"));
    assert.equal(ok.status, 200);
    assert.match(await ok.text(), /BEGIN:VCALENDAR/);
  });
});

describe("hard rules in source", () => {
  const ROOT = path.join(__dirname, "..", "..");
  function walk(dir: string, out: string[] = []): string[] {
    for (const name of readdirSync(dir)) {
      const full = path.join(dir, name);
      if (statSync(full).isDirectory()) walk(full, out);
      else if (/\.(tsx?|css|json|md|txt|svg|mjs)$/.test(name)) out.push(full);
    }
    return out;
  }
  const files = ["src", "public", "docs"].flatMap((d) => walk(path.join(ROOT, d)));

  test("no em dash anywhere in src, public, docs", () => {
    const bad = files.filter((f) => readFileSync(f, "utf8").includes("—"));
    assert.deepEqual(bad, []);
  });

  test("unit number never appears in src or public", () => {
    const bad = files.filter((f) => !f.includes(`${path.sep}docs${path.sep}`) && readFileSync(f, "utf8").includes("3206"));
    assert.deepEqual(bad, []);
  });
});
