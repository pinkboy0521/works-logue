# Handoff: Step 2 共通型定義

## 変更ファイル
- `frontend/src/types/index.ts`（新規作成）

## 変更内容
`frontend/src/types/index.ts` を新規作成し、フロントエンドで使用する全共通型を定義した。
ソースは `aidlc-docs/construction/backend/functional-design/domain-entities.md` および `backend/app/models/` 配下の Pydantic モデル群に準拠。

## 型一覧

### 列挙型（const assertion）
- `SeedType` — 8種類: query / pain / failure / hypothesis / comparison / observation / knowledge / practice
- `GrowthStage` — 6段階: seed / sprout / growth / near_bloom / flowering / bloomed
- `SeedStatus` — 3種類: active / blooming / archived
- `LougeStatus` — 3種類: generating / published / archived
- `NotificationType` — 3種類: new_log / louge_bloomed / bloom_near
- `ReactionType` — 3種類: insight / agree / helpful
- `BadgeType` — 1種類: bloom_contributor
- `FacilitationType` — 4種類: need_counterargument / need_specificity / need_comprehensiveness / need_diversity

### 基本エンティティ型
- `User` — id(UUID文字列), username, display_name, avatar_url?, bio?, total_score, created_at, updated_at
- `TaxonomyType` — id, code, display_name, description?, sort_order
- `Tag` — id, name, description?, taxonomy_type_id, parent_id?, level(1|2|3), sort_order
- `Seed` — 全フィールド（SeedType, GrowthStage, SeedStatus, PatternAnalysis使用）
- `PatternAnalysis` — context_score, problem_score, solution_score, nameable_score, evaluated_at
- `LogReactionSummary` — insight, agree, helpful（各number）
- `Log` — 全フィールド（FacilitationType使用、reaction_summary?付き）
- `Louge` — 全フィールド（LougeStatus使用）
- `Notification` — 全フィールド（NotificationType使用）
- `Badge` — 全フィールド（BadgeType使用）

### 拡張エンティティ型（埋め込みフィールド付き）
- `SeedWithDetails` — Seed & { author?, tags?, logs? }
- `LougeWithDetails` — Louge & { seed?, author? }
- `UserProfile` — User & { industry_tags?, role_tags?, badges?, seed_count?, louge_count? }

### フォーム入力型
- `SeedFormInput` — type(必須), title(1-200文字コメント付き), content(1-2000文字コメント付き), tags?
- `LogFormInput` — content, seed_id, parent_log_id?
- `ProfileUpdateInput` — display_name?, bio?, avatar_url?

### API共通型
- `PaginatedResponse<T>` — items, total, page, per_page, has_next
- `InfiniteQueryPage<T>` — items, nextCursor?
- `ApiError` — code, message, details?

### Realtime イベント型
- `SeedStageChangedEvent` — seed_id, old_stage, new_stage, changed_at
- `NotificationInsertedEvent` — notification(Notification型)
- `LougePublishedEvent` — louge_id, seed_id, published_at

### その他
- `CleanseSuggestion` — original, suggestion, accepted

## 構文チェック結果
- `frontend/src/types/index.ts`: OK（`tsc --noEmit` エラーなし）
