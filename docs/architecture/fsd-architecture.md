# FSD アーキテクチャ

Works Logue プロジェクトにおける Feature-Sliced Design (FSD) の実装ガイドです。

## 📋 概要

Feature-Sliced Design は、フロントエンドアプリケーションの体系的な設計方法論です。Works Logue では、保守性・スケーラビリティ・チーム開発効率の向上を目的として FSD を採用しています。

## 🏗️ レイヤー構造

### 基本原則

**下位レイヤーほど再利用性・汎用性が高く、上位レイヤーほどアプリ固有・画面寄りの責務を持ちます。**

### 1. Shared (`src/shared/`)

**アプリ全体で再利用される、ドメイン非依存の共通要素**

```
src/shared/
├── ui/          # 再利用可能なUIコンポーネント
│   └── shadcn/  # shadcn/ui コンポーネント
├── lib/         # ユーティリティ関数・共通ヘルパー
│   ├── prisma.ts     # Prisma クライアント
│   ├── shadcn.ts     # shadcn/ui ユーティリティ
│   └── theme.ts      # テーマ管理
├── config/      # 環境変数・グローバル設定
└── api/         # 基盤となるAPIクライアント設定
```

**使用例**:

```typescript
import { Button, Card, cn } from "@/shared";
import { prisma } from "@/shared";
```

### 2. Entities (`src/entities/`)

**ビジネスドメインの「エンティティ（概念）」を表現・管理**

```
src/entities/
├── article/             # 記事エンティティ
│   ├── api/            # 記事 CRUD 操作
│   ├── model/          # 型定義・バリデーション
│   └── lib/            # 記事固有のビジネスロジック
├── article-like/       # いいねエンティティ
├── article-bookmark/   # ブックマークエンティティ
├── user/               # ユーザーエンティティ
├── topic/              # トピックエンティティ
└── tag/                # タグエンティティ
```

**特徴**:

- 各エンティティは独立したスライス
- `api/`, `model/`, `lib/` の3つのセグメントで構成
- ビジネスロジックとデータアクセスを担当

**使用例**:

```typescript
import { getArticleById, type ArticleWithDetails } from "@/entities";
import { createArticleLike, isArticleLikedByUser } from "@/entities";
```

### 3. Features (`src/features/`)

**ユーザーが「何かをできる」単位の機能**

```
src/features/
├── article-reaction/   # リアクション機能（いいね・ブックマーク）
│   ├── api/           # Server Actions
│   ├── lib/           # 認証・データ拡張ヘルパー
│   └── ui/            # リアクション UI コンポーネント
├── auth/              # 認証機能
├── article-editor/    # 記事編集機能
├── comment-system/    # コメント機能
└── profile/           # プロフィール管理
```

**特徴**:

- 複数ページで使用される機能
- ユーザーのアクションを実現
- entities を組み合わせてより高レベルな機能を提供

**使用例**:

```typescript
import { ArticleReactions, enrichArticlesWithReactions } from "@/features";
import { toggleArticleLike, toggleArticleBookmark } from "@/features";
```

### 4. Widgets (`src/widgets/`)

**entity や feature を組み合わせた、独立した UI ブロック**

```
src/widgets/
├── header/            # ヘッダーウィジェット
├── article-list/      # 記事一覧ウィジェット
│   └── ui/
│       ├── ArticleList.tsx     # 一覧コンテナ
│       ├── ArticleCard.tsx     # 記事カード
│       └── ArticleListSkeleton.tsx # ローディング
├── article-detail/    # 記事詳細ウィジェット
└── comment-section/   # コメントセクション
```

**特徴**:

- ページを構成する大きなUI ブロック
- エラー境界・ローディング状態を含む
- features と entities を組み合わせ

**使用例**:

```typescript
import { Header, ArticleList, ArticleDetail } from "@/widgets";
```

### 5. Pages (`src/pages/`)

**画面単位でアプリケーションを構成**

```
src/pages/
├── home-page/         # ホームページ
├── article-detail-page/ # 記事詳細ページ
├── bookmark-list-page/ # ブックマーク一覧
├── liked-articles-page/ # いいね一覧
└── auth-pages/        # 認証関連ページ
```

**特徴**:

- widgets を組み合わせてページを構成
- データローダー（SSR）を含む
- ページ専用ロジックのみ

**使用例**:

```typescript
import { HomePage, ArticleDetailPage } from "@/pages";
```

### 6. App (`src/app/`)

**アプリケーション起動に関するすべて**

```
src/app/
├── providers/         # グローバルプロバイダー
├── layout/            # アプリケーション全体レイアウト
└── styles/            # グローバルスタイル
```

**Next.js App Router との統合**:

```typescript
// app/layout.tsx (Next.js)
import { AppLayout } from "@/app/layout";

// app/page.tsx (Next.js)
import { HomePage } from "@/pages";
```

## 📐 セグメント構造

各レイヤー・スライス内は以下の4つのセグメントで構成：

### ui セグメント

**各レイヤーでの役割**:

- **shared**: 汎用 UI コンポーネント
- **entities**: ビジネスモデルのスケルトン UI
- **features**: インタラクティブな機能 UI
- **widgets**: 組み合わせた UI ブロック
- **pages**: 完成されたページ UI

### model セグメント

**データモデル・バリデーション・ビジネスロジック**:

- **shared**: 使用しない（×）
- **entities**: エンティティのデータ操作
- **features**: 必要に応じてビジネスロジック
- **widgets**: 軽量な状態管理
- **pages**: 基本的に使用しない

### lib セグメント

**ライブラリコード・ユーティリティ関数**:

- **shared**: アプリ全体で使用される汎用関数
- **entities**: エンティティ操作用の関数
- **features**: 機能固有のヘルパー関数
- **widgets**: UI ブロック用の補助コード
- **pages**: ページ専用ロジック

### api セグメント

**バックエンドとのやり取り**:

- **shared**: 基盤 API クライアント
- **entities**: エンティティ関連 API メソッド
- **features**: 機能提供 API（Server Actions）
- **widgets**: 基本的に使用しない
- **pages**: SSR用データローダー

## 🔗 インポートルール

### 基本原則

1. **レイヤー間**: 上位→下位のみ（下位→上位は禁止）
2. **スライス間**: 同一レイヤー内での直接インポート禁止
3. **公開 API**: index.ts 経由でのみアクセス
4. **相対 vs 絶対**: 同一スライス内は相対、異なるスライスは絶対

### 公開 API パターン

**✅ 正しいインポート**:

```typescript
// 短縮形・公開API経由
import { Button, Card, cn } from "@/shared";
import { getArticleById, type ArticleWithDetails } from "@/entities";
import { ArticleReactions, enrichArticlesWithReactions } from "@/features";
import { Header, ArticleList } from "@/widgets";
import { HomePage } from "@/pages";
```

**❌ 禁止パターン**:

```typescript
// 内部構造への直接アクセス
import { Button } from "@/shared/ui/shadcn/button";
import { getArticleById } from "@/entities/article/api/getById";
import { LikeButton } from "@/features/article-reaction/ui/LikeButton";
```

### 公開 API の設計

**レイヤー別の index.ts 例**:

```typescript
// src/shared/index.ts
export { Button, Card, Input } from "./ui/shadcn";
export { cn } from "./lib/shadcn";
export { prisma } from "./lib/prisma";

// src/entities/index.ts
export {
  getArticleById,
  type ArticleWithDetails,
  type PublishedArticleListItem,
} from "./article";
export {
  createArticleLike,
  isArticleLikedByUser,
  type ArticleLikeStats,
} from "./article-like";

// src/features/index.ts
export { ArticleReactions } from "./article-reaction";
export {
  enrichArticlesWithReactions,
  type ArticleWithReactions,
} from "./article-reaction";
export { toggleArticleLike, toggleArticleBookmark } from "./article-reaction";

// src/widgets/index.ts
export { Header } from "./header";
export { ArticleList, ArticleCard } from "./article-list";
export { ArticleDetail } from "./article-detail";

// src/pages/index.ts
export { HomePage } from "./home-page";
export { ArticleDetailPage } from "./article-detail-page";
export { BookmarkListPage } from "./bookmark-list-page";
```

## 🎯 設計原則

### 1. 低結合・高凝集

- **スライス間**: 独立性を保つ
- **スライス内**: 密結合で一貫性を保つ

### 2. 段階的導入

既存コードからの移行を考慮：

```typescript
// 段階1: 基本の公開API
export { ArticleList } from "./ui/ArticleList";

// 段階2: セグメント拡張
export { ArticleList } from "./ui";
export { enrichArticles } from "./lib";

// 段階3: 完全なFSD準拠
export * from "./ui";
export * from "./lib";
export * from "./model";
```

### 3. ビジネス志向

- **技術名称を避ける**: `utils`, `helpers`, `components`
- **ビジネス用語を使用**: `article`, `user`, `auth`, `search`

### 4. 明示的な依存関係

```typescript
// エンティティ間の関係は @x 表記で明示
export {
  getArticleWithLikes, // @x article-like
  getArticleWithBookmarks, // @x article-bookmark
} from "./article";
```

## 📊 ブックマーク・いいね機能での実装例

### 実際のディレクトリ構造

```
src/
├── entities/
│   ├── article-like/
│   │   ├── api.ts          # CRUD操作
│   │   ├── lib.ts          # 統計・バリデーション
│   │   ├── model.ts        # 型定義・スキーマ
│   │   └── index.ts        # 公開API
│   ├── article-bookmark/   # 同様の構造
│   └── article/
│       ├── api/index.ts    # 記事関連API（@x like, bookmark）
│       └── ...
├── features/
│   └── article-reaction/
│       ├── api/actions.ts  # Server Actions
│       ├── lib/
│       │   ├── auth.ts     # 認証ヘルパー
│       │   └── enrichment.ts # リアクション情報追加
│       ├── ui/
│       │   ├── LikeButton.tsx
│       │   ├── BookmarkButton.tsx
│       │   └── ArticleReactions.tsx
│       └── index.ts        # 公開API
├── widgets/
│   ├── article-list/
│   │   └── ui/
│   │       ├── ArticleList.tsx    # リアクション表示
│   │       └── ArticleCard.tsx    # 横長レイアウト
│   └── article-detail/
│       └── ui/ArticleDetail.tsx   # リアクションUI統合
└── pages/
    ├── bookmark-list-page/        # ブックマーク一覧
    └── liked-articles-page/       # いいね一覧
```

### データフロー

```typescript
// 1. entities でデータアクセス
await createArticleLike(articleId, userId);

// 2. features でビジネスロジック
await toggleArticleLike(formData);

// 3. widgets で UI 表示
<ArticleReactions {...props} />

// 4. pages で統合
<BookmarkListPage />
```

## 🔧 開発のベストプラクティス

### 1. スライス作成手順

1. **entities** から開始（データモデル）
2. **features** で機能実装
3. **widgets** で UI 構築
4. **pages** で統合

### 2. 公開 API の設計

- **必要最小限**: 本当に外部から使われるもののみ
- **明確な命名**: 用途が分かる名前
- **型エクスポート**: TypeScript 型も適切にエクスポート

### 3. 依存関係の管理

```typescript
// 良い例: 明確な依存関係
import { getArticleById } from "@/entities"; // 記事取得
import { enrichWithReactions } from "@/features"; // リアクション拡張

// 悪い例: 循環依存
// features → entities → features (禁止)
```

### 4. テスト戦略

- **entities**: 単体テスト（ビジネスロジック）
- **features**: 統合テスト（ユーザーシナリオ）
- **widgets**: コンポーネントテスト（UI動作）
- **pages**: E2Eテスト（画面遷移）

## 📈 FSD の恩恵

### 開発効率

- **明確な責務分離**: どこに何を書くかが自明
- **再利用性**: 下位レイヤーの資産活用
- **並行開発**: スライス単位での独立開発

### 保守性

- **局所化された変更**: 影響範囲の限定
- **予測可能性**: 変更による影響の把握
- **リファクタリング**: 安全な構造変更

### スケーラビリティ

- **漸進的な機能追加**: 既存に影響しない拡張
- **チーム開発**: スライス単位での作業分担
- **技術的負債の軽減**: 構造的な問題の予防

## 📚 参考資料

- [公式 FSD ドキュメント](https://feature-sliced.design/)
- [Next.js App Router ベストプラクティス](https://nextjs.org/docs)
- [ブックマーク・いいね機能の実装例](../features/bookmark-like-system.md)
