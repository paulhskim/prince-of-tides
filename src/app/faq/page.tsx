import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { faqPageSchema, pageBreadcrumb } from "@/lib/seo/schema";
import Link from "next/link";
import { Accordion } from "@/components/site/Accordion";
import { faqAnswer, faqId } from "@/components/site/faq-data";
import { Grid, PageHeader } from "@/components/site/layout";
import { roman } from "@/components/site/text";
import { hero } from "@/content/copy";
import { faq, type FaqCategory } from "@/content/faq";

export const metadata = pageMetadata("faq");

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function FaqPage() {
  const categories = Array.from(new Set(faq.map((f) => f.category))) as FaqCategory[];
  return (
    <>
      <JsonLd data={[faqPageSchema(faq, faqAnswer), pageBreadcrumb("faq")]} />
      <PageHeader eyebrow={hero.eyebrow} folio={`${faq.length} questions, answered plainly`} title="Questions">
        <nav aria-label="Question groups" className="lg:ml-[calc((100%+var(--spacing-col))/4)]">
          <ol className="grid gap-x-col border-t border-ink text-small sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c, i) => (
              <li key={c} className="border-b border-rule">
                <a href={`#${slug(c)}`} className="grid min-h-12 grid-cols-[2.25rem_1fr_auto] items-center no-underline hover:underline">
                  <span className="font-serif text-small italic text-brass">{roman(i + 1)}</span>
                  <span className="font-serif text-body">{c}</span>
                  <span className="text-caption text-ink-muted tabular">{faq.filter((f) => f.category === c).length}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </PageHeader>

      <div className="pb-section">
        {categories.map((c, i) => (
          <section key={c} id={slug(c)} aria-labelledby={`${slug(c)}-title`} className="scroll-mt-20 py-section-sm">
            <Grid>
              <div className="col-span-4 mb-4 md:col-span-8 lg:sticky lg:top-36 lg:col-span-3 lg:mb-0 lg:self-start">
                <span aria-hidden="true" className="block font-serif text-h3 italic leading-none text-brass">
                  {roman(i + 1)}
                </span>
                <h2 id={`${slug(c)}-title`} className="mt-3 font-serif text-[1.5rem] font-light leading-tight tracking-[-0.012em]">
                  {c}
                </h2>
              </div>
              <div className="col-span-4 md:col-span-8 lg:col-span-8 lg:col-start-4">
                <Accordion
                  items={faq
                    .filter((f) => f.category === c)
                    .map((f) => ({ id: faqId(f.q), question: f.q, answer: faqAnswer(f.a) }))}
                />
              </div>
            </Grid>
          </section>
        ))}

        <Grid className="mt-6">
          <div className="col-span-4 flex flex-wrap items-center justify-between gap-4 border-t border-ink pt-5 md:col-span-8 lg:col-span-9 lg:col-start-4">
            <Link href="/policies" className="link-caps">
              Policies and house rules
            </Link>
            <Link href="/#reserve" className="btn btn-primary min-h-13">
              {hero.primaryCta.label}
            </Link>
          </div>
        </Grid>
      </div>
    </>
  );
}
