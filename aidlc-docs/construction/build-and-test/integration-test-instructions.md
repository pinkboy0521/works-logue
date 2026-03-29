# Integration Test Instructions

## 目的

Backend API と Frontend の結合動作、および Supabase との実際の通信を検証する。

---

## テスト環境セットアップ

### 1. テスト用 Supabase プロジェクトを用意
本番データを汚染しないよう、Supabase でテスト専用プロジェクトを作成するか、ローカル Supabase を使用する。

```bash
# ローカル Supabase（推奨）
npx supabase init
npx supabase start
# → DB URL / Anon Key / Service Role Key が出力される
```

### 2. テスト用 .env を設定
```bash
cp backend/.env.example backend/.env.test
# .env.test に Supabase ローカルの値を設定
```

### 3. マイグレーション実行（テスト DB）
```bash
psql $TEST_DATABASE_URL -f backend/migrations/001_initial_schema.sql
```

### 4. バックエンド起動（テストモード）
```bash
cd backend
ENV_FILE=.env.test uvicorn app.main:app --port 8001
```

---

## Backend 統合テスト (pytest)

### 実行
```bash
cd backend
pytest tests/integration/ -v --env-file=.env.test
```

### テストシナリオ

#### Scenario 1: Seed CRUD フロー
- **ファイル**: `tests/integration/test_seeds_api.py`
- **内容**: `POST /seeds` → `GET /seeds/{id}` → `PATCH /seeds/{id}` → Seed の成長ステージ確認
- **期待結果**: 各エンドポイントが 200/201 を返し、DB に正しくデータが永続化される

#### Scenario 2: Log 投稿 → GrowthEngine 連動
- **ファイル**: `tests/integration/test_logs_api.py`
- **内容**: `POST /seeds/{id}/logs` 実行後、レスポンスの `growth_stage` が BR-04 ルールに従って更新されることを確認
- **期待結果**: Log 投稿後のレスポンスに `growth_stage` が含まれ、ステージ進行条件を満たした場合に値が変化する

#### Scenario 3: Louge 一覧・取得・Fork
- **ファイル**: `tests/integration/test_louges_api.py`
- **内容**: `GET /louges` → `GET /louges/{id}` → `POST /louges/{id}/fork`
- **期待結果**: Fork は `status == published` の Louge のみ成功 (BR-12)。未公開 Louge への Fork は 403 を返す

#### Scenario 4: Frontend → Backend API 連携
- **ツール**: Playwright または手動テスト
- **手順**:
  1. `cd frontend && npm run dev`
  2. ブラウザで `http://localhost:3000` を開く
  3. ログイン → Seed 作成 → Log 投稿 → 成長インジケーター変化を確認
  4. 通知ドロップダウンに通知が表示されることを確認

---

## Scenario 5: Supabase Realtime 連携
- **対象フック**: `useSeedRealtime.ts`
- **手順**:
  1. Seed 詳細ページを開く
  2. 別タブ or 別ウィンドウから同じ Seed に Log を投稿
  3. 元のタブで成長インジケーターがリアルタイムに更新されることを確認
- **期待結果**: ページリロードなしに UI が更新される

---

## クリーンアップ
```bash
# テストデータ削除
psql $TEST_DATABASE_URL -c "TRUNCATE seeds, logs, louges, profiles, notifications CASCADE;"

# ローカル Supabase 停止
npx supabase stop
```
