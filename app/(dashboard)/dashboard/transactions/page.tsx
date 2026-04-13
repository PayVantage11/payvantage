"use client";

import { DataTable, StatusBadge } from "@/components/dashboard/data-table";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type Transaction = {
  id: string;
  amount: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  customer_email: string | null;
  payram_reference_id: string | null;
  created_at: string;
};

type StatusFilter = "all" | "completed" | "pending" | "failed";

const columns = [
  {
    key: "id",
    header: "Transaction ID",
    render: (row: Transaction) => (
      <span className="font-mono text-xs">{row.id.slice(0, 8)}...</span>
    ),
  },
  {
    key: "customer_email",
    header: "Customer",
    render: (row: Transaction) => row.customer_email ?? "—",
  },
  {
    key: "amount",
    header: "Amount",
    render: (row: Transaction) => (
      <span className="font-medium">${Number(row.amount).toFixed(2)}</span>
    ),
  },
  {
    key: "currency",
    header: "Currency",
    render: (row: Transaction) => (
      <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
        {row.currency}
      </span>
    ),
  },
  {
    key: "status",
    header: "Status",
    render: (row: Transaction) => <StatusBadge status={row.status} />,
  },
  {
    key: "payram_reference_id",
    header: "PayRam Ref",
    render: (row: Transaction) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.payram_reference_id
          ? `${row.payram_reference_id.slice(0, 12)}...`
          : "—"}
      </span>
    ),
  },
  {
    key: "created_at",
    header: "Date",
    render: (row: Transaction) =>
      new Date(row.created_at).toLocaleDateString(),
  },
];

export default function TransactionsPage(): ReactNode {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const loadTransactions = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("transactions")
      .select(
        "id, amount, currency, status, customer_email, payram_reference_id, created_at"
      )
      .order("created_at", { ascending: false });
    setTransactions((data ?? []) as Transaction[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filtered =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.status === filter);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and filter all your payment transactions.
        </p>
      </div>

      <div className="flex items-center gap-2">
        {(["all", "completed", "pending", "failed"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === s
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage="No transactions match the selected filter."
        />
      ) : (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {filter === "all"
              ? "No transactions yet."
              : "No transactions match the selected filter."}
          </p>
        </div>
      )}
    </div>
  );
}
