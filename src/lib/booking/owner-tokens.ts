/**
 * Copy in src/content/copy.ts contains owner placeholders such as "TODO_OWNER: response time". Where the
 * value exists in siteConfig we substitute it at render time; anything still unknown stays visible as
 * TODO_OWNER so it is caught before launch.
 */
import { siteConfig } from "@/content/site.config";

/**
 * Neutral wording used in production when an owner value is still missing, so a guest never receives
 * "TODO_OWNER" in an email or on a page. Development keeps the placeholder visible on purpose.
 */
const PRODUCTION_FALLBACKS: Record<string, string> = {
  "host name": "Your host",
  "contact email": "the host",
};

export function resolveOwnerTokens(text: string, production: boolean = process.env.NODE_ENV === "production"): string {
  const { responseTimeHours, hostName, email } = siteConfig.contact;
  let out = text.replace(/TODO_OWNER: response time/g, `${responseTimeHours} hours`);
  if (hostName && !hostName.startsWith("TODO_OWNER")) out = out.replace(/TODO_OWNER: host name/g, hostName);
  if (email && !email.startsWith("TODO_OWNER")) out = out.replace(/TODO_OWNER: contact email/g, email);
  if (production) {
    for (const [token, fallback] of Object.entries(PRODUCTION_FALLBACKS)) out = out.split(`TODO_OWNER: ${token}`).join(fallback);
  }
  return out;
}

export const responseLine = () =>
  `No payment is taken now. You will hear from the host within ${siteConfig.contact.responseTimeHours} hours.`;
