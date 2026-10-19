/**
 * Owner photographs, read from public/photos at build or request time (server only).
 *
 * - Any .jpg, .jpeg, .png, .webp or .avif file in public/photos is picked up.
 * - Optional public/photos/manifest.json adds alt text, captions, slots and order:
 *     [{ "file": "living-wide.jpg", "alt": "...", "caption": "...", "slot": "living", "order": 2 }]
 * - Without a manifest entry, the slot is inferred from the filename prefix and the alt text is
 *   derived from the filename ("bedroom-king.jpg" becomes "Bedroom king").
 * - When a slot has no photograph, components render the design-system placeholder with the
 *   intended shot named (see SLOTS below).
 */
import fs from "node:fs";
import path from "node:path";

export type PhotoSlot =
  | "hero"
  | "living"
  | "kitchen"
  | "dining"
  | "bedroom1"
  | "bedroom2"
  | "bath"
  | "detail"
  | "pool"
  | "resort"
  | "boardwalk"
  | "beach"
  | "exterior"
  | "arrival"
  | "host"
  | "other";

export type PhotoGroup = "residence" | "resort" | "beach";

export type Photo = {
  /** Public URL, e.g. /photos/living-wide.jpg */
  src: string;
  file: string;
  alt: string;
  caption: string;
  slot: PhotoSlot;
  group: PhotoGroup;
  order: number;
};

type ManifestEntry = {
  file: string;
  alt?: string;
  caption?: string;
  slot?: string;
  order?: number;
};

/** What each slot is meant to show. Used for placeholder labels and grouping. */
export const SLOTS: Record<PhotoSlot, { shot: string; group: PhotoGroup }> = {
  hero: { shot: "the marsh boardwalk at golden hour, looking toward the beach", group: "beach" },
  living: { shot: "living area, wide from the entry, with the dining table", group: "residence" },
  kitchen: { shot: "kitchen, the full run of appliances", group: "residence" },
  dining: { shot: "dining table set for four, natural light", group: "residence" },
  bedroom1: { shot: "primary bedroom, king bed, from the door", group: "residence" },
  bedroom2: { shot: "second bedroom, queen and full beds", group: "residence" },
  bath: { shot: "ensuite bathroom", group: "residence" },
  detail: { shot: "linen and towel detail", group: "residence" },
  pool: { shot: "the heated indoor pool atrium beside Building 3", group: "resort" },
  resort: { shot: "the outdoor pool", group: "resort" },
  boardwalk: { shot: "the boardwalk across the salt marsh, wide", group: "beach" },
  beach: { shot: "the beach at the end of the boardwalk", group: "beach" },
  exterior: { shot: "Building 3, exterior and entry", group: "resort" },
  arrival: { shot: "the guard gate on arrival", group: "resort" },
  host: { shot: "the host, natural light", group: "residence" },
  other: { shot: "a photograph of the residence", group: "residence" },
};

/** Filename prefix to slot, checked in order (most specific first). */
const PREFIX_SLOTS: [RegExp, PhotoSlot][] = [
  [/^(cover|hero)/, "hero"],
  [/^resort-indoor-pool|^indoor-pool|^pool-indoor|^atrium/, "pool"],
  [/^(boardwalk|marsh)/, "boardwalk"],
  [/^beach-gear/, "detail"],
  [/^beach/, "beach"],
  [/^(bedroom-king|bedroom-1|bedroom1|primary)/, "bedroom1"],
  [/^(bedroom-two|bedroom-2|bedroom2)/, "bedroom2"],
  [/^bedroom/, "bedroom1"],
  [/^bath/, "bath"],
  [/^kitchen/, "kitchen"],
  [/^dining/, "dining"],
  [/^living/, "living"],
  [/^(linen|detail)/, "detail"],
  [/^(building|exterior)/, "exterior"],
  [/^(arrival|gate)/, "arrival"],
  [/^host/, "host"],
  [/^(resort|pool|outdoor|tennis|courts|fitness)/, "resort"],
];

const IMAGE_EXT = /\.(jpe?g|png|webp|avif)$/i;
const PHOTO_DIR = path.join(process.cwd(), "public", "photos");

function isSlot(value: string | undefined): value is PhotoSlot {
  return !!value && value in SLOTS;
}

function inferSlot(file: string): PhotoSlot {
  const stem = file.toLowerCase();
  for (const [re, slot] of PREFIX_SLOTS) if (re.test(stem)) return slot;
  return "other";
}

/** "bedroom-king_02.jpg" becomes "Bedroom king 02". */
function altFromFilename(file: string): string {
  const words = file
    .replace(IMAGE_EXT, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : "Photograph";
}

function readManifest(): ManifestEntry[] {
  try {
    const raw = fs.readFileSync(path.join(PHOTO_DIR, "manifest.json"), "utf8");
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (e): e is ManifestEntry => !!e && typeof e === "object" && typeof (e as ManifestEntry).file === "string",
    );
  } catch {
    return [];
  }
}

let cache: Photo[] | null = null;

/** All owner photographs, sorted by manifest order then filename. */
export function getPhotos(): Photo[] {
  if (cache && process.env.NODE_ENV === "production") return cache;
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(PHOTO_DIR)
      // og-image.* is the social card (see docs/seo-implementation.md), not a gallery photograph.
      .filter((f) => IMAGE_EXT.test(f) && !f.startsWith(".") && !/^og-image\./i.test(f));
  } catch {
    files = [];
  }
  const manifest = new Map(readManifest().map((e) => [e.file, e]));

  const photos = files.map((file, i): Photo => {
    const m = manifest.get(file);
    const slot = isSlot(m?.slot) ? m.slot : inferSlot(file);
    const alt = m?.alt?.trim() || altFromFilename(file);
    return {
      src: `/photos/${encodeURIComponent(file)}`,
      file,
      alt,
      caption: m?.caption?.trim() || alt,
      slot,
      group: SLOTS[slot].group,
      order: typeof m?.order === "number" ? m.order : 1000 + i,
    };
  });

  photos.sort((a, b) => a.order - b.order || a.file.localeCompare(b.file));
  cache = photos;
  return photos;
}

/** Galleries never show the host portrait. */
export function getGalleryPhotos(): Photo[] {
  return getPhotos().filter((p) => p.slot !== "host");
}

/** First photograph for a slot, optionally skipping files already used on the page. */
export function photoFor(slot: PhotoSlot, exclude: string[] = []): Photo | undefined {
  return getPhotos().find((p) => p.slot === slot && !exclude.includes(p.file));
}

export const GROUP_LABELS: Record<PhotoGroup, string> = {
  residence: "The residence",
  resort: "The resort",
  beach: "The way to the beach",
};
