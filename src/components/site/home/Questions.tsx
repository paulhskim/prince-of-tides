import Link from "next/link";
import { Accordion } from "../Accordion";
import { faqAnswer, faqId, featuredFaq } from "../faq-data";
import { Grid } from "../layout";

export function Questions() {
  const items = featuredFaq().map((f) => ({ id: `home-${faqId(f.q)}`, question: f.q, answer: faqAnswer(f.a) }));
  return (
    <section aria-labelledby="questions-title" className="py-section-sm">
      <Grid>
        <div className="col-span-4 mb-6 md:col-span-8 lg:col-span-3 lg:mb-0">
          <h2 id="questions-title" className="font-sans text-label font-medium text-ink-muted">
            Before you book
          </h2>
        </div>
        <div className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-4">
          <Accordion items={items} />
          <Link href="/faq" className="mt-5 inline-flex min-h-11 items-center text-body">
            All questions
          </Link>
        </div>
      </Grid>
    </section>
  );
}
