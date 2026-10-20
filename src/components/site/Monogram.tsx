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

/**
 * The crest: the monogram inside a double ring, with the name and the island set around it in
 * spaced capitals, the way a club engraves its seal. Decorative; only ever shown at 96px or larger,
 * where the ring lettering is legible. It carries no date and no claim, only the name and the place.
 */
export function Crest({ size = 128, className = "", id = "crest" }: { size?: number; className?: string; id?: string }) {
  const path = `${id}-ring`;
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={`shrink-0 ${className}`}
    >
      <defs>
        <path id={path} d="M60,60 m-48.5,0 a48.5,48.5 0 1,1 97,0 a48.5,48.5 0 1,1 -97,0" />
      </defs>
      <circle cx="60" cy="60" r="58.5" fill="none" stroke="currentColor" strokeOpacity="0.7" strokeWidth="0.6" />
      <circle cx="60" cy="60" r="56.5" fill="none" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.4" />
      <circle cx="60" cy="60" r="40" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="0.6" />
      <text
        fontFamily="var(--font-sans)"
        fontSize="6.4"
        fontWeight="500"
        letterSpacing="2.15"
        fill="currentColor"
      >
        <textPath href={`#${path}`} startOffset="0">
          PRINCE OF TIDES &#183; HILTON HEAD ISLAND &#183; SOUTH CAROLINA &#183;
        </textPath>
      </text>
      <text x="51" y="69" textAnchor="middle" fontFamily="var(--font-serif)" fontStyle="italic" fontWeight="300" fontSize="30" fill="currentColor">
        P
      </text>
      <text x="69" y="72" textAnchor="middle" fontFamily="var(--font-serif)" fontWeight="300" fontSize="30" fill="currentColor">
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
