import { createMetadata } from "@/lib/metadata";
import { ContactForm } from "@/components/contact-form";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Contact PayVantage",
  description:
    "Get in touch with PayVantage. Email, phone, and contact form for merchants applying for high-risk card processing or USDC settlement.",
  path: "/contact",
});

export default function ContactPage(): ReactNode {
  return (
    <main id="main-content" className="flex-1 px-6 pt-28 pb-24 sm:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
          Contact us
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">
          Talking to a real person is the fastest way to figure out whether
          PayVantage is a fit. Email, call, or send a message below — replies
          typically come within one business day.
        </p>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
          <section className="space-y-8">
            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Direct
              </h2>
              <dl className="mt-4 space-y-3 text-base text-muted-foreground">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Email
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:hwayner@vantagecapitalinsights.com"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      hwayner@vantagecapitalinsights.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Phone
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="tel:+19127131739"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      (912) 713-1739
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Hours
                  </dt>
                  <dd className="mt-1">Mon – Fri, 9:00 am – 6:00 pm (EST)</dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Specialized inboxes
              </h2>
              <dl className="mt-4 space-y-3 text-base text-muted-foreground">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Support
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:support@pay-vantage.com"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      support@pay-vantage.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Privacy
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:privacy@pay-vantage.com"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      privacy@pay-vantage.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Security
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:security@pay-vantage.com"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      security@pay-vantage.com
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-foreground/40">
                    Legal
                  </dt>
                  <dd className="mt-1">
                    <a
                      href="mailto:legal@pay-vantage.com"
                      className="font-medium text-foreground underline-offset-4 hover:underline"
                    >
                      legal@pay-vantage.com
                    </a>
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <h2 className="font-serif text-xl font-medium text-foreground">
                Company
              </h2>
              <p className="mt-4 text-base text-muted-foreground">
                Vantage Capital Insights LLC
                <br />
                d/b/a PayVantage
                <br />
                Atlanta, GA
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Send a message
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Submitting opens your email client preloaded with the message —
              no third parties involved.
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
