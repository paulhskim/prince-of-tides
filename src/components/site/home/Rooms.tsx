import Link from "next/link";
import { sleeping, theSpace, type SleepingRoom } from "@/content/copy";
import { getGalleryPhotos, type Photo as PhotoType } from "@/lib/photos";
import { Grid, RunningHead, SectionTitle } from "../layout";
import { Photo } from "../Photo";
import { smart, splitHeading } from "../text";

/** Standard mattress sizes in inches (width, length), used only to draw the beds in proportion. */
const MATTRESS: Record<SleepingRoom["beds"][number]["size"], [number, number]> = {
  king: [76, 80],
  queen: [60, 80],
  full: [54, 75],
};

/**
 * A schematic of the beds in a room, seen from above and drawn to proportion. Deliberately not a
 * floor plan: no walls, doors or windows, because the real layout is not drawn here.
 */
function BedSchematic({ room }: { room: SleepingRoom }) {
  const gap = 22;
  const pad = 18;
  const widths = room.beds.map((b) => MATTRESS[b.size][0]);
  const W = widths.reduce((a, b) => a + b, 0) + gap * (room.beds.length - 1) + pad * 2;
  const H = 80 + pad * 2;
  let x = pad;
  const description = room.beds.map((b) => `one ${b.label.toLowerCase()} bed`).join(" and ");
  return (
    <svg
      role="img"
      aria-label={`Schematic: ${description}, two people to a bed`}
      viewBox={`0 0 ${W} ${H}`}
      className="mx-auto block h-[clamp(8.5rem,6rem+6vw,12rem)] w-auto max-w-full"
      preserveAspectRatio="xMinYMid meet"
    >
      {room.beds.map((b) => {
        const [w, l] = MATTRESS[b.size];
        const bx = x;
        x += w + gap;
        const pw = (w - 14) / 2;
        return (
          <g key={b.size} fill="none" stroke="currentColor" vectorEffect="non-scaling-stroke">
            <rect x={bx} y={pad} width={w} height={l} strokeWidth="1" />
            <rect x={bx + 5} y={pad + 5} width={pw} height={13} strokeWidth="0.75" strokeOpacity="0.75" />
            <rect x={bx + 9 + pw} y={pad + 5} width={pw} height={13} strokeWidth="0.75" strokeOpacity="0.75" />
            {/* The turned-down sheet. */}
            <path d={`M${bx} ${pad + 30} H${bx + w}`} strokeWidth="0.75" strokeOpacity="0.6" />
            <path d={`M${bx} ${pad + 34} H${bx + w}`} strokeWidth="0.5" strokeOpacity="0.35" />
          </g>
        );
      })}
    </svg>
  );
}

function BedroomPlate({ room, n }: { room: SleepingRoom; n: number }) {
  return (
    <article aria-labelledby={`room-${room.id}`} className="flex flex-col border-t border-ink pt-5">
      <p className="smallcaps flex items-baseline justify-between text-ink-muted">
        <span>Bedroom {n}</span>
        <span className="font-serif text-small normal-case italic tracking-normal">
          sleeps <span className="tabular not-italic">{room.sleeps}</span>
        </span>
      </p>
      <h3 id={`room-${room.id}`} className="mt-3 font-serif text-[clamp(1.75rem,1.4rem+1.2vw,2.5rem)] font-light leading-[1.05] tracking-[-0.02em]">
        {room.name}
      </h3>

      <figure className="mt-6 bg-sheet px-5 py-6 text-ink shadow-[inset_0_0_0_1px_var(--color-rule)] sm:px-7">
        <BedSchematic room={room} />
        <figcaption className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          {room.beds.map((b) => (
            <span key={b.size} className="smallcaps">
              {b.label} bed
            </span>
          ))}
          <span className="font-serif text-caption italic text-ink-muted">Beds to proportion. Not a floor plan.</span>
        </figcaption>
      </figure>

      <dl className="mt-6 text-small">
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-4 border-b border-rule py-3">
          <dt className="smallcaps pt-0.5 text-ink-muted">Beds</dt>
          <dd>{room.beds.map((b) => `1 ${b.label.toLowerCase()}`).join(", ")}</dd>
        </div>
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-4 border-b border-rule py-3">
          <dt className="smallcaps pt-0.5 text-ink-muted">Bath</dt>
          <dd>{room.bath}</dd>
        </div>
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-4 border-b border-rule py-3">
          <dt className="smallcaps pt-0.5 text-ink-muted">In the room</dt>
          <dd>{room.features.join(", ")}</dd>
        </div>
        <div className="grid grid-cols-[6.5rem_1fr] gap-x-4 border-b border-rule py-3">
          <dt className="smallcaps pt-0.5 text-ink-muted">Suits</dt>
          <dd className="font-serif text-body italic">{room.suits}</dd>
        </div>
      </dl>
    </article>
  );
}

function CommonRoom({
  name,
  photo,
  body,
  details,
  className = "",
  sizes,
}: {
  name: string;
  photo?: PhotoType;
  body: string;
  details: string[];
  className?: string;
  sizes: string;
}) {
  return (
    <figure data-reveal="room" className={className}>
      {photo ? <Photo photo={photo} slot={photo.slot} ratio="3/2" sizes={sizes} /> : null}
      <figcaption className={photo ? "mt-4" : ""}>
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-ink pb-2">
          <span className="font-serif text-h3 font-light">{name}</span>
          {photo ? <span className="font-serif text-caption italic text-ink-muted">{photo.caption}</span> : null}
        </span>
        <span className="mt-3 block max-w-[34rem] font-serif text-body leading-relaxed oldstyle">{smart(body)}</span>
        <span className="mt-2 block text-small text-ink-muted">{details.join(", ")}</span>
      </figcaption>
    </figure>
  );
}

/**
 * II. The rooms. First the sleeping arrangements, unmistakably: each bedroom with its beds drawn in
 * proportion, who sleeps there, which bath it uses and who it suits. Then the common rooms, with the
 * owner photographs where they exist (bedroom photographs are not yet made, so the schematic stands in
 * rather than an empty frame).
 */
export function Rooms() {
  const { numeral, title } = splitHeading(sleeping.heading);
  const photos = getGalleryPhotos();
  const pick = (file: string, slot: PhotoType["slot"]) => photos.find((p) => p.file === file) ?? photos.find((p) => p.slot === slot);
  const living = theSpace.rooms.find((r) => r.name === "Living");
  const kitchen = theSpace.rooms.find((r) => r.name.startsWith("Kitchen"));
  const livingPhoto = pick("living-lounge.jpg", "living");
  const kitchenPhoto = pick("kitchen.jpg", "kitchen");
  const diningPhoto = pick("dining.jpg", "dining");
  const totalBeds = sleeping.rooms.reduce((n, r) => n + r.beds.length, 0);

  return (
    <section id="rooms" aria-labelledby="rooms-title" className="pb-section-sm pt-section-sm lg:pt-section">
      <Grid className="gap-y-6">
        <div className="col-span-4 md:col-span-8 lg:col-span-12 lg:grid lg:grid-cols-12 lg:gap-x-col">
          <SectionTitle id="rooms-title" numeral={numeral} className="lg:col-span-5">
            {title}
          </SectionTitle>
          <p className="mt-5 max-w-measure font-serif text-lead oldstyle lg:col-span-6 lg:col-start-7 lg:mt-2">{sleeping.intro}</p>
        </div>

        <div className="col-span-4 mt-6 md:col-span-8 lg:col-span-12 lg:mt-10">
          <RunningHead left="Sleeping arrangements" right={sleeping.summary} />
        </div>

        {/* The arithmetic, said once: six guests, three beds, two rooms. */}
        <dl className="col-span-4 grid grid-cols-3 md:col-span-8 lg:col-span-12">
          {[
            { k: "Bedrooms", v: String(sleeping.rooms.length) },
            { k: "Beds", v: String(totalBeds) },
            { k: "Full baths", v: "2" },
          ].map((f, i) => (
            <div key={f.k} className={`flex flex-col-reverse py-2 ${i ? "border-l border-rule pl-4 lg:pl-6" : ""}`}>
              <dt className="smallcaps text-ink-muted">{f.k}</dt>
              <dd className="display-cut text-[clamp(2rem,1.4rem+2vw,3.25rem)] leading-none tabular">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="col-span-4 mt-6 grid gap-x-[clamp(1.5rem,0.5rem+4vw,5rem)] gap-y-14 md:col-span-8 lg:col-span-12 lg:grid-cols-2">
          {sleeping.rooms.map((room, i) => (
            <BedroomPlate key={room.id} room={room} n={i + 1} />
          ))}
        </div>
        <ul className="col-span-4 mt-2 flex flex-wrap gap-x-8 gap-y-1 text-caption text-ink-muted md:col-span-8 lg:col-span-12">
          {sleeping.notes.map((n) => (
            <li key={n}>{smart(n)}</li>
          ))}
        </ul>

        <div className="col-span-4 mt-[clamp(2.5rem,1.5rem+3vw,4.5rem)] md:col-span-8 lg:col-span-12">
          <RunningHead left="The common rooms" right="Living, kitchen and dining" />
        </div>

        {living ? (
          <CommonRoom
            name="The living room"
            photo={livingPhoto}
            body={living.body}
            details={living.details}
            className="col-span-4 mt-6 md:col-span-8 lg:col-span-7"
            sizes="(min-width:1280px) 740px, (min-width:1024px) 58vw, 100vw"
          />
        ) : null}
        {kitchen ? (
          <CommonRoom
            name="The kitchen"
            photo={kitchenPhoto}
            body={kitchen.body}
            details={kitchen.details.slice(0, 4)}
            className="col-span-4 mt-6 md:col-span-8 lg:col-span-5 lg:mt-[clamp(6rem,2rem+8vw,12rem)]"
            sizes="(min-width:1280px) 520px, (min-width:1024px) 40vw, 100vw"
          />
        ) : null}
        <CommonRoom
          name="The dining table"
          photo={diningPhoto}
          body="A white table with four chairs and a bench, under a small chandelier. Somewhere to sit down properly after the kitchen has done its work."
          details={["Four chairs and a bench"]}
          className="col-span-4 mt-6 md:col-span-6 lg:col-span-5 lg:col-start-2 lg:mt-10"
          sizes="(min-width:1280px) 520px, (min-width:1024px) 40vw, 100vw"
        />
        <div className="col-span-4 mt-6 flex flex-col items-start justify-end gap-4 md:col-span-8 lg:col-span-4 lg:col-start-8 lg:mb-24">
          <p className="max-w-[24rem] font-serif text-body italic text-ink-muted">
            Every photograph is of the residence itself, shown whole, as the owner supplied it.
          </p>
          <Link href="/gallery" className="link-caps">
            All photographs of the residence
          </Link>
        </div>
      </Grid>
    </section>
  );
}
