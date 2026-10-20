/**
 * Reservation e2e (/reserve): keyboard date selection, nightly rates on the calendar, itemized folio
 * equal to computeQuote, request submitted to /api/inquiry, confirmation with reference and the payment
 * preview; blocked ranges cannot be selected; /book redirects with its query string; screenshots into
 * .screens/reserve/.
 *
 * Seeds src/lib/booking/blocked-dates.json (read at request time by the server) and restores the
 * original file afterwards, even when a test fails. Run against a server started from this directory.
 */
import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { computeQuote } from "../../src/content/site.config";
import { addDays, todayISO, formatLong, formatMoney, shiftMonthsKeepDay } from "../../src/lib/booking/dates";
import { paymentSchedule, rateForNight, seasonRows } from "../../src/lib/booking/reserve";

const BLOCKS_FILE = path.join(process.cwd(), "src", "lib", "booking", "blocked-dates.json");
const SCREENS = path.join(process.cwd(), ".screens", "reserve");

const today = todayISO("America/New_York");
// Seeded block: 4 nights starting 40 days out.
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

async function openReserve(page: Page, query = "") {
  await page.goto(`/reserve${query}`);
  await expect(calendar(page)).toHaveAttribute("data-availability", "ready");
}

/** First arrival at least `from` days out whose season minimum fits `nights` and avoids the seeded block. */
function arrivalFor(nights: number, from = 70): string {
  for (let i = from; i < from + 200; i++) {
    const a = addDays(today, i);
    const q = computeQuote(a, addDays(a, nights), 2);
    if (q.meetsMinNights && (addDays(a, nights) <= BLOCK_START || a >= BLOCK_END)) return a;
  }
  throw new Error("no arrival found");
}

test("reserve: keyboard dates, rates on the calendar, folio equals computeQuote, request, confirmation", async ({ page }) => {
  await openReserve(page);
  const cal = calendar(page);
  await page.screenshot({ path: path.join(SCREENS, "initial-1440.png") });

  // Rates are printed on open dates and read out in the label.
  const sample = addDays(today, 7);
  const sampleBtn = cal.locator(`button[data-iso="${sample}"]`);
  if (await sampleBtn.isVisible()) {
    const r = rateForNight(sample);
    await expect(sampleBtn).toHaveAttribute("data-rate", String(r.nightly));
    await expect(sampleBtn).toHaveAttribute("aria-label", new RegExp(`${formatMoney(r.nightly, { cents: false }).replace("$", "\\$")} per night, ${r.season}`));
  }
  await expect(cal.getByTestId("season-line").first()).not.toBeEmpty();

  // Seasonal rate card generated from the config, with the illustrative note.
  const card = page.getByTestId("rate-card");
  for (const row of seasonRows()) await expect(card).toContainText(row.name);
  await expect(card.getByTestId("illustrative-note")).toHaveText("Rates shown are illustrative until the season is published.");

  // Keyboard only: focus the grid, two months on with PageDown, Enter, six days on, Enter.
  await cal.locator('button[data-iso][tabindex="0"]').focus();
  const start = await cal.locator("button[data-iso]:focus").getAttribute("data-iso");
  await page.keyboard.press("PageDown");
  await page.keyboard.press("PageDown");
  const arrive = shiftMonthsKeepDay(shiftMonthsKeepDay(start!, 1), 1);
  await expect(cal.locator("button[data-iso]:focus")).toHaveAttribute("data-iso", arrive);
  await page.keyboard.press("Enter");
  await expect(cal.locator(`button[data-iso="${arrive}"]`)).toHaveAttribute("aria-label", new RegExp(`${formatLong(arrive)}, arrival date selected`));
  for (let i = 0; i < 6; i++) await page.keyboard.press("ArrowRight");
  const depart = addDays(arrive, 6);
  await expect(cal.locator("button[data-iso]:focus")).toHaveAttribute("data-iso", depart);
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("calendar-hint")).toContainText("6 nights");
  expect(page.url()).toContain(`checkIn=${arrive}`);
  expect(page.url()).toContain(`checkOut=${depart}`);

  // The folio itemizes exactly what computeQuote returns.
  const q = computeQuote(arrive, depart, 2);
  const folio = page.getByTestId("folio");
  await expect(page.getByTestId("folio-total")).toHaveText(formatMoney(q.total));
  await expect(page.getByTestId("summary-total")).toHaveText(formatMoney(q.total));
  const taxRows = folio.getByTestId("folio-tax");
  await expect(taxRows).toHaveCount(q.taxes.length);
  for (const [i, t] of q.taxes.entries()) {
    await expect(taxRows.nth(i)).toContainText(t.name);
    await expect(taxRows.nth(i)).toContainText(formatMoney(t.amount));
  }
  await expect(folio).toContainText(formatMoney(q.cleaningFee));
  const pay = paymentSchedule(q.total, arrive, today);
  await expect(page.getByTestId("pay-deposit")).toContainText(formatMoney(pay.deposit));
  await expect(page.getByTestId("cancellation-dates").locator("li")).toHaveCount(3);
  await page.screenshot({ path: path.join(SCREENS, "dates-selected-1440.png"), fullPage: true });

  // Guests: a child does not change the price.
  await page.getByRole("button", { name: "Add child" }).first().click();
  await expect(page.getByTestId("children-count").first()).toHaveText("1");
  await expect(page.getByTestId("folio-total")).toHaveText(formatMoney(q.total));

  // Empty details: error summary, focused.
  await page.getByRole("button", { name: "Request this reservation" }).click();
  const alert = page.getByTestId("request-form").getByRole("alert");
  await expect(alert).toContainText("Full name:");
  await expect(alert).toBeFocused();

  await page.getByLabel("Full name").fill("Ada Lovelace");
  await page.getByLabel("Email").fill("ada@example.com");
  await page.getByLabel("Phone").fill("(843) 555-0100");
  await page.getByLabel("Estimated arrival time (optional)").selectOption("6 to 8 PM");
  await page.getByLabel("Message to the host (optional)").fill("Quiet family week.");
  await page.getByRole("checkbox", { name: /house rules/ }).check();
  await page.getByRole("checkbox", { name: /21 or older/ }).check();
  await expect(page.getByTestId("review-total")).toHaveText(formatMoney(q.total));

  // No card or bank fields anywhere.
  expect(await page.locator('input[autocomplete^="cc-"], input[name*="card" i], input[name*="cvc" i], input[name*="iban" i]').count()).toBe(0);

  await page.getByRole("button", { name: "Request this reservation" }).click();
  const conf = page.getByTestId("reserve-confirmation");
  await expect(conf).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Request received." })).toBeFocused();
  await expect(page.getByTestId("conf-ref")).toHaveText(/^POT-\d{4}-[A-Z0-9]{4}$/);
  expect(page.url()).toMatch(/\/reserve\?confirmed=POT-\d{4}-[A-Z0-9]{4}$/);
  await expect(conf.getByTestId("folio-total")).toHaveText(formatMoney(q.total));
  await expect(conf).toContainText("What happens next");

  const panel = page.getByTestId("payment-panel");
  await expect(panel.getByTestId("pay-deposit-amount")).toHaveText(formatMoney(pay.deposit));
  const payBtn = panel.getByTestId("pay-deposit-button");
  await expect(payBtn).toHaveText("Pay deposit (available after confirmation)");
  await expect(payBtn).toHaveAttribute("aria-disabled", "true");
  if (pay.balanceDue) await expect(panel.getByTestId("pay-balance-row")).toContainText(formatMoney(pay.balance));
  expect(await page.locator("input").evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length)).toBe(0);
  await page.screenshot({ path: path.join(SCREENS, "confirmation-1440.png"), fullPage: true });

  // Refresh keeps the confirmation (this browser's session copy); Back returns to the filled request.
  await page.reload();
  await expect(page.getByTestId("reserve-confirmation")).toBeVisible();
  await page.goBack();
  await expect(page.getByTestId("reserve-confirmation")).toHaveCount(0);
  await expect(page.getByLabel("Full name")).toHaveValue("Ada Lovelace");
});

test("blocked nights cannot be selected; turnover on the block's first night is allowed", async ({ page, request }) => {
  const api = await (await request.get(`/api/availability?from=${today}&to=${addDays(today, 90)}`)).json();
  expect(api.nights).toEqual([BLOCK_START, addDays(BLOCK_START, 1), addDays(BLOCK_START, 2), addDays(BLOCK_START, 3)]);

  await openReserve(page);
  const cal = calendar(page);
  const inside = await showDay(cal, addDays(BLOCK_START, 1));
  await expect(inside).toHaveAttribute("aria-disabled", "true");
  await expect(inside).toHaveAttribute("aria-label", /, unavailable$/);
  await expect(inside).not.toHaveAttribute("data-rate");
  await inside.click({ force: true });
  await expect(page.getByTestId("calendar-hint")).toHaveText("Choose an arrival date.");

  // Arrive just far enough before the block for the season minimum.
  let k = 1;
  while (!computeQuote(addDays(BLOCK_START, -k), BLOCK_START, 2).meetsMinNights) k++;
  const arrive = addDays(BLOCK_START, -k);
  await (await showDay(cal, arrive)).click();

  const after = await showDay(cal, addDays(BLOCK_END, 1));
  await expect(after).toHaveAttribute("aria-disabled", "true");
  await after.click({ force: true });
  await expect(page.getByTestId("calendar-hint")).toContainText("Choose a departure date");

  const turnover = await showDay(cal, BLOCK_START);
  await expect(turnover).toHaveAttribute("aria-label", /available for departure only/);
  await turnover.click();
  await expect(page.getByTestId("folio")).toBeVisible();

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

test("/book redirects permanently to /reserve with the query string", async ({ page, request }) => {
  const a = arrivalFor(5);
  const d = addDays(a, 5);
  const res = await request.get(`/book?checkIn=${a}&checkOut=${d}&adults=3&children=1&infants=1`, { maxRedirects: 0 });
  expect(res.status()).toBe(308);
  expect(res.headers()["location"]).toBe(`/reserve?checkIn=${a}&checkOut=${d}&adults=3&children=1&infants=1`);
  const bare = await request.get("/book", { maxRedirects: 0 });
  expect(bare.headers()["location"]).toBe("/reserve");

  await page.goto(`/book?checkIn=${a}&checkOut=${d}&adults=3&children=1&infants=1`);
  await page.waitForURL(/\/reserve\?/);
  await expect(page.getByTestId("adults-count").first()).toHaveText("3");
  await expect(page.getByTestId("infants-count").first()).toHaveText("1");
  await expect(page.getByTestId("folio-total")).toHaveText(formatMoney(computeQuote(a, d, 4).total));
});

test("mobile: one month with rates, folio and confirmation at 390", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openReserve(page);
  await page.screenshot({ path: path.join(SCREENS, "initial-390.png") });
  const a = arrivalFor(6);
  const d = addDays(a, 6);
  await openReserve(page, `?checkIn=${a}&checkOut=${d}&adults=2`);
  const cal = calendar(page);
  // One month visible, and its open dates carry rates.
  const visibleMonths = await cal.locator("table[role=grid]").evaluateAll((els) => els.filter((e) => (e as HTMLElement).offsetParent !== null).length);
  expect(visibleMonths).toBe(1);
  await expect(cal.locator(`button[data-iso="${a}"]`)).toHaveAttribute("data-rate", String(rateForNight(a).nightly));
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  expect(sw).toBeLessThanOrEqual(cw);
  await page.screenshot({ path: path.join(SCREENS, "dates-selected-390.png"), fullPage: true });

  await page.getByLabel("Full name").fill("Mary Somerville");
  await page.getByLabel("Email").fill("mary@example.com");
  await page.getByLabel("Phone").fill("843 555 0142");
  await page.getByRole("checkbox", { name: /house rules/ }).check();
  await page.getByRole("checkbox", { name: /21 or older/ }).check();
  await page.getByRole("button", { name: "Request this reservation" }).click();
  await expect(page.getByTestId("payment-panel")).toBeVisible();
  await page.screenshot({ path: path.join(SCREENS, "confirmation-390.png"), fullPage: true });
});

test("home ledger and bar send the stay to /reserve", async ({ page }) => {
  const a = arrivalFor(6);
  await page.goto(`/?checkIn=${a}&checkOut=${addDays(a, 6)}&adults=2`);
  const reserve = page.locator("#reserve");
  test.skip((await reserve.count()) === 0, "home page has no #reserve section");
  await reserve.scrollIntoViewIfNeeded();
  await expect(reserve.getByTestId("date-range-calendar").first()).toHaveAttribute("data-availability", "ready");
  await reserve.getByRole("button", { name: "Request these dates" }).click();
  await page.waitForURL(new RegExp(`/reserve\\?checkIn=${a}`));
  await expect(page.getByTestId("folio")).toBeVisible();
});
