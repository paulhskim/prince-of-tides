"use client";

import { useState } from "react";

const QUERY = "Hilton Head Resort, Hilton Head Island, SC";

/**
 * Click-to-load map. No third-party request until the guest asks for it, and no empty frame
 * reserved for it either: until then it is one quiet line with a button.
 */
export function MapFacade({ caption }: { caption: string }) {
  const [loaded, setLoaded] = useState(false);
  if (!loaded) {
    return (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <button
          type="button"
          onClick={() => setLoaded(true)}
          className="btn btn-secondary min-h-11 px-5"
        >
          Show map
        </button>
        <span className="font-serif text-small italic text-ink-muted">Loads Google Maps</span>
      </div>
    );
  }
  return (
    <figure>
      <div className="photo-placeholder aspect-[4/3]">
        <iframe
          title={`Map: ${caption}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(QUERY)}&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 size-full border-0 grayscale-100 contrast-95"
        />
      </div>
      <figcaption className="mt-2 text-caption text-ink-muted">{caption}</figcaption>
    </figure>
  );
}
