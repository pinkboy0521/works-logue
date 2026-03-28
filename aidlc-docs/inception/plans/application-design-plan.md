# Application Design Plan — Works Logue

## アーキテクチャ確定事項

| 層 | 技術 | デプロイ先 |
|---|---|---|
| フロントエンド | Next.js 14+ / TypeScript（薄いUI層） | Vercel |
| バックエンドAPI | Python / FastAPI | Google Cloud Run |
| データベース | PostgreSQL（Supabase） | Supabase |
| 認証 | Supabase Auth（JWT） → FastAPI で検証 | Supabase |
| AI | Vertex AI（Gemini） | Cloud Run と同一GCPプロジェクト。IAM認証で API キー不要 |

```
[Next.js / Vercel]
      ↕ React Query（REST）
[FastAPI / Cloud Run]
      ↕                ↕
[Supabase DB]    [Vertex AI / Gemini]
      ↕
[Supabase Auth]  ← JWT → [FastAPI JWT検証]
```

---

## Design Plan Execution Checklist
- [x] Step 1: コンポーネント定義（components.md）
- [x] Step 2: コンポーネントメソッド定義（component-methods.md）
- [x] Step 3: サービス層定義（services.md）
- [x] Step 4: コンポーネント依存関係図（component-dependency.md）
- [x] Step 5: 統合設計ドキュメント（application-design.md）

---

## 設計判断の確認（残り2点）

### Q1: 開花判定（Bloom Detection）のトリガー

Log POST時にFastAPI内で毎回チェックするか、バックグラウンドで実行するか。

A) **リクエスト同期** — Log投稿エンドポイント内でその都度チェック（PoC向けシンプル）
B) **Cloud Run Jobs / Cloud Scheduler** — 定期バッチでチェック（スケーラブル）
C) **Supabase DB Trigger → FastAPI Webhook** — INSERT時にトリガー発火
D) おまかせ

[Answer]: A

---

### Q2: Louge生成（AI処理）の非同期処理方針

Cloud Run では長時間リクエストも可能ですが、どう処理しますか？

A) **Cloud Run バックグラウンドタスク** — 生成リクエストを受け付けてすぐ202を返し、完了をSupabase Realtimeで通知
B) **Server-Sent Events (SSE)** — FastAPIからストリーミングレスポンスでNext.jsに逐次送信
C) **Cloud Tasks キュー** — GCPのCloud Tasksでタスクキューを使った非同期処理
D) おまかせ

[Answer]: A

---

回答が完了したら「回答しました」とお知らせください。
