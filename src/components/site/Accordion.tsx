"use client";

import { useEffect, useId, useState } from "react";
import { Minus, Plus } from "lucide-react";

export type AccordionItem = { id: string; question: string; answer: string };

/** Accessible disclosure list (button + region). Multiple items may be open; deep-linkable by id. */
export function Accordion({ items, headingLevel = 3 }: { items: AccordionItem[]; headingLevel?: 2 | 3 }) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const uid = useId();

  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && items.some((i) => i.id === id)) {
        setOpen((prev) => new Set(prev).add(id));
        document.getElementById(id)?.scrollIntoView();
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [items]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const H = headingLevel === 2 ? "h2" : "h3";

  return (
    <div className="border-b border-rule">
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const panelId = `${uid}-${item.id}-panel`;
        return (
          <div key={item.id} id={item.id} className="border-t border-rule">
            <H className="font-serif">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex min-h-14 w-full items-center justify-between gap-6 py-3 text-left text-[1.25rem] leading-snug"
              >
                <span>{item.question}</span>
                {isOpen ? (
                  <Minus aria-hidden="true" size={18} strokeWidth={1.25} className="shrink-0" />
                ) : (
                  <Plus aria-hidden="true" size={18} strokeWidth={1.25} className="shrink-0" />
                )}
              </button>
            </H>
            <div
              id={panelId}
              role="region"
              aria-label={item.question}
              className={`grid transition-[grid-template-rows] duration-200 ease-quiet ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="max-w-measure pb-6 text-body">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
