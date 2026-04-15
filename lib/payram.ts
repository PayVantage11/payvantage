import { Payram } from "payram";

let _client: Payram | null = null;

export function getPayramClient(): Payram {
  if (_client) return _client;

  const apiKey = process.env["PAYRAM_API_KEY"];
  const baseUrl = process.env["PAYRAM_API_URL"];

  if (!apiKey || !baseUrl) {
    throw new Error(
      "Card payment provider API credentials (key and base URL) must be set in environment variables."
    );
  }

  const isInsecure = baseUrl.startsWith("http://");

  _client = new Payram({
    apiKey,
    baseUrl,
    config: {
      timeoutMs: 15_000,
      maxRetries: 2,
      retryPolicy: "safe",
      allowInsecureHttp: isInsecure,
    },
  });

  return _client;
}

export function mapPayramStatusToInternal(
  payramState: string
): "completed" | "failed" | "pending" {
  switch (payramState) {
    case "FILLED":
    case "OVER_FILLED":
      return "completed";
    case "CANCELLED":
      return "failed";
    case "OPEN":
    case "PARTIALLY_FILLED":
    default:
      return "pending";
  }
}
