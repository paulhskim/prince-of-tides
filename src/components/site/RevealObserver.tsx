"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Marks [data-reveal] elements as shown once they enter the viewport (see globals.css). Anything
 * already on screen (or above it) when a page mounts is shown at once, so nothing waits on script.
 * Under reduced motion the CSS never hides anything, and this only sets attributes.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])"));
    if (!("IntersectionObserver" in window)) {
      pending.forEach((el) => el.setAttribute("data-shown", ""));
      return;
    }
    const vh = window.innerHeight;
    const later: HTMLElement[] = [];
    for (const el of pending) {
      const r = el.getBoundingClientRect();
      // On screen, or already scrolled past (an anchor jump): show at once.
      if (r.top < vh) el.setAttribute("data-shown", "");
      else later.push(el);
    }
    root.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.setAttribute("data-shown", "");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    later.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
