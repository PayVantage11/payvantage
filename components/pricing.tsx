"use client";

import { ShaderCard } from "@/components/shader-card";
import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type PricingPlan = {
  name: string;
  tagline: string;
  price: string;
  priceDetail?: string;
  priceSubline?: string;
  description: string;
  cta: string;
  ctaHref: string;
  featured?: boolean;
  preferredBy: string[];
};

const plans: PricingPlan[] = [
  {
    name: "High-risk merchants",
    tagline: "Peptides, supplements, nutraceuticals",
    price: "7%",
    priceDetail: "per transaction — flat percentage only",
    priceSubline: "Instant USDC settlement",
    description:
      "No monthly fees. No setup costs. No per-transaction dollar add-on: just the flat percentage. Designed for categories that struggle to get fair treatment elsewhere.",
    cta: "Book a demo",
    ctaHref: "/book-demo",
    featured: true,
    preferredBy: ["Supplements", "Peptides", "Nutraceuticals"],
  },
  {
    name: "Traditional Card Processing",
    tagline: "Rate tailored to your business",
    price: "Custom",
    priceDetail: "— based on volume and industry",
    description:
      "No monthly fees and no setup costs. We align pricing with your industry and processing volume after a short conversation—no hidden minimums or equipment fees on this page.",
    cta: "Book a demo",
    ctaHref: "/book-demo",
    preferredBy: ["Supplements", "Peptides", "Nutraceuticals"],
  },
];

function PricingCard({
  plan,
  index,
}: {
  plan: PricingPlan;
  index: number;
}): ReactNode {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease }}
      className="h-full"
    >
      <ShaderCard
        speed={0.14}
        color={plan.featured ? "#2563eb" : "#6366f1"}
        deepColor="#04040a"
        className={
          plan.featured
            ? "h-full border border-accent/35 shadow-xl hover:shadow-2xl"
            : "h-full border border-border/90 shadow-sm hover:shadow-lg"
        }
      >
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
        </div>
        <div className="mb-6">
          <p className="text-3xl font-semibold text-foreground sm:text-4xl">
            {plan.price}
          </p>
          {plan.priceDetail && (
            <p className="mt-1 text-sm text-muted-foreground">
              {plan.priceDetail}
            </p>
          )}
          {plan.priceSubline && (
            <p className="mt-2 text-sm font-medium text-accent">
              {plan.priceSubline}
            </p>
          )}
        </div>
        <p className="mb-8 flex-1 text-sm leading-relaxed text-muted-foreground">
          {plan.description}
        </p>
        <div className="mb-8 flex flex-col gap-3">
          <a
            href={plan.ctaHref}
            className={`group inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-150 active:scale-[0.97] ${
              plan.featured
                ? "bg-foreground text-background hover:bg-foreground/90"
                : "border border-border bg-transparent text-foreground hover:bg-muted/80"
            }`}
          >
            {plan.cta}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="border-t border-border/80 pt-6">
          <p className="mb-2 text-xs text-muted-foreground">Common fits:</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {plan.preferredBy.map((segment) => (
              <span
                key={segment}
                className="text-xs font-medium text-foreground/70"
              >
                {segment}
              </span>
            ))}
          </div>
        </div>
      </ShaderCard>
    </motion.div>
  );
}

export function Pricing(): ReactNode {
  return (
    <section className="relative w-full bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05, ease }}
            className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Simple, transparent pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12, ease }}
            className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            Two clear tracks—no monthly minimums, equipment fees, or setup
            charges called out here. If you are unsure which applies, book a
            short call and we will point you in the right direction.
          </motion.p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-stretch">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
