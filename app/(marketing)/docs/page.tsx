import { getBookingHref } from "@/lib/booking";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Setup & requirements",
  description:
    "How to get started with PayVantage: card-to-crypto setup and document requirements for traditional card processing.",
  path: "/docs",
});

const standardDocs = [
  "Merchant intake form (completed on a call with our team)",
  "Driver's license for all owners with over 10% ownership",
  "Articles of incorporation",
  "Operating agreement",
  "3 months of business bank statements",
  "3 months of processing statements (if applicable)",
  "EIN letter from the IRS",
  "Voided business check or official bank letter",
];

export default function DocsPage(): ReactNode {
  const integrationHref = getBookingHref();

  return (
    <main id="main-content" className="flex-1 px-6 pt-28 pb-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
          Setup guide
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          PayVantage supports two paths depending on whether you use our
          card-to-crypto rail or apply for traditional card processing through
          one of our processor partners. Choose the path that matches how you
          plan to accept payments.
        </p>

        <div className="mt-16 space-y-20">
          <section aria-labelledby="crypto-rail-heading">
            <h2
              id="crypto-rail-heading"
              className="font-serif text-2xl font-medium text-foreground"
            >
              Card-to-crypto (crypto rail)
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Getting started is simple. No paperwork is required upfront to
              begin. Book an integration call and we will walk you through
              connecting checkout or payment links to settlement in USDC on
              Polygon.
            </p>
            <p className="mt-4 text-sm font-medium text-foreground">
              On that call we typically cover:
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              <li>Your monthly processing volume</li>
              <li>
                Whether you need payment links only, or ecommerce integration as
                well
              </li>
              <li>
                What platform your site uses (for example Shopify, WooCommerce,
                or Squarespace)
              </li>
            </ul>
            <div className="mt-8">
              <a
                href={integrationHref}
                className="inline-flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                Book integration call
              </a>
            </div>
          </section>

          <section aria-labelledby="standard-heading">
            <h2
              id="standard-heading"
              className="font-serif text-2xl font-medium text-foreground"
            >
              Standard processing (traditional card processing)
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              If you are applying for traditional card processing, underwriting
              is handled by our processor partners. We will guide you through
              the package below—requirements can vary slightly by partner, but
              this is what merchants should expect to provide.
            </p>
            <p className="mt-6 text-sm font-medium text-foreground">
              Required documents
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
              {standardDocs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              Questions about which path fits your business?{" "}
              <Link
                href="/book-demo"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Book a demo
              </Link>{" "}
              or email{" "}
              <a
                href="mailto:hwayner@vantagecapitalinsights.com"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                hwayner@vantagecapitalinsights.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
