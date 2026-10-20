"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { frame } from "../text";

export type Frame = {
  n: number;
  /** Absent for a planned shot that has not been photographed yet. */
  src?: string;
  alt: string;
  caption: string;
};

export type FrameGroup = { id: string; label: string; frames: Frame[] };

const Lightbox = dynamic(() => import("./Lightbox").then((m) => m.Lightbox), { ssr: false });

/**
 * Editorial rhythm, repeating every six frames. Each entry: grid placement (lg 12 cols, md 8)
 * and aspect ratio. Wide landscapes alternate with offset portraits.
 */
const RHYTHM = [
  { cls: "md:col-span-8 lg:col-span-8", ratio: "aspect-[3/2]" },
  { cls: "md:col-span-4 lg:col-span-4 lg:self-end", ratio: "aspect-[4/5]" },
  { cls: "md:col-span-4 lg:col-span-4 lg:col-start-2", ratio: "aspect-[4/5]" },
  { cls: "md:col-span-4 lg:col-span-6 lg:col-start-7 lg:mt-32", ratio: "aspect-[3/2]" },
  { cls: "md:col-span-8 lg:col-span-12", ratio: "aspect-[16/9]" },
  { cls: "md:col-span-4 lg:col-span-5 lg:col-start-4", ratio: "aspect-[4/5]" },
];

export function GalleryGroups({ groups }: { groups: FrameGroup[] }) {
  const all = groups.flatMap((g) => g.frames).filter((f) => f.src);
  const [index, setIndex] = useState<number | null>(null);
  const triggers = useRef(new Map<number, HTMLButtonElement>());
  const opener = useRef<number | null>(null);

  const openAt = (n: number) => {
    const i = all.findIndex((f) => f.n === n);
    if (i >= 0) {
      opener.current = n;
      setIndex(i);
    }
  };

  const close = useCallback(() => {
    setIndex(null);
    // Return focus to the thumbnail that opened the lightbox.
    const n = opener.current;
    requestAnimationFrame(() => (n !== null ? triggers.current.get(n)?.focus() : undefined));
  }, []);

  return (
    <>
      {groups.map((g) => (
        <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="py-section-sm">
          <div className="mx-auto grid max-w-page grid-cols-4 gap-x-col px-gutter md:grid-cols-8 lg:grid-cols-12">
            <div aria-hidden="true" className="col-span-full mb-6 border-t border-ink" />
            <div className="col-span-4 mb-8 flex items-baseline justify-between md:col-span-8 lg:col-span-12">
              <h2 id={`${g.id}-title`} className="text-h3">
                {g.label}
              </h2>
              <p className="text-caption text-ink-muted tabular">
                {frame(g.frames[0].n)} to {frame(g.frames[g.frames.length - 1].n)}
              </p>
            </div>
            {g.frames.some((f) => f.src) ? (
            <ul className="col-span-4 grid grid-cols-4 gap-x-col gap-y-10 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:grid-cols-12 lg:gap-y-16">
              {g.frames.map((f, i) => {
                const r = RHYTHM[i % RHYTHM.length];
                const label = `${frame(f.n)}`;
                return (
                  <li key={f.n} id={`frame-${label}`} className={`col-span-4 ${r.cls} scroll-mt-36`}>
                    <figure>
                      {f.src ? (
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) triggers.current.set(f.n, el);
                          }}
                          onClick={() => openAt(f.n)}
                          aria-label={`Open photograph ${label}: ${f.alt}`}
                          className={`relative block w-full overflow-hidden bg-stone ${r.ratio}`}
                        >
                          <Image
                            src={f.src}
                            alt=""
                            fill
                            quality={70}
                            sizes="(min-width:1024px) 60vw, 100vw"
                            className="object-cover"
                          />
                        </button>
                      ) : (
                        <Plate n={f.n} caption={f.caption} ratio={r.ratio} />
                      )}
                      <figcaption className="mt-2 grid grid-cols-[2.5rem_1fr] text-caption text-ink-muted">
                        <span className="tabular">{label}</span>
                        <span>{f.caption}</span>
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ul>
            ) : (
              /* No photographs yet: a list of plates, small and dense, like a catalogue in preparation. */
              <ol className="col-span-4 grid grid-cols-2 gap-x-col gap-y-8 md:col-span-8 md:grid-cols-4 lg:col-span-12 lg:grid-cols-6">
                {g.frames.map((f) => (
                  <li key={f.n} id={`frame-${frame(f.n)}`} className="scroll-mt-36">
                    <figure>
                      <Plate n={f.n} caption={f.caption} ratio="aspect-[4/3]" />
                      <figcaption className="mt-2 text-caption text-ink-muted">{f.caption}</figcaption>
                    </figure>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>
      ))}

      {index !== null ? (
        <Lightbox
          frames={all.map((f) => ({ src: f.src as string, alt: f.alt, caption: f.caption, n: f.n }))}
          index={index}
          onIndex={setIndex}
          onClose={close}
        />
      ) : null}
    </>
  );
}

/** A reserved plate: the frame number, set like a plate number in a book, on a stone field. */
function Plate({ n, caption, ratio }: { n: number; caption: string; ratio: string }) {
  return (
    <div role="img" aria-label={`Photograph to come: ${caption}`} data-placeholder="gallery" className={`photo-placeholder ${ratio}`}>
      <span aria-hidden="true" className="absolute left-3 top-2.5 font-serif text-h3 text-ink-muted tabular">
        {frame(n)}
      </span>
      <span aria-hidden="true" className="absolute bottom-2.5 left-3 text-caption text-ink-muted">
        To come
      </span>
    </div>
  );
}
