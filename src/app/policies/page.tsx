import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo/metadata";
import { pageBreadcrumb } from "@/lib/seo/schema";
import type { ReactNode } from "react";
import { Grid, PageHeader } from "@/components/site/layout";
import { isSet, roman } from "@/components/site/text";
import { booking } from "@/content/copy";
import { policies } from "@/content/policies";
import { siteConfig } from "@/content/site.config";

export const metadata = pageMetadata("policies");

const SECTIONS = [
  { id: "house-rules", title: booking.policiesHeading },
  { id: "cancellation", title: "Cancellation" },
  { id: "payment", title: "Payment" },
  { id: "deposit", title: "Security deposit" },
  { id: "agreement", title: "Rental agreement" },
  { id: "taxes", title: "Taxes" },
  { id: "permit", title: "Permit" },
  { id: "accessibility", title: "Accessibility" },
  { id: "privacy", title: "Privacy" },
];

function Part({ id, n, title, children }: { id: string; n: number; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-36 border-t border-ink pb-14 pt-3">
      <p className="font-serif text-body italic text-brass">{roman(n)}</p>
      <div className="mt-3">
        <h2 id={`${id}-title`} className="text-h2 font-light">
          {title}
        </h2>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export default function PoliciesPage() {
  const { cancellation, payment, securityDeposit } = policies;
  const n = (id: string) => SECTIONS.findIndex((s) => s.id === id) + 1;
  const taxTotal = Math.round(siteConfig.pricing.taxes.reduce((s, t) => s + t.rate, 0) * 1000) / 10;

  return (
    <>
      <JsonLd data={pageBreadcrumb("policies")} />
      <PageHeader
        eyebrow="Policies and house rules"
        folio={`Town STR permit ${siteConfig.permit.townStrPermit}`}
        title="Policies"
        lead={`${policies.rentalAgreementNote.split(". ")[0]}.`}
      />

      <Grid className="pb-section">
        <nav aria-label="Policies contents" className="col-span-4 mb-10 md:col-span-8 lg:sticky lg:top-36 lg:col-span-3 lg:mb-0 lg:self-start">
          <p className="smallcaps border-t border-ink pt-3">Contents</p>
          <ol className="mt-1 text-small">
            {SECTIONS.map((s, i) => (
              <li key={s.id} className="border-b border-rule">
                <a href={`#${s.id}`} className="grid min-h-11 grid-cols-[2.25rem_1fr] items-center no-underline hover:underline">
                  <span className="font-serif text-small italic text-brass">{roman(i + 1)}</span>
                  <span>{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="col-span-4 md:col-span-8 lg:col-span-9 lg:col-start-4">
          <Part id="house-rules" n={n("house-rules")} title={booking.policiesHeading}>
            <ol className="max-w-[44rem] border-t border-rule">
              {policies.houseRules.map((rule, i) => (
                <li key={rule} className="grid grid-cols-[2.5rem_1fr] border-b border-rule py-3 text-body">
                  <span className="font-serif text-ink-muted tabular">{i + 1}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ol>
          </Part>

          <Part id="cancellation" n={n("cancellation")} title="Cancellation">
            <h3 className="smallcaps text-ink-muted">{cancellation.title}</h3>
            <p className="mt-2 max-w-measure font-serif text-prose">{cancellation.summary}</p>
            <table className="mt-8 w-full max-w-[44rem] text-left text-small">
              <caption className="sr-only">Refund by notice period</caption>
              <thead>
                <tr className="border-b border-ink">
                  <th scope="col" className="w-1/2 pb-2 pr-6 text-label font-medium text-ink-muted">
                    Cancelled
                  </th>
                  <th scope="col" className="pb-2 text-label font-medium text-ink-muted">
                    Refund
                  </th>
                </tr>
              </thead>
              <tbody>
                {cancellation.tiers.map((t) => (
                  <tr key={t.when} className="border-b border-rule align-top">
                    <th scope="row" className="py-3.5 pr-6 font-medium">
                      {t.when}
                    </th>
                    <td className="py-3.5">{t.refund}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ul className="mt-8 max-w-measure space-y-3 text-small">
              {cancellation.notes.map((note) => (
                <li key={note} className="border-l border-rule-strong pl-4">
                  {note}
                </li>
              ))}
            </ul>
          </Part>

          <Part id="payment" n={n("payment")} title="Payment">
            <p className="max-w-measure font-serif text-prose">{payment.summary}</p>
            <ol className="mt-6 max-w-[44rem] border-t border-rule">
              {payment.schedule.map((step, i) => {
                const [head, ...rest] = step.split(": ");
                return (
                  <li key={step} className="grid grid-cols-[2.5rem_1fr] border-b border-rule py-3 text-small">
                    <span className="font-serif text-body text-ink-muted tabular">{i + 1}</span>
                    <span>
                      {rest.length ? (
                        <>
                          <span className="font-medium">{head}.</span> {rest.join(": ").charAt(0).toUpperCase() + rest.join(": ").slice(1)}
                        </>
                      ) : (
                        step
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </Part>

          <Part id="deposit" n={n("deposit")} title="Security deposit">
            {isSet(securityDeposit.amount) ? (
              <p className="font-serif text-h3 tabular">{securityDeposit.amount}</p>
            ) : null}
            <p className="max-w-measure text-body">{securityDeposit.text}</p>
          </Part>

          <Part id="agreement" n={n("agreement")} title="Rental agreement">
            <p className="max-w-measure text-body">{policies.rentalAgreementNote}</p>
          </Part>

          <Part id="taxes" n={n("taxes")} title="Taxes">
            <p className="max-w-measure text-body">{policies.taxesNote}</p>
            <table className="mt-6 w-full max-w-[32rem] text-left text-small">
              <caption className="sr-only">Accommodations taxes</caption>
              <tbody className="border-t border-ink">
                {siteConfig.pricing.taxes.map((t) => (
                  <tr key={t.name} className="border-b border-rule">
                    <th scope="row" className="py-2.5 pr-6 font-normal">
                      {t.name}
                    </th>
                    <td className="py-2.5 text-right tabular">{Math.round(t.rate * 1000) / 10}%</td>
                  </tr>
                ))}
                <tr className="bg-stone">
                  <th scope="row" className="px-2 py-2.5 font-semibold">
                    Combined
                  </th>
                  <td className="px-2 py-2.5 text-right font-semibold tabular">{taxTotal}%</td>
                </tr>
              </tbody>
            </table>
          </Part>

          <Part id="permit" n={n("permit")} title="Permit">
            <p className="max-w-measure text-body">{policies.permitNote}</p>
          </Part>

          <Part id="accessibility" n={n("accessibility")} title="Accessibility">
            <p className="max-w-measure text-body">{policies.accessibilityNote}</p>
          </Part>

          <Part id="privacy" n={n("privacy")} title="Privacy">
            <p className="max-w-measure text-body">{policies.privacyNote}</p>
          </Part>
        </div>
      </Grid>
    </>
  );
}
