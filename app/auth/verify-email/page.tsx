import { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailPage } from "@/pages";

export const metadata: Metadata = {
  title: "メールアドレス確認 | Works Logue",
  description: "メールアドレスの確認を行います",
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailPage />
    </Suspense>
  );
}
