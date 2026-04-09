"use client";

import { type ReactNode } from "react";
import { motion } from "motion/react";
import { Quote } from "lucide-react";

const ease = [0.16, 1, 0.3, 1] as const;

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "We were rejected by three traditional processors. PayVantage had us live in under an hour with zero underwriting headaches.",
    name: "Marcus R.",
    role: "Founder",
    company: "DigitalGoods Inc.",
  },
  {
    quote:
      "Chargebacks were eating 8% of our revenue. Since switching to PayVantage, that number is literally zero.",
    name: "Priya K.",
    role: "Head of Payments",
    company: "StreamVault",
  },
  {
    quote:
      "Settlement in minutes instead of 30 days completely changed our cash flow. We can reinvest in inventory the same day.",
    name: "James L.",
    role: "CEO",
    company: "GreenLeaf Supplements",
  },
  {
    quote:
      "The WooCommerce plugin took five minutes to install. Our first stablecoin settlement hit our wallet before lunch.",
    name: "Elena T.",
    role: "E-Commerce Director",
    company: "NovaPay Systems",
  },
];

export function TestimonialsSlider(): ReactNode {
  return (
    <section className="relative w-full overflow-hidden bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mb-16 text-center font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl"
        >
          Trusted by Merchants Everywhere
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 * index, ease }}
              className="flex flex-col rounded-xl border border-border bg-muted/30 p-6 sm:p-8"
            >
              <Quote className="mb-4 h-6 w-6 text-accent/40" />
              <p className="flex-1 text-base leading-relaxed text-foreground/80">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-sm font-semibold text-foreground">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
