import { ReactNode } from "react";
import { auth } from "@/auth";
import { AppProviders } from "./providers";
import { BaseLayout, AuthLayout } from "@/shared";

interface AppProps {
  children: ReactNode;
  variant?: "default" | "auth";
}

export async function App({ children, variant = "default" }: AppProps) {
  const Layout = variant === "auth" ? AuthLayout : BaseLayout;
  const session = await auth();

  return (
    <AppProviders session={session}>
      <Layout>{children}</Layout>
    </AppProviders>
  );
}
