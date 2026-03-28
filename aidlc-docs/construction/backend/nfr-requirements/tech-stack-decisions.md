# Tech Stack Decisions — Unit 1: backend

## 決定サマリー

| カテゴリ | 選定技術 | 決定根拠 |
|---|---|---|
| バックエンドフレームワーク | FastAPI | Q9: A — BackgroundTasks 組み込み、非同期対応 |
| AI モデル（軽量チェック） | gemini-1.5-flash | Q10: B — コスト最適化（毎 Log POST で呼び出し） |
| AI モデル（本格処理） | gemini-1.5-pro | Q10: B — 品質重視（Louge 生成、品質スコアリング） |
| デプロイ環境 | Google Cloud Run | Q11: B — Vertex AI と同一 GCP プロジェクト |
| データベース | Supabase（PostgreSQL） | 要件確定済み（Vercel + Supabase 構成） |
| 認証 | Supabase Auth（JWT） | 要件確定済み |
| Realtime | Supabase Realtime | 通知配信に使用（既設計） |
| モニタリング | Cloud Run 組み込みログ | Q12: B — Phase 1 はシンプルに |
| テスト | pytest / pytest-asyncio / pytest-cov | Q13: A — カバレッジ 80% 以上 |

---

## バックエンドフレームワーク: FastAPI

**選定理由**:
- Python の非同期（async/await）ネイティブ対応
- `BackgroundTasks` が組み込み — Louge 生成・品質スコアリングの非同期実行に直接使用
- Pydantic による型安全なリクエスト/レスポンスバリデーション
- 自動 OpenAPI ドキュメント生成

**バージョン**: FastAPI 0.115.x（最新安定版）

**依存パッケージ**:
```
fastapi
uvicorn[standard]      # ASGI サーバー
pydantic               # バリデーション（FastAPI 同梱）
pydantic-settings      # 環境変数管理（BaseSettings）
python-dotenv          # .env ファイル読み込み
supabase               # Supabase Python クライアント
google-cloud-aiplatform # Vertex AI SDK
python-jose[cryptography] # JWT 検証
httpx                  # 非同期 HTTP クライアント（テスト用）
python-json-logger     # 構造化ログ
```

**テスト依存パッケージ**:
```
pytest
pytest-asyncio
pytest-cov
pytest-mock
```

---

## AI モデル戦略: 2段階モデル構成

### 軽量チェック — gemini-1.5-flash

| 項目 | 内容 |
|---|---|
| 使用箇所 | `lightweight_structural_check()` — Log POST のたびに実行 |
| モデル ID | `gemini-1.5-flash` |
| 選定理由 | 中頻度（50 Log/日）の同期呼び出しに対してコスト最適化 |
| タイムアウト設定 | 8秒（P95 5秒目標に対するバッファ） |
| 期待レスポンス形式 | JSON（context_score, problem_score, solution_score, nameable_score） |

### 本格処理 — gemini-1.5-pro

| 項目 | 内容 |
|---|---|
| 使用箇所 | `quality_scoring_and_bloom()`, `generate_louge()`, `cleanse_wisdom()` |
| モデル ID | `gemini-1.5-pro` |
| 選定理由 | Louge 生成（Wikipedia 型長文記事）と品質スコアリングの精度重視 |
| タイムアウト設定 | 120秒（Louge 生成は長文出力のため） |
| 期待レスポンス形式 | JSON（各用途ごとのスキーマ） |

**コスト見積もり概算（Phase 1: 〜100ユーザー）**:
- 軽量チェック: 50 Log/日 × 30日 × flash 単価 ≈ 低コスト
- Louge 生成: 月間数件〜十数件（開花は稀なイベント）≈ 低コスト
- Phase 1 規模では Vertex AI 無料枠内に収まる可能性が高い

---

## デプロイ環境: Google Cloud Run

**選定理由**:
- Vertex AI（Gemini API）と同一 GCP プロジェクト → VPC 内通信でレイテンシ低減
- サービスアカウントによる Vertex AI 認証（Secret 不要）
- コンテナ実行 → FastAPI + uvicorn をそのまま Docker 化
- オートスケール（Phase 1 は 0〜2インスタンス）

**設定方針**:
```yaml
# Cloud Run サービス設定（概要）
image: gcr.io/{PROJECT_ID}/works-logue-api
region: asia-northeast1  # 東京リージョン
min-instances: 0          # コスト最適化（Phase 1）
max-instances: 2
concurrency: 80           # デフォルト
memory: 512Mi
cpu: 1
timeout: 300s             # BackgroundTask 考慮
```

**環境変数（Cloud Run Secrets Manager 経由）**:
```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
VERTEX_AI_PROJECT_ID
VERTEX_AI_LOCATION
SYSTEM_USER_ID
BLOOM_STRUCTURAL_THRESHOLD  # default: 0.8
BLOOM_LOG_COUNT             # default: 10
BLOOM_PARTICIPANT_COUNT     # default: 5
BLOOM_QUALITY_SCORE         # default: 0.7
VERTEX_AI_MAX_CONCURRENT    # default: 5（コスト保護）
```

---

## データベース: Supabase PostgreSQL

**接続方式**:
- Python クライアント: `supabase-py`（REST API 経由）
- サービスロールキーを使用（バックエンドからのみアクセス）
- RLS: Phase 1 は無効、Phase 2 で整備

**Supabase 機能活用**:
| 機能 | 用途 |
|---|---|
| PostgreSQL | メインデータストア（全エンティティ） |
| Auth | JWT 発行・検証（フロントエンドとバックエンドで共有） |
| Realtime | 通知の Websocket 配信（フロントエンドが購読） |
| Storage | ユーザーアバター画像（profiles.avatar_url） |

---

## プロジェクト構成（ディレクトリレイアウト）

```
works-logue/
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI アプリ エントリポイント
│   │   ├── config.py               # 環境変数・閾値設定（pydantic-settings）
│   │   ├── dependencies.py         # DI（Supabase クライアント、認証）
│   │   ├── routers/
│   │   │   ├── seeds.py
│   │   │   ├── logs.py
│   │   │   ├── louges.py
│   │   │   ├── profiles.py
│   │   │   ├── notifications.py
│   │   │   └── tags.py
│   │   ├── services/
│   │   │   ├── growth_engine.py    # GrowthEngine（コアロジック）
│   │   │   ├── ai_service.py       # Vertex AI 呼び出し
│   │   │   ├── score_engine.py     # ScoreEngine
│   │   │   ├── notification_service.py
│   │   │   └── fork_service.py
│   │   ├── repositories/           # DB アクセス層
│   │   │   ├── seed_repository.py
│   │   │   ├── log_repository.py
│   │   │   └── ...
│   │   ├── models/                 # Pydantic スキーマ（Request/Response）
│   │   │   └── ...
│   │   └── utils/
│   │       └── logging.py          # 構造化ログ設定
│   ├── tests/
│   │   ├── unit/
│   │   │   ├── test_growth_engine.py
│   │   │   ├── test_ai_service.py
│   │   │   ├── test_score_engine.py
│   │   │   └── ...
│   │   ├── integration/
│   │   │   └── test_api_*.py
│   │   └── conftest.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
└── ...
```

---

## 技術的制約・注意事項

| 項目 | 内容 |
|---|---|
| BackgroundTask の永続化 | FastAPI の `BackgroundTasks` はインプロセス実行。Cloud Run インスタンスがリクエスト完了後に即終了しないよう `timeout: 300s` を設定する |
| Vertex AI 同時呼び出し制限 | `VERTEX_AI_MAX_CONCURRENT=5` でセマフォ制御し、コスト暴走を防ぐ |
| Supabase JWT 検証 | `SUPABASE_JWT_SECRET` を使い PyJWT でオフライン検証（Supabase への余分なリクエストを避ける）|
| gemini-1.5-flash の JSON モード | `response_mime_type="application/json"` を指定し、パースエラーを最小化 |
