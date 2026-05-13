"use client";

import Link from "next/link";
import { type ReactNode } from "react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Payment gateway", href: "/products/payment-gateway" },
      { label: "WooCommerce plugin", href: "/products/woocommerce" },
      { label: "Chargeback shield", href: "/products/chargeback-shield" },
      { label: "Instant settlement", href: "/products/instant-settlement" },
      { label: "Integrations", href: "/dashboard/integrations" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Setup & docs", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
      { label: "Book a demo", href: "/book-demo" },
      { label: "Sign up", href: "/signup" },
      { label: "Log in", href: "/login" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
};

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
  { label: "About", href: "/about" },
];

export function Footer(): ReactNode {
  return (
    <footer className="relative w-full overflow-hidden bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-6 sm:px-8">
        <div className="relative h-full w-full max-w-270">
          <div className="absolute top-0 bottom-0 left-0 w-px bg-foreground/10" />
          <div className="absolute top-0 bottom-0 right-0 w-px bg-foreground/10" />
          <div className="absolute top-full left-0 h-screen w-px bg-foreground/10" />
          <div className="absolute top-full right-0 h-screen w-px bg-foreground/10" />
        </div>
      </div>

      <div className="relative flex items-center justify-center px-6 pt-16 sm:px-8">
        <div className="relative w-full max-w-270">
          <div className="absolute right-0 bottom-0 left-0 h-px bg-foreground/10" />
          <div className="absolute right-full bottom-0 h-px w-screen bg-foreground/10" />
          <div className="absolute bottom-0 left-full h-px w-screen bg-foreground/10" />
          <div className="absolute -bottom-0.75 -left-0.75 h-1.5 w-1.5 bg-foreground" />
          <div className="absolute -right-0.75 -bottom-0.75 h-1.5 w-1.5 bg-foreground" />
          <div className="relative w-full px-8 py-12 sm:px-12">
            <div className="flex flex-col justify-between gap-12 lg:flex-row lg:gap-8">
              <div className="lg:max-w-xs">
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-foreground" />
                  <span className="text-lg font-semibold text-foreground">
                    PayVantage
                  </span>
                </Link>
                <p className="mt-4 max-w-xs text-sm text-foreground/50">
                  &copy; {new Date().getFullYear()} Vantage Capital Insights
                  LLC. High-risk processing: traditional acquiring and USDC
                  settlement in one platform.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-12">
                {Object.values(footerLinks).map((section) => (
                  <div key={section.title}>
                    <h3 className="mb-5 text-xs font-medium uppercase tracking-wider text-foreground/40">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          {link.href.startsWith("/") ? (
                            <Link
                              href={link.href}
                              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                            >
                              {link.label}
                            </Link>
                          ) : (
                            <a
                              href={link.href}
                              className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                            >
                              {link.label}
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center justify-center px-6 pb-12 sm:px-8">
        <div className="relative w-full max-w-270">
          <div className="px-8 pt-8 sm:px-12">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                Contact us
              </Link>
              <div className="flex flex-wrap gap-6">
                {legalLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-foreground/50 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
