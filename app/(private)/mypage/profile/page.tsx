"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { ProfileSetupForm } from "@/widgets/profile-setup";
import { ProfilePreview } from "@/entities/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared";
import type { UserWithProfile } from "@/entities/user/model/types";

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // プレビュー用のユーザーデータ（リアルタイム更新用）
  const [previewUser, setPreviewUser] = useState<UserWithProfile | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/user/me");
        if (!response.ok) {
          router.push("/login");
          return;
        }
        const userData = await response.json();
        if (!userData) {
          router.push("/login");
          return;
        }
        setUser(userData);
        setPreviewUser(userData); // プレビュー用にもセット
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [session?.user?.id, router]);

  const handleProfileEditComplete = () => {
    // 同じページにとどまる（何もしない）
  };

  // プレビュー更新ハンドラー（フォームからの変更を受け取る）
  const handlePreviewUpdate = useCallback((updatedUser: UserWithProfile) => {
    setPreviewUser(updatedUser);
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!user || !previewUser) {
    return null; // リダイレクト中
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">プロフィール</h1>
        <p className="text-muted-foreground mt-2">
          あなたのプロフィールの確認と編集ができます。編集内容は即座にプレビューに反映されます。
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2 xl:gap-12">
        {/* プレビュー（公開の見え方） */}
        <div className="order-2 lg:order-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">公開プレビュー</CardTitle>
              <p className="text-sm text-muted-foreground">
                他のユーザーに表示される内容
              </p>
            </CardHeader>
            <CardContent>
              <ProfilePreview user={previewUser} />
            </CardContent>
          </Card>
        </div>

        {/* 編集フォーム */}
        <div className="order-1 lg:order-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">プロフィール編集</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfileSetupForm
                user={user}
                mode="edit"
                onComplete={handleProfileEditComplete}
                onPreviewUpdate={handlePreviewUpdate}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
