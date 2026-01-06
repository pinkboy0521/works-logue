import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/widgets";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
    </>
  );
}
