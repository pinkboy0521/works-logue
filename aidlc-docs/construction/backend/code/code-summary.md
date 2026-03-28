# Code Summary — Unit 1: backend

## 概要

FastAPI + Python バックエンド（Unit 1）の全コード生成完了。

## 生成ファイル一覧

### 基盤セットアップ（Step 4-5）
- `backend/requirements.txt` — Python 依存パッケージ
- `backend/app/__init__.py`
- `backend/app/config.py` — pydantic-settings による環境変数管理（P-08）
- `backend/app/dependencies.py` — DI ファクトリ（Supabase クライアント、JWT 認証、サービス注入）
- `backend/app/utils/logging.py` — python-json-logger 構造化ログ（P-09）

### Pydantic スキーマ（Step 6）
- `backend/app/models/enums.py` — SeedType / GrowthStage / SeedStatus / LougeStatus / ScoreAction / BadgeType / NotificationType / FacilitationType
- `backend/app/models/seed.py` — SeedCreate / SeedResponse / WisdomCleanseResult
- `backend/app/models/log.py` — LogCreate / LogResponse / LogWithGrowthStage / LogReactionCreate
- `backend/app/models/louge.py` — LougeResponse / ForkSeedCreate
- `backend/app/models/profile.py` — ProfileUpdate / ProfileResponse
- `backend/app/models/notification.py` — NotificationResponse
- `backend/app/models/tag.py` — TaxonomyTypeResponse / TagResponse（再帰的階層）
- `backend/app/models/follow.py` — FollowResponse / SeedFollowResponse
- `backend/app/models/pagination.py` — PaginationParams / PaginatedResponse（Generic）

### Repository Layer（Step 7）
- `backend/app/repositories/seed_repository.py` — SeedRepository（CRUD + stage/status 更新）
- `backend/app/repositories/log_repository.py` — LogRepository（AI facilitation フラグ対応）
- `backend/app/repositories/louge_repository.py` — LougeRepository（contributor 管理）
- `backend/app/repositories/profile_repository.py` — ProfileRepository（user_tags 含む）
- `backend/app/repositories/notification_repository.py` — near_bloom 対象取得 SQL
- `backend/app/repositories/follow_repository.py` — follows + seed_follows の両管理
- `backend/app/repositories/tag_repository.py` — taxonomy 階層タグ取得

### Business Logic（Steps 8-12）
- `backend/app/services/ai_service.py` — AIService（P-01 Semaphore / P-02 Timeout / P-03 Retry / P-04 Fallback 全適用）
- `backend/app/services/growth_engine.py` — GrowthEngine（2段階ロック解除 / check_and_advance / quality_scoring_and_bloom / AI facilitation log）
- `backend/app/services/score_engine.py` — ScoreEngine（add_score / award_bloom_contributors / badge 付与）
- `backend/app/services/notification_service.py` — NotificationService（notify_new_log / notify_louge_bloomed / notify_bloom_near）
- `backend/app/services/fork_service.py` — ForkService（published louge のみ fork 可）

### API Layer（Steps 13-15）
- `backend/app/routers/seeds.py` — GET/POST /seeds, GET/PATCH /seeds/{id}, POST /seeds/cleanse
- `backend/app/routers/logs.py` — GET/POST /seeds/{id}/logs, POST /logs/{id}/reactions
- `backend/app/routers/louges.py` — GET /louges, GET /louges/{id}, POST /louges/{id}/fork
- `backend/app/routers/profiles.py` — GET /profiles/{username}, GET/PATCH /profiles/me, PUT /profiles/me/tags
- `backend/app/routers/notifications.py` — GET /notifications, PUT /notifications/{id}/read, PUT /notifications/read-all
- `backend/app/routers/tags.py` — GET /tags/taxonomy-types, GET /tags
- `backend/app/routers/follows.py` — POST/DELETE /profiles/{id}/follow, POST/DELETE /seeds/{id}/follow, GET followers/following
- `backend/app/main.py` — FastAPI アプリ組み立て（CORS / ルーター登録 / lifespan）

### Tests（Steps 16-19）
- `backend/tests/conftest.py` — TestClient + dependency_overrides
- `backend/tests/unit/test_growth_engine.py` — ステージ判定ロジック単体テスト
- `backend/tests/unit/test_ai_service.py` — PatternAnalysis 計算式 / フォールバック動作
- `backend/tests/unit/test_score_engine.py` — スコア計算 / bloom contributor ルール
- `backend/tests/integration/test_seeds_api.py` — Seeds CRUD API
- `backend/tests/integration/test_logs_api.py` — Log POST + growth_stage レスポンス
- `backend/tests/integration/test_louges_api.py` — Louge 一覧 / 取得 / Fork
- `backend/pytest.ini` — asyncio_mode = auto

### DB & Deployment（Steps 20-21）
- `backend/migrations/001_initial_schema.sql` — 全テーブル DDL（PostgreSQL / Supabase）
- `backend/Dockerfile` — Python 3.12-slim + uvicorn
- `backend/cloudbuild.yaml` — Cloud Build → Artifact Registry → Cloud Run デプロイ
- `backend/.env.example` — 環境変数テンプレート

## ビジネスルール実装マッピング

| ルール | 実装箇所 |
|---|---|
| BR-01: 開花条件（2段階） | `GrowthEngine.check_and_advance` + `quality_scoring_and_bloom` |
| BR-02: 開花間近通知 | `GrowthEngine._send_bloom_near_notification` + `NotificationService.notify_bloom_near` |
| BR-03: 多様性スコア | `AIService.score_quality`（participant_tags 渡し） |
| BR-04: ステージ進行 | `GrowthEngine._determine_stage` |
| BR-05: スコアポイント | `ScoreEngine.add_score`（SCORE_POINTS マップ） |
| BR-06: バッジ付与 | `ScoreEngine._award_badge` |
| BR-07: 知恵洗浄 | `AIService.cleanse_wisdom` + `POST /seeds/cleanse` |
| BR-08: Seedバリデーション | `SeedCreate` Pydantic モデル |
| BR-09: ページネーション | `PaginatedResponse` / `PaginationParams` |
| BR-10: 通知既読 | `NotificationRepository.mark_read` / `mark_all_read` |
| BR-11: Seed公開範囲 | `GET /seeds` 認証不要 |
| BR-12: Fork可能条件 | `ForkService.create_fork`（status == published チェック） |
| BR-13: 認証 | `get_current_user` 依存性注入（JWT オフライン検証） |

## NFRパターン適用確認

| パターン | 適用箇所 |
|---|---|
| P-01: Semaphore | `AIService._get_semaphore` |
| P-02: Timeout | `AIService._call_vertex_ai`（asyncio.wait_for） |
| P-03: Retry | `AIService.generate_louge`（@retry tenacity） |
| P-04: Fallback | `lightweight_structural_check` / `cleanse_wisdom` / contribution_scores |
| P-05: BackgroundTask | `GrowthEngine.check_and_advance`（background_tasks.add_task） |
| P-06: JWT 検証 | `dependencies.get_current_user`（PyJWT オフライン） |
| P-07: DI | `dependencies.py` 全サービスファクトリ |
| P-08: pydantic-settings | `config.py Settings` クラス |
| P-09: 構造化ログ | `utils/logging.py setup_logger` |
