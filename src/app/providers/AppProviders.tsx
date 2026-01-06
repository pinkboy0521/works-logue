"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
