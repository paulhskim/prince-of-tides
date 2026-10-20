/**
 * Small text helpers for presenting content from src/content without altering its meaning.
 */

/** Words that keep their capital when a heading is set in sentence case. */
const KEEP = new Set([
  "Hilton",
  "Head",
  "Island",
  "Coco's",
  "Vrbo",
  "Vrbo/Expedia",
  "Airbnb",
  "Shelter",
  "Cove",
  "Palmetto",
  "Dunes",
  "Lowcountry",
  "HOA",
  "STR",
  "I",
]);

/** "Guests, in Their Words" becomes "Guests, in their words". Proper nouns are kept. */
export function sentenceCase(input: string): string {
  const words = input.split(" ");
  return words
    .map((w, i) => {
      if (i === 0) return w;
      const bare = w.replace(/[^A-Za-z'/]/g, "");
      if (KEEP.has(bare) || /^[A-Z0-9]{2,}$/.test(bare)) return w;
      return w.toLowerCase();
    })
    .join(" ");
}

/** "IV. The Resort" becomes { numeral: "IV", title: "The resort" }. */
export function splitHeading(heading: string): { numeral: string | null; title: string } {
  const m = /^([IVXLC]+)\.\s+(.*)$/.exec(heading);
  if (!m) return { numeral: null, title: sentenceCase(heading) };
  return { numeral: m[1], title: sentenceCase(m[2]) };
}

/** True when an owner value has been filled in. */
export function isSet(value: string | null | undefined): value is string {
  return !!value && !value.includes("TODO_OWNER");
}

/**
 * Remove any sentence that still carries an owner placeholder, so unfinished notes never
 * reach guests. "Chairs are kept in a locker. TODO_OWNER: location." keeps the first sentence.
 */
export function withoutTodos(text: string): string {
  const idx = text.indexOf("TODO_OWNER");
  if (idx === -1) return text;
  // Cut from the start of the sentence that contains the placeholder.
  const before = text.slice(0, idx);
  const sentenceStart = Math.max(before.lastIndexOf(". "), before.lastIndexOf("? "));
  const kept = sentenceStart === -1 ? "" : text.slice(0, sentenceStart + 1);
  return kept.trim();
}

const MONTHS: Record<string, string> = {
  Jan: "January",
  Feb: "February",
  Mar: "March",
  Apr: "April",
  May: "May",
  Jun: "June",
  Jul: "July",
  Aug: "August",
  Sep: "September",
  Oct: "October",
  Nov: "November",
  Dec: "December",
};

/** "Oct 2025" becomes "October 2025". */
export function longMonth(date: string): string {
  const [m, y] = date.split(" ");
  return MONTHS[m] ? `${MONTHS[m]} ${y}` : date;
}

/** Two-digit frame number, "07". */
export function frame(n: number): string {
  return String(n).padStart(2, "0");
}

/** "1.2" miles with an approx. marker, or a word for on-site places. */
export function miles(d: number | null): string | null {
  if (d === null) return null;
  if (d === 0) return "On site";
  return `approx. ${d} mi`;
}

/**
 * Typographic apostrophes and quotation marks for display (the content files keep plain ASCII).
 * "Coco's" becomes "Coco’s"; "Pack 'n play" becomes "Pack ’n play"; "a 'quote'" becomes "a ‘quote’".
 * Never applied to guest reviews, which are shown exactly as written.
 */
export function smart(text: string): string {
  return text
    .replace(/(\w)'(\w)/g, "$1’$2")
    .replace(/(^|\s)'(n)\b/g, "$1’$2")
    .replace(/(^|[\s(])'/g, "$1‘")
    .replace(/'/g, "’")
    .replace(/(^|[\s(])"/g, "$1“")
    .replace(/"/g, "”");
}

/** Plate numbers in roman numerals, 1 to 39 ("XII"). */
export function roman(n: number): string {
  const table: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let out = "";
  let rest = n;
  for (const [v, s] of table) {
    while (rest >= v) {
      out += s;
      rest -= v;
    }
  }
  return out;
}
