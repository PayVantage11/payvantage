import type { ReactNode } from "react";

export default function SettingsPage(): ReactNode {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and merchant preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Company Information
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your company details and contact information.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Company Name
              </label>
              <input
                type="text"
                defaultValue="Acme Inc."
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Contact Email
              </label>
              <input
                type="email"
                defaultValue="merchant@example.com"
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-accent focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">
            Payout Wallet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the wallet address where stablecoin settlements are sent.
          </p>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              USDC/USDT Wallet Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="h-10 w-full rounded-lg border border-border bg-background px-4 font-mono text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="text-lg font-semibold text-foreground">Webhooks</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure the URL where payment notifications are sent.
          </p>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Webhook URL
            </label>
            <input
              type="url"
              placeholder="https://yoursite.com/webhooks/payvantage"
              className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground focus:border-accent focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button className="rounded-lg bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
