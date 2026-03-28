# NFR Design Plan — Unit 2: frontend

## 実行ステップ

- [x] Step 1: NFR Requirements アーティファクト分析
- [x] Step 2: NFR Design 計画作成
- [x] Step 3: 設計決定が必要な質問を生成
- [x] Step 4: プランをファイル保存
- [x] Step 5: ユーザー回答収集・曖昧さ分析（Q1: C, Q2: C — 曖昧さなし）
- [x] Step 6: NFR Design アーティファクト生成（nfr-design-patterns.md + logical-components.md）

---

## 分析サマリー

NFR Requirements（NFR-FE-01〜12）を踏まえ、以下の設計パターンが必要：

| 設計カテゴリ | 根拠 |
|---|---|
| Loading / Suspense パターン | Server Components + App Router。loading.tsx vs Suspense 境界の使い分け |
| Realtime チャネル管理 | FC-03（seeds/louges）+ FC-10（notifications）で Supabase Realtime を使用 |
| 楽観的更新パターン | FC-05 LogThread のリアクション・返信で React Query Mutation |
| データフェッチ境界 | Server Component と Client Component のデータ取得責務分界 |
| 認証ガード | middleware.ts によるルート保護（NFR-FE-04） |

---

## 質問

以下の2点について回答をお願いします（[Answer]: タグに記入）。

---

### Q1: ローディング状態の実装方針

Server Component の初期ロード中に表示するローディング UI の実装方針を教えてください。

A) Next.js App Router の `loading.tsx` ファイル規約を使用（Suspense 境界を自動設定）
B) ページコンポーネント内で手動 `<Suspense>` + `<Skeleton>` を組み合わせる
C) AとBの併用（ページレベルは `loading.tsx`、サブコンポーネントは手動 Suspense）
D) ローディング UI は不要（サーバーが速いので白画面でも許容）

[Answer]: C

---

### Q2: Supabase Realtime チャネルの管理方針

FC-03（SeedDetailPage: seeds + louges テーブル購読）と FC-10（NotificationDropdown: notifications テーブル購読）の Realtime チャネル管理方針を教えてください。

A) 各コンポーネントが独立してチャネルを作成・クリーンアップ（useEffect 内で subscribe/unsubscribe）
B) グローバルな Realtime マネージャーを作成し、複数コンポーネントでチャネルを共有
C) FC-03 はローカル（コンポーネント単位）、FC-10（通知）はグローバル Jotai atom で状態共有
D) Supabase Realtime は使用しない（React Query の refetchInterval でポーリング）

[Answer]: C
