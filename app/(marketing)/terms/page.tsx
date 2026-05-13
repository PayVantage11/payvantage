import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "PayVantage terms of service — eligibility, service scope, fees, governing law, and dispute resolution.",
  path: "/terms",
});

export default function TermsPage(): ReactNode {
  return (
    <main id="main-content" className="flex-1 px-6 pt-28 pb-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">
          Last updated: May 13, 2026
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your use of
              pay-vantage.com and the merchant referral, application, and
              processing-related services offered by Vantage Capital Insights
              LLC, doing business as PayVantage (&ldquo;PayVantage,&rdquo;
              &ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). By
              accessing the site or submitting a merchant application, you
              agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              1. Eligibility
            </h2>
            <p>
              The PayVantage service is intended for businesses legally formed
              and operating in the United States. You must be at least 18
              years old and authorized to bind the business you represent.
              Sole proprietors, LLCs, S-corps, and C-corps in good standing
              may apply. We do not currently serve businesses based outside
              the United States.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              2. Description of services
            </h2>
            <p className="mb-3">
              PayVantage is an independent payment processing brokerage. We
              connect high-risk merchants — in categories such as peptides,
              dietary supplements, nutraceuticals, and research-use-only
              compounds — with acquiring banks and payment processors in our
              partner network. Specifically:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                For the traditional card processing rail, we forward your
                merchant application to Tycoon Payments and other partners for
                underwriting. PayVantage is not the acquirer, the issuer, or
                the merchant of record.
              </li>
              <li>
                For the USDC settlement rail, we facilitate integration with
                Card2Crypto and similar partners that settle funds in
                stablecoin. PayVantage does not custody funds.
              </li>
            </ul>
            <p className="mt-4">
              All underwriting, approval, pricing, and account decisions are
              made solely by the processing partners, not by PayVantage. We
              act as a referral and integration broker.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              3. No guarantee of approval
            </h2>
            <p>
              Submitting a merchant application through PayVantage does not
              guarantee that any processor will approve your account. Our
              partners may decline applications for any reason permitted by
              law and card network rules. PayVantage is not liable for any
              processor&rsquo;s underwriting decision, processing rates, or
              account terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              4. Fees
            </h2>
            <p>
              Processing rates, monthly fees, chargeback fees, reserve
              requirements, and other terms are set by the processing partner
              that approves your merchant account and are documented in the
              merchant processing agreement you sign with that partner.
              PayVantage referral fees, if any, are paid by the processor and
              do not increase your processing rates.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              5. Merchant responsibilities
            </h2>
            <p className="mb-3">By using our services, you represent that:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>All information you provide is accurate, complete, and not misleading.</li>
              <li>Your business operates lawfully under all federal, state, and local laws applicable to your industry.</li>
              <li>You will comply with all card network operating rules of any processor that approves your account.</li>
              <li>You will not use our services to facilitate transactions prohibited by law, by Visa/Mastercard/Amex/Discover rules, or by the partner processor&rsquo;s policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              6. Disclaimers
            </h2>
            <p>
              The PayVantage website and services are provided &ldquo;as
              is&rdquo; and &ldquo;as available,&rdquo; without warranty of
              any kind, express or implied. We disclaim warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement, to the maximum extent permitted by law. We do
              not warrant that any processor will approve your account, that
              the site will be uninterrupted, or that defects will be
              corrected.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              7. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, Vantage Capital Insights
              LLC&rsquo;s aggregate liability arising out of or relating to
              your use of the site or services will not exceed the greater of
              (a) one hundred US dollars ($100) or (b) any referral fees we
              actually received from a processor on your account in the twelve
              (12) months preceding the claim. We are not liable for
              indirect, incidental, special, or consequential damages,
              including lost profits, lost revenue, or lost business.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              8. Governing law
            </h2>
            <p>
              These Terms are governed by the laws of the State of Georgia,
              without regard to its conflict-of-laws principles. Subject to
              the arbitration clause below, any action arising from these
              Terms shall be brought exclusively in the state or federal
              courts located in Fulton County, Georgia.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              9. Arbitration and class-action waiver
            </h2>
            <p>
              Any dispute arising out of or related to these Terms shall be
              resolved by binding arbitration administered by the American
              Arbitration Association under its Commercial Arbitration Rules,
              with the seat of arbitration in Atlanta, Georgia. You and
              PayVantage each waive any right to participate in a class
              action, collective action, or representative proceeding. The
              arbitrator&rsquo;s award shall be final and enforceable in any
              court of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              10. Changes
            </h2>
            <p>
              We may revise these Terms at any time. Material changes will be
              posted on this page with a revised &ldquo;Last updated&rdquo;
              date. Continued use of the site after changes constitutes
              acceptance.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              11. Contact
            </h2>
            <p>
              Legal inquiries:{" "}
              <a
                href="mailto:legal@pay-vantage.com"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                legal@pay-vantage.com
              </a>
              <br />
              General contact:{" "}
              <a
                href="mailto:hwayner@vantagecapitalinsights.com"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                hwayner@vantagecapitalinsights.com
              </a>
              <br />
              Mailing address: Vantage Capital Insights LLC, Atlanta, GA
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
