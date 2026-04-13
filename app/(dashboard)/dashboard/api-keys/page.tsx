"use client";

import { createClient } from "@/utils/supabase/client";
import { Copy, Eye, EyeOff, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

type ApiKey = {
  id: string;
  label: string;
  publishable_key: string;
  is_active: boolean;
  created_at: string;
};

function generateKeyString(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let key = prefix;
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
}

async function hashKey(key: string): Promise<string> {
  const encoded = new TextEncoder().encode(key);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function ApiKeysPage(): ReactNode {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [newlyCreatedSecret, setNewlyCreatedSecret] = useState<string | null>(
    null
  );
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("api_keys")
      .select("id, label, publishable_key, is_active, created_at")
      .order("created_at", { ascending: false });
    setKeys(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  function handleCopy(value: string, label: string) {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const publishableKey = generateKeyString("pv_pub_");
      const secretKey = generateKeyString("pv_sec_");
      const secretHash = await hashKey(secretKey);

      const { error: insertError } = await supabase.from("api_keys").insert({
        merchant_id: user.id,
        label: newLabel || "Default",
        publishable_key: publishableKey,
        secret_key_hash: secretHash,
      });

      if (insertError) {
        setError(insertError.message);
        setCreating(false);
        return;
      }

      setNewlyCreatedSecret(secretKey);
      setNewLabel("");
      setShowCreate(false);
      await loadKeys();
    } catch {
      setError("Failed to create API key");
    }

    setCreating(false);
  }

  async function handleDelete(keyId: string) {
    const supabase = createClient();
    await supabase.from("api_keys").delete().eq("id", keyId);
    await loadKeys();
  }

  async function handleToggle(keyId: string, currentActive: boolean) {
    const supabase = createClient();
    await supabase
      .from("api_keys")
      .update({ is_active: !currentActive })
      .eq("id", keyId);
    await loadKeys();
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
          <h1 className="text-2xl font-semibold text-foreground">API Keys</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Use these keys to authenticate requests to the PayVantage API.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" />
          Create Key
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {newlyCreatedSecret && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="mb-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Secret key created — copy it now, it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-background px-4 py-2 font-mono text-sm text-foreground">
              {newlyCreatedSecret}
            </code>
            <button
              onClick={() => {
                handleCopy(newlyCreatedSecret, "new-secret");
              }}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied === "new-secret" ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setNewlyCreatedSecret(null)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        </div>
      )}

      {showCreate && (
        <div className="rounded-xl border border-border bg-muted/30 p-6">
          <h3 className="mb-4 text-sm font-medium text-foreground">
            New API Key
          </h3>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="mb-1.5 block text-xs text-muted-foreground">
                Label
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g. Production, Staging"
                className="h-10 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={creating}
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
      )}

      {keys.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No API keys yet. Create one to start integrating.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <div
              key={key.id}
              className="rounded-xl border border-border bg-muted/30 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    {key.label}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      key.is_active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-red-500/10 text-red-500"
                    }`}
                  >
                    {key.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(key.id, key.is_active)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                  >
                    {key.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="rounded-lg px-2 py-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Publishable Key
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground">
                      {key.publishable_key}
                    </code>
                    <button
                      onClick={() =>
                        handleCopy(key.publishable_key, `pub-${key.id}`)
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Secret Key
                  </span>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-background px-3 py-2 font-mono text-xs text-foreground">
                      {revealedSecret === key.id
                        ? "(hash stored — secret shown only at creation)"
                        : "pv_sec_••••••••••••••••••••••••••••••••"}
                    </code>
                    <button
                      onClick={() =>
                        setRevealedSecret(
                          revealedSecret === key.id ? null : key.id
                        )
                      }
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {revealedSecret === key.id ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Created{" "}
                {new Date(key.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
