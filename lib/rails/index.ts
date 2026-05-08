import type { Payram } from "payram";
import type { RailName, RailProvider } from "./types";
import { createPayramProvider } from "./payram";
import { inqudProvider } from "./inqud";
import { alchemyPayProvider } from "./alchemy-pay";
import { nexapayProvider } from "./nexapay";
import { getPayramClient } from "@/lib/payram";

export type { RailName, RailProvider, CreatePaymentParams, CreatePaymentResult } from "./types";

const otherProviders: Record<Exclude<RailName, "payram">, RailProvider> = {
  inqud: inqudProvider,
  alchemypay: alchemyPayProvider,
  nexapay: nexapayProvider,
};

export type RailProviderOptions = {
  /** When set, PayRam calls use this client (merchant project API key). */
  payramClient?: Payram;
};

export function getRailProvider(
  rail: RailName,
  options?: RailProviderOptions
): RailProvider {
  if (rail === "payram") {
    const client = options?.payramClient ?? getPayramClient();
    return createPayramProvider(client);
  }
  const provider = otherProviders[rail as Exclude<RailName, "payram">];
  if (!provider) {
    throw new Error(`Unknown payment rail: ${rail}`);
  }
  return provider;
}

export function isValidRail(rail: string): rail is RailName {
  return (
    rail === "payram" ||
    rail === "inqud" ||
    rail === "alchemypay" ||
    rail === "nexapay"
  );
}

/**
 * Returns the webhook callback URL for a given rail, based on the app's public URL.
 */
export function getWebhookUrl(rail: RailName): string {
  const base =
    process.env["NEXT_PUBLIC_APP_URL"] ??
    process.env["VERCEL_URL"] ??
    "http://localhost:3000";
  const origin = base.startsWith("http") ? base : `https://${base}`;
  return `${origin}/api/webhooks/${rail === "alchemypay" ? "alchemy-pay" : rail}`;
}
