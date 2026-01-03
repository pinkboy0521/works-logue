import { auth } from "@/auth";
import { getUserWithAllArticles } from "@/entities";
import { redirect } from "next/navigation";
import { DashboardPageClient } from "./DashboardPageClient";

export async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await getUserWithAllArticles(session.user.id);

  if (!user) {
    redirect("/login");
  }

  return <DashboardPageClient user={user} />;
}
