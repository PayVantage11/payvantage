"use client";

import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type PricingPlan = {
  name: string;
  tagline: string;
  price: string;
  priceDetail?: string;
  description: string;
  cta: string;
  ctaHref: string;
  featured?: boolean;
  preferredBy: string[];
};

const plans: PricingPlan[] = [
  {
    name: "Standard",
    tagline: "For merchants of all sizes",
    price: "2.9% + $0.30",
    priceDetail: "per transaction",
    description:
      "No monthly fees. No setup costs. No rolling reserves. Accept card payments settled in stablecoins with instant payouts to your wallet.",
    cta: "Get Started",
    ctaHref: "/signup",
    featured: true,
    preferredBy: ["E-commerce", "SaaS", "Digital Goods"],
  },
  {
    name: "Enterprise",
    tagline: "Custom solutions at scale",
    price: "Custom",
    description:
      "Volume-based pricing, dedicated account manager, custom integrations, SLA guarantees, and priority support for high-volume merchants.",
    cta: "Contact Sales",
    ctaHref: "#",
    preferredBy: ["Marketplaces", "Platforms", "High-Volume"],
  },
];

function AvatarStack(): ReactNode {
  return (
    <div className="-space-x-2 flex items-center">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-background bg-background"
        >
          <div className="h-full w-full bg-linear-to-br from-foreground/20 to-foreground/5" />
        </div>
      ))}
    </div>
  );
}

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
      className={`relative flex flex-col rounded-md border bg-background p-6 transition-shadow sm:p-8 ${
        plan.featured
          ? "border-accent/30 shadow-xl hover:shadow-2xl"
          : "border-border shadow-sm hover:shadow-lg"
      }`}
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
              : "border border-border bg-transparent text-foreground hover:bg-muted"
          }`}
        >
          {plan.cta}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </a>
      </div>
      <div className="border-t border-border pt-6">
        <p className="mb-2 text-xs text-muted-foreground">Popular with:</p>
        <div className="flex items-center gap-4">
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
    </motion.div>
  );
}

export function Pricing(): ReactNode {
  return (
    <section className="relative w-full bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease }}
            className="mb-6 flex items-center gap-3"
          >
            <AvatarStack />
            <span className="text-sm text-muted-foreground">
              Trusted by{" "}
              <span className="font-medium text-foreground">12,000+</span>{" "}
              merchants
            </span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1, ease }}
            className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl"
          >
            Simple, transparent pricing
          </motion.h2>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {plans.map((plan, index) => (
            <PricingCard key={plan.name} plan={plan} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
