import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { mapNexaPayStatusToInternal } from "@/lib/rails/nexapay";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey =
  process.env["SUPABASE_SECRET_KEY"] ??
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;
const webhookSecret = process.env["NEXAPAY_WEBHOOK_SECRET"] ?? "";

type NexaPayTransaction = {
  id: string;
  status: string;
  merchant_id: string;
};

function getString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function verifyNexaPaySignature(payload: string, signature: string): boolean {
  if (!webhookSecret || !signature) return true;
  const expected = createHmac("sha256", webhookSecret)
    .update(payload, "utf8")
    .digest("hex");
  const received = signature.trim();
  if (received.length !== expected.length) return false;
  try {
    return timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(received, "utf8")
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-nexapay-signature") ||
      request.headers.get("x-signature") ||
      "";

    if (webhookSecret && !verifyNexaPaySignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;
    const orderId =
      getString(body.order_id) ||
      getString(body.orderId) ||
      getString(body.transactionId);
    const paymentId =
      getString(body.payment_id) ||
      getString(body.paymentId) ||
      getString(body.paymentReference) ||
      getString(body.providerReference);
    const txid = getString(body.txid) || getString(body.txId);
    const status =
      getString(body.status) ||
      getString(body.orderStatus) ||
      getString(body.paymentStatus);

    if ((!orderId && !paymentId) || !status) {
      return NextResponse.json(
        { error: "Missing order_id/payment_id or status" },
        { status: 400 }
      );
    }

    const internalStatus = mapNexaPayStatusToInternal(status);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let transaction: NexaPayTransaction | null = null;

    if (orderId) {
      const { data } = await supabase
        .from("transactions")
        .select("id, status, merchant_id")
        .eq("provider_order_id", orderId)
        .eq("payment_rail", "nexapay")
        .single();
      transaction = data;
    }

    if (!transaction && paymentId) {
      const { data } = await supabase
        .from("transactions")
        .select("id, status, merchant_id")
        .eq("provider_order_id", paymentId)
        .eq("payment_rail", "nexapay")
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
      transaction.status === "failed" ||
      transaction.status === "expired"
    ) {
      return NextResponse.json(
        { message: "Transaction already in terminal state" },
        { status: 200 }
      );
    }

    // Only provider_order_id and provider_reference exist on the transactions
    // table; txid is folded into provider_reference when no payment id is given.
    const updateFields: Record<string, unknown> = {
      status: internalStatus,
      provider_reference: paymentId ?? txid ?? null,
      updated_at: new Date().toISOString(),
    };

    if (orderId) {
      updateFields.provider_order_id = orderId;
    }

    const { error: updateError } = await supabase
      .from("transactions")
      .update(updateFields)
      .eq("id", transaction.id);

    if (updateError) {
      console.error("NexaPay transaction update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

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
          provider_order_id: orderId,
          rail: "nexapay",
          status: internalStatus,
        }),
      }).catch(() => {});
    }

    return NextResponse.json(
      { message: "Webhook processed", transaction_id: transaction.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("NexaPay webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
