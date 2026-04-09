import { DataTable, StatusBadge } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { Activity, CreditCard, DollarSign, Wallet } from "lucide-react";
import type { ReactNode } from "react";

type Transaction = {
  id: string;
  amount: string;
  currency: string;
  status: "completed" | "pending" | "failed";
  customer: string;
  date: string;
};

const mockTransactions: Transaction[] = [
  {
    id: "txn_1a2b3c",
    amount: "$249.99",
    currency: "USDC",
    status: "completed",
    customer: "john@example.com",
    date: "2026-04-09",
  },
  {
    id: "txn_4d5e6f",
    amount: "$89.00",
    currency: "USDT",
    status: "completed",
    customer: "jane@example.com",
    date: "2026-04-09",
  },
  {
    id: "txn_7g8h9i",
    amount: "$1,200.00",
    currency: "USDC",
    status: "pending",
    customer: "bob@example.com",
    date: "2026-04-08",
  },
  {
    id: "txn_0j1k2l",
    amount: "$45.50",
    currency: "USDC",
    status: "failed",
    customer: "alice@example.com",
    date: "2026-04-08",
  },
  {
    id: "txn_3m4n5o",
    amount: "$599.00",
    currency: "USDT",
    status: "completed",
    customer: "charlie@example.com",
    date: "2026-04-07",
  },
];

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
    key: "date",
    header: "Date",
    render: (row: Transaction) => row.date,
  },
];

export default function DashboardOverview(): ReactNode {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your merchant dashboard at a glance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Volume"
          value="$48,239.50"
          description="+12.5% from last month"
          icon={DollarSign}
        />
        <StatCard
          title="Transactions"
          value="342"
          description="Last 30 days"
          icon={CreditCard}
        />
        <StatCard
          title="USDC Balance"
          value="$12,480.00"
          description="Ready to withdraw"
          icon={Wallet}
        />
        <StatCard
          title="Success Rate"
          value="98.2%"
          description="Last 30 days"
          icon={Activity}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Recent Transactions
        </h2>
        <DataTable columns={columns} data={mockTransactions} />
      </div>
    </div>
  );
}
