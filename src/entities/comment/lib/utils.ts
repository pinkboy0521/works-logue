import type { CommentWithReplies, CommentTree } from "../model/types";

// Convert flat comment array to nested tree structure (max 2 levels)
export function buildCommentTree(
  comments: CommentWithReplies[],
  parentId: string | null = null,
  level: number = 0,
): CommentTree[] {
  const maxLevel = 2; // 2階層に制限

  if (level >= maxLevel) {
    return [];
  }

  return comments
    .filter((comment) => comment.parentId === parentId && !comment.isDeleted)
    .map((comment) => ({
      comment,
      replies: buildCommentTree(comments, comment.id, level + 1),
      level,
    }))
    .sort(
      (a, b) =>
        new Date(a.comment.createdAt).getTime() -
        new Date(b.comment.createdAt).getTime(),
    );
}

// Get total comment count including nested replies
export function getTotalCommentCount(trees: CommentTree[]): number {
  return trees.reduce((total, tree) => {
    return total + 1 + getTotalCommentCount(tree.replies);
  }, 0);
}

// Check if user can edit/delete comment
export function canEditComment(
  comment: CommentWithReplies,
  currentUserId: string | undefined,
  isAdmin: boolean = false,
): boolean {
  if (!currentUserId) return false;
  return comment.userId === currentUserId || isAdmin;
}

// Format relative time (client-safe)
export function formatRelativeTime(date: Date | string): string {
  // クライアントサイドでのみ相対時間を計算
  if (typeof window === "undefined") {
    // サーバーサイドでは日付をそのまま表示
    const commentDate = new Date(date);
    return commentDate.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  const now = new Date();
  const commentDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - commentDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) return "たった今";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}日前`;

  return commentDate.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
