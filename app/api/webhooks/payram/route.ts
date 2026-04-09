import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

type WebhookPayload = {
  event: string;
  checkout_id: string;
  status: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as WebhookPayload;
    const { event, checkout_id, status } = body;

    if (!event || !checkout_id || !status) {
      return NextResponse.json(
        { error: "Missing required fields: event, checkout_id, status" },
        { status: 400 }
      );
    }

    // Map PayRam status to our internal status
    let internalStatus: "completed" | "failed" | "pending";
    switch (status) {
      case "completed":
      case "success":
        internalStatus = "completed";
        break;
      case "failed":
      case "expired":
      case "cancelled":
        internalStatus = "failed";
        break;
      default:
        internalStatus = "pending";
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: transaction, error: findError } = await supabase
      .from("transactions")
      .select("id, status")
      .eq("payram_checkout_id", checkout_id)
      .single();

    if (findError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    // Only update if the transaction isn't already in a terminal state
    if (transaction.status === "completed" || transaction.status === "failed") {
      return NextResponse.json({
        message: "Transaction already in terminal state",
        status: transaction.status,
      });
    }

    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: internalStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transaction.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Webhook processed successfully",
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
