import type {
  RailProvider,
  CreatePaymentParams,
  CreatePaymentResult,
} from "./types";

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

function normalizeNexaPayStatus(
  status: string | undefined
): "completed" | "failed" | "pending" {
  const normalized = (status ?? "").toUpperCase();
  switch (normalized) {
    case "COMPLETED":
    case "SUCCESS":
    case "SETTLED":
    case "PAID":
    case "FINISHED":
      return "completed";
    case "FAILED":
    case "DECLINED":
    case "CANCELLED":
    case "EXPIRED":
    case "REJECTED":
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
): "completed" | "failed" | "pending" {
  return normalizeNexaPayStatus(status);
}
