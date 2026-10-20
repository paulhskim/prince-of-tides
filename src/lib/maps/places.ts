/**
 * Place data for the estate map, derived from src/content/area-guide.ts (single source of truth)
 * plus the resort itself (from src/content/seo.ts geo).
 *
 * Coordinates from OpenStreetMap contributors / Wikipedia; not from Google.
 * Sources (checked October 2026):
 * - Harbour Town Lighthouse: Wikipedia, 32.13861, -80.81278.
 * - Hilton Head Island Airport (HHH): the OpenStreetMap map link on its Wikipedia article, 32.2244, -80.6969.
 * - Savannah/Hilton Head Intl (SAV): Wikipedia, 32.1275, -81.20222.
 * - Pinckney Island NWR: U.S. Fish and Wildlife Service reference point (the refuge, not the trailhead).
 * - Shelter Cove Towne Centre (locator only): Wikipedia, 32.184707, -80.721344.
 * Every other place has no coordinates until it can be verified to about 50 m from a non-Google
 * source (OpenStreetMap, Wikipedia/Wikidata or an official agency). The component lists those
 * places in its fallback and simply draws no marker for them.
 */

import { areaGuide, type AreaPlace } from "@/content/area-guide";
import { seo } from "@/content/seo";

export type LatLng = { lat: number; lng: number };

export type MapPlaceKind = "resort" | "place";

export interface MapPlace {
  /** Stable slug derived from the area guide name. */
  id: string;
  /** Full name as written in the area guide. */
  name: string;
  /** Short label for the map (locator labels, tooltips). */
  label: string;
  kind: MapPlaceKind;
  /** Area guide category id ("beaches", "eat-drink", ...). The resort uses "resort". */
  categoryId: string;
  /** 1-based position in the flattened area guide list. The resort has none. */
  number?: number;
  coordinates?: LatLng;
  /** Approx. road distance in miles from the resort (from the area guide). */
  distanceMiles: number | null;
  /** On-site amenity: selecting it highlights the resort marker. */
  atResort?: boolean;
  /** Which side of the mark the visible label sits on (locator variant). */
  labelSide?: "right" | "left" | "top" | "bottom";
}

export const RESORT_ID = "hilton-head-resort";

export const RESORT_ADDRESS = "Hilton Head Resort, 663 William Hilton Parkway, Hilton Head Island, SC 29928";

/** Public resort point: the same value as seo.ts geo (listing point, confirmed by the US Census geocoder within ~0.15 mi). */
export const RESORT: MapPlace = {
  id: RESORT_ID,
  name: "Hilton Head Resort",
  label: "Hilton Head Resort",
  kind: "resort",
  categoryId: "resort",
  coordinates: { lat: seo.geo.latitude, lng: seo.geo.longitude },
  distanceMiles: 0,
};

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Shorter map labels where the guide name is long. Keyed by guide name. */
const SHORT_LABELS: Record<string, string> = {
  "Hilton Head Resort beach (via the marsh boardwalk)": "Resort beach",
  "Burkes Beach Access": "Burkes Beach",
  "Big Jim's BBQ, Burgers & Pizza": "Big Jim's",
  "OMBRA Cucina Italiana": "OMBRA",
  "Up the Creek Pub & Grill": "Up the Creek",
  "Kroger (Shelter Cove)": "Kroger",
  "Kroger Pharmacy (Shelter Cove)": "Kroger Pharmacy",
  "Shelter Cove Harbour & Marina": "Shelter Cove Harbour",
  "Coastal Discovery Museum at Honey Horn": "Coastal Discovery Museum",
  "Harbour Town Lighthouse & Sea Pines": "Harbour Town Lighthouse",
  "Pinckney Island National Wildlife Refuge": "Pinckney Island Refuge",
  "Palmetto Dunes lagoon paddling and bike rentals": "Palmetto Dunes paddling",
  "Hilton Head Island Airport (HHH)": "Hilton Head Airport (HHH)",
  "Savannah/Hilton Head International Airport (SAV)": "Savannah Airport (SAV)",
};

function isAtResort(p: AreaPlace): boolean {
  return p.mode === "on-site" && p.distanceMiles === 0;
}

/** Every area guide place, in guide order, numbered 1..N (the order the /area list renders). */
export function getGuidePlaces(): MapPlace[] {
  let n = 0;
  const out: MapPlace[] = [];
  for (const category of areaGuide.categories) {
    for (const p of category.places) {
      n += 1;
      out.push({
        id: slugify(p.name),
        name: p.name,
        label: SHORT_LABELS[p.name] ?? p.name,
        kind: "place",
        categoryId: category.id,
        number: n,
        coordinates: p.coordinates,
        distanceMiles: p.distanceMiles,
        atResort: isAtResort(p) || undefined,
      });
    }
  }
  return out;
}

/** The marker number for an area guide place name (matches the guide list numbering). */
export function guidePlaceNumber(name: string): number | undefined {
  return getGuidePlaces().find((p) => p.name === name)?.number;
}

/** Map ids for area guide entries, so the /area page can key its list items. */
export function guidePlaceId(name: string): string {
  return slugify(name);
}

/** Categories that appear on the guide map (at least one place with coordinates). */
export function getGuideCategories(): { id: string; title: string }[] {
  const mapped = new Set(getGuidePlaces().filter((p) => p.coordinates).map((p) => p.categoryId));
  return areaGuide.categories.filter((c) => mapped.has(c.id)).map((c) => ({ id: c.id, title: c.title }));
}

/**
 * Locator set for the home page location section: resort beach / Coco's, the nearest beaches,
 * Shelter Cove, the nearest grocery and the island airport. Derived from the guide by name.
 */
const LOCATOR: { name: string; label?: string; labelSide: MapPlace["labelSide"] }[] = [
  { name: "Coco's on the Beach", label: "Resort beach and Coco's", labelSide: "bottom" },
  { name: "Burkes Beach Access", labelSide: "right" },
  { name: "Driessen Beach Park", label: "Driessen Beach", labelSide: "right" },
  { name: "Folly Field Beach Park", label: "Folly Field Beach", labelSide: "right" },
  { name: "Shelter Cove Harbour & Marina", label: "Shelter Cove", labelSide: "bottom" },
  { name: "Hilton Head Island Airport (HHH)", label: "Airport (HHH)", labelSide: "right" },
];

/** Locator-only point: the shopping centre itself (Kroger is its anchor). Wikipedia coordinates. */
export const SHELTER_COVE_TOWNE_CENTRE: MapPlace = {
  id: "shelter-cove-towne-centre",
  name: "Shelter Cove Towne Centre (Kroger)",
  label: "Shelter Cove Towne Centre",
  kind: "place",
  categoryId: "groceries",
  coordinates: { lat: 32.184707, lng: -80.721344 },
  distanceMiles: 1,
  labelSide: "bottom",
};

export function getLocatorPlaces(): MapPlace[] {
  const guide = getGuidePlaces();
  const picked: MapPlace[] = [];
  for (const entry of LOCATOR) {
    const g = guide.find((p) => p.name === entry.name);
    // Places without verified coordinates stay in the list (fallback) but get no marker.
    if (!g) continue;
    picked.push({ ...g, number: undefined, label: entry.label ?? g.label, labelSide: entry.labelSide });
    if (entry.name === "Shelter Cove Harbour & Marina") picked.push(SHELTER_COVE_TOWNE_CENTRE);
  }
  return [{ ...RESORT, labelSide: "right" }, ...picked];
}

/** Rough region every map coordinate must fall inside (Hilton Head, Bluffton, Savannah airport). */
export const REGION_BOUNDS = { south: 32.05, west: -81.3, north: 32.35, east: -80.6 } as const;

/** Great-circle distance in miles. */
export function haversineMiles(a: LatLng, b: LatLng): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** "about 1.2 mi" (road distance from the guide when known, else straight-line). */
export function approxDistanceLabel(p: MapPlace): string | null {
  if (p.kind === "resort" || p.atResort) return null;
  let miles = p.distanceMiles;
  if (miles === null && p.coordinates && RESORT.coordinates) miles = haversineMiles(RESORT.coordinates, p.coordinates);
  if (miles === null) return null;
  if (miles < 0.2) return "steps from the resort";
  const rounded = miles >= 10 ? Math.round(miles) : Math.round(miles * 10) / 10;
  return `about ${rounded} mi`;
}

export function accessibleName(p: MapPlace): string {
  if (p.kind === "resort") return "Hilton Head Resort, where you stay";
  const dist = approxDistanceLabel(p);
  const prefix = p.number ? `${p.number}. ` : "";
  return `${prefix}${p.name}${dist ? `, ${dist} from the resort` : ""}`;
}

export function appleMapsUrl(): string {
  const { latitude, longitude } = seo.geo;
  return `https://maps.apple.com/?q=${encodeURIComponent("Hilton Head Resort")}&address=${encodeURIComponent(
    "663 William Hilton Parkway, Hilton Head Island, SC 29928",
  )}&ll=${latitude},${longitude}`;
}

export function googleMapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESORT_ADDRESS)}`;
}

export interface MarkerGroup {
  key: string;
  places: MapPlace[];
  coordinates: LatLng;
}

/** Merge places that sit within `meters` of each other into one marker (e.g. Kroger and its pharmacy). */
export function groupByProximity(places: MapPlace[], meters = 40): MarkerGroup[] {
  const groups: MarkerGroup[] = [];
  const limit = meters / 1609.344;
  for (const p of places) {
    if (!p.coordinates) continue;
    const hit = groups.find((g) => g.places[0].kind === p.kind && haversineMiles(g.coordinates, p.coordinates!) <= limit);
    if (hit) hit.places.push(p);
    else groups.push({ key: p.id, places: [p], coordinates: p.coordinates });
  }
  return groups;
}

export type Bounds = [[number, number], [number, number]];

/**
 * Bounds ([west, south], [east, north]) for initial fit. Places farther than `maxMiles` from the
 * resort (Savannah airport) are left out so the island stays the subject.
 */
export function fitBoundsFor(places: MapPlace[], opts: { centerOnResort?: boolean; maxMiles?: number } = {}): Bounds {
  const maxMiles = opts.maxMiles ?? 15;
  const center = RESORT.coordinates!;
  const pts = places
    .map((p) => p.coordinates)
    .filter((c): c is LatLng => !!c && haversineMiles(center, c) <= maxMiles);
  pts.push(center);
  let west = Math.min(...pts.map((c) => c.lng));
  let east = Math.max(...pts.map((c) => c.lng));
  let south = Math.min(...pts.map((c) => c.lat));
  let north = Math.max(...pts.map((c) => c.lat));
  if (opts.centerOnResort) {
    const dLng = Math.max(center.lng - west, east - center.lng);
    const dLat = Math.max(center.lat - south, north - center.lat);
    west = center.lng - dLng;
    east = center.lng + dLng;
    south = center.lat - dLat;
    north = center.lat + dLat;
  }
  return [
    [west, south],
    [east, north],
  ];
}

/** Decorative geographic labels drawn in the site's type (the basemap's own labels are hidden). */
export interface GeoLabel {
  text: string;
  coordinates: LatLng;
  kind: "water" | "land";
  minZoom: number;
  maxZoom: number;
}

export const GEO_LABELS: GeoLabel[] = [
  { text: "Atlantic Ocean", coordinates: { lat: 32.163, lng: -80.672 }, kind: "water", minZoom: 9, maxZoom: 15 },
  { text: "Port Royal Sound", coordinates: { lat: 32.276, lng: -80.685 }, kind: "water", minZoom: 9.5, maxZoom: 13.5 },
  { text: "Calibogue Sound", coordinates: { lat: 32.125, lng: -80.828 }, kind: "water", minZoom: 10, maxZoom: 13.5 },
  { text: "Hilton Head Island", coordinates: { lat: 32.15, lng: -80.778 }, kind: "land", minZoom: 9, maxZoom: 11.6 },
  { text: "Bluffton", coordinates: { lat: 32.237, lng: -80.861 }, kind: "land", minZoom: 9, maxZoom: 12 },
];
