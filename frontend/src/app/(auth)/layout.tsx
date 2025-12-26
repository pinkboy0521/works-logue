import { requireAuth } from "@/shared";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <>{children}</>;
}
