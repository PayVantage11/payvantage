"use client";

import Link from "next/link";
import { type ReactNode } from "react";

const footerLinks = {
  product: {
    title: "Product",
    links: [
      { label: "Merchants", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "Integrations", href: "/dashboard/integrations" },
      { label: "API Docs", href: "#" },
    ],
  },
  company: {
    title: "Company",
    links: [
      { label: "About us", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Security", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  resources: {
    title: "Resources",
    links: [
      { label: "Help Center", href: "#" },
      { label: "Developer API", href: "#" },
      { label: "WooCommerce Plugin", href: "#" },
      { label: "Shopify App", href: "#" },
    ],
  },
};

const legalLinks = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
  { label: "Cookie Policy", href: "#" },
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
                  &copy; {new Date().getFullYear()} PayVantage Inc. The
                  high-risk payment gateway powered by stablecoins.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
                {Object.values(footerLinks).map((section) => (
                  <div key={section.title}>
                    <h3 className="mb-5 text-xs font-medium uppercase tracking-wider text-foreground/40">
                      {section.title}
                    </h3>
                    <ul className="space-y-3">
                      {section.links.map((link) => (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            className="text-sm text-foreground/70 transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </a>
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
              <a
                href="mailto:support@payvantage.io"
                className="text-sm text-foreground/70 transition-colors hover:text-foreground"
              >
                Contact us
              </a>
              <div className="flex flex-wrap gap-6">
                {legalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm text-foreground/50 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
