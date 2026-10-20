"use client";

import { useState } from "react";
import { EstateMap } from "@/components/maps/EstateMap";
import { getGuidePlaces } from "@/lib/maps/places";

export function MapDemo() {
  const [active, setActive] = useState<string | null>(null);
  const places = getGuidePlaces();
  return (
    <main className="mx-auto max-w-page px-gutter py-section">
      <p className="apparatus text-ink-muted">Internal test page</p>
      <h1 className="mt-2 text-h2">Estate map</h1>

      <section className="mt-12 grid gap-col md:grid-cols-12">
        <div className="md:col-span-4">
          <h2 className="text-h3">Locator</h2>
          <p className="mt-2 text-small text-ink-muted">Home page location section. focus=&quot;resort&quot;.</p>
        </div>
        <div className="md:col-span-8">
          <EstateMap variant="locator" focus="resort" caption="Hilton Head Resort, mid-island" />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-h3">Guide</h2>
        <p className="mt-2 text-small text-ink-muted">
          /area. Selected: <span className="tabular">{active ?? "none"}</span>
        </p>
        <div className="mt-6 grid gap-col md:grid-cols-12">
          <div className="md:col-span-8">
            <EstateMap variant="guide" activeId={active} onSelect={setActive} caption="Area guide places" />
          </div>
          <ol className="text-small md:col-span-4">
            {places.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={active === p.id}
                  onClick={() => setActive(active === p.id ? null : p.id)}
                  className="flex w-full gap-3 border-b border-rule py-1.5 text-left hover:text-ink aria-pressed:bg-marsh-soft"
                >
                  <span className="apparatus w-6 text-ink-muted">{p.number}</span>
                  <span>{p.name}</span>
                  {!p.coordinates && !p.atResort ? <span className="ml-auto text-ink-faint">no pin</span> : null}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-h3">Locator, click to load</h2>
        <div className="mt-6 max-w-xl">
          <EstateMap variant="locator" deferUntilClick />
        </div>
      </section>
    </main>
  );
}
