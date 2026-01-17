export interface TagWithHierarchy {
  id: string;
  name: string;
  description: string;
  parentId: string | null;
  level: number;
  taxonomyType:
    | "INDUSTRY"
    | "JOB_CATEGORY"
    | "POSITION"
    | "SITUATION"
    | "SKILL_KNOWLEDGE";
  sortOrder: number;
  children?: TagWithHierarchy[];
}

export interface TagFilter {
  industryIds?: string[];
  jobCategoryIds?: string[];
  positionIds?: string[];
  situationIds?: string[];
  skillKnowledgeIds?: string[];
}

export interface ArticleSearchParams {
  query?: string;
  topicId?: string;
  tagFilter?: TagFilter;
  page?: number;
  limit?: number;
  sortBy?: "latest" | "popular" | "relevant";
}

export interface ArticleSearchResult {
  articles: ArticleWithTags[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ArticleWithTags {
  id: string;
  title: string;
  content: any;
  topImageUrl?: string;
  publishedAt: Date;
  viewCount: number;
  likeCount: number;
  user: {
    id: string;
    displayName: string;
    userId: string;
    image?: string;
  };
  topic?: {
    id: string;
    name: string;
  };
  tags: {
    tagId: string;
    tag: TagWithHierarchy;
  }[];
}
