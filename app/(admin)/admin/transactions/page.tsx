import { createClient } from "@/utils/supabase/server";
import type { ReactNode } from "react";
import { TransactionsTable, type TxRow } from "./transactions-table";

export const dynamic = "force-dynamic";

export default async function AdminTransactionsPage(): Promise<ReactNode> {
  const supabase = await createClient();
  await supabase.auth.getUser();

  const { data: rows, error } = await supabase
    .from("transactions")
    .select(
      `id, created_at, amount, currency, status, merchant_id, customer_email,
       payment_rail, provider_order_id, payram_reference_id, payment_url,
       profiles ( email, company_name )`
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-sm text-red-600">
        Could not load transactions: {error.message}
      </div>
    );
  }

  const list = (rows ?? []) as TxRow[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          All transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every payment attempt across merchants (newest first, up to 500).
        </p>
      </div>

      <TransactionsTable initialRows={list} />
    </div>
  );
}
