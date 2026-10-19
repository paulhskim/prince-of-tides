/**
 * Prince of Tides: guest-facing policies.
 *
 * Sources and rationale: docs/booking-ops.md. Amounts that depend on owner decisions (security deposit)
 * are marked TODO_OWNER. Quiet hours, parking, trash and the 1-hour complaint response come from the
 * Town of Hilton Head Island short-term rental rules. No imports, so this file is safe anywhere.
 */

export type CancellationTier = { when: string; refund: string };

export type CancellationPolicy = {
  id: string;
  title: string;
  summary: string;
  tiers: CancellationTier[];
  /** Extra clauses shown under the tiers. */
  notes: string[];
};

export type PaymentPolicy = {
  /** Key referenced by siteConfig.booking.depositPolicy. */
  id: string;
  summary: string;
  schedule: string[];
};

export type Policies = {
  houseRules: string[];
  cancellation: CancellationPolicy;
  payment: PaymentPolicy;
  securityDeposit: { title: string; amount: string; text: string };
  rentalAgreementNote: string;
  taxesNote: string;
  permitNote: string;
  accessibilityNote: string;
  privacyNote: string;
};

export const policies: Policies = {
  houseRules: [
    "Check-in is 4:00 PM and check-out is 10:00 AM. Early check-in or late checkout can be requested and is confirmed only when the calendar allows.",
    "The person booking must be 21 or older and must stay in the condo for the whole reservation.",
    "Maximum 6 guests overnight. Please let us know about any day visitors in advance.",
    "No smoking or vaping of any kind, inside the condo or on resort walkways near the building.",
    "No pets. An additional cleaning fee applies if evidence of a pet is found.",
    "No events, parties or gatherings unless approved in writing before arrival.",
    "Quiet hours are 10:00 PM to 7:00 AM, as set by the Town of Hilton Head Island. Town noise rules apply at all hours.",
    "Up to 2 vehicles. Park only in marked spaces with the resort parking pass displayed, never on grass, pine straw or roadsides.",
    "Bag all trash and use the resort's designated containers. Do not leave bags outside the door.",
    "Follow posted Hilton Head Resort rules for pools, hot tub, sauna, steam room, gym and courts. Hours are set by the HOA and vary by season.",
    "On the beach, respect sea turtle nesting areas and use only red-beam lights at night.",
    "Please report anything broken or missing as soon as you notice it so we can fix it quickly.",
  ],

  cancellation: {
    id: "pot-standard-60-30",
    title: "Standard cancellation policy",
    summary:
      "Full refund up to 60 days before check-in, 50% refund 30 to 59 days before, and no refund inside 30 days unless the dates are rebooked.",
    tiers: [
      { when: "60 or more days before check-in", refund: "100% of payments received" },
      { when: "30 to 59 days before check-in", refund: "50% of the total reservation cost" },
      {
        when: "Less than 30 days before check-in",
        refund: "No refund, except for any nights we are able to rebook at the same or higher rate",
      },
    ],
    notes: [
      "Days are counted to 4:00 PM Eastern on the check-in date. Cancellations must be sent in writing (email).",
      "Hurricane or storm: if a mandatory evacuation order covering Hilton Head Island is issued for any part of your stay, you receive a pro-rated refund for the nights you could not use.",
      "Early departures, weather other than a mandatory evacuation, and resort amenity closures (pools, shuttle, elevator) are not grounds for a refund.",
      "We strongly recommend travel insurance, which can cover cancellations our policy does not.",
      "Changing dates more than 60 days out is free when the new dates are available, at the rates for the new dates.",
    ],
  },

  payment: {
    id: "split-50-50",
    summary:
      "50% of the total is due when you sign the rental agreement to confirm your dates. The balance is due 30 days before check-in.",
    schedule: [
      "Booking request: no payment. We confirm availability and send a written quote within our stated response time.",
      "Confirmation: sign the rental agreement and pay 50% of the total (lodging, cleaning fee and taxes). Your dates are held only once this payment is received.",
      "30 days before check-in: the remaining 50% is charged or invoiced.",
      "Bookings made less than 30 days before check-in: 100% is due at confirmation.",
      "Unpaid balances: if the balance is not received within 3 days of its due date, the reservation may be cancelled under the cancellation policy.",
    ],
  },

  securityDeposit: {
    title: "Refundable security deposit",
    amount: "TODO_OWNER: amount (suggested $300)",
    text:
      "A refundable security deposit is collected with the final payment. It is returned in full within 7 days of checkout when there is no damage beyond normal wear, no missing items, and house rules were followed (including no smoking and no pets). Any deduction is itemized in writing with photos.",
  },

  rentalAgreementNote:
    "Every direct booking is confirmed with a short written rental agreement that both parties sign electronically. It lists the dates, guests, total price with taxes, payment schedule, cancellation policy and house rules. A booking request on this site is not a confirmed reservation until the agreement is signed and the first payment is received.",

  taxesNote:
    "South Carolina and Town of Hilton Head Island accommodations taxes (currently 10% combined: 5% state sales tax, 2% state accommodations tax, 1% Town accommodations tax and 2% Town beach preservation fee) apply to the lodging and cleaning fee. They are shown on every quote and remitted by us. Rates can change; your quote shows the rates in effect.",

  permitNote:
    "Town of Hilton Head Island Short-Term Rental Permit #029008. Questions or concerns during a stay can also be reported to the Town's Short-Term Rental Nuisance Hotline at (843) 341-6864.",

  accessibilityNote:
    "Building 3 has an elevator, which is operated by the Hilton Head Resort HOA. We cannot guarantee it will be in service on any given day; if it is out of service, access is by stairs. The condo is not a certified accessible unit, and both bathrooms have shower/tub combinations. Please contact us before booking if anyone in your group has mobility needs so we can answer specific questions.",

  privacyNote:
    "We use the details you send in a booking request or contact form (name, email, phone, dates, guest count and message) only to respond to you, prepare your quote and manage your stay. We do not sell or share them for marketing. Requests are stored in our booking records and email, and you can ask us to delete them at any time.",
};
