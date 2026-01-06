import { Article as PrismaArticle, User, Topic, Tag } from "@prisma/client";

// ベースの記事タイプ
export type Article = PrismaArticle;

// 下書き記事（topic, tags は任意）
export type DraftArticle = Article & {
  user: Pick<User, "id" | "displayName" | "image">;
  topic: Pick<Topic, "id" | "name" | "description"> | null;
  tags: Array<{
    tag: Pick<Tag, "id" | "name">;
  }>;
};

// 公開記事（topic, tags は必須）
export type PublishedArticle = Article & {
  user: Pick<User, "id" | "displayName" | "image">;
  topic: Pick<Topic, "id" | "name" | "description">;
  tags: Array<{
    tag: Pick<Tag, "id" | "name">;
  }>;
};

// 記事詳細（関連データを含む）- 状態に応じて型が決まる
export type ArticleWithDetails = DraftArticle | PublishedArticle;

// 記事一覧用（公開記事のみ）
export type ArticleListItem = PublishedArticle & {
  topic: Pick<Topic, "id" | "name">; // 公開記事なので必須
  tags: Array<{
    tag: Pick<Tag, "id" | "name">;
  }>;
};

// Prismaクエリ結果に対応する型（内部用）
export type PublishedArticleListItem = {
  id: string;
  title: string;
  content: string | null;
  topImageUrl: string | null;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number;
  user: {
    id: string;
    displayName: string | null;
    image: string | null;
  };
  topic: {
    id: string;
    name: string;
  };
  tags: Array<{
    tag: {
      id: string;
      name: string;
    };
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

// 関連記事（公開記事のみなのでtopicは必須）
export type RelatedArticle = Pick<
  Article,
  "id" | "title" | "topImageUrl" | "publishedAt"
> & {
  user: Pick<User, "id" | "displayName" | "image">;
  topic: Pick<Topic, "id" | "name">;
};
