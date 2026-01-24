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
  searchArticles,
  calculateArticleMeta,
  calculateReadingTime,
  type Article,
  type ArticleContent,
  type CustomPartialBlock,
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
  type ArticleSearchParams,
  type ArticleSearchResult,
  type TagFilter,
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

// Tag エンティティ
export { getTagsWithHierarchy } from "./tag";

// Comment エンティティ
export {
  getCommentsByArticleId,
  getCommentCount,
  createComment,
  deleteComment,
  createCommentSchema,
  deleteCommentSchema,
  buildCommentTree,
  getTotalCommentCount,
  canEditComment,
  formatRelativeTime,
  CommentCard,
  CommentForm,
  type Comment,
  type CommentWithAuthor,
  type CommentWithReplies,
  type CreateCommentData,
  type CommentTree,
  type CreateCommentForm,
  type DeleteCommentForm,
} from "./comment";

// Article Like エンティティ
export {
  getArticleLikeCount,
  isArticleLikedByUser,
  createArticleLike,
  deleteArticleLike,
  getUserArticleLikes,
  getUserArticleLikeCount,
  getArticleLikeStats,
  isLikeOperationValid,
  formatLikeCount,
  createArticleLikeSchema,
  deleteArticleLikeSchema,
  type ArticleLike,
  type CreateArticleLikeData,
  type DeleteArticleLikeData,
  type ArticleLikeStats,
  type ArticleLikeWithRelations,
} from "./article-like";

// Article Bookmark エンティティ
export {
  getArticleBookmarkCount,
  isArticleBookmarkedByUser,
  createArticleBookmark,
  deleteArticleBookmark,
  getUserArticleBookmarks,
  getUserArticleBookmarkCount,
  getArticleBookmarkStats,
  isBookmarkOperationValid,
  formatBookmarkCount,
  createArticleBookmarkSchema,
  deleteArticleBookmarkSchema,
  type ArticleBookmark,
  type CreateArticleBookmarkData,
  type DeleteArticleBookmarkData,
  type ArticleBookmarkStats,
  type ArticleBookmarkWithRelations,
} from "./article-bookmark";
