import type {
  RailProvider,
  CreatePaymentParams,
  CreatePaymentResult,
} from "./types";
import {
  buildAlchemyPayQueryPath,
  canonicalJsonBodyString,
  generateAlchemyPaySign,
} from "./alchemy-pay-sign";

function getAlchemyPayConfig() {
  const appId = process.env["ALCHEMY_PAY_APP_ID"];
  const appSecret = process.env["ALCHEMY_PAY_APP_SECRET"];
  const baseUrl =
    process.env["ALCHEMY_PAY_BASE_URL"] ?? "https://openapi.alchemypay.org";

  if (!appId || !appSecret) {
    throw new Error(
      "ALCHEMY_PAY_APP_ID and ALCHEMY_PAY_APP_SECRET must be set"
    );
  }

  return { appId, appSecret, baseUrl };
}

let _cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(customerEmail: string): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt) {
    return _cachedToken.accessToken;
  }

  const { appId, appSecret, baseUrl } = getAlchemyPayConfig();
  const timestamp = String(Date.now());
  const path = "/open/api/v4/merchant/getToken";
  const bodyString = canonicalJsonBodyString({ email: customerEmail });
  const sign = generateAlchemyPaySign(timestamp, "POST", path, bodyString, appSecret);

  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      appid: appId,
      timestamp,
      sign,
    },
    body: bodyString,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Alchemy Pay getToken error ${response.status}: ${text}`);
  }

  const result = (await response.json()) as {
    success: boolean;
    returnCode: string;
    data?: { accessToken: string };
  };

  if (!result.success || !result.data?.accessToken) {
    throw new Error(
      `Alchemy Pay getToken failed: ${result.returnCode}`
    );
  }

  _cachedToken = {
    accessToken: result.data.accessToken,
    expiresAt: Date.now() + 9 * 24 * 60 * 60 * 1000, // 9 days (token lasts 10)
  };

  return _cachedToken.accessToken;
}

function mapChainToNetwork(chain: string): string {
  const mapping: Record<string, string> = {
    POLYGON: "POLYGON",
    BASE: "BASE",
    ETH: "ETH",
    ETHEREUM: "ETH",
    BSC: "BSC",
    TRON: "TRX",
    TRX: "TRX",
    ARBITRUM: "ARBITRUM",
  };
  return mapping[chain.toUpperCase()] ?? "POLYGON";
}

export function mapAlchemyPayStatusToInternal(
  status: string
): "completed" | "failed" | "pending" {
  switch (status) {
    case "COMPLETED":
    case "DELAY_SUCCESS":
    case "PAY_SUCCESS":
    case "FINISHED":
      return "completed";
    case "FAILED":
    case "TIMEOUT":
    case "CLOSE":
    case "DELAY_FAILED":
    case "PAY_FAIL":
      return "failed";
    default:
      return "pending";
  }
}

interface AlchemyPayCreateOrderResponse {
  success: boolean;
  returnCode: string;
  returnMsg: string;
  data?: {
    orderNo: string;
    payUrl: string;
  };
}

export const alchemyPayProvider: RailProvider = {
  name: "alchemypay",

  async createPayment(
    params: CreatePaymentParams
  ): Promise<CreatePaymentResult> {
    const { appId, appSecret, baseUrl } = getAlchemyPayConfig();
    const accessToken = await getAccessToken(params.customerEmail);

    const timestamp = String(Date.now());
    const path = "/open/api/v4/merchant/trade/create";
    const network = mapChainToNetwork(params.chain);

    const orderBody: Record<string, unknown> = {
      side: "BUY",
      cryptoCurrency: "USDT",
      address: params.walletAddress,
      network,
      fiatCurrency: params.currency.toUpperCase(),
      amount: String(params.amount),
      merchantOrderNo: params.orderId,
      depositType: 2,
      payWayCode: "10001",
      callbackUrl: params.callbackUrl,
    };
    const trimmedReturn = params.returnUrl?.trim();
    if (trimmedReturn) {
      orderBody.redirectUrl = trimmedReturn;
    }

    const bodyString = canonicalJsonBodyString(orderBody);
    const sign = generateAlchemyPaySign(
      timestamp,
      "POST",
      path,
      bodyString,
      appSecret
    );

    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access-token": accessToken,
        appId,
        timestamp,
        sign,
      },
      body: bodyString,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Alchemy Pay create order error ${response.status}: ${text}`
      );
    }

    const result = (await response.json()) as AlchemyPayCreateOrderResponse;

    if (!result.success || !result.data?.payUrl) {
      throw new Error(
        `Alchemy Pay create order failed: ${result.returnCode} - ${result.returnMsg}`
      );
    }

    return {
      paymentUrl: result.data.payUrl,
      providerOrderId: result.data.orderNo,
      rawResponse: result,
    };
  },

  async getPaymentStatus(providerOrderId: string): Promise<string> {
    const { appId, appSecret, baseUrl } = getAlchemyPayConfig();
    const timestamp = String(Date.now());
    const path = buildAlchemyPayQueryPath("/open/api/v4/merchant/query/trade", {
      orderNo: providerOrderId,
      side: "BUY",
    });
    const sign = generateAlchemyPaySign(timestamp, "GET", path, "", appSecret);

    const response = await fetch(`${baseUrl}${path}`, {
      method: "GET",
      headers: {
        appId,
        timestamp,
        sign,
      },
    });

    if (!response.ok) {
      throw new Error(`Alchemy Pay query error ${response.status}`);
    }

    const result = (await response.json()) as {
      success: boolean;
      data?: { orderStatus?: string; status?: string };
    };

    const status =
      result.data?.orderStatus ?? result.data?.status ?? "PENDING";
    return mapAlchemyPayStatusToInternal(status);
  },
};
