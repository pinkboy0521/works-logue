import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isAdmin } from "@/shared";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const adminStatus = await isAdmin();

  if (!adminStatus) {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">管理者ダッシュボード</h1>
        <p className="text-muted-foreground">
          システムの設定とマスタデータを管理できます
        </p>
      </div>
      {children}
    </div>
  );
}
