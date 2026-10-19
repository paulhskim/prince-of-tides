import { host } from "@/content/copy";
import { siteConfig } from "@/content/site.config";
import { photoFor } from "@/lib/photos";
import { Grid, MarginLabel } from "../layout";
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
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />
        <div className="col-span-4 md:col-span-3 lg:col-span-3">
          {portrait ? (
            <figure className="mb-4 w-[200px] max-w-full">
              <Photo photo={portrait} slot="host" ratio="4/5" sizes="200px" />
            </figure>
          ) : null}
          <MarginLabel numeral={numeral} sticky={false}>
            From the host
          </MarginLabel>
        </div>
        <div className="col-span-4 mt-6 md:col-span-5 lg:col-span-6 lg:col-start-4 lg:mt-0">
          <h2 id="host-title" className="text-h2">
            {title}
          </h2>
          <p className="mt-6 max-w-measure font-serif text-prose">{host.body}</p>
          <p className="mt-6 font-serif text-h3 italic">{contact.hostName}</p>
        </div>
      </Grid>
    </section>
  );
}
