"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type LightboxFrame = { src: string; alt: string; caption: string; n: number };

const FOCUSABLE = 'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

export function Lightbox({
  frames,
  index,
  onIndex,
  onClose,
}: {
  frames: LightboxFrame[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const [shown, setShown] = useState(index);
  const count = frames.length;
  const current = frames[index];

  const go = (delta: number) => onIndex((index + delta + count) % count);

  // Crossfade: keep the outgoing frame for 220ms.
  useEffect(() => {
    const t = setTimeout(() => setShown(index), 220);
    return () => clearTimeout(t);
  }, [index]);

  // Modal behaviour: focus in, trap, Esc, scroll lock, background inert.
  useEffect(() => {
    closeBtn.current?.focus();
    // The dialog is portalled to <body>, so everything else on the page can be made inert.
    const outside = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.contains(dialog.current),
    );
    document.body.style.overflow = "hidden";
    outside.forEach((el) => el.setAttribute("inert", ""));
    return () => {
      document.body.style.overflow = "";
      outside.forEach((el) => el.removeAttribute("inert"));
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onIndex((index + 1) % count);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onIndex((index - 1 + count) % count);
      } else if (e.key === "Home") {
        e.preventDefault();
        onIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        onIndex(count - 1);
      } else if (e.key === "Tab" && dialog.current) {
        const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE));
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, count, onClose, onIndex]);

  const prev = frames[(index - 1 + count) % count];
  const next = frames[(index + 1) % count];
  const outgoing = shown !== index ? frames[shown] : null;

  return createPortal(
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="Photographs"
      data-surface="dark"
      className="fixed inset-0 z-[80] flex flex-col bg-pluff text-on-dark"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      <div className="flex h-16 shrink-0 items-center justify-end px-gutter">
        <button
          ref={closeBtn}
          type="button"
          onClick={onClose}
          className="-mr-2 inline-flex min-h-11 items-center gap-2 px-2 text-small font-medium"
        >
          Close
          <X aria-hidden="true" size={20} strokeWidth={1.25} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1">
        {outgoing ? (
          <div key={`out-${outgoing.n}`} className="absolute inset-0 mx-auto max-h-[92vh] max-w-[92vw] animate-[cover-in_220ms_ease-out_reverse_both]">
            <Image src={outgoing.src} alt="" fill sizes="92vw" className="object-contain" />
          </div>
        ) : null}
        <div key={current.n} className="absolute inset-0 mx-auto max-h-[92vh] max-w-[92vw] animate-[cover-in_220ms_ease-out_both]">
          <Image src={current.src} alt={current.alt} fill sizes="92vw" quality={80} className="object-contain" />
        </div>
        {/* Preload neighbours only */}
        {count > 1 ? (
          <div aria-hidden="true" className="hidden">
            <Image src={prev.src} alt="" width={16} height={16} sizes="92vw" />
            <Image src={next.src} alt="" width={16} height={16} sizes="92vw" />
          </div>
        ) : null}

        {count > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photograph"
              className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-pluff/70 md:left-4"
            >
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.25} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photograph"
              className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center bg-pluff/70 md:right-4"
            >
              <ChevronRight aria-hidden="true" size={20} strokeWidth={1.25} />
            </button>
          </>
        ) : null}
      </div>

      <div className="flex shrink-0 items-start justify-between gap-6 px-gutter py-4 text-small text-on-dark-muted">
        <p aria-live="polite">{current.caption}</p>
        <p className="shrink-0 text-center tabular">
          {index + 1} of {count}
        </p>
      </div>
    </div>,
    document.body,
  );
}
