"use client";

import { type ReactNode } from "react";
import {
  Sparkles,
  ShieldCheck,
  Plug,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type PrincipleCard = {
  icon: ReactNode;
  label: string;
};

const principles: PrincipleCard[] = [
  {
    icon: <ShieldCheck className="h-12 w-12" strokeWidth={1} />,
    label: "Chargeback Immunity",
  },
  {
    icon: <Sparkles className="h-12 w-12" strokeWidth={1} />,
    label: "No Underwriting",
  },
  {
    icon: <Plug className="h-12 w-12" strokeWidth={1} />,
    label: "WooCommerce & Shopify",
  },
  {
    icon: <BarChart3 className="h-12 w-12" strokeWidth={1} />,
    label: "Real-time Dashboard",
  },
];

export function Principles(): ReactNode {
  return (
    <section className="relative w-full bg-muted py-24 text-foreground sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease }}
              className="mb-6 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Why PayVantage?</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease }}
              className="font-serif text-3xl font-medium leading-tight sm:text-4xl lg:text-5xl"
            >
              Built for merchants{" "}
              <span className="italic">banks won&apos;t serve</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
              className="mt-6 max-w-lg leading-relaxed text-foreground/70"
            >
              Traditional processors reject high-risk merchants or bury them in
              fees and reserves. PayVantage uses stablecoin settlement to
              eliminate chargebacks, remove underwriting, and deliver instant
              payouts.
            </motion.p>

            <motion.a
              href="/signup"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
            >
              Get started free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.a>
          </div>

          <div className="grid max-w-md grid-cols-2 gap-2 lg:ml-auto">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease }}
                className="flex aspect-square flex-col items-center justify-center rounded-sm bg-foreground/5"
              >
                <div className="mb-4 text-foreground/80">
                  {principle.icon}
                </div>
                <p className="px-4 text-center text-sm text-foreground/80">
                  {principle.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
