"use client";

import { useState, useTransition } from "react";
import { MessageCircle, Trash2 } from "lucide-react";
import { Button, Card, CardContent } from "@/shared";
import { AuthorCard } from "@/entities";
import { deleteComment } from "../api";
import { CommentForm } from "./CommentForm";
import { RelativeTime } from "./RelativeTime";
import type { CommentWithAuthor } from "../model/types";

interface CommentCardProps {
  comment: CommentWithAuthor;
  currentUserId?: string;
  isAdmin?: boolean;
  level?: number;
  showReplyForm?: boolean;
  onReplyToggle?: (commentId: string) => void;
  onReplySuccess?: () => void;
  onOptimisticDelete?: (commentId: string) => void;
  onOptimisticAdd?: (content: string, parentId?: string) => void;
}

export function CommentCard({
  comment,
  isAdmin = false,
  level = 0,
  showReplyForm = false,
  onReplyToggle,
  onReplySuccess,
  onOptimisticDelete,
  onOptimisticAdd,
}: CommentCardProps) {
  const [isPendingDelete, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const isDeleted = comment.isDeleted;
  const maxLevel = 2; // 2階層に変更
  const showReplyButton = level < maxLevel - 1; // 1階層目のみ返信可能

  const handleDelete = () => {
    if (!confirm("このコメントを削除しますか？")) {
      return;
    }

    setDeleteError(null);

    startDeleteTransition(async () => {
      try {
        // Optimistic update - startTransition内で実行
        onOptimisticDelete?.(comment.id);

        const result = await deleteComment(comment.id);

        if (!result.success) {
          setDeleteError(result.error || "削除に失敗しました");
          // エラーの場合はページをリロードして元に戻す
          window.location.reload();
        }
      } catch {
        setDeleteError("削除に失敗しました");
        // エラーの場合はページをリロードして元に戻す
        window.location.reload();
      }
    });
  };

  const handleReplyToggle = () => {
    onReplyToggle?.(comment.id);
  };

  if (isDeleted) {
    return (
      <Card
        className={`border-l-4 border-muted bg-muted/30 ${level > 0 ? "ml-4" : ""}`}
      >
        <CardContent className="py-3">
          <div className="text-sm text-muted-foreground italic">
            このコメントは削除されました。
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={level > 0 ? "ml-4" : ""}>
      <Card className={level > 0 ? "border-l-4 border-muted" : ""}>
        <CardContent className="py-4">
          {/* Comment Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AuthorCard
                user={{
                  id: comment.user.id,
                  displayName: comment.user.displayName,
                  userId: comment.user.userId,
                  image: comment.user.image,
                }}
                size="small"
                showDisplayName={true}
                clickable={true}
              />
              <RelativeTime
                date={comment.createdAt}
                className="text-xs text-muted-foreground"
              />
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isPendingDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Comment Content */}
          <div className="mt-3 text-sm whitespace-pre-wrap">
            {comment.content}
          </div>

          {/* Error Display */}
          {deleteError && (
            <div className="mt-2 text-xs text-destructive">{deleteError}</div>
          )}

          {/* Comment Actions */}
          <div className="mt-3 flex items-center gap-4">
            {showReplyButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReplyToggle}
                className="p-0 h-auto font-normal text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                返信
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-4">
              <CommentForm
                articleId={comment.articleId}
                parentId={comment.id}
                placeholder={`${comment.user.displayName || "ユーザー"}さんに返信...`}
                onSuccess={() => {
                  onReplySuccess?.();
                  onReplyToggle?.(comment.id);
                }}
                onCancel={() => onReplyToggle?.(comment.id)}
                onOptimisticAdd={onOptimisticAdd}
                compact
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
