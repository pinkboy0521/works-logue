import { ReactNode } from "react";
import { AppProviders } from "./providers";
import { BaseLayout, AuthLayout } from "@/shared";

interface AppProps {
  children: ReactNode;
  variant?: "default" | "auth";
}

export function App({ children, variant = "default" }: AppProps) {
  const Layout = variant === "auth" ? AuthLayout : BaseLayout;

  return (
    <AppProviders>
      <Layout>{children}</Layout>
    </AppProviders>
  );
}
