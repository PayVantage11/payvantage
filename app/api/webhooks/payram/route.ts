import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { verifyApiKey } from "payram";
import { mapPayramStatusToInternal } from "@/lib/payram";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;
const payramApiKey = process.env["PAYRAM_API_KEY"] ?? "";

export async function POST(request: Request) {
  try {
    const headers: Record<string, string | undefined> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    if (payramApiKey && !verifyApiKey(headers, payramApiKey)) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;

    const referenceId =
      (body.reference_id as string) ?? (body.checkout_id as string);
    const status =
      (body.paymentState as string) ?? (body.status as string);

    if (!referenceId || !status) {
      return NextResponse.json(
        { error: "Missing reference_id and status" },
        { status: 400 }
      );
    }

    const internalStatus = mapPayramStatusToInternal(status);
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: transaction } = await supabase
      .from("transactions")
      .select("id, status, merchant_id")
      .or(
        `payram_reference_id.eq.${referenceId},payram_checkout_id.eq.${referenceId}`
      )
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
          reference_id: referenceId,
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
