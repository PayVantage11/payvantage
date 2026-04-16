import { Sidebar } from "@/components/dashboard/sidebar";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarded, role, approved")
    .eq("id", user.id)
    .single();

  const isAdmin =
    (profile?.role ?? "").trim().toLowerCase() === "admin";
  if (isAdmin) {
    redirect("/admin");
  }

  const { data: merchantRow } = await supabase
    .from("merchant_settings")
    .select("application_submitted_at")
    .eq("merchant_id", user.id)
    .maybeSingle();

  const showApplicationReview =
    Boolean(merchantRow?.application_submitted_at) &&
    profile?.approved === false;

  return (
    <div className="flex min-h-screen">
      <Sidebar
        user={{ email: user.email ?? "", id: user.id }}
        onboarded={profile?.onboarded ?? false}
      />
      <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
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
