/**
 * Area photographs: Creative Commons and public-domain images of Hilton Head Island.
 *
 * These are photographs of the island, NOT of Prince of Tides or Hilton Head Resort. Captions
 * say exactly what and where each one is. Every use must carry the credit line (creator linked to
 * the source, license name linked to the license) and the site states on /credits that the images
 * were resized and compressed. Source of record: docs/area-photo-credits.csv.
 *
 * Dimensions are the real pixel sizes of the files in public/photos/area (read October 2026).
 * Locations checked October 2026:
 * - Fish Haul Creek: Fish Haul Beach Park, end of Beach City Road on Port Royal Sound, the island's
 *   north end (discoversouthcarolina.com/articles/visit-fish-haul-creek-park-in-hilton-head).
 * - Harbour Town, its lighthouse, marina and Harbour Town Golf Links are in Sea Pines, at the
 *   island's south end, beside Calibogue Sound. They are not at Shelter Cove or Palmetto Dunes.
 */

export type AreaPhotoId =
  | "calibogue-sound-dolphin"
  | "fish-haul-creek-boardwalk"
  | "fish-haul-creek-salt-marsh"
  | "harbour-town-golf-links"
  | "harbour-town-lighthouse"
  | "harbour-town-marina"
  | "hilton-head-beach-driftwood"
  | "hilton-head-beach-sunset"
  | "hilton-head-great-blue-heron"
  | "pinckney-island-greenery"
  | "pinckney-island-marsh";

/** Loose groupings for picking a photograph. Area guide category ids plus a few themes. */
export type AreaPhotoCategory =
  | "beaches"
  | "things-to-do"
  | "family-fun"
  | "marsh"
  | "wildlife"
  | "harbour-town"
  | "golf"
  | "water";

export interface AreaPhoto {
  id: AreaPhotoId;
  src: string;
  width: number;
  height: number;
  /** Describes the image for screen readers. */
  alt: string;
  /** What and where, set under the photograph. Never implies the rental or the resort. */
  caption: string;
  creator: string;
  license: string;
  licenseUrl: string;
  sourceUrl: string;
  changes: string;
  categories: AreaPhotoCategory[];
}

const CHANGES = "Resized and compressed; no other changes.";

const BY_2 = { license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/" };
const BY_4 = { license: "CC BY 4.0", licenseUrl: "https://creativecommons.org/licenses/by/4.0/" };
const BY_SA_3 = { license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/" };
const BY_SA_4 = { license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/" };
const PD = { license: "Public domain", licenseUrl: "https://creativecommons.org/publicdomain/mark/1.0/" };

export const areaPhotos: AreaPhoto[] = [
  {
    id: "fish-haul-creek-salt-marsh",
    src: "/photos/area/fish-haul-creek-salt-marsh.webp",
    width: 1800,
    height: 811,
    alt: "A tidal creek winding through golden spartina grass, with a line of trees and a wide sky beyond.",
    caption: "Salt marsh at Fish Haul Creek, on the north end of Hilton Head Island.",
    creator: "O. McCrosson",
    ...BY_SA_4,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Salt_Marsh_at_Fish_Haul_Creek,_Hilton_Head_Island.jpg",
    changes: CHANGES,
    categories: ["marsh"],
  },
  {
    id: "fish-haul-creek-boardwalk",
    src: "/photos/area/fish-haul-creek-boardwalk.webp",
    width: 1800,
    height: 811,
    alt: "A long wooden pier with rails runs across the marsh grass to a small roofed shelter.",
    caption: "The pier over the marsh at Fish Haul Creek, north end of Hilton Head Island. Not the resort boardwalk.",
    creator: "O. McCrosson",
    ...BY_SA_4,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Pier_Overlooking_Fish_Haul_Creek_on_Hilton_Head_Island.jpg",
    changes: CHANGES,
    categories: ["marsh"],
  },
  {
    id: "pinckney-island-marsh",
    src: "/photos/area/pinckney-island-marsh.webp",
    width: 1800,
    height: 1452,
    alt: "Tall marsh grass and still water under a moss-hung live oak, with open marsh and a tree line beyond.",
    caption: "Salt marsh and moss-hung oaks at Pinckney Island National Wildlife Refuge.",
    creator: "Gentry George / US Fish and Wildlife Service",
    ...PD,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:A_scenic_view_of_the_landscape_at_the_Pinckney_national_wildlife_refuge.jpg",
    changes: CHANGES,
    categories: ["things-to-do", "marsh", "wildlife"],
  },
  {
    id: "pinckney-island-greenery",
    src: "/photos/area/pinckney-island-greenery.webp",
    width: 1800,
    height: 1350,
    alt: "Palmettos and dense green trees at the edge of a tidal flat, with marsh grass behind.",
    caption: "Palmettos and marsh edge at Pinckney Island National Wildlife Refuge.",
    creator: "Jeff Gunn",
    ...BY_2,
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Pinckney_Island_National_Wildlife_Refuge_(5957933021).jpg",
    changes: CHANGES,
    categories: ["things-to-do", "marsh"],
  },
  {
    id: "harbour-town-lighthouse",
    src: "/photos/area/harbour-town-lighthouse.webp",
    width: 1800,
    height: 1350,
    alt: "The red-and-white striped Harbour Town Lighthouse rising behind moored yachts and waterfront buildings.",
    caption: "Harbour Town Lighthouse above the yacht basin, Sea Pines, at the south end of the island.",
    creator: "Locust member",
    ...BY_4,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hilton_Head_Island_Lighthouse_June_2026.png",
    changes: CHANGES,
    categories: ["things-to-do", "harbour-town"],
  },
  {
    id: "harbour-town-marina",
    src: "/photos/area/harbour-town-marina.webp",
    width: 1296,
    height: 972,
    alt: "Boats moored in a calm marina, with the striped lighthouse and low waterfront buildings behind.",
    caption: "Harbour Town marina and lighthouse, Sea Pines, photographed in July 2007.",
    creator: "MoodyGroove",
    ...BY_SA_3,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Harbour_Town_July_2007.jpg",
    changes: CHANGES,
    categories: ["things-to-do", "harbour-town", "water"],
  },
  {
    id: "harbour-town-golf-links",
    src: "/photos/area/harbour-town-golf-links.webp",
    width: 1800,
    height: 1350,
    alt: "A narrow fairway running between tall pines, with a golfer in the distance.",
    caption: "A fairway at Harbour Town Golf Links, Sea Pines.",
    creator: "danperry.com",
    ...BY_2,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Harbour_Town_Golf_Links,_Hilton_Head_-_5111132935.jpg",
    changes: CHANGES,
    categories: ["things-to-do", "golf", "harbour-town"],
  },
  {
    id: "calibogue-sound-dolphin",
    src: "/photos/area/calibogue-sound-dolphin.webp",
    width: 1055,
    height: 758,
    alt: "A dolphin's head breaking the green surface of the water, close to the camera.",
    caption: "A dolphin surfacing in Calibogue Sound, off the south end of Hilton Head Island.",
    creator: "MoodyGroove",
    ...BY_SA_3,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Dolphin_Calibogue_August_2007.jpg",
    changes: CHANGES,
    categories: ["things-to-do", "family-fun", "wildlife", "water"],
  },
  {
    id: "hilton-head-beach-sunset",
    src: "/photos/area/hilton-head-beach-sunset.webp",
    width: 1600,
    height: 1200,
    alt: "A low sun over the sea, its light running across rippled wet sand, with a few people walking in silhouette.",
    caption: "Sunset across wet sand on a Hilton Head Island beach.",
    creator: "Lee Coursey",
    ...BY_2,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Sunset_at_the_Beach_on_Hilton_Head_Island.jpg",
    changes: CHANGES,
    categories: ["beaches"],
  },
  {
    id: "hilton-head-beach-driftwood",
    src: "/photos/area/hilton-head-beach-driftwood.webp",
    width: 1350,
    height: 1800,
    alt: "Pale sand scattered with driftwood twigs, low surf and a clear blue sky.",
    caption: "Driftwood on a quiet stretch of Hilton Head Island beach.",
    creator: "Lilcherylann",
    ...BY_SA_3,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hilton_Head_Island_beach.jpg",
    changes: CHANGES,
    categories: ["beaches"],
  },
  {
    id: "hilton-head-great-blue-heron",
    src: "/photos/area/hilton-head-great-blue-heron.webp",
    width: 1200,
    height: 1800,
    alt: "A great blue heron standing at the water's edge, small waves breaking behind it.",
    caption: "A great blue heron at the water's edge, Hilton Head Island.",
    creator: "Dave Pape",
    ...PD,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Ardea_herodias_1_-_Hilton_Head.jpg",
    changes: CHANGES,
    categories: ["wildlife", "family-fun", "beaches"],
  },
];

const BY_ID = new Map(areaPhotos.map((p) => [p.id, p]));

export function isAreaPhotoId(id: string): id is AreaPhotoId {
  return BY_ID.has(id as AreaPhotoId);
}

/** One area photograph by id. Throws on an unknown id so a typo fails the build, not the page. */
export function areaPhoto(id: AreaPhotoId): AreaPhoto {
  const p = BY_ID.get(id);
  if (!p) throw new Error(`Unknown area photo: ${id}`);
  return p;
}

/** Area photographs tagged with a category, in the order above. */
export function areaPhotosFor(category: AreaPhotoCategory): AreaPhoto[] {
  return areaPhotos.filter((p) => p.categories.includes(category));
}
