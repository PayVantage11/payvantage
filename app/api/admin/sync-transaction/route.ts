import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getPayramClientForMerchant } from "@/lib/payram";
import { getRailProvider, isValidRail, type RailName } from "@/lib/rails";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey = process.env["SUPABASE_SECRET_KEY"]?.trim() || "";

type Body = { transaction_id?: string };

type TxRow = {
  id: string;
  status: string;
  payment_rail: string | null;
  provider_order_id: string | null;
  payram_reference_id: string | null;
  merchant_id: string;
};

export async function POST(request: Request) {
  try {
    const authSupabase = await createClient();
    const {
      data: { user },
    } = await authSupabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await authSupabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as Body;
    const transactionId = body.transaction_id?.trim();

    if (!transactionId) {
      return NextResponse.json(
        { error: "transaction_id is required" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    const { data: transaction, error: fetchError } = await supabase
      .from("transactions")
      .select(
        "id, status, payment_rail, provider_order_id, payram_reference_id, merchant_id"
      )
      .eq("id", transactionId)
      .single<TxRow>();

    if (fetchError || !transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    if (transaction.status === "completed" || transaction.status === "failed") {
      return NextResponse.json({
        transaction_id: transaction.id,
        status: transaction.status,
        changed: false,
        message: "already terminal",
      });
    }

    const providerId =
      transaction.provider_order_id ?? transaction.payram_reference_id;
    if (!providerId) {
      return NextResponse.json(
        { error: "Transaction has no provider reference to sync" },
        { status: 400 }
      );
    }

    const rail = transaction.payment_rail ?? "payram";
    if (!isValidRail(rail)) {
      return NextResponse.json(
        { error: `Unsupported payment rail: ${rail}` },
        { status: 400 }
      );
    }

    let newStatus: string;
    try {
      const payramClient =
        rail === "payram"
          ? await getPayramClientForMerchant(supabase, transaction.merchant_id)
          : undefined;
      const provider = getRailProvider(
        rail as RailName,
        rail === "payram" && payramClient ? { payramClient } : undefined
      );
      if (!provider.getPaymentStatus) {
        return NextResponse.json(
          { error: `Rail ${rail} does not support status lookup` },
          { status: 400 }
        );
      }
      newStatus = await provider.getPaymentStatus(providerId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Rail provider error";
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const oldStatus = transaction.status;
    const changed = newStatus !== oldStatus;

    if (changed) {
      const { error: updateError } = await supabase
        .from("transactions")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", transaction.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    }

    return NextResponse.json({
      transaction_id: transaction.id,
      old_status: oldStatus,
      new_status: newStatus,
      changed,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
