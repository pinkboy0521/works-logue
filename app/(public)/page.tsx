import { HomePage } from "@/pages";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "ホーム - Works Logue",
  description: "Works Logueで記事を読んで、学びを共有しよう",
};

// SSRに切り替えてビルド時のDBアクセスを回避
export const dynamic = "force-dynamic";

export default async function Page() {
  return <HomePage />;
}
