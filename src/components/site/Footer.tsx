import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { footer, hero } from "@/content/copy";
import { siteConfig } from "@/content/site.config";
import { Grid } from "./layout";
import { isSet } from "./text";

const STAY = [
  { label: "The residence", href: "/#residence" },
  { label: "Provisions", href: "/#amenities" },
  { label: "The resort", href: "/#resort" },
  { label: "To the beach", href: "/#beach" },
  { label: "Photographs", href: "/gallery" },
];

const PLAN = [
  { label: "Request a stay", href: "/#reserve" },
  { label: "Before you arrive", href: "/#arrival" },
  { label: "Area guide", href: "/area" },
  { label: "Questions", href: "/faq" },
  { label: "Policies", href: "/policies" },
];

function Column({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="font-sans text-label font-medium text-ink-muted">{title}</h2>
      <ul className="mt-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-flex min-h-9 items-center text-small no-underline hover:underline">
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
    <footer className="border-t border-ink bg-paper py-section-sm">
      <Grid className="gap-y-10">
        <div className="col-span-4 md:col-span-8 lg:col-span-4">
          <p className="font-serif text-[1.75rem] leading-tight">{brand.name}</p>
          <p className="mt-3 max-w-[22rem] text-small text-ink-muted">
            {hero.eyebrow}, Hilton Head Island, South Carolina
          </p>
          <p className="mt-6 font-serif text-lead">{footer.tagline}</p>
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-2 lg:col-start-6">
          <Column title="The stay" links={STAY} />
        </div>
        <div className="col-span-2 md:col-span-2 lg:col-span-2">
          <Column title="Plan" links={PLAN} />
        </div>
        <div className="col-span-4 md:col-span-4 lg:col-span-3 lg:col-start-10">
          <h2 className="font-sans text-label font-medium text-ink-muted">Contact</h2>
          <ul className="mt-3 space-y-1 text-small">
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
              <Link href="/#reserve">Send a request with your dates</Link>
            </li>
          </ul>
          {listings.length ? (
            <div className="mt-6">
              <p className="text-small text-ink-muted">Also listed on</p>
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

        <div className="col-span-4 border-t border-rule pt-5 md:col-span-8 lg:col-span-12">
          <div className="grid gap-x-col gap-y-2 text-caption text-ink-muted lg:grid-cols-12">
            <p className="lg:col-span-5">
              {footer.smallPrint[1]}
              <br />
              {footer.smallPrint[2]}
            </p>
            <p className="lg:col-span-4 lg:col-start-6">{footer.smallPrint[3]}</p>
            <p className="lg:col-span-3 lg:col-start-10">
              &copy; {year} {brand.name}.{" "}
              <Link href="/policies" className="text-ink-muted">
                Policies
              </Link>
              <br />
              Set in Newsreader and Hanken Grotesk.
            </p>
          </div>
        </div>
      </Grid>
    </footer>
  );
}
