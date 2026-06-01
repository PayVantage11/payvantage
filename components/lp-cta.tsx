"use client";

import type { ReactNode } from "react";

const SIGNUP_HREF = "/signup?src=meta";

/**
 * CTA used across the /lp/processing paid-traffic landing page.
 * - Routes to /signup?src=meta so leads from Meta ads are attributable.
 * - Fires a mid-funnel Meta Pixel signal (InitiateCheckout) on click so ad
 *   campaigns have something to optimize on while Lead volume is still low.
 * - fbq is guarded so it never throws if the pixel is blocked or not loaded.
 */
export function LpCta({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  function handleClick(): void {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", "InitiateCheckout");
    }
  }

  return (
    <a href={SIGNUP_HREF} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}
