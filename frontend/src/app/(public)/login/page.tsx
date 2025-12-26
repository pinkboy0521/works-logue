// app/(public)/login/page.tsx
import { auth0 } from "@/shared/config/auth0";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth0.getSession();

  if (session) {
    redirect("/dashboard");
  }

  // ここは「自動遷移」でもOK
  redirect("/auth/login?returnTo=/dashboard");
}
