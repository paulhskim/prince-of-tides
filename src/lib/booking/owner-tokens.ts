/**
 * Copy in src/content/copy.ts contains owner placeholders such as "TODO_OWNER: response time". Where the
 * value exists in siteConfig we substitute it at render time; anything still unknown stays visible as
 * TODO_OWNER so it is caught before launch.
 */
import { siteConfig } from "@/content/site.config";

export function resolveOwnerTokens(text: string): string {
  const { responseTimeHours, hostName, email } = siteConfig.contact;
  let out = text.replace(/TODO_OWNER: response time/g, `${responseTimeHours} hours`);
  if (hostName && !hostName.startsWith("TODO_OWNER")) out = out.replace(/TODO_OWNER: host name/g, hostName);
  if (email && !email.startsWith("TODO_OWNER")) out = out.replace(/TODO_OWNER: contact email/g, email);
  return out;
}

export const responseLine = () =>
  `No payment is taken now. You will hear from the host within ${siteConfig.contact.responseTimeHours} hours.`;
