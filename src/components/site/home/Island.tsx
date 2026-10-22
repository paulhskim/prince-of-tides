import Link from "next/link";
import { CreditedPhoto } from "@/components/area/CreditedPhoto";
import { experiences, type Experience } from "@/content/experiences";
import { OwnerFigure } from "../OwnerFigure";
import { Grid, RunningHead, SectionTitle } from "../layout";
import { roman, smart } from "../text";

function how(e: Experience): string {
  if (e.approxDriveMinutes !== null) return `Approx. ${e.approxDriveMinutes} min drive`;
  return e.access ?? "";
}

/** The lead experience and the three that follow it on the home page; the rest are listed by name. */
const LEAD = "beach-evening";
const TRIO = ["dolphins", "pinckney", "harbour-town"];

/**
 * IV. The island: a night passage of photographs. The lead, the beach at the end of the resort's
 * boardwalk, is the owner's own photograph (OwnerFigure), because the owner has photographed it. The
 * rest are credited Creative Commons photographs of places elsewhere on Hilton Head Island, never of
 * the residence or the resort, and every one carries its credit line (CreditedPhoto). One lead plate
 * with its text beside it, three smaller plates in a row, then the remaining experiences as a short
 * directory leading to the area guide.
 */
export function Island() {
  const lead = experiences.find((e) => e.id === LEAD);
  const trio = TRIO.map((id) => experiences.find((e) => e.id === id)).filter((e): e is Experience => !!e && !!e.photoId);
  const shown = new Set([LEAD, ...TRIO]);
  const others = experiences.filter((e) => !shown.has(e.id));

  return (
    <section
      id="island"
      data-surface="dark"
      aria-labelledby="island-title"
      className="bg-pluff pb-section pt-section text-on-dark [&_a]:decoration-on-dark-muted"
    >
      <Grid className="gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-12">
          <RunningHead tone="dark" left="Around the island" right="The beach is the owner’s photograph; the island’s are credited" />
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-7">
          <SectionTitle id="island-title" numeral="IV" tone="dark">
            The island
          </SectionTitle>
        </div>
        <p className="col-span-4 max-w-measure font-serif text-lead text-on-dark-muted oldstyle md:col-span-8 lg:col-span-4 lg:col-start-9 lg:self-end">
          Hilton Head is mostly water, marsh and light. These are the reasons to leave the pool, in roughly the order guests do.
        </p>

        {lead && (lead.ownerPhoto || lead.photoId) ? (
          <article aria-labelledby={`isl-${lead.id}`} className="col-span-4 mt-6 grid gap-x-col gap-y-6 md:col-span-8 lg:col-span-12 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8" data-reveal="plate">
              {lead.ownerPhoto ? (
                <OwnerFigure file={lead.ownerPhoto} tone="dark" sizes="(min-width:1280px) 840px, (min-width:1024px) 66vw, 100vw" />
              ) : (
                <CreditedPhoto id={lead.photoId!} tone="dark" sizes="(min-width:1280px) 840px, (min-width:1024px) 66vw, 100vw" />
              )}
            </div>
            <div className="lg:col-span-4 lg:pb-16">
              <ExperienceText e={lead} n={1} large />
            </div>
          </article>
        ) : null}

        <ol className="col-span-4 mt-10 grid gap-x-col gap-y-14 md:col-span-8 md:grid-cols-2 lg:col-span-12 lg:mt-16 lg:grid-cols-3">
          {trio.map((e, i) => (
            <li key={e.id} aria-labelledby={`isl-${e.id}`} className={i === 1 ? "lg:mt-20" : i === 2 ? "lg:mt-8" : ""}>
              <div data-reveal="plate">
                <CreditedPhoto id={e.photoId!} tone="dark" ratio="4/3" sizes="(min-width:1280px) 400px, (min-width:768px) 45vw, 100vw" />
              </div>
              <div className="mt-6">
                <ExperienceText e={e} n={i + 2} />
              </div>
            </li>
          ))}
        </ol>

        <div className="col-span-4 mt-10 md:col-span-8 lg:col-span-12 lg:mt-16">
          <h3 className="smallcaps border-b border-on-dark/60 pb-2 text-on-dark-muted">Also on the island</h3>
          <ul className="grid gap-x-col md:grid-cols-2 lg:grid-cols-4">
            {others.map((e) => (
              <li key={e.id} className="border-b border-on-dark/20 py-4">
                <span className="smallcaps block text-brass-light">{e.kicker}</span>
                <span className="mt-1.5 block font-serif text-[1.1875rem] leading-snug">{smart(e.title)}</span>
                <span className="mt-1 block text-small text-on-dark-muted">{smart(how(e) || e.place)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
            <p className="font-serif text-body italic text-on-dark-muted">Every place in full, with distances from the gate.</p>
            <Link href="/area" className="btn btn-on-dark">
              The area guide
            </Link>
          </div>
        </div>
      </Grid>
    </section>
  );
}

function ExperienceText({ e, n, large = false }: { e: Experience; n: number; large?: boolean }) {
  const way = how(e);
  return (
    <>
      <p className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-serif text-body italic text-brass-light">
          {roman(n)}
        </span>
        <span className="smallcaps text-on-dark-muted">{e.kicker}</span>
      </p>
      <h3
        id={`isl-${e.id}`}
        className={`mt-3 font-serif font-light leading-[1.08] tracking-[-0.018em] ${large ? "text-[clamp(1.875rem,1.4rem+1.8vw,2.875rem)]" : "text-[clamp(1.5rem,1.3rem+0.7vw,1.875rem)]"}`}
      >
        {smart(e.title)}
      </h3>
      <p className={`mt-4 font-serif oldstyle text-on-dark/90 ${large ? "text-prose" : "text-body leading-relaxed"}`}>{smart(e.body)}</p>
      {way ? <p className="smallcaps mt-4 text-on-dark-muted">{smart(way)}</p> : null}
    </>
  );
}
