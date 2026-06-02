import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import {
  getNexaPayPaymentDetails,
  isNexaPayNotFoundError,
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
// After this many consecutive "no such payment" responses, give up and expire.
const MAX_ATTEMPTS = 3;

type PendingTx = {
  id: string;
  amount: number | null;
  customer_email: string | null;
  provider_order_id: string | null;
  sync_attempts: number | null;
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

function errorMessage(err: unknown): string {
  return (err instanceof Error ? err.message : String(err)).slice(0, 1000);
}

async function runSync(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // (1) Rows with no provider_order_id can never be looked up — expire now.
  const { data: nullExpiredRows } = await supabase
    .from("transactions")
    .update({
      status: "expired",
      last_sync_error: "no provider_order_id; cannot look up at NexaPay",
      updated_at: new Date().toISOString(),
    })
    .eq("payment_rail", "nexapay")
    .eq("status", "pending")
    .is("provider_order_id", null)
    .select("id");
  const nullOrderExpired = nullExpiredRows?.length ?? 0;

  // (2) Poll rows that still need work: anything pending (with an order id),
  // plus already-terminal completed/partially_paid rows missing a received
  // amount (one-time fee backfill). Expired/failed are never re-polled.
  const { data: rows, error } = await supabase
    .from("transactions")
    .select("id, amount, customer_email, provider_order_id, sync_attempts")
    .eq("payment_rail", "nexapay")
    .not("provider_order_id", "is", null)
    .or(
      "status.eq.pending,and(status.in.(completed,partially_paid),amount_received.is.null)"
    )
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
  let retriedNotFound = 0;
  let expiredNotFound = 0;
  let transientErrors = 0;

  for (const row of rows ?? []) {
    if (!row.provider_order_id) continue;
    scanned += 1;
    const now = new Date().toISOString();
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

      // Successful lookup: write status, reset the retry counter, clear error.
      const updateFields: Record<string, unknown> = {
        status: newStatus,
        sync_attempts: 0,
        last_sync_error: null,
        updated_at: now,
      };
      if (details.amountReceived !== null) {
        updateFields.amount_received = details.amountReceived;
      }
      await supabase.from("transactions").update(updateFields).eq("id", row.id);
      if (newStatus !== "pending") updated += 1;
      else unchanged += 1;
    } catch (err) {
      const msg = errorMessage(err);
      if (isNexaPayNotFoundError(err)) {
        // NexaPay has no record for this order. Count it; expire at the cap.
        const attempts = (row.sync_attempts ?? 0) + 1;
        if (attempts >= MAX_ATTEMPTS) {
          await supabase
            .from("transactions")
            .update({
              status: "expired",
              sync_attempts: attempts,
              last_sync_error: msg,
              updated_at: now,
            })
            .eq("id", row.id);
          expiredNotFound += 1;
          byStatus["expired"] = (byStatus["expired"] ?? 0) + 1;
        } else {
          await supabase
            .from("transactions")
            .update({
              sync_attempts: attempts,
              last_sync_error: msg,
              updated_at: now,
            })
            .eq("id", row.id);
          retriedNotFound += 1;
        }
      } else {
        // Transient (network / 5xx / auth / rate limit): record but do NOT
        // increment the counter, so NexaPay downtime can't expire real rows.
        await supabase
          .from("transactions")
          .update({ last_sync_error: msg, updated_at: now })
          .eq("id", row.id);
        transientErrors += 1;
      }
    }
  }

  return NextResponse.json({
    ok: true,
    scanned,
    updated,
    unchanged,
    retried_not_found: retriedNotFound,
    expired_not_found: expiredNotFound,
    null_order_expired: nullOrderExpired,
    transient_errors: transientErrors,
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
