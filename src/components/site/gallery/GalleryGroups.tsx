"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { frame, roman } from "../text";

export type Frame = {
  n: number;
  /** Absent for a planned shot that has not been photographed yet. */
  src?: string;
  alt: string;
  caption: string;
  /** Pixel size, so the frame is drawn at the photograph's own ratio. */
  width?: number;
  height?: number;
};

export type FrameGroup = { id: string; label: string; frames: Frame[] };

const Lightbox = dynamic(() => import("./Lightbox").then((m) => m.Lightbox), { ssr: false });

/**
 * Editorial rhythm (lg 12 cols, md 8). Every photograph is shown whole at its own ratio (the owner's
 * are 4:3, and two are 3:4 portraits); the rhythm comes from width and placement, never from
 * cropping. Landscape frames follow a six-step rhythm; portrait frames are set narrower, in
 * staggered pairs, so they are shown whole without towering.
 */
const RHYTHM = [
  { cls: "md:col-span-8 lg:col-span-8" },
  { cls: "md:col-span-5 md:col-start-4 lg:col-span-4 lg:col-start-9 lg:self-end" },
  { cls: "md:col-span-5 lg:col-span-5 lg:col-start-2" },
  { cls: "md:col-span-6 md:col-start-3 lg:col-span-6 lg:col-start-7 lg:mt-32" },
  { cls: "md:col-span-8 lg:col-span-10 lg:col-start-2" },
  { cls: "md:col-span-6 lg:col-span-7 lg:col-start-4" },
];
const PORTRAIT_RHYTHM = [
  { cls: "md:col-span-4 lg:col-span-5 lg:col-start-2" },
  { cls: "md:col-span-4 md:col-start-5 md:mt-24 lg:col-span-4 lg:col-start-8 lg:mt-40" },
];
const RATIO = "aspect-[3/2]";

const isTall = (f: Frame) => !!f.width && !!f.height && f.height > f.width;

/** Layout class per frame: landscape and portrait frames each keep their own rhythm. */
function layout(frames: Frame[]): string[] {
  let land = 0;
  let tall = 0;
  return frames.map((f) => (isTall(f) ? PORTRAIT_RHYTHM[tall++ % PORTRAIT_RHYTHM.length].cls : RHYTHM[land++ % RHYTHM.length].cls));
}

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
            <div className="col-span-4 mb-10 flex items-baseline justify-between gap-4 border-t border-ink pt-5 md:col-span-8 lg:col-span-12 lg:mb-14">
              <h2 id={`${g.id}-title`} className="font-serif text-h2 font-light">
                {g.label}
              </h2>
              <p className="smallcaps text-ink-muted">
                Plates {roman(g.frames[0].n)} to {roman(g.frames[g.frames.length - 1].n)}
              </p>
            </div>
            {g.frames.some((f) => f.src) ? (
            <ul className="col-span-4 grid grid-cols-4 gap-x-col gap-y-12 md:col-span-8 md:grid-cols-8 lg:col-span-12 lg:grid-cols-12 lg:gap-y-20">
              {g.frames.map((f, i) => {
                const cls = layout(g.frames)[i];
                const label = `${frame(f.n)}`;
                const native = f.width && f.height ? `${f.width} / ${f.height}` : undefined;
                return (
                  <li key={f.n} id={`frame-${label}`} className={`col-span-4 ${cls} scroll-mt-36`}>
                    <figure data-reveal="plate">
                      {f.src ? (
                        <button
                          type="button"
                          ref={(el) => {
                            if (el) triggers.current.set(f.n, el);
                          }}
                          onClick={() => openAt(f.n)}
                          aria-label={`Open photograph ${label}: ${f.alt}`}
                          className={`relative block w-full overflow-hidden bg-stone ${native ? "" : RATIO}`}
                          style={native ? { aspectRatio: native } : undefined}
                        >
                          <Image
                            src={f.src}
                            alt=""
                            fill
                            quality={70}
                            sizes="(min-width:1280px) 1200px, (min-width:1024px) 90vw, 100vw"
                            className="object-cover"
                          />
                        </button>
                      ) : (
                        <Plate n={f.n} caption={f.caption} ratio={RATIO} />
                      )}
                      <figcaption className="mt-4">
                        <span className="smallcaps block text-brass">Plate {roman(f.n)}</span>
                        <span className="mt-1 block font-serif text-body italic leading-snug text-ink-muted">{f.caption}</span>
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
