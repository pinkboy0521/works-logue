"use client";

import { Suspense } from "react";
import { SignupForm } from "@/features/auth/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared";

export function SignupPageComponent() {
  return (
    <div className="container mx-auto max-w-md py-12">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">新規登録</CardTitle>
          <CardDescription>
            Works
            Logueへようこそ。アカウントを作成して、あなたの専門知識を共有しましょう。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>読み込み中...</div>}>
            <SignupForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
