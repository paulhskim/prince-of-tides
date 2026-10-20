import type { MapPlace } from "@/lib/maps/places";
import { approxDistanceLabel } from "@/lib/maps/places";

export type FallbackState = "static" | "waiting-click" | "failed";

/**
 * Typographic stand-in for the map. Rendered during SSR (so the box never shifts), while the
 * map loads, when the guest has not asked for it yet, and whenever WebGL, tiles or JS fail.
 */
export function EstateMapFallback({
  variant,
  places,
  state,
  onLoadClick,
}: {
  variant: "locator" | "guide";
  places: MapPlace[];
  state: FallbackState;
  onLoadClick?: () => void;
}) {
  const listed = places.filter((p) => p.kind !== "resort");
  return (
    <div className="absolute inset-0 flex flex-col overflow-auto bg-paper p-5 md:p-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-rule pb-3">
        <p className="font-serif text-h3">
          <span className="mr-2 inline-block size-2.5 bg-marsh align-middle" aria-hidden="true" />
          Hilton Head Resort
        </p>
        <p className="text-small text-ink-muted">663 William Hilton Parkway, mid-island</p>
      </div>

      {state === "failed" ? (
        <p className="mt-3 text-small text-ink-muted" role="status">
          The map could not load here. Distances below are measured from the resort.
        </p>
      ) : null}

      {state === "waiting-click" ? (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={onLoadClick}
            className="inline-flex h-11 items-center border border-ink px-5 text-small font-medium text-ink transition-colors duration-[var(--duration-fast)] hover:bg-ink hover:text-paper"
          >
            Show map
          </button>
          <span className="text-caption text-ink-muted">Loads map tiles from OpenFreeMap</span>
        </div>
      ) : null}

      <ol
        className={
          variant === "guide"
            ? "mt-4 gap-x-8 text-small md:columns-2 lg:columns-3"
            : "mt-4 text-small"
        }
      >
        {listed.map((p) => {
          const dist = approxDistanceLabel(p);
          return (
            <li
              key={p.id}
              className="flex break-inside-avoid items-baseline gap-3 border-b border-rule py-1.5 last:border-b-0"
            >
              {p.number ? (
                <span className="apparatus w-6 shrink-0 text-ink-muted tabular">{p.number}</span>
              ) : null}
              <span className="min-w-0 flex-1 text-ink">{variant === "guide" ? p.name : p.label}</span>
              {dist ? <span className="shrink-0 text-ink-muted tabular">{dist.replace(/^about /, "")}</span> : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-auto pt-4 text-caption text-ink-muted">Distances are approximate road miles.</p>
    </div>
  );
}
