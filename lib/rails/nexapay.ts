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

/**
 * Error thrown when NexaPay returns a non-OK HTTP response (or an explicit
 * success:false body). Carries the status + body so callers can distinguish a
 * definitive "no such payment" from a transient network/server error.
 */
export class NexaPayApiError extends Error {
  readonly status: number;
  readonly body: string;
  constructor(status: number, body: string) {
    super(`NexaPay request failed ${status}: ${body}`);
    this.name = "NexaPayApiError";
    this.status = status;
    this.body = body;
  }
}

/**
 * True when an error means NexaPay definitively has no usable record for the
 * order (404 / client error / "not found" body) — i.e. safe to count toward
 * expiry. Network errors, auth/rate-limit (401/403/429), and 5xx are transient
 * and must NOT push a row toward expiry.
 */
export function isNexaPayNotFoundError(err: unknown): boolean {
  if (!(err instanceof NexaPayApiError)) return false;
  if ([400, 404, 409, 410, 422].includes(err.status)) return true;
  return /not[\s_-]?found|no such|does not exist|no record|unknown (payment|order)|invalid (payment|order)/i.test(
    err.body
  );
}

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
    throw new NexaPayApiError(response.status, text);
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

// NexaPay's /payments/{id} payment object reports the settled value as
// `amount_paid_usd` and the invoiced value as `amount_invoiced_usd`.
const RECEIVED_KEYS = [
  "amount_paid_usd",
  "amount_received",
  "received_amount",
  "amount_paid",
  "paid_amount",
  "settled_amount",
  "net_amount",
] as const;

const INVOICE_KEYS = [
  "amount_invoiced_usd",
  "amount",
  "invoice_amount",
  "amount_due",
  "requested_amount",
  "total",
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
  // An explicit success:false means NexaPay has no usable record for this order.
  if (!result.success) {
    throw new NexaPayApiError(422, JSON.stringify(result));
  }
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
