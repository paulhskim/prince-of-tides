/**
 * Booking funnel e2e: /book, date selection by mouse and keyboard, live quote, submit, success page;
 * blocked ranges cannot be selected; screenshots of the booking UI at 1440 and 390 into .screens/.
 *
 * Seeds src/lib/booking/blocked-dates.json (read at request time by the server) and restores the
 * original file afterwards, even when a test fails.
 */
import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { addDays, todayISO, formatLong, shiftMonthsKeepDay } from "../../src/lib/booking/dates";

const BLOCKS_FILE = path.join(process.cwd(), "src", "lib", "booking", "blocked-dates.json");
const SCREENS = path.join(process.cwd(), ".screens");

const today = todayISO("America/New_York");
// Seeded block: 4 nights starting 40 days out (late fall or winter: 3-night minimum).
const BLOCK_START = addDays(today, 40);
const BLOCK_END = addDays(today, 44);
let original: string;

test.beforeAll(() => {
  original = readFileSync(BLOCKS_FILE, "utf8");
  const seeded = [...JSON.parse(original), { start: BLOCK_START, end: BLOCK_END, note: "e2e seed" }];
  writeFileSync(BLOCKS_FILE, JSON.stringify(seeded, null, 2) + "\n");
  mkdirSync(SCREENS, { recursive: true });
});

test.afterAll(() => {
  writeFileSync(BLOCKS_FILE, original);
});

test.beforeEach(async ({ page }) => {
  // Separate rate-limit bucket per test run.
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
});

function calendar(page: Page): Locator {
  return page.getByTestId("request-form").getByTestId("date-range-calendar");
}

async function showDay(cal: Locator, iso: string): Promise<Locator> {
  const day = cal.locator(`button[data-iso="${iso}"]`);
  for (let i = 0; i < 14 && !(await day.isVisible()); i++) {
    await cal.getByRole("button", { name: "Next month" }).click();
  }
  await expect(day).toBeVisible();
  return day;
}

async function openBook(page: Page, query = "") {
  await page.goto(`/book${query}`);
  await expect(calendar(page)).toHaveAttribute("data-availability", "ready");
}

test("request to book: mouse and keyboard selection, quote, submit, success", async ({ page }) => {
  await openBook(page);
  const cal = calendar(page);
  const arrive = addDays(today, 70);

  // Mouse: arrival.
  const arriveBtn = await showDay(cal, arrive);
  await arriveBtn.click();
  await expect(arriveBtn).toHaveAttribute("aria-label", new RegExp(`${formatLong(arrive)}, arrival date selected`));
  await expect(page.getByTestId("calendar-hint")).toContainText("Choose a departure date");

  // Keyboard: arrows to move, PageDown and PageUp round trip, Enter to choose the departure.
  await page.keyboard.press("PageDown");
  await expect(cal.locator("button[data-iso]:focus")).toHaveAttribute("data-iso", shiftMonthsKeepDay(arrive, 1));
  await page.keyboard.press("PageUp");
  await expect(cal.locator("button[data-iso]:focus")).toHaveAttribute("data-iso", arrive);
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
  const depart = addDays(arrive, 6);
  await expect(cal.locator("button[data-iso]:focus")).toHaveAttribute("data-iso", depart);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("calendar-hint")).toContainText("6 nights");
  expect(page.url()).toContain(`checkIn=${arrive}`);
  expect(page.url()).toContain(`checkOut=${depart}`);

  // Live quote in the ledger.
  const total = page.locator("aside").getByTestId("quote-total");
  await expect(total).toHaveText(/^\$[\d,]+(\.\d{2})?$/);
  const before = await total.textContent();

  // Guests: add a child, quote unchanged (no per-guest pricing), count announced.
  await page.getByRole("button", { name: "Add child" }).first().click();
  await expect(page.getByTestId("children-count").first()).toHaveText("1");
  await expect(total).toHaveText(before!);

  // Submit empty contact first: error summary with links.
  await page.getByRole("button", { name: "Send request" }).click();
  const alert = page.getByTestId("request-form").getByRole("alert");
  await expect(alert).toContainText("Full name:");
  await expect(alert).toBeFocused();

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Phone").fill("(843) 555-0100");
  await page.getByLabel("Estimated arrival time (optional)").selectOption("6 to 8 PM");
  await page.getByLabel("Message to the host (optional)").fill("Quiet family week.");
  await page.getByText("I have read and agree to the").click({ position: { x: 5, y: 5 } });
  await page.getByLabel("I am 21 or older and will be on the reservation.").check();

  await page.screenshot({ path: path.join(SCREENS, "booking-book-filled-1440.png"), fullPage: true });

  await page.getByRole("button", { name: "Send request" }).click();
  await page.waitForURL(/\/booking\/success\?id=POT-\d{4}-[A-Z0-9]{4}$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Request received.");
  await expect(page.getByTestId("success-ref")).toHaveText(/^POT-\d{4}-[A-Z0-9]{4}$/);
  await expect(page.getByTestId("booking-success")).toContainText(before!);
  await page.screenshot({ path: path.join(SCREENS, "booking-success-1440.png"), fullPage: true });
});

test("blocked nights cannot be selected; turnover on the block's first night is allowed", async ({ page, request }) => {
  // The API reports the seeded nights.
  const api = await (await request.get(`/api/availability?from=${today}&to=${addDays(today, 90)}`)).json();
  expect(api.nights).toEqual([BLOCK_START, addDays(BLOCK_START, 1), addDays(BLOCK_START, 2), addDays(BLOCK_START, 3)]);

  await openBook(page);
  const cal = calendar(page);
  const inside = await showDay(cal, addDays(BLOCK_START, 1));
  await expect(inside).toHaveAttribute("aria-disabled", "true");
  await expect(inside).toHaveAttribute("aria-label", /, unavailable$/);

  // Clicking a blocked night does nothing.
  await inside.click({ force: true });
  await expect(page.getByTestId("calendar-hint")).toHaveText("Choose an arrival date.");

  // Arrive 3 nights before the block.
  const arrive = addDays(BLOCK_START, -3);
  await (await showDay(cal, arrive)).click();

  // A departure after the block would span reserved nights.
  const after = await showDay(cal, addDays(BLOCK_END, 1));
  await expect(after).toHaveAttribute("aria-disabled", "true");
  await after.click({ force: true });
  await expect(page.getByTestId("calendar-hint")).toContainText("Choose a departure date");

  // Departing on the block's first night is same-day turnover.
  const turnover = await showDay(cal, BLOCK_START);
  await expect(turnover).toHaveAttribute("aria-label", /available for departure only/);
  await turnover.click();
  await expect(page.getByTestId("calendar-hint")).toContainText("3 nights");

  // The server rejects a spanning range even if the client is bypassed.
  const res = await request.post("/api/inquiry", {
    headers: { "x-forwarded-for": "198.51.100.251" },
    data: {
      checkIn: arrive,
      checkOut: addDays(BLOCK_END, 1),
      adults: 2,
      children: 0,
      infants: 0,
      name: "Test Guest",
      email: "t@example.com",
      phone: "8435550100",
      agreeRules: true,
      agree21: true,
    },
  });
  expect(res.status()).toBe(409);
});

test("prefill from query params and mobile layout", async ({ page }) => {
  const arrive = addDays(today, 70);
  const depart = addDays(arrive, 5);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/book?checkIn=${arrive}&checkOut=${depart}&adults=3&children=1&infants=1`);
  await expect(page.getByTestId("change-dates")).toBeVisible();
  await expect(page.getByTestId("adults-count").first()).toHaveText("3");
  await expect(page.getByTestId("infants-count").first()).toHaveText("1");
  await expect(page.getByText(/4 guests, 1 infant, est\. \$/)).toBeVisible();
  await page.screenshot({ path: path.join(SCREENS, "booking-book-390.png"), fullPage: true });

  await page.getByTestId("change-dates").click();
  await expect(calendar(page)).toBeVisible();
  await page.screenshot({ path: path.join(SCREENS, "booking-book-calendar-390.png"), fullPage: false });
});

test("screens: home reservation section and mobile sheet", async ({ page }) => {
  const arrive = addDays(today, 70);
  await page.goto(`/?checkIn=${arrive}&checkOut=${addDays(arrive, 6)}&adults=2`);
  const reserve = page.locator("#reserve");
  await reserve.scrollIntoViewIfNeeded();
  await expect(reserve.getByTestId("date-range-calendar").first()).toHaveAttribute("data-availability", "ready");
  await reserve.screenshot({ path: path.join(SCREENS, "booking-home-reserve-1440.png") });

  // Desktop bar popover.
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  const bar = page.getByTestId("reservation-bar");
  await bar.getByRole("button", { name: /Arrive/ }).click();
  await expect(page.locator("button[data-iso]:focus")).toBeVisible();
  await page.screenshot({ path: path.join(SCREENS, "booking-bar-popover-1440.png") });
  await page.keyboard.press("Escape");
  await expect(bar.getByRole("button", { name: /Arrive/ })).toBeFocused();

  // Mobile: sticky bar then sheet.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/?checkIn=${arrive}&checkOut=${addDays(arrive, 6)}&adults=2`);
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
  const mobileBar = page.getByTestId("mobile-reservation-bar");
  await expect(mobileBar).toBeInViewport();
  await page.screenshot({ path: path.join(SCREENS, "booking-mobile-bar-390.png") });
  await mobileBar.getByRole("button", { name: "Request these dates" }).click();
  const sheet = page.getByRole("dialog", { name: "Your stay" });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByRole("heading", { name: "Your stay" })).toBeFocused();
  await page.screenshot({ path: path.join(SCREENS, "booking-mobile-sheet-390.png") });
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
});
