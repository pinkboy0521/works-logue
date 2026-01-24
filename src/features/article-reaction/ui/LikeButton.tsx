"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/shared";
import { toggleArticleLike } from "../api/actions";
import { formatLikeCount } from "@/entities";
import { LoginModal } from "./LoginModal";

interface LikeButtonProps {
  articleId: string;
  initialCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export function LikeButton({
  articleId,
  initialCount,
  initialIsLiked,
  isLoggedIn,
  size = "md",
  showCount = true,
}: LikeButtonProps) {
  const [count, setCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    startTransition(async () => {
      // 楽観的UIアップデート
      const newIsLiked = !isLiked;
      setIsLiked(newIsLiked);
      setCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

      try {
        const formData = new FormData();
        formData.append("articleId", articleId);

        const result = await toggleArticleLike(formData);

        if (!result.success) {
          // エラー時はロールバック
          setIsLiked(!newIsLiked);
          setCount((prev) => (newIsLiked ? prev - 1 : prev + 1));

          if (result.requiresAuth) {
            setShowLoginModal(true);
          } else {
            console.error("Like toggle failed:", result.error);
          }
        }
      } catch (error) {
        // エラー時はロールバック
        setIsLiked(!newIsLiked);
        setCount((prev) => (newIsLiked ? prev - 1 : prev + 1));
        console.error("Like action failed:", error);
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
          isLiked
            ? "text-red-500 hover:text-red-600"
            : "text-gray-500 hover:text-red-500"
        }`}
      >
        <Heart
          className={`${iconSizeClasses[size]} ${
            isLiked ? "fill-current" : ""
          }`}
        />
        {showCount && (
          <span className="text-sm font-medium">{formatLikeCount(count)}</span>
        )}
      </Button>

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          title="いいねするにはログインが必要です"
          message="記事にいいねするには、アカウントが必要です。"
        />
      )}
    </>
  );
}
