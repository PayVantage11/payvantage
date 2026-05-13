import { FAQ } from "@/components/faq";
import { FinalCTA } from "@/components/final-cta";
import { Pricing } from "@/components/pricing";
import { createMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: "Pricing",
  description:
    "PayVantage pricing: 7% flat for the USDC settlement rail, and custom rates for traditional high-risk card processing. No monthly fees or setup costs.",
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
