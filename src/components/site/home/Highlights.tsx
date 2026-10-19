import { highlights } from "@/content/copy";
import { photoFor } from "@/lib/photos";
import { Grid } from "../layout";
import { Photo } from "../Photo";

export function Highlights() {
  const photo = photoFor("pool");
  return (
    <section aria-labelledby="highlights-title" className="py-section">
      <Grid className="items-start">
        <figure className="col-span-4 md:col-span-5 lg:sticky lg:top-36 lg:col-span-5">
          <Photo photo={photo} slot="pool" ratio="4/5" sizes="(min-width:1024px) 40vw, 100vw" />
          {photo ? <figcaption className="mt-2 text-caption text-ink-muted">{photo.caption}</figcaption> : null}
        </figure>
        <div className="col-span-4 mt-12 md:col-span-8 lg:col-span-6 lg:col-start-7 lg:mt-0">
          <h2 id="highlights-title" className="font-sans text-label font-medium text-ink-muted">
            {highlights.heading}
          </h2>
          <dl className="mt-3 border-t border-ink">
            {highlights.items.map((item) => (
              <div key={item.title} className="grid gap-x-col gap-y-1 border-b border-rule py-5 md:grid-cols-6">
                <dt className="font-serif text-[1.3125rem] leading-snug md:col-span-3">{item.title}</dt>
                <dd className="text-small md:col-span-3">{item.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Grid>
    </section>
  );
}
