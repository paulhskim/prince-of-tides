import { host } from "@/content/copy";
import { siteConfig } from "@/content/site.config";
import { photoFor } from "@/lib/photos";
import { Grid, SectionTitle } from "../layout";
import { Photo } from "../Photo";
import { isSet, splitHeading } from "../text";

/**
 * A letter from the host. Rendered only once the owner has replaced every placeholder
 * (copy.host.placeholderNote asks that it never be published with placeholders visible).
 */
export function Host() {
  const { contact } = siteConfig;
  if (!isSet(host.body) || !isSet(contact.hostName)) return null;
  const { numeral, title } = splitHeading(host.heading);
  const portrait = photoFor("host");
  return (
    <section aria-labelledby="host-title" className="py-section">
      <Grid className="gap-y-8">
        <div className="col-span-4 border-t border-ink pt-6 md:col-span-8 lg:col-span-12">
          <SectionTitle id="host-title" numeral={numeral}>
            {title}
          </SectionTitle>
        </div>
        {portrait ? (
          <figure className="col-span-2 md:col-span-2 lg:col-span-2">
            <Photo photo={portrait} slot="host" ratio="4/5" sizes="200px" />
          </figure>
        ) : null}
        <div className={`col-span-4 md:col-span-6 lg:col-span-6 ${portrait ? "lg:col-start-4" : "lg:col-start-1"}`}>
          <p className="max-w-measure font-serif text-lead oldstyle">{host.body}</p>
          <p className="mt-6 font-serif text-h3 italic">{contact.hostName}</p>
        </div>
      </Grid>
    </section>
  );
}
