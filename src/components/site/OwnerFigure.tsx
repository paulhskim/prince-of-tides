import { getPhotos } from "@/lib/photos";
import { Photo } from "./Photo";

/**
 * An owner photograph set as a print figure, to sit among credited area photographs (CreditedPhoto)
 * when the owner has photographed the same subject at the resort. Shown whole at its native ratio,
 * with its manifest caption and the line "The owner's photograph" where an area photograph would
 * carry its license credit. Server only (reads public/photos). Renders nothing if the file is absent.
 */
export function OwnerFigure({
  file,
  sizes,
  tone = "light",
  className = "",
}: {
  file: string;
  sizes: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const photo = getPhotos().find((p) => p.file === file);
  if (!photo) return null;
  return (
    <figure className={className}>
      <Photo photo={photo} slot={photo.slot} ratio="native" sizes={sizes} />
      <figcaption className="mt-3">
        <p className={`font-serif text-small italic leading-snug ${tone === "dark" ? "text-on-dark" : "text-ink"}`}>{photo.caption}</p>
        <p className={`smallcaps mt-1.5 ${tone === "dark" ? "text-on-dark-muted" : "text-ink-muted"}`}>The owner&rsquo;s photograph</p>
      </figcaption>
    </figure>
  );
}
