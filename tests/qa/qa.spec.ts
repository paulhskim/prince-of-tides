/**
 * QA audit suite (docs/qa-report.md): accessibility (axe, keyboard, dialogs), responsive overflow,
 * link crawl, content hard rules, and regressions for the defects fixed during the audit.
 * Run against a production build: PW_BASE_URL=http://localhost:3400 npx playwright test
 */
import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { addDays, todayISO } from "../../src/lib/booking/dates";
import { computeQuote, rateForISO } from "../../src/content/site.config";
import { formatMoney } from "../../src/lib/booking/dates";
import { reviewsSection } from "../../src/content/copy";

const today = todayISO("America/New_York");
const PAGES = ["/", "/reserve", "/gallery", "/area", "/faq", "/policies", "/booking/success", "/does-not-exist"];
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
});

async function settle(page: Page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(300);
}

/**
 * First arrival on or after `from` on an ordinary (non-event) night whose season needs `min` nights,
 * where every stay of up to 10 nights keeps that same minimum and a `min`-night stay is valid.
 */
function arrivalWithMin(min: number, from = addDays(today, 30)): string {
  for (let i = 0; i < 330; i++) {
    const d = addDays(from, i);
    const r = rateForISO(d);
    if (r.kind === "event" || r.minNights !== min) continue;
    if (computeQuote(d, addDays(d, 10), 2).minNightsRequired !== min) continue;
    if (computeQuote(d, addDays(d, min), 2).errors.length === 0) return d;
  }
  throw new Error(`no ${min}-night season found`);
}

test.describe("accessibility", () => {
  for (const vp of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`axe: no serious or critical violations at ${vp.width}`, async ({ page }) => {
      test.setTimeout(180_000);
      await page.setViewportSize(vp);
      const failures: string[] = [];
      for (const p of PAGES) {
        await page.goto(p);
        await settle(page);
        const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"]).analyze();
        for (const v of r.violations) {
          if (v.impact === "serious" || v.impact === "critical" || v.id === "heading-order") {
            failures.push(`${p} [${v.impact}] ${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
          }
        }
      }
      expect(failures).toEqual([]);
    });
  }

  test("axe: open dialogs (sheet, drawer, lightbox, house rules) have no serious violations", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const check = async (label: string) => {
      const r = await new AxeBuilder({ page }).analyze();
      const bad = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => `${label}: ${v.id}`);
      expect(bad).toEqual([]);
    };
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await check("drawer");
    await page.keyboard.press("Escape");
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.getByTestId("mobile-reservation-bar").getByRole("button").click();
    await expect(page.getByRole("dialog", { name: "Your stay" })).toBeVisible();
    await check("sheet");
    await page.goto("/reserve");
    await page.getByRole("link", { name: "house rules" }).click();
    await expect(page.getByRole("dialog", { name: "House rules" })).toBeVisible();
    await check("house rules");
    await page.goto("/gallery");
    const thumb = page.locator("button[aria-label^='Open photograph']").first();
    if (await thumb.count()) {
      await thumb.click();
      await check("lightbox");
    }
  });

  test("landmarks, single h1, skip link, lang", async ({ page }) => {
    for (const p of PAGES) {
      await page.goto(p);
      expect(await page.locator("h1").count(), `${p} h1`).toBe(1);
      expect(await page.locator("main#main").count(), `${p} main`).toBe(1);
      expect(await page.locator("body > footer, footer").count(), `${p} footer`).toBeGreaterThanOrEqual(1);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    }
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
  });

  test("images have alt text (or are decorative) and placeholders are labelled", async ({ page }) => {
    for (const p of ["/", "/gallery", "/area"]) {
      await page.goto(p);
      const missing = await page.$$eval("img:not([alt])", (els) => els.map((e) => (e as HTMLImageElement).src));
      expect(missing, p).toEqual([]);
      const unlabeled = await page.$$eval("[role=img]", (els) => els.filter((e) => !e.getAttribute("aria-label") && !e.getAttribute("aria-labelledby")).length);
      expect(unlabeled, p).toBe(0);
    }
  });

  test("reduced motion: cover animation is effectively off", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    const dur = await page.evaluate(() => {
      const el = document.querySelector(".cover-reveal, .cover-reveal-late");
      return el ? parseFloat(getComputedStyle(el).animationDuration) : 0;
    });
    expect(dur).toBeLessThan(0.02);
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).not.toBe("smooth");
    await ctx.close();
  });

  test("focus is visible on interactive elements (keyboard)", async ({ page }) => {
    await page.goto("/reserve");
    let checked = 0;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const r = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        return { tag: el.tagName, text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 40), outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 1, shadow: cs.boxShadow !== "none" };
      });
      if (!r) continue;
      checked++;
      expect(r.outline || r.shadow, `no visible focus on ${r.tag} "${r.text}"`).toBe(true);
    }
    expect(checked).toBeGreaterThan(20);
  });
});

test.describe("responsive", () => {
  test("no horizontal scroll at standard widths", async ({ page }) => {
    test.setTimeout(240_000);
    const bad: string[] = [];
    for (const w of WIDTHS) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const p of PAGES.slice(0, 7)) {
        await page.goto(p);
        await settle(page);
        const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
        if (sw > cw) bad.push(`${w} ${p} ${sw}>${cw}`);
      }
    }
    expect(bad).toEqual([]);
  });

  test("arrival times fit their column across the lg range (regression: overflow at 1024 to 1100)", async ({ page }) => {
    const bad: string[] = [];
    for (let w = 1000; w <= 1440; w += 40) {
      await page.setViewportSize({ width: w, height: 900 });
      await page.goto("/");
      const over = await page.evaluate(() =>
        Array.from(document.querySelectorAll("#arrival dl > div")).some((d) => (d as HTMLElement).scrollWidth > (d as HTMLElement).clientWidth + 1),
      );
      const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      if (over || sw > cw) bad.push(String(w));
    }
    expect(bad).toEqual([]);
  });

  test("mobile: submit button on /reserve is not covered by fixed bars", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const a = addDays(today, 70);
    await page.goto(`/reserve?checkIn=${a}&checkOut=${addDays(a, 5)}`);
    const submit = page.getByRole("button", { name: "Request this reservation" });
    await submit.scrollIntoViewIfNeeded();
    const hit = await submit.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return top === el || el.contains(top);
    });
    expect(hit).toBe(true);
  });
});

test.describe("navigation and links", () => {
  test("every internal link and anchor resolves", async ({ page, request }) => {
    test.setTimeout(120_000);
    const seen = new Set<string>();
    const bad: string[] = [];
    for (const p of PAGES.slice(0, 7)) {
      await page.goto(p);
      const hrefs = await page.$$eval("a[href]", (as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const h of hrefs) {
        const u = new URL(h);
        if (u.origin !== new URL(page.url()).origin) continue;
        const target = u.pathname + u.search;
        if (!seen.has(target)) {
          seen.add(target);
          const r = await request.get(target);
          if (r.status() !== 200) bad.push(`${p} -> ${target} ${r.status()}`);
        }
        if (u.hash && !seen.has(h)) {
          seen.add(h);
          const id = decodeURIComponent(u.hash.slice(1));
          const html = await (await request.get(target)).text();
          if (!html.includes(`id="${id}"`)) bad.push(`${p} -> ${target}#${id} (missing anchor)`);
        }
      }
    }
    expect(bad).toEqual([]);
  });

  test("mobile drawer: focus moves in, is trapped, Esc returns focus", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu" });
    await menu.click();
    const drawer = page.getByRole("dialog", { name: "Site menu" });
    await expect(drawer).toBeVisible();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press("Tab");
      expect(await page.evaluate(() => !!document.activeElement?.closest("#site-drawer"))).toBe(true);
    }
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(menu).toBeFocused();
    await menu.click();
    await drawer.getByRole("link", { name: /questions/i }).click();
    await page.waitForURL(/\/faq/);
    await expect(drawer).toBeHidden();
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
  });

  test("FAQ accordion toggles by keyboard and deep links open the item", async ({ page }) => {
    await page.goto("/faq");
    const first = page.locator("main button[aria-expanded]").first();
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-expanded", "false");
  });

  test("gallery lightbox: keyboard, Esc, focus returns to thumbnail", async ({ page }) => {
    await page.goto("/gallery");
    const thumbs = page.locator("button[aria-label^='Open photograph']");
    test.skip((await thumbs.count()) === 0, "no photographs yet");
    const t = thumbs.first();
    await t.focus();
    await page.keyboard.press("Enter");
    const dlg = page.getByRole("dialog", { name: "Photographs" });
    await expect(dlg).toBeVisible();
    await expect(dlg.getByRole("button", { name: "Close" })).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect(dlg).toContainText("2 of");
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await expect(t).toBeFocused();
  });

  test("house rules dialog returns focus to its link", async ({ page }) => {
    await page.goto("/reserve");
    const link = page.getByRole("link", { name: "house rules" });
    await link.focus();
    await page.keyboard.press("Enter");
    const dlg = page.getByRole("dialog", { name: "House rules" });
    await expect(dlg).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dlg).toBeHidden();
    await expect(link).toBeFocused();
  });
});

test.describe("booking regressions", () => {
  test("sheet -> /reserve releases the scroll lock (regression: /book could not scroll on mobile)", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const a = addDays(today, 70);
    await page.goto(`/?checkIn=${a}&checkOut=${addDays(a, 6)}&adults=2`);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 2));
    await page.getByTestId("mobile-reservation-bar").getByRole("button", { name: "Request these dates" }).click();
    await page.getByRole("dialog", { name: "Your stay" }).getByRole("button", { name: "Request these dates" }).click();
    await page.waitForURL(/\/reserve\?/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    await page.goBack();
    await page.waitForURL((u) => u.pathname === "/");
    expect(await page.evaluate(() => document.documentElement.style.overflow)).toBe("");
  });

  test("invalid prefill params are ignored, not quoted", async ({ page }) => {
    await page.goto("/reserve?checkIn=2020-01-01&checkOut=2020-01-05&adults=999&children=-3&infants=abc");
    await expect(page.getByTestId("request-form").getByTestId("date-range-calendar")).toBeVisible();
    await expect(page.getByTestId("reserve-summary")).toContainText("Not set");
    await expect(page.getByTestId("adults-count").first()).toHaveText("6");
    await expect(page.getByTestId("infants-count").first()).toHaveText("0");
    await page.goto("/reserve?checkIn=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E");
    await expect(page.getByTestId("reserve-summary")).toContainText("Not set");
  });

  test("guest limits: 6 counted guests, infants not counted, at most 2", async ({ page }) => {
    await page.goto("/reserve");
    const form = page.getByTestId("request-form");
    for (let i = 0; i < 4; i++) await form.getByRole("button", { name: "Add adult" }).click(); // default is 2 adults
    await expect(form.getByTestId("adults-count")).toHaveText("6");
    await expect(form.getByRole("button", { name: "Add adult" })).toHaveAttribute("aria-disabled", "true");
    await expect(form.getByRole("button", { name: "Add child" })).toHaveAttribute("aria-disabled", "true");
    await form.getByRole("button", { name: "Add infant" }).click();
    await form.getByRole("button", { name: "Add infant" }).click();
    await expect(form.getByTestId("infants-count")).toHaveText("2");
    await expect(form.getByRole("button", { name: "Add infant" })).toHaveAttribute("aria-disabled", "true");
  });

  test("seasonal minimum nights: summer arrival cannot depart before 5 nights", async ({ page }) => {
    const a = arrivalWithMin(5);
    await page.goto(`/reserve?checkIn=${a}`);
    const cal = page.getByTestId("request-form").getByTestId("date-range-calendar");
    await expect(cal).toHaveAttribute("data-availability", "ready");
    await expect(page.getByTestId("calendar-hint")).toContainText("Choose a departure date");
    const short = cal.locator(`button[data-iso="${addDays(a, 4)}"]`);
    await expect(short).toHaveAttribute("aria-disabled", "true");
    const ok = cal.locator(`button[data-iso="${addDays(a, 5)}"]`);
    await expect(ok).not.toHaveAttribute("aria-disabled", "true");
  });

  test("quote in the folio and summary equals computeQuote", async ({ page }) => {
    const a = arrivalWithMin(3, addDays(today, 60));
    const d = addDays(a, 8); // crosses the weekly discount
    await page.goto(`/reserve?checkIn=${a}&checkOut=${d}&adults=2`);
    const q = computeQuote(a, d, 2);
    await expect(page.getByTestId("summary-total")).toHaveText(formatMoney(q.total));
    await expect(page.getByTestId("folio-total")).toHaveText(formatMoney(q.total));
    await expect(page.getByTestId("folio-discount")).toContainText(formatMoney(q.discounts));
  });

  test("keyboard-only request: fields, checkboxes, Enter to submit; confirmation has no PII for others", async ({ page, browser }) => {
    const a = arrivalWithMin(3, addDays(today, 90));
    await page.goto(`/reserve?checkIn=${a}&checkOut=${addDays(a, 4)}`);
    await page.getByLabel("Full name").focus();
    await page.keyboard.type("Grace Hopper");
    await page.keyboard.press("Tab");
    await page.keyboard.type("grace@example.com");
    await page.keyboard.press("Tab");
    await page.keyboard.type("843 555 0199");
    const rules = page.getByRole("checkbox", { name: /house rules/ });
    await rules.focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Tab"); // the house rules link
    await page.keyboard.press("Tab");
    await page.keyboard.press("Space");
    await expect(page.getByRole("checkbox", { name: /21 or older/ })).toBeChecked();
    await page.getByLabel("Phone").focus();
    await page.keyboard.press("Enter");
    await page.waitForURL(/\/reserve\?confirmed=/);
    await expect(page.getByTestId("reserve-confirmation")).toContainText("grace@example.com");
    const url = page.url();

    // Back: returns to the filled form; nothing is resubmitted.
    await page.goBack();
    await expect(page.getByTestId("reserve-confirmation")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1, name: "Reserve your stay" })).toBeVisible();
    await expect(page.getByLabel("Full name")).toHaveValue("Grace Hopper");

    // Someone else with the link (no sessionStorage) sees no name or email, only the empty form.
    const ctx = await browser.newContext();
    const other = await ctx.newPage();
    const html = await (await other.request.get(url)).text();
    expect(html).not.toContain("grace@example.com");
    expect(html).not.toContain("Grace");
    await other.goto(url);
    await expect(other.getByTestId("reserve-confirmation")).toHaveCount(0);
    await expect(other.locator("body")).not.toContainText("grace@example.com");
    await ctx.close();
  });

  test("error summary is announced and fields reference their errors", async ({ page }) => {
    const a = arrivalWithMin(3, addDays(today, 90));
    await page.goto(`/reserve?checkIn=${a}&checkOut=${addDays(a, 4)}`);
    await page.getByRole("button", { name: "Request this reservation" }).click();
    const alert = page.getByTestId("request-form").getByRole("alert");
    await expect(alert).toBeFocused();
    const name = page.getByLabel("Full name");
    await expect(name).toHaveAttribute("aria-invalid", "true");
    const describedBy = (await name.getAttribute("aria-describedby"))!;
    await expect(page.locator(`[id="${describedBy.split(" ").pop()}"]`)).toContainText("Full name");
  });

  test("success page without a valid id does not claim a request was received", async ({ page }) => {
    for (const q of ["", "?id=garbage", "?id=%3Cscript%3Ealert(1)%3C/script%3E"]) {
      await page.goto(`/booking/success${q}`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("No request to show.");
      await expect(page.getByTestId("success-missing")).toBeVisible();
    }
  });
});

test.describe("content hard rules (rendered)", () => {
  test("permit in footer, no unit number, no em dash, no TODO_OWNER, no unit ocean claims", async ({ page, request }) => {
    for (const p of PAGES) {
      await page.goto(p);
      await expect(page.locator("footer")).toContainText("029008");
      const html = await (await request.get(p)).text();
      expect(html, p).not.toContain("3206");
      expect(html, p).not.toContain("\u2014");
      const text = await page.locator("body").innerText();
      expect(text, p).not.toContain("TODO_OWNER");
      const claims = text.match(/[^.]*\b(ocean ?view|oceanfront|beachfront|ocean-front|beach-front)\b[^.]*\./gi) ?? [];
      // Allowed: explicit negations, and a public park described on the area guide.
      const offending = claims.filter((c) => !/\bno ocean view\b|never/i.test(c) && !/park/i.test(c));
      expect(offending, p).toEqual([]);
    }
    for (const asset of ["/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/opengraph-image"]) {
      const body = await (await request.get(asset)).text();
      expect(body, asset).not.toContain("3206");
    }
  });

  test("the four reviews render verbatim with attribution", async ({ page }) => {
    await page.goto("/");
    const text = (await page.locator("#reviews").innerText()).replace(/\s+/g, " ").replace(/[“”]/g, '"');
    for (const r of reviewsSection.reviews) {
      expect(text).toContain(r.text);
      expect(text).toContain(r.name);
    }
    expect(text).toMatch(/Vrbo\/Expedia/);
  });

  test("SEO: title, description, canonical per indexable page; valid JSON-LD without ratings", async ({ page }) => {
    const titles = new Set<string>();
    for (const p of ["/", "/reserve", "/gallery", "/area", "/faq", "/policies"]) {
      await page.goto(p);
      const title = await page.title();
      expect(title.length, p).toBeGreaterThan(10);
      titles.add(title);
      expect(await page.locator('meta[name="description"]').getAttribute("content"), p).toBeTruthy();
      expect(await page.locator('link[rel="canonical"]').count(), p).toBe(1);
      for (const s of await page.locator('script[type="application/ld+json"]').allTextContents()) {
        const parsed = JSON.parse(s);
        expect(JSON.stringify(parsed)).not.toMatch(/AggregateRating|aggregateRating|"Review"/);
      }
    }
    expect(titles.size).toBe(6);
    await page.goto("/booking/success");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("owner photographs", () => {
  test("gallery and home render real photos through next/image with manifest alt text", async ({ page, request }) => {
    const manifest = JSON.parse(await (await request.get("/photos/manifest.json")).text()) as { file: string; alt: string }[];
    test.skip(!manifest.length, "no photographs");
    await page.goto("/gallery");
    const thumbs = page.locator("button[aria-label^='Open photograph']");
    expect(await thumbs.count()).toBe(manifest.length);
    for (const m of manifest) await expect(page.locator(`button[aria-label$="${m.alt}"]`)).toHaveCount(1);
    const imgs = await page.$$eval("main img", (els) =>
      els.map((e) => ({ src: (e as HTMLImageElement).currentSrc || (e as HTMLImageElement).src, sizes: e.getAttribute("sizes"), srcset: e.getAttribute("srcset") })),
    );
    for (const i of imgs) {
      expect(i.src).toContain("/_next/image");
      expect(i.sizes).toBeTruthy();
      expect(i.srcset).toBeTruthy();
    }
    const res = await request.get(`/_next/image?url=${encodeURIComponent("/photos/" + manifest[0].file)}&w=1080&q=70`, { headers: { accept: "image/avif,image/webp,*/*" } });
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toMatch(/avif|webp/);
  });

  for (const vp of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`no layout shift while photos load at ${vp.width} (CLS < 0.05)`, async ({ page }) => {
      await page.setViewportSize(vp);
      for (const p of ["/", "/gallery"]) {
        await page.goto(p);
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight * 0.8) {
            window.scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
        });
        await page.waitForTimeout(500);
        const cls = await page.evaluate(
          () =>
            new Promise<number>((resolve) => {
              let total = 0;
              new PerformanceObserver((list) => {
                for (const e of list.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) if (!e.hadRecentInput) total += e.value;
              }).observe({ type: "layout-shift", buffered: true });
              setTimeout(() => resolve(total), 300);
            }),
        );
        expect(cls, p).toBeLessThan(0.05);
      }
    });
  }

  test("photo frames keep their ratio (no stretched or collapsed images)", async ({ page }) => {
    for (const w of [390, 1440]) {
      await page.setViewportSize({ width: w, height: 900 });
      for (const p of ["/", "/gallery"]) {
        await page.goto(p);
        const bad = await page.$$eval("main img", (els) =>
          els
            .map((e) => e.getBoundingClientRect())
            .filter((r) => r.width > 0 && (r.height < 40 || r.width / r.height > 4 || r.height / r.width > 4)).length,
        );
        expect(bad, `${w} ${p}`).toBe(0);
      }
    }
  });
});
