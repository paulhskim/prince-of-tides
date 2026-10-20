"use client";

/**
 * Modal built on the native <dialog> element with showModal(): the browser makes the background inert,
 * keeps focus inside, and closes on Escape. We add: focus to the heading on open, focus returned to the
 * trigger on close, body scroll lock, and two presentations (bottom sheet, centered dialog).
 */
import { useEffect, useId, useRef } from "react";
import { X } from "./icons";

export function Dialog({
  open,
  onClose,
  title,
  variant = "dialog",
  children,
  footer,
  returnFocusTo,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  variant?: "dialog" | "sheet";
  children: React.ReactNode;
  footer?: React.ReactNode;
  returnFocusTo?: React.RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
      document.documentElement.style.overflow = "hidden";
      headingRef.current?.focus();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleClose = () => {
      document.documentElement.style.overflow = "";
      onClose();
      returnFocusTo?.current?.focus();
    };
    el.addEventListener("close", handleClose);
    return () => el.removeEventListener("close", handleClose);
  }, [onClose, returnFocusTo]);

  // Unmounting while open (e.g. router.push from the sheet's primary action) fires no "close" event:
  // release the scroll lock so the next page can scroll.
  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  const sheet = variant === "sheet";
  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(e) => {
        // Click on the backdrop (the dialog element itself, outside the panel) closes.
        if (e.target === ref.current) ref.current?.close();
      }}
      className={
        sheet
          ? "fixed inset-x-0 top-auto bottom-0 m-0 h-[calc(100dvh-24px)] max-h-none w-full max-w-none border-t border-rule-strong bg-sheet p-0 text-ink shadow-overlay backdrop:bg-pluff/40 open:flex open:flex-col"
          : "m-auto max-h-[85dvh] w-[min(40rem,calc(100vw-2rem))] bg-sheet p-0 text-ink shadow-overlay backdrop:bg-pluff/40 open:flex open:flex-col"
      }
    >
      {sheet && <div aria-hidden="true" className="mx-auto mt-2 h-[3px] w-8 bg-rule-strong" />}
      <div className="flex items-center justify-between gap-4 border-b border-rule px-5 py-3 sm:px-6">
        <h2 ref={headingRef} id={titleId} tabIndex={-1} className="font-serif text-[1.5rem] font-light tracking-[-0.015em] focus:outline-none">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          className="smallcaps -mr-2 inline-flex min-h-11 items-center gap-1.5 px-2 text-ink underline decoration-rule-strong underline-offset-[0.6em] hover:decoration-ink"
        >
          <X size={16} />
          Close
        </button>
      </div>
      {/* Content mounts only while open, so closed sheets add no hidden calendars to the page. */}
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">{open && children}</div>
      {open && footer && <div className="border-t border-rule px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">{footer}</div>}
    </dialog>
  );
}
