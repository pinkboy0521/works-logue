"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/shared";
import { toggleArticleBookmark } from "../api/actions";
import { formatBookmarkCount } from "@/entities";
import { LoginModal } from "./LoginModal";

interface BookmarkButtonProps {
  articleId: string;
  initialCount: number;
  initialIsBookmarked: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function BookmarkButton({
  articleId,
  initialCount,
  initialIsBookmarked,
  isLoggedIn,
  size = "md",
  showCount = true,
}: BookmarkButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    startTransition(async () => {
      // 楽観的UIアップデート
      const newIsBookmarked = !isBookmarked;
      setIsBookmarked(newIsBookmarked);
      setCount((prev) => (newIsBookmarked ? prev + 1 : prev - 1));

      try {
        const formData = new FormData();
        formData.append("articleId", articleId);

        const result = await toggleArticleBookmark(formData);

        if (!result.success) {
          // エラー時はロールバック
          setIsBookmarked(!newIsBookmarked);
          setCount((prev) => (newIsBookmarked ? prev - 1 : prev + 1));

          if (result.requiresAuth) {
            setShowLoginModal(true);
          } else {
            console.error("Bookmark toggle failed:", result.error);
          }
        }
      } catch (error) {
        // エラー時はロールバック
        setIsBookmarked(!newIsBookmarked);
        setCount((prev) => (newIsBookmarked ? prev - 1 : prev + 1));
        console.error("Bookmark action failed:", error);
      }
    });
  };

  const sizeClasses = {
    sm: "h-8 text-sm",
    md: "h-9 text-base",
    lg: "h-10 text-lg",
  };

  const iconSizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className={`${sizeClasses[size]} px-3 flex items-center gap-2 ${
          isBookmarked
            ? "text-blue-500 hover:text-blue-600"
            : "text-gray-500 hover:text-blue-500"
        }`}
      >
        <Bookmark
          className={`${iconSizeClasses[size]} ${
            isBookmarked ? "fill-current" : ""
          }`}
        />
        {showCount && (
          <span className="text-sm font-medium">
            {formatBookmarkCount(count)}
          </span>
        )}
      </Button>

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="ブックマークするにはログインが必要です"
          message="記事をブックマークするには、アカウントが必要です。"
        />
      )}
    </>
  );
}
