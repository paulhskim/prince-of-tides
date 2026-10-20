"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { footer, hero } from "@/content/copy";
import { NAV } from "./nav";
import { Wordmark } from "./Monogram";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Masthead() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Current home section marker: residence covers I to III, resort covers IV and V.
  useEffect(() => {
    if (!isHome) {
      setSection(null);
      return;
    }
    const map: Record<string, string> = {
      residence: "residence",
      "the-space": "residence",
      amenities: "residence",
      resort: "resort",
      beach: "resort",
    };
    const ids = ["residence", "the-space", "amenities", "resort", "beach", "location", "reviews", "arrival", "reserve"];
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setSection(map[visible[0].target.id] ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  const close = useCallback(() => {
    setOpen(false);
    menuButton.current?.focus();
  }, []);

  // Drawer: lock scroll, make the page inert, trap focus, close on Esc.
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main");
    const footer = document.querySelector("footer");
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");
    const first = drawer.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !drawer.current) return;
      const items = Array.from(drawer.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isCurrent = (href: string, sec?: string) =>
    sec ? isHome && section === sec : pathname === href || pathname.startsWith(`${href}/`);

  const cta = isHome ? "#reserve" : "/book";

  // On the home page the masthead sits on the night cover until the page moves.
  const onNight = isHome && !scrolled && !open;

  return (
    <header
      data-surface={onNight ? "dark" : undefined}
      className={`sticky top-0 z-50 transition-[background-color,color,border-color] duration-500 ease-quiet ${
        onNight ? "border-b border-transparent bg-pluff text-on-dark" : scrolled ? "border-b border-rule bg-paper text-ink" : "border-b border-transparent bg-paper text-ink"
      }`}
    >
      <div
        className={`mx-auto flex max-w-page items-center justify-between gap-6 px-gutter transition-[height] duration-300 ease-quiet ${
          scrolled ? "h-16" : "h-20 lg:h-[88px]"
        }`}
      >
        <Wordmark onNight={onNight} />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {NAV.map((item) => {
              const current = isCurrent(item.href, item.section);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? (item.section ? "location" : "page") : undefined}
                    className={`smallcaps inline-flex min-h-11 items-center no-underline decoration-1 underline-offset-[9px] transition-[text-decoration-color] duration-200 hover:underline ${
                      onNight ? "decoration-brass-light" : "decoration-brass"
                    } ${current ? "underline" : ""}`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {pathname?.startsWith("/book") ? null : (
            <a href={cta} className={`btn hidden min-h-10 px-5 sm:inline-flex ${onNight ? "btn-on-dark" : "btn-secondary"}`}>
              {hero.primaryCta.label}
            </a>
          )}
          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => setOpen(true)}
            className="smallcaps -mr-2 inline-flex min-h-11 items-center gap-2.5 px-2 lg:hidden"
          >
            Menu
            <Menu aria-hidden="true" size={18} strokeWidth={1} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        id="site-drawer"
        ref={drawer}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper text-ink lg:hidden"
      >
        <div className="flex h-20 shrink-0 items-center justify-between px-gutter">
          <Wordmark onClick={() => setOpen(false)} />
          <button type="button" onClick={close} className="smallcaps -mr-2 inline-flex min-h-11 items-center gap-2.5 px-2">
            Close
            <X aria-hidden="true" size={18} strokeWidth={1} />
          </button>
        </div>
        <nav aria-label="Main" className="px-gutter">
          <ul className="border-t border-ink">
            {NAV.map((item) => (
              <li key={item.href} className="border-b border-rule">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-16 items-center py-3 font-serif text-[1.75rem] font-light leading-tight tracking-[-0.015em] no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={cta === "#reserve" ? "/#reserve" : cta}
            onClick={() => setOpen(false)}
            className="btn btn-primary mt-10 h-14 w-full"
          >
            {hero.primaryCta.label}
          </a>
        </nav>
        <p className="mt-auto px-gutter pb-8 pt-12 text-caption text-ink-muted">
          {hero.eyebrow}
          <br />
          {footer.smallPrint[1]}
        </p>
      </div>
    </header>
  );
}
