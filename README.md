# Finance Template

A premium Next.js 15+ landing page template designed for fintech, banking, and financial services. Features a modern, professional design with comprehensive SEO, accessibility, and performance optimizations.

## Features

- ✅ **Next.js 15+** with App Router
- ✅ **TypeScript** (strict mode)
- ✅ **Tailwind CSS v4** with design tokens
- ✅ **Dark theme** (fixed; no light mode flash)
- ✅ **Motion** via motion/react with reduced-motion support
- ✅ **Smooth Scroll** via Lenis with feature flag
- ✅ **SEO Ready** - metadata, Open Graph, Twitter cards
- ✅ **Accessibility** - skip links, focus rings, ARIA labels
- ✅ **Edge Compatible** - no Node-only APIs

## Sections Included

- **Hero** - 3D animated background with CTA
- **Trusted By** - Logo carousel/marquee
- **Feature Cards** - Interactive feature showcase
- **Feature Highlight** - Phone mockup with details
- **Principles** - Company values section
- **Stats** - Animated statistics counters
- **Testimonials** - Auto-scrolling slider with LinkedIn links
- **Pricing** - 3-tier pricing cards
- **FAQ** - Accessible accordion
- **Blog Showcase** - Latest articles grid
- **Final CTA** - Call-to-action with 3D background
- **Footer** - Links, legal, and contact info

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typecheck` | Run TypeScript type checking |

## Project Structure

```
├── app/
│   ├── globals.css        # Design tokens & base styles
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home page
│   ├── robots.ts          # Dynamic robots.txt
│   └── sitemap.ts         # Dynamic sitemap
├── components/
│   ├── blog-showcase.tsx  # Blog articles section
│   ├── faq.tsx            # FAQ accordion
│   ├── feature-cards.tsx  # Feature cards
│   ├── feature-highlight.tsx # Phone mockup section
│   ├── final-cta.tsx      # Final CTA section
│   ├── footer.tsx         # Footer
│   ├── header.tsx         # Navigation header
│   ├── hero.tsx           # Hero section
│   ├── pricing.tsx        # Pricing cards
│   ├── principles.tsx     # Principles section
│   ├── providers.tsx      # Scroll & motion providers
│   ├── smooth-scroll.tsx  # Lenis smooth scroll
│   ├── stats.tsx          # Stats section
│   ├── testimonials-slider.tsx # Testimonials
│   └── trusted-by.tsx     # Logo carousel
├── lib/
│   ├── config.ts          # Site config & feature flags
│   ├── metadata.ts        # SEO metadata utilities
│   └── motion.tsx         # Motion components & hooks
└── public/
    └── site.webmanifest   # PWA manifest
```

## Customization

### 1. Update Site Configuration

Edit `lib/config.ts` to update:
- Site name, tagline, and description
- Navigation links
- Section content and CTAs
- Feature flags

Edit `lib/metadata.ts` to update:
- SEO metadata and keywords
- Open Graph images
- Social media handles

### 2. Feature Flags

Toggle features in `lib/config.ts`:

```typescript
export const features = {
  smoothScroll: true,    // Lenis smooth scrolling
  darkMode: true,        // Theme toggle
  statsSection: true,    // Stats section
  blogSection: true,     // Blog showcase
  testimonialsSection: true, // Testimonials slider
};
```

### 3. Replace Icons

Replace the following files with your brand assets:
- `app/icon.svg` - Favicon (32x32)
- `app/apple-icon.svg` - Apple touch icon (180x180)
- `public/og-image.png` - Open Graph image (1200x630)

### 4. Customize Design Tokens

Edit `app/globals.css` to modify:
- Color palette (--accent for brand color)
- Background and foreground colors
- Border and muted colors

## Design System

### Colors
- `--background` / `--foreground` - Page background and text
- `--muted` / `--muted-foreground` - Subtle backgrounds and text
- `--accent` - Primary brand color (blue by default)
- `--border` / `--ring` - Borders and focus rings

### Typography
- Font: Geist Sans & Geist Mono
- Serif headings use font-serif class

## Accessibility

The template includes:
- Skip-to-content link
- Visible focus rings (keyboard navigation)
- ARIA labels on interactive elements
- Reduced motion support
- Proper heading hierarchy
- WCAG 2.1 AA contrast compliance

## Performance

- Optimized images with Next.js Image component
- Smooth scroll respects reduced-motion preferences
- Code splitting via dynamic imports
- Edge-compatible runtime

## License

This template is licensed for use in commercial projects. You may not resell or redistribute the template itself.

---

Built with ❤️ using Next.js, Tailwind CSS, and Motion
