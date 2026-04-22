import { createHmac } from "crypto";

/**
 * Remove null / empty-string keys (Alchemy Pay signing spec).
 */
function removeEmptyKeysFromBody(
  data: Record<string, unknown>
): Record<string, unknown> {
  const ret: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined || value === "") continue;
    ret[key] = value;
  }
  return ret;
}

function sortJsonKeysDeep(data: unknown): unknown {
  if (data === null || typeof data !== "object") return data;
  if (Array.isArray(data)) {
    return data.map((item) => sortJsonKeysDeep(item));
  }
  const obj = data as Record<string, unknown>;
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortJsonKeysDeep(obj[key]);
  }
  return sorted;
}

/**
 * JSON body string for signing and for the HTTP body (must match exactly).
 * See https://alchemypay.readme.io/v4.0.2/docs/api-sign
 */
export function canonicalJsonBodyString(body: Record<string, unknown>): string {
  const cleaned = removeEmptyKeysFromBody(body);
  if (Object.keys(cleaned).length === 0) return "";
  return JSON.stringify(sortJsonKeysDeep(cleaned));
}

/**
 * Request path including sorted query string (for GET signatures).
 */
export function buildAlchemyPayQueryPath(
  pathname: string,
  query: Record<string, string>
): string {
  const keys = Object.keys(query).sort();
  if (keys.length === 0) return pathname;
  const qs = keys.map((k) => `${k}=${query[k]}`).join("&");
  return `${pathname}?${qs}`;
}

/**
 * Generate Alchemy Pay API signature.
 *
 * Signature string = timestamp + httpMethod + requestPath + bodyString
 * Then HMAC-SHA256 with appSecret and base64-encode.
 */
export function generateAlchemyPaySign(
  timestamp: string,
  httpMethod: string,
  requestPath: string,
  bodyString: string,
  appSecret: string
): string {
  const content =
    timestamp + httpMethod.toUpperCase() + requestPath + bodyString;
  return createHmac("sha256", appSecret).update(content).digest("base64");
}

/**
 * Verify an Alchemy Pay webhook signature.
 *
 * Webhook params marked Sign: Y are concatenated alphabetically by key,
 * then signed with HMAC-SHA256(appSecret) -> uppercase hex.
 */
export function verifyAlchemyPayWebhookSign(
  params: Record<string, string>,
  signature: string,
  appSecret: string
): boolean {
  const signableKeys = Object.keys(params)
    .filter(
      (k) =>
        k !== "sign" &&
        params[k] !== undefined &&
        params[k] !== null &&
        params[k] !== ""
    )
    .sort();

  const content = signableKeys.map((k) => `${k}=${params[k]}`).join("&");
  const expected = createHmac("sha256", appSecret)
    .update(content)
    .digest("hex")
    .toUpperCase();

  return expected === signature.toUpperCase();
}
