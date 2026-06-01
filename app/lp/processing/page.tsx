import { LpCta } from "@/components/lp-cta";
import {
  ArrowRight,
  Check,
  Layers,
  Lock,
  ShieldCheck,
  Store,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
//  Real, defensible trust numbers. Update as the business grows — keep them
//  honest; do not publish claims you can't back up.
// ─────────────────────────────────────────────────────────────────────────────
const STATS: { value: string; label: string }[] = [
  { value: "$130K+", label: "Processed for high-risk merchants" },
  { value: "40+", label: "Merchants live on our rails" },
  { value: "Days", label: "Typical time to approval" },
  { value: "7", label: "Rails in the network" },
];

const VERTICALS = "peptides, supplements, nutraceuticals & high-risk e-commerce";

export const metadata: Metadata = {
  title: "Get Approved for High-Risk Payment Processing | PayVantage",
  description:
    "Declined or dropped by Stripe, PayPal, or your processor? PayVantage is a multi-rail payment processing network that gets peptide, supplement, nutraceutical, and high-risk merchants approved fast — without frozen funds.",
  robots: { index: false, follow: false }, // paid LP — keep out of organic index
  alternates: { canonical: "/lp/processing" },
};

const BENEFITS: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <Zap className="h-5 w-5" aria-hidden />,
    title: "Get approved fast",
    body: "No endless underwriting limbo. We move quickly to get you live and accepting payments — built for merchants who needed processing yesterday.",
  },
  {
    icon: <Layers className="h-5 w-5" aria-hidden />,
    title: "Multiple rails, fewer declines",
    body: "One processor can drop you overnight. Our network places you across multiple acquiring rails, so a single 'no' doesn't shut your business down.",
  },
  {
    icon: <Lock className="h-5 w-5" aria-hidden />,
    title: "No frozen funds",
    body: "Stop losing sleep over surprise holds and account freezes. We're built around keeping high-risk revenue flowing to you, not trapping it.",
  },
  {
    icon: <ShieldCheck className="h-5 w-5" aria-hidden />,
    title: "Built for high-risk",
    body: "We don't flinch at the verticals mainstream processors reject. High-risk isn't an exception here — it's the whole business.",
  },
];

const STEPS: { n: string; title: string; body: string }[] = [
  {
    n: "1",
    title: "Tell us about your business",
    body: "A short signup — your company and what you sell. No paperwork to dig up to get started.",
  },
  {
    n: "2",
    title: "We match you to rails",
    body: "We place you on the acquiring rails that accept your vertical and your volume.",
  },
  {
    n: "3",
    title: "Start getting paid",
    body: "Plug into your existing store and start processing. We keep you covered if a rail ever changes.",
  },
];

export default function ProcessingLandingPage(): ReactNode {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* minimal header — logo only, no nav escape routes */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2.5">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-[11px] font-black text-background"
            aria-hidden
          >
            PV
          </span>
          <span className="text-sm font-bold uppercase tracking-[0.14em]">
            PayVantage
          </span>
        </div>
        <LpCta className="hidden rounded-full border border-border px-4 py-2 text-xs font-semibold transition-colors hover:bg-muted sm:inline-flex">
          Get approved
        </LpCta>
      </header>

      {/* ── HERO ── */}
      <section className="mx-auto max-w-3xl px-5 pb-16 pt-10 text-center sm:pt-16">
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Payment processing network for high-risk merchants
        </p>
        <h1 className="text-balance font-serif text-4xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
          Declined or dropped by your processor?
          <br className="hidden sm:block" /> Get approved.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          PayVantage is a multi-rail payment processing network built for{" "}
          {VERTICALS} — the businesses Stripe, PayPal, and traditional
          processors freeze and reject. We get you on rails that accept you.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <LpCta className="inline-flex h-13 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-semibold text-background transition-transform active:scale-[0.98] sm:w-auto">
            Get set up <ArrowRight className="h-4 w-4" aria-hidden />
          </LpCta>
          <p className="text-xs text-muted-foreground">
            Takes 2 minutes · No paperwork to start
          </p>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-px px-5 py-2 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="px-2 py-6 text-center">
              <div className="font-serif text-3xl font-medium tracking-tight sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1.5 text-xs leading-snug text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <h2 className="mb-10 text-center font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          Built for the merchants everyone else declines
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="rounded-2xl border border-border bg-muted/30 p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                {b.icon}
              </div>
              <h3 className="text-lg font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {b.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OBJECTION HANDLING ── */}
      <section className="border-t border-border bg-muted/40">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-5 py-12 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Store className="h-5 w-5" aria-hidden />
          </div>
          <h2 className="font-serif text-2xl font-medium tracking-tight sm:text-3xl">
            Works with the store you already have
          </h2>
          <p className="max-w-xl text-muted-foreground">
            Install our WooCommerce plugin and keep selling — no rebuild, no
            migration headache. You bring the store; we bring the rails.
          </p>
          <ul className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            {["WooCommerce plugin", "Custom checkout"].map((x) => (
              <li key={x} className="inline-flex items-center gap-2">
                <Check className="h-4 w-4 text-accent" aria-hidden />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <h2 className="mb-10 text-center font-serif text-3xl font-medium tracking-tight sm:text-4xl">
          From declined to processing in 3 steps
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="text-center sm:text-left">
              <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border font-serif text-lg font-medium">
                {s.n}
              </div>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── REPEAT CTA ── */}
      <section className="mx-auto max-w-3xl px-5 pb-20">
        <div className="rounded-3xl border border-border bg-muted/50 px-6 py-12 text-center">
          <h2 className="text-balance font-serif text-3xl font-medium tracking-tight sm:text-4xl">
            Stop getting declined. Start getting paid.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Get set up on rails built for {VERTICALS}.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <LpCta className="inline-flex h-13 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-foreground px-8 text-base font-semibold text-background transition-transform active:scale-[0.98] sm:w-auto">
              Get approved <ArrowRight className="h-4 w-4" aria-hidden />
            </LpCta>
            <p className="text-xs text-muted-foreground">
              2-minute signup · No paperwork to start
            </p>
          </div>
        </div>
      </section>

      {/* minimal legal footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-muted-foreground sm:flex-row">
          <span>
            © {new Date().getFullYear()} PayVantage. Payment processing network.
          </span>
          <a
            href="mailto:hwayner@vantagecapitalinsights.com"
            className="transition-colors hover:text-foreground"
          >
            Harrison Wayner · hwayner@vantagecapitalinsights.com
          </a>
        </div>
      </footer>
    </div>
  );
}
