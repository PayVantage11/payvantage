import { DataTable, StatusBadge } from "@/components/dashboard/data-table";
import { StatCard } from "@/components/dashboard/stat-card";
import { createClient } from "@/utils/supabase/server";
import { Activity, CreditCard, DollarSign, Wallet } from "lucide-react";
import type { ReactNode } from "react";

export default async function DashboardOverview(): Promise<ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("*")
    .eq("merchant_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: allTx } = await supabase
    .from("transactions")
    .select("amount, status")
    .eq("merchant_id", user!.id);

  const rows = transactions ?? [];
  const all = allTx ?? [];

  const totalVolume = all
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalCount = all.length;
  const completedCount = all.filter((t) => t.status === "completed").length;
  const successRate =
    totalCount > 0 ? ((completedCount / totalCount) * 100).toFixed(1) : "0";

  const columns = [
    {
      key: "id",
      header: "Transaction ID",
      render: (row: (typeof rows)[0]) => (
        <span className="font-mono text-xs">
          {row.id.slice(0, 8)}...
        </span>
      ),
    },
    {
      key: "customer_email",
      header: "Customer",
      render: (row: (typeof rows)[0]) =>
        row.customer_email ?? "—",
    },
    {
      key: "amount",
      header: "Amount",
      render: (row: (typeof rows)[0]) => (
        <span className="font-medium">
          ${Number(row.amount).toFixed(2)}
        </span>
      ),
    },
    {
      key: "currency",
      header: "Currency",
      render: (row: (typeof rows)[0]) => (
        <span className="rounded bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          {row.currency}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: (typeof rows)[0]) => (
        <StatusBadge status={row.status as "completed" | "pending" | "failed"} />
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (row: (typeof rows)[0]) =>
        new Date(row.created_at).toLocaleDateString(),
    },
  ];

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
          value={`$${totalVolume.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          description="Completed payments"
          icon={DollarSign}
        />
        <StatCard
          title="Transactions"
          value={totalCount.toString()}
          description="All time"
          icon={CreditCard}
        />
        <StatCard
          title="Completed"
          value={completedCount.toString()}
          description="Successful payments"
          icon={Wallet}
        />
        <StatCard
          title="Success Rate"
          value={`${successRate}%`}
          description="All time"
          icon={Activity}
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Recent Transactions
        </h2>
        {rows.length > 0 ? (
          <DataTable columns={columns} data={rows} />
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No transactions yet. Share your API keys with your integration to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
