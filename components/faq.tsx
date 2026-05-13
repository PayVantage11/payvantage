"use client";

import { useState, type ReactNode } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type FAQItem = {
  question: string;
  answer: string;
};

const faqs: FAQItem[] = [
  {
    question: "What is PayVantage?",
    answer:
      "PayVantage is a payment processing company built for high-risk merchants. We offer two solutions: traditional card processing through our banking network with approvals in 48–72 hours, and a USDC settlement option where card payments settle instantly to your Polygon wallet with zero chargebacks. We work with peptides, supplements, nutraceuticals, and other high-risk verticals that mainstream processors won't serve.",
  },
  {
    question: "Do you offer chargeback protection?",
    answer:
      "On our USDC settlement rail, chargebacks are eliminated entirely. Card payments are converted to stablecoins on-chain, and blockchain transactions are irreversible by design. On our traditional card processing rail, chargebacks function normally but we work with processors experienced in high-risk verticals to minimize disputes.",
  },
  {
    question: "What are the fees?",
    answer:
      "Our USDC settlement rail is 6% per transaction — flat, no monthly fees, no setup costs. For traditional card processing, rates are custom based on your industry and volume. No monthly minimums or equipment fees on either option. Book a call and we'll walk you through which option fits your business.",
  },
  {
    question: "How fast is settlement?",
    answer:
      "On our USDC rail, funds settle to your Polygon wallet within minutes of each transaction — no batching, no waiting. On our traditional processing rail, settlement follows standard banking timelines, typically 1–2 business days to your bank account.",
  },
  {
    question: "Do I need underwriting approval?",
    answer:
      "For our USDC rail, no underwriting is needed — book a call, confirm fit, and you can be live the same day. For traditional card processing, our processor partners handle underwriting and approvals are typically completed in 48–72 hours. We'll help you gather the required documents to make it as fast as possible.",
  },
];

function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}): ReactNode {
  const answerId = `faq-answer-${index}`;
  const questionId = `faq-question-${index}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease }}
      className="border-b border-foreground/10"
    >
      <button
        type="button"
        id={questionId}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={answerId}
        className="group flex w-full cursor-pointer items-center justify-between py-6 text-left"
      >
        <span className="pr-8 text-base font-medium text-foreground sm:text-lg">
          {item.question}
        </span>
        <div className="flex h-6 w-6 shrink-0 items-center justify-center">
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2, ease }}
          >
            <Plus
              className="h-5 w-5 text-foreground/60 transition-colors group-hover:text-foreground"
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={answerId}
            role="region"
            aria-labelledby={questionId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl pb-6 leading-relaxed text-foreground/60">
              {item.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQ(): ReactNode {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative w-full overflow-hidden bg-background py-24 sm:py-32">
      <div className="relative mx-auto max-w-7xl px-0 xl:px-12">
        <div className="px-8 sm:px-12">
          <div className="mb-12 max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease }}
              className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              Frequently asked questions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease }}
              className="mt-4 text-foreground/60"
            >
              Everything you need to know about PayVantage.
            </motion.p>
          </div>

          <div className="border-t border-foreground/10">
            {faqs.map((faq, index) => (
              <FAQAccordionItem
                key={faq.question}
                item={faq}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                index={index}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <p className="text-foreground/60">Still have questions?</p>
            <a
              href="mailto:support@pay-vantage.com"
              className="group inline-flex items-center gap-2 font-medium text-foreground transition-opacity hover:opacity-70"
            >
              Get in touch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
