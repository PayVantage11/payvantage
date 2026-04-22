import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { mapInqudStatusToInternal } from "@/lib/rails/inqud";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;
const webhookSecret = process.env["INQUD_WEBHOOK_SECRET"] ?? "";

/**
 * Inqud sends HMAC-SHA1(rawBody, secret) as lowercase hex in X-Payload-Digest.
 * https://docs.inqud.com/developer/web-hooks/web-hook-verification.md
 */
function verifyInqudPayloadDigest(payload: string, digestHeader: string): boolean {
  if (!webhookSecret) return true;
  const expected = createHmac("sha1", webhookSecret)
    .update(payload, "utf8")
    .digest("hex");
  const received = digestHeader.trim().toLowerCase();
  if (received.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(expected, "utf8"), Buffer.from(received, "utf8"));
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const digest =
      request.headers.get("x-payload-digest") ??
      request.headers.get("X-Payload-Digest") ??
      "";
    if (webhookSecret && !verifyInqudPayloadDigest(rawBody, digest)) {
      return NextResponse.json(
        { error: "Invalid webhook digest" },
        { status: 401 }
      );
    }

    const body = JSON.parse(rawBody) as Record<string, unknown>;

    const checkoutId = body.id as string | undefined;
    const status = body.status as string | undefined;

    if (!checkoutId || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 }
      );
    }

    const internalStatus = mapInqudStatusToInternal(status);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: transaction } = await supabase
      .from("transactions")
      .select("id, status, merchant_id")
      .eq("provider_order_id", checkoutId)
      .eq("payment_rail", "inqud")
      .single();

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
      return NextResponse.json({
        message: "Transaction already in terminal state",
        status: transaction.status,
      });
    }

    await supabase
      .from("transactions")
      .update({
        status: internalStatus,
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
          provider_order_id: checkoutId,
          rail: "inqud",
          status: internalStatus,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({
      message: "Webhook received successfully",
      transaction_id: transaction.id,
      status: internalStatus,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
