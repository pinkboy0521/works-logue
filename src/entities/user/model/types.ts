import { User as PrismaUser, Article } from "@prisma/client";

// ベースのユーザータイプ
export type User = PrismaUser;

// ユーザー詳細（記事を含む）
export type UserWithArticles = User & {
  articles: Article[];
};

// ユーザー公開情報（プライベート情報を除外）
export type UserPublicInfo = Pick<User, "id" | "name" | "image" | "createdAt">;

// ユーザー統計情報
export interface UserStats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalLikes: number;
}

// ユーザー詳細情報（統計含む）
export type UserWithStats = UserPublicInfo & UserStats;
