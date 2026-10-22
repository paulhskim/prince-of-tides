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

function BedroomPlate({ room, n, photo, className = "" }: { room: SleepingRoom; n: number; photo?: PhotoType; className?: string }) {
  return (
    <article aria-labelledby={`room-${room.id}`} className={`flex flex-col border-t border-ink pt-5 ${className}`}>
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

      {/* The owner's photograph of the room, where one exists. Without one the schematic stands alone: no empty frame. */}
      {photo ? (
        <figure data-reveal="room" className="mt-8">
          <Photo photo={photo} slot={photo.slot} ratio="native" sizes="(min-width:1280px) 560px, (min-width:1024px) 45vw, 100vw" />
          <figcaption className="mt-2 font-serif text-caption italic text-ink-muted">{photo.caption}</figcaption>
        </figure>
      ) : null}
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
      {photo ? <Photo photo={photo} slot={photo.slot} ratio="native" sizes={sizes} /> : null}
      <figcaption className={photo ? "mt-4" : ""}>
        <span className="flex flex-wrap items-baseline justify-between gap-x-4 border-b border-ink pb-2">
          <span className="font-serif text-h3 font-light">{name}</span>
          {photo && photo.caption.toLowerCase() !== name.toLowerCase() ? (
            <span className="font-serif text-caption italic text-ink-muted">{photo.caption}</span>
          ) : null}
        </span>
        <span className="mt-3 block max-w-[34rem] font-serif text-body leading-relaxed oldstyle">{smart(body)}</span>
        <span className="mt-2 block text-small text-ink-muted">{details.join(", ")}</span>
      </figcaption>
    </figure>
  );
}

/**
 * The two full baths, set as a short note with the owner's photograph of one of them. Which bath the
 * photograph shows is not recorded, so the caption says only that it is one of the two.
 */
function Baths({ photo, className = "" }: { photo?: PhotoType; className?: string }) {
  return (
    <article aria-labelledby="room-baths" className={`border-t border-ink pt-5 ${className}`}>
      <p className="smallcaps flex items-baseline justify-between text-ink-muted">
        <span>The baths</span>
        <span className="font-serif text-small normal-case italic tracking-normal">
          <span className="tabular not-italic">2</span> full
        </span>
      </p>
      <h3 id="room-baths" className="mt-3 font-serif text-[clamp(1.5rem,1.3rem+0.8vw,2rem)] font-light leading-[1.05] tracking-[-0.02em]">
        Two full baths
      </h3>
      <p className="mt-3 max-w-[30rem] font-serif text-body leading-relaxed oldstyle">
        Each has a single vanity and a shower over the tub. One is the primary bedroom&rsquo;s ensuite; the other is the hall bath, used by the
        second bedroom.
      </p>
      {photo ? (
        <figure data-reveal="room" className="mt-6 sm:w-5/6">
          <Photo photo={photo} slot={photo.slot} ratio="native" sizes="(min-width:1280px) 460px, (min-width:1024px) 38vw, (min-width:640px) 83vw, 100vw" />
          <figcaption className="mt-2 font-serif text-caption italic text-ink-muted">{photo.caption}, one of the two</figcaption>
        </figure>
      ) : null}
    </article>
  );
}

/**
 * II. The rooms. First the sleeping arrangements, unmistakably: each bedroom with its beds drawn in
 * proportion, who sleeps there, which bath it uses and who it suits, with the owner's photograph
 * where one exists (the second bedroom and one bath so far; the primary bedroom has none yet, so its
 * schematic stands alone rather than beside an empty frame). Then the common rooms, each photograph
 * shown whole at its own 4:3.
 */
export function Rooms() {
  const { numeral, title } = splitHeading(sleeping.heading);
  const photos = getGalleryPhotos();
  const pick = (file: string, slot: PhotoType["slot"]) => photos.find((p) => p.file === file) ?? photos.find((p) => p.slot === slot);
  const living = theSpace.rooms.find((r) => r.name === "Living");
  const kitchen = theSpace.rooms.find((r) => r.name.startsWith("Kitchen"));
  const livingPhoto = pick("living-room.jpg", "living");
  const kitchenPhoto = pick("kitchen-appliances.jpg", "kitchen");
  const diningPhoto = pick("dining-kitchen.jpg", "dining");
  const roomPhotos: Record<string, PhotoType | undefined> = {
    primary: photos.find((p) => p.slot === "bedroom1"),
    second: photos.find((p) => p.slot === "bedroom2"),
  };
  const bathPhoto = photos.find((p) => p.slot === "bath");
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

        {/*
          lg: the two bedrooms side by side, so the schematics and ledgers align and compare; the second
          bedroom's photograph hangs below its ledger, and the baths take the space below the first.
          Below lg they read in order: bedroom, bedroom, baths.
        */}
        <div className="col-span-4 mt-6 grid gap-x-[clamp(1.5rem,0.5rem+4vw,5rem)] gap-y-14 md:col-span-8 lg:col-span-12 lg:grid-cols-2 lg:grid-rows-[auto_1fr]">
          {sleeping.rooms.map((room, i) => (
            <BedroomPlate
              key={room.id}
              room={room}
              n={i + 1}
              photo={roomPhotos[room.id]}
              className={i === 0 ? "lg:col-start-1 lg:row-start-1" : "lg:col-start-2 lg:row-span-2 lg:row-start-1"}
            />
          ))}
          <Baths photo={bathPhoto} className="lg:col-start-1 lg:row-start-2 lg:self-start" />
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
          body="A white table with four chairs, under a small chandelier. Somewhere to sit down properly after the kitchen has done its work."
          details={["Table with four chairs"]}
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
