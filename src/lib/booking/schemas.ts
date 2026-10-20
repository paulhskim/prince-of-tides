/**
 * Zod schemas shared by the client form and the API routes. The server always re-validates and
 * recomputes the quote; nothing priced by the client is trusted.
 */
import { z } from "zod";
import { siteConfig } from "@/content/site.config";
import { booking as bookingCopy } from "@/content/copy";
import { isISODate } from "./dates";

/**
 * Guest rules.
 * TODO_OWNER: confirm infant handling. Current assumption: infants (under 2) do NOT count toward the
 * 6-guest maximum (matches copy "Infants under 2 are not counted. A travel crib is provided."), with
 * at most 2 infants per stay because one travel crib is provided. Change these two values to adjust.
 */
export const GUEST_RULES = {
  maxGuests: siteConfig.capacity.maxGuests,
  maxAdults: siteConfig.capacity.maxAdults,
  minAdults: 1,
  maxInfants: 2, // TODO_OWNER: confirm
  infantsCountTowardMax: false, // TODO_OWNER: confirm
} as const;

export function countedGuests(g: { adults: number; children: number; infants: number }): number {
  return g.adults + g.children + (GUEST_RULES.infantsCountTowardMax ? g.infants : 0);
}

export const ARRIVAL_TIMES = [
  "4 to 6 PM",
  "6 to 8 PM",
  "After 8 PM",
  "I would like to ask about early check-in",
  "Not sure yet",
] as const;

const v = bookingCopy.validation;

const isoDate = z.string().refine(isISODate, { message: "Use a date like 2027-06-12." });

const guestsShape = {
  adults: z.coerce.number().int().min(GUEST_RULES.minAdults, v.minAdults).max(GUEST_RULES.maxAdults),
  children: z.coerce.number().int().min(0).max(GUEST_RULES.maxGuests),
  infants: z.coerce.number().int().min(0).max(GUEST_RULES.maxInfants, `Up to ${GUEST_RULES.maxInfants} infants.`),
};

/** Stay selection (dates + guests). Used by the quote query and both submit schemas. */
export const staySchema = z
  .object({ checkIn: isoDate, checkOut: isoDate, ...guestsShape })
  .refine((s) => s.checkOut > s.checkIn, { message: v.checkOutAfterCheckIn, path: ["checkOut"] })
  .refine((s) => countedGuests(s) <= GUEST_RULES.maxGuests, { message: v.maxGuests, path: ["children"] });

const PHONE_DIGITS_MIN = 7;

/** Contact and consent fields per docs/ux-spec.md section 3.3. */
export const contactShape = {
  // The name is echoed in the guest acknowledgement (and its subject line), so control characters and
  // links are refused: no header tricks, and the form cannot be used to mail spam links to third parties.
  name: z
    .string()
    .trim()
    .min(2, "Full name: enter at least 2 characters.")
    .max(120)
    .refine((n) => !/[\u0000-\u001f\u007f]/.test(n), { message: "Full name: please remove special characters." })
    .refine((n) => !/(https?:|www\.|\/\/|<|>)/i.test(n), { message: "Full name: please enter your name only." }),
  email: z.string().trim().max(254).pipe(z.email({ message: `Email: ${v.invalidEmail}` })),
  phone: z
    .string()
    .trim()
    .max(40)
    .refine((p) => /^[0-9+().\s/#-]*((ext\.?|x)\s*[0-9]+)?$/i.test(p), { message: `Phone: ${v.invalidPhone}` })
    .refine((p) => p.replace(/\D/g, "").length >= PHONE_DIGITS_MIN, { message: `Phone: ${v.invalidPhone}` }),
  arrivalTime: z.enum(ARRIVAL_TIMES).optional().or(z.literal("")),
  message: z.string().max(1000, "Message: 1000 characters at most.").optional().default(""),
  agreeRules: z.literal(true, { message: v.mustAgreeRules }),
  agree21: z.literal(true, { message: v.mustBe21 }),
  /** Honeypot. Real visitors never see or fill it. */
  company: z.string().max(0).optional().or(z.literal("")),
  /** utm / referrer, informational. */
  source: z.string().max(300).optional(),
  /** Total the guest saw. Compared with the server quote; never used as the price. */
  quotedTotal: z.number().nonnegative().optional(),
};

export const inquirySchema = z
  .object({ checkIn: isoDate, checkOut: isoDate, ...guestsShape, ...contactShape })
  .refine((s) => s.checkOut > s.checkIn, { message: v.checkOutAfterCheckIn, path: ["checkOut"] })
  .refine((s) => countedGuests(s) <= GUEST_RULES.maxGuests, { message: v.maxGuests, path: ["children"] });

export type InquiryInput = z.input<typeof inquirySchema>;
export type Inquiry = z.output<typeof inquirySchema>;

/** Phase 3 instant booking adds acceptance of the rental agreement. */
export const checkoutSchema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    ...guestsShape,
    ...contactShape,
    acceptAgreement: z.literal(true, { message: "Please accept the rental agreement to continue." }),
  })
  .refine((s) => s.checkOut > s.checkIn, { message: v.checkOutAfterCheckIn, path: ["checkOut"] })
  .refine((s) => countedGuests(s) <= GUEST_RULES.maxGuests, { message: v.maxGuests, path: ["children"] });

export type CheckoutInput = z.output<typeof checkoutSchema>;

export const availabilityQuerySchema = z
  .object({ from: isoDate, to: isoDate })
  .refine((q) => q.to > q.from, { message: "`to` must be after `from`." });

/** Flatten zod issues to { field: message } (first message per field). */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
