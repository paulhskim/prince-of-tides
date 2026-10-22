PRINCE OF TIDES: OWNER PHOTOGRAPHS
==================================

Drop photographs of the actual unit, building, resort and beach path into this folder
(public/photos). The site picks them up automatically on the next build. No stock photos,
no AI images, and never a crop or caption that implies an ocean view.

FILE FORMAT
- JPEG or WebP (PNG and AVIF also work), sRGB.
- Long edge about 2400px, under 1.5MB each. The site resizes them for every screen.

NAMING (the filename prefix decides where a photo appears)
  cover-boardwalk.jpg       Cover of the home page (portrait 3:4, shown whole). Boardwalk or marsh.
  boardwalk-marsh.jpg       "To the beach" plate (portrait 3:4 or landscape 4:3, shown whole).
  marsh-detail.jpg          Also counts as boardwalk.
  beach.jpg                 The beach at the end of the boardwalk.
  living-wide.jpg           Living area. Any file starting with "living" works.
  kitchen.jpg               Kitchen.
  dining.jpg                Dining table.
  bedroom-king.jpg          Primary bedroom (king).
  bedroom-two.jpg           Second bedroom (queen and full).
  bath-ensuite.jpg          Bathrooms. Any file starting with "bath" works.
  linen-detail.jpg          Details. beach-gear.jpg is also treated as a detail.
  resort-indoor-pool.jpg    Indoor pool atrium (beside Guest privileges on the home page).
  resort-outdoor-pool.jpg   Other resort shots: any file starting with "resort", "pool",
                            "tennis", "courts" or "fitness".
  building-3.jpg            Building exterior.
  arrival-gate.jpg          Guard gate.
  host.jpg                  Host portrait (optional; never shown in the gallery).

Without a manifest, the alt text is made from the filename ("bedroom-king.jpg" becomes
"Bedroom king"), and photos are sorted by filename. That works, but a manifest is better.

THE MANIFEST (optional, recommended)
Create public/photos/manifest.json, a list with one entry per photo:

[
  {
    "file": "cover-boardwalk.jpg",
    "alt": "The raised boardwalk crossing the salt marsh toward the beach at sunset",
    "caption": "The marsh boardwalk from the resort to the beach",
    "slot": "hero",
    "order": 1
  },
  {
    "file": "bedroom-king.jpg",
    "alt": "Primary bedroom with a king bed and white linens, seen from the door",
    "caption": "Primary bedroom, king bed and ensuite",
    "slot": "bedroom1",
    "order": 7
  }
]

Fields
  file      Required. Exact filename in this folder.
  alt       Describe what is shown and where, honestly. Read aloud by screen readers.
  caption   Short line printed under the photo. Defaults to the alt text.
  slot      Overrides the filename prefix. One of:
            hero, living, kitchen, dining, bedroom1, bedroom2, bath, detail,
            pool, resort, boardwalk, beach, exterior, arrival, host, other
  order     Number. Lower comes first on the home page contact sheet and the gallery.

Until a photo exists for a slot, the site shows a flat stone panel labelled
"Photograph to come" with the intended shot, so the layout never shifts.
