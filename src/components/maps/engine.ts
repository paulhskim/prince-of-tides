/**
 * The MapLibre side of <EstateMap>. Loaded with a dynamic import only once the map is wanted,
 * so neither maplibre-gl nor its CSS ships with the first page load.
 */
import { LngLatBounds, Map as MapLibreMap, Marker } from "maplibre-gl";
import type { StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./estate-map.css";

import {
  GEO_LABELS,
  accessibleName,
  groupByProximity,
  type Bounds,
  type MapPlace,
  type MarkerGroup,
} from "@/lib/maps/places";
import { TOKEN_VARS, derivePalette, restyle, type StyleLike, type Tokens } from "@/lib/maps/style";

export interface EngineOptions {
  styleUrl: string;
  variant: "locator" | "guide";
  /** All markers, resort included. */
  places: MapPlace[];
  bounds: Bounds;
  reducedMotion: boolean;
  coarsePointer: boolean;
  onSelect: (id: string) => void;
  onReady: () => void;
  onFail: (reason: string) => void;
}

export interface EngineHandle {
  setActive: (id: string | null) => void;
  setCategory: (categoryId: string | null) => void;
  zoomBy: (delta: number) => void;
  reset: () => void;
  destroy: () => void;
}

const READY_TIMEOUT_MS = 15000;
const REGION: Bounds = [
  [-81.45, 31.95],
  [-80.45, 32.45],
];

function readTokens(): Partial<Tokens> {
  const out: Partial<Tokens> = {};
  try {
    const cs = getComputedStyle(document.documentElement);
    for (const [k, v] of Object.entries(TOKEN_VARS) as [keyof Tokens, string][]) {
      const value = cs.getPropertyValue(v).trim();
      if (value) out[k] = value;
    }
  } catch {
    /* defaults apply */
  }
  return out;
}

function fitPadding(variant: EngineOptions["variant"], width: number) {
  const s = width < 520 ? 0.6 : 1;
  return variant === "locator"
    ? { top: 56 * s, bottom: 56 * s, left: 48 * s, right: 150 * s }
    : { top: 56 * s, bottom: 48 * s, left: 48 * s, right: 72 * s };
}

export async function mountEstateMap(container: HTMLElement, opts: EngineOptions): Promise<EngineHandle> {
  let destroyed = false;
  let ready = false;
  let failed = false;
  let map: MapLibreMap | null = null;
  const markers: { group: MarkerGroup; marker: Marker; el: HTMLButtonElement }[] = [];
  const geoMarkers: { minZoom: number; maxZoom: number; el: HTMLElement; marker: Marker }[] = [];
  let activeId: string | null = null;
  /** Markers exist (set at the very end of setup, so early returns never touch uninitialized state). */
  let built = false;
  let category: string | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined = undefined;
  let resizeObs: ResizeObserver | undefined;

  const fail = (reason: string) => {
    if (failed || destroyed) return;
    failed = true;
    if (timer) clearTimeout(timer);
    opts.onFail(reason);
  };

  const handle: EngineHandle = {
    setActive(id) {
      activeId = id;
      if (built && !failed && !destroyed) applyActive(true);
    },
    setCategory(id) {
      category = id;
      if (!built || failed || destroyed) return;
      buildPlaceMarkers();
      applyActive(false);
    },
    zoomBy(delta) {
      if (!map) return;
      map.easeTo({ zoom: map.getZoom() + delta, duration: opts.reducedMotion ? 0 : 220 });
    },
    reset() {
      if (!map) return;
      map.fitBounds(opts.bounds, {
        padding: fitPadding(opts.variant, container.clientWidth),
        animate: !opts.reducedMotion,
        duration: 600,
      });
    },
    destroy() {
      destroyed = true;
      if (timer) clearTimeout(timer);
      resizeObs?.disconnect();
      try {
        map?.remove();
      } catch {
        /* already gone */
      }
      map = null;
    },
  };

  // 1. Fetch and restyle the basemap. Any failure here goes straight to the typographic fallback.
  let style: StyleLike;
  try {
    const res = await fetch(opts.styleUrl, { mode: "cors", credentials: "omit" });
    if (!res.ok) throw new Error(`style ${res.status}`);
    style = restyle((await res.json()) as StyleLike, derivePalette(readTokens()));
  } catch (e) {
    fail(e instanceof Error ? e.message : "style");
    return handle;
  }
  if (destroyed) return handle;

  // 2. Create the map. Static by default: no scroll hijack, no rotation, no pitch.
  try {
    map = new MapLibreMap({
      container,
      style: style as unknown as StyleSpecification,
      bounds: opts.bounds,
      fitBoundsOptions: { padding: fitPadding(opts.variant, container.clientWidth) },
      maxBounds: REGION,
      minZoom: 8.5,
      maxZoom: 16.5,
      attributionControl: false,
      scrollZoom: false,
      boxZoom: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      cooperativeGestures: opts.coarsePointer,
      renderWorldCopies: false,
      fadeDuration: opts.reducedMotion ? 0 : 200,
      locale: {
        "CooperativeGesturesHandler.WindowsHelpText": "Use Ctrl and scroll to zoom the map",
        "CooperativeGesturesHandler.MacHelpText": "Use ⌘ and scroll to zoom the map",
        "CooperativeGesturesHandler.MobileHelpText": "Use two fingers to move the map",
        "Map.Title": "Map",
      },
    });
  } catch (e) {
    fail(e instanceof Error ? e.message : "webgl");
    return handle;
  }

  const m = map;
  m.touchZoomRotate.disableRotation();
  m.keyboard.disableRotation();
  m.getCanvas().setAttribute(
    "aria-label",
    opts.variant === "locator"
      ? "Map of Hilton Head Resort and nearby places. Use the arrow keys to move the map."
      : "Map of the area guide places. Use the arrow keys to move the map.",
  );

  // Compact labels on narrow maps.
  const setCompact = () => {
    container.dataset.compact = container.clientWidth < 520 ? "true" : "false";
  };
  setCompact();
  if (typeof ResizeObserver !== "undefined") {
    resizeObs = new ResizeObserver(setCompact);
    resizeObs.observe(container);
  }

  // 3. Readiness: at least one tile must load. Tile failures alone never fire `idle` reliably,
  // so a timeout backs it up.
  let tilesLoaded = 0;
  timer = setTimeout(() => {
    if (!ready) fail("timeout");
  }, READY_TIMEOUT_MS);
  m.on("data", (e) => {
    if (e.dataType === "source" && "tile" in e && e.tile) tilesLoaded += 1;
  });
  m.on("idle", () => {
    if (ready || failed || destroyed) return;
    if (tilesLoaded > 0) {
      ready = true;
      if (timer) clearTimeout(timer);
      opts.onReady();
    } else {
      fail("tiles");
    }
  });
  m.on("error", () => {
    // Individual tile errors after the map is ready are tolerated (MapLibre retries on pan).
  });
  m.getCanvas().addEventListener("webglcontextlost", () => fail("context lost"));

  // 4. Markers.
  const resortPlace = opts.places.find((p) => p.kind === "resort");
  const otherPlaces = opts.places.filter((p) => p.kind !== "resort");

  function makeLabel(text: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.className = "em-label";
    span.textContent = text;
    return span;
  }

  function makeMarker(group: MarkerGroup): HTMLButtonElement {
    const btn = document.createElement("button");
    btn.type = "button";
    const first = group.places[0];
    const names = group.places.map((p) => accessibleName(p));
    btn.setAttribute("aria-label", names.join("; "));
    btn.setAttribute("aria-pressed", "false");
    btn.dataset.ids = group.places.map((p) => p.id).join(" ");

    if (first.kind === "resort") {
      btn.className = "em-marker em-marker--resort em-side-right";
      const leader = document.createElement("span");
      leader.className = "em-leader";
      btn.append(leader, makeLabel(first.label));
    } else if (opts.variant === "guide") {
      btn.className = "em-marker em-marker--num em-side-right";
      const num = document.createElement("span");
      num.className = "em-num";
      num.textContent = group.places.map((p) => p.number ?? "").join(",");
      num.setAttribute("aria-hidden", "true");
      btn.append(num, makeLabel(group.places.map((p) => p.label).join(" / ")));
    } else {
      btn.className = `em-marker em-marker--place em-side-${first.labelSide ?? "right"}`;
      btn.append(makeLabel(group.places.map((p) => p.label).join(" / ")));
    }
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      opts.onSelect(first.id);
    });
    return btn;
  }

  function addGroup(group: MarkerGroup) {
    const el = makeMarker(group);
    const marker = new Marker({ element: el, anchor: "center" })
      .setLngLat([group.coordinates.lng, group.coordinates.lat])
      .addTo(m);
    markers.push({ group, marker, el });
  }

  function buildPlaceMarkers() {
    for (let i = markers.length - 1; i >= 0; i--) {
      if (markers[i].group.places[0].kind !== "resort") {
        markers[i].marker.remove();
        markers.splice(i, 1);
      }
    }
    const visible = otherPlaces.filter((p) => !category || p.categoryId === category);
    for (const g of groupByProximity(visible)) addGroup(g);
  }

  if (resortPlace?.coordinates) {
    addGroup({ key: resortPlace.id, places: [resortPlace], coordinates: resortPlace.coordinates });
  }
  buildPlaceMarkers();

  // Geographic labels, set in the site's type.
  for (const g of GEO_LABELS) {
    const el = document.createElement("div");
    el.className = `em-geo em-geo--${g.kind}`;
    el.textContent = g.text;
    el.setAttribute("aria-hidden", "true");
    const marker = new Marker({ element: el, anchor: "center" })
      .setLngLat([g.coordinates.lng, g.coordinates.lat])
      .addTo(m);
    geoMarkers.push({ minZoom: g.minZoom, maxZoom: g.maxZoom, el, marker });
  }
  const updateGeo = () => {
    const z = m.getZoom();
    for (const g of geoMarkers) g.el.hidden = z < g.minZoom || z > g.maxZoom;
  };
  m.on("zoom", updateGeo);
  updateGeo();

  function groupFor(id: string | null) {
    if (!id) return undefined;
    const place = opts.places.find((p) => p.id === id);
    if (place?.atResort) return markers.find((x) => x.group.places[0].kind === "resort");
    return markers.find((x) => x.group.places.some((p) => p.id === id));
  }

  function applyActive(reveal: boolean) {
    const hit = groupFor(activeId);
    for (const x of markers) {
      const on = x === hit;
      x.el.classList.toggle("is-active", on);
      x.el.setAttribute("aria-pressed", on ? "true" : "false");
    }
    if (!hit || !reveal || !map) return;
    const ll = hit.marker.getLngLat();
    const view = map.getBounds();
    // Only move the map when the selected place is out of view (e.g. Savannah airport).
    if (!view.contains(ll)) {
      const b = new LngLatBounds(view.getSouthWest(), view.getNorthEast()).extend(ll);
      map.fitBounds(b, {
        padding: fitPadding(opts.variant, container.clientWidth),
        animate: !opts.reducedMotion,
        duration: 700,
      });
    }
  }

  built = true;
  applyActive(false);
  return handle;
}
