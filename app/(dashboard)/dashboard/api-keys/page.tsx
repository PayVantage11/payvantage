"use client";

import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useState, type ReactNode } from "react";

function generateKey(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

export default function ApiKeysPage(): ReactNode {
  const [publishableKey, setPublishableKey] = useState(
    "pv_pub_a1b2c3d4e5f6g7h8i9j0k1l2m3n4"
  );
  const [secretKey, setSecretKey] = useState(
    "pv_sec_z9y8x7w6v5u4t3s2r1q0p9o8n7m6"
  );
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function handleCopy(value: string, label: string) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  function handleRegenerate() {
    setPublishableKey(generateKey("pv_pub_"));
    setSecretKey(generateKey("pv_sec_"));
    setShowSecret(false);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">API Keys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use these keys to authenticate requests to the PayVantage API.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Publishable Key
              </h3>
              <p className="text-xs text-muted-foreground">
                Safe to use in client-side code
              </p>
            </div>
            <button
              onClick={() => handleCopy(publishableKey, "publishable")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === "publishable" ? "Copied!" : "Copy"}
            </button>
          </div>
          <code className="block rounded-lg bg-background px-4 py-3 font-mono text-sm text-foreground">
            {publishableKey}
          </code>
        </div>

        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">
                Secret Key
              </h3>
              <p className="text-xs text-muted-foreground">
                Server-side only — never expose in client code
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {showSecret ? (
                  <EyeOff className="h-3.5 w-3.5" />
                ) : (
                  <Eye className="h-3.5 w-3.5" />
                )}
                {showSecret ? "Hide" : "Reveal"}
              </button>
              <button
                onClick={() => handleCopy(secretKey, "secret")}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied === "secret" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <code className="block rounded-lg bg-background px-4 py-3 font-mono text-sm text-foreground">
            {showSecret ? secretKey : "pv_sec_••••••••••••••••••••••••••••••••"}
          </code>
        </div>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Regenerate API Keys
          </p>
          <p className="text-xs text-muted-foreground">
            This will invalidate your current keys. Update all integrations
            before regenerating.
          </p>
        </div>
        <button
          onClick={handleRegenerate}
          className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </button>
      </div>
    </div>
  );
}
