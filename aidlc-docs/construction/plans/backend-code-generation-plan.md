# Code Generation Plan — Unit 1: backend

## コンテキスト

| 項目 | 内容 |
|---|---|
| ユニット | Unit 1: backend |
| プロジェクト種別 | Greenfield（マルチユニット） |
| コード配置 | `backend/`（ワークスペースルート直下） |
| フレームワーク | FastAPI + uvicorn |
| DB | Supabase PostgreSQL（supabase-py） |
| AI | Vertex AI Gemini（gemini-1.5-flash / pro） |
| デプロイ | Google Cloud Run |

## ストーリー対応表

| ステップ群 | カバーするストーリー |
|---|---|
| Step 3〜5（基盤） | 全ストーリーの前提 |
| Step 6（Repository） | 全ストーリーの前提 |
| Step 7（AIService） | US-203, US-401, US-402, US-403 |
| Step 8（GrowthEngine） | US-301, US-304, US-305, US-401, US-402, US-403 |
| Step 9（ScoreEngine） | US-601, US-602 |
| Step 10（NotificationService） | US-305, US-701, US-702 |
| Step 11（ForkService） | US-501, US-502, US-503 |
| Step 12（Routers: seeds/logs/louges） | US-000, US-001, US-201, US-202, US-203, US-204, US-301, US-302, US-303, US-306, US-401〜US-406, US-501〜503 |
| Step 13（Routers: profiles/notifications/tags/follows） | US-101〜103, US-603, US-604, US-701, US-702, フォロー機能 |
| Step 14〜16（テスト） | 全ストーリー検証 |
| Step 17（DB マイグレーション） | 全エンティティ |
| Step 18（デプロイ成果物） | インフラ設計 |

---

## 実行チェックリスト

### Part 1: Planning
- [x] Step 1: ユニットコンテキスト分析
- [x] Step 2: コード生成プラン作成（本ファイル）
- [ ] Step 3: ユーザー承認取得

### Part 2: Generation

#### 基盤セットアップ
- [ ] **Step 4**: プロジェクト構造セットアップ
- [ ] **Step 5**: 設定・依存関係（config.py / requirements.txt / dependencies.py）
- [ ] **Step 6**: Pydantic スキーマ定義（models/）

#### Repository Layer
- [ ] **Step 7**: Repository Layer（repositories/）

#### Business Logic
- [ ] **Step 8**: AIService（services/ai_service.py）
- [ ] **Step 9**: GrowthEngine（services/growth_engine.py）
- [ ] **Step 10**: ScoreEngine（services/score_engine.py）
- [ ] **Step 11**: NotificationService（services/notification_service.py）
- [ ] **Step 12**: ForkService（services/fork_service.py）

#### API Layer
- [ ] **Step 13**: Routers — seeds / logs / louges（routers/seeds.py, logs.py, louges.py）
- [ ] **Step 14**: Routers — profiles / notifications / tags / follows（routers/profiles.py, notifications.py, tags.py, follows.py）
- [ ] **Step 15**: main.py（FastAPI アプリ組み立て）

#### Tests
- [ ] **Step 16**: 単体テスト — GrowthEngine（tests/unit/test_growth_engine.py）
- [ ] **Step 17**: 単体テスト — AIService（tests/unit/test_ai_service.py）
- [ ] **Step 18**: 単体テスト — ScoreEngine（tests/unit/test_score_engine.py）
- [ ] **Step 19**: 統合テスト — API ルーター（tests/integration/）

#### DB & Deployment
- [ ] **Step 20**: DB マイグレーションスクリプト（backend/migrations/）
- [ ] **Step 21**: デプロイ成果物（Dockerfile / cloudbuild.yaml / .env.example）

#### Documentation
- [ ] **Step 22**: コードサマリー（aidlc-docs/construction/backend/code/）

---

## ディレクトリ構造（生成後）

```
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── models/
│   │   ├── seed.py
│   │   ├── log.py
│   │   ├── louge.py
│   │   ├── profile.py
│   │   ├── notification.py
│   │   ├── tag.py
│   │   └── follow.py
│   ├── repositories/
│   │   ├── seed_repository.py
│   │   ├── log_repository.py
│   │   ├── louge_repository.py
│   │   ├── profile_repository.py
│   │   ├── notification_repository.py
│   │   ├── tag_repository.py
│   │   └── follow_repository.py
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── growth_engine.py
│   │   ├── score_engine.py
│   │   ├── notification_service.py
│   │   └── fork_service.py
│   ├── routers/
│   │   ├── seeds.py
│   │   ├── logs.py
│   │   ├── louges.py
│   │   ├── profiles.py
│   │   ├── notifications.py
│   │   ├── tags.py
│   │   └── follows.py
│   └── utils/
│       └── logging.py
├── tests/
│   ├── conftest.py
│   ├── unit/
│   │   ├── test_growth_engine.py
│   │   ├── test_ai_service.py
│   │   └── test_score_engine.py
│   └── integration/
│       ├── test_seeds_api.py
│       ├── test_logs_api.py
│       └── test_louges_api.py
├── migrations/
│   └── 001_initial_schema.sql
├── Dockerfile
├── cloudbuild.yaml
├── requirements.txt
└── .env.example
```

---

## 依存関係・インターフェース

### 外部依存
- Supabase（DB / Auth / Realtime / Storage）
- Vertex AI（Gemini gemini-1.5-flash / pro）

### Unit 2（frontend）への提供インターフェース
- REST API: `https://works-logue-api-xxx-an.a.run.app`
- 認証: Supabase JWT（フロントエンドと共有）
- Realtime: Supabase Realtime（notifications テーブル）

---

## 注意事項

- **コード配置**: 全ファイルを `backend/` 以下に生成（`aidlc-docs/` には絶対に生成しない）
- **AI モック**: テストでは Vertex AI SDK を `pytest-mock` でモック
- **BackgroundTask**: FastAPI 組み込み `BackgroundTasks` を使用（外部キュー不使用）
- **RLS**: Phase 1 は無効。サービスロールキーで全操作
