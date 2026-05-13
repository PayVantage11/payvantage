import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "PayVantage privacy policy — what data we collect, how we use it, who we share it with, and how to contact us about your information.",
  path: "/privacy",
});

export default function PrivacyPage(): ReactNode {
  return (
    <main id="main-content" className="flex-1 px-6 pt-28 pb-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
          Privacy Policy
        </h1>
        <p className="mt-6 text-sm text-muted-foreground">
          Last updated: May 13, 2026
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <p>
              This Privacy Policy describes how Vantage Capital Insights LLC
              (&ldquo;Vantage Capital Insights,&rdquo; &ldquo;we,&rdquo;
              &ldquo;our,&rdquo; or &ldquo;us&rdquo;), operating as PayVantage,
              collects, uses, and shares information when you visit
              pay-vantage.com or apply for merchant processing services through
              us. By using our website or submitting a merchant application,
              you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              1. Information we collect
            </h2>
            <p className="mb-3">We collect the following categories of information:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Merchant application information:</strong>{" "}
                business name, legal entity type, EIN, DBA, business address,
                website URL, products or services sold, expected processing
                volume, average ticket size, refund and chargeback history.
              </li>
              <li>
                <strong className="text-foreground">Beneficial owner KYC information:</strong>{" "}
                names, dates of birth, residential addresses, Social Security
                numbers, government-issued ID images, and ownership percentages
                for individuals owning 10% or more of the business, as required
                by US AML/KYC regulations and card network rules.
              </li>
              <li>
                <strong className="text-foreground">Financial information:</strong>{" "}
                three months of business bank statements, three months of prior
                processing statements (if applicable), voided check or bank
                letter for settlement routing.
              </li>
              <li>
                <strong className="text-foreground">Communications:</strong>{" "}
                emails, phone call notes, demo scheduling, and form submissions
                you send us.
              </li>
              <li>
                <strong className="text-foreground">Technical information:</strong>{" "}
                IP address, browser type, device type, and pages visited on our
                website, collected via standard web logs and first-party
                analytics.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              2. How we use information
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>To review your merchant application and forward it to one of our processing partners for underwriting.</li>
              <li>To verify your identity and the identity of beneficial owners as required by federal law and card network rules.</li>
              <li>To detect, prevent, and investigate fraud, money laundering, and other illegal activity.</li>
              <li>To communicate with you about your application, account status, and service updates.</li>
              <li>To comply with our legal, regulatory, tax, audit, and recordkeeping obligations.</li>
              <li>To improve our website and customer experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              3. How we share information
            </h2>
            <p className="mb-3">
              We share your information only with parties necessary to provide
              the service you have requested. Specifically:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Processing partners:</strong>{" "}
                Tycoon Payments and other acquiring banks and ISOs in our
                network receive your merchant application package for
                underwriting. They have their own privacy policies governing
                their handling of your data.
              </li>
              <li>
                <strong className="text-foreground">Crypto settlement partners:</strong>{" "}
                Card2Crypto and similar partners receive transaction routing
                and settlement instructions when you elect the USDC settlement
                rail.
              </li>
              <li>
                <strong className="text-foreground">Banking partners:</strong>{" "}
                We share KYC and underwriting documents with banking
                institutions as required to facilitate merchant account setup.
              </li>
              <li>
                <strong className="text-foreground">Service providers:</strong>{" "}
                Hosting (Vercel), database (Supabase), email, and analytics
                providers that operate under contract and only process data on
                our behalf.
              </li>
              <li>
                <strong className="text-foreground">Legal compliance:</strong>{" "}
                Government agencies, courts, or law enforcement when required
                by subpoena, court order, or applicable law.
              </li>
            </ul>
            <p className="mt-4">
              We do not sell your personal information, and we do not share it
              with advertisers or data brokers.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              4. Data retention
            </h2>
            <p>
              We retain merchant application records, KYC documentation, and
              transaction-related records for at least seven (7) years after
              account closure, as required by card network operating rules and
              applicable financial regulations. We may retain records longer
              where required by law, audit, or to resolve disputes.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              5. Your rights
            </h2>
            <p className="mb-3">
              Depending on your state of residence, you may have rights to:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Request a copy of the personal information we hold about you.</li>
              <li>Request correction of inaccurate information.</li>
              <li>Request deletion of personal information, subject to our legal retention obligations.</li>
              <li>Opt out of certain processing.</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, email us at{" "}
              <a
                href="mailto:privacy@pay-vantage.com"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                privacy@pay-vantage.com
              </a>{" "}
              with a description of your request. We will respond within 30
              days.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              6. Security
            </h2>
            <p>
              We use industry-standard technical and organizational safeguards,
              including TLS encryption in transit, encrypted storage of
              sensitive documents, and role-based access controls. No system
              is perfectly secure; please contact us immediately at{" "}
              <a
                href="mailto:security@pay-vantage.com"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                security@pay-vantage.com
              </a>{" "}
              if you suspect unauthorized access to your information.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              7. Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. Material changes
              will be posted on this page with a revised &ldquo;Last
              updated&rdquo; date.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              8. Contact
            </h2>
            <p>
              Privacy inquiries:{" "}
              <a
                href="mailto:privacy@pay-vantage.com"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                privacy@pay-vantage.com
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
