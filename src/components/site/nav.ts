export type NavItem = { label: string; href: string; /** Home section id, for the current-section marker. */ section?: string };

/** Masthead labels from docs/ux-spec.md section 1. */
export const NAV: NavItem[] = [
  { label: "The residence", href: "/#residence", section: "residence" },
  { label: "Resort and beach", href: "/#resort", section: "resort" },
  { label: "Photographs", href: "/gallery" },
  { label: "Area guide", href: "/area" },
  { label: "Questions", href: "/faq" },
];
