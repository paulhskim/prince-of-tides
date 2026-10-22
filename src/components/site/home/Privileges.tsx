import { privileges, type Privilege } from "@/content/experiences";
import { resort } from "@/content/copy";
import { photoFor } from "@/lib/photos";
import { Grid, SectionTitle } from "../layout";
import { Crest } from "../Monogram";
import { Photo } from "../Photo";
import { smart, splitHeading } from "../text";

/** The resort's shared amenities, grouped the way a guest uses them. Ids from experiences.ts. */
const GROUPS: { title: string; ids: string[] }[] = [
  { title: "Warm water and heat", ids: ["indoor-pool", "hot-tub", "sauna", "steam", "outdoor-pools"] },
  { title: "Movement", ids: ["fitness", "track", "courts", "volleyball"] },
  { title: "The way to the sea", ids: ["boardwalk", "shuttle"] },
  { title: "Security", ids: ["gate"] },
  { title: "Food and drink, purchased on site", ids: ["cocos", "deli"] },
];

/**
 * III. Guest privileges: the resort's shared amenities set as a card of record, under the crest.
 * Only the real list (experiences.ts privileges, from docs/BRIEF.md), and plainly framed: they are
 * Hilton Head Resort's, shared and HOA run, open to guests of the residence. Nothing is "included"
 * that is sold (Coco's and the deli are listed as places to buy food and drink). Beside the card, the
 * owner's photograph of the indoor atrium at night, captioned as the atrium (not the pool itself).
 */
export function Privileges() {
  const { numeral, title } = splitHeading(resort.heading);
  const byId = new Map(privileges.map((p) => [p.id, p]));
  const groups = GROUPS.map((g) => ({ ...g, items: g.ids.map((id) => byId.get(id)).filter((p): p is Privilege => !!p) })).filter(
    (g) => g.items.length,
  );
  const grouped = new Set(GROUPS.flatMap((g) => g.ids));
  const rest = privileges.filter((p) => !grouped.has(p.id));
  const atrium = photoFor("pool");
  if (rest.length) groups.push({ title: "Also at the resort", ids: [], items: rest });

  return (
    <section id="privileges" aria-labelledby="privileges-title" className="bg-stone py-section">
      <Grid className="gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <SectionTitle id="privileges-title" numeral={numeral}>
            {title}
          </SectionTitle>
          <p className="mt-8 max-w-measure font-serif text-lead oldstyle">{smart(resort.intro)}</p>
          <p className="mt-8 border-t border-ink pt-4 font-serif text-[clamp(1.375rem,1.15rem+0.8vw,1.75rem)] font-light italic leading-snug">
            The heated indoor pool, the sauna and the steam room are a few steps from the door.
          </p>
          {atrium ? (
            <figure data-reveal="plate" className="mt-8 md:w-2/3 lg:w-full">
              <Photo photo={atrium} slot="pool" ratio="native" sizes="(min-width:1280px) 380px, (min-width:1024px) 30vw, (min-width:768px) 60vw, 100vw" />
              <figcaption className="mt-2 font-serif text-caption italic text-ink-muted">{atrium.caption}</figcaption>
            </figure>
          ) : null}
          <p className="mt-6 max-w-[24rem] text-caption text-ink-muted">{smart(resort.footnote)}</p>
        </div>

        {/* The card of record: a cream sheet in a double hairline frame, under the crest. */}
        <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
          <div className="bg-sheet p-1.5 shadow-[0_0_0_1px_var(--color-rule-strong)]">
            <div className="px-[clamp(1.25rem,0.5rem+3vw,3rem)] py-[clamp(1.75rem,1rem+3vw,3.25rem)] shadow-[inset_0_0_0_1px_var(--color-rule)]">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4 border-b border-ink pb-6">
                <Crest size={88} id="privileges-crest" className="text-brass" />
                <div>
                  <p className="smallcaps text-brass">For guests of Prince of Tides</p>
                  <p className="mt-2 font-serif text-[clamp(1.5rem,1.2rem+1.1vw,2.125rem)] font-light leading-tight tracking-[-0.015em]">
                    The privileges of the resort
                  </p>
                </div>
              </div>

              <div className="mt-2 grid gap-x-[clamp(1.5rem,1rem+2vw,3rem)] md:grid-cols-2">
                {groups.map((g) => (
                  <div key={g.title} className="break-inside-avoid pt-6">
                    <h3 className="smallcaps text-ink-muted">{g.title}</h3>
                    <ul className="mt-2">
                      {g.items.map((p) => (
                        <li key={p.id} className="border-b border-rule py-3">
                          <span className="block font-serif text-[1.1875rem] leading-snug">{p.name}</span>
                          <span className="mt-0.5 block text-small text-ink-muted">{smart(p.line)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Grid>
    </section>
  );
}
