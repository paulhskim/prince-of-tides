import Link from "next/link";
import { Grid } from "@/components/site/layout";
import { NAV } from "@/components/site/nav";

export default function NotFound() {
  return (
    <section aria-labelledby="nf-title" className="py-section-lg">
      <Grid>
        <div aria-hidden="true" className="col-span-full mb-6 border-t border-rule" />
        <p className="col-span-4 mb-3 text-label text-ink-muted md:col-span-8 lg:col-span-3 lg:mb-0">
          <span className="block font-serif text-h3 leading-none tabular">404</span>
        </p>
        <div className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-4">
          <h1 id="nf-title" className="text-h1">
            There is no page here.
          </h1>
          <p className="mt-6 max-w-measure font-serif text-lead">
            The link may be old, or the address mistyped. The residence itself has not moved.
          </p>
          <ul className="mt-10 border-t border-ink text-body">
            <li className="border-b border-rule">
              <Link href="/" className="flex min-h-12 items-center no-underline hover:underline">
                Prince of Tides, home
              </Link>
            </li>
            {NAV.map((item) => (
              <li key={item.href} className="border-b border-rule">
                <Link href={item.href} className="flex min-h-12 items-center no-underline hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Grid>
    </section>
  );
}
