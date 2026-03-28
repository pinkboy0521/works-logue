# Requirements Analysis — Clarifying Questions

**Instructions**: 各質問に `[Answer]:` タグの後に回答の選択肢（A, B, C...）を記入してください。
選択肢が合わない場合は `X) Other` を選び、自由記述してください。

---

## Q1: 開発フェーズのスコープ

今回のアプリ開発は、どの段階を対象としますか？

A) MVP（最小限の機能）— Seed投稿・Log投稿・Louge手動生成のみ
B) フェーズ1相当 — MVP + AI開花判定エンジン + インサイト・スコア基本機能
C) フルプロダクト — 事業計画書に記載されているすべての機能（マネタイズ含む）
D) まず設計・計画のみ（コード生成は後で）
X) Other:

[Answer]:B

---

## Q2: テクノロジースタック

使用するテクノロジーについて希望はありますか？

A) おまかせ（AI-DLCが最適なスタックを提案する）
B) Next.js / TypeScript / PostgreSQL（Webアプリ標準構成）
C) React + Node.js / Express / PostgreSQL
D) 既に使いたい技術がある（Xを選んで記述）
X) Other (具体的に記述):

[Answer]:A

---

## Q3: AIモデルとの連携

Louge生成・知恵洗浄などのAI処理について：

A) Claude API（Anthropic）を使用
B) OpenAI API（GPT-4など）を使用
C) どちらでもよい（おまかせ）
D) まず AI なしのモックで実装し、後で本物のAIを統合する
X) Other:

[Answer]:A

---

## Q4: 認証・ユーザー管理

ユーザー認証の方式は？

A) メールアドレス＋パスワード認証のみ
B) Google / GitHub などのソーシャルログインも含む
C) NextAuth / Supabase Auth などの認証サービスを利用
D) おまかせ
X) Other:

[Answer]:C

---

## Q5: 優先する画面・機能

最初に作るべき画面・機能の優先順位は？

A) Seed投稿画面 → ホームフィード → Louge表示ページ の順
B) ユーザー認証 → プロフィール → Seed投稿 の順
C) 事業計画書の順番通り（Seed定義→Log→Louge）
D) おまかせ（AI-DLCが最適な順序を提案）
X) Other:

[Answer]:D

---

## Q6: デプロイ・インフラ

デプロイ先の希望は？

A) Vercel（フロントエンド）+ Supabase（DB/Auth）— 最短でデプロイ可能
B) AWS（本格的なクラウドインフラ）
C) ローカル開発環境のみ（デプロイ不要）
D) おまかせ
X) Other:

[Answer]:A

---

## Q7: セキュリティ要件（Extension）

セキュリティ拡張ルール（SECURITY-01〜15）を本プロジェクトに適用しますか？

A) Yes — すべてのSECURITYルールをブロッキング制約として強制する（本番グレードアプリ推奨）
B) No — SECURITYルールをスキップする（PoC・プロトタイプ向け）
X) Other:

[Answer]:B

---

回答が完了したら、チャットで「回答しました」とお知らせください。
