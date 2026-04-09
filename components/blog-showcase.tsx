"use client";

import { type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

type Article = {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  href: string;
};

const articles: Article[] = [
  {
    title: "Why Stablecoin Settlement Eliminates Chargebacks for Good",
    excerpt:
      "Once a payment is on-chain, it's irreversible. Learn how card-to-crypto onramping makes chargeback fraud a thing of the past.",
    category: "Product",
    date: "Apr 5, 2026",
    readTime: "4 min read",
    href: "#",
  },
  {
    title: "The True Cost of High-Risk Payment Processing in 2026",
    excerpt:
      "Rolling reserves, excessive fees, and surprise holds. We break down what traditional processors really charge high-risk merchants.",
    category: "Industry",
    date: "Mar 28, 2026",
    readTime: "6 min read",
    href: "#",
  },
  {
    title: "How to Integrate PayVantage with WooCommerce in 5 Minutes",
    excerpt:
      "A step-by-step guide to installing our plugin, entering your API keys, and accepting your first stablecoin-settled payment.",
    category: "Tutorial",
    date: "Mar 20, 2026",
    readTime: "3 min read",
    href: "#",
  },
];

function ArticleCard({
  article,
  index,
}: {
  article: Article;
  index: number;
}): ReactNode {
  return (
    <motion.a
      href={article.href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index, ease }}
      className="group block"
    >
      <div className="relative mb-4 aspect-4/3 overflow-hidden rounded-md bg-muted">
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5">
          <span className="text-4xl font-bold text-accent/20">
            {article.category.charAt(0)}
          </span>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs font-medium text-accent">
          {article.category}
        </span>
        <span className="text-xs text-muted-foreground">&middot;</span>
        <span className="text-xs text-muted-foreground">{article.date}</span>
        <span className="text-xs text-muted-foreground">&middot;</span>
        <span className="text-xs text-muted-foreground">
          {article.readTime}
        </span>
      </div>
      <h3 className="text-lg font-medium text-foreground transition-colors group-hover:text-accent">
        {article.title}
      </h3>
    </motion.a>
  );
}

export function BlogShowcase(): ReactNode {
  return (
    <section className="relative w-full bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease }}
          >
            <h2 className="font-serif text-3xl font-medium leading-tight text-foreground sm:text-4xl lg:text-5xl">
              Latest from our blog
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              Insights on high-risk payments, stablecoin settlement, and
              merchant growth strategies.
            </p>
          </motion.div>
          <motion.a
            href="#"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
          >
            View all articles
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </motion.a>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticleCard
              key={article.title}
              article={article}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
