// ============================================================
// Enum types (const assertion)
// ============================================================

export const SeedType = {
  QUERY: "query",
  PAIN: "pain",
  FAILURE: "failure",
  HYPOTHESIS: "hypothesis",
  COMPARISON: "comparison",
  OBSERVATION: "observation",
  KNOWLEDGE: "knowledge",
  PRACTICE: "practice",
} as const;
export type SeedType = (typeof SeedType)[keyof typeof SeedType];

export const GrowthStage = {
  SEED: "seed",
  SPROUT: "sprout",
  GROWTH: "growth",
  NEAR_BLOOM: "near_bloom",
  FLOWERING: "flowering",
  BLOOMED: "bloomed",
} as const;
export type GrowthStage = (typeof GrowthStage)[keyof typeof GrowthStage];

export const SeedStatus = {
  ACTIVE: "active",
  BLOOMING: "blooming",
  ARCHIVED: "archived",
} as const;
export type SeedStatus = (typeof SeedStatus)[keyof typeof SeedStatus];

export const LougeStatus = {
  GENERATING: "generating",
  PUBLISHED: "published",
  ARCHIVED: "archived",
} as const;
export type LougeStatus = (typeof LougeStatus)[keyof typeof LougeStatus];

export const NotificationType = {
  NEW_LOG: "new_log",
  LOUGE_BLOOMED: "louge_bloomed",
  BLOOM_NEAR: "bloom_near",
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];

export const ReactionType = {
  INSIGHT: "insight",
  AGREE: "agree",
  HELPFUL: "helpful",
} as const;
export type ReactionType = (typeof ReactionType)[keyof typeof ReactionType];

export const BadgeType = {
  BLOOM_CONTRIBUTOR: "bloom_contributor",
} as const;
export type BadgeType = (typeof BadgeType)[keyof typeof BadgeType];

export const FacilitationType = {
  NEED_COUNTERARGUMENT: "need_counterargument",
  NEED_SPECIFICITY: "need_specificity",
  NEED_COMPREHENSIVENESS: "need_comprehensiveness",
  NEED_DIVERSITY: "need_diversity",
} as const;
export type FacilitationType =
  (typeof FacilitationType)[keyof typeof FacilitationType];

// ============================================================
// Base entity types
// ============================================================

export type User = {
  id: string; // UUID
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  total_score: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
};

export type TaxonomyType = {
  id: string; // UUID
  code: string; // "seed_topic" | "industry" | "role"
  display_name: string;
  description: string | null;
  sort_order: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
};

export type Tag = {
  id: string; // UUID
  name: string;
  description: string | null;
  taxonomy_type_id: string; // UUID
  parent_id: string | null; // UUID
  level: number;
  sort_order: number;
  children?: Tag[];
};

export type Seed = {
  id: string; // UUID
  user_id: string; // UUID
  type: SeedType;
  title: string; // 1-200 chars
  content: string; // 1-2000 chars
  stage: GrowthStage;
  status: SeedStatus;
  structural_completeness: number; // 0.0-1.0
  quality_score: number | null;
  pattern_analysis: PatternAnalysis | null;
  parent_louge_id: string | null; // UUID
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
};

export type PatternAnalysis = {
  context_score: number;
  problem_score: number;
  solution_score: number;
  nameable_score: number;
  evaluated_at: string; // ISO 8601
};

export type LogReactionSummary = {
  insight: number;
  agree: number;
  helpful: number;
};

export type Log = {
  id: string; // UUID
  seed_id: string; // UUID
  user_id: string; // UUID
  parent_log_id: string | null; // UUID
  content: string; // 1-1000 chars
  is_ai_facilitation: boolean;
  facilitation_type: FacilitationType | null;
  created_at: string; // ISO 8601
  reaction_summary?: LogReactionSummary;
};

export type Louge = {
  id: string; // UUID
  seed_id: string; // UUID
  pattern_name: string;
  title: string; // 1-300 chars
  content: string;
  pattern_context: string;
  pattern_problem: string;
  pattern_solution: string;
  status: LougeStatus;
  quality_score: number;
  fork_count: number;
  created_at: string; // ISO 8601
  published_at: string | null; // ISO 8601
};

export type Notification = {
  id: string; // UUID
  user_id: string; // UUID
  type: NotificationType;
  reference_id: string; // UUID
  message: string; // 1-200 chars
  is_read: boolean;
  created_at: string; // ISO 8601
};

export type Badge = {
  id: string; // UUID
  user_id: string; // UUID
  badge_type: BadgeType;
  reference_id: string | null; // UUID
  awarded_at: string; // ISO 8601
};

// ============================================================
// Extended entity types (with embedded fields)
// ============================================================

export type SeedWithDetails = Seed & {
  author?: User;
  tags?: Tag[];
  logs?: Log[];
};

export type LougeWithDetails = Louge & {
  seed?: Seed;
  author?: User;
};

export type UserProfile = User & {
  industry_tags?: Tag[];
  role_tags?: Tag[];
  badges?: Badge[];
  seed_count?: number;
  louge_count?: number;
};

// ============================================================
// Form input types
// ============================================================

export type SeedFormInput = {
  type: SeedType; // required
  title: string; // 1-200 chars
  content: string; // 1-2000 chars
  tags?: string[]; // tag IDs (UUID)
};

export type LogFormInput = {
  content: string; // 1-1000 chars
  seed_id: string; // UUID
  parent_log_id?: string; // UUID
};

export type ProfileUpdateInput = {
  display_name?: string; // 1-100 chars
  bio?: string; // max 500 chars
  avatar_url?: string;
};

// ============================================================
// API common types
// ============================================================

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  has_next: boolean;
};

export type InfiniteQueryPage<T> = {
  items: T[];
  nextCursor?: string;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

// ============================================================
// Realtime event types
// ============================================================

export type SeedStageChangedEvent = {
  seed_id: string; // UUID
  old_stage: GrowthStage;
  new_stage: GrowthStage;
  changed_at: string; // ISO 8601
};

export type NotificationInsertedEvent = {
  notification: Notification;
};

export type LougePublishedEvent = {
  louge_id: string; // UUID
  seed_id: string; // UUID
  published_at: string; // ISO 8601
};

// ============================================================
// AI cleanse suggestion type
// ============================================================

export type CleanseSuggestion = {
  original: string;
  suggestion: string;
  accepted: boolean;
};
