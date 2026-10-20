/* eslint-disable @typescript-eslint/no-explicit-any -- JSON-LD objects are inspected loosely in these tests. */
/**
 * SEO checks. Run: npx tsx --test tests/seo/seo.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { seo, type PageKey } from "@/content/seo";
import { faq } from "@/content/faq";
import { pageMetadata, renderedTitle, rootMetadata, noindexMetadata } from "@/lib/seo/metadata";
import {
  breadcrumbSchema,
  faqPageSchema,
  lodgingBusinessSchema,
  pageBreadcrumb,
  propertySchema,
  qualifiesForVacationRental,
  vacationRentalSchema,
  websiteSchema,
  type SchemaPhoto,
} from "@/lib/seo/schema";
import { absoluteUrl, siteUrl } from "@/lib/seo/site-url";
import { serializeJsonLd } from "@/components/seo/JsonLd";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";

const PAGES = Object.keys(seo.pages) as PageKey[];
const EM_DASH = String.fromCharCode(0x2014);
const UNIT = "3206";

const fakePhotos: SchemaPhoto[] = [
  { src: "/photos/living-wide.jpg", slot: "living" },
  { src: "/photos/kitchen.jpg", slot: "kitchen" },
  { src: "/photos/dining.jpg", slot: "dining" },
  { src: "/photos/bedroom-king.jpg", slot: "bedroom1" },
  { src: "/photos/bedroom-two.jpg", slot: "bedroom2" },
  { src: "/photos/bath-ensuite.jpg", slot: "bath" },
  { src: "/photos/resort-indoor-pool.jpg", slot: "pool" },
  { src: "/photos/boardwalk-wide.jpg", slot: "boardwalk" },
  { src: "/photos/host.jpg", slot: "host" },
];

function allOutputs(): unknown[] {
  return [
    rootMetadata,
    noindexMetadata,
    ...PAGES.map((p) => pageMetadata(p)),
    websiteSchema(),
    propertySchema([]),
    propertySchema(fakePhotos),
    lodgingBusinessSchema(fakePhotos),
    vacationRentalSchema(fakePhotos),
    faqPageSchema(faq),
    pageBreadcrumb("faq"),
    sitemap(),
    robots(),
    manifest(),
  ];
}

const dump = (v: unknown) =>
  JSON.stringify(v, (_k, val) => (val instanceof URL ? val.toString() : val));

test("rendered titles are 60 characters or fewer", () => {
  for (const p of PAGES) {
    const t = renderedTitle(p);
    assert.ok(t.length <= 60, `${p}: "${t}" is ${t.length} chars`);
  }
  assert.ok(seo.defaultTitle.length <= 60);
  assert.equal(renderedTitle("faq"), "FAQ: Parking, Check-In, Beach Access | Prince of Tides");
});

test("home title is absolute, other titles use the template", () => {
  assert.deepEqual(pageMetadata("home").title, { absolute: seo.pages.home.title });
  assert.equal(pageMetadata("area").title, seo.pages.area.title);
  const t = rootMetadata.title as { template: string };
  assert.equal(t.template, seo.titleTemplate);
});

test("descriptions are 155 characters or fewer", () => {
  for (const p of PAGES) {
    const d = pageMetadata(p).description ?? "";
    assert.ok(d.length > 50 && d.length <= 155, `${p}: ${d.length} chars`);
  }
  assert.ok(seo.defaultDescription.length <= 155);
});

test("canonical, Open Graph and Twitter are complete", () => {
  for (const p of PAGES) {
    const m = pageMetadata(p);
    assert.equal(m.alternates?.canonical, absoluteUrl(seo.pages[p].path));
    const og = m.openGraph as Record<string, unknown>;
    assert.equal(og.type, "website");
    assert.equal(og.locale, "en_US");
    assert.equal(og.siteName, "Prince of Tides");
    const img = (og.images as { url: string; width: number; height: number; alt: string }[])[0];
    assert.equal(img.url, absoluteUrl("/opengraph-image"));
    assert.equal(img.width, 1200);
    assert.equal(img.height, 630);
    assert.ok(img.alt.length > 0);
    assert.equal((m.twitter as { card: string }).card, "summary_large_image");
  }
});

test("noindexMetadata blocks indexing", () => {
  const r = noindexMetadata.robots as { index: boolean; follow: boolean };
  assert.equal(r.index, false);
  assert.equal(r.follow, false);
});

test("site URL never contains a placeholder", () => {
  const prev = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = "https://TODO_OWNER_DOMAIN";
  try {
    assert.ok(!siteUrl().includes("TODO"));
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prev;
  }
  process.env.NEXT_PUBLIC_SITE_URL = "example.com/";
  try {
    assert.equal(siteUrl(), "https://example.com");
  } finally {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = prev;
  }
  assert.ok(!dump(allOutputs()).includes("TODO"));
});

test("property schema: LodgingBusiness below 8 qualifying photos, VacationRental at 8+", () => {
  assert.equal(propertySchema([])["@type"], "LodgingBusiness");
  assert.equal(propertySchema(fakePhotos.slice(0, 7))["@type"], "LodgingBusiness");
  // 8 photos but no bathroom: not eligible
  const noBath = fakePhotos.filter((p) => p.slot !== "bath").concat({ src: "/photos/x.jpg", slot: "other" });
  assert.equal(qualifiesForVacationRental(noBath), false);
  assert.equal(propertySchema(fakePhotos)["@type"], "VacationRental");
});

test("VacationRental has Google's required fields", () => {
  const s = vacationRentalSchema(fakePhotos) as Record<string, any>;
  assert.equal(s["@context"], "https://schema.org");
  assert.equal(s.identifier, "prince-of-tides-hilton-head-resort");
  assert.equal(s.name, "Prince of Tides");
  assert.ok(Array.isArray(s.image) && s.image.length >= 8);
  assert.ok(s.image.every((u: string) => u.startsWith("http")));
  assert.ok(!s.image.some((u: string) => u.includes("/photos/host")), "host portrait excluded");
  assert.equal(s.latitude, 32.19051);
  assert.equal(s.longitude, -80.70688);
  assert.ok(String(s.latitude).split(".")[1].length >= 5);
  assert.equal(s.containsPlace["@type"], "Accommodation");
  assert.equal(s.containsPlace.occupancy.value, 6);
  assert.equal(s.containsPlace.numberOfBedrooms, 2);
  assert.equal(s.containsPlace.numberOfBathroomsTotal, 2);
  assert.equal(s.containsPlace.bed.length, 3);
  assert.ok(s.containsPlace.amenityFeature.length > 10);
  assert.equal(s.address.streetAddress, "663 William Hilton Parkway");
  assert.equal(s.checkinTime, "16:00:00");
});

test("LodgingBusiness lite has the fields from docs/seo.md 4.3", () => {
  const s = lodgingBusinessSchema([]) as Record<string, any>;
  for (const k of ["name", "url", "address", "geo", "checkinTime", "checkoutTime", "amenityFeature"]) {
    assert.ok(k in s, `missing ${k}`);
  }
  assert.equal(s.petsAllowed, false);
  assert.ok(!("image" in s), "no empty image array");
});

test("no review or rating markup anywhere", () => {
  const out = dump(allOutputs());
  assert.ok(!/AggregateRating|"Review"|aggregateRating|"review"/.test(out));
});

test("FAQPage mirrors every FAQ item with tokens filled", () => {
  const s = faqPageSchema(faq) as Record<string, any>;
  assert.equal(s["@type"], "FAQPage");
  assert.equal(s.mainEntity.length, faq.length);
  for (const q of s.mainEntity) {
    assert.equal(q["@type"], "Question");
    assert.ok(q.name.length > 0);
    assert.equal(q.acceptedAnswer["@type"], "Answer");
    assert.ok(!q.acceptedAnswer.text.includes("{{"), "unfilled token");
  }
});

test("breadcrumbs and website", () => {
  const b = breadcrumbSchema([
    { name: "Home", path: "/" },
    { name: "Area guide", path: "/area" },
  ]) as Record<string, any>;
  assert.equal(b.itemListElement[1].position, 2);
  assert.equal(b.itemListElement[1].item, absoluteUrl("/area"));
  const w = websiteSchema() as Record<string, any>;
  assert.equal(w["@type"], "WebSite");
  assert.equal(w.name, "Prince of Tides");
  assert.ok(!("potentialAction" in w));
});

test("JSON-LD serializes to valid, script-safe JSON", () => {
  const evil = { "@type": "Thing", name: "</script><script>alert(1)</script> & \u2028" };
  for (const data of [...allOutputs().slice(2 + PAGES.length, 2 + PAGES.length + 8), evil]) {
    const s = serializeJsonLd(data);
    assert.ok(!s.includes("</"), "no closing tag sequence");
    assert.ok(!s.includes("<"));
    assert.deepEqual(JSON.parse(s), JSON.parse(JSON.stringify(data)));
  }
});

test("sitemap and robots", () => {
  const urls = sitemap().map((e) => e.url);
  assert.equal(urls.length, 6);
  assert.ok(urls.every((u) => !u.includes("/booking") && !u.includes("/api")));
  const r = robots();
  const rules = Array.isArray(r.rules) ? r.rules[0] : r.rules;
  assert.deepEqual(rules.disallow, ["/api/", "/booking/"]);
  assert.equal(r.sitemap, absoluteUrl("/sitemap.xml"));
});

test("no em dash and no unit number in any output", () => {
  const out = dump(allOutputs());
  assert.ok(!out.includes(EM_DASH), "em dash in output");
  assert.ok(!out.includes(UNIT), "unit number in output");
});

test("no em dash in SEO source files", () => {
  const roots = ["src/lib/seo", "src/components/seo", "tests/seo"].map((p) => path.join(process.cwd(), p));
  const files = [
    ...roots.flatMap((dir) => fs.readdirSync(dir).map((f) => path.join(dir, f))),
    ...["sitemap.ts", "robots.ts", "manifest.ts", "opengraph-image.tsx", "icon.tsx", "apple-icon.tsx"].map((f) =>
      path.join(process.cwd(), "src/app", f),
    ),
  ];
  for (const f of files) {
    assert.ok(!fs.readFileSync(f, "utf8").includes(EM_DASH), `em dash in ${f}`);
  }
});
