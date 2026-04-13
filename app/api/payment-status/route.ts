import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getPayramClient, mapPayramStatusToInternal } from "@/lib/payram";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

export async function GET(request: NextRequest) {
  try {
    const referenceId = request.nextUrl.searchParams.get("reference_id");
    const merchantApiKey = request.headers.get("x-api-key");

    if (!referenceId) {
      return NextResponse.json(
        { error: "Missing reference_id query parameter" },
        { status: 400 }
      );
    }

    if (!merchantApiKey) {
      return NextResponse.json(
        { error: "Missing x-api-key header" },
        { status: 401 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: keyRecord } = await supabase
      .from("api_keys")
      .select("merchant_id, is_active")
      .eq("publishable_key", merchantApiKey)
      .single();

    if (!keyRecord || !keyRecord.is_active) {
      return NextResponse.json(
        { error: "Invalid or inactive API key" },
        { status: 401 }
      );
    }

    const { data: transaction } = await supabase
      .from("transactions")
      .select("*")
      .eq("payram_reference_id", referenceId)
      .eq("merchant_id", keyRecord.merchant_id)
      .single();

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "pending" && referenceId) {
      try {
        const payram = getPayramClient();
        const payramStatus = await payram.payments.getPaymentRequest(
          referenceId
        );
        const newStatus = mapPayramStatusToInternal(
          payramStatus.paymentState ?? "OPEN"
        );

        if (newStatus !== transaction.status) {
          await supabase
            .from("transactions")
            .update({
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", transaction.id);
          transaction.status = newStatus;
        }
      } catch {
        // Fall through with cached status
      }
    }

    return NextResponse.json({
      transaction_id: transaction.id,
      reference_id: transaction.payram_reference_id,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      customer_email: transaction.customer_email,
      payment_url: transaction.payment_url,
      created_at: transaction.created_at,
      updated_at: transaction.updated_at,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
