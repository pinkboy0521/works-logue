import { Metadata } from "next";
import { WelcomePage } from "@/pages";

export const metadata: Metadata = {
  title: "プロフィール設定 | Works Logue",
  description:
    "Works Logueのプロフィールを設定して、あなたらしさを表現しましょう。",
};

export default function Page() {
  return <WelcomePage />;
}
