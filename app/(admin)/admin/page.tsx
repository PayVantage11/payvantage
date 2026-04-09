import { StatCard } from "@/components/dashboard/stat-card";
import {
  Activity,
  DollarSign,
  Server,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

export default function AdminDashboard(): ReactNode {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Platform Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Global view of PayVantage platform health and metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Platform Volume"
          value="$2.4M"
          description="Last 30 days"
          icon={DollarSign}
        />
        <StatCard
          title="Active Merchants"
          value="1,248"
          description="+38 this month"
          icon={Users}
        />
        <StatCard
          title="Success Rate"
          value="99.1%"
          description="Platform-wide"
          icon={Activity}
        />
        <StatCard
          title="System Health"
          value="Operational"
          description="All systems green"
          icon={Server}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Volume Breakdown
          </h3>
          <div className="space-y-3">
            {[
              { label: "USDC Settlements", value: "$1.8M", pct: 75 },
              { label: "USDT Settlements", value: "$600K", pct: 25 },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">
                    {item.value}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            System Status
          </h3>
          <div className="space-y-3">
            {[
              { service: "Payment API", status: "Operational" },
              { service: "PayRam Gateway", status: "Operational" },
              { service: "Webhook Delivery", status: "Operational" },
              { service: "Dashboard", status: "Operational" },
            ].map((item) => (
              <div
                key={item.service}
                className="flex items-center justify-between rounded-lg bg-background px-4 py-3"
              >
                <span className="text-sm text-foreground">{item.service}</span>
                <span className="flex items-center gap-2 text-sm text-emerald-500">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
