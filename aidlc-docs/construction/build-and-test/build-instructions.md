# Build Instructions

## Prerequisites

### Build Tools
- **Python**: 3.12+
- **Node.js**: 20+ (LTS)
- **npm**: 10+
- **Docker**: 24+ (Cloud Run ビルド用)
- **Google Cloud SDK** (`gcloud`): 最新版（Cloud Run デプロイ用）

### 必須環境変数

#### Backend (`backend/.env`)
```bash
# .env.example を参考に作成
cp backend/.env.example backend/.env
```

| 変数名 | 説明 |
|---|---|
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `SUPABASE_JWT_SECRET` | JWT 検証シークレット |
| `VERTEX_AI_PROJECT` | GCP Project ID |
| `VERTEX_AI_LOCATION` | Vertex AI リージョン（例: `us-central1`） |
| `CORS_ORIGINS` | 許可オリジン（例: `http://localhost:3000`） |
| `LOG_LEVEL` | ログレベル（`INFO` / `DEBUG`） |

#### Frontend (`frontend/.env.local`)
```bash
cp frontend/.env.local.example frontend/.env.local
```

| 変数名 | 説明 |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL（例: `http://localhost:8000`） |

---

## Build Steps

### Unit 1: Backend

#### 1. 依存パッケージインストール
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. データベースマイグレーション（Supabase）
```bash
# Supabase SQL Editor または psql で実行
psql $DATABASE_URL -f migrations/001_initial_schema.sql
```

#### 3. 起動確認（ローカル）
```bash
cd backend
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs で Swagger UI 確認
```

#### 4. Docker ビルド
```bash
cd backend
docker build -t works-logue-backend .
docker run -p 8000:8000 --env-file .env works-logue-backend
```

#### 5. Cloud Run デプロイ（CI/CD）
```bash
# Cloud Build 経由（cloudbuild.yaml 参照）
gcloud builds submit --config cloudbuild.yaml .
```

**期待される成功出力**:
- `INFO: Application startup complete.`
- `GET /health` → `{"status": "ok"}`

---

### Unit 2: Frontend

#### 1. 依存パッケージインストール
```bash
cd frontend
npm install
```

#### 2. 開発サーバー起動
```bash
npm run dev
# → http://localhost:3000
```

#### 3. 型チェック
```bash
npm run type-check   # tsc --noEmit
```

#### 4. Lint チェック
```bash
npm run lint
```

#### 5. プロダクションビルド
```bash
npm run build
npm run start   # ビルド成果物の動作確認
```

**期待される成功出力**:
- `✓ Compiled successfully`
- `Route (app)` の一覧表示
- 0 errors, 0 warnings

#### 6. Vercel デプロイ
```bash
# Vercel CLI
npx vercel --prod
# または GitHub 連携で自動デプロイ（vercel.json 参照）
```

---

## Troubleshooting

### Backend: ModuleNotFoundError
- **原因**: 仮想環境が有効化されていない
- **解決**: `source backend/.venv/bin/activate` を実行してから再試行

### Backend: Supabase 接続エラー
- **原因**: `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` が未設定または誤り
- **解決**: `.env` ファイルを確認。Supabase Dashboard > Settings > API で値を取得

### Backend: Vertex AI 認証エラー
- **原因**: GCP ADC (Application Default Credentials) が未設定
- **解決**: `gcloud auth application-default login` を実行

### Frontend: Type Errors
- **原因**: `frontend/src/types/index.ts` と API レスポンスの不整合
- **解決**: `npm run type-check` でエラー箇所を特定し修正

### Frontend: NEXT_PUBLIC_* 変数が undefined
- **原因**: `.env.local` が存在しない / ビルド前に設定されていない
- **解決**: `frontend/.env.local` を作成してビルドをやり直す
