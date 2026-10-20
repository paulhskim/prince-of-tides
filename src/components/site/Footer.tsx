import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footer, hero } from "@/content/copy";
import { siteConfig } from "@/content/site.config";
import { Grid, NameSet } from "./layout";
import { Crest } from "./Monogram";
import { NAV, RESERVE } from "./nav";
import { isSet } from "./text";

/** The footer mirrors the masthead: the four sections in the same order, then the planning pages. */
const STAY = NAV.map(({ label, href }) => ({ label, href }));

const PLAN = [
  { label: "Reserve by request", href: RESERVE.href },
  { label: "The arrival dossier", href: "/#arrival" },
  { label: "Photographs", href: "/gallery" },
  { label: "Area guide", href: "/area" },
  { label: "Questions", href: "/faq" },
];

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="smallcaps text-brass-light">{title}</h2>
      <ul className="mt-4">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-9 items-center font-serif text-[1.0625rem] no-underline decoration-on-dark-muted hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { contact, links, brand } = siteConfig;
  const listings = [
    { label: "Airbnb", href: links.airbnbUrl },
    { label: "Vrbo", href: links.vrboUrl },
  ].filter((l) => isSet(l.href));
  const year = new Date().getFullYear();

  return (
    <footer data-surface="dark" className="bg-pluff pb-10 pt-section text-on-dark [&_a]:decoration-on-dark-muted">
      <Grid className="gap-y-12">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <Crest size={104} id="footer-crest" className="text-brass-light" />
          <p className="mt-6 font-serif text-[2.25rem] font-light leading-none tracking-[-0.02em]">
            <NameSet name={brand.name} />
          </p>
          <p className="mt-4 max-w-[22rem] text-small text-on-dark-muted">
            {hero.eyebrow}, Hilton Head Island, South Carolina
          </p>
          <p className="mt-8 font-serif text-lead font-light italic">{footer.tagline}</p>
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-6">
          <Column title="The stay" links={STAY} />
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-2">
          <Column title="Plan" links={PLAN} />
        </div>
        <div className="col-span-4 md:col-span-4 lg:col-span-3 lg:col-start-10">
          <h2 className="smallcaps text-brass-light">Contact</h2>
          <ul className="mt-4 space-y-1 text-small">
            {isSet(contact.hostName) ? <li>{contact.hostName}</li> : null}
            {isSet(contact.email) ? (
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            ) : null}
            {isSet(contact.phone) ? (
              <li>
                <a href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}>{contact.phone}</a>
              </li>
            ) : null}
            <li>
              <Link href={RESERVE.href}>Send a request with your dates</Link>
            </li>
          </ul>
          {listings.length ? (
            <div className="mt-6">
              <p className="text-small text-on-dark-muted">Also listed on</p>
              <ul className="mt-1 flex gap-5 text-small">
                {listings.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1">
                      {l.label}
                      <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.25} />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="col-span-4 mt-6 border-t border-on-dark/20 pt-6 md:col-span-8 lg:col-span-12">
          <div className="grid gap-x-col gap-y-3 text-caption text-on-dark-muted lg:grid-cols-12">
            <p className="lg:col-span-5">
              {footer.smallPrint[1]}
              <br />
              {footer.smallPrint[2]}
            </p>
            <p className="lg:col-span-4 lg:col-start-6">{footer.smallPrint[3]}</p>
            <p className="lg:col-span-3 lg:col-start-10">
              &copy; {year} {brand.name}.{" "}
              <Link href="/policies" className="text-on-dark-muted">
                Policies
              </Link>
              {", "}
              <Link href="/credits" className="text-on-dark-muted">
                Credits
              </Link>
              <br />
              <span className="font-serif text-small italic">Set in Newsreader and Hanken Grotesk.</span>
            </p>
          </div>
        </div>
      </Grid>
    </footer>
  );
}
