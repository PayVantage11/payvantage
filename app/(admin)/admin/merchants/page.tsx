import { DataTable, StatusBadge } from "@/components/dashboard/data-table";
import type { ReactNode } from "react";

type Merchant = {
  id: string;
  companyName: string;
  email: string;
  status: "completed" | "pending" | "failed";
  totalVolume: string;
  transactions: number;
  joinedDate: string;
};

const mockMerchants: Merchant[] = [
  { id: "m_001", companyName: "TechCorp LLC", email: "admin@techcorp.com", status: "completed", totalVolume: "$245,000", transactions: 1240, joinedDate: "2026-01-15" },
  { id: "m_002", companyName: "DigitalGoods Inc.", email: "billing@digitalgoods.io", status: "completed", totalVolume: "$189,500", transactions: 980, joinedDate: "2026-02-03" },
  { id: "m_003", companyName: "CloudShop Pro", email: "owner@cloudshop.pro", status: "pending", totalVolume: "$0", transactions: 0, joinedDate: "2026-04-08" },
  { id: "m_004", companyName: "NovaPay Systems", email: "finance@novapay.com", status: "completed", totalVolume: "$567,200", transactions: 3420, joinedDate: "2025-11-20" },
  { id: "m_005", companyName: "StreamVault", email: "team@streamvault.tv", status: "failed", totalVolume: "$12,300", transactions: 56, joinedDate: "2026-03-10" },
  { id: "m_006", companyName: "GreenLeaf Supplements", email: "orders@greenleaf.co", status: "completed", totalVolume: "$98,750", transactions: 620, joinedDate: "2026-01-28" },
  { id: "m_007", companyName: "ByteMarket", email: "support@bytemarket.io", status: "pending", totalVolume: "$0", transactions: 0, joinedDate: "2026-04-09" },
  { id: "m_008", companyName: "LuxeTravel Bookings", email: "ops@luxetravel.com", status: "completed", totalVolume: "$1,200,000", transactions: 5600, joinedDate: "2025-10-05" },
];

const columns = [
  {
    key: "companyName",
    header: "Company",
    render: (row: Merchant) => (
      <span className="font-medium">{row.companyName}</span>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (row: Merchant) => row.email,
  },
  {
    key: "status",
    header: "Status",
    render: (row: Merchant) => (
      <StatusBadge status={row.status} />
    ),
  },
  {
    key: "totalVolume",
    header: "Total Volume",
    render: (row: Merchant) => (
      <span className="font-medium">{row.totalVolume}</span>
    ),
  },
  {
    key: "transactions",
    header: "Transactions",
    render: (row: Merchant) => row.transactions.toLocaleString(),
  },
  {
    key: "joinedDate",
    header: "Joined",
    render: (row: Merchant) => row.joinedDate,
  },
];

export default function MerchantsPage(): ReactNode {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Merchants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All registered merchants on the PayVantage platform. Status labels:
          Active, Pending approval, Suspended.
        </p>
      </div>

      <DataTable columns={columns} data={mockMerchants} />
    </div>
  );
}
