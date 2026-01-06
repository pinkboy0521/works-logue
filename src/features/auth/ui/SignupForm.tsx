"use client";

import { useState } from "react";
import {
  validateRegisterForm,
  type RegisterFormData,
} from "@/features/auth/model";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/shared";
import { useForm } from "react-hook-form";
import Link from "next/link";

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterFormData>({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    // クライアントサイドバリデーション
    const validationErrors = validateRegisterForm(data);
    if (validationErrors.length > 0) {
      setError(validationErrors.join("\n"));
      setIsLoading(false);
      return;
    }

    try {
      // 新規登録API呼び出し
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        setError(result.error || "登録中にエラーが発生しました");
        return;
      }

      setSuccess(true);

      // メール認証が必要なので自動ログインはしない
      // ユーザーはメール認証後にログインする必要がある
    } catch {
      setError("ネットワークエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">登録完了</CardTitle>
          <CardDescription>
            アカウントの作成が完了しました。認証メールを送信しましたので、メールボックスをご確認ください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            メール認証を完了すると、ログインしてプロフィール設定を行うことができます。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>メールアドレス *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@example.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード *</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="英数字8文字以上"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>パスワード（確認）*</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="上記と同じパスワードを入力"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "登録中..." : "アカウントを作成"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="text-primary hover:underline">
              ログイン
            </Link>
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>
            アカウント作成により、
            <Link href="/terms" className="hover:underline">
              利用規約
            </Link>
            および
            <Link href="/privacy" className="hover:underline">
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </p>
        </div>
      </form>
    </Form>
  );
}
