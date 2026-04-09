import { FAQ } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";
import { Pricing } from "@/components/pricing";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Pricing",
  description:
    "Simple, transparent pricing for PayVantage. 2.9% + $0.30 per transaction. No monthly fees, no setup costs, no rolling reserves.",
  path: "/pricing",
});

export default function PricingPage(): ReactNode {
  return (
    <main id="main-content" className="flex-1 pt-20">
      <Pricing />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
