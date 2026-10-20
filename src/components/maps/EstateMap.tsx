"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LocateFixed, Minus, Plus } from "lucide-react";

import {
  RESORT,
  appleMapsUrl,
  fitBoundsFor,
  getGuideCategories,
  getGuidePlaces,
  getLocatorPlaces,
  googleMapsUrl,
  type MapPlace,
} from "@/lib/maps/places";
import type { EngineHandle } from "./engine";
import { EstateMapFallback } from "./EstateMapFallback";

export const OPENFREEMAP_STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

export interface EstateMapProps {
  variant: "locator" | "guide";
  /** Defaults: locator set (src/lib/maps/places.ts) or every area guide place. */
  places?: MapPlace[];
  /** "resort" keeps the resort at the center of the initial view. */
  focus?: "resort";
  /** Controlled selection (place id from places.ts / guidePlaceId()). Pair with onSelect. */
  activeId?: string | null;
  onSelect?: (id: string | null) => void;
  /** Keep the old click-to-load behavior: no tile requests until the guest asks. */
  deferUntilClick?: boolean;
  className?: string;
  /** Short caption under the map. */
  caption?: string;
  /** Override the basemap style (OpenMapTiles schema). */
  styleUrl?: string;
}

type Status = "static" | "waiting-click" | "loading" | "ready" | "failed";

function hasWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

const ASPECT = {
  locator: "aspect-square md:aspect-[4/3]",
  guide: "aspect-[4/5] md:aspect-[16/10]",
} as const;

const controlBtn =
  "flex size-10 items-center justify-center bg-sheet text-ink transition-colors duration-[var(--duration-fast)] hover:bg-ink hover:text-paper focus-visible:outline-offset-[-2px]";

/**
 * The estate map. Static and quiet by default: no scroll zoom, two-finger pan on touch,
 * keyboard-accessible markers, and a typographic fallback that also renders on the server.
 */
export function EstateMap({
  variant,
  places: placesProp,
  focus,
  activeId,
  onSelect,
  deferUntilClick = false,
  className,
  caption,
  styleUrl = OPENFREEMAP_STYLE_URL,
}: EstateMapProps) {
  const places = useMemo<MapPlace[]>(() => {
    const base = placesProp ?? (variant === "locator" ? getLocatorPlaces() : getGuidePlaces());
    return base.some((p) => p.kind === "resort") ? base : [RESORT, ...base];
  }, [placesProp, variant]);

  const categories = useMemo(() => (variant === "guide" ? getGuideCategories() : []), [variant]);

  const [status, setStatus] = useState<Status>(deferUntilClick ? "waiting-click" : "static");
  const [category, setCategory] = useState<string | null>(null);
  const [innerActive, setInnerActive] = useState<string | null>(null);
  const controlled = activeId !== undefined;
  const effectiveActive = controlled ? activeId : innerActive;

  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<EngineHandle | null>(null);
  const startedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const activeRef = useRef(effectiveActive);
  const categoryRef = useRef(category);

  useEffect(() => {
    onSelectRef.current = onSelect;
    activeRef.current = effectiveActive;
    categoryRef.current = category;
  });

  const select = useCallback(
    (id: string | null) => {
      if (!controlled) setInnerActive(id);
      onSelectRef.current?.(id);
    },
    [controlled],
  );
  const selectRef = useRef(select);
  useEffect(() => {
    selectRef.current = select;
  }, [select]);

  const failedRef = useRef(false);
  const fail = useCallback(() => {
    failedRef.current = true;
    try {
      engineRef.current?.destroy();
    } catch {
      /* ignore */
    }
    engineRef.current = null;
    setStatus("failed");
  }, []);

  /** Calls into the engine never take the page down: any error drops to the fallback. */
  const safely = useCallback(
    (fn: (h: EngineHandle) => void) => {
      const h = engineRef.current;
      if (!h) return;
      try {
        fn(h);
      } catch {
        fail();
      }
    },
    [fail],
  );

  const start = useCallback(() => {
    if (startedRef.current || !mapRef.current) return;
    startedRef.current = true;
    if (!hasWebGL()) {
      setStatus("failed");
      return;
    }
    setStatus("loading");
    const container = mapRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
    import("./engine")
      .then(({ mountEstateMap }) =>
        mountEstateMap(container, {
          styleUrl,
          variant,
          places,
          bounds: fitBoundsFor(places, { centerOnResort: focus === "resort" }),
          reducedMotion,
          coarsePointer,
          onSelect: (id) => selectRef.current(id),
          onReady: () => setStatus("ready"),
          onFail: () => fail(),
        }),
      )
      .then((handle) => {
        if (failedRef.current) {
          handle.destroy();
          return;
        }
        engineRef.current = handle;
        handle.setCategory(categoryRef.current);
        handle.setActive(activeRef.current ?? null);
      })
      .catch(() => fail());
  }, [fail, focus, places, styleUrl, variant]);

  // Initialize only once the map is close to the viewport.
  useEffect(() => {
    if (deferUntilClick) return;
    const el = boxRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      start();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [deferUntilClick, start]);

  useEffect(() => () => engineRef.current?.destroy(), []);

  useEffect(() => {
    safely((h) => h.setActive(effectiveActive ?? null));
  }, [effectiveActive, status, safely]);

  useEffect(() => {
    safely((h) => h.setCategory(category));
  }, [category, safely]);

  const fallbackPlaces = useMemo(
    () => (category ? places.filter((p) => p.categoryId === category) : places),
    [category, places],
  );

  const ready = status === "ready";

  return (
    <figure className={className}>
      {variant === "guide" && categories.length > 0 ? (
        <div
          role="group"
          aria-label="Show places on the map by category"
          className="mb-3 flex flex-wrap gap-x-5 gap-y-1"
        >
          {[{ id: null as string | null, title: "All" }, ...categories].map((c) => {
            const pressed = category === c.id;
            return (
              <button
                key={c.id ?? "all"}
                type="button"
                aria-pressed={pressed}
                onClick={() => setCategory(pressed && c.id ? null : c.id)}
                className="min-h-11 text-small text-ink-muted underline-offset-[0.4em] transition-colors duration-[var(--duration-fast)] hover:text-ink aria-pressed:text-ink aria-pressed:underline aria-pressed:decoration-marsh"
              >
                {c.title}
              </button>
            );
          })}
        </div>
      ) : null}

      <div ref={boxRef} className={`relative overflow-hidden border border-rule bg-paper ${ASPECT[variant]}`}>
        <div
          ref={mapRef}
          inert={!ready}
          aria-hidden={!ready}
          className={`em-canvas absolute inset-0 transition-opacity duration-[var(--duration-slow)] motion-reduce:transition-none ${
            ready ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        {!ready ? (
          <EstateMapFallback
            variant={variant}
            places={fallbackPlaces}
            state={status === "failed" ? "failed" : status === "waiting-click" ? "waiting-click" : "static"}
            onLoadClick={() => {
              setStatus("static");
              start();
            }}
          />
        ) : null}

        {ready ? (
          <>
            <div className="absolute top-3 right-3 z-10 flex flex-col border border-rule-strong bg-sheet">
              <button type="button" aria-label="Zoom in" className={controlBtn} onClick={() => safely((h) => h.zoomBy(1))}>
                <Plus aria-hidden="true" size={18} strokeWidth={1.25} />
              </button>
              <button
                type="button"
                aria-label="Zoom out"
                className={`${controlBtn} border-t border-rule`}
                onClick={() => safely((h) => h.zoomBy(-1))}
              >
                <Minus aria-hidden="true" size={18} strokeWidth={1.25} />
              </button>
              <button
                type="button"
                aria-label="Reset map view"
                className={`${controlBtn} border-t border-rule`}
                onClick={() => safely((h) => h.reset())}
              >
                <LocateFixed aria-hidden="true" size={18} strokeWidth={1.25} />
              </button>
            </div>
            <p className="absolute right-0 bottom-0 z-10 bg-paper/85 px-1.5 py-0.5 text-[0.625rem] leading-tight text-ink-muted">
              <a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">
                OpenFreeMap
              </a>{" "}
              <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener noreferrer">
                &copy; OpenMapTiles
              </a>{" "}
              <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">
                &copy; OpenStreetMap contributors
              </a>
            </p>
          </>
        ) : null}
      </div>

      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-caption text-ink-muted">
        <span>{caption ?? "Hilton Head Resort, mid-island. Distances are approximate."}</span>
        <span className="flex gap-x-4">
          <a href={appleMapsUrl()} target="_blank" rel="noopener noreferrer">
            Open in Apple Maps
          </a>
          <a href={googleMapsUrl()} target="_blank" rel="noopener noreferrer">
            Open in Google Maps
          </a>
        </span>
      </figcaption>
    </figure>
  );
}

export default EstateMap;
