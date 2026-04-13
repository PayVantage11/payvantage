"use client";

import { createClient } from "@/utils/supabase/client";
import {
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type PaymentLink = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer_email: string | null;
  payment_url: string | null;
  payram_reference_id: string | null;
  created_at: string;
};

export default function PaymentsPage(): ReactNode {
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [apiKey, setApiKey] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: keys } = await supabase
      .from("api_keys")
      .select("publishable_key")
      .eq("merchant_id", user.id)
      .eq("is_active", true)
      .limit(1);

    if (keys && keys.length > 0 && keys[0]) {
      setApiKey(keys[0].publishable_key);
    }

    const { data } = await supabase
      .from("transactions")
      .select(
        "id, amount, currency, status, customer_email, payment_url, payram_reference_id, created_at"
      )
      .eq("merchant_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    setLinks((data ?? []) as PaymentLink[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function handleCopy(value: string, id: string) {
    navigator.clipboard.writeText(value);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCreate() {
    if (!amount || !apiKey) return;
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency: "USD",
          merchant_api_key: apiKey,
          customer_email: customerEmail || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to create payment link");
        setCreating(false);
        return;
      }

      setSuccess(data.payment_url);
      setAmount("");
      setCustomerEmail("");
      setShowCreate(false);
      await loadData();
    } catch {
      setError("Failed to create payment link");
    }

    setCreating(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Payment Links
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create payment links to send to your customers. They pay via
            crypto or card.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            disabled={!apiKey}
            className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Create Payment Link
          </button>
        </div>
      </div>

      {!apiKey && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="text-sm font-medium text-foreground">
            No API key found
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            You need to create an API key before you can generate payment
            links. Go to{" "}
            <a
              href="/dashboard/api-keys"
              className="font-medium text-accent underline"
            >
              API Keys
            </a>{" "}
            to create one.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Payment link created! Share it with your customer.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg bg-background px-4 py-2 font-mono text-xs text-foreground">
              {success}
            </code>
            <button
              onClick={() => handleCopy(success, "new-link")}
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === "new-link" ? "Copied!" : "Copy"}
            </button>
            <a
              href={success}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </a>
          </div>
          <button
            onClick={() => setSuccess(null)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {showCreate && (
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            New Payment Link
          </h3>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Amount (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="49.99"
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Customer Email (optional)
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="customer@example.com"
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={creating || !amount}
                className="flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                {creating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Generate"
                )}
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="flex h-10 items-center rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {links.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No payment links yet. Create one to start collecting payments.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-foreground">
                    ${Number(link.amount).toFixed(2)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      link.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : link.status === "failed"
                          ? "bg-red-500/10 text-red-500"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {link.status.charAt(0).toUpperCase() +
                      link.status.slice(1)}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  {link.customer_email && (
                    <span>{link.customer_email}</span>
                  )}
                  <span>
                    {new Date(link.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {link.payram_reference_id && (
                    <span className="font-mono">
                      {link.payram_reference_id.slice(0, 12)}...
                    </span>
                  )}
                </div>
              </div>

              {link.payment_url && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleCopy(link.payment_url!, `link-${link.id}`)
                    }
                    className="rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    title="Copy payment link"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <a
                    href={link.payment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                    title="Open payment page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
