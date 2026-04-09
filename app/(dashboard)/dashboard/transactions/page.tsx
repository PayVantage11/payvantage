"use client";

import { DataTable, StatusBadge } from "@/components/dashboard/data-table";
import { useState, type ReactNode } from "react";

type Transaction = {
  id: string;
  amount: string;
  currency: string;
  status: "completed" | "pending" | "failed";
  customer: string;
  payramId: string;
  date: string;
};

const allTransactions: Transaction[] = [
  { id: "txn_1a2b3c", amount: "$249.99", currency: "USDC", status: "completed", customer: "john@example.com", payramId: "pr_abc123", date: "2026-04-09" },
  { id: "txn_4d5e6f", amount: "$89.00", currency: "USDT", status: "completed", customer: "jane@example.com", payramId: "pr_def456", date: "2026-04-09" },
  { id: "txn_7g8h9i", amount: "$1,200.00", currency: "USDC", status: "pending", customer: "bob@example.com", payramId: "pr_ghi789", date: "2026-04-08" },
  { id: "txn_0j1k2l", amount: "$45.50", currency: "USDC", status: "failed", customer: "alice@example.com", payramId: "pr_jkl012", date: "2026-04-08" },
  { id: "txn_3m4n5o", amount: "$599.00", currency: "USDT", status: "completed", customer: "charlie@example.com", payramId: "pr_mno345", date: "2026-04-07" },
  { id: "txn_6p7q8r", amount: "$150.00", currency: "USDC", status: "completed", customer: "dave@example.com", payramId: "pr_pqr678", date: "2026-04-07" },
  { id: "txn_9s0t1u", amount: "$75.25", currency: "USDT", status: "pending", customer: "eve@example.com", payramId: "pr_stu901", date: "2026-04-06" },
  { id: "txn_2v3w4x", amount: "$320.00", currency: "USDC", status: "completed", customer: "frank@example.com", payramId: "pr_vwx234", date: "2026-04-06" },
  { id: "txn_5y6z7a", amount: "$999.99", currency: "USDC", status: "completed", customer: "grace@example.com", payramId: "pr_yza567", date: "2026-04-05" },
  { id: "txn_8b9c0d", amount: "$25.00", currency: "USDT", status: "failed", customer: "hank@example.com", payramId: "pr_bcd890", date: "2026-04-05" },
];

type StatusFilter = "all" | "completed" | "pending" | "failed";

const columns = [
  {
    key: "id",
    header: "Transaction ID",
    render: (row: Transaction) => (
      <span className="font-mono text-xs">{row.id}</span>
    ),
  },
  {
    key: "customer",
    header: "Customer",
    render: (row: Transaction) => row.customer,
  },
  {
    key: "amount",
    header: "Amount",
    render: (row: Transaction) => (
      <span className="font-medium">{row.amount}</span>
    ),
  },
  {
    key: "currency",
    header: "Settled In",
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
    key: "payramId",
    header: "PayRam ID",
    render: (row: Transaction) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.payramId}
      </span>
    ),
  },
  {
    key: "date",
    header: "Date",
    render: (row: Transaction) => row.date,
  },
];

export default function TransactionsPage(): ReactNode {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const filtered =
    filter === "all"
      ? allTransactions
      : allTransactions.filter((t) => t.status === filter);

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

      <DataTable
        columns={columns}
        data={filtered}
        emptyMessage="No transactions match the selected filter."
      />
    </div>
  );
}
