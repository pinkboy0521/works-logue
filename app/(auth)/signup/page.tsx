import { Metadata } from "next";
import { SignupPage } from "@/pages";

export const metadata: Metadata = {
  title: "新規登録 | Works Logue",
  description:
    "Works Logueで新しいアカウントを作成し、あなたの専門知識を共有しましょう。",
};

export default function Page() {
  return <SignupPage />;
}
