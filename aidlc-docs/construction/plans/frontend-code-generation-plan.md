# Code Generation Plan — Unit 2: frontend

## ユニット概要

| 項目 | 内容 |
|---|---|
| ユニット名 | frontend |
| フレームワーク | Next.js 15 (App Router) + TypeScript 5 |
| コード配置 | `frontend/` (ワークスペースルート直下) |
| ドキュメント | `aidlc-docs/construction/frontend/code/` |
| 担当ストーリー | 30ストーリー（US-000〜US-702 の Frontend 実装） |

## 依存関係

| 依存先 | 種別 | 用途 |
|---|---|---|
| backend (Unit 1) | 内部 | REST API (Cloud Run) |
| Supabase | 外部 | Auth + DB + Realtime |
| Vercel | インフラ | ホスティング + CI/CD |

---

## ストーリートレーサビリティ

| ステップ | 実装ストーリー |
|---|---|
| Step 2 (Types) | — (全ストーリー基盤) |
| Step 3 (Infrastructure) | — (全ストーリー基盤) |
| Step 4 (Layout) | US-101, US-102 (認証フロー基盤) |
| Step 5 (UI Components) | — (全ページ基盤) |
| Step 6 (Auth) | US-101, US-102, US-103 |
| Step 7 (Seed Feature) | US-000, US-201, US-202, US-203, US-204, US-304, US-501, US-502, US-503 |
| Step 8 (Log Feature) | US-301, US-302, US-303, US-304, US-306 |
| Step 9 (Louge Feature) | US-001, US-402, US-403, US-404, US-405, US-406, US-501 |
| Step 10 (Profile Feature) | US-103, US-601, US-602, US-603, US-604 |
| Step 11 (Notification Feature) | US-305, US-701, US-702 |
| Step 12 (Loading & Errors) | — (全ページ品質) |
| Step 13 (Deployment) | — (インフラ設定) |

---

## 実行ステップ

### Step 1: プロジェクト構造セットアップ
- [ ] `frontend/package.json` — 依存パッケージ定義
- [ ] `frontend/tsconfig.json` — TypeScript 設定（strict: true, path aliases）
- [ ] `frontend/next.config.ts` — セキュリティヘッダー + 設定
- [ ] `frontend/tailwind.config.ts` — デザインシステム設定
- [ ] `frontend/postcss.config.mjs` — PostCSS 設定
- [ ] `frontend/.env.local.example` — 環境変数テンプレート
- [ ] `frontend/.eslintrc.json` — ESLint 設定
- [ ] `frontend/.prettierrc` — Prettier 設定
- [ ] `frontend/.gitignore` — Git 除外設定

### Step 2: 共通型定義
- [ ] `frontend/src/types/index.ts` — 全エンティティ TypeScript 型（User, Profile, Seed, Log, Louge, Notification, Tag, Badge, Score）

### Step 3: インフラレイヤー実装
- [ ] `frontend/src/lib/supabase/browser-client.ts` — Client Component 用 Supabase クライアント（LC-FE-01）
- [ ] `frontend/src/lib/supabase/server-client.ts` — Server Component 用 Supabase クライアント（LC-FE-01）
- [ ] `frontend/src/lib/api/types.ts` — API レスポンス型・ApiError クラス
- [ ] `frontend/src/lib/api/server.ts` — Server Components 用 API クライアント（LC-FE-02）
- [ ] `frontend/src/lib/api/client.ts` — Client Components / React Query 用 API クライアント（LC-FE-02）
- [ ] `frontend/src/lib/query-client.ts` — TanStack Query QueryClient 設定（LC-FE-03）
- [ ] `frontend/src/store/atoms.ts` — Jotai atoms 集約（LC-FE-04）
- [ ] `frontend/src/middleware.ts` — 認証ガード Middleware（LC-FE-06, P-FE-05）

### Step 4: ルートレイアウト・プロバイダー
- [ ] `frontend/src/app/providers.tsx` — QueryClient + Jotai + AuthProvider ラッパー（LC-FE-03）
- [ ] `frontend/src/app/layout.tsx` — ルートレイアウト（HTML meta, Providers, Header, Analytics/SpeedInsights）
- [ ] `frontend/src/app/page.tsx` — ルート `/` → `/seeds` リダイレクト
- [ ] `frontend/src/app/error.tsx` — グローバル Error Boundary（LC-FE-10）

### Step 5: 共通 UI コンポーネント
- [ ] `frontend/src/components/ui/button.tsx` — shadcn/ui Button（variants: default/outline/ghost/destructive）
- [ ] `frontend/src/components/ui/card.tsx` — shadcn/ui Card
- [ ] `frontend/src/components/ui/avatar.tsx` — shadcn/ui Avatar
- [ ] `frontend/src/components/ui/badge.tsx` — shadcn/ui Badge
- [ ] `frontend/src/components/ui/toast.tsx` + `toaster.tsx` — shadcn/ui Toast
- [ ] `frontend/src/components/ui/skeleton.tsx` — shadcn/ui Skeleton
- [ ] `frontend/src/components/ui/modal.tsx` — shadcn/ui Dialog ラッパー
- [ ] `frontend/src/components/ui/tooltip.tsx` — shadcn/ui Tooltip
- [ ] `frontend/src/components/ui/progress.tsx` — shadcn/ui Progress
- [ ] `frontend/src/components/ui/infinite-scroll-trigger.tsx` — IntersectionObserver ラッパー（data-testid付）
- [ ] `frontend/src/lib/utils.ts` — cn() ユーティリティ（clsx + tailwind-merge）

### Step 6: Skeleton コンポーネント群（LC-FE-09）
- [ ] `frontend/src/components/ui/skeletons/SeedCardSkeleton.tsx`
- [ ] `frontend/src/components/ui/skeletons/SeedDetailSkeleton.tsx`
- [ ] `frontend/src/components/ui/skeletons/LogItemSkeleton.tsx`
- [ ] `frontend/src/components/ui/skeletons/LougeCardSkeleton.tsx`
- [ ] `frontend/src/components/ui/skeletons/LougeDetailSkeleton.tsx`
- [ ] `frontend/src/components/ui/skeletons/ProfileHeaderSkeleton.tsx`
- [ ] `frontend/src/components/ui/skeletons/ScoreBreakdownSkeleton.tsx`

### Step 7: 認証フィーチャー（US-101, US-102, US-103）
- [ ] `frontend/src/features/auth/components/AuthProvider.tsx` — セッション管理 + Realtime 通知チャネル（LC-FE-05, P-FE-03）
- [ ] `frontend/src/app/(auth)/login/page.tsx` — ログインページ（メール + Google）
- [ ] `frontend/src/app/(auth)/register/page.tsx` — 登録ページ
- [ ] `frontend/src/app/(auth)/layout.tsx` — 認証レイアウト（未認証ユーザー専用）

### Step 8: Seed フィーチャー（US-000, US-201〜US-204, US-304, US-501〜503）
- [ ] `frontend/src/features/seed/components/GrowthIndicator.tsx` — SVG アニメーション成長ビジュアライザー（FC-09, Framer Motion）
- [ ] `frontend/src/features/seed/hooks/useSeedRealtime.ts` — Seed + Louge Realtime 購読フック（LC-FE-07, P-FE-03）
- [ ] `frontend/src/features/seed/components/SeedFeedPage.tsx` — 無限スクロール Seed フィード（FC-02）+ `app/seeds/page.tsx`（Server Component wrapper）
- [ ] `frontend/src/features/seed/components/SeedDetailPage.tsx` — Seed 詳細 + LogThread + Realtime（FC-03）+ `app/seeds/[id]/page.tsx`
- [ ] `frontend/src/features/seed/components/SeedFormPage.tsx` — 4ステップ Seed 投稿フォーム（FC-04, React Hook Form + Zod）+ `app/seeds/new/page.tsx`
- [ ] `frontend/src/app/seeds/loading.tsx` — SeedFeed ローディング（LC-FE-11）
- [ ] `frontend/src/app/seeds/[id]/loading.tsx` — SeedDetail ローディング
- [ ] `frontend/src/app/seeds/[id]/error.tsx` — SeedDetail エラーバウンダリー（LC-FE-10）

### Step 9: Log フィーチャー（US-301〜US-303, US-306）
- [ ] `frontend/src/features/log/hooks/useReactionMutation.ts` — リアクション楽観的更新（LC-FE-08, P-FE-04）
- [ ] `frontend/src/features/log/hooks/useReplyMutation.ts` — 返信楽観的更新（LC-FE-08, P-FE-04）
- [ ] `frontend/src/features/log/components/LogThread.tsx` — Log スレッド表示（FC-05: LogItem, ReactionBar, ReplyForm）

### Step 10: Louge フィーチャー（US-001, US-402〜406, US-501）
- [ ] `frontend/src/features/louge/components/LougeListPage.tsx` — 検索 + 無限スクロール（FC-06）+ `app/louges/page.tsx`
- [ ] `frontend/src/features/louge/components/LougeDetailPage.tsx` — Louge 詳細 + Fork ボタン（FC-07）+ `app/louges/[id]/page.tsx`
- [ ] `frontend/src/app/louges/loading.tsx` — LougeList ローディング
- [ ] `frontend/src/app/louges/[id]/loading.tsx` — LougeDetail ローディング
- [ ] `frontend/src/app/louges/[id]/error.tsx` — LougeDetail エラーバウンダリー

### Step 11: Profile フィーチャー（US-103, US-601〜604）
- [ ] `frontend/src/features/profile/components/ProfilePage.tsx` — プロフィール + スコア + バッジ（FC-08）+ `app/profile/[userId]/page.tsx`
- [ ] `frontend/src/app/profile/[userId]/loading.tsx` — Profile ローディング
- [ ] `frontend/src/app/profile/[userId]/error.tsx` — Profile エラーバウンダリー

### Step 12: Notification フィーチャー（US-305, US-701, US-702）
- [ ] `frontend/src/features/notification/components/NotificationDropdown.tsx` — ベルアイコン + ドロップダウン（FC-10）

### Step 13: デプロイメント成果物
- [ ] `frontend/vercel.json` — Vercel プロジェクト設定（Node 20、ビルドコマンド）
- [ ] `frontend/src/app/robots.txt` — SEO robots（Phase 1: index all）
- [ ] ドキュメント: `aidlc-docs/construction/frontend/code/code-summary.md`

---

## ディレクトリ構成（最終形）

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── seeds/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   ├── louges/
│   │   │   ├── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   ├── profile/
│   │   │   └── [userId]/
│   │   │       ├── page.tsx
│   │   │       ├── loading.tsx
│   │   │       └── error.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── error.tsx
│   │   └── providers.tsx
│   ├── features/
│   │   ├── auth/components/AuthProvider.tsx
│   │   ├── seed/
│   │   │   ├── components/ (SeedFeedPage, SeedDetailPage, SeedFormPage, GrowthIndicator)
│   │   │   └── hooks/ (useSeedRealtime)
│   │   ├── log/
│   │   │   ├── components/ (LogThread)
│   │   │   └── hooks/ (useReactionMutation, useReplyMutation)
│   │   ├── louge/components/ (LougeListPage, LougeDetailPage)
│   │   ├── profile/components/ (ProfilePage)
│   │   └── notification/components/ (NotificationDropdown)
│   ├── components/ui/ (shadcn/ui + InfiniteScrollTrigger)
│   │   └── skeletons/ (7 Skeleton コンポーネント)
│   ├── lib/
│   │   ├── supabase/ (browser-client.ts, server-client.ts)
│   │   ├── api/ (server.ts, client.ts, types.ts)
│   │   ├── query-client.ts
│   │   └── utils.ts
│   ├── store/atoms.ts
│   ├── types/index.ts
│   └── middleware.ts
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.local.example
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── vercel.json
```

---

## 生成ファイル数サマリー

| カテゴリ | ファイル数 |
|---|---|
| プロジェクト設定 | 9 |
| 共通型・ユーティリティ | 2 |
| インフラレイヤー | 8 |
| ルートレイアウト | 4 |
| 共通 UI | 11 |
| Skeleton | 7 |
| 認証フィーチャー | 4 |
| Seed フィーチャー | 8 |
| Log フィーチャー | 3 |
| Louge フィーチャー | 5 |
| Profile フィーチャー | 3 |
| Notification フィーチャー | 1 |
| デプロイメント | 3 |
| **合計** | **68** |
