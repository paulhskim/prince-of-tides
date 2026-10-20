"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { footer, hero } from "@/content/copy";
import { MORE, NAV, RESERVE, SECTION_OWNER } from "./nav";
import { Wordmark } from "./Monogram";
import { roman } from "./text";

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The masthead. A slim utility line (place, terms of arrival, secondary pages) that folds away on
 * scroll; then the wordmark, five plain section links in the order a guest asks, and Reserve as a
 * separate action. On the home page the link for the section on screen carries a brass rule.
 */
export function Masthead() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const onReserve = pathname?.startsWith("/reserve") || pathname?.startsWith("/book");
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

  // The current section: whichever home section crosses the middle band of the viewport.
  useEffect(() => {
    if (!isHome) {
      setSection(null);
      return;
    }
    const owner = new Map(SECTION_OWNER);
    const els = SECTION_OWNER.map(([id]) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setSection(owner.get(visible[0].target.id) ?? null);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    const onTop = () => {
      if (window.scrollY < 200) setSection(null);
    };
    window.addEventListener("scroll", onTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onTop);
    };
  }, [isHome]);

  const close = useCallback(() => {
    setOpen(false);
    menuButton.current?.focus();
  }, []);

  // Drawer: lock scroll, make the page inert, trap focus, close on Esc.
  useEffect(() => {
    if (!open) return;
    const main = document.getElementById("main");
    const foot = document.querySelector("footer");
    document.body.style.overflow = "hidden";
    main?.setAttribute("inert", "");
    foot?.setAttribute("inert", "");
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
      foot?.removeAttribute("inert");
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  // Close the drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const pageCurrent = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // On the home page the masthead sits on the night cover until the page moves.
  const onNight = isHome && !scrolled && !open;
  const muted = onNight ? "text-on-dark-muted" : "text-ink-muted";

  return (
    <header
      data-surface={onNight ? "dark" : undefined}
      className={`sticky top-0 z-50 transition-[background-color,color,border-color] duration-500 ease-quiet ${
        onNight ? "border-b border-transparent bg-pluff text-on-dark" : scrolled ? "border-b border-rule bg-paper text-ink" : "border-b border-transparent bg-paper text-ink"
      }`}
    >
      {/* Utility line: desktop only, folds away once the page moves. */}
      <div
        className={`hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-quiet lg:block ${
          scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
        }`}
        aria-hidden={scrolled ? true : undefined}
        inert={scrolled ? true : undefined}
      >
        <div className={`mx-auto flex max-w-page items-center justify-between gap-6 border-b px-gutter py-2 ${onNight ? "border-on-dark/15" : "border-rule"}`}>
          <p className={`smallcaps ${muted}`}>
            {hero.eyebrow}
            <span aria-hidden="true" className="mx-3 opacity-60">
              &#183;
            </span>
            Reservations by request
            <span aria-hidden="true" className="mx-3 opacity-60">
              &#183;
            </span>
            Check-in 4 PM, check-out 10 AM
          </p>
          <nav aria-label="More">
            <ul className="flex items-center gap-6">
              {MORE.slice(0, 3).map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    aria-current={pageCurrent(m.href) ? "page" : undefined}
                    className={`smallcaps inline-flex min-h-6 items-center no-underline hover:underline aria-[current=page]:underline ${muted} ${
                      onNight ? "decoration-brass-light" : "decoration-brass"
                    } underline-offset-[6px] hover:text-current aria-[current=page]:text-current`}
                  >
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div
        className={`mx-auto flex max-w-page items-center justify-between gap-6 px-gutter transition-[height] duration-300 ease-quiet ${
          scrolled ? "h-16" : "h-20 lg:h-[84px]"
        }`}
      >
        <Wordmark onNight={onNight} />

        <nav aria-label="Main" className="hidden lg:block">
          <ol className="flex items-center gap-[clamp(1.25rem,-1rem+2.6vw,2.5rem)]">
            {NAV.map((item, i) => {
              const current = isHome && section === item.section;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "location" : undefined}
                    className="group inline-flex min-h-11 items-center no-underline"
                  >
                    <span className="inline-flex items-baseline gap-[0.45rem]">
                      <span aria-hidden="true" className={`font-serif text-[0.8125rem] italic leading-none ${onNight ? "text-brass-light" : "text-brass"}`}>
                        {roman(i + 1)}
                      </span>
                      <span
                        className={`smallcaps decoration-1 underline-offset-[9px] transition-[text-decoration-color] duration-200 group-hover:underline ${
                          onNight ? "decoration-brass-light" : "decoration-brass"
                        } ${current ? "underline" : ""}`}
                      >
                        {item.label}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="flex items-center gap-2">
          {onReserve ? null : (
            <Link
              href={RESERVE.href}
              className={`btn hidden min-h-10 px-6 sm:inline-flex ${onNight ? "btn-on-dark" : "btn-secondary"}`}
            >
              {RESERVE.label}
            </Link>
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

      {/* Mobile menu: the same five items, numbered and glossed, then Reserve, then the other pages. */}
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
          <ol className="border-t border-ink">
            {NAV.map((item, i) => (
              <li key={item.href} className="border-b border-rule">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="grid min-h-[4.25rem] grid-cols-[2.25rem_1fr] items-baseline py-3 no-underline"
                >
                  <span aria-hidden="true" className="font-serif text-body italic text-brass">
                    {roman(i + 1)}
                  </span>
                  <span>
                    <span className="block font-serif text-[1.625rem] font-light leading-tight tracking-[-0.015em]">{item.label}</span>
                    {item.gloss ? <span className="mt-0.5 block text-small text-ink-muted">{item.gloss}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          {onReserve ? null : (
            <Link href={RESERVE.href} onClick={() => setOpen(false)} className="btn btn-primary mt-8 h-14 w-full">
              {RESERVE.label}
            </Link>
          )}
          <p className="mt-3 text-caption text-ink-muted">Reservations by request. Nothing is charged until your host confirms.</p>
        </nav>
        <nav aria-label="More" className="mt-10 px-gutter">
          <ul className="grid grid-cols-2 gap-x-col border-t border-rule pt-2">
            {MORE.map((m) => (
              <li key={m.href}>
                <Link
                  href={m.href}
                  onClick={() => setOpen(false)}
                  aria-current={pageCurrent(m.href) ? "page" : undefined}
                  className="smallcaps inline-flex min-h-11 items-center no-underline decoration-brass underline-offset-[6px] aria-[current=page]:underline"
                >
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="mt-auto px-gutter pb-8 pt-10 text-caption text-ink-muted">
          {hero.eyebrow}. Check-in 4:00 PM, check-out 10:00 AM.
          <br />
          {footer.smallPrint[1]}
        </p>
      </div>
    </header>
  );
}
