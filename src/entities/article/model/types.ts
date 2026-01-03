import { Article as PrismaArticle, User, Topic, Tag } from "@prisma/client";

// ベースの記事タイプ
export type Article = PrismaArticle;

// 記事詳細（関連データを含む）
export type ArticleWithDetails = Article & {
  user: Pick<User, "id" | "name" | "image">;
  topic: Pick<Topic, "id" | "name" | "description">;
  tags: Array<{
    tag: Pick<Tag, "id" | "name">;
  }>;
};

// 記事一覧用（簡略版）
export type ArticleListItem = Article & {
  user: Pick<User, "id" | "name" | "image">;
  topic: Pick<Topic, "id" | "name">;
  tags: Array<{
    tag: Pick<Tag, "id" | "name">;
  }>;
};

// 記事統計情報
export interface ArticleStats {
  totalViews: number;
  totalLikes: number;
  totalComments?: number;
}

// 記事メタ情報
export interface ArticleMeta {
  readingTime: number; // 分単位
  wordCount: number;
}

// 関連記事
export type RelatedArticle = Pick<
  Article,
  "id" | "title" | "topImageUrl" | "publishedAt"
> & {
  user: Pick<User, "id" | "name" | "image">;
  topic: Pick<Topic, "id" | "name">;
};
