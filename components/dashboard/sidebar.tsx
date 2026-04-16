"use client";

import { cn } from "@/lib/utils";
import {
  CreditCard,
  Key,
  LayoutDashboard,
  Link2,
  LogOut,
  Plug,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Payment Links", href: "/dashboard/payments", icon: Link2 },
  { label: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
  { label: "API Keys", href: "/dashboard/api-keys", icon: Key },
  { label: "Integrations", href: "/dashboard/integrations", icon: Plug },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar({
  user,
  onboarded = true,
}: {
  user: { email: string; id: string };
  onboarded?: boolean;
}): ReactNode {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  const isOnboarding = pathname.includes("/onboarding");

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-muted/30">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-foreground" />
          <span className="text-lg font-semibold text-foreground">
            PayVantage
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {isOnboarding ? (
          <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Setting up your account...
          </div>
        ) : !onboarded ? (
          <div className="space-y-2 px-1">
            <Link
              href="/dashboard/onboarding"
              className="flex w-full items-center justify-center rounded-lg bg-foreground px-3 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              Complete onboarding
            </Link>
            <p className="px-2 text-xs leading-relaxed text-muted-foreground">
              Finish setup to unlock payments, API keys, and the rest of your
              dashboard.
            </p>
          </div>
        ) : (
          navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })
        )}
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/10 text-xs font-medium text-foreground">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
