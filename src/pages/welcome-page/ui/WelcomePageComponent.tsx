"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ProfileSetupForm } from "@/widgets";
import { Card, CardDescription, CardHeader, CardTitle } from "@/shared";
import type { UserWithProfile } from "@/entities/user/model/types";

export function WelcomePageComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false); // 初期値をfalseに変更
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false); // 一度だけチェック

  useEffect(() => {
    const checkProfile = async () => {
      // 既にチェック済みまたはセッション読み込み中は処理しない
      if (hasCheckedProfile || status === "loading") return;

      if (status === "unauthenticated") {
        router.push("/login");
        return;
      }

      if (!session?.user?.email) {
        // メールがない場合はフォーム表示
        setHasCheckedProfile(true);
        return;
      }

      setIsLoading(true);
      setHasCheckedProfile(true);

      try {
        const response = await fetch("/api/user/me");

        if (!response.ok) {
          console.error("API error:", response.status, response.statusText);
          // API エラーの場合でもプロフィール設定フォームを表示
          setUserProfile(null);
          setIsLoading(false);
          return;
        }

        const profile = await response.json();
        setUserProfile(profile);

        // プロフィールが完成しているかチェック
        const isCompleted =
          profile &&
          (profile.profileCompleted || (profile.displayName && profile.userId));

        if (isCompleted) {
          setIsProfileCompleted(true);
          // 即座にリダイレクト
          router.replace("/");
          return;
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        // エラーの場合でもプロフィール設定フォームを表示
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [status, session?.user?.email, router, hasCheckedProfile]);

  const handleProfileComplete = async () => {
    // プロフィール更新後はセッション情報を更新
    window.location.href = "/"; // セッション更新を確実にするためハードリダイレクト
  };

  // セッション読み込み中またはプロフィールチェック中
  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <div className="text-center">
          <p>
            {status === "loading"
              ? "読み込み中..."
              : "プロフィール情報を確認中..."}
          </p>
        </div>
      </div>
    );
  }

  if (isProfileCompleted) {
    return (
      <div className="container mx-auto max-w-4xl py-12">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-green-600">
              プロフィール設定完了！
            </CardTitle>
            <CardDescription>
              Works Logueへようこそ。ホームページに移動しています...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">🎉 Works Logueへようこそ！</h1>
        <p className="text-lg text-muted-foreground mb-2">
          あなたらしさを表現するプロフィールを作成しましょう
        </p>
        <p className="text-sm text-muted-foreground">
          プロフィール情報は後からいつでも変更できます。
        </p>
      </div>

      {session?.user && (
        <ProfileSetupForm
          user={userProfile}
          onComplete={handleProfileComplete}
        />
      )}
    </div>
  );
}
