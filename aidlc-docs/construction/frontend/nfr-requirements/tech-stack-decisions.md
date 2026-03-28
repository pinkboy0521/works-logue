# Tech Stack Decisions — Unit 2: frontend

## 確定スタック

| レイヤー | 技術 | バージョン | 選定理由 |
|---|---|---|---|
| フレームワーク | Next.js | 15.x（App Router） | Q2: D — Server/Client Components 混在、Vercel 最適化 |
| 言語 | TypeScript | 5.x（strict: true） | 型安全性を最低保証として維持 |
| UI | React | 19.x | Next.js 15 に同梱 |
| スタイリング | Tailwind CSS | 3.x | FBR-10 — tailwind.config.ts にデザインシステムを集約 |
| 状態管理 | Jotai | 2.x | フォームステート・グローバル状態（userAtom, seedFormAtom 等） |
| サーバー状態 | TanStack Query（React Query） | 5.x | API キャッシュ・無限スクロール（useInfiniteQuery）|
| Supabase クライアント | `@supabase/ssr` | latest | App Router SSR 対応の公式ライブラリ |
| アニメーション | Framer Motion | 11.x | FC-09 GrowthIndicator SVGアニメーション |
| フォーム | React Hook Form + Zod | latest | SeedFormPage バリデーション（FBR-02） |
| i18n | 不要 | — | Q8: A — 日本語のみ、next-intl は使用しない |
| UI コンポーネント | shadcn/ui | latest | デザイン統一性。Radix UI + Tailwind ベース、コードは src/components/ui/ に生成 |
| アイコン | Lucide React | latest | FBR-10 — 絵文字不使用のため SVG アイコンライブラリ（shadcn/ui デフォルト） |
| Markdown | react-markdown | 9.x | LougeDetailPage の Louge コンテンツ表示 |

---

## デプロイ・インフラ

| 項目 | 内容 | 根拠 |
|---|---|---|
| ホスティング | Vercel | 要件書・Workflow Planning で確定済み |
| CDN | Vercel Edge Network（自動） | 静的アセット配信 |
| 画像最適化 | Next.js `<Image>`（自動） | WebP 変換・遅延ロード |
| モニタリング | Vercel Analytics + SpeedInsights | Q10: B |
| CI/CD | Vercel の GitHub 連携（自動デプロイ） | main ブランチへのマージで本番デプロイ |

---

## 開発ツール

| ツール | 用途 | 設定 |
|---|---|---|
| ESLint | コード品質 | `eslint-config-next` |
| Prettier | フォーマット統一 | `.prettierrc` でプロジェクト統一 |
| TypeScript | 型安全性 | `tsconfig.json` の `"strict": true` |

---

## 除外・見送り決定

| 技術 | 理由 |
|---|---|
| Sentry | Q10: B — Phase 1 は Vercel ログのみで十分 |
| Storybook | Q6: A — Phase 1 はテスト不要 |
| Playwright / Vitest | Q6: A — Phase 1 はテスト不要 |
| @next/bundle-analyzer | Q7: A — デフォルトコード分割のみ |
| next/dynamic（明示的遅延ロード） | Q7: A — デフォルト設定で十分 |
| axe-core（a11y チェック） | Q5: A — Phase 1 は a11y 要件なし |
| サイトマップ / Open Graph | Q3: B — title/meta のみ |
| next-intl | Q8: A — 日本語のみ、i18n 不要 |

---

## ディレクトリ構成方針（App Router）

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    seeds/
      page.tsx          ← SeedFeedPage（Server Component）
      new/page.tsx      ← SeedFormPage（Client Component）
      [id]/
        page.tsx        ← SeedDetailPage（Server Component）
        error.tsx       ← Error Boundary
    louges/
      page.tsx          ← LougeListPage（Client Component）
      [id]/
        page.tsx        ← LougeDetailPage（Server Component）
        error.tsx       ← Error Boundary
    profile/
      [userId]/
        page.tsx        ← ProfilePage（Server Component）
        error.tsx       ← Error Boundary
    layout.tsx          ← AuthProvider + Header
    error.tsx           ← グローバル Error Boundary
    page.tsx            ← / → /seeds にリダイレクト
  features/
    auth/components/
    seed/components/
    log/components/
    louge/components/
    profile/components/
    notification/components/
  components/
    ui/                 ← Button / Card / Avatar / Toast 等
  lib/
    supabase/           ← Supabase クライアント初期化
    query-client.ts     ← QueryClient 設定
  store/
    atoms.ts            ← Jotai atoms 集約
  types/
    index.ts            ← 共通 TypeScript 型定義
```

---

## パッケージバージョン一覧（package.json 参考）

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0",
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "^2.0.0",
    "@tanstack/react-query": "^5.0.0",
    "jotai": "^2.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "framer-motion": "^11.0.0",
    "lucide-react": "latest",
    "react-markdown": "^9.0.0",
    "tailwindcss": "^3.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest",
    "tw-animate-css": "latest"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.0.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0"
  }
}
```

