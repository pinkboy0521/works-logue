# Unit of Work Plan — Works Logue

## 前提コンテキスト
- **アーキテクチャ**: モノレポ（Next.js がルート、`backend/` に FastAPI）
- **デプロイ**: Vercel（フロントエンド）+ Google Cloud Run（バックエンド）
- **30ストーリー / 8エピック**

---

## 実行チェックリスト

- [x] Step 1: ユニット分解の決定（Q1回答後）
- [x] Step 2: unit-of-work.md の生成
- [x] Step 3: unit-of-work-dependency.md の生成
- [x] Step 4: unit-of-work-story-map.md の生成
- [x] Step 5: 検証（全ストーリーがユニットに割り当てられているか確認）— 30/30 ストーリー割り当て済み

---

## 設計上の質問

### Q1: ユニット分割粒度

Works Logue の開発ユニットをどのように分割しますか？

フロントエンド（Next.js）とバックエンド（FastAPI）は別デプロイ先なので、最低でも2ユニット（Frontend + Backend）になります。さらに機能ドメインで細分化するかを選んでください。

**A**: **2ユニット**（Frontend + Backend）— シンプルに2つに分割。各ユニット内は機能モジュールで整理
**B**: **4ユニット**（Frontend + Backend-Core + Backend-AI + Infrastructure）— AI/Louge生成部分を独立ユニットとして扱う
**C**: **5ユニット** — Frontend / Auth-User / Seed-Log / Louge-AI / Score-Notification に機能ドメインで分割

[Answer]: A

---

### Q2: 開発順序の優先度

ユニットの開発順序について選んでください。

**A**: **インフラ優先** — 認証・DBスキーマ・共通基盤を最初に構築し、その後機能追加
**B**: **フィーチャー優先** — ユーザーが体験できる最小フロー（Seed投稿 → Log → Louge）を縦断的に最初に構築
**C**: **フロントエンド先行** — UIモックアップ+APIモックを先に構築してUX確認、後からバックエンド本実装

[Answer]: A

---

回答が完了したら「回答しました」または「次へ」とお知らせください。
