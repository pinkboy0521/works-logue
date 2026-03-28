# NFR Requirements Plan — Unit 2: frontend

## 実行ステップ

- [x] Step 1: Functional Design アーティファクト分析（FC-01〜FC-10、FBR-01〜10）
- [x] Step 2: NFR Requirements 計画作成
- [x] Step 3: NFR 質問生成（スケーラビリティ / パフォーマンス / 可用性 / セキュリティ / テスト）
- [x] Step 4: プランをファイル保存
- [x] Step 5: ユーザー回答を収集・曖昧さ分析（全10問 — 曖昧さなし）
- [x] Step 6: NFR Requirements アーティファクト生成（nfr-requirements.md + tech-stack-decisions.md）

---

## 質問

以下の質問に回答してください（[Answer]: タグに記入）。

---

### Q1: Core Web Vitals / パフォーマンス目標

Vercel デプロイの Next.js フロントエンドについて、パフォーマンス目標を教えてください。

A) Lighthouse スコア 90+ を目標（LCP < 2.5s、CLS < 0.1、INP < 200ms）
B) Lighthouse スコア 70〜80 を目標（MVP として及第点であれば十分）
C) 特に数値目標は設定しない（主観的に「速く感じる」程度で十分）
D) Vercel Analytics / SpeedInsights で実測してから判断したい

[Answer]:C

---

### Q2: Next.js ページレンダリング戦略

SeedFeedPage・LougeListPage・LougeDetailPage などの公開ページのレンダリング方式を教えてください。

A) すべて CSR（Client-Side Rendering）— シンプルな実装を優先
B) 一覧ページは SSR（Server-Side Rendering）、詳細ページは ISR（Incremental Static Regeneration）
C) すべて SSR — SEO を重視し、毎回サーバーサイドでレンダリング
D) Next.js App Router のデフォルト（Server Components + Client Components の混在）で柔軟に対応

[Answer]:D

---

### Q3: SEO 対応の優先度

SeedDetail・LougeDetail などの公開コンテンツページへの SEO 対応の優先度を教えてください。

A) フェーズ1は SEO 不要（クローズドベータ的な位置付け）
B) 基本的な `<title>` + `<meta description>` のみ設定（最低限）
C) Open Graph / Twitter Card も含めた SNS シェア対応まで実施
D) サイトマップ + robots.txt + 構造化データまで完全対応

[Answer]:B

---

### Q4: React Query キャッシュ戦略

React Query（TanStack Query）の staleTime / gcTime について、方針を教えてください。

A) デフォルト設定を使用（staleTime: 0、gcTime: 5分）— シンプルを優先
B) フィードは短め（staleTime: 30秒）、Louge 詳細は長め（staleTime: 5分）と使い分け
C) 全クエリ共通で staleTime: 1分、gcTime: 10分に設定
D) キャッシュは後で調整するので、フェーズ1はデフォルトで問題ない

[Answer]:A

---

### Q5: アクセシビリティ（a11y）の要件

フェーズ1のアクセシビリティ対応レベルを教えてください。

A) 特に要件なし（フォーカス管理・ARIAなどは後回し）
B) セマンティック HTML の使用のみ（ARIA ラベルなどは最低限）
C) WCAG 2.1 AA レベル準拠を目指す（スクリーンリーダー対応・キーボードナビゲーション）
D) WCAG 2.1 AA + 色コントラスト比の自動チェック（axe-core など）を CI に組み込む

[Answer]:A

---

### Q6: フロントエンドのテスト戦略

フロントエンドのテスト方針を教えてください。

A) テストは不要（フェーズ1はスピード優先）
B) コンポーネント単体テストのみ（Vitest + Testing Library）
C) 単体テスト + E2E テスト（Playwright で主要フロー: ログイン / Seed 投稿 / Log 投稿）
D) 単体テスト + Visual Regression テスト（Storybook + Chromatic 等）

[Answer]:A

---

### Q7: バンドルサイズ・コード分割の方針

Next.js のコード分割・バンドル最適化について教えてください。

A) Next.js デフォルトのコード分割のみ（追加最適化は不要）
B) 重いライブラリ（Framer Motion、SVG アニメーション等）は動的インポート（`next/dynamic`）で遅延ロード
C) バンドルアナライザー（@next/bundle-analyzer）を導入して継続的に監視
D) BとCの両方（動的インポート + バンドル監視）

[Answer]:A

---

### Q8: 国際化（i18n）の要件

フェーズ1の言語対応について教えてください。

A) 日本語のみ（i18n 対応不要）
B) 日本語 + 英語の2言語（next-intl 等で対応）
C) フェーズ1は日本語のみ、フェーズ2で i18n を考慮した設計にしておきたい
D) その他

[Answer]:B

---

### Q9: エラーバウンダリー（Error Boundary）の設計

React の Error Boundary 戦略を教えてください。

A) グローバル Error Boundary のみ（アプリ全体をラップ）
B) ページ単位で Error Boundary を設置
C) コンポーネント単位で細かく設置（SeedFeedPage / LougeListPage / SeedDetailPage それぞれ）
D) Next.js の `error.tsx` ファイル規約（App Router）を使い、ルートセグメント単位で管理

[Answer]:D

---

### Q10: フロントエンドのモニタリング・エラー追跡

フェーズ1のフロントエンドエラー追跡の方針を教えてください。

A) 不要（コンソールログで十分）
B) Vercel の標準ログ・Analytics のみ使用
C) Sentry（無料プラン）を導入してブラウザエラーを収集
D) Vercel Analytics + Sentry の組み合わせ

[Answer]:B

