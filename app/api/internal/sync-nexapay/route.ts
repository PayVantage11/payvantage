import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  getNexaPayPaymentDetails,
  type InternalTxStatus,
} from "@/lib/rails/nexapay";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const supabaseServiceKey = process.env["SUPABASE_SECRET_KEY"]?.trim() || "";
const cronSecret = process.env["CRON_SECRET"] ?? "";

// Cap rows processed per invocation so a single run stays within maxDuration.
const BATCH_LIMIT = 200;
// Number of raw NexaPay responses to echo back on a manual trigger (debug aid).
const SAMPLE_LIMIT = 8;

type PendingTx = {
  id: string;
  amount: number | null;
  customer_email: string | null;
  provider_order_id: string | null;
};

function isAuthorized(request: Request): boolean {
  // Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>`
  // when CRON_SECRET is set on the project. Manual triggers must match too.
  if (!cronSecret) return false;
  const header = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${cronSecret}`;
  if (header.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(header), Buffer.from(expected));
  } catch {
    return false;
  }
}

async function runSync(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { data: rows, error } = await supabase
    .from("transactions")
    .select("id, amount, customer_email, provider_order_id")
    .eq("payment_rail", "nexapay")
    .eq("status", "pending")
    .not("provider_order_id", "is", null)
    .order("created_at", { ascending: true })
    .limit(BATCH_LIMIT)
    .returns<PendingTx[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byStatus: Record<string, number> = {};
  const samples: Array<Record<string, unknown>> = [];
  let scanned = 0;
  let updated = 0;
  let unchanged = 0;
  let errors = 0;

  for (const row of rows ?? []) {
    if (!row.provider_order_id) continue;
    scanned += 1;
    try {
      const details = await getNexaPayPaymentDetails(row.provider_order_id);
      const newStatus: InternalTxStatus = details.internalStatus;
      byStatus[newStatus] = (byStatus[newStatus] ?? 0) + 1;

      if (samples.length < SAMPLE_LIMIT) {
        samples.push({
          transaction_id: row.id,
          provider_order_id: row.provider_order_id,
          raw_status: details.rawStatus,
          mapped_status: newStatus,
          invoice_amount: row.amount,
          amount_received: details.amountReceived,
          raw: details.raw,
        });
      }

      const updateFields: Record<string, unknown> = {
        status: newStatus,
        updated_at: new Date().toISOString(),
      };
      if (details.amountReceived !== null) {
        updateFields.amount_received = details.amountReceived;
      }

      // Only write when something actually moves off "pending" (or we learned
      // a received amount), so the cron is a no-op once a row is terminal.
      if (newStatus !== "pending" || details.amountReceived !== null) {
        const { error: updErr } = await supabase
          .from("transactions")
          .update(updateFields)
          .eq("id", row.id);
        if (updErr) {
          errors += 1;
        } else if (newStatus !== "pending") {
          updated += 1;
        } else {
          unchanged += 1;
        }
      } else {
        unchanged += 1;
      }
    } catch {
      errors += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    scanned,
    updated,
    unchanged,
    errors,
    by_status: byStatus,
    samples,
  });
}

export async function GET(request: Request): Promise<NextResponse> {
  return runSync(request);
}

export async function POST(request: Request): Promise<NextResponse> {
  return runSync(request);
}
