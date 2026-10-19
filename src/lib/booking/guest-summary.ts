/** "3 adults, 1 child, 1 infant" (client-safe). */
export function guestSummary(r: { adults: number; children: number; infants: number }): string {
  const parts = [`${r.adults} ${r.adults === 1 ? "adult" : "adults"}`];
  if (r.children) parts.push(`${r.children} ${r.children === 1 ? "child" : "children"}`);
  if (r.infants) parts.push(`${r.infants} ${r.infants === 1 ? "infant" : "infants"}`);
  return parts.join(", ");
}
