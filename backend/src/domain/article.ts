// backend/src/domain/article.ts

export interface Article {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  author_id: string;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export type ArticleStatus = "draft" | "published";

export interface CreateArticleInput {
  title: string;
  content?: string;
  author_id: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
}

export interface ArticleResponse {
  id: string;
  title: string;
  content: string;
  status: ArticleStatus;
  author_id: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateArticleRequest {
  title: string;
  content?: string;
}

export interface UpdateArticleRequest {
  title?: string;
  content?: string;
}
