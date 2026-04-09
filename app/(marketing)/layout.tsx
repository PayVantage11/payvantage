import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ThemeSwitch } from "@/components/theme-switch";
import type { ReactNode } from "react";

export default function MarketingLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>): ReactNode {
  return (
    <>
      <Header />
      <ThemeSwitch />
      {children}
      <Footer />
    </>
  );
}
