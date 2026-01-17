"use client";

import { CommentCard } from "@/entities";
import type { CommentTree } from "@/entities";
import { useCommentState } from "../model";

interface CommentThreadProps {
  commentTree: CommentTree;
  currentUserId?: string;
  isAdmin?: boolean;
  onReplySuccess?: () => void;
  onOptimisticDelete?: (commentId: string) => void;
  onOptimisticAdd?: (content: string, parentId?: string) => void;
}

export function CommentThread({
  commentTree,
  currentUserId,
  isAdmin = false,
  onReplySuccess,
  onOptimisticDelete,
  onOptimisticAdd,
}: CommentThreadProps) {
  const { state, dispatch } = useCommentState();

  const handleReplyToggle = (commentId: string) => {
    if (state.replyingTo === commentId) {
      dispatch({ type: "SET_REPLYING_TO", commentId: null });
    } else {
      dispatch({ type: "SET_REPLYING_TO", commentId });
    }
  };

  const handleReplySuccess = () => {
    dispatch({ type: "SET_REPLYING_TO", commentId: null });
    onReplySuccess?.();
  };

  return (
    <div className="space-y-4">
      <CommentCard
        comment={commentTree.comment}
        isAdmin={isAdmin}
        level={commentTree.level}
        showReplyForm={state.replyingTo === commentTree.comment.id}
        onReplyToggle={handleReplyToggle}
        onReplySuccess={handleReplySuccess}
        onOptimisticDelete={onOptimisticDelete}
        onOptimisticAdd={onOptimisticAdd}
      />

      {/* Render nested replies */}
      {commentTree.replies.length > 0 && (
        <div className="space-y-3">
          {commentTree.replies.map((replyTree) => (
            <CommentThread
              key={replyTree.comment.id}
              commentTree={replyTree}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              onReplySuccess={onReplySuccess}
              onOptimisticDelete={onOptimisticDelete}
              onOptimisticAdd={onOptimisticAdd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
