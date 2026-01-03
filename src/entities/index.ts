// Article エンティティ
export {
  getArticleById,
  getLatestArticles,
  getPopularArticles,
  getPublishedArticles,
  incrementArticleViews,
  getRelatedArticles,
  calculateArticleMeta,
  calculateReadingTime,
  type ArticleWithDetails,
  type ArticleListItem,
  type ArticleMeta,
  type RelatedArticle,
} from "./article";

// User エンティティ
export {
  getUserById,
  getUserWithArticles,
  getUserStats,
  getPopularUsers,
  getActiveUsers,
  type User,
  type UserWithArticles,
  type UserPublicInfo,
  type UserStats,
  type UserWithStats,
} from "./user";

// Topic エンティティ
export {
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
