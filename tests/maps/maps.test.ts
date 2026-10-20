/**
 * Estate map checks. Run: npx tsx --test tests/maps/*.test.ts
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { validateStyleMin } from "@maplibre/maplibre-gl-style-spec";
import type { StyleSpecification } from "@maplibre/maplibre-gl-style-spec";

import { areaGuide } from "@/content/area-guide";
import {
  GEO_LABELS,
  REGION_BOUNDS,
  RESORT,
  accessibleName,
  fitBoundsFor,
  getGuideCategories,
  getGuidePlaces,
  getLocatorPlaces,
  groupByProximity,
  haversineMiles,
} from "@/lib/maps/places";
import {
  REQUIRED_ATTRIBUTION,
  WETLAND_LAYER_ID,
  derivePalette,
  isHexColor,
  mix,
  paintColorsValid,
  restyle,
  type StyleLike,
} from "@/lib/maps/style";

const ROOT = path.resolve(__dirname, "../..");
const MAP_DIRS = ["src/components/maps", "src/lib/maps", "src/app/dev/map", "tests/maps"];

function filesIn(dir: string): string[] {
  const abs = path.join(ROOT, dir);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? filesIn(path.join(dir, d.name)) : [path.join(abs, d.name)],
  );
}

const mapFiles = [...MAP_DIRS.flatMap(filesIn), path.join(ROOT, "src/content/area-guide.ts")];

/* A small positron-like fixture (OpenMapTiles schema, real upstream layer ids). */
const fixture: StyleLike = {
  version: 8,
  name: "Positron",
  glyphs: "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  sprite: "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
  sources: { openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" } },
  layers: [
    { id: "background", type: "background", paint: { "background-color": "rgb(242,243,240)" } },
    { id: "park", type: "fill", source: "openmaptiles", "source-layer": "park", paint: { "fill-color": "rgb(230, 233, 229)" } },
    { id: "water", type: "fill", source: "openmaptiles", "source-layer": "water", filter: ["!=", ["get", "brunnel"], "tunnel"], paint: { "fill-color": "rgb(194, 200, 202)" } },
    { id: "landcover_wood", type: "fill", source: "openmaptiles", "source-layer": "landcover", filter: ["==", ["get", "class"], "wood"], paint: { "fill-color": "rgb(220,224,220)", "fill-opacity": 0.4 } },
    { id: "landuse_residential", type: "fill", source: "openmaptiles", "source-layer": "landuse", maxzoom: 16, paint: { "fill-color": "rgb(234, 234, 230)" } },
    { id: "waterway", type: "line", source: "openmaptiles", "source-layer": "waterway", paint: { "line-color": "hsl(195, 17%, 78%)" } },
    { id: "building", type: "fill", source: "openmaptiles", "source-layer": "building", minzoom: 12, paint: { "fill-color": "rgb(234, 234, 229)", "fill-outline-color": "rgb(219, 219, 218)" } },
    { id: "building-3d", type: "fill-extrusion", source: "openmaptiles", "source-layer": "building", paint: { "fill-extrusion-color": "#ddd", "fill-extrusion-height": 10 } },
    { id: "aeroway-area", type: "fill", source: "openmaptiles", "source-layer": "aeroway", paint: { "fill-color": "rgba(255, 255, 255, 1)" } },
    { id: "aeroway-runway", type: "line", source: "openmaptiles", "source-layer": "aeroway", filter: ["==", ["get", "class"], "runway"], paint: { "line-color": "#fff", "line-width": 4 } },
    { id: "highway_path", type: "line", source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "path"], paint: { "line-color": "rgb(234, 234, 234)" } },
    { id: "highway_minor", type: "line", source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["minor", "service", "track"]]], paint: { "line-color": "hsl(0, 0%, 88%)" } },
    { id: "highway_major_casing", type: "line", source: "openmaptiles", "source-layer": "transportation", paint: { "line-color": "rgb(213, 213, 213)" } },
    { id: "highway_major_inner", type: "line", source: "openmaptiles", "source-layer": "transportation", filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "tertiary", "trunk"]]], paint: { "line-color": "#fff" } },
    { id: "railway", type: "line", source: "openmaptiles", "source-layer": "transportation", filter: ["==", ["get", "class"], "rail"], paint: { "line-color": "#ddd" } },
    { id: "boundary_state", type: "line", source: "openmaptiles", "source-layer": "boundary", paint: { "line-color": "rgb(230, 204, 207)" } },
    { id: "water_name", type: "symbol", source: "openmaptiles", "source-layer": "water_name", layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Italic"] }, paint: { "text-color": "rgb(157,169,177)" } },
    { id: "highway_name_other", type: "symbol", source: "openmaptiles", "source-layer": "transportation_name", layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "symbol-placement": "line" }, paint: { "text-color": "#bbb" } },
    { id: "highway_shield", type: "symbol", source: "openmaptiles", "source-layer": "transportation_name", layout: { "icon-image": "road_{ref_length}", "text-field": ["get", "ref"], "text-font": ["Noto Sans Regular"] } },
    { id: "poi_r1", type: "symbol", source: "openmaptiles", "source-layer": "poi", layout: { "icon-image": ["get", "class"], "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"] } },
    { id: "place_city", type: "symbol", source: "openmaptiles", "source-layer": "place", layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"] } },
  ],
};

const byId = (s: StyleLike, id: string) => s.layers.find((l) => l.id === id)!;
const isHidden = (s: StyleLike, id: string) => byId(s, id).layout?.visibility === "none";

/* ------------------------------------------------------------------ coordinates */

test("every coordinate sits inside the Hilton Head / Bluffton / Savannah airport box", () => {
  const all = [RESORT, ...getGuidePlaces(), ...getLocatorPlaces()];
  const pts = [
    ...all.filter((p) => p.coordinates).map((p) => ({ name: p.name, c: p.coordinates! })),
    ...GEO_LABELS.map((g) => ({ name: g.text, c: g.coordinates })),
  ];
  assert.ok(pts.length >= 8);
  for (const { name, c } of pts) {
    assert.ok(Number.isFinite(c.lat) && Number.isFinite(c.lng), name);
    assert.ok(c.lat >= REGION_BOUNDS.south && c.lat <= REGION_BOUNDS.north, `${name} lat ${c.lat}`);
    assert.ok(c.lng >= REGION_BOUNDS.west && c.lng <= REGION_BOUNDS.east, `${name} lng ${c.lng}`);
  }
});

test("straight-line distance never exceeds the guide's road distance by much", () => {
  for (const p of getGuidePlaces()) {
    if (!p.coordinates || p.distanceMiles === null || p.distanceMiles === 0) continue;
    const crow = haversineMiles(RESORT.coordinates!, p.coordinates);
    // Road distance is always at least the straight line (10% slack for rounding).
    assert.ok(crow <= p.distanceMiles * 1.1 + 0.2, `${p.name}: ${crow.toFixed(2)} mi straight vs ${p.distanceMiles} road`);
  }
});

test("guide numbering follows the area guide list order and ids are unique", () => {
  const places = getGuidePlaces();
  const names = areaGuide.categories.flatMap((c) => c.places.map((p) => p.name));
  assert.deepEqual(places.map((p) => p.name), names);
  assert.deepEqual(places.map((p) => p.number), names.map((_, i) => i + 1));
  assert.equal(new Set(places.map((p) => p.id)).size, places.length);
});

test("locator set has the resort first plus beach, Shelter Cove, grocery and airport", () => {
  const loc = getLocatorPlaces();
  assert.equal(loc[0].kind, "resort");
  const ids = loc.map((p) => p.id);
  for (const want of ["cocos-on-the-beach", "burkes-beach-access", "shelter-cove-harbour-and-marina", "shelter-cove-towne-centre", "hilton-head-island-airport-hhh"]) {
    assert.ok(ids.includes(want), want);
  }
  // Markers exist at least for the resort, the grocery centre and the airport.
  assert.ok(groupByProximity(loc).length >= 3);
});

test("missing coordinates are handled (no markers, still listed)", () => {
  const places = getGuidePlaces();
  assert.ok(places.some((p) => !p.coordinates));
  const groups = groupByProximity(places);
  assert.equal(groups.length, places.filter((p) => p.coordinates).length);
  assert.ok(groups.every((g) => g.places.every((p) => p.coordinates)));
  assert.ok(getGuideCategories().length > 0);
});

test("whole foods (closed in 2024) is gone and groceries stay useful", () => {
  const names = areaGuide.categories.flatMap((c) => c.places.map((p) => p.name));
  assert.ok(!names.some((n) => /whole foods/i.test(n)));
  const groceries = areaGuide.categories.find((c) => c.id === "groceries")!;
  assert.ok(groceries.places.filter((p) => p.tags.includes("groceries")).length >= 2);
});

test("coordinates are documented as non-Google", () => {
  for (const f of ["src/content/area-guide.ts", "src/lib/maps/places.ts"]) {
    assert.ok(fs.readFileSync(path.join(ROOT, f), "utf8").includes("not from Google"), f);
  }
});

test("fit bounds keep Savannah out so the island stays the subject", () => {
  const [[w, s], [e, n]] = fitBoundsFor(getGuidePlaces());
  assert.ok(w > -81, `west ${w}`);
  assert.ok(s < n && w < e);
  const [[cw, cs], [ce, cn]] = fitBoundsFor(getLocatorPlaces(), { centerOnResort: true });
  const c = RESORT.coordinates!;
  assert.ok(Math.abs((cw + ce) / 2 - c.lng) < 1e-9 && Math.abs((cs + cn) / 2 - c.lat) < 1e-9);
});

test("marker accessible names include name and approx distance", () => {
  const driessen = getGuidePlaces().find((p) => p.id === "driessen-beach-park")!;
  // Road distance from the guide is used even when the place has no coordinates.
  assert.match(accessibleName(driessen), /^\d+\. Driessen Beach Park, about 1\.3 mi from the resort$/);
  assert.match(accessibleName(RESORT), /Hilton Head Resort/);
});

/* ------------------------------------------------------------------ style rewrite */

test("palette derives valid hex colors from the tokens", () => {
  const p = derivePalette();
  for (const [k, v] of Object.entries(p)) assert.ok(isHexColor(v), `${k}: ${v}`);
  assert.equal(p.land, "#ecece5");
  assert.equal(mix("#000000", "#ffffff", 0.5), "#808080");
  // Live token override is honored; garbage is ignored.
  assert.equal(derivePalette({ paper: "#ffffff", ink: "red" }).land, "#ffffff");
});

test("restyle produces a valid MapLibre style with on-palette paint values", () => {
  const out = restyle(fixture);
  const errors = validateStyleMin(out as unknown as StyleSpecification);
  assert.deepEqual(errors.map((e) => e.message), []);
  assert.ok(paintColorsValid(out));
  const p = derivePalette();
  assert.equal(byId(out, "background").paint!["background-color"], p.land);
  assert.equal(byId(out, "water").paint!["fill-color"], p.water);
  assert.equal(byId(out, "park").paint!["fill-color"], p.park);
  assert.deepEqual(byId(out, "water").filter, fixture.layers[2].filter, "filters are untouched");
  // The marsh tint is present for wetlands, drawn below water, even though positron has no wetland layer.
  assert.ok(JSON.stringify(byId(out, "landcover_wood").paint!["fill-color"]).includes(p.wetland));
  const wet = out.layers.findIndex((l) => l.id === WETLAND_LAYER_ID);
  const water = out.layers.findIndex((l) => l.id === "water");
  assert.ok(wet >= 0 && wet < water);
  assert.equal(out.layers[wet].paint!["fill-color"], p.wetland);
  assert.equal(restyle(out).layers.filter((l) => l.id === WETLAND_LAYER_ID).length, 1, "idempotent");
});

test("restyle hides clutter: POIs, shields, place/water names, buildings, 3D, casings, rail", () => {
  const out = restyle(fixture);
  for (const id of ["poi_r1", "highway_shield", "place_city", "water_name", "building", "building-3d", "highway_major_casing", "railway", "boundary_state", "landuse_residential"]) {
    assert.ok(isHidden(out, id), `${id} should be hidden`);
  }
  for (const id of ["water", "park", "highway_minor", "highway_major_inner", "highway_name_other", "aeroway-area"]) {
    assert.ok(!isHidden(out, id), `${id} should be visible`);
  }
  const label = byId(out, "highway_name_other");
  assert.equal(label.paint!["text-color"], derivePalette().roadLabel);
  assert.ok((label.minzoom ?? 0) >= 13.5);
});

test("restyle forces required attribution and does not mutate its input", () => {
  const before = JSON.stringify(fixture);
  const out = restyle(fixture);
  assert.equal(JSON.stringify(fixture), before);
  const attr = out.sources.openmaptiles.attribution!;
  assert.equal(attr, REQUIRED_ATTRIBUTION);
  for (const name of ["OpenFreeMap", "OpenMapTiles", "OpenStreetMap"]) assert.ok(attr.includes(name), name);
  assert.equal(out.pitch, 0);
});

/* ------------------------------------------------------------------ hard rules */

test("no em dash in any map file", () => {
  const EM = String.fromCharCode(0x2014);
  for (const f of mapFiles) assert.ok(!fs.readFileSync(f, "utf8").includes(EM), f);
});

test("the unit number never appears in any map file", () => {
  const unit = ["32", "06"].join("");
  for (const f of mapFiles) assert.ok(!fs.readFileSync(f, "utf8").includes(unit), f);
});

test("attribution is rendered by the component", () => {
  const src = fs.readFileSync(path.join(ROOT, "src/components/maps/EstateMap.tsx"), "utf8");
  for (const s of ["OpenFreeMap", "OpenMapTiles", "OpenStreetMap contributors"]) assert.ok(src.includes(s), s);
});
