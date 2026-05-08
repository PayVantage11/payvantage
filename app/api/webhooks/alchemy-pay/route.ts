import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { verifyAlchemyPayWebhookSign } from "@/lib/rails/alchemy-pay-sign";
import { mapAlchemyPayStatusToInternal } from "@/lib/rails/alchemy-pay";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey =
  process.env["SUPABASE_SECERT_KEY"]?.trim() || "";
const appSecret = process.env["ALCHEMY_PAY_APP_SECRET"] ?? "";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, string>;

    if (appSecret && body.sign) {
      const isValid = verifyAlchemyPayWebhookSign(body, body.sign, appSecret);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid webhook signature" },
          { status: 401 }
        );
      }
    }

    const orderNo = body.orderNo;
    const merchantOrderNo = body.merchantOrderNo;
    const orderStatus = body.orderStatus ?? body.status;

    if (!orderStatus || (!orderNo && !merchantOrderNo)) {
      return NextResponse.json(
        { error: "Missing orderNo/merchantOrderNo or status" },
        { status: 400 }
      );
    }

    const internalStatus = mapAlchemyPayStatusToInternal(orderStatus);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Look up by our internal order ID (merchantOrderNo) first, then by provider order ID
    let transaction: { id: string; status: string; merchant_id: string } | null =
      null;

    if (merchantOrderNo) {
      const { data } = await supabase
        .from("transactions")
        .select("id, status, merchant_id")
        .eq("id", merchantOrderNo)
        .eq("payment_rail", "alchemypay")
        .single();
      transaction = data;
    }

    if (!transaction && orderNo) {
      const { data } = await supabase
        .from("transactions")
        .select("id, status, merchant_id")
        .eq("provider_order_id", orderNo)
        .eq("payment_rail", "alchemypay")
        .single();
      transaction = data;
    }

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (
      transaction.status === "completed" ||
      transaction.status === "failed"
    ) {
      return new Response("success", { status: 200 });
    }

    await supabase
      .from("transactions")
      .update({
        status: internalStatus,
        provider_reference: body.hxAddress ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    const { data: settings } = await supabase
      .from("merchant_settings")
      .select("webhook_url")
      .eq("merchant_id", transaction.merchant_id)
      .single();

    if (settings?.webhook_url) {
      fetch(settings.webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "payment.updated",
          transaction_id: transaction.id,
          provider_order_id: orderNo,
          rail: "alchemypay",
          status: internalStatus,
        }),
      }).catch(() => {});
    }

    // Alchemy Pay requires response body to include "success"
    return new Response("success", { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
