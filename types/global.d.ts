export {};

declare global {
  interface Window {
    /**
     * Meta (Facebook) Pixel global. Optional because the pixel script may be
     * blocked by an ad blocker or not yet loaded — always guard before calling.
     */
    fbq?: (...args: unknown[]) => void;
  }
}
