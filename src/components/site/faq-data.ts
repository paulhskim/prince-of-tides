import { faq, type FaqItem } from "@/content/faq";
import { siteConfig } from "@/content/site.config";

/** Stable anchor id for a question, "how-does-parking-work". */
export function faqId(q: string): string {
  return q
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function faqAnswer(a: string): string {
  return a.replace(/\{\{responseTimeHours\}\}/g, String(siteConfig.contact.responseTimeHours));
}

/**
 * Questions shown on the home page. faq.ts has no `featured` flag yet, so these are picked for
 * the known pain points (parking, door code, early arrival, warm bedrooms, the beach walk).
 */
const FEATURED_Q = [
  "How does parking work?",
  "How do we get the door code?",
  "Can we check in early or check out late?",
  "The bedrooms feel warm at night. Any tips?",
  "How far is the beach?",
];

export function featuredFaq(): FaqItem[] {
  const picked = FEATURED_Q.map((q) => faq.find((f) => f.q === q)).filter((f): f is FaqItem => !!f);
  return picked.length ? picked : faq.slice(0, 5);
}
