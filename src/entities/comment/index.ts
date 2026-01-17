// Comment Entity Public API
export type {
  Comment,
  CommentWithAuthor,
  CommentWithReplies,
  CreateCommentData,
  CommentTree,
} from "./model";

export {
  createCommentSchema,
  deleteCommentSchema,
  type CreateCommentForm,
  type DeleteCommentForm,
  buildCommentTree,
  getTotalCommentCount,
  canEditComment,
  formatRelativeTime,
} from "./lib";

export {
  getCommentsByArticleId,
  getCommentCount,
  createComment,
  deleteComment,
} from "./api";

export { CommentCard, CommentForm, RelativeTime } from "./ui";
