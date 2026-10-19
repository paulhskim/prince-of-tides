"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { footer, hero } from "@/content/copy";
import { siteConfig } from "@/content/site.config";
import { NAV } from "./nav";

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

  return (
    <header
      className={`sticky top-0 z-50 bg-paper transition-[border-color,height] duration-200 ease-quiet ${
        scrolled ? "border-b border-rule" : "border-b border-transparent"
      }`}
    >
      <div
        className={`mx-auto flex max-w-page items-center justify-between gap-6 px-gutter transition-[height] duration-200 ease-quiet ${
          scrolled ? "h-14" : "h-[72px]"
        }`}
      >
        <Link href="/" className="font-serif text-[1.125rem] leading-none no-underline lg:text-[1.25rem]">
          {siteConfig.brand.name}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {NAV.map((item) => {
              const current = isCurrent(item.href, item.section);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? (item.section ? "location" : "page") : undefined}
                    className={`inline-flex min-h-11 items-center text-small no-underline decoration-marsh decoration-1 underline-offset-[6px] transition-colors duration-100 hover:underline ${
                      current ? "underline" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={cta}
            className="hidden h-10 items-center bg-marsh px-4 text-small font-medium text-sheet no-underline transition-colors duration-100 hover:bg-marsh-hover sm:inline-flex"
          >
            {hero.primaryCta.label}
          </a>
          <button
            ref={menuButton}
            type="button"
            aria-expanded={open}
            aria-controls="site-drawer"
            onClick={() => setOpen(true)}
            className="-mr-2 inline-flex min-h-11 items-center gap-2 px-2 text-small font-medium lg:hidden"
          >
            Menu
            <Menu aria-hidden="true" size={18} strokeWidth={1.25} />
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
        className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-paper lg:hidden"
      >
        <div className="flex h-[72px] shrink-0 items-center justify-between px-gutter">
          <Link href="/" onClick={() => setOpen(false)} className="font-serif text-[1.125rem] no-underline">
            {siteConfig.brand.name}
          </Link>
          <button type="button" onClick={close} className="-mr-2 inline-flex min-h-11 items-center gap-2 px-2 text-small font-medium">
            Close
            <X aria-hidden="true" size={18} strokeWidth={1.25} />
          </button>
        </div>
        <nav aria-label="Main" className="px-gutter">
          <ul className="border-t border-ink">
            {NAV.map((item) => (
              <li key={item.href} className="border-b border-rule">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-14 items-center py-3 font-serif text-h3 no-underline"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href={cta === "#reserve" ? "/#reserve" : cta}
            onClick={() => setOpen(false)}
            className="mt-8 flex h-12 w-full items-center justify-center bg-marsh px-6 text-body font-medium text-sheet no-underline hover:bg-marsh-hover"
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
