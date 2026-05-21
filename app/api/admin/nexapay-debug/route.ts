import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const adminSetupToken = process.env["ADMIN_SETUP_TOKEN"];
const nexaAppId = process.env["NEXAPAY_APP_ID"];
const nexaBaseUrl =
  process.env["NEXAPAY_BASE_URL"] ?? "https://nexapay.one/api/v1";
const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"];
const supabaseSecretKey = process.env["SUPABASE_SECRET_KEY"]?.trim();

function normalize(status: string | undefined): string {
  const n = (status ?? "").toUpperCase();
  if (["COMPLETED", "SUCCESS", "SETTLED", "PAID", "FINISHED"].includes(n))
    return "completed";
  if (["FAILED", "DECLINED", "CANCELLED", "EXPIRED", "REJECTED"].includes(n))
    return "failed";
  return "pending";
}

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
  let parsed: { payment?: { status?: string }; status?: string } | null = null;
  try {
    parsed = JSON.parse(text) as {
      payment?: { status?: string };
      status?: string;
    };
  } catch {
    parsed = null;
  }

  const remoteStatus = parsed?.status ?? parsed?.payment?.status;
  const mapped = normalize(remoteStatus);

  let dbRows: unknown = null;
  let dbError: string | null = null;
  if (supabaseUrl && supabaseSecretKey) {
    const supabase = createClient(supabaseUrl, supabaseSecretKey);
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "id, status, payment_rail, provider_order_id, payram_reference_id, merchant_id, amount, currency, created_at, updated_at"
      )
      .or(
        `provider_order_id.eq.${orderId},payram_reference_id.eq.${orderId}`
      );
    dbRows = data;
    dbError = error?.message ?? null;
  } else {
    dbError = "Supabase env vars missing on server";
  }

  return NextResponse.json({
    upstream_url: url,
    nexapay: {
      http_status: res.status,
      raw_status: remoteStatus ?? null,
      mapped_internal_status: mapped,
      parsed,
    },
    db: {
      error: dbError,
      rows: dbRows,
    },
  });
}
