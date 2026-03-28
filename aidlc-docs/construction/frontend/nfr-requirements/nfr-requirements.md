# NFR Requirements — Unit 2: frontend

## スコープ・前提

| 項目 | 内容 |
|---|---|
| ユニット | Unit 2: frontend（Next.js 15 + App Router + shadcn/ui + Supabase + Jotai + React Query） |
| フェーズ | Phase 1（MVP） |
| デプロイ先 | Vercel |
| 想定ユーザー規模 | 〜100ユーザー（バックエンド NFR-02 準拠） |
| 言語対応 | 日本語のみ（i18n 対応なし） |

---

## NFR-FE-01: パフォーマンス

### 方針

| 指標 | 目標 | 根拠 |
|---|---|---|
| 数値目標 | 設定しない | Q1: C — 主観的に「速く感じる」程度で十分 |
| 指標収集 | Vercel SpeedInsights（自動計測） | Vercel 標準ツールで随時確認 |

**Phase 1 実装方針**:
- Vercel の Edge Network（CDN）を活用し、静的アセットのキャッシュは自動化
- Next.js の `<Image>` コンポーネントで画像最適化（WebP 変換・遅延ロード）を自動適用
- Server Components で初期 HTML を軽量化（不要な JS を削減）
- 意図的なパフォーマンスチューニングは Phase 2 以降で対応

**除外事項**:
- Lighthouse スコア CI チェックは実施しない
- バンドルアナライザーは導入しない（Q7: A）

---

## NFR-FE-02: スケーラビリティ

### 方針

| 項目 | 内容 |
|---|---|
| インフラスケーリング | Vercel の自動スケーリングに完全依存 |
| フロントエンド負荷 | 静的アセットは Vercel CDN 配信のため直接の負荷なし |
| API 負荷 | バックエンド（Cloud Run）の NFR-02 に準拠 |

**Phase 1 容量設計**:
- 〜100ユーザー同時接続はバックエンドで制限されるため、フロントエンドのスケール設計は不要
- Supabase Realtime の同時接続数: Supabase Free プランの上限（200同時接続）で十分

---

## NFR-FE-03: 可用性・信頼性

### 稼働率目標

| コンポーネント | 目標 | 根拠 |
|---|---|---|
| Vercel（フロントエンド） | 99.99%（プロバイダー提供） | 外部依存 |
| 全体サービス | ベストエフォート | バックエンド NFR-03 準拠 |

### エラーバウンダリー戦略

| 方針 | 内容 | 根拠 |
|---|---|---|
| Error Boundary 方式 | Next.js App Router の `error.tsx` を使用 | Q9: D |
| 設置単位 | ルートセグメント単位（ページレベル） | App Router のファイル規約に準拠 |

**実装ルール**:
- 各ページディレクトリに `error.tsx` を配置（App Router 規約）
- `error.tsx` は `'use client'` で実装し、`reset()` 関数で再試行可能にする
- グローバルフォールバックは `app/error.tsx` で対応
- コンポーネント単位の Error Boundary は実装しない（Phase 1 スコープ外）

```
app/
  error.tsx                  ← グローバルフォールバック
  seeds/[id]/error.tsx       ← SeedDetail エラー
  louges/[id]/error.tsx      ← LougeDetail エラー
  profile/[userId]/error.tsx ← Profile エラー
```

---

## NFR-FE-04: セキュリティ

### 認証・認可

| レイヤー | 方針 | 根拠 |
|---|---|---|
| Supabase Auth | クライアントサイドセッション管理（`@supabase/ssr`） | App Router SSR 対応 |
| 保護ルート | ミドルウェア（`middleware.ts`）でサーバーサイドにリダイレクト | FBR-01 準拠 |
| JWT 検証 | バックエンドで実施（フロントは Bearer トークンを送付するのみ） | バックエンド NFR-04 準拠 |

**オープンリダイレクト防止**（FBR-01 実装ルール）:
- `redirect` クエリパラメータは同一オリジン URL のみ許可
- `new URL(redirect).origin !== window.location.origin` の場合はルートにリダイレクト

### CSP（Content Security Policy）

Phase 1 では CSP ヘッダーの設定は行わない。Phase 2 のセキュリティ強化時に対応。

### 環境変数管理

| 変数 | 公開範囲 | 用途 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | クライアント公開 | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | クライアント公開 | Supabase 匿名キー |
| `NEXT_PUBLIC_API_BASE_URL` | クライアント公開 | バックエンド API URL |
| `BACKEND_API_SECRET` | サーバーのみ | サーバーコンポーネントからの内部 API 呼び出し（必要な場合） |

---

## NFR-FE-05: モニタリング・オブザービリティ

### ツール

| ツール | 用途 | 根拠 |
|---|---|---|
| Vercel Analytics | ページビュー・パフォーマンス実測 | Q10: B |
| Vercel SpeedInsights | Core Web Vitals 実測 | Q10: B |
| Vercel ログ | デプロイログ・関数エラー | Q10: B |

**除外事項（Phase 1）**:
- Sentry は導入しない（コンソールエラーは Vercel ログで確認）
- カスタムアラートは設定しない

---

## NFR-FE-06: デザインシステム

### shadcn/ui 採用方針

| 項目 | 内容 |
|---|---|
| ライブラリ | shadcn/ui（Radix UI + Tailwind CSS ベース） |
| 採用理由 | デザイン統一性の重視。アクセシブルなプリミティブ、カスタマイズ可能なコンポーネント |
| コード生成先 | `src/components/ui/`（shadcn/ui CLI で生成・プロジェクトコードとして管理） |
| テーマ | `tailwind.config.ts` の `theme.extend` で Works Logue ブランドカラーを定義（FBR-10 準拠） |

**使用するコンポーネント（予定）**:
- Button / Card / Badge / Avatar / Skeleton / Toast（Sonner）
- Dialog（Modal）/ Tooltip / DropdownMenu / Separator
- Input / Textarea / Select / Form（React Hook Form 連携）
- Progress

**カスタムコンポーネントとの関係**:
- shadcn/ui が提供するコンポーネントは `components/ui/` を使用
- GrowthIndicator（FC-09）のような業務固有コンポーネントは `features/` 配下で実装
- shadcn/ui コンポーネントをラップしたカスタマイズは `components/ui/` 内で管理

---

## NFR-FE-07: 保守性・開発品質

### テスト戦略

| 種別 | 内容 | 根拠 |
|---|---|---|
| テスト | 不要（Phase 1 はスピード優先） | Q6: A |
| 型安全性 | TypeScript strict モードを使用（`"strict": true`） | 開発品質の最低保証 |
| Linting | ESLint（`eslint-config-next`）+ Prettier | コード品質統一 |

**TypeScript 設定**:
- `tsconfig.json` の `"strict": true` は必須
- `noUncheckedIndexedAccess: true` を推奨
- API レスポンス型は `aidlc-docs/construction/backend` の domain entities と一致させる

### コード品質ツール

| ツール | 用途 |
|---|---|
| ESLint (`eslint-config-next`) | Next.js 固有のルールを含む Lint |
| Prettier | コードフォーマット統一 |
| TypeScript strict | 型安全性保証 |

---

## NFR-FE-08: ユーザビリティ・アクセシビリティ

### アクセシビリティ

| 方針 | 内容 | 根拠 |
|---|---|---|
| 要件レベル | Phase 1 は要件なし | Q5: A |
| 最低保証 | セマンティック HTML の自然な使用（明示的な要件ではなく実装慣習） | 将来の対応を困難にしない |

**除外事項（Phase 1）**:
- WCAG 準拠チェックは実施しない
- aria-label 等の ARIA 属性は必須としない
- axe-core などの自動チェックは CI に組み込まない

---

## NFR-FE-09: SEO

### 方針

| 対応範囲 | 内容 | 根拠 |
|---|---|---|
| `<title>` | 全ページに固有タイトルを設定（Next.js Metadata API） | Q3: B |
| `<meta description>` | 全ページに設定 | Q3: B |
| Open Graph / Twitter Card | 対応しない（Phase 1 スコープ外） | Q3: B |
| サイトマップ | 対応しない | Q3: B |
| robots.txt | デフォルト（全クロール許可） | Q3: B |

**Metadata 実装（App Router 規約）**:
```typescript
// app/seeds/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const seed = await getSeed(params.id)
  return {
    title: `${seed.title} | Works Logue`,
    description: seed.content.slice(0, 160),
  }
}
```

---

## NFR-FE-10: レンダリング戦略

### Next.js App Router 方針

| 方針 | 内容 | 根拠 |
|---|---|---|
| デフォルト | Server Components + Client Components の混在 | Q2: D |
| `'use client'` 指定 | インタラクティブ・状態管理・Realtime が必要なコンポーネントのみ | App Router ベストプラクティス |

**コンポーネント分類方針**:

| コンポーネント種別 | レンダリング | 理由 |
|---|---|---|
| SeedFeedPage（初期表示） | Server Component | 初期データを fetch して HTML に含める |
| SeedCard リスト | 無限スクロール部分は Client Component | Intersection Observer が必要 |
| SeedDetailPage（初期表示） | Server Component | SEO + 初期表示速度 |
| GrowthIndicator（Realtime） | Client Component | Supabase Realtime 購読が必要 |
| LougeListPage（検索） | Client Component | デバウンス検索・状態管理が必要 |
| LougeDetailPage（初期表示） | Server Component | SEO + 初期表示速度 |
| AuthProvider | Client Component | Supabase Auth SDK が必要 |
| NotificationDropdown | Client Component | Realtime + 状態管理が必要 |
| SeedFormPage | Client Component | マルチステップフォーム・Jotai が必要 |

---

## NFR-FE-11: React Query キャッシュ設定

### 設定方針

| 設定 | 値 | 根拠 |
|---|---|---|
| `staleTime` | 0（デフォルト） | Q4: A — シンプルを優先 |
| `gcTime` | 5分（デフォルト） | Q4: A — シンプルを優先 |
| `retry` | 3（デフォルト） | デフォルト維持 |

**Phase 1 方針**:
- QueryClient 設定はデフォルトのまま使用
- クエリキーは `['resource', id]` の形式で統一
- Supabase Realtime によるリアルタイム更新で「古いデータ」問題は軽減される設計

---

## NFR-FE-12: 国際化（i18n）

### 方針

| 項目 | 内容 | 根拠 |
|---|---|---|
| Phase 1 対応 | 日本語のみ（i18n 対応なし） | Q8: A（変更） |
| ライブラリ | 不要 | |
| ロケールプレフィックス | 不要 | |

**除外事項（Phase 1）**:
- next-intl は導入しない
- 翻訳ファイルは作成しない
- ロケールルーティング（`/ja/...`）は実装しない
- すべての UI テキストは日本語ハードコードで実装

