# Unit of Work Dependency — Works Logue

## 依存関係マトリクス

| ユニット | 依存先 | 依存の種類 | 備考 |
|---|---|---|---|
| frontend | backend | ランタイム依存 | React Query で FastAPI REST API を呼び出し |
| frontend | Supabase | ランタイム依存 | Auth セッション管理・Realtime WebSocket |
| backend | Supabase | ランタイム依存 | PostgreSQL データ永続化・JWT 検証 |
| backend | Vertex AI | ランタイム依存 | Louge 生成・知恵洗浄（IAM 認証） |

## 開発依存関係

```
backend (Unit 1)
    ↑ 先行開発（DBスキーマ・API確定）
    |
frontend (Unit 2)
    ← backend の REST API 仕様に依存
    ← Supabase の Realtime チャネル設計に依存
```

**frontend は backend の完成を待つ必要がある主な理由**:
1. FastAPI エンドポイントの URL・リクエスト/レスポンス型が確定してから React Query フックを実装
2. DB スキーマ確定後に Supabase Realtime のテーブル変更イベントを購読
3. JWT 検証フローの動作確認後に frontend の認証フローを実装

## 外部サービス依存関係

```
[Supabase]
    ├─ backend:  supabase-py (CRUD, JWT 検証, Storage)
    └─ frontend: @supabase/ssr (Auth セッション, Realtime WS)

[Vertex AI]
    └─ backend のみ: google-cloud-aiplatform (Gemini 呼び出し)

[Vercel]
    └─ frontend のみ: デプロイ・ホスティング

[Google Cloud Run]
    └─ backend のみ: コンテナ実行環境
```

## 統合境界

| 境界 | インターフェース | 認証方式 |
|---|---|---|
| frontend → backend | REST API（JSON） | Bearer JWT（Supabase 発行） |
| frontend → Supabase | WebSocket（Realtime）/ HTTPS | Supabase Anon Key + JWT |
| backend → Supabase | HTTPS（supabase-py） | Supabase Service Key |
| backend → Vertex AI | gRPC / HTTPS | GCP IAM（サービスアカウント） |
