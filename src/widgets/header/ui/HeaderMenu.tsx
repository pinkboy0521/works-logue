"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared";
import { logoutAction } from "@/features";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { useEffect, useState } from "react";

export function HeaderMenu({
  session: initialSession,
}: {
  session: Session | null;
}) {
  const { data: session } = useSession(); // リアルタイムセッション監視
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{
    image?: string;
    displayName?: string;
  } | null>(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      // セッションがない場合、またはemailがない場合
      if (!session?.user?.email) {
        setIsAdmin(false);
        setIsLoading(false);
        setUserProfile(null);
        return;
      }

      try {
        const response = await fetch("/api/user/me");
        if (response.ok) {
          const profile = await response.json();
          setIsAdmin(profile.role === "ADMIN");
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Failed to check admin status:", error);
        setIsAdmin(false);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [session?.user?.email, session?.user?.image]); // session.user.imageも監視

  // プロフィール画像の更新イベントをリッスン
  useEffect(() => {
    const handleProfileImageUpdate = (event: CustomEvent) => {
      const { imageUrl } = event.detail;
      setUserProfile((prev) =>
        prev ? { ...prev, image: imageUrl } : { image: imageUrl },
      );
    };

    window.addEventListener(
      "profileImageUpdate",
      handleProfileImageUpdate as EventListener,
    );

    return () => {
      window.removeEventListener(
        "profileImageUpdate",
        handleProfileImageUpdate as EventListener,
      );
    };
  }, []);

  return (
    <div className="flex items-center gap-s">
      <ThemeToggle />
      {session?.user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer w-12 h-12">
              {userProfile?.image || session.user?.image ? (
                <AvatarImage
                  src={userProfile?.image || session.user?.image || undefined}
                />
              ) : null}
              <AvatarFallback className="font-semibold">
                {(userProfile?.displayName || session.user?.name)
                  ?.charAt(0)
                  ?.toUpperCase() || "ユ"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem asChild>
              <Link href="/mypage/profile" className="w-full cursor-pointer">
                プロフィール
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/mypage/articles" className="w-full cursor-pointer">
                記事の管理
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/mypage/bookmarks" className="w-full cursor-pointer">
                ブックマークした記事
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/mypage/likes" className="w-full cursor-pointer">
                いいねした記事
              </Link>
            </DropdownMenuItem>
            {isAdmin && !isLoading && (
              <DropdownMenuItem asChild>
                <Link href="/admin" className="w-full cursor-pointer">
                  管理者機能
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={logoutAction}
              className="w-full cursor-pointer"
            >
              ログアウト
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <>
          <Button variant="ghost" asChild className="cursor-pointer">
            <Link href="/login">ログイン</Link>
          </Button>
          <Button asChild className="cursor-pointer">
            <Link href="/signup">新規登録</Link>
          </Button>
        </>
      )}
    </div>
  );
}
