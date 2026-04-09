import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  emptyMessage = "No data found.",
}: {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}): ReactNode {
  if (data.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row) => (
            <tr
              key={row.id}
              className="transition-colors hover:bg-muted/20"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="whitespace-nowrap px-4 py-3.5 text-sm text-foreground"
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusBadge({
  status,
}: {
  status: "completed" | "pending" | "failed";
}): ReactNode {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "completed" &&
          "bg-emerald-500/10 text-emerald-500",
        status === "pending" &&
          "bg-amber-500/10 text-amber-500",
        status === "failed" && "bg-red-500/10 text-red-500"
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
