"use client";

import { createClient } from "@/utils/supabase/client";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShieldCheck,
  ShieldX,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type MerchantSettings = {
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
  website_url: string | null;
  wallet_address: string | null;
  preferred_chain: string | null;
  verification_status: string;
  verification_notes: string | null;
};

type Merchant = {
  id: string;
  email: string;
  company_name: string | null;
  approved: boolean;
  onboarded: boolean;
  created_at: string;
  merchant_settings: MerchantSettings[] | null;
};

export default function MerchantsPage(): ReactNode {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadMerchants = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select(
        `id, email, company_name, approved, onboarded, created_at,
         merchant_settings (
           legal_business_name, business_registration_number, country,
           business_address, city, state_province, postal_code,
           representative_first_name, representative_last_name,
           representative_email, representative_phone,
           business_type, website_url, wallet_address, preferred_chain,
           verification_status, verification_notes
         )`
      )
      .eq("role", "merchant")
      .order("created_at", { ascending: false });
    setMerchants((data ?? []) as Merchant[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

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

  function getSettings(m: Merchant): MerchantSettings | null {
    if (!m.merchant_settings || m.merchant_settings.length === 0) return null;
    return m.merchant_settings[0] ?? null;
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

      {merchants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No merchants have registered yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {merchants.map((m) => {
            const settings = getSettings(m);
            const isExpanded = expanded === m.id;
            const vStatus = settings?.verification_status ?? "pending";

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

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.onboarded
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.onboarded ? "Onboarded" : "Not onboarded"}
                    </span>
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
                      {vStatus.charAt(0).toUpperCase() + vStatus.slice(1)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {acting === m.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : m.approved ? (
                      <button
                        onClick={() => handleApproval(m.id, false)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                      >
                        <X className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApproval(m.id, true)}
                        className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/10 dark:text-emerald-400"
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Expanded detail */}
                {isExpanded && settings && (
                  <div className="border-t border-border px-4 pb-4 pt-3">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        label="Wallet"
                        value={settings.wallet_address}
                        mono
                      />
                      <Detail
                        label="Chain"
                        value={settings.preferred_chain}
                      />
                    </div>
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
