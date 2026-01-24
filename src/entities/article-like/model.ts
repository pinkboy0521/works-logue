import { z } from "zod";
import type { ArticleLike } from "@prisma/client";

// 基本的な型定義
export type { ArticleLike } from "@prisma/client";

// いいね作成のバリデーションスキーマ
export const createArticleLikeSchema = z.object({
  articleId: z.string().min(1, "記事IDが必要です"),
});

export type CreateArticleLikeData = z.infer<typeof createArticleLikeSchema>;

// いいね削除のバリデーションスキーマ
export const deleteArticleLikeSchema = z.object({
  articleId: z.string().min(1, "記事IDが必要です"),
});

export type DeleteArticleLikeData = z.infer<typeof deleteArticleLikeSchema>;

// いいね統計情報の型
export type ArticleLikeStats = {
  count: number;
  isLikedByUser: boolean;
};

// いいねリスト取得用の型
export type ArticleLikeWithRelations = ArticleLike & {
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
