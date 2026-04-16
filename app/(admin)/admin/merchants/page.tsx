"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import {
  Ban,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

const RAIL_OPTIONS = [
  { value: "payram", label: "Primary card rail" },
  { value: "inqud", label: "Inqud" },
  { value: "alchemypay", label: "Alchemy Pay" },
] as const;

const RAIL_COLORS: Record<string, string> = {
  payram: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  inqud: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  alchemypay: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
};

function railLabel(value: string): string {
  return RAIL_OPTIONS.find((r) => r.value === value)?.label ?? value;
}

type MerchantSettings = {
  company_name: string | null;
  legal_business_name: string | null;
  business_registration_number: string | null;
  country: string | null;
  business_address: string | null;
  city: string | null;
  state_province: string | null;
  postal_code: string | null;
  representative_first_name: string | null;
  representative_last_name: string | null;
  representative_email: string | null;
  representative_phone: string | null;
  business_type: string | null;
  business_description: string | null;
  expected_monthly_volume: string | null;
  website_url: string | null;
  webhook_url: string | null;
  wallet_address: string | null;
  cold_wallet_address: string | null;
  settlement_notes: string | null;
  payram_success_redirect_url: string | null;
  payram_cancel_redirect_url: string | null;
  application_submitted_at: string | null;
  preferred_chain: string | null;
  verification_status: string;
  verification_notes: string | null;
  payment_rail: string;
  fallback_rail: string | null;
};

type PayramCredentialRow = {
  payram_project_id: string | null;
  payram_project_name: string | null;
  payram_base_url: string | null;
};

type MerchantTransaction = {
  id: string;
  created_at: string;
  amount: number;
  currency: string;
  status: string;
  customer_email: string | null;
  payment_rail: string | null;
  provider_order_id: string | null;
  payram_reference_id: string | null;
  payment_url: string | null;
};

type Merchant = {
  id: string;
  email: string;
  company_name: string | null;
  approved: boolean;
  onboarded: boolean;
  created_at: string;
  /** PostgREST may return one row as an object or as a single-element array. */
  merchant_settings: MerchantSettings[] | MerchantSettings | null;
  merchant_payram_credentials:
    | PayramCredentialRow[]
    | PayramCredentialRow
    | null;
};

function firstRelationRow<T>(raw: T | T[] | null | undefined): T | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) return raw[0] ?? null;
  return raw;
}

const MERCHANT_SETTINGS_LIST_COLUMNS = `
           company_name, legal_business_name, business_registration_number, country,
           business_address, city, state_province, postal_code,
           representative_first_name, representative_last_name,
           representative_email, representative_phone,
           business_type, business_description, expected_monthly_volume,
           website_url, webhook_url, wallet_address, cold_wallet_address, settlement_notes,
           payram_success_redirect_url, payram_cancel_redirect_url,
           application_submitted_at, preferred_chain,
           verification_status, verification_notes,
           payment_rail, fallback_rail
         `;

export default function MerchantsPage(): ReactNode {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [merchantsListError, setMerchantsListError] = useState<string | null>(
    null
  );
  const [merchantsListWarning, setMerchantsListWarning] = useState<
    string | null
  >(null);
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savingRail, setSavingRail] = useState<string | null>(null);
  const [payramProjectId, setPayramProjectId] = useState("");
  const [payramProjectName, setPayramProjectName] = useState("");
  const [payramApiKey, setPayramApiKey] = useState("");
  const [payramBaseUrl, setPayramBaseUrl] = useState("");
  const [savingPayram, setSavingPayram] = useState(false);
  const [payramError, setPayramError] = useState<string | null>(null);
  const [merchantTx, setMerchantTx] = useState<
    Record<string, MerchantTransaction[]>
  >({});
  const [loadingTxMerchantId, setLoadingTxMerchantId] = useState<
    string | null
  >(null);
  const [verificationNotesDraft, setVerificationNotesDraft] =
    useState("");
  const [savingNotesMerchantId, setSavingNotesMerchantId] = useState<
    string | null
  >(null);

  const loadMerchants = useCallback(async () => {
    const supabase = createClient();
    setMerchantsListError(null);
    setMerchantsListWarning(null);
    await supabase.auth.getUser();

    const baseSelect = `id, email, company_name, approved, onboarded, created_at,
         merchant_settings (${MERCHANT_SETTINGS_LIST_COLUMNS})`;

    const { data, error } = await supabase
      .from("profiles")
      .select(
        `${baseSelect},
         merchant_payram_credentials (
           payram_project_id, payram_project_name, payram_base_url
         )`
      )
      .eq("role", "merchant")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMerchants(data as Merchant[]);
      setLoading(false);
      return;
    }

    const { data: slimData, error: slimError } = await supabase
      .from("profiles")
      .select(baseSelect)
      .eq("role", "merchant")
      .order("created_at", { ascending: false });

    if (slimError) {
      setMerchants([]);
      setMerchantsListError(slimError.message);
      setLoading(false);
      return;
    }

    const patched = (slimData ?? []).map((row) => ({
      ...row,
      merchant_payram_credentials: null,
    }));
    setMerchants(patched as Merchant[]);
    setMerchantsListWarning(
      "Merchant list loaded without PayRam credential fields. If this persists, apply the latest database schema (including `merchant_payram_credentials`)."
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  useEffect(() => {
    setPayramError(null);
    if (!expanded) {
      setPayramProjectId("");
      setPayramProjectName("");
      setPayramApiKey("");
      setPayramBaseUrl("");
      return;
    }
    const m = merchants.find((row) => row.id === expanded);
    const creds = firstRelationRow(m?.merchant_payram_credentials);
    setPayramProjectId(creds?.payram_project_id ?? "");
    setPayramProjectName(creds?.payram_project_name ?? "");
    setPayramApiKey("");
    setPayramBaseUrl(creds?.payram_base_url ?? "");
  }, [expanded, merchants]);

  useEffect(() => {
    if (!expanded) {
      setVerificationNotesDraft("");
      return;
    }
    const row = merchants.find((x) => x.id === expanded);
    const s = getSettingsFromMerchant(row);
    setVerificationNotesDraft(s?.verification_notes ?? "");
  }, [expanded, merchants]);

  useEffect(() => {
    if (!expanded) return;
    let cancelled = false;
    setLoadingTxMerchantId(expanded);
    const supabase = createClient();
    void supabase
      .from("transactions")
      .select(
        "id, created_at, amount, currency, status, customer_email, payment_rail, provider_order_id, payram_reference_id, payment_url"
      )
      .eq("merchant_id", expanded)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoadingTxMerchantId(null);
        if (error) return;
        setMerchantTx((prev) => ({
          ...prev,
          [expanded]: (data ?? []) as MerchantTransaction[],
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [expanded]);

  function getSettingsFromMerchant(m: Merchant | undefined): MerchantSettings | null {
    return firstRelationRow(m?.merchant_settings);
  }

  async function handleSavePayramCredentials(merchantId: string) {
    setPayramError(null);
    setSavingPayram(true);
    try {
      const res = await fetch("/api/admin/merchant-payram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchant_id: merchantId,
          payram_project_id: payramProjectId || null,
          payram_project_name: payramProjectName || null,
          api_key: payramApiKey.trim() || undefined,
          payram_base_url: payramBaseUrl.trim() || null,
        }),
      });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        setPayramError(payload.error ?? "Save failed");
        setSavingPayram(false);
        return;
      }
      setPayramApiKey("");
      await loadMerchants();
    } catch {
      setPayramError("Save failed");
    }
    setSavingPayram(false);
  }

  async function handleApproval(merchantId: string, approve: boolean) {
    setActing(merchantId);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ approved: approve })
      .eq("id", merchantId);

    await supabase
      .from("merchant_settings")
      .update({
        verification_status: approve ? "verified" : "rejected",
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_id", merchantId);

    await loadMerchants();
    setActing(null);
  }

  async function handleDeny(merchantId: string) {
    if (
      !window.confirm(
        "Reject this merchant application? Their account will stay inactive until you approve them again."
      )
    ) {
      return;
    }
    await handleApproval(merchantId, false);
  }

  async function handleSaveVerificationNotes(merchantId: string) {
    setSavingNotesMerchantId(merchantId);
    const supabase = createClient();
    await supabase
      .from("merchant_settings")
      .update({
        verification_notes: verificationNotesDraft.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_id", merchantId);
    await loadMerchants();
    setSavingNotesMerchantId(null);
  }

  async function handleRailChange(
    merchantId: string,
    field: "payment_rail" | "fallback_rail",
    value: string
  ) {
    setSavingRail(`${merchantId}-${field}`);
    const supabase = createClient();
    await supabase
      .from("merchant_settings")
      .update({
        [field]: value === "" ? null : value,
        updated_at: new Date().toISOString(),
      })
      .eq("merchant_id", merchantId);
    await loadMerchants();
    setSavingRail(null);
  }

  function getSettings(m: Merchant): MerchantSettings | null {
    return getSettingsFromMerchant(m);
  }

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
        <h1 className="text-2xl font-semibold text-foreground">Merchants</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review merchant applications, verify business details, and manage
          access.
        </p>
      </div>

      {merchantsListError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {merchantsListError}
        </div>
      ) : null}

      {merchantsListWarning ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
          {merchantsListWarning}
        </div>
      ) : null}

      {merchants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {merchantsListError
              ? "Fix the error above, then refresh this page."
              : "No merchants have registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {merchants.map((m) => {
            const settings = getSettings(m);
            const isExpanded = expanded === m.id;
            const vStatus = settings?.verification_status ?? "pending";
            const currentRail = settings?.payment_rail ?? "payram";

            return (
              <div
                key={m.id}
                className="rounded-xl border border-border bg-muted/30"
              >
                {/* Header row */}
                <div className="flex items-center gap-4 p-4">
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : m.id)
                    }
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.company_name || m.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        RAIL_COLORS[currentRail] ?? RAIL_COLORS.payram
                      }`}
                    >
                      {railLabel(currentRail)}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.approved
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-800 dark:text-amber-300"
                      }`}
                    >
                      {m.approved ? "Account active" : "Account pending"}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.onboarded
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.onboarded ? "Form submitted" : "Not onboarded"}
                    </span>
                    {settings?.application_submitted_at && !m.approved && (
                      <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-300">
                        Application in queue
                      </span>
                    )}
                    <span
                      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                        vStatus === "verified"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : vStatus === "rejected"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {vStatus === "verified" ? (
                        <ShieldCheck className="h-3 w-3" />
                      ) : vStatus === "rejected" ? (
                        <ShieldX className="h-3 w-3" />
                      ) : null}
                      Review: {vStatus.charAt(0).toUpperCase() + vStatus.slice(1)}
                    </span>
                  </div>

                  <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1">
                    {acting === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : m.approved ? (
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Revoke this merchant? They will no longer be able to create payment links."
                            )
                          ) {
                            void handleApproval(m.id, false);
                          }
                        }}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <X className="h-3.5 w-3.5" />
                        Revoke access
                      </button>
                    ) : vStatus === "rejected" ? (
                      <button
                        type="button"
                        onClick={() => handleApproval(m.id, true)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve (reinstate)
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApproval(m.id, true)}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeny(m.id)}
                          className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          Deny
                        </button>
                      </>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Expanded detail */}
                {isExpanded && settings && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                      <h4 className="text-sm font-semibold text-foreground">
                        Application submission
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Data from the merchant onboarding form. Use{" "}
                        <span className="font-medium text-foreground">
                          Approve
                        </span>{" "}
                        or{" "}
                        <span className="font-medium text-foreground">Deny</span>{" "}
                        in the row above to control platform access.
                      </p>
                    </div>

                    <div className="mb-4 rounded-lg border border-border bg-background/50 p-3">
                      <p className="mb-2 text-xs font-medium text-foreground">
                        Internal review notes
                      </p>
                      <textarea
                        value={verificationNotesDraft}
                        onChange={(e) =>
                          setVerificationNotesDraft(e.target.value)
                        }
                        rows={3}
                        className="w-full rounded-md border border-border bg-background px-2 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        placeholder="Risk notes, document references, follow-up items…"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveVerificationNotes(m.id)}
                        disabled={savingNotesMerchantId === m.id}
                        className="mt-2 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
                      >
                        {savingNotesMerchantId === m.id
                          ? "Saving…"
                          : "Save review notes"}
                      </button>
                    </div>

                    <div className="mb-4">
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                          Recent transactions
                        </h4>
                        <Link
                          href="/admin/transactions"
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          All platform transactions →
                        </Link>
                      </div>
                      {loadingTxMerchantId === m.id ? (
                        <div className="flex h-24 items-center justify-center rounded-lg border border-border bg-muted/20">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-lg border border-border">
                          <table className="w-full min-w-[640px] text-left text-xs">
                            <thead>
                              <tr className="border-b border-border bg-muted/40">
                                <th className="px-2 py-2 font-medium text-muted-foreground">
                                  Time
                                </th>
                                <th className="px-2 py-2 font-medium text-muted-foreground">
                                  Amount
                                </th>
                                <th className="px-2 py-2 font-medium text-muted-foreground">
                                  Status
                                </th>
                                <th className="px-2 py-2 font-medium text-muted-foreground">
                                  Rail
                                </th>
                                <th className="px-2 py-2 font-medium text-muted-foreground">
                                  Customer
                                </th>
                                <th className="px-2 py-2 font-medium text-muted-foreground">
                                  Ref
                                </th>
                                <th className="px-2 py-2 font-medium text-muted-foreground">
                                  Link
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {(merchantTx[m.id] ?? []).length === 0 ? (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="px-2 py-6 text-center text-muted-foreground"
                                  >
                                    No transactions for this merchant yet.
                                  </td>
                                </tr>
                              ) : (
                                (merchantTx[m.id] ?? []).map((t) => (
                                  <tr key={t.id}>
                                    <td className="whitespace-nowrap px-2 py-2 text-muted-foreground">
                                      {new Date(t.created_at).toLocaleString()}
                                    </td>
                                    <td className="whitespace-nowrap px-2 py-2 font-medium">
                                      ${Number(t.amount).toFixed(2)}{" "}
                                      {t.currency}
                                    </td>
                                    <td className="px-2 py-2">{t.status}</td>
                                    <td className="px-2 py-2 text-muted-foreground">
                                      {t.payment_rail ?? "—"}
                                    </td>
                                    <td className="max-w-[120px] truncate px-2 py-2 text-muted-foreground">
                                      {t.customer_email ?? "—"}
                                    </td>
                                    <td className="max-w-[100px] truncate px-2 py-2 font-mono text-muted-foreground">
                                      {t.provider_order_id ??
                                        t.payram_reference_id ??
                                        "—"}
                                    </td>
                                    <td className="px-2 py-2">
                                      {t.payment_url ? (
                                        <a
                                          href={t.payment_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-0.5 text-accent hover:underline"
                                        >
                                          Open
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      ) : (
                                        "—"
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    <div className="mb-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-3">
                      <p className="mb-2 text-xs font-medium text-foreground">
                        PayRam project (per-merchant API key)
                      </p>
                      <p className="mb-3 text-xs text-muted-foreground">
                        Create the project in PayRam, then paste the project API
                        key here so checkout and webhooks use that project.
                        Leave API key blank to only update project metadata or
                        base URL.
                      </p>
                      {payramError && (
                        <p className="mb-2 text-xs text-red-500">{payramError}</p>
                      )}
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            PayRam project ID (reference)
                          </label>
                          <input
                            value={payramProjectId}
                            onChange={(e) => setPayramProjectId(e.target.value)}
                            placeholder="e.g. 3"
                            className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Project name (label)
                          </label>
                          <input
                            value={payramProjectName}
                            onChange={(e) =>
                              setPayramProjectName(e.target.value)
                            }
                            placeholder="Acme Store"
                            className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            API key (secret)
                          </label>
                          <input
                            type="password"
                            autoComplete="new-password"
                            value={payramApiKey}
                            onChange={(e) => setPayramApiKey(e.target.value)}
                            placeholder={
                              firstRelationRow(m.merchant_payram_credentials)
                                ? "Paste new key to rotate"
                                : "Paste project API key"
                            }
                            className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Base URL override (optional)
                          </label>
                          <input
                            value={payramBaseUrl}
                            onChange={(e) => setPayramBaseUrl(e.target.value)}
                            placeholder="http://host:8080 — defaults from server env if empty"
                            className="w-full rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSavePayramCredentials(m.id)}
                        disabled={savingPayram}
                        className="mt-3 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background hover:bg-foreground/90 disabled:opacity-50"
                      >
                        {savingPayram ? (
                          <span className="flex items-center gap-1">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Saving…
                          </span>
                        ) : (
                          "Save PayRam credentials"
                        )}
                      </button>
                    </div>

                    <div className="mb-4 rounded-lg border border-border bg-background/50 p-3">
                      <p className="mb-2 text-xs font-medium text-foreground">
                        Payment Rail Routing
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Primary Rail
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={settings.payment_rail ?? "payram"}
                              onChange={(e) =>
                                handleRailChange(
                                  m.id,
                                  "payment_rail",
                                  e.target.value
                                )
                              }
                              disabled={
                                savingRail === `${m.id}-payment_rail`
                              }
                              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground disabled:opacity-50"
                            >
                              {RAIL_OPTIONS.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            {savingRail === `${m.id}-payment_rail` && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-muted-foreground">
                            Fallback Rail
                          </label>
                          <div className="flex items-center gap-2">
                            <select
                              value={settings.fallback_rail ?? ""}
                              onChange={(e) =>
                                handleRailChange(
                                  m.id,
                                  "fallback_rail",
                                  e.target.value
                                )
                              }
                              disabled={
                                savingRail === `${m.id}-fallback_rail`
                              }
                              className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm text-foreground disabled:opacity-50"
                            >
                              <option value="">None</option>
                              {RAIL_OPTIONS.filter(
                                (r) =>
                                  r.value !==
                                  (settings.payment_rail ?? "payram")
                              ).map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>
                            {savingRail === `${m.id}-fallback_rail` && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Detail
                        label="Application submitted"
                        value={
                          settings.application_submitted_at
                            ? new Date(
                                settings.application_submitted_at
                              ).toLocaleString()
                            : null
                        }
                      />
                      <Detail
                        label="Company (settings)"
                        value={settings.company_name}
                      />
                      <Detail
                        label="Expected volume"
                        value={settings.expected_monthly_volume}
                      />
                      <Detail
                        label="Legal Name"
                        value={settings.legal_business_name}
                      />
                      <Detail
                        label="Registration / Tax ID"
                        value={settings.business_registration_number}
                      />
                      <Detail label="Country" value={settings.country} />
                      <Detail
                        label="Address"
                        value={[
                          settings.business_address,
                          settings.city,
                          settings.state_province,
                          settings.postal_code,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      />
                      <Detail
                        label="Business Type"
                        value={settings.business_type}
                      />
                      <Detail
                        label="Website"
                        value={settings.website_url}
                      />
                      <Detail label="Webhook URL" value={settings.webhook_url} />
                      <Detail
                        label="Saved review notes"
                        value={settings.verification_notes}
                      />
                      <Detail
                        label="Success redirect URL"
                        value={settings.payram_success_redirect_url}
                      />
                      <Detail
                        label="Cancel redirect URL"
                        value={settings.payram_cancel_redirect_url}
                      />
                      <Detail
                        label="Representative"
                        value={
                          settings.representative_first_name ||
                          settings.representative_last_name
                            ? `${settings.representative_first_name ?? ""} ${settings.representative_last_name ?? ""}`.trim()
                            : null
                        }
                      />
                      <Detail
                        label="Rep Email"
                        value={settings.representative_email}
                      />
                      <Detail
                        label="Rep Phone"
                        value={settings.representative_phone}
                      />
                      <Detail
                        label="Settlement wallet"
                        value={settings.wallet_address}
                        mono
                      />
                      <Detail
                        label="Cold wallet"
                        value={settings.cold_wallet_address}
                        mono
                      />
                      <Detail
                        label="Wallet / payout notes"
                        value={settings.settlement_notes}
                      />
                      <Detail
                        label="Chain"
                        value={settings.preferred_chain}
                      />
                    </div>

                    {(settings.business_description ||
                      settings.settlement_notes) && (
                      <div className="mb-4 grid gap-4 sm:grid-cols-2">
                        {settings.business_description ? (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              Business description (full)
                            </p>
                            <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                              {settings.business_description}
                            </p>
                          </div>
                        ) : null}
                        {settings.settlement_notes ? (
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">
                              Wallet / payout notes (full)
                            </p>
                            <p className="mt-1 max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-3 text-sm text-foreground">
                              {settings.settlement_notes}
                            </p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}

                {isExpanded && !settings && (
                  <div className="border-t border-border px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      No business details submitted yet.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | null | undefined;
  mono?: boolean;
}): ReactNode {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`text-sm text-foreground ${mono ? "font-mono" : ""} ${!value ? "text-muted-foreground" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}
