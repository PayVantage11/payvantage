import { OnboardingGate } from "@/components/dashboard/onboarding-gate";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  getSessionProfileForUser,
  isAdminRole,
} from "@/lib/auth/session-profile";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): Promise<ReactNode> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const sessionProfile = await getSessionProfileForUser(supabase, user.id);

  if (isAdminRole(sessionProfile?.role)) {
    redirect("/admin");
  }

  const { data: merchantRow } = await supabase
    .from("merchant_settings")
    .select("application_submitted_at")
    .eq("merchant_id", user.id)
    .maybeSingle();

  const showApplicationReview =
    Boolean(merchantRow?.application_submitted_at) &&
    sessionProfile?.approved === false;

  const needsOnboarding = !sessionProfile?.onboarded;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{ email: user.email ?? "", id: user.id }}
        onboarded={sessionProfile?.onboarded ?? false}
      />
      <main className="relative flex-1 overflow-y-auto bg-background p-6 lg:p-8">
        <OnboardingGate needsOnboarding={needsOnboarding} />
        {showApplicationReview && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
            <p className="font-medium">Application in review</p>
            <p className="mt-1 text-muted-foreground">
              Thanks for submitting your business and wallet details. Our team
              will notify you once your account is approved and your payment
              project is connected.
            </p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
