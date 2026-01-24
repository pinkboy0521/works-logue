import { Article as PrismaArticle, User, Topic, Tag } from "@prisma/client";
import { PartialBlock } from "@blocknote/core";

// ベースの記事タイプ
export type Article = PrismaArticle;

// BlockNoteの標準タイプを拡張してdividerを追加
export type CustomPartialBlock =
  | PartialBlock
  | {
      id: string;
      type: "divider";
      props: Record<string, never>;
      content: never[];
      children: never[];
    };

// BlockNoteコンテンツ型（保存・復元用）
export type ArticleContent = CustomPartialBlock[];

// 下書き記事（topic, tags は任意）
export type DraftArticle = Omit<Article, "content"> & {
  content: ArticleContent;
  user: Pick<User, "id" | "displayName" | "image" | "userId">;
  topic: Pick<Topic, "id" | "name" | "description"> | null;
  tags: Array<{
    tag: Pick<Tag, "id" | "name">;
  }>;
};

// 公開記事（topic, tags は必須）
export type PublishedArticle = Omit<Article, "content"> & {
  content: ArticleContent;
  user: Pick<User, "id" | "displayName" | "image" | "userId">;
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
  content: ArticleContent; // BlockNote JSONのみ
  topImageUrl: string | null;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number; // ブックマーク数を追加
  user: {
    id: string;
    displayName: string | null;
    image: string | null;
    userId: string | null;
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

// ページネーション関連の型
export interface PaginationParams {
  page?: number;
  limit?: number;
  userId?: string;
  topicId?: string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ArticlesWithPagination {
  articles: PublishedArticleListItem[];
  pagination: PaginationResult;
}

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
  user: Pick<User, "id" | "displayName" | "image" | "userId">;
  topic: Pick<Topic, "id" | "name">;
};

// 検索関連の型
export interface ArticleSearchParams {
  query?: string; // 検索クエリ
  topicId?: string; // トピックフィルタ
  tagIds?: string[]; // タグフィルタ
  page?: number;
  limit?: number;
}

export interface ArticleSearchResult {
  articles: PublishedArticleListItem[];
  pagination: PaginationResult;
  searchInfo: {
    query?: string;
    topicId?: string;
    tagIds?: string[];
    totalFound: number;
  };
}

export interface TagFilter {
  id: string;
  name: string;
  level: number;
  taxonomyType: string;
}
