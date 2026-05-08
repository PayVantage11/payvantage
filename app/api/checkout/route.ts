import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
// import { getPayramClientForMerchant } from "@/lib/payram";
import {
  getRailProvider,
  getWebhookUrl,
  isValidRail,
  type RailName,
} from "@/lib/rails";

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey = process.env["SUPABASE_SECERT_KEY"]?.trim() || "";

export async function POST(request: Request) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase checkout configuration is missing");
      return NextResponse.json(
        { error: "Checkout is not configured" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const {
      amount,
      currency,
      merchant_api_key,
      customer_email,
      customer_id,
      return_url,
    } = body as {
      amount?: number;
      currency?: string;
      merchant_api_key?: string;
      customer_email?: string;
      customer_id?: string;
      return_url?: string;
    };

    if (!amount || !currency || !merchant_api_key) {
      return NextResponse.json(
        {
          error: "Missing required fields: amount, currency, merchant_api_key",
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

    // const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: true },
    });
    // Publishable key → exactly one merchant_id. All PayRam secrets are loaded by that id only.
    const { data: keyRecord, error: keyError } = await supabase
      .from("api_keys")
      .select("merchant_id, is_active")
      .eq("publishable_key", merchant_api_key)
      .limit(1)
      .single();

    if (keyError) {
      console.error("API key lookup error:", keyError);
    }

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
      .limit(1)
      .single();

    if (!profile?.approved) {
      return NextResponse.json(
        { error: "Merchant account is not approved" },
        { status: 403 }
      );
    }

    const { data: merchantSettings } = await supabase
      .from("merchant_settings")
      .select("payment_rail, fallback_rail, wallet_address, preferred_chain")
      .eq("merchant_id", keyRecord.merchant_id)
      .limit(1)
      .single();

    const primaryRail: RailName =
      merchantSettings?.payment_rail &&
      isValidRail(merchantSettings.payment_rail)
        ? (merchantSettings.payment_rail as RailName)
        : "alchemypay";

    const fallbackRail: RailName | null =
      merchantSettings?.fallback_rail &&
      isValidRail(merchantSettings.fallback_rail)
        ? (merchantSettings.fallback_rail as RailName)
        : null;

    // const needsPayramClient =
    //   primaryRail === "payram" || fallbackRail === "payram";

    // let payramClient: Awaited<
    //   ReturnType<typeof getPayramClientForMerchant>
    // > | undefined;
    // if (needsPayramClient) {
    //   try {
    //     payramClient = await getPayramClientForMerchant(
    //       supabase,
    //       keyRecord.merchant_id
    //     );
    //   } catch (err) {
    //     console.error("PayRam client for merchant:", err);
    //     return NextResponse.json(
    //       {
    //         error:
    //           "Payment processor is not configured for this merchant. Contact support.",
    //       },
    //       { status: 503 }
    //     );
    //   }
    // }

    // function payramOpts(rail: RailName) {
    //   return rail === "payram" && payramClient
    //     ? { payramClient }
    //     : undefined;
    // }

    const walletAddress = merchantSettings?.wallet_address ?? "";
    const chain = merchantSettings?.preferred_chain ?? "BASE";

    const email = customer_email ?? "customer@payvantage.io";
    const custId = customer_id ?? keyRecord.merchant_id;

    // Pre-create the transaction to get an ID for the order reference
    const { data: txRecord, error: txInsertError } = await supabase
      .from("transactions")
      .insert({
        merchant_id: keyRecord.merchant_id,
        amount,
        currency: currency.toUpperCase(),
        status: "pending",
        payment_rail: primaryRail,
        customer_email: email,
        customer_id: custId,
      })
      .select("id")
      .limit(1)
      .single();

    if (txInsertError || !txRecord) {
      console.error("Transaction insert error:", txInsertError);
      return NextResponse.json(
        { error: "Failed to create transaction" },
        { status: 500 }
      );
    }

    const orderId = txRecord.id;

    // Attempt primary rail, then fallback
    let usedRail = primaryRail;
    let paymentResult;
    try {
      // const provider = getRailProvider(primaryRail, payramOpts(primaryRail));
      const provider = getRailProvider(primaryRail);
      paymentResult = await provider.createPayment({
        amount,
        currency: currency.toUpperCase(),
        merchantId: keyRecord.merchant_id,
        walletAddress,
        chain,
        customerEmail: email,
        customerId: custId,
        orderId,
        callbackUrl: getWebhookUrl(primaryRail),
        returnUrl: return_url,
      });
    } catch (primaryErr) {
      console.error(`${primaryRail} rail error:`, primaryErr);

      if (fallbackRail && fallbackRail !== primaryRail) {
        try {
          usedRail = fallbackRail;
          // const fallbackProvider = getRailProvider(
          //   fallbackRail,
          //   payramOpts(fallbackRail)
          // );
          const fallbackProvider = getRailProvider(fallbackRail);
          paymentResult = await fallbackProvider.createPayment({
            amount,
            currency: currency.toUpperCase(),
            merchantId: keyRecord.merchant_id,
            walletAddress,
            chain,
            customerEmail: email,
            customerId: custId,
            orderId,
            callbackUrl: getWebhookUrl(fallbackRail),
            returnUrl: return_url,
          });
        } catch (fallbackErr) {
          console.error(`${fallbackRail} fallback rail error:`, fallbackErr);
          // Mark transaction as failed since both rails are down
          await supabase
            .from("transactions")
            .update({ status: "failed", updated_at: new Date().toISOString() })
            .eq("id", orderId);
          return NextResponse.json(
            {
              error: "Payment processor unavailable. Please try again later.",
            },
            { status: 502 }
          );
        }
      } else {
        await supabase
          .from("transactions")
          .update({ status: "failed", updated_at: new Date().toISOString() })
          .eq("id", orderId);
        return NextResponse.json(
          {
            error: "Payment processor unavailable. Please try again later.",
          },
          { status: 502 }
        );
      }
    }

    // Update transaction with provider details
    const updateFields: Record<string, unknown> = {
      payment_rail: usedRail,
      provider_order_id: paymentResult.providerOrderId,
      provider_reference: paymentResult.providerReference ?? null,
      payment_url: paymentResult.paymentUrl,
      updated_at: new Date().toISOString(),
    };

    // Backward compat: populate legacy provider reference fields when using the primary card rail
    // if (usedRail === "payram") {
    //   updateFields.payram_reference_id = paymentResult.providerOrderId;
    // }

    const { error: txUpdateError } = await supabase
      .from("transactions")
      .update(updateFields)
      .eq("id", orderId);

    if (txUpdateError) {
      console.error("Transaction update error:", txUpdateError);
    }

    return NextResponse.json({
      payment_url: paymentResult.paymentUrl,
      reference_id: paymentResult.providerOrderId,
      transaction_id: orderId,
      rail: usedRail,
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
