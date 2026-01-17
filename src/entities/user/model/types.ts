import { User as PrismaUser, Article, Skill, Occupation } from "@prisma/client";

// ベースのユーザータイプ
export type User = PrismaUser;

// ユーザー詳細（記事を含む）
export type UserWithArticles = User & {
  articles: Article[];
};

// ユーザー公開情報（プライベート情報を除外）
export type UserPublicInfo = Pick<
  User,
  | "id"
  | "userId"
  | "image"
  | "createdAt"
  | "displayName"
  | "bio"
  | "website"
  | "location"
  | "statusMessage"
>;

// ユーザー統計情報
export interface UserStats {
  totalArticles: number;
  publishedArticles: number;
  totalViews: number;
  totalLikes: number;
}

// ユーザー詳細情報（統計含む）
export type UserWithStats = UserPublicInfo & UserStats;

// プロフィール完全版（スキル・職業含む）
export type UserWithProfile = User & {
  userSkills: Array<{
    skill: Skill;
  }>;
  userOccupations: Array<{
    occupation: Occupation;
  }>;
};

// メール認証リクエスト
export interface EmailVerificationRequest {
  email: string;
  token: string;
  expiresAt: Date;
}

// プロフィール設定データ
export interface ProfileSetupData {
  displayName: string;
  userId: string;
  bio?: string;
  website?: string;
  location?: string;
  statusMessage?: string;
  skillIds: string[];
  occupationIds: string[];
  imageUrl?: string;
}

// プロフィール完成度チェック
export interface ProfileCompletion {
  isCompleted: boolean;
  missingFields: string[];
}

/**
 * プロフィールが必須項目を満たしているかチェック
 */
export function isProfileCompleted(user: Partial<User>): ProfileCompletion {
  const requiredFields: (keyof User)[] = ["displayName", "userId"];
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    if (!user[field]) {
      missingFields.push(field);
    }
  }

  return {
    isCompleted: missingFields.length === 0,
    missingFields,
  };
}

/**
 * ユーザーが管理者かチェック
 */
export function isAdmin(user: Partial<User>): boolean {
  return user.role === "ADMIN";
}

/**
 * メール認証が必須の機能にアクセス可能かチェック
 */
export function canAccessEmailRequiredFeatures(user: Partial<User>): boolean {
  return Boolean(user.emailVerified);
}

/**
 * 記事投稿・編集が可能かチェック
 */
export function canWriteArticles(user: Partial<User>): boolean {
  return Boolean(user.emailVerified && user.displayName && user.userId);
}
