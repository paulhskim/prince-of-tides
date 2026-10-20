/**
 * Runtime restyle of an OpenMapTiles-schema style (OpenFreeMap "positron" or "liberty") into the
 * Prince of Tides palette: a printed estate map, not a navigation app.
 *
 * Pure functions only (no DOM, no maplibre import) so they can be unit tested in Node.
 * Layers are matched by `source-layer` and type rather than by id, so the rewrite survives
 * upstream renames of layer ids.
 */

/* ------------------------------------------------------------------ palette */

/** Token values from src/styles/tokens.css. Overridden at runtime by the live CSS variables. */
export const TOKEN_DEFAULTS = {
  paper: "#ecece5",
  sheet: "#f6f6f1",
  stone: "#dfe0d6",
  ink: "#22241f",
  inkMuted: "#585b52",
  inkFaint: "#73766c",
  marsh: "#475638",
  marshSoft: "#dce0d0",
  rule: "#c6c8bc",
  ruleStrong: "#7d8075",
} as const;

export type Tokens = { -readonly [K in keyof typeof TOKEN_DEFAULTS]: string };

/** The CSS custom property behind each token. */
export const TOKEN_VARS: Record<keyof Tokens, string> = {
  paper: "--color-paper",
  sheet: "--color-sheet",
  stone: "--color-stone",
  ink: "--color-ink",
  inkMuted: "--color-ink-muted",
  inkFaint: "--color-ink-faint",
  marsh: "--color-marsh",
  marshSoft: "--color-marsh-soft",
  rule: "--color-rule",
  ruleStrong: "--color-rule-strong",
};

export interface MapPalette {
  land: string;
  water: string;
  waterLine: string;
  wetland: string;
  park: string;
  wood: string;
  sand: string;
  aeroway: string;
  roadMajor: string;
  roadMinor: string;
  roadPath: string;
  label: string;
  roadLabel: string;
  halo: string;
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function isHexColor(v: unknown): v is string {
  return typeof v === "string" && HEX.test(v.trim());
}

function toRgb(hex: string): [number, number, number] {
  let h = hex.trim().slice(1);
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Mix `b` into `a` by `t` (0..1). Both must be hex. Returns lowercase #rrggbb. */
export function mix(a: string, b: string, t: number): string {
  const A = toRgb(a);
  const B = toRgb(b);
  return (
    "#" +
    A.map((v, i) => Math.round(v + (B[i] - v) * t))
      .map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0"))
      .join("")
  );
}

/** A quiet, desaturated grey-blue that reads as water against mineral paper. */
const WATER_HUE = "#6f8c97";

export function derivePalette(input: Partial<Tokens> = {}): MapPalette {
  const t: Tokens = { ...TOKEN_DEFAULTS };
  for (const k of Object.keys(TOKEN_DEFAULTS) as (keyof Tokens)[]) {
    const v = input[k];
    if (isHexColor(v)) t[k] = v.trim();
  }
  return {
    land: t.paper,
    water: mix(t.paper, WATER_HUE, 0.32),
    waterLine: mix(t.paper, WATER_HUE, 0.45),
    // The salt marsh is the point of this place: a soft marsh tint, a touch stronger than parks.
    wetland: mix(t.paper, t.marsh, 0.16),
    park: mix(t.paper, t.marsh, 0.08),
    wood: mix(t.paper, t.marsh, 0.11),
    sand: mix(t.paper, "#c8b98e", 0.18),
    aeroway: t.stone,
    roadMajor: mix(t.rule, t.ruleStrong, 0.25),
    roadMinor: t.rule,
    roadPath: mix(t.paper, t.rule, 0.6),
    label: t.inkMuted,
    roadLabel: t.inkFaint,
    halo: t.paper,
  };
}

/* ------------------------------------------------------------------ style types (loose) */

export type Json = string | number | boolean | null | Json[] | { [k: string]: Json };

export interface StyleLayerLike {
  id: string;
  type: string;
  source?: string;
  "source-layer"?: string;
  filter?: Json;
  layout?: Record<string, Json>;
  paint?: Record<string, Json>;
  minzoom?: number;
  maxzoom?: number;
  [k: string]: unknown;
}

export interface StyleLike {
  version: number;
  sources: Record<string, { type: string; attribution?: string; [k: string]: unknown }>;
  layers: StyleLayerLike[];
  glyphs?: string;
  sprite?: unknown;
  [k: string]: unknown;
}

export const REQUIRED_ATTRIBUTION =
  '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> ' +
  '<a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">&copy; OpenMapTiles</a> ' +
  'Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';

/* ------------------------------------------------------------------ rewrite */

export const WETLAND_LAYER_ID = "pot-wetland";

const HIDE = { visibility: "none" } as const;

/** Thin, zoom-scaled hairline widths (px). */
const W_MAJOR: Json = ["interpolate", ["exponential", 1.5], ["zoom"], 9, 0.4, 12, 0.9, 15, 2.2, 18, 6];
const W_MINOR: Json = ["interpolate", ["exponential", 1.5], ["zoom"], 12, 0.25, 15, 0.9, 18, 3];
const W_PATH: Json = ["interpolate", ["linear"], ["zoom"], 14, 0.4, 18, 1];

const MAJOR = ["motorway", "trunk", "primary", "secondary"];
const MINOR = ["tertiary", "minor", "service", "street", "residential", "unclassified"];

function hidden(layer: StyleLayerLike): StyleLayerLike {
  return { ...layer, layout: { ...(layer.layout ?? {}), ...HIDE } };
}

function shown(layer: StyleLayerLike): Record<string, Json> {
  const layout = { ...(layer.layout ?? {}) };
  delete layout.visibility;
  return layout;
}

/**
 * Rewrites one layer. Returns the restyled layer (possibly hidden). Never adds new layers,
 * so ids, sources and filters stay exactly as upstream wrote them.
 */
export function restyleLayer(layer: StyleLayerLike, p: MapPalette): StyleLayerLike {
  const sl = layer["source-layer"];
  const id = layer.id.toLowerCase();

  switch (layer.type) {
    case "background":
      return { ...layer, paint: { "background-color": p.land } };
    case "fill-extrusion":
    case "hillshade":
    case "raster":
    case "heatmap":
    case "circle":
      return hidden(layer);
  }

  if (layer.type === "symbol") {
    // Keep only small road name labels. Everything else (POIs, shields, place and water names,
    // house numbers, airports, peaks) is hidden; the component draws its own labels in site type.
    if (sl === "transportation_name" && !layer.layout?.["icon-image"] && !id.includes("shield")) {
      return {
        ...layer,
        layout: {
          ...shown(layer),
          "text-size": ["interpolate", ["linear"], ["zoom"], 13, 9, 16, 11],
          "text-letter-spacing": 0.02,
          "text-max-angle": 30,
        },
        paint: {
          "text-color": p.roadLabel,
          "text-halo-color": p.halo,
          "text-halo-width": 1.2,
          "text-halo-blur": 0.5,
        },
        minzoom: Math.max(layer.minzoom ?? 0, 13.5),
      };
    }
    return hidden(layer);
  }

  switch (sl) {
    case "water":
      if (layer.type === "fill") {
        return { ...layer, layout: shown(layer), paint: { "fill-color": p.water, "fill-antialias": true } };
      }
      return hidden(layer);
    case "waterway":
      if (layer.type === "line") {
        return {
          ...layer,
          layout: shown(layer),
          paint: {
            "line-color": p.waterLine,
            "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.3, 16, 1.4],
          },
        };
      }
      return hidden(layer);
    case "landcover":
      if (layer.type === "fill") {
        return {
          ...layer,
          layout: shown(layer),
          paint: {
            "fill-color": [
              "match",
              ["get", "class"],
              "wetland",
              p.wetland,
              ["wood", "forest"],
              p.wood,
              ["grass", "farmland"],
              p.park,
              "sand",
              p.sand,
              p.land,
            ],
            "fill-opacity": ["match", ["get", "class"], ["wetland", "wood", "forest", "grass", "farmland", "sand"], 1, 0],
            "fill-antialias": false,
          },
        };
      }
      return hidden(layer);
    case "park":
      if (layer.type === "fill") {
        return { ...layer, layout: shown(layer), paint: { "fill-color": p.park, "fill-antialias": false } };
      }
      return hidden(layer);
    case "landuse":
      // Residential and commercial tints are clutter on an estate map.
      return hidden(layer);
    case "aeroway":
      if (layer.type === "fill") return { ...layer, layout: shown(layer), paint: { "fill-color": p.aeroway } };
      if (layer.type === "line") {
        return {
          ...layer,
          layout: shown(layer),
          paint: { "line-color": p.aeroway, "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1, 16, 12] },
        };
      }
      return hidden(layer);
    case "transportation": {
      if (layer.type !== "line") return hidden(layer);
      // No casings, rail, ferries, bridges' outlines or tunnels: just single hairline rules.
      if (/casing|outline|rail|ferry|tunnel|transit|cable|aerialway|pier/.test(id)) return hidden(layer);
      const isPath = /path|track|footway|cycle|bridleway|steps/.test(id);
      const isMajor = !isPath && /motorway|trunk|primary|secondary|major/.test(id);
      return {
        ...layer,
        layout: { ...shown(layer), "line-cap": "round", "line-join": "round" },
        paint: isPath
          ? { "line-color": p.roadPath, "line-width": W_PATH, "line-dasharray": [2, 2] }
          : {
              "line-color": [
                "match",
                ["get", "class"],
                MAJOR,
                p.roadMajor,
                MINOR,
                p.roadMinor,
                p.roadPath,
              ],
              "line-width": isMajor ? W_MAJOR : W_MINOR,
            },
      };
    }
    case "building":
    case "boundary":
    case "housenumber":
    case "poi":
    case "mountain_peak":
    case "aerodrome_label":
    case "place":
    case "water_name":
      return hidden(layer);
  }

  // Unknown source-layer: keep the map quiet rather than risk an off-palette layer.
  return hidden(layer);
}

/**
 * Restyle a whole style document. Returns a new object (input is not mutated) and guarantees
 * the attribution required by OpenFreeMap / OpenMapTiles / OpenStreetMap on every vector source.
 */
export function restyle(style: StyleLike, palette: MapPalette = derivePalette()): StyleLike {
  const sources: StyleLike["sources"] = {};
  for (const [key, src] of Object.entries(style.sources ?? {})) {
    sources[key] = src.type === "vector" ? { ...src, attribution: REQUIRED_ATTRIBUTION } : { ...src };
  }
  const layers = (style.layers ?? []).map((l) => restyleLayer(l, palette));

  // Positron has no wetland layer, and the salt marsh is the defining landscape here, so we
  // add one (below water) on the same vector source the water layer uses.
  const waterIdx = layers.findIndex((l) => l["source-layer"] === "water" && l.type === "fill");
  if (waterIdx >= 0 && !layers.some((l) => l.id === WETLAND_LAYER_ID)) {
    layers.splice(waterIdx, 0, {
      id: WETLAND_LAYER_ID,
      type: "fill",
      source: layers[waterIdx].source,
      "source-layer": "landcover",
      filter: ["==", ["get", "class"], "wetland"],
      paint: { "fill-color": palette.wetland, "fill-antialias": false },
    });
  }

  const out: StyleLike = {
    ...style,
    sources,
    // Flat, north-up: print, not a flyover.
    pitch: 0,
    bearing: 0,
    layers,
  };
  delete out.terrain;
  delete out.sky;
  return out;
}

/** True when every color-valued paint property of a visible layer is a hex string or an expression. */
export function paintColorsValid(style: StyleLike): boolean {
  for (const l of style.layers) {
    if (l.layout?.visibility === "none") continue;
    for (const [k, v] of Object.entries(l.paint ?? {})) {
      if (!k.endsWith("-color")) continue;
      if (Array.isArray(v)) continue;
      if (!isHexColor(v)) return false;
    }
  }
  return true;
}
