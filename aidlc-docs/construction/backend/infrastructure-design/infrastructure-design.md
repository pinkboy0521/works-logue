# Infrastructure Design — Unit 1: backend

## インフラ全体構成

### GCP プロジェクト構成

```
GCP Project: works-logue-prod
├── Cloud Run
│   └── works-logue-api (asia-northeast1)
├── Artifact Registry
│   └── asia-northeast1-docker.pkg.dev/works-logue-prod/works-logue/api
├── Cloud Build
│   └── cloudbuild.yaml トリガー（main ブランチ push）
├── Secret Manager
│   └── 全環境変数（SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, 等）
└── Vertex AI
    └── Gemini API（asia-northeast1）
        ├── gemini-1.5-flash（lightweight_structural_check）
        └── gemini-1.5-pro（generate_louge, quality_scoring, cleanse_wisdom）
```

### Supabase プロジェクト構成

```
Supabase Project: works-logue
├── リージョン: ap-northeast-1（東京）
├── PostgreSQL（メイン DB）
│   └── 全テーブル（profiles, seeds, logs, louges, tags, ...）
├── Auth
│   └── JWT 発行・ユーザー管理
├── Realtime
│   └── notifications テーブルの変更をブロードキャスト
└── Storage
    └── avatars バケット（profiles.avatar_url）
```

---

## サービスマッピング

### 論理コンポーネント → インフラサービス

| 論理コンポーネント | インフラサービス | 備考 |
|---|---|---|
| FastAPI Application | Cloud Run（コンテナ） | uvicorn + Dockerfile |
| Repository Layer | Supabase REST API | supabase-py クライアント |
| GrowthEngine / ScoreEngine 等 | Cloud Run（インプロセス） | サービスクラスとして同一コンテナ内 |
| BackgroundTasks | Cloud Run（インプロセス） | timeout: 300s で保護 |
| AIService（Vertex AI 呼び出し） | Vertex AI Gemini API | サービスアカウント認証 |
| Auth Dependency（JWT 検証） | PyJWT（インプロセス） | Supabase JWT Secret 使用 |
| 環境変数・シークレット | Secret Manager | Cloud Run に自動マウント |
| コンテナイメージ | Artifact Registry | Cloud Build がビルド・プッシュ |
| ログ | Cloud Logging | Cloud Run stdout 自動連携 |

---

## Cloud Run 詳細設定

```yaml
service: works-logue-api
region: asia-northeast1
image: asia-northeast1-docker.pkg.dev/works-logue-prod/works-logue/api:$COMMIT_SHA

# スケーリング
min-instances: 0       # コスト最適化（Phase 1）
max-instances: 2       # Phase 1 上限
concurrency: 80        # デフォルト

# リソース
memory: 512Mi
cpu: 1

# タイムアウト
timeout: 300s          # BackgroundTask 考慮

# 環境変数（Secret Manager 参照）
env:
  - name: SUPABASE_URL
    valueFrom: { secretKeyRef: { name: supabase-url, version: latest } }
  - name: SUPABASE_SERVICE_ROLE_KEY
    valueFrom: { secretKeyRef: { name: supabase-service-role-key, version: latest } }
  - name: SUPABASE_JWT_SECRET
    valueFrom: { secretKeyRef: { name: supabase-jwt-secret, version: latest } }
  - name: VERTEX_AI_PROJECT_ID
    value: works-logue-prod
  - name: VERTEX_AI_LOCATION
    value: asia-northeast1
  - name: SYSTEM_USER_ID
    valueFrom: { secretKeyRef: { name: system-user-id, version: latest } }
  # 開花閾値（デフォルト値を採用する場合は省略可）
  - name: BLOOM_STRUCTURAL_THRESHOLD
    value: "0.8"
  - name: BLOOM_LOG_COUNT
    value: "10"
  - name: BLOOM_PARTICIPANT_COUNT
    value: "5"
  - name: BLOOM_QUALITY_SCORE
    value: "0.7"
  - name: VERTEX_AI_MAX_CONCURRENT
    value: "5"

# サービスアカウント
serviceAccountEmail: works-logue-api@works-logue-prod.iam.gserviceaccount.com
```

### サービスアカウント権限

| ロール | 目的 |
|---|---|
| `roles/aiplatform.user` | Vertex AI Gemini API 呼び出し |
| `roles/secretmanager.secretAccessor` | Secret Manager からシークレット取得 |
| `roles/logging.logWriter` | Cloud Logging への書き込み |

---

## Artifact Registry

```
リポジトリ名: works-logue
形式: Docker
リージョン: asia-northeast1
パス: asia-northeast1-docker.pkg.dev/works-logue-prod/works-logue/api
タグ戦略: $COMMIT_SHA（Cloud Build 変数）+ latest
```

---

## Secret Manager — シークレット一覧

| シークレット名 | 内容 | 更新頻度 |
|---|---|---|
| `supabase-url` | Supabase プロジェクト URL | 変更時のみ |
| `supabase-service-role-key` | Supabase サービスロールキー | 変更時のみ |
| `supabase-jwt-secret` | Supabase JWT シークレット | 変更時のみ |
| `system-user-id` | AI ファシリテーション用システムユーザー UUID | 初回のみ |

---

## Supabase 詳細設定

### 接続情報

| 項目 | 値 |
|---|---|
| リージョン | ap-northeast-1（東京） |
| 接続方式 | supabase-py（REST API） |
| 認証 | サービスロールキー（バックエンドのみ） |
| RLS | Phase 1: 無効（Phase 2 で整備） |

### Realtime 設定

```
有効テーブル: notifications
フィルター: user_id = :current_user_id（フロントエンド側で設定）
用途: 通知ドロップダウンのリアルタイム更新
```

### Storage バケット設定

```
バケット名: avatars
アクセス制御: public（アバター画像は公開）
ファイル制限: 最大 2MB、MIME: image/*
パス規則: {user_id}/{filename}
```

---

## ネットワーク・セキュリティ

### CORS 設定（Cloud Run）

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://works-logue.vercel.app",   # Vercel 本番
        "http://localhost:3000",              # ローカル開発
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### エンドポイント公開範囲

| エンドポイント種別 | 公開範囲 |
|---|---|
| Cloud Run サービス | All users（Vercel フロントエンドからアクセス） |
| Supabase DB | Supabase ダッシュボード経由のみ（直接 SQL 不可） |
| Secret Manager | works-logue-api サービスアカウントのみ |
| Artifact Registry | Cloud Build サービスアカウントのみ |
