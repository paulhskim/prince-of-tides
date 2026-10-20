/**
 * Booking emails via Resend, using the templates in src/content/copy.ts (`emails`). Server only.
 * Sends only when siteConfig.features.emailNotifications is on AND RESEND_API_KEY, BOOKING_NOTIFY_EMAIL
 * and EMAIL_FROM (or the older name BOOKING_FROM_EMAIL) are set. Otherwise the emails are logged to the
 * console so nothing is lost in development.
 */
import { Resend } from "resend";
import { siteConfig, type Quote } from "@/content/site.config";
import { emails } from "@/content/copy";
import { formatLong, formatMoney, formatShort } from "./dates";
import { groupNightRuns, nightsPhrase } from "./reserve";
import type { BookingRecord } from "./store";
import { guestSummary } from "./guest-summary";
import { resolveOwnerTokens } from "./owner-tokens";

export { guestSummary };

export function fillTemplate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (m, key: string) => (key in vars ? String(vars[key]) : m));
}

export function quoteAsText(q: Quote): string {
  const lines: string[] = [];
  for (const g of groupNightRuns(q)) {
    const dates = g.nights > 1 ? `${formatShort(g.first)} to ${formatShort(g.last)}` : formatShort(g.first);
    lines.push(`${nightsPhrase(g)}, ${g.name} (${dates}), ${formatMoney(g.rate)} a night: ${formatMoney(g.amount)}`);
  }
  if (q.discounts > 0) lines.push(`${q.discountLabel ?? "Discount"}: -${formatMoney(q.discounts)}`);
  lines.push(`Cleaning fee: ${formatMoney(q.cleaningFee)}`);
  for (const t of q.taxes) lines.push(`${t.name} (${(t.rate * 100).toFixed(0)}%): ${formatMoney(t.amount)}`);
  lines.push(`Total: ${formatMoney(q.total)}`);
  if (q.isPlaceholder) lines.push("(Placeholder rates: pricing.isPlaceholder is true in site.config.ts.)");
  return lines.join("\n");
}

export type EmailMessage = { to: string; subject: string; text: string; replyTo?: string };

export function buildRequestEmails(r: BookingRecord, notifyTo: string): { guest: EmailMessage; host: EmailMessage } {
  const counted = r.adults + r.children;
  const vars = {
    guestName: r.name,
    guestEmail: r.email,
    guestPhone: r.phone,
    checkIn: formatLong(r.checkIn),
    checkOut: formatLong(r.checkOut),
    nights: r.quote.nights,
    guests: `${counted} (${guestSummary(r)})`,
    estimateTotal: formatMoney(r.quote.total),
    message: [r.arrivalTime ? `Estimated arrival: ${r.arrivalTime}` : "", r.message?.trim() || "(none)"]
      .filter(Boolean)
      .join("\n"),
    submittedAt: r.createdAt,
  };
  const g = emails.guestRequestReceived;
  const h = emails.hostNewRequest;
  return {
    guest: {
      to: r.email,
      subject: fillTemplate(g.subject, vars),
      text: `${resolveOwnerTokens(fillTemplate(g.body, vars))}\n\nReference: ${r.id}\n`,
      replyTo: notifyTo,
    },
    host: {
      to: notifyTo,
      subject: `${fillTemplate(h.subject, vars)} [${r.id}]`,
      text: `${fillTemplate(h.body, vars)}\n\nReference: ${r.id}\n\nServer quote\n${quoteAsText(r.quote)}\n`,
      replyTo: r.email,
    },
  };
}

export function emailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? process.env.BOOKING_FROM_EMAIL;
  const notify = process.env.BOOKING_NOTIFY_EMAIL;
  const enabled = siteConfig.features.emailNotifications && Boolean(apiKey && from && notify);
  return { enabled, apiKey, from, notify };
}

/** Send (or log) a set of messages. Returns the resulting status; never throws. */
export async function deliver(messages: EmailMessage[]): Promise<"sent" | "logged" | "failed"> {
  const cfg = emailConfig();
  if (!cfg.enabled) {
    for (const m of messages) {
      console.log(`[booking email, not sent: Resend not configured]\nTo: ${m.to}\nSubject: ${m.subject}\n\n${m.text}`);
    }
    return "logged";
  }
  try {
    const resend = new Resend(cfg.apiKey);
    for (const m of messages) {
      const { error } = await resend.emails.send({
        from: cfg.from!,
        to: m.to,
        subject: m.subject,
        text: m.text,
        replyTo: m.replyTo,
      });
      if (error) throw new Error(`${error.name}: ${error.message}`);
    }
    return "sent";
  } catch (err) {
    console.error("[booking email] send failed", err);
    return "failed";
  }
}

export async function sendRequestEmails(r: BookingRecord) {
  const notify = emailConfig().notify ?? "host (BOOKING_NOTIFY_EMAIL not set)";
  const { guest, host } = buildRequestEmails(r, notify);
  return deliver([host, guest]);
}
