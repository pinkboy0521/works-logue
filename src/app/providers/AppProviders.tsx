"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface AppProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export function AppProviders({ children, session }: AppProvidersProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
