"use client";

import { LikeButton } from "./LikeButton";
import { BookmarkButton } from "./BookmarkButton";

interface ArticleReactionsProps {
  articleId: string;
  likeCount: number;
  bookmarkCount: number;
  isLikedByUser: boolean;
  isBookmarkedByUser: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  showCounts?: boolean;
}

export function ArticleReactions({
  articleId,
  likeCount,
  bookmarkCount,
  isLikedByUser,
  isBookmarkedByUser,
  isLoggedIn,
  size = "md",
  layout = "horizontal",
  showCounts = true,
}: ArticleReactionsProps) {
  const layoutClasses = {
    horizontal: "flex items-center gap-2",
    vertical: "flex flex-col gap-2",
  };

  return (
    <div className={`${layoutClasses[layout]}`}>
      <LikeButton
        articleId={articleId}
        initialCount={likeCount}
        initialIsLiked={isLikedByUser}
        isLoggedIn={isLoggedIn}
        size={size}
        showCount={showCounts}
      />

      <BookmarkButton
        articleId={articleId}
        initialCount={bookmarkCount}
        initialIsBookmarked={isBookmarkedByUser}
        isLoggedIn={isLoggedIn}
        size={size}
        showCount={showCounts}
      />
    </div>
  );
}
