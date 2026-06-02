import type {
  RailProvider,
  CreatePaymentParams,
  CreatePaymentResult,
} from "./types";

/**
 * Internal transaction status set. Mirrors the DB CHECK constraint on
 * public.transactions.status: pending|completed|failed|expired|partially_paid.
 */
export type InternalTxStatus =
  | "completed"
  | "failed"
  | "pending"
  | "expired"
  | "partially_paid";

function getNexaPayConfig() {
  const appId = process.env["NEXAPAY_APP_ID"];
  const baseUrl =
    process.env["NEXAPAY_BASE_URL"] ?? "https://nexapay.one/api/v1";

  if (!appId) {
    throw new Error("NEXAPAY_APP_ID  must be set");
  }

  return { appId, baseUrl };
}

function getNexaPayHeaders(appId: string) {
  return {
    "Content-Type": "application/json",
    "X-API-Key": appId,
  };
}

/**
 * Map NexaPay's status strings to our internal status set.
 * IMPORTANT: "expired" and "partially_paid" are distinct states.
 * Expired must NOT collapse to pending (the customer never paid) and must NOT
 * collapse to failed (so admins can tell dead links from real failures).
 * Partially paid must NOT collapse to pending (it is not a fulfillable order).
 */
function normalizeNexaPayStatus(status: string | undefined): InternalTxStatus {
  // Uppercase and fold separators so "Partially Paid" / "partially-paid" match.
  const normalized = (status ?? "").toUpperCase().replace(/[\s-]+/g, "_");
  switch (normalized) {
    case "COMPLETED":
    case "SUCCESS":
    case "SUCCEEDED":
    case "SETTLED":
    case "PAID":
    case "FINISHED":
      return "completed";
    case "EXPIRED":
    case "TIMEOUT":
    case "TIMED_OUT":
      return "expired";
    case "PARTIALLY_PAID":
    case "PARTIAL":
    case "PARTIAL_PAYMENT":
    case "UNDERPAID":
      return "partially_paid";
    case "FAILED":
    case "DECLINED":
    case "CANCELLED":
    case "CANCELED":
    case "REJECTED":
    case "VOID":
    case "VOIDED":
      return "failed";
    default:
      return "pending";
  }
}

async function nexapayFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { appId, baseUrl } = getNexaPayConfig();
  const url = `${baseUrl}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getNexaPayHeaders(appId),
      ...(options.headers ?? {}),
    },
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`NexaPay request failed ${response.status}: ${text}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`NexaPay response was not valid JSON: ${text}`);
  }
}

interface NexaPayCreatePaymentResponse {
  success: boolean;
  payment?: {
    checkout_url?: string;
    id?: string;
    order_id?: string;
    status?: string;
  };
}

interface NexaPayStatusResponse {
  success: boolean;
  status?: string;
  payment?: {
    status?: string;
    order_id: string;
  } & Record<string, unknown>;
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

/**
 * Probe a NexaPay payment object for an amount under any of several plausible
 * field names (the exact contract is masked in our env). Returns first match.
 */
function pickAmount(
  source: Record<string, unknown> | undefined,
  keys: readonly string[]
): number | null {
  if (!source) return null;
  for (const k of keys) {
    const v = coerceNumber(source[k]);
    if (v !== null) return v;
  }
  return null;
}

const RECEIVED_KEYS = [
  "amount_received",
  "received_amount",
  "amount_paid",
  "paid_amount",
  "settled_amount",
  "amount_settled",
  "net_amount",
  "total_paid",
  "received",
  "usd_received",
  "amount_usd",
] as const;

const INVOICE_KEYS = [
  "amount",
  "invoice_amount",
  "amount_due",
  "requested_amount",
  "total",
  "order_amount",
] as const;

export interface NexaPayPaymentDetails {
  internalStatus: InternalTxStatus;
  rawStatus: string | undefined;
  amountReceived: number | null;
  invoiceAmount: number | null;
  raw: unknown;
}

/**
 * Fetch full payment details (status + amounts) for one NexaPay order.
 * Used by the bulk sync so we can update status and capture the real received
 * amount for fee-margin analysis.
 */
export async function getNexaPayPaymentDetails(
  providerOrderId: string
): Promise<NexaPayPaymentDetails> {
  const result = await nexapayFetch<NexaPayStatusResponse>(
    `/payments/${encodeURIComponent(providerOrderId)}`,
    { method: "GET" }
  );
  const top = result as unknown as Record<string, unknown>;
  const payment = result.payment as Record<string, unknown> | undefined;
  const rawStatus = result.status ?? result.payment?.status;
  return {
    internalStatus: normalizeNexaPayStatus(rawStatus),
    rawStatus,
    amountReceived:
      pickAmount(payment, RECEIVED_KEYS) ?? pickAmount(top, RECEIVED_KEYS),
    invoiceAmount:
      pickAmount(payment, INVOICE_KEYS) ?? pickAmount(top, INVOICE_KEYS),
    raw: result,
  };
}

export const nexapayProvider: RailProvider = {
  name: "nexapay",

  async createPayment(
    params: CreatePaymentParams
  ): Promise<CreatePaymentResult> {
    const body = {
      amount: params.amount,
      currency: params.currency.toUpperCase(),
      crypto: "USDC", // TODO: map from chain or settlementCurrency
      description: `Order ${params.orderId}`,
      customer_email: params.customerEmail,
      success_url: params.returnUrl?.trim() || undefined,
      cancel_url: params.returnUrl?.trim() || undefined,
      callback_url: params.callbackUrl,
    };
    const result = await nexapayFetch<NexaPayCreatePaymentResponse>(
      "/payments",
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    );

    if (!result.success || !result.payment?.checkout_url) {
      throw new Error(`NexaPay create payment failed`);
    }

    const paymentResult: CreatePaymentResult = {
      paymentUrl: result.payment.checkout_url,
      providerOrderId:
        result.payment.order_id ?? result.payment.id ?? params.orderId,
      rawResponse: result,
    };
    if (result.payment.id) {
      paymentResult.providerReference = result.payment.id;
    }

    return paymentResult;
  },

  async getPaymentStatus(providerOrderId: string): Promise<string> {
    const result = await nexapayFetch<NexaPayStatusResponse>(
      `/payments/${encodeURIComponent(providerOrderId)}`,
      {
        method: "GET",
      }
    );

    return normalizeNexaPayStatus(result.status ?? result.payment?.status);
  },
};

export function mapNexaPayStatusToInternal(
  status: string | undefined
): InternalTxStatus {
  return normalizeNexaPayStatus(status);
}
