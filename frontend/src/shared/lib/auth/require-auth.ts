// src/shared/lib/auth/require-auth.ts
import { auth0 } from "@/shared/config/auth0";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}
