import type { PhotoGroup } from "@/lib/photos";

/**
 * The owner shot list (docs/design-system.md 9.4), used to lay out labelled placeholders on
 * /gallery until real photographs arrive. Ratios give the page its rhythm.
 */
export const PLANNED_SHOTS: { group: PhotoGroup; shot: string }[] = [
  { group: "residence", shot: "living area, wide from the entry, with the dining table" },
  { group: "residence", shot: "primary bedroom, king bed, from the door" },
  { group: "residence", shot: "kitchen, the full run of appliances" },
  { group: "residence", shot: "kitchen detail, coffee maker and blender" },
  { group: "residence", shot: "second bedroom, queen and full beds" },
  { group: "residence", shot: "living area, reverse angle toward the bedrooms" },
  { group: "residence", shot: "primary ensuite bath" },
  { group: "residence", shot: "dining table set for four, natural light" },
  { group: "residence", shot: "hall bathroom" },
  { group: "residence", shot: "games and console shelf, detail" },
  { group: "resort", shot: "indoor pool atrium near Building 3" },
  { group: "resort", shot: "outdoor pool" },
  { group: "resort", shot: "Building 3, exterior and entry" },
  { group: "resort", shot: "tennis and pickleball courts" },
  { group: "resort", shot: "sauna, steam room or fitness entry" },
  { group: "beach", shot: "marsh boardwalk at golden hour, looking toward the beach" },
  { group: "beach", shot: "spartina grass from the boardwalk, detail" },
  { group: "beach", shot: "beach chairs in the storage locker" },
  { group: "beach", shot: "the beach at the end of the boardwalk" },
];
