import { ThemeSwitch } from "@/components/theme-switch";
import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return (
    <>
      <ThemeSwitch />
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-foreground" />
          <span className="text-xl font-semibold text-foreground">
            PayVantage
          </span>
        </Link>
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </>
  );
}
