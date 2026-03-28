# Deployment Architecture — Unit 1: backend

## CI/CD パイプライン（Cloud Build）

### トリガー設定

```
トリガー種別: Push to branch
ブランチ: main
リポジトリ: GitHub（works-logue）
設定ファイル: backend/cloudbuild.yaml
```

### cloudbuild.yaml

```yaml
steps:
  # Step 1: Docker イメージビルド
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-t'
      - 'asia-northeast1-docker.pkg.dev/$PROJECT_ID/works-logue/api:$COMMIT_SHA'
      - '-t'
      - 'asia-northeast1-docker.pkg.dev/$PROJECT_ID/works-logue/api:latest'
      - './backend'

  # Step 2: Artifact Registry へプッシュ
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - '--all-tags'
      - 'asia-northeast1-docker.pkg.dev/$PROJECT_ID/works-logue/api'

  # Step 3: Cloud Run へデプロイ
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'works-logue-api'
      - '--image=asia-northeast1-docker.pkg.dev/$PROJECT_ID/works-logue/api:$COMMIT_SHA'
      - '--region=asia-northeast1'
      - '--platform=managed'
      - '--allow-unauthenticated'
      - '--timeout=300s'
      - '--memory=512Mi'
      - '--min-instances=0'
      - '--max-instances=2'
      - '--service-account=works-logue-api@$PROJECT_ID.iam.gserviceaccount.com'

options:
  logging: CLOUD_LOGGING_ONLY

substitutions:
  _REGION: asia-northeast1
```

### デプロイフロー

```
[開発者] git push origin main
        |
        v
[Cloud Build トリガー起動]
        |
        v
[Step 1] Docker ビルド（backend/Dockerfile）
        |
        v
[Step 2] Artifact Registry へプッシュ
        asia-northeast1-docker.pkg.dev/.../api:$COMMIT_SHA
        |
        v
[Step 3] Cloud Run デプロイ
        ゼロダウンタイムでトラフィック切り替え
        |
        v
[完了] Cloud Run 新リビジョンが 100% トラフィック受信
```

---

## Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

# 依存パッケージのインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードのコピー
COPY app/ ./app/

# 非 root ユーザーで実行
RUN useradd -m appuser
USER appuser

# ポート公開（Cloud Run は PORT 環境変数を自動設定）
EXPOSE 8080

# 起動コマンド
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "1"]
```

---

## 環境構成

| 環境 | Branch | Cloud Run サービス | Supabase プロジェクト |
|---|---|---|---|
| 本番（prod） | main | works-logue-api | works-logue（Tokyo） |
| ローカル開発 | — | uvicorn（localhost:8000） | works-logue（or ローカル） |

> **Note**: Phase 1 はステージング環境なし。本番のみ。

---

## ローカル開発環境

```bash
# .env ファイルをコピー
cp backend/.env.example backend/.env
# 各値を設定（Supabase URL, Keys 等）

# 依存インストール
cd backend
pip install -r requirements.txt

# 起動
uvicorn app.main:app --reload --port 8000
```

```
# backend/.env.example
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
VERTEX_AI_PROJECT_ID=works-logue-prod
VERTEX_AI_LOCATION=asia-northeast1
SYSTEM_USER_ID=your-system-user-uuid
BLOOM_STRUCTURAL_THRESHOLD=0.8
BLOOM_LOG_COUNT=10
BLOOM_PARTICIPANT_COUNT=5
BLOOM_QUALITY_SCORE=0.7
VERTEX_AI_MAX_CONCURRENT=5
```

---

## データフロー図（インフラ観点）

```
[Vercel フロントエンド]
  HTTPS リクエスト
        |
        v
[Cloud Run: works-logue-api]  asia-northeast1
  ├─ FastAPI + uvicorn
  ├─ BackgroundTasks（インプロセス）
  │
  ├─── REST API ──────────> [Supabase PostgreSQL]  ap-northeast-1
  │                              全テーブル CRUD
  │
  ├─── Vertex AI SDK ─────> [Vertex AI Gemini API]  asia-northeast1
  │    gemini-1.5-flash          軽量チェック
  │    gemini-1.5-pro            Louge 生成・品質スコアリング
  │
  └─── (DB INSERT) ───────> [Supabase Realtime]
                                 notifications テーブル変更
                                        |
                                        v
                              [Vercel フロントエンド]
                               Websocket でリアルタイム受信

[Cloud Build]  main push
  → Artifact Registry → Cloud Run デプロイ

[Secret Manager]  asia-northeast1
  → Cloud Run 起動時にシークレット自動注入
```

---

## DB マイグレーション戦略

| 項目 | 方針 |
|---|---|
| ツール | Supabase SQL Editor（手動）または supabase CLI |
| タイミング | Cloud Run デプロイとは独立して手動実行 |
| Phase 1 方針 | マイグレーションファイルを `backend/migrations/` に管理、手動適用 |
| ロールバック | Supabase ダッシュボードからの手動 SQL で対応 |
