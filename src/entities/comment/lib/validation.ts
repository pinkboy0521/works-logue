import { z } from "zod";

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, "コメントを入力してください")
    .max(2000, "コメントは2000文字以内で入力してください")
    .trim(),
  articleId: z.string().min(1, "記事IDが必要です"),
  parentId: z.string().optional(),
});

export const deleteCommentSchema = z.object({
  commentId: z.string().min(1, "コメントIDが必要です"),
});

export type CreateCommentForm = z.infer<typeof createCommentSchema>;
export type DeleteCommentForm = z.infer<typeof deleteCommentSchema>;
