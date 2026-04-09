import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey = process.env["SUPABASE_SERVICE_ROLE_KEY"] ?? process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const { amount, currency, merchant_api_key } = body as {
      amount?: number;
      currency?: string;
      merchant_api_key?: string;
    };

    if (!amount || !currency || !merchant_api_key) {
      return NextResponse.json(
        { error: "Missing required fields: amount, currency, merchant_api_key" },
        { status: 400 }
      );
    }

    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Validate merchant API key against Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: keyRecord, error: keyError } = await supabase
      .from("api_keys")
      .select("merchant_id")
      .eq("publishable_key", merchant_api_key)
      .single();

    if (keyError || !keyRecord) {
      return NextResponse.json(
        { error: "Invalid merchant API key" },
        { status: 401 }
      );
    }

    // Generate a mock PayRam checkout session
    const checkoutId = `pr_${crypto.randomUUID().replace(/-/g, "").slice(0, 24)}`;
    const checkoutUrl = `https://checkout.payram.io/session/${checkoutId}`;

    // Create transaction record
    const { error: txError } = await supabase.from("transactions").insert({
      merchant_id: keyRecord.merchant_id,
      amount,
      currency: currency.toUpperCase(),
      status: "pending",
      payram_checkout_id: checkoutId,
    });

    if (txError) {
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      checkout_url: checkoutUrl,
      checkout_id: checkoutId,
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
