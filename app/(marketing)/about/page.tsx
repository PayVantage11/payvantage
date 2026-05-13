import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "About PayVantage",
  description:
    "PayVantage is an independent high-risk payment brokerage based in Atlanta, GA, partnering with Tycoon Payments for card processing and Card2Crypto for USDC settlement.",
  path: "/about",
});

export default function AboutPage(): ReactNode {
  return (
    <main id="main-content" className="flex-1 px-6 pt-28 pb-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
          About PayVantage
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Independent payment processing brokerage for merchants the
          mainstream providers turn away.
        </p>

        <div className="mt-12 space-y-10 text-base leading-relaxed text-muted-foreground">
          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              What we do
            </h2>
            <p>
              PayVantage matches high-risk merchants — peptides, dietary
              supplements, nutraceuticals, research-use-only compounds, and
              adjacent verticals — with processing solutions that fit how
              their businesses actually operate. We offer two rails: a
              traditional card-acquiring path through our banking partners,
              and an instant USDC settlement path for merchants who want
              liquidity without chargeback exposure.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Who we are
            </h2>
            <p>
              PayVantage is operated by Vantage Capital Insights LLC, an
              independent payment-processing brokerage based in Atlanta,
              Georgia. The company was founded by Harrison Wayner with a
              focus on getting straight, honest answers to merchants in
              categories where most processors will not even pick up the
              phone.
            </p>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Our partners
            </h2>
            <p className="mb-3">
              We are not the acquirer or the merchant of record. We work
              directly with vetted processing partners and pass merchants
              through to the partner that best fits their volume, average
              ticket, and risk profile:
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Tycoon Payments</strong> —
                primary card-acquiring partner for traditional credit and
                debit processing.
              </li>
              <li>
                <strong className="text-foreground">Card2Crypto</strong> —
                stablecoin settlement partner for the USDC rail, with payouts
                on Polygon and Base.
              </li>
              <li>
                Additional banking and underwriting partners introduced based
                on merchant category and volume.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              How we are different
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Direct communication — you talk to the same person from intro
                through go-live, not a chain of reps.
              </li>
              <li>
                Honest rates discussed on a short call, not buried in a 40-page
                contract.
              </li>
              <li>
                Two rails — pick the one that fits, or run both in parallel.
              </li>
              <li>
                Specialized in verticals the big processors avoid.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 font-serif text-2xl font-medium text-foreground">
              Get in touch
            </h2>
            <p>
              Have a question about which rail fits your business?{" "}
              <Link
                href="/contact"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Contact us
              </Link>{" "}
              or{" "}
              <Link
                href="/book-demo"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                book a demo
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
