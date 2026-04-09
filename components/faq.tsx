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
      "PayVantage is a payment gateway designed for high-risk merchants. We use card-to-crypto onramping via the PayRam API to convert card payments into stablecoins (USDC/USDT), giving you instant settlement without chargebacks or rolling reserves.",
  },
  {
    question: "How does chargeback immunity work?",
    answer:
      "Once a cardholder completes a payment, their funds are converted to stablecoins on-chain. Blockchain transactions are irreversible, eliminating the traditional chargeback risk. Disputes are handled through our merchant support process, not bank reversals.",
  },
  {
    question: "What are the fees?",
    answer:
      "Our standard rate is 2.9% + $0.30 per transaction. There are no monthly fees, no setup fees, and no rolling reserves. Enterprise merchants with high volume can contact us for custom pricing.",
  },
  {
    question: "How fast is settlement?",
    answer:
      "Most payments are settled to your stablecoin wallet within 5 minutes of the customer completing checkout. Compare that to 30+ days with traditional high-risk processors.",
  },
  {
    question: "Do I need underwriting approval?",
    answer:
      "No. Because payments settle in stablecoins rather than through traditional banking rails, there is no underwriting process. Sign up, connect your wallet, and start accepting payments in minutes.",
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
              href="mailto:support@payvantage.io"
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
