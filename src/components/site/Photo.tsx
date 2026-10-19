import Image from "next/image";
import type { Photo as PhotoType, PhotoSlot } from "@/lib/photos";
import { SLOTS } from "@/lib/photos";

type Ratio = "4/5" | "3/2" | "3/4" | "16/9" | "21/9" | "16/10" | "4/3" | "1/1";

const RATIO_CLASS: Record<Ratio, string> = {
  "4/5": "aspect-[4/5]",
  "3/2": "aspect-[3/2]",
  "3/4": "aspect-[3/4]",
  "16/9": "aspect-[16/9]",
  "21/9": "aspect-[21/9]",
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-square",
};

/**
 * A photograph in a fixed-ratio frame, or the stone placeholder naming the intended shot.
 * `ratio` may be a responsive class string instead of a fixed ratio.
 */
export function Photo({
  photo,
  slot,
  ratio,
  ratioClass,
  sizes,
  priority = false,
  className = "",
  imgClassName = "",
  placeholderLabel,
  quiet = false,
}: {
  photo?: PhotoType;
  slot: PhotoSlot;
  ratio?: Ratio;
  ratioClass?: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  placeholderLabel?: string;
  /** Show only "Photograph to come" in the frame when a caption below already names the shot. */
  quiet?: boolean;
}) {
  const frameClass = ratioClass ?? RATIO_CLASS[ratio ?? "3/2"];
  if (!photo) {
    const shot = placeholderLabel ?? SLOTS[slot].shot;
    return (
      <div
        data-placeholder={slot}
        role="img"
        aria-label={`Photograph to come: ${shot}`}
        className={`photo-placeholder ${frameClass} ${className}`}
      >
        <span className="absolute bottom-3 left-3 right-3 text-caption text-ink-muted">
          {quiet ? "Photograph to come" : `Photograph to come: ${shot}`}
        </span>
      </div>
    );
  }
  return (
    <div className={`relative overflow-hidden bg-stone ${frameClass} ${className}`}>
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        quality={70}
        className={`object-cover ${imgClassName}`}
      />
    </div>
  );
}
