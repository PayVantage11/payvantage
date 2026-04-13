import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getPayramClient } from "@/lib/payram";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey =
  process.env["SUPABASE_SERVICE_ROLE_KEY"] ??
  process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { amount, currency, merchant_api_key, customer_email, customer_id } =
      body as {
        amount?: number;
        currency?: string;
        merchant_api_key?: string;
        customer_email?: string;
        customer_id?: string;
      };

    if (!amount || !currency || !merchant_api_key) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: amount, currency, merchant_api_key",
        },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: keyRecord, error: keyError } = await supabase
      .from("api_keys")
      .select("merchant_id, is_active")
      .eq("publishable_key", merchant_api_key)
      .single();

    if (keyError || !keyRecord) {
      return NextResponse.json(
        { error: "Invalid merchant API key" },
        { status: 401 }
      );
    }

    if (!keyRecord.is_active) {
      return NextResponse.json(
        { error: "API key is inactive" },
        { status: 403 }
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("approved")
      .eq("id", keyRecord.merchant_id)
      .single();

    if (!profile?.approved) {
      return NextResponse.json(
        { error: "Merchant account is not approved" },
        { status: 403 }
      );
    }

    const email = customer_email ?? "customer@payvantage.io";
    const custId = customer_id ?? keyRecord.merchant_id;

    let payramResponse;
    try {
      const payram = getPayramClient();
      payramResponse = await payram.payments.initiatePayment({
        customerEmail: email,
        customerId: custId,
        amountInUSD: amount,
      });
    } catch (payramErr) {
      console.error("PayRam API error:", payramErr);
      return NextResponse.json(
        { error: "Payment processor unavailable. Please try again later." },
        { status: 502 }
      );
    }

    const { error: txError } = await supabase.from("transactions").insert({
      merchant_id: keyRecord.merchant_id,
      amount,
      currency: currency.toUpperCase(),
      status: "pending",
      payram_reference_id: payramResponse.reference_id,
      customer_email: email,
      customer_id: custId,
      payment_url: payramResponse.url,
    });

    if (txError) {
      console.error("Transaction insert error:", txError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      payment_url: payramResponse.url,
      reference_id: payramResponse.reference_id,
      amount,
      currency: currency.toUpperCase(),
      status: "pending",
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
