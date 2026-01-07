import { z } from "zod";

// BlockNoteコンテンツバリデーション用のスキーマ
const blockNoteContentSchema = z
  .array(z.unknown()) // BlockNote形式はJSONなので詳細スキーマを緩く定義
  .optional()
  .refine(
    (blocks) => {
      if (!blocks || blocks.length === 0) return false;

      // 空のparagraphブロックだけでないかチェック
      const hasContent = blocks.some((block: unknown) => {
        // blockの型安全性を確保
        if (typeof block !== "object" || block === null) return false;
        const typedBlock = block as {
          type?: string;
          content?: { text?: string }[];
        };

        if (
          typedBlock?.type === "paragraph" &&
          Array.isArray(typedBlock?.content)
        ) {
          return typedBlock.content.some(
            (content) => content?.text && content.text.trim().length > 0,
          );
        }
        // 他のブロック型（見出し、リストなど）は常に有効コンテンツとみなす
        return typedBlock?.type !== "paragraph";
      });

      return hasContent;
    },
    { message: "記事の内容を入力してください" },
  );

// 下書き保存用バリデーションスキーマ
export const draftArticleSchema = z.object({
  title: z.string().optional(),
  content: z.array(z.unknown()).optional(), // 下書きでは空でもOK
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
  content: blockNoteContentSchema, // BlockNote形式のバリデーション
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
