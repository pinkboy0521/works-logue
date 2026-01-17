import type { Comment } from "@prisma/client";

// Comment with User information
export interface CommentWithAuthor extends Comment {
  user: {
    id: string;
    displayName: string | null;
    userId: string | null;
    image: string | null;
  };
}

// Comment with nested replies
export interface CommentWithReplies extends CommentWithAuthor {
  replies: CommentWithReplies[];
}

// Comment creation data
export interface CreateCommentData {
  content: string;
  articleId: string;
  parentId?: string;
}

// Comment tree structure for rendering
export interface CommentTree {
  comment: CommentWithAuthor;
  replies: CommentTree[];
  level: number;
}

export type { Comment };
