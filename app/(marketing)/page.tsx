import { BlogShowcase } from "@/components/blog-showcase";
import { FAQ } from "@/components/faq";
import { FeatureCards } from "@/components/feature-cards";
import { FeatureHighlight } from "@/components/feature-highlight";
import { FinalCTA } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { Pricing } from "@/components/pricing";
import { Principles } from "@/components/principles";
import { Stats } from "@/components/stats";
import { TestimonialsSlider } from "@/components/testimonials-slider";
import { TrustedBy } from "@/components/trusted-by";
import { createMetadata, siteConfig } from "@/lib/metadata";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = createMetadata({
  title: `${siteConfig.name} - The High-Risk Payment Gateway Powered by Stablecoins`,
  description: siteConfig.description,
  path: "/",
});

export default function HomePage(): ReactNode {
  return (
    <main id="main-content" className="flex-1">
      <Hero />
      <TrustedBy />
      <FeatureCards />
      <FeatureHighlight />
      <Principles />
      <Stats />
      <TestimonialsSlider />
      <Pricing />
      <FAQ />
      <BlogShowcase />
      <FinalCTA />
    </main>
  );
}
