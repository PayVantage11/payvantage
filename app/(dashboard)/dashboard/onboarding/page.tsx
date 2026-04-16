"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useState, type ReactNode, type FormEvent } from "react";
import {
  Building2,
  Globe,
  Wallet,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
} from "lucide-react";

const STEPS = [
  { label: "Business Info", icon: Building2 },
  { label: "Verification", icon: UserCheck },
  { label: "Integration", icon: Globe },
  { label: "Wallet", icon: Wallet },
];

const BUSINESS_TYPES = [
  "E-commerce",
  "SaaS / Subscription",
  "Marketplace",
  "Digital Goods",
  "Gaming / iGaming",
  "Freelance / Services",
  "Non-profit / Charity",
  "Other",
];

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "Germany",
  "France", "Netherlands", "Singapore", "Hong Kong", "Japan",
  "South Korea", "Brazil", "Mexico", "India", "UAE",
  "Switzerland", "Ireland", "Sweden", "Norway", "Denmark",
  "New Zealand", "South Africa", "Nigeria", "Kenya", "Other",
];

const CHAINS = [
  { value: "BASE", label: "Base (Recommended — low fees)" },
  { value: "ETH", label: "Ethereum" },
  { value: "TRX", label: "Tron" },
  { value: "BTC", label: "Bitcoin" },
  { value: "POLYGON", label: "Polygon" },
];

const MONTHLY_VOLUME_OPTIONS = [
  "Under $10k / month",
  "$10k – $50k / month",
  "$50k – $250k / month",
  "$250k+ / enterprise",
  "Not sure yet",
] as const;

export default function OnboardingPage(): ReactNode {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Business basics
  const [companyName, setCompanyName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");

  // Step 2: Business verification
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
  const [expectedMonthlyVolume, setExpectedMonthlyVolume] = useState("");

  // Step 3: Integration
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [payramSuccessRedirectUrl, setPayramSuccessRedirectUrl] = useState("");
  const [payramCancelRedirectUrl, setPayramCancelRedirectUrl] = useState("");

  // Step 4: Wallet
  const [walletAddress, setWalletAddress] = useState("");
  const [coldWalletAddress, setColdWalletAddress] = useState("");
  const [settlementNotes, setSettlementNotes] = useState("");
  const [preferredChain, setPreferredChain] = useState("BASE");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { error: ensureError } = await supabase.rpc(
        "ensure_merchant_profile"
      );
      if (ensureError) {
        setError(ensureError.message);
        setLoading(false);
        return;
      }

      const submittedAt = new Date().toISOString();

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
            representative_email: repEmail || user.email,
            representative_phone: repPhone || null,
            website_url: websiteUrl || null,
            webhook_url: webhookUrl || null,
            payram_success_redirect_url: payramSuccessRedirectUrl.trim() || null,
            payram_cancel_redirect_url: payramCancelRedirectUrl.trim() || null,
            wallet_address: walletAddress || null,
            cold_wallet_address: coldWalletAddress.trim() || null,
            settlement_notes: settlementNotes.trim() || null,
            preferred_chain: preferredChain,
            payment_rail: "payram",
            rail_config: {},
            verification_status: "pending",
            application_submitted_at: submittedAt,
            updated_at: submittedAt,
          },
          { onConflict: "merchant_id" }
        );

      if (settingsError) {
        setError(settingsError.message);
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ company_name: companyName, onboarded: true })
        .eq("id", user.id);

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  function canAdvance(): boolean {
    if (step === 0)
      return (
        companyName.trim().length > 0 &&
        businessType.length > 0 &&
        businessDescription.trim().length > 0
      );
    if (step === 1)
      return (
        repFirstName.trim().length > 0 &&
        repLastName.trim().length > 0 &&
        country.length > 0 &&
        expectedMonthlyVolume.length > 0
      );
    if (step === 3)
      return (
        walletAddress.trim().length > 0 &&
        coldWalletAddress.trim().length > 0
      );
    return true;
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none";

  return (
    <div className="mx-auto max-w-2xl py-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold text-foreground">
          Set up your business
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Complete this application with your business, settlement, and payout
          details. After you submit, the account stays in review until our team
          approves it and connects your payment project.
        </p>
      </div>

      <div className="mb-8 flex items-center justify-center gap-1">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex items-center gap-1">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i < step
                  ? "bg-emerald-500 text-white"
                  : i === step
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={`hidden text-sm font-medium sm:inline ${
                i === step ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 h-px w-6 bg-border" />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          {/* Step 1: Business Basics */}
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Business Information
              </h3>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Company / Brand Name *
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  placeholder="Acme Inc."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Business Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBusinessType(type)}
                      className={`rounded-lg border px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                        businessType === type
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  What do you sell or do? *
                </label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  required
                  rows={4}
                  placeholder="Products, services, average order value, customer regions, and anything material for risk or compliance."
                  className={`${inputClass} min-h-[100px] resize-y py-3`}
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Verification */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Business Verification
              </h3>
              <p className="text-sm text-muted-foreground">
                We need to verify your business before activating payment
                processing. This info is kept secure and used only for
                compliance.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Legal Business Name
                  </label>
                  <input
                    type="text"
                    value={legalBusinessName}
                    onChange={(e) => setLegalBusinessName(e.target.value)}
                    placeholder="Acme Corp LLC"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Registration / Tax ID Number
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="EIN, VAT, etc."
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Expected card / payment volume *
                </label>
                <select
                  value={expectedMonthlyVolume}
                  onChange={(e) => setExpectedMonthlyVolume(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select range...</option>
                  {MONTHLY_VOLUME_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Country *
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Select country...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Business Address
                </label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="123 Main St, Suite 100"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Miami"
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
                    placeholder="Florida"
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
                    placeholder="33131"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="mb-3 text-sm font-medium text-foreground">
                  Authorized Representative *
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={repFirstName}
                      onChange={(e) => setRepFirstName(e.target.value)}
                      required
                      placeholder="John"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={repLastName}
                      onChange={(e) => setRepLastName(e.target.value)}
                      required
                      placeholder="Smith"
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
                      placeholder="john@acme.com"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-foreground">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={repPhone}
                      onChange={(e) => setRepPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Integration */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Integration Settings
              </h3>
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
                <p className="mt-1 text-xs text-muted-foreground">
                  Your business website or storefront URL.
                </p>
              </div>
              <div>
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
                  We&apos;ll POST payment updates (completed, failed) to this
                  URL as JSON. You can configure this later in Settings.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Checkout success redirect URL
                  </label>
                  <input
                    type="url"
                    value={payramSuccessRedirectUrl}
                    onChange={(e) => setPayramSuccessRedirectUrl(e.target.value)}
                    placeholder="https://yoursite.com/thanks"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Optional. We will mirror this into your processor project
                    after approval.
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Checkout cancel redirect URL
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

              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  Customer KYC
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  When customers pay using the card-to-crypto onramp, they
                  complete a one-time KYC verification on their first purchase.
                  This is handled automatically by the payment page — no extra
                  setup needed on your end.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Wallet */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Payment Settlement
              </h3>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Preferred Blockchain
                </label>
                <select
                  value={preferredChain}
                  onChange={(e) => setPreferredChain(e.target.value)}
                  className={inputClass}
                >
                  {CHAINS.map((chain) => (
                    <option key={chain.value} value={chain.value}>
                      {chain.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  The default chain for receiving payments. Customers can still
                  choose other chains at checkout.
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Hot / settlement wallet address *
                </label>
                <input
                  type="text"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder="0x... or TRX... or bc1..."
                  className={`font-mono ${inputClass}`}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Primary address where you want customer payments consolidated
                  for your default chain.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Cold wallet address *
                </label>
                <input
                  type="text"
                  value={coldWalletAddress}
                  onChange={(e) => setColdWalletAddress(e.target.value)}
                  placeholder="Hardware wallet or vault address"
                  className={`font-mono ${inputClass}`}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Long-term storage address (can match your settlement wallet if
                  you only use one vault).
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Wallet & payout notes
                </label>
                <textarea
                  value={settlementNotes}
                  onChange={(e) => setSettlementNotes(e.target.value)}
                  rows={3}
                  placeholder="Master wallet custody, gas refill preferences, Tron vs EVM, who holds keys, etc."
                  className={`${inputClass} min-h-[80px] resize-y py-3`}
                />
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  After you submit
                </p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>
                    1. Your application is marked{" "}
                    <span className="font-medium text-foreground">in review</span>
                    . We may reach out if anything is missing.
                  </li>
                  <li>
                    2. When approved, we attach your live payment project and you
                    can create API keys and payment links in the dashboard.
                  </li>
                  <li>
                    3. End-customer KYC for card routes is handled on the payment
                    page when applicable.
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canAdvance()}
              className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit application
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
