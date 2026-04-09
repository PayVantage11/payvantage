"use client";

import { type ReactNode } from "react";
import { ArrowRight, Zap, Shield, Clock } from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

const highlightFeatures = [
  {
    icon: <Zap className="h-4 w-4" />,
    text: "Payments settle to your wallet in under 5 minutes.",
  },
  {
    icon: <Shield className="h-4 w-4" />,
    text: "On-chain transactions are irreversible — zero chargebacks.",
  },
  {
    icon: <Clock className="h-4 w-4" />,
    text: "Go live in minutes with no underwriting or bank approval.",
  },
];

function DashboardPreview(): ReactNode {
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-md border border-accent/10 bg-accent/5 px-6 pt-6">
      <div className="relative mx-auto w-full max-w-xs flex-1">
        <div className="rounded-t-xl border border-border bg-background p-5">
          <p className="mb-1 text-[10px] text-muted-foreground">
            Today&apos;s Volume
          </p>
          <p className="mb-1 text-2xl font-semibold tracking-tight text-foreground">
            $8,421.00
          </p>
          <p className="mb-5 text-xs font-medium text-emerald-500">
            +$2,180.00 vs yesterday
          </p>

          <div className="mb-4 flex h-16 items-end justify-between gap-1.5">
            {[0.2, 0.35, 0.5, 0.45, 0.6, 0.75, 0.65, 0.8, 0.9, 1.0].map(
              (h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t bg-accent/60"
                  style={{ height: `${h * 100}%` }}
                />
              )
            )}
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10">
                  <span className="text-xs text-emerald-500">&#x2713;</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    USDC Settled
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    3 min ago
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium text-foreground">+$249.99</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10">
                  <span className="text-xs text-amber-500">&#x25CF;</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-foreground">
                    Pending
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Just now
                  </p>
                </div>
              </div>
              <p className="text-xs font-medium text-foreground">$89.00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-16 bg-linear-to-t from-accent/5 to-transparent" />
    </div>
  );
}

export function FeatureHighlight(): ReactNode {
  return (
    <section className="relative w-full overflow-hidden bg-background pb-24 sm:pb-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid grid-cols-1 items-stretch gap-16 lg:grid-cols-2 lg:gap-24">
          <div className="flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              Settlement in minutes,
              <br />
              <span className="italic">not months</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="mt-6 max-w-lg leading-relaxed text-foreground/70"
            >
              Every card payment is converted to stablecoins and settled
              directly to your wallet. Track volume, monitor transactions, and
              withdraw anytime from your PayVantage dashboard.
            </motion.p>

            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease }}
              className="mt-8 space-y-4"
            >
              {highlightFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="mt-0.5 shrink-0 text-foreground/60">
                    {feature.icon}
                  </span>
                  <span className="text-foreground/80">{feature.text}</span>
                </li>
              ))}
            </motion.ul>

            <motion.a
              href="/signup"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3, ease }}
              className="group mt-10 inline-flex items-center gap-2 font-medium text-foreground transition-opacity hover:opacity-70"
            >
              Start accepting payments
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </motion.a>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, ease }}
            className="flex h-full justify-center lg:justify-end"
          >
            <DashboardPreview />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
