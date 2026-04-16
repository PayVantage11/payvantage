"use client";

import { createClient } from "@/utils/supabase/client";
import { Loader2, ShieldCheck, Clock, ShieldX } from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type VerificationStatus = "pending" | "verified" | "rejected";

export default function SettingsPage(): ReactNode {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>("pending");
  const [verificationNotes, setVerificationNotes] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [email, setEmail] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [preferredChain, setPreferredChain] = useState("BASE");

  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [country, setCountry] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [repFirstName, setRepFirstName] = useState("");
  const [repLastName, setRepLastName] = useState("");
  const [repEmail, setRepEmail] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState("");
  const [coldWalletAddress, setColdWalletAddress] = useState("");
  const [settlementNotes, setSettlementNotes] = useState("");
  const [payramSuccessRedirectUrl, setPayramSuccessRedirectUrl] =
    useState("");
  const [payramCancelRedirectUrl, setPayramCancelRedirectUrl] =
    useState("");
  const [applicationSubmittedAt, setApplicationSubmittedAt] = useState<
    string | null
  >(null);

  const loadSettings = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setEmail(user.email ?? "");

    const { data: settings } = await supabase
      .from("merchant_settings")
      .select("*")
      .eq("merchant_id", user.id)
      .maybeSingle();

    if (settings) {
      setCompanyName(settings.company_name ?? "");
      setBusinessType(settings.business_type ?? "");
      setWebsiteUrl(settings.website_url ?? "");
      setWebhookUrl(settings.webhook_url ?? "");
      setWalletAddress(settings.wallet_address ?? "");
      setPreferredChain(settings.preferred_chain ?? "BASE");
      setLegalBusinessName(settings.legal_business_name ?? "");
      setRegistrationNumber(settings.business_registration_number ?? "");
      setCountry(settings.country ?? "");
      setBusinessAddress(settings.business_address ?? "");
      setCity(settings.city ?? "");
      setStateProvince(settings.state_province ?? "");
      setPostalCode(settings.postal_code ?? "");
      setRepFirstName(settings.representative_first_name ?? "");
      setRepLastName(settings.representative_last_name ?? "");
      setRepEmail(settings.representative_email ?? "");
      setRepPhone(settings.representative_phone ?? "");
      setVerificationStatus(settings.verification_status ?? "pending");
      setVerificationNotes(settings.verification_notes ?? "");
      setBusinessDescription(settings.business_description ?? "");
      setExpectedMonthlyVolume(settings.expected_monthly_volume ?? "");
      setColdWalletAddress(settings.cold_wallet_address ?? "");
      setSettlementNotes(settings.settlement_notes ?? "");
      setPayramSuccessRedirectUrl(
        settings.payram_success_redirect_url ?? ""
      );
      setPayramCancelRedirectUrl(settings.payram_cancel_redirect_url ?? "");
      setApplicationSubmittedAt(settings.application_submitted_at ?? null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from("profiles")
        .update({ company_name: companyName })
        .eq("id", user.id);

      const { error: settingsError } = await supabase
        .from("merchant_settings")
        .upsert(
          {
            merchant_id: user.id,
            company_name: companyName,
            business_type: businessType,
            business_description: businessDescription.trim() || null,
            expected_monthly_volume: expectedMonthlyVolume || null,
            legal_business_name: legalBusinessName || null,
            business_registration_number: registrationNumber || null,
            country: country || null,
            business_address: businessAddress || null,
            city: city || null,
            state_province: stateProvince || null,
            postal_code: postalCode || null,
            representative_first_name: repFirstName || null,
            representative_last_name: repLastName || null,
            representative_email: repEmail || null,
            representative_phone: repPhone || null,
            website_url: websiteUrl || null,
            webhook_url: webhookUrl || null,
            wallet_address: walletAddress || null,
            cold_wallet_address: coldWalletAddress.trim() || null,
            settlement_notes: settlementNotes.trim() || null,
            payram_success_redirect_url:
              payramSuccessRedirectUrl.trim() || null,
            payram_cancel_redirect_url:
              payramCancelRedirectUrl.trim() || null,
            preferred_chain: preferredChain,
            payment_rail: "payram",
            rail_config: {},
            updated_at: new Date().toISOString(),
          },
          { onConflict: "merchant_id" }
        );

      if (settingsError) {
        setError(settingsError.message);
        setSaving(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Something went wrong");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const inputClass =
    "h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account, business details, and integration preferences.
        </p>
      </div>

      {/* Verification Status Banner */}
      {applicationSubmittedAt ? (
        <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Application submitted</p>
          <p className="mt-1 text-muted-foreground">
            {new Date(applicationSubmittedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
      ) : null}

      <div
        className={`flex items-center gap-3 rounded-xl border p-4 ${
          verificationStatus === "verified"
            ? "border-emerald-500/20 bg-emerald-500/5"
            : verificationStatus === "rejected"
              ? "border-red-500/20 bg-red-500/5"
              : "border-amber-500/20 bg-amber-500/5"
        }`}
      >
        {verificationStatus === "verified" ? (
          <ShieldCheck className="h-5 w-5 text-emerald-500" />
        ) : verificationStatus === "rejected" ? (
          <ShieldX className="h-5 w-5 text-red-500" />
        ) : (
          <Clock className="h-5 w-5 text-amber-500" />
        )}
        <div>
          <p className="text-sm font-medium text-foreground">
            {verificationStatus === "verified"
              ? "Business Verified"
              : verificationStatus === "rejected"
                ? "Verification Rejected"
                : "Verification Pending"}
          </p>
          <p className="text-xs text-muted-foreground">
            {verificationStatus === "verified"
              ? "Your business has been verified. You can accept live payments."
              : verificationStatus === "rejected"
                ? verificationNotes ||
                  "Please update your details and contact support."
                : "Your business info is being reviewed. This usually takes up to 24 hours."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            Settings saved successfully.
          </div>
        )}

        {/* Company Info */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Company Information
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Company / Brand Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Contact Email
              </label>
              <input type="email" value={email} disabled className={`${inputClass} !bg-muted !text-muted-foreground`} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Business Type
              </label>
              <input
                type="text"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://yourstore.com"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Business description
              </label>
              <textarea
                value={businessDescription}
                onChange={(e) => setBusinessDescription(e.target.value)}
                rows={3}
                placeholder="What you sell and who your customers are"
                className={`${inputClass} min-h-[88px] resize-y py-3`}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Expected monthly card volume
              </label>
              <input
                type="text"
                value={expectedMonthlyVolume}
                onChange={(e) => setExpectedMonthlyVolume(e.target.value)}
                placeholder="e.g. $10k – $50k / month"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Checkout redirects */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Checkout redirects
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Where shoppers return after paying or canceling (same values as
            onboarding).
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Success URL
              </label>
              <input
                type="url"
                value={payramSuccessRedirectUrl}
                onChange={(e) => setPayramSuccessRedirectUrl(e.target.value)}
                placeholder="https://yoursite.com/thank-you"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Cancel URL
              </label>
              <input
                type="url"
                value={payramCancelRedirectUrl}
                onChange={(e) => setPayramCancelRedirectUrl(e.target.value)}
                placeholder="https://yoursite.com/cart"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Business Verification */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Business Verification
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Legal details used for compliance and verification.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Legal Business Name
              </label>
              <input
                type="text"
                value={legalBusinessName}
                onChange={(e) => setLegalBusinessName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Registration / Tax ID
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Country
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Business Address
              </label>
              <input
                type="text"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                State / Province
              </label>
              <input
                type="text"
                value={stateProvince}
                onChange={(e) => setStateProvince(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Postal Code
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-3 text-sm font-medium text-foreground">
              Authorized Representative
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  First Name
                </label>
                <input
                  type="text"
                  value={repFirstName}
                  onChange={(e) => setRepFirstName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Last Name
                </label>
                <input
                  type="text"
                  value={repLastName}
                  onChange={(e) => setRepLastName(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  type="email"
                  value={repEmail}
                  onChange={(e) => setRepEmail(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Phone
                </label>
                <input
                  type="tel"
                  value={repPhone}
                  onChange={(e) => setRepPhone(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wallet */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Payout Wallet
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Preferred Chain
              </label>
              <select
                value={preferredChain}
                onChange={(e) => setPreferredChain(e.target.value)}
                className={inputClass}
              >
                <option value="BASE">Base</option>
                <option value="ETH">Ethereum</option>
                <option value="TRX">Tron</option>
                <option value="BTC">Bitcoin</option>
                <option value="POLYGON">Polygon</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Wallet Address
              </label>
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                className={`font-mono ${inputClass}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Cold wallet (treasury) address
              </label>
              <input
                type="text"
                value={coldWalletAddress}
                onChange={(e) => setColdWalletAddress(e.target.value)}
                placeholder="0x..."
                className={`font-mono ${inputClass}`}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Settlement notes
              </label>
              <textarea
                value={settlementNotes}
                onChange={(e) => setSettlementNotes(e.target.value)}
                rows={2}
                placeholder="Optional notes for settlement / ops"
                className={`${inputClass} min-h-[72px] resize-y py-3`}
              />
            </div>
          </div>
        </div>

        {/* Webhook */}
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">Webhooks</h3>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Webhook URL
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://yoursite.com/webhooks/payvantage"
              className={inputClass}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              We&apos;ll POST payment status updates to this URL as JSON.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
