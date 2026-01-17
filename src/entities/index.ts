// Article エンティティ
export {
  getArticleById,
  getArticleForEdit,
  updateArticle,
  createDraftArticle,
  deleteArticle,
  getLatestArticles,
  getPopularArticles,
  getPublishedArticles,
  incrementArticleViews,
  getRelatedArticles,
  getArticlesPaginated,
  calculateArticleMeta,
  calculateReadingTime,
  type Article,
  type ArticleContent,
  type ArticleWithDetails,
  type ArticleListItem,
  type ArticleMeta,
  type RelatedArticle,
  type DraftArticle,
  type PublishedArticle,
  type PublishedArticleListItem,
  type PaginationParams,
  type PaginationResult,
  type ArticlesWithPagination,
} from "./article";

// User エンティティ
export {
  getUserById,
  getUserWithArticles,
  getUserWithAllArticles,
  getUserStats,
  getPopularUsers,
  getActiveUsers,
  getUserProfile,
  updateUserProfile,
  checkProfileCompletion,
  getUserByUserId,
  getUserWithArticlesByUserId,
  getUserStatsByUserId,
  // UI コンポーネント
  AuthorCard,
  type User,
  type UserWithArticles,
  type UserPublicInfo,
  type UserStats,
  type UserWithStats,
  type UserWithProfile,
  type ProfileSetupData,
} from "./user";

// Topic エンティティ
export {
  getAllTopics,
  getTopicsWithCount,
  getPopularTopics,
  getTagsWithCount,
  getPopularTags,
  getTopicById,
  getTagById,
  type Topic,
  type Tag,
  type TopicWithCount,
  type TagWithCount,
} from "./topic";

// Skill エンティティ
export * from "./skill";
export type { Skill } from "@prisma/client";

// Occupation エンティティ
export * from "./occupation";
export type { Occupation } from "@prisma/client";
