import { AuthSplitShell } from "@/components/auth-split-shell";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return <AuthSplitShell>{children}</AuthSplitShell>;
}
