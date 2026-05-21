import { NextResponse, type NextRequest } from "next/server";

const adminSetupToken = process.env["ADMIN_SETUP_TOKEN"];
const nexaAppId = process.env["NEXAPAY_APP_ID"];
const nexaBaseUrl =
  process.env["NEXAPAY_BASE_URL"] ?? "https://nexapay.one/api/v1";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const orderId = request.nextUrl.searchParams.get("order_id");

  if (!adminSetupToken || token !== adminSetupToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }
  if (!orderId) {
    return NextResponse.json(
      { error: "order_id query param required" },
      { status: 400 }
    );
  }
  if (!nexaAppId) {
    return NextResponse.json(
      { error: "NEXAPAY_APP_ID not configured on server" },
      { status: 500 }
    );
  }

  const url = `${nexaBaseUrl.replace(/\/$/, "")}/payments/${encodeURIComponent(orderId)}`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": nexaAppId,
    },
  });
  const text = await res.text();
  let parsed: unknown = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }
  return NextResponse.json({
    http_status: res.status,
    raw_body: text,
    parsed,
    upstream_url: url,
  });
}
