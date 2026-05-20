"use client";

import Link from "next/link";
import { useState } from "react";
import { ExternalLink, RefreshCw } from "lucide-react";

type ProfileEmbed = { email: string; company_name: string | null };

export type TxRow = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  merchant_id: string;
  customer_email: string | null;
  payment_rail: string | null;
  provider_order_id: string | null;
  payram_reference_id: string | null;
  payment_url: string | null;
  profiles: ProfileEmbed | ProfileEmbed[] | null;
};

type SyncResponse = {
  transaction_id: string;
  old_status?: string;
  new_status?: string;
  status?: string;
  changed: boolean;
  message?: string;
  error?: string;
};

type RowFeedback =
  | { kind: "info"; text: string }
  | { kind: "error"; text: string };

const SYNCABLE_RAILS = new Set(["nexapay", "inqud", "alchemypay", "payram"]);

function pickProfile(
  p: ProfileEmbed | ProfileEmbed[] | null | undefined
): ProfileEmbed | null {
  if (!p) return null;
  return Array.isArray(p) ? (p[0] ?? null) : p;
}

function isSyncable(t: TxRow): boolean {
  if (t.status !== "pending") return false;
  if (!t.payment_rail || !SYNCABLE_RAILS.has(t.payment_rail)) return false;
  return Boolean(t.provider_order_id ?? t.payram_reference_id);
}

export function TransactionsTable({
  initialRows,
}: {
  initialRows: TxRow[];
}): React.ReactElement {
  const [rows, setRows] = useState<TxRow[]>(initialRows);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, RowFeedback>>({});

  function clearFeedbackAfter(id: string, ms: number) {
    window.setTimeout(() => {
      setFeedback((prev) => {
        if (!prev[id]) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, ms);
  }

  async function handleSync(id: string) {
    setLoadingId(id);
    setFeedback((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    try {
      const res = await fetch("/api/admin/sync-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction_id: id }),
      });
      const data = (await res.json()) as SyncResponse;

      if (!res.ok) {
        setFeedback((prev) => ({
          ...prev,
          [id]: { kind: "error", text: data.error ?? "Sync failed" },
        }));
        clearFeedbackAfter(id, 4000);
        return;
      }

      if (data.changed && data.new_status) {
        const newStatus = data.new_status;
        setRows((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        setFeedback((prev) => ({
          ...prev,
          [id]: { kind: "info", text: "no change" },
        }));
        clearFeedbackAfter(id, 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network error";
      setFeedback((prev) => ({
        ...prev,
        [id]: { kind: "error", text: message },
      }));
      clearFeedbackAfter(id, 4000);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Time
            </th>
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Merchant
            </th>
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Amount
            </th>
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Status
            </th>
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Rail
            </th>
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Customer
            </th>
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Reference
            </th>
            <th className="px-3 py-3 font-medium text-muted-foreground">
              Link
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="px-3 py-12 text-center text-muted-foreground"
              >
                No transactions yet.
              </td>
            </tr>
          ) : (
            rows.map((t) => {
              const ref =
                t.provider_order_id ?? t.payram_reference_id ?? "—";
              const prof = pickProfile(t.profiles);
              const merchantLabel =
                prof?.company_name?.trim() ||
                prof?.email ||
                t.merchant_id.slice(0, 8);
              const canSync = isSyncable(t);
              const isLoading = loadingId === t.id;
              const rowFeedback = feedback[t.id];
              return (
                <tr key={t.id} className="hover:bg-muted/20">
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {new Date(t.created_at).toLocaleString()}
                  </td>
                  <td className="max-w-[200px] px-3 py-2.5">
                    <p className="truncate font-medium text-foreground">
                      {merchantLabel}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {prof?.email ?? t.merchant_id}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 font-medium">
                    ${Number(t.amount).toFixed(2)} {t.currency}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        t.status === "completed"
                          ? "text-emerald-600"
                          : t.status === "failed"
                            ? "text-red-500"
                            : "text-amber-600"
                      }
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-muted-foreground">
                    {t.payment_rail ?? "—"}
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-2.5 text-muted-foreground">
                    {t.customer_email ?? "—"}
                  </td>
                  <td className="max-w-[140px] truncate px-3 py-2.5 font-mono text-xs text-muted-foreground">
                    {ref}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      {t.payment_url ? (
                        <Link
                          href={t.payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-accent hover:underline"
                        >
                          Open
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {canSync && (
                        <button
                          type="button"
                          onClick={() => handleSync(t.id)}
                          disabled={isLoading}
                          aria-label="Sync transaction status from rail provider"
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground transition hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RefreshCw
                            className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                          />
                          Sync
                        </button>
                      )}
                    </div>
                    {rowFeedback && (
                      <p
                        className={`mt-1 text-xs ${rowFeedback.kind === "error" ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        {rowFeedback.text}
                      </p>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
