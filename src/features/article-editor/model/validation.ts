import { z } from "zod";

// 下書き保存用バリデーションスキーマ
export const draftArticleSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  topicId: z.string().min(1, "トピックを選択してください"),
  status: z.enum(["DRAFT", "PUBLISHED", "PRIVATE"]),
});

// 記事公開用バリデーションスキーマ
export const publishArticleSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .refine((val) => val.trim().length > 0, {
      message: "タイトルを入力してください",
    }),
  content: z
    .string()
    .min(1, "記事の内容を入力してください")
    .refine((val) => val.trim().length > 0, {
      message: "記事の内容を入力してください",
    }),
  topicId: z.string().min(1, "トピックを選択してください"),
  status: z.enum(["DRAFT", "PUBLISHED", "PRIVATE"]),
});

// バリデーション結果の型
export type ValidationErrors = Record<string, string>;

// バリデーションヘルパー関数
export const validateDraftArticle = (data: unknown) => {
  return draftArticleSchema.safeParse(data);
};

export const validatePublishArticle = (data: unknown) => {
  return publishArticleSchema.safeParse(data);
};

// エラーメッセージ抽出ヘルパー
export const extractValidationErrors = (result: {
  success: boolean;
  error?: z.ZodError;
}): ValidationErrors => {
  if (result.success || !result.error) return {};

  const fieldErrors: ValidationErrors = {};
  result.error.issues?.forEach((issue) => {
    const path = issue.path[0] as string;
    fieldErrors[path] = issue.message;
  });

  return fieldErrors;
};
