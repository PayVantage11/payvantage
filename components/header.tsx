"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, useRef, useEffect, type ReactNode } from "react";

type NavItem = {
  label: string;
  href?: string;
  hasDropdown?: boolean;
  items?: { label: string; description: string; href: string }[];
};

const navLinks: NavItem[] = [
  {
    label: "Products",
    hasDropdown: true,
    items: [
      {
        label: "Traditional Processing",
        description: "High-risk card processing with fast approvals",
        href: "/book-demo",
      },
      {
        label: "USDC Settlement",
        description: "Card checkout with instant USDC settlement",
        href: "/products/instant-settlement",
      },
      {
        label: "WooCommerce Plugin",
        description: "Plugin, Merchant ID, go live in minutes",
        href: "/docs",
      },
      {
        label: "API & SDKs",
        description: "REST API, webhooks, and integration docs",
        href: "/docs",
      },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
  {
    label: "Docs",
    href: "/docs",
  },
];

const ease = [0.23, 1, 0.32, 1] as const;

function DesktopDropdownLink({
  item,
}: {
  item: { label: string; description: string; href: string };
}): ReactNode {
  const className =
    "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted";
  const inner = <span className="truncate">{item.label}</span>;
  if (item.href.startsWith("/")) {
    return (
      <Link href={item.href} className={className} title={item.description}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={item.href} className={className} title={item.description}>
      {inner}
    </a>
  );
}

function MobileNavLeaf({
  item,
  onNavigate,
}: {
  item: { label: string; description: string; href: string };
  onNavigate: () => void;
}): ReactNode {
  const className =
    "block py-2 text-sm text-foreground/80 hover:text-foreground";
  if (item.href.startsWith("/")) {
    return (
      <Link href={item.href} className={className} onClick={onNavigate}>
        {item.label}
      </Link>
    );
  }
  return (
    <a href={item.href} className={className} onClick={onNavigate}>
      {item.label}
    </a>
  );
}

function HamburgerIcon({
  isOpen,
  color = "white",
}: {
  isOpen: boolean;
  color?: string;
}): ReactNode {
  return (
    <div className="relative flex h-4 w-6 cursor-pointer flex-col justify-between">
      <motion.span
        className="block h-0.5 w-full origin-center rounded-full"
        style={{ backgroundColor: color }}
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease }}
      />
      <motion.span
        className="block h-0.5 w-full origin-center rounded-full"
        style={{ backgroundColor: color }}
        animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.span
        className="block h-0.5 w-full origin-center rounded-full"
        style={{ backgroundColor: color }}
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25, ease }}
      />
    </div>
  );
}

function DesktopDropdown({
  label,
  items,
  isOpen,
  onOpen,
  onClose,
}: {
  label: string;
  items: { label: string; description: string; href: string }[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}): ReactNode {
  return (
    <div
      className="relative z-[10020]"
      onMouseEnter={onOpen}
      onMouseLeave={onClose}
    >
      <button
        type="button"
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {label}
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease }}
        >
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen ? (
          <div
            className="absolute left-1/2 top-full z-[10021] min-w-[13.5rem] -translate-x-1/2 pt-2"
            role="presentation"
          >
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.2, ease }}
              className="overflow-hidden rounded-2xl border border-border/90 bg-background p-1.5 shadow-xl ring-1 ring-white/10"
            >
              <div className="flex flex-col gap-0.5">
                {items.map((item) => (
                  <DesktopDropdownLink key={item.label} item={item} />
                ))}
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function MobileExpandable({
  label,
  items,
  isExpanded,
  onToggle,
  onClose,
}: {
  label: string;
  items: { label: string; description: string; href: string }[];
  isExpanded: boolean;
  onToggle: () => void;
  onClose: () => void;
}): ReactNode {
  return (
    <div className="border-b border-foreground/10">
      <button
        className="flex w-full items-center justify-between py-4 text-base font-medium text-foreground"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        {label}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown
            className="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </motion.div>
      </button>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-1 pb-2">
              {items.map((item) => (
                <MobileNavLeaf
                  key={item.label}
                  item={item}
                  onNavigate={onClose}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Header(): ReactNode {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
    setMobileExpanded(null);
  };

  const handleMenuOpen = (label: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setActiveMenu(label);
  };

  const handleMenuClose = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 220);
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        className="pointer-events-none fixed top-0 left-0 z-1001 h-25 w-full"
        style={{
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          maskImage: "linear-gradient(black 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(black 0%, black 40%, transparent 100%)",
        }}
        aria-hidden="true"
      />

      <header className="fixed top-0 right-0 left-0 z-[10020] hidden mix-blend-exclusion lg:block">
        <div className="mx-auto flex h-20 w-full items-center justify-between px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Home"
            >
              <div
                className="h-6 w-6 rounded-full bg-white"
                aria-hidden="true"
              />
              <span className="text-lg font-semibold text-white">
                PayVantage
              </span>
            </Link>
          </motion.div>

          <motion.nav
            className="absolute left-1/2 flex -translate-x-1/2 items-center gap-1"
            aria-label="Main navigation"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            {navLinks.map((link) =>
              link.hasDropdown && link.items ? (
                <DesktopDropdown
                  key={link.label}
                  label={link.label}
                  items={link.items}
                  isOpen={activeMenu === link.label}
                  onOpen={() => handleMenuOpen(link.label)}
                  onClose={handleMenuClose}
                />
              ) : (
                <Link
                  key={link.label}
                  href={link.href ?? "#"}
                  className="px-4 py-2 text-sm font-semibold tracking-tight text-white/80 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              )
            )}
          </motion.nav>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease }}
          >
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold tracking-tighter text-black transition-colors hover:bg-white/90"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-full border border-white px-5 py-2.5 text-sm font-semibold tracking-tighter text-white transition-colors hover:bg-white/10"
            >
              Sign up
            </Link>
          </motion.div>
        </div>
      </header>

      <header className="fixed top-0 right-0 left-0 z-[10020] mix-blend-exclusion lg:hidden">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-6 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease }}
          >
            <Link
              href="/"
              className="flex items-center gap-2"
              aria-label="Home"
            >
              <div
                className="h-6 w-6 rounded-full bg-white"
                aria-hidden="true"
              />
              <span className="text-lg font-semibold text-white">
                PayVantage
              </span>
            </Link>
          </motion.div>
          <motion.button
            className="-mr-2 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
          >
            <HamburgerIcon isOpen={false} color="white" />
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed top-0 right-0 left-0 z-[10030] bg-background lg:hidden"
          >
            <div className="flex h-16 w-full items-center justify-between px-6 sm:px-8">
              <Link
                href="/"
                className="flex items-center gap-2"
                aria-label="Home"
                onClick={closeMobileMenu}
              >
                <div
                  className="h-6 w-6 rounded-full bg-foreground"
                  aria-hidden="true"
                />
                <span className="text-lg font-semibold text-foreground">
                  PayVantage
                </span>
              </Link>
              <button
                className="-mr-2 p-2"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <HamburgerIcon isOpen={true} color="currentColor" />
              </button>
            </div>

            <nav
              className="max-h-[calc(100vh-4rem)] overflow-y-auto px-6 py-4"
              aria-label="Mobile navigation"
            >
              {navLinks.map((link) =>
                link.hasDropdown && link.items ? (
                  <MobileExpandable
                    key={link.label}
                    label={link.label}
                    items={link.items}
                    isExpanded={mobileExpanded === link.label}
                    onToggle={() =>
                      setMobileExpanded(
                        mobileExpanded === link.label ? null : link.label
                      )
                    }
                    onClose={closeMobileMenu}
                  />
                ) : (
                  <Link
                    key={link.label}
                    href={link.href ?? "#"}
                    className="block border-b border-border py-4 text-base font-medium text-foreground"
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                )
              )}

              <div className="flex flex-col gap-3 pt-6">
                <Link
                  href="/login"
                  className="w-full rounded-full bg-foreground py-3 text-center text-sm font-medium tracking-tight text-background transition-colors hover:bg-foreground/90"
                  onClick={closeMobileMenu}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="w-full rounded-full border border-border py-3 text-center text-sm font-medium tracking-tight text-foreground transition-colors hover:bg-muted"
                  onClick={closeMobileMenu}
                >
                  Sign up
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
