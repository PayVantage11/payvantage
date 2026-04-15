"use client";

import { useReducedMotion } from "@/lib/motion";
import { motion, useMotionValue, useSpring } from "motion/react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const PRODUCT_HERO_NATIVE_CURSOR_SELECTOR = "[data-pv-native-cursor='true']";

const MORPH_SELECTOR =
  "a, button, [role='button'], input[type='submit'], input[type='button'], input[type='reset']";

function usePointerFine(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

function useCursorDisabled(pathname: string | null): boolean {
  if (!pathname) return true;
  if (pathname.startsWith("/dashboard")) return true;
  if (pathname.startsWith("/admin")) return true;
  if (pathname === "/login" || pathname === "/signup") return true;
  return false;
}

function parseCssLengthToPx(token: string): number {
  const t = token.trim();
  if (!t || t === "0") return 0;
  if (t.endsWith("px")) {
    const n = Number.parseFloat(t);
    return Number.isNaN(n) ? 0 : n;
  }
  if (t.endsWith("rem")) {
    const root =
      Number.parseFloat(getComputedStyle(document.documentElement).fontSize) ||
      16;
    const n = Number.parseFloat(t);
    return Number.isNaN(n) ? 0 : n * root;
  }
  return 0;
}

function readBorderRadius(el: HTMLElement): string {
  const rect = el.getBoundingClientRect();
  const w = rect.width;
  const h = rect.height;
  if (w <= 0 || h <= 0) return "9999px";

  const minSide = Math.min(w, h);
  const maxSide = Math.max(w, h);

  const raw = getComputedStyle(el).borderRadius.trim();
  const firstToken = raw.split(/[\s,]+/).find((t) => t.length > 0) ?? raw;

  let declaredPx = parseCssLengthToPx(firstToken);

  const isIntentionalCircle =
    raw.includes("9999") ||
    raw.includes("50%") ||
    (maxSide > 0 && minSide / maxSide > 0.88 && minSide >= 28);

  if (isIntentionalCircle) {
    return `${minSide / 2}px`;
  }

  // Wide rows (nav, lists): cap radius so the ring stays rectangular, not a stadium.
  const maxForBar = Math.min(10, Math.max(4, Math.floor(minSide * 0.2)));
  if (declaredPx > 0) {
    return `${Math.min(declaredPx, maxForBar)}px`;
  }

  if (maxSide > 0 && minSide / maxSide > 0.88 && h <= 56) {
    return `${minSide / 2}px`;
  }

  return `${maxForBar}px`;
}

type MorphState = {
  el: HTMLElement;
  rect: DOMRect;
  radius: string;
};

export function CustomCursor(): ReactNode {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const pointerFine = usePointerFine();
  const disabledRoute = useCursorDisabled(pathname);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [morph, setMorph] = useState<MorphState | null>(null);
  const [useNativeCursorZone, setUseNativeCursorZone] = useState(false);
  const nativeZoneRef = useRef(false);

  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const dotX = useSpring(mx, { stiffness: 520, damping: 34, mass: 0.22 });
  const dotY = useSpring(my, { stiffness: 520, damping: 34, mass: 0.22 });

  const syncMorphRect = useCallback(() => {
    setMorph((prev) => {
      if (!prev) return prev;
      try {
        const rect = prev.el.getBoundingClientRect();
        return { ...prev, rect, radius: readBorderRadius(prev.el) };
      } catch {
        return null;
      }
    });
  }, []);

  const enabledBase =
    pointerFine && !reduceMotion && !disabledRoute && active && !useNativeCursorZone;

  useEffect(() => {
    if (!morph) return;
    const onScrollOrResize = () => syncMorphRect();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [morph, syncMorphRect]);

  useEffect(() => {
    if (!pointerFine || reduceMotion || disabledRoute) {
      document.documentElement.classList.remove("pv-custom-cursor");
      nativeZoneRef.current = false;
      queueMicrotask(() => {
        setActive(false);
        setMorph(null);
        setUseNativeCursorZone(false);
        mx.set(-200);
        my.set(-200);
      });
      return;
    }

    const move = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      const hit = document.elementFromPoint(x, y);
      const inProductHeroCard = Boolean(
        hit?.closest(PRODUCT_HERO_NATIVE_CURSOR_SELECTOR),
      );

      if (inProductHeroCard !== nativeZoneRef.current) {
        nativeZoneRef.current = inProductHeroCard;
        setUseNativeCursorZone(inProductHeroCard);
      }

      if (inProductHeroCard) {
        document.documentElement.classList.remove("pv-custom-cursor");
        setMorph(null);
        setActive(true);
        setPos({ x, y });
        mx.set(x);
        my.set(y);
        return;
      }

      if (!document.documentElement.classList.contains("pv-custom-cursor")) {
        document.documentElement.classList.add("pv-custom-cursor");
      }
      setActive(true);
      setPos({ x, y });
      mx.set(x);
      my.set(y);

      const target = hit?.closest(MORPH_SELECTOR) as HTMLElement | null;

      if (target && document.contains(target)) {
        const rect = target.getBoundingClientRect();
        const radius = readBorderRadius(target);
        setMorph((prev) =>
          prev?.el === target
            ? { ...prev, rect, radius }
            : { el: target, rect, radius },
        );
      } else {
        setMorph(null);
      }
    };

    const leave = () => {
      document.documentElement.classList.remove("pv-custom-cursor");
      nativeZoneRef.current = false;
      setUseNativeCursorZone(false);
      setActive(false);
      setMorph(null);
      mx.set(-200);
      my.set(-200);
    };

    window.addEventListener("mousemove", move);
    document.addEventListener("mouseleave", leave);

    return () => {
      window.removeEventListener("mousemove", move);
      document.removeEventListener("mouseleave", leave);
      document.documentElement.classList.remove("pv-custom-cursor");
    };
  }, [pointerFine, reduceMotion, disabledRoute, mx, my]);

  if (!enabledBase) return null;

  const ringSpring = {
    type: "spring" as const,
    stiffness: 520,
    damping: 38,
    mass: 0.35,
  };

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10050] box-border border-2 border-accent/75 bg-transparent shadow-[0_0_20px_rgba(59,130,246,0.12)] dark:border-accent/85 dark:shadow-[0_0_26px_rgba(59,130,246,0.2)]"
        style={{
          // Do not spring borderRadius: animating from the default circle (9999) toward
          // the target leaves long-lived "pill" radii that do not match the hovered control.
          borderRadius: morph ? morph.radius : "9999px",
        }}
        initial={false}
        animate={
          morph
            ? {
                left: morph.rect.left,
                top: morph.rect.top,
                width: Math.max(1, morph.rect.width),
                height: Math.max(1, morph.rect.height),
              }
            : {
                left: pos.x - 20,
                top: pos.y - 20,
                width: 40,
                height: 40,
              }
        }
        transition={ringSpring}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[10051]"
        style={{
          left: dotX,
          top: dotY,
          marginLeft: -3,
          marginTop: -3,
        }}
        aria-hidden
      >
        <div className="h-1.5 w-1.5 rounded-full bg-accent shadow-sm ring-1 ring-accent/40" />
      </motion.div>
    </>
  );
}
