import { LoginPage } from "@/pages";
import { type Metadata } from "next";
import { auth } from "../../../src/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "ログイン - Works Logue",
  description: "Works Logueにログインしてください",
};

export default async function Page() {
  // ログイン済みユーザーをホームページにリダイレクト
  const session = await auth();
  if (session?.user) {
    redirect("/");
  }

  return <LoginPage />;
}
