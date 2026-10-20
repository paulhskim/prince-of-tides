import Image from "next/image";
import { areaPhoto, type AreaPhotoId } from "@/lib/area-photos";

/**
 * An area photograph with its caption and license credit, as a print figure.
 *
 * Server component (no client code). Every area photograph on the site should go through this,
 * because the licenses require the credit line: creator linked to the source, license name linked
 * to the license. The resizing note lives on /credits.
 *
 *   <CreditedPhoto id="harbour-town-lighthouse" sizes="(min-width:1024px) 50vw, 100vw" />
 *
 * ratio: "native" (default) shows the whole frame at its own proportions. A fixed ratio frames it
 * with object-cover; choose one close to the original so nothing it depicts is lost.
 */

export type CreditedPhotoRatio = "native" | "3/2" | "4/3" | "4/5" | "3/4" | "1/1" | "16/9" | "16/10" | "21/9";

export interface CreditedPhotoProps {
  id: AreaPhotoId;
  sizes: string;
  ratio?: CreditedPhotoRatio;
  priority?: boolean;
  className?: string;
  captionPosition?: "below" | "side";
  /** "dark" for night passages (pluff backgrounds). */
  tone?: "light" | "dark";
}

export function CreditedPhoto({
  id,
  sizes,
  ratio = "native",
  priority = false,
  className = "",
  captionPosition = "below",
  tone = "light",
}: CreditedPhotoProps) {
  const p = areaPhoto(id);
  const caption = tone === "dark" ? "text-on-dark" : "text-ink";
  const muted = tone === "dark" ? "text-on-dark-muted" : "text-ink-muted";
  const side = captionPosition === "side";

  const image =
    ratio === "native" ? (
      <Image
        src={p.src}
        alt={p.alt}
        width={p.width}
        height={p.height}
        sizes={sizes}
        priority={priority}
        fetchPriority={priority ? "high" : undefined}
        quality={72}
        className="block h-auto w-full bg-stone"
      />
    ) : (
      <div className="relative w-full overflow-hidden bg-stone" style={{ aspectRatio: ratio.replace("/", " / ") }}>
        <Image
          src={p.src}
          alt={p.alt}
          fill
          sizes={sizes}
          priority={priority}
          fetchPriority={priority ? "high" : undefined}
          quality={72}
          className="object-cover"
        />
      </div>
    );

  return (
    <figure
      className={`${side ? "grid gap-x-col gap-y-3 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-end" : ""} ${className}`}
    >
      {image}
      <figcaption className={side ? "lg:pb-1" : "mt-3"}>
        <p className={`font-serif text-small italic leading-snug ${caption}`}>{p.caption}</p>
        <p className={`smallcaps mt-1.5 ${muted}`}>
          Photograph:{" "}
          <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" className="decoration-current/40">
            {p.creator}
          </a>
          ,{" "}
          <a href={p.licenseUrl} target="_blank" rel="noopener noreferrer license" className="decoration-current/40">
            {p.license}
          </a>
        </p>
      </figcaption>
    </figure>
  );
}
