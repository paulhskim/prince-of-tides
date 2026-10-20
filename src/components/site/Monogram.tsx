import Link from "next/link";
import { siteConfig } from "@/content/site.config";
import { NameSet } from "./layout";

/**
 * The monogram: an italic P set over a roman T inside a hairline ring, drawn in the display serif.
 * Decorative (aria-hidden); the wordmark beside it carries the name.
 */
export function Monogram({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={`shrink-0 ${className}`}
    >
      <circle cx="20" cy="20" r="19.25" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.75" />
      <text
        x="14.6"
        y="25.6"
        textAnchor="middle"
        fontFamily="var(--font-serif)"
        fontStyle="italic"
        fontWeight="300"
        fontSize="17"
        fill="currentColor"
      >
        P
      </text>
      <text x="24.4" y="27.2" textAnchor="middle" fontFamily="var(--font-serif)" fontWeight="300" fontSize="17" fill="currentColor">
        T
      </text>
    </svg>
  );
}

/** Monogram and name, with the place set beneath in small capitals. */
export function Wordmark({ onNight = false, onClick }: { onNight?: boolean; onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="group inline-flex items-center gap-3 no-underline">
      <Monogram size={38} className={onNight ? "text-brass-light" : "text-brass"} />
      <span className="flex flex-col">
        <NameSet name={siteConfig.brand.name} className="font-serif text-[1.1875rem] leading-none tracking-[-0.01em] lg:text-[1.3125rem]" />
        <span className={`mt-1.5 font-sans text-[0.5625rem] font-medium uppercase leading-none tracking-[0.24em] ${onNight ? "text-on-dark-muted" : "text-ink-muted"}`}>
          Hilton Head Island
        </span>
      </span>
    </Link>
  );
}
