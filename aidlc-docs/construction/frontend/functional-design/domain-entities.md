# Domain Entities — Unit 2: frontend

> Backend の domain-entities.md をベースに、TypeScript 型定義として再定義する。
> 追加フィールドは UI 専用の派生プロパティ（computed / display 用）のみ。

---

## 列挙型（TypeScript Enum / Union）

```typescript
// Seed の 8 タイプ
type SeedType =
  | 'query'       // 疑問
  | 'pain'        // 悩み
  | 'failure'     // 失敗
  | 'hypothesis'  // 仮説
  | 'comparison'  // 比較
  | 'observation' // 違和感
  | 'knowledge'   // シェア
  | 'practice'    // 実践報告

// 6段階成長ステージ
type GrowthStage =
  | 'seed'       // 初期（投稿直後）
  | 'sprout'     // 発芽
  | 'growth'     // 成長中
  | 'near_bloom' // 開花間近
  | 'flowering'  // 開花中（AI生成中）
  | 'bloomed'    // 開花済み

type SeedStatus = 'active' | 'blooming' | 'archived'
type LougeStatus = 'generating' | 'published' | 'archived'
type NotificationType = 'new_log' | 'louge_bloomed' | 'bloom_near'
type ReactionType = 'insight' | 'agree' | 'helpful'
type BadgeType = 'bloom_contributor'
```

---

## エンティティ型定義

### User

```typescript
interface User {
  id: string              // UUID
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  total_score: number
  created_at: string      // ISO 8601
  updated_at: string
}
```

---

### Tag / TaxonomyType

```typescript
interface TaxonomyType {
  id: string
  code: 'seed_topic' | 'industry' | 'role'
  display_name: string
}

interface Tag {
  id: string
  name: string
  taxonomy_type_id: string
  parent_id: string | null
  level: 1 | 2 | 3
  sort_order: number
  // 派生（ツリー構築用）
  children?: Tag[]
}
```

---

### Seed

```typescript
interface Seed {
  id: string
  user_id: string
  type: SeedType
  title: string
  content: string
  stage: GrowthStage
  status: SeedStatus
  structural_completeness: number  // 0.0〜1.0
  quality_score: number | null
  parent_louge_id: string | null
  created_at: string
  updated_at: string
  // API レスポンス埋め込みフィールド（JOIN済み）
  author?: User
  tags?: Tag[]
  log_count?: number
}

// SeedFormPage 用の入力状態型
interface SeedFormInput {
  type: SeedType | null   // Step 1 で選択
  title: string           // Step 2: 共通フィールド
  content: string         // Step 2: 共通フィールド
  tag_ids: string[]       // Step 3: タグ付け（制限なし）
  // AI 知恵洗浄状態（インライン表示用）
  cleanse_suggestions: CleanseSuggestion[]
  cleanse_loading: boolean
}

interface CleanseSuggestion {
  original: string        // 元の固有名詞
  suggestion: string      // 抽象化候補
  accepted: boolean       // ユーザー承認フラグ
}
```

---

### Log

```typescript
interface Log {
  id: string
  seed_id: string
  user_id: string
  parent_log_id: string | null
  content: string
  is_ai_facilitation: boolean
  facilitation_type: string | null
  created_at: string
  // 埋め込みフィールド
  author?: User
  reactions?: LogReactionSummary
  replies?: Log[]
}

interface LogReactionSummary {
  insight: number
  agree: number
  helpful: number
  my_reactions: ReactionType[]  // 自分がつけたリアクション
}
```

---

### Louge

```typescript
interface Louge {
  id: string
  seed_id: string
  pattern_name: string
  title: string
  content: string
  pattern_context: string
  pattern_problem: string
  pattern_solution: string
  status: LougeStatus
  quality_score: number
  fork_count: number
  created_at: string
  published_at: string | null
  // 埋め込みフィールド
  contributors?: LougeContributor[]
  fork_seeds?: Seed[]
  source_seed?: Pick<Seed, 'id' | 'title' | 'type'>
}

interface LougeContributor {
  user_id: string
  role: 'seed_author' | 'log_contributor'
  contribution_score: number
  log_count: number
  user?: User
}
```

---

### Notification

```typescript
interface Notification {
  id: string
  user_id: string
  type: NotificationType
  reference_id: string
  message: string
  is_read: boolean
  created_at: string
}
```

---

### Profile（ProfilePage 用）

```typescript
interface UserProfile extends User {
  industry_tags: Tag[]
  role_tags: Tag[]
  badges: Badge[]
  score_summary?: ScoreSummary
}

interface Badge {
  id: string
  badge_type: BadgeType
  reference_id: string | null
  awarded_at: string
  // 表示用
  louge?: Pick<Louge, 'id' | 'pattern_name'>
}

interface ScoreSummary {
  total_score: number
  breakdown: {
    seed_post: number
    log_post: number
    reaction_received: number
    louge_bloom: number
  }
}
```

---

## Realtime イベント型

```typescript
// Supabase Realtime から受け取るペイロード
interface SeedStageChangedEvent {
  event: 'UPDATE'
  table: 'seeds'
  new: Pick<Seed, 'id' | 'stage' | 'status' | 'structural_completeness'>
  old: Pick<Seed, 'id' | 'stage' | 'status' | 'structural_completeness'>
}

interface NotificationInsertedEvent {
  event: 'INSERT'
  table: 'notifications'
  new: Notification
}

interface LougePublishedEvent {
  event: 'UPDATE'
  table: 'louges'
  new: Pick<Louge, 'id' | 'status' | 'published_at' | 'seed_id'>
  old: Pick<Louge, 'id' | 'status'>
}
```

---

## ページネーション共通型

```typescript
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

// 無限スクロール用カーソル（React Query useInfiniteQuery）
interface InfiniteQueryPage<T> {
  items: T[]
  next_page: number | null  // null = 最終ページ
}
```
