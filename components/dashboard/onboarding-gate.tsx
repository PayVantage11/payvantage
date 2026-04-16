"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

/**
 * If middleware ever misses, merchants without a completed profile still see
 * a blocking prompt to finish onboarding (any /dashboard route except onboarding).
 */
export function OnboardingGate({
  needsOnboarding,
}: {
  needsOnboarding: boolean;
}): ReactNode {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const onOnboarding =
    pathname === "/dashboard/onboarding" ||
    pathname.startsWith("/dashboard/onboarding/");

  useEffect(() => {
    setOpen(Boolean(needsOnboarding) && !onOnboarding);
  }, [needsOnboarding, onOnboarding]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-gate-title"
    >
      <div className="max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
        <h2
          id="onboarding-gate-title"
          className="text-lg font-semibold text-foreground"
        >
          Complete onboarding
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Finish your business and payout details so we can review your
          application. This only takes a few minutes.
        </p>
        <Link
          href="/dashboard/onboarding"
          onClick={() => setOpen(false)}
          className="mt-6 flex h-11 w-full items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
        >
          Continue to onboarding
        </Link>
      </div>
    </div>
  );
}
