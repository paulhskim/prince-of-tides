export type NavItem = {
  label: string;
  href: string;
  /** Home section id that marks this item current while it is on screen. */
  section?: string;
  /** Short gloss shown under the label in the mobile menu, so a first-time visitor knows what is there. */
  gloss?: string;
};

/**
 * The information architecture, in the order a guest asks: what is it, where do I sleep, what comes
 * with it, where is it. Reserve is a separate action, not a nav item; prices appear only there, after
 * dates are chosen.
 * Every item is an anchor on the home page; each has a deeper page linked from its section.
 */
export const NAV: NavItem[] = [
  { label: "The Residence", href: "/#residence", section: "residence", gloss: "Two bedrooms, two baths, sleeps 6" },
  { label: "The Rooms", href: "/#rooms", section: "rooms", gloss: "Who sleeps where, room by room" },
  { label: "Privileges", href: "/#privileges", section: "privileges", gloss: "Pools, steam room, the marsh boardwalk" },
  { label: "The Island", href: "/#island", section: "island", gloss: "Beaches, Harbour Town, the refuge" },
];

/** The reservation action, set apart from the nav. */
export const RESERVE = { label: "Reserve", href: "/reserve" } as const;

/** Home section ids, in page order, mapped to the nav item they belong to (null: none). */
export const SECTION_OWNER: [id: string, owner: string | null][] = [
  ["residence", "residence"],
  ["rooms", "rooms"],
  ["amenities", "rooms"],
  ["privileges", "privileges"],
  ["beach", "privileges"],
  ["island", "island"],
  ["day", "island"],
  ["seasons", "island"],
  ["reviews", null],
  ["arrival", null],
  ["reserve", null],
];

/** Secondary pages, listed in the mobile menu and the footer. */
export const MORE: NavItem[] = [
  { label: "Photographs", href: "/gallery" },
  { label: "Area guide", href: "/area" },
  { label: "Questions", href: "/faq" },
  { label: "Policies", href: "/policies" },
];
