/**
 * ============================================================================
 * SITE CONFIGURATION
 * ============================================================================
 */

export const siteConfig = {
  name: "PayVantage",
  tagline: "The High-Risk Payment Gateway Powered by Stablecoins",
  description:
    "Accept payments without underwriting delays, chargebacks, or rolling reserves. PayVantage uses card-to-crypto onramping and stablecoin settlement for instant, irreversible payments.",
  url: "https://payvantage.io",
  twitter: "@payvantage",

  nav: {
    cta: {
      text: "Get Started",
      href: "/signup",
    },
    signIn: {
      text: "Sign in",
      href: "/login",
    },
  },
} as const;

export const heroConfig = {
  headline: {
    line1: "Payments that",
    line2: "just work",
  },
  description:
    "The high-risk payment gateway powered by stablecoins. No underwriting, instant settlement, zero chargebacks.",
  cta: {
    primary: {
      text: "Start Accepting Payments",
      href: "/signup",
    },
    secondary: {
      text: "Book a Demo",
      href: "#",
    },
  },
} as const;

export const trustedByConfig = {
  title: "Trusted by high-risk merchants worldwide",
} as const;

export const featureCardsConfig = {
  title: "The new standard",
  subtitle: "for high-risk payments",
} as const;

export const featureHighlightConfig = {
  features: [
    {
      icon: "trending-up",
      text: "Real-time settlement tracking and stablecoin balance monitoring.",
    },
    {
      icon: "message-square",
      text: "Instant webhook notifications for every payment event.",
    },
  ],
} as const;

export const principlesConfig = {
  title: "Built on principles that matter",
} as const;

export const statsConfig = {
  stats: [
    { value: 1.2, suffix: "B+", prefix: "$", label: "Settled in stablecoins" },
    { value: 99.9, suffix: "%", label: "Uptime guarantee" },
    { value: 85, suffix: "+", label: "Countries supported" },
    { value: 12, suffix: "K+", label: "Active merchants" },
  ],
} as const;

export const testimonialsConfig = {
  title: "Trusted by Merchants Everywhere",
} as const;

export const pricingConfig = {
  title: "Simple, transparent pricing",
  trustBadge: "Trusted by 12,000+ merchants",
} as const;

export const faqConfig = {
  title: "Frequently Asked Questions",
  contact: {
    text: "Still have questions?",
    cta: {
      text: "Contact Support",
      href: "mailto:support@payvantage.io",
    },
  },
} as const;

export const blogConfig = {
  title: "Latest from our blog",
  description:
    "Insights on high-risk payments, stablecoin settlement, and merchant growth strategies.",
  cta: {
    text: "View all articles",
    href: "#",
  },
} as const;

export const finalCtaConfig = {
  headline: "Ready to accept payments without limits?",
  description:
    "Join thousands of merchants already using PayVantage for instant, chargeback-free stablecoin settlement.",
  cta: {
    text: "Get Started Free",
    href: "/signup",
  },
} as const;

export const footerConfig = {
  description:
    "The high-risk payment gateway built on stablecoins. Instant settlement, zero chargebacks, and no rolling reserves.",
  cta: {
    text: "Start Accepting Payments",
    href: "/signup",
  },
  links: {
    product: [
      { label: "Merchants", href: "#" },
      { label: "Enterprise", href: "#" },
      { label: "Integrations", href: "#" },
      { label: "API Docs", href: "#" },
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    legal: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "Security", href: "#" },
    ],
  },
  contact: {
    location: "Miami",
    address: "1395 Brickell Ave, Suite 800\nMiami, FL 33131",
    hours: "Mon-Fri 9:00 am - 6:00 pm (EST)",
    email: "hello@payvantage.io",
  },
  copyright: `© ${new Date().getFullYear()} PayVantage Inc. All rights reserved.`,
} as const;

/**
 * ============================================================================
 * FEATURE FLAGS
 * ============================================================================
 */
export const features = {
  smoothScroll: true,
  darkMode: true,
  statsSection: true,
  blogSection: true,
  testimonialsSection: true,
} as const;

/**
 * ============================================================================
 * THEME CONFIGURATION
 * ============================================================================
 */
export const themeConfig = {
  defaultTheme: "system" as "light" | "dark" | "system",
  enableSystemTheme: true,
} as const;
