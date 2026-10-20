# Round 3 brief (owner request, verbatim)

"Make it more like a premium membership only resort website. The navigation and the room outline is a bit
confusing, add these pictures, and add more points that draw people in. Build a mock booking page, with pricing
rates, and taxes and fees."

## Interpretation (lead's decisions)
- "Premium membership only resort" is an AESTHETIC and TONE direction: the feel of a private members' club or
  private resort (references: Aman, Soho House, Kiawah Island Club, The Cloister at Sea Island, private estate
  clubs). It must NOT make false claims: Prince of Tides is a privately managed two-bedroom condo at Hilton Head
  Resort, booked by request. Do NOT claim membership is required, that it is exclusive/invitation-only, that there
  is a membership, concierge staff, or services that do not exist. Honest club-like devices are fine: "by request",
  "reservations", "guest privileges" (only the real resort amenities), a guest registry/arrival dossier, numbered
  editions/plates, a crest/monogram, discreet entry, the gated resort's 24-hour guard gate (true).
- Navigation and room outline must become obviously clear. A first-time visitor should know within seconds:
  what it is, what the rooms are (who sleeps where), what the resort offers, where it is, what it costs, how to book.
- Area photos: 11 Creative Commons / public-domain photos in public/photos/area/*.webp with credits in
  docs/area-photo-credits.csv. Licenses REQUIRE attribution: creator, link to source, license name + link, and a
  note that images were resized/compressed. They are area photos, NOT the property: never caption or place them
  to imply they show the rental or the resort's own boardwalk (the pier photo is Fish Haul Creek; golf is Harbour
  Town Golf Links, not Palmetto Dunes; lighthouse/marina are Harbour Town, not Shelter Cove).
- "Points that draw people in": real, specific reasons to book: the island's experiences (dolphins in Calibogue
  Sound, Harbour Town, Pinckney Island refuge, beaches at sunset), resort privileges, seasons, a day-in-the-life,
  book-direct benefits (only true ones), honest guest reviews already in copy.ts.
- Mock booking page: a complete reservation flow with a visible nightly rate calendar, seasonal rate table,
  itemized taxes and fees, review step, and a mock confirmation. Uses the existing placeholder rates in
  src/content/site.config.ts (computeQuote). It is a MOCK: no real payment, NO card number inputs. Clearly but
  elegantly labeled as a preview where payment would happen (e.g. "Payment is arranged after the host confirms").
