"use client";

import { useState, useOptimistic } from "react";
import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared";
import {
  CommentForm,
  buildCommentTree,
  getTotalCommentCount,
  type CommentWithReplies,
} from "@/entities";
import { CommentProvider } from "../model";
import { CommentThread } from "./CommentThread";
import { LoginPrompt } from "./LoginPrompt";

interface CommentSectionProps {
  articleId: string;
  initialComments: CommentWithReplies[];
  initialCount: number;
  currentUserId?: string;
  isAdmin?: boolean;
}

type CommentAction =
  | { type: "add"; comment: CommentWithReplies }
  | { type: "delete"; commentId: string };

export function CommentSection({
  articleId,
  initialComments,
  currentUserId,
  isAdmin = false,
}: CommentSectionProps) {
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [optimisticComments, updateOptimisticComments] = useOptimistic(
    initialComments,
    (
      state: CommentWithReplies[],
      action: CommentAction,
    ): CommentWithReplies[] => {
      switch (action.type) {
        case "add":
          return [...state, action.comment];
        case "delete":
          return state.map((comment) =>
            comment.id === action.commentId
              ? { ...comment, isDeleted: true }
              : comment,
          );
        default:
          return state;
      }
    },
  );

  // Build comment tree structure
  const commentTrees = buildCommentTree(optimisticComments);
  const actualCommentCount = getTotalCommentCount(commentTrees);

  const handleCommentSuccess = () => {
    // Page will be revalidated by server action
    window.location.reload();
  };

  const handleOptimisticDelete = (commentId: string) => {
    updateOptimisticComments({ type: "delete", commentId });
  };

  const handleOptimisticAdd = (content: string, parentId?: string) => {
    // This function will be called from within a transition in CommentForm
    if (!currentUserId) return;

    // Generate a stable temporary ID using current timestamp as string
    const tempId = `temp-${currentUserId}-${content.substring(0, 10).replace(/\s/g, "")}-${parentId || "root"}`;

    // Generate a temporary comment for optimistic update
    const tempComment: CommentWithReplies = {
      id: tempId,
      content,
      articleId,
      userId: currentUserId,
      parentId: parentId || null,
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      createdAt: new Date(), // Use Date object for type consistency
      updatedAt: new Date(),
      user: {
        id: currentUserId,
        displayName: "あなた", // Will be updated after server response
        userId: null,
        image: null,
      },
      replies: [],
    };

    updateOptimisticComments({ type: "add", comment: tempComment });
  };

  return (
    <CommentProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            コメント ({actualCommentCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Comment Form */}
          <div className="space-y-4">
            {currentUserId ? (
              <CommentForm
                articleId={articleId}
                placeholder="この記事についてコメントしてみませんか？"
                onSuccess={handleCommentSuccess}
                onOptimisticAdd={handleOptimisticAdd}
              />
            ) : (
              <div
                className="p-4 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                onClick={() => setShowLoginPrompt(true)}
              >
                <p className="text-center text-muted-foreground">
                  <strong>コメントを投稿するにはログインが必要です</strong>
                </p>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  クリックしてログイン・新規登録を行ってください
                </p>
              </div>
            )}
          </div>

          {/* Comments List */}
          {commentTrees.length > 0 ? (
            <div className="space-y-4">
              {commentTrees.map((tree) => (
                <CommentThread
                  key={tree.comment.id}
                  commentTree={tree}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  onReplySuccess={handleCommentSuccess}
                  onOptimisticDelete={handleOptimisticDelete}
                  onOptimisticAdd={handleOptimisticAdd}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              まだコメントはありません。最初のコメントを投稿してみませんか？
            </div>
          )}
        </CardContent>
      </Card>

      {/* Login Prompt Modal */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
      />
    </CommentProvider>
  );
}
