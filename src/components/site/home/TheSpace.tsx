import { theSpace } from "@/content/copy";
import { photoFor } from "@/lib/photos";
import { Grid, MarginLabel } from "../layout";
import { Photo } from "../Photo";
import { sentenceCase, splitHeading } from "../text";

export function TheSpace() {
  const { numeral, title } = splitHeading(theSpace.heading);
  const living = photoFor("living");
  const kitchen = photoFor("kitchen");

  return (
    <section id="the-space" aria-labelledby="space-title" className="py-section">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />

        {/* Left page: two photographs, the second offset and indented */}
        <div className="order-2 col-span-4 mt-12 md:col-span-8 lg:order-1 lg:col-span-6 lg:mt-0">
          <figure>
            <Photo photo={living} slot="living" ratio="3/2" sizes="(min-width:1024px) 46vw, 100vw" />
            {living ? <figcaption className="mt-2 text-caption text-ink-muted">{living.caption}</figcaption> : null}
          </figure>
          <figure className="mt-10 w-3/4 md:w-1/2 lg:ml-[33.4%] lg:mt-24 lg:w-[66.6%]">
            <Photo photo={kitchen} slot="kitchen" ratio="4/5" sizes="(min-width:1024px) 30vw, 75vw" />
            {kitchen ? <figcaption className="mt-2 text-caption text-ink-muted">{kitchen.caption}</figcaption> : null}
          </figure>
        </div>

        {/* Right page */}
        <div className="order-1 col-span-4 md:col-span-8 lg:order-2 lg:col-span-5 lg:col-start-8">
          <MarginLabel numeral={numeral} sticky={false}>
            The space
          </MarginLabel>
          <h2 id="space-title" className="mt-6 text-h2">
            {title}
          </h2>
          <p className="mt-6 max-w-measure font-serif text-lead">{theSpace.intro}</p>

          <div className="mt-8 max-w-measure space-y-[1em] font-serif text-prose">
            {theSpace.rooms.map((room) => (
              <p key={room.name}>
                <span className="font-sans text-body font-medium">{sentenceCase(room.name)}.</span> {room.body}
              </p>
            ))}
          </div>

          <table className="mt-12 w-full text-left text-small">
            <caption className="pb-3 text-left font-sans text-label font-medium">Room by room</caption>
            <thead>
              <tr className="border-b border-ink">
                <th scope="col" className="w-[34%] py-2 pr-4 text-label font-medium text-ink-muted">
                  Room
                </th>
                <th scope="col" className="py-2 text-label font-medium text-ink-muted">
                  Particulars
                </th>
              </tr>
            </thead>
            <tbody>
              {theSpace.rooms.map((room) => (
                <tr key={room.name} className="border-b border-rule align-top">
                  <th scope="row" className="py-3 pr-4 font-medium">
                    {sentenceCase(room.name)}
                  </th>
                  <td className="py-3">
                    <ul>
                      {room.details.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Grid>
    </section>
  );
}
