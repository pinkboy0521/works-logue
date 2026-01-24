import { z } from "zod";
import type { ArticleBookmark } from "@prisma/client";

// 基本的な型定義
export type { ArticleBookmark } from "@prisma/client";

// ブックマーク作成のバリデーションスキーマ
export const createArticleBookmarkSchema = z.object({
  articleId: z.string().min(1, "記事IDが必要です"),
});

export type CreateArticleBookmarkData = z.infer<
  typeof createArticleBookmarkSchema
>;

// ブックマーク削除のバリデーションスキーマ
export const deleteArticleBookmarkSchema = z.object({
  articleId: z.string().min(1, "記事IDが必要です"),
});

export type DeleteArticleBookmarkData = z.infer<
  typeof deleteArticleBookmarkSchema
>;

// ブックマーク統計情報の型
export type ArticleBookmarkStats = {
  count: number;
  isBookmarkedByUser: boolean;
};

// ブックマークリスト取得用の型
export type ArticleBookmarkWithRelations = ArticleBookmark & {
  article: {
    id: string;
    title: string;
    topImageUrl: string | null;
    createdAt: Date;
    user: {
      displayName: string | null;
      userId: string | null;
    };
  };
};
