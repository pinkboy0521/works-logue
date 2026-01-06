"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared";

export function VerifyEmailPageComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!searchParams) {
      setStatus("error");
      setError("認証トークンが見つかりません");
      return;
    }

    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      setError("認証トークンが見つかりません");
      return;
    }

    // メール認証API呼び出し
    const verifyEmail = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        if (result.success) {
          setStatus("success");
        } else {
          setStatus("error");
          setError(result.error || "認証に失敗しました");
        }
      } catch {
        setStatus("error");
        setError("ネットワークエラーが発生しました");
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleContinue = () => {
    router.push("/login?message=email-verified");
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>メール認証中...</CardTitle>
            <CardDescription>
              認証処理を行っています。しばらくお待ちください。
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">認証完了</CardTitle>
            <CardDescription>
              メール認証が完了しました。ログインしてプロフィール設定を行ってください。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleContinue} className="w-full">
              ログイン画面へ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-red-600">認証エラー</CardTitle>
          <CardDescription>メール認証に失敗しました。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => router.push("/login")} className="w-full">
            ログイン画面に戻る
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
