"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUserById } from "@/entities/user";
import { ProfileSetupForm } from "@/widgets/profile-setup";
import type { UserWithProfile } from "@/entities/user/model/types";

export default function ProfileEditPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.id) {
        router.push("/login");
        return;
      }

      try {
        const userData = await getUserById(session.user.id);
        if (!userData) {
          router.push("/login");
          return;
        }
        setUser(userData);
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
    router.push("/mypage/profile");
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // リダイレクト中
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">プロフィール編集</h1>
        <p className="text-muted-foreground mt-2">
          あなたの情報を編集できます。変更は即座に反映されます。
        </p>
      </div>
      
      <div className="grid gap-6 lg:gap-8">
        <ProfileSetupForm 
          user={user} 
          mode="edit"
          onComplete={handleProfileEditComplete}
        />
      </div>
    </div>
  );
}