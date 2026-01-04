# 前提条件

## 基本ルール

- 回答は必ず日本語でしてください
- 大規模な変更（例: 200 行以上）を行う前には、まず変更計画を提案してください
- エラーメッセージや例外が発生した場合は、日本語で説明してください
- コードを生成する際は、必ず既存のコードスタイルに合わせてください
- 新しいライブラリを導入する前には、必ず確認してください
- **`npm run dev` 等の開発サーバー起動コマンドは実行しないでください**

## 禁止コマンド

以下のコマンドは実行しないでください：

- `npm run dev` - 開発サーバー起動
- `npm start` - サーバー起動
- `yarn dev` / `pnpm dev` - 同等の開発コマンド

理由：ターミナルリソースの節約と、不要な長時間実行プロセスの回避のため

## コミュニケーション

- 質問や不明点がある場合は、必ず確認してください
- 複数の解決策がある場合は、それぞれの長所と短所を説明してください

# アプリの概要

## プロジェクト目的

このプロジェクトは「Works Logue」という Next.js ベースの Web アプリケーションで、TypeScript を使用して開発されています。記事投稿やユーザー認証機能を持つブログ系プラットフォームです。

## 主要な技術要素

- **Frontend**: Next.js 15.5.9 (App Router)、React 19、TypeScript
- **Backend**: Next.js API Routes、NextAuth.js v5
- **Database**: PostgreSQL、Prisma ORM
- **Styling**: Tailwind CSS、shadcn/ui、Radix UI
- **UI Strategy**: shadcn/ui を第一選択とする統一 UI 戦略
- **テーマ**: ダークモード・ライトモード完全対応
- **認証**: NextAuth.js、bcryptjs
- **バリデーション**: Zod
- **フォーム管理**: React Hook Form

## プロジェクトの特徴

- モダンな Next.js App Router を使用したフルスタック構成
- Prisma による型安全なデータベース操作
- **shadcn/ui による統一された UI コンポーネント設計**
- **完全なダークモード・ライトモード対応システム**
- NextAuth.js によるセキュアな認証システム
- TypeScript による型安全性の確保

# 技術スタック（エコシステム）

## 使用技術

**言語**: TypeScript、JavaScript
**フレームワーク**: Next.js 15.5.9 (App Router)
**ランタイム**: React 19、Node.js
**パッケージマネージャー**: npm
**データベース**: PostgreSQL
**ORM**: Prisma 6.19.1
**認証**: NextAuth.js 5.0.0-beta.30
**スタイリング**: Tailwind CSS 4、shadcn/ui
**バリデーション**: Zod
**フォーム**: React Hook Form
**UI ライブラリ**: Radix UI
**アイコン**: Lucide React
**マークダウン**: react-markdown、rehype
**暗号化**: bcryptjs
**日付**: date-fns
**リンター**: ESLint 9

## 重要事項

- プロジェクトで使用されていないライブラリは import しないでください
- 既存のバージョンに合わせてライブラリを使用してください
- **UI コンポーネントは shadcn/ui を第一選択として使用してください**
- **新規 UI 要素追加時は、必ず shadcn/ui での実装可能性を検討してください**
- 新しい依存関係を追加する際は、互換性を確認してください
- データベーススキーマの変更は Prisma マイグレーションファイルで管理してください
- Prisma のベストプラクティスに従ってください
- Next.js App Router の規約に従ってファイルを配置してください
- 認証には NextAuth.js v5 を使用し、Credentials プロバイダーを活用してください

# ディレクトリ構成

## 主要ディレクトリ（FSD 準拠）

**重要**: FSD の`app`レイヤーと Next.js の`src/app/`フォルダーは異なる概念です。

### FSD レイヤー構造

- **`src/app/`**: FSD の App レイヤー - アプリケーション起動に関する全て
  - **`providers/`**: グローバルプロバイダー（認証、テーマ、ストアなど）
  - **`layout/`**: アプリケーション全体のレイアウトコンポーネント
  - **`styles/`**: グローバルスタイル
- **`src/pages/`**: FSD の Pages レイヤー - ページ全体のコンポーネント
  - **`home-page/`**: ホームページコンポーネント
  - **`login-page/`**: ログインページコンポーネント
  - **`article-detail-page/`**: 記事詳細ページコンポーネント
- **`src/widgets/`**: FSD の Widgets レイヤー - 大きな自己完結型 UI ブロック
  - **`header/`**: ヘッダーウィジェット
  - **`article-list/`**: 記事リストウィジェット
  - **`article-detail/`**: 記事詳細ウィジェット
- **`src/features/`**: FSD の Features レイヤー - 再利用可能な機能
  - **`auth/`**: 認証機能（ログイン、ログアウト）
  - **`article-editor/`**: 記事編集機能
- **`src/entities/`**: FSD の Entities レイヤー - ビジネスエンティティ
  - **`article/`**: 記事エンティティ（API、型定義）
  - **`user/`**: ユーザーエンティティ
- **`src/shared/`**: FSD の Shared レイヤー - 再利用可能なコード
  - **`ui/`**: UI キット（shadcn/ui 含む）
  - **`lib/`**: ライブラリとユーティリティ関数
  - **`config/`**: 環境変数、グローバル設定

### Next.js App Router 構造

このプロジェクトは Next.js App Router を使用しているため、以下の構造で FSD と統合します：

```
ルート
├── app/               # Next.js App Router（ファイルベースルーティング）
│   ├── (auth)/
│   ├── (public)/
│   └── layout.tsx
├── pages/             # 空のNext.js Pages Router（互換性のため）
└── src/
    ├── app/           # FSDのAppレイヤー（アプリケーション起動）
    ├── pages/         # FSDのPagesレイヤー
    ├── widgets/       # FSDのWidgetsレイヤー
    ├── features/      # FSDのFeaturesレイヤー
    ├── entities/      # FSDのEntitiesレイヤー
    └── shared/        # FSDのSharedレイヤー
```

**重要な分離**:

- `app/` （ルートレベル） = Next.js App Router（ファイルベースルーティング）
- `pages/` （ルートレベル） = 空の Next.js Pages Router（互換性維持）
- `src/app/` = FSD の App レイヤー（アプリケーション起動）
- `src/pages/` = FSD の Pages レイヤー（ページコンポーネント）

この構造により、Next.js のルーティングと FSD のコンポーネントが名前衝突することなく共存できます。

### App Router + Pages Router 互換性

App Router は Pages Router と互換性があるため、将来的に Pages Router が必要になった場合でも、ルートレベルの`pages/`フォルダーを使用できます。現在は空のフォルダーとして維持されています。

## ファイル配置ルール

### Next.js x FSD の統合パターン（App Router）

```typescript
// app/layout.tsx (Next.js App Routerのルートレイアウト)
import { AppLayout } from "@/app";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
```

```typescript
// app/page.tsx (Next.js App Routerのページ)
import { HomePage } from "@/pages/home-page";

export default function Page() {
  return <HomePage />;
}
```

      <BaseLayout>{children}</BaseLayout>
    </AppProviders>

);
}

````

### 配置ルール（App Router）

- **Next.js ルーティング**: ルートレベルの`app/`フォルダーで管理
- **FSD Pages レイヤー**: `src/pages/`にページコンポーネントを作成
- **Next.js ページ**: `app/`から FSD の`src/pages/`をインポート
- **グローバル設定**: FSD の`src/app/`レイヤーに配置
- **ビジネスロジック**: 適切な FSD レイヤー（entities/features）に配置
- **共通コンポーネント**: `src/shared/ui/`に配置

# アーキテクチャ・設計指針

## 採用している設計パターン

- **Next.js App Router**: ファイルベースルーティング
- **Component-Based Architecture**: UI コンポーネントの再利用
- **Server Actions**: サーバーサイド処理とクライアントサイド処理の分離
- **Layered Architecture**: UI 層、ビジネスロジック層、データアクセス層の分離
- **Route Groups**: 論理的なページグループ化（auth、public）
- **Feature-Sliced Design (FSD)**: フロントエンドアプリケーションの体系的な設計方法論

## FSD（Feature-Sliced Design）設計原則

このプロジェクトでは、FSD の設計原則に従ってコードを整理してください。

### レイヤー構造（下位から上位へ）

1. **Shared** (`src/shared/`) - 再利用可能なコード、外部との接続

   - `ui/` - UI キット、ビジネスロジックを含まないコンポーネント
   - `lib/` - ライブラリ、ヘルパー関数（焦点を持った内部ライブラリ）
   - `api/` - API クライアント、バックエンドとのやり取り
   - `config/` - 環境変数、グローバル設定

2. **Entities** (`src/entities/`) - ビジネスエンティティ

   - `user/`, `article/`, `topic/` など
   - 各エンティティは独立したスライスとして構成

3. **Features** (`src/features/`) - ユーザーアクション、再利用可能な機能

   - `auth/`, `article-editor/`, `comment-system/` など
   - 複数ページで使用される機能

4. **Widgets** (`src/widgets/`) - 大きな自己完結型 UI ブロック

   - `header/`, `sidebar/`, `article-card/` など

5. **Pages** (`src/pages/`) - ページ全体またはページの大部分

   - `home/`, `profile/`, `article-detail/` など

6. **App** (`src/app/`) - アプリケーション起動に関するすべて
   - `providers/` - グローバルプロバイダー（認証、テーマ、ストアなど）
   - `layout/` - アプリケーション全体のレイアウトコンポーネント
   - `styles/` - グローバルスタイル
   - `config/` - アプリケーション設定

### FSD App レイヤーと Next.js App Router の統合

Next.js App Router を使用する場合、FSD の App レイヤーと Next.js の`app/`フォルダーは以下のように明確に分離されます：

- **Next.js の`app/`（ルートレベル）**: ファイルベースルーティング
- **FSD の`src/app/`**: アプリケーション全体を包むプロバイダーとレイアウト
- **空の`pages/`（ルートレベル）**: Pages Router との互換性保持

統合パターン：

1. FSD の`src/app/`レイヤーにアプリケーション起動ロジックを配置
2. Next.js の`app/layout.tsx`から FSD の App コンポーネントをインポート
3. 各ページコンポーネントは FSD の`src/pages/`レイヤーで定義し、Next.js のルートファイルからインポート

```typescript
// app/layout.tsx (Next.js App Router)
import { AppLayout } from "@/app/layout";
export default function RootLayout({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

// app/(public)/page.tsx (Next.js App Router)
import { HomePage } from "@/pages";
export default function Page() {
  return <HomePage />;
}
````

### セグメント構造（各スライス内の技術的分割）

- **ui** - UI コンポーネント、表示関連
- **api** - バックエンドとのやり取り、リクエスト関数
- **model** - データモデル、バリデーション、ビジネスロジック
- **lib** - スライス固有のライブラリコード
- **config** - 設定ファイル、フィーチャーフラグ

### インポートルール

#### 基本原則

- **レイヤー間**: 上位レイヤーから下位レイヤーのみインポート可能
- **スライス間**: 同一レイヤー内のスライス間のインポートは禁止
- **公開 API**: 各スライスは公開 API（index.ts）を通じてのみアクセス
- **相対インポート**: 同一スライス内では相対インポートを使用
- **絶対インポート**: 異なるスライス間では絶対インポートを使用

#### 公開 API 経由のインポート方式

このプロジェクトでは、FSD の公開 API 原則に従い、以下のインポートパターンを**必ず**使用してください：

**✅ 推奨パターン（公開 API 経由）**:

```typescript
// レイヤー全体への短縮アクセス
import { HomePage } from "@/pages";
import { Header, ArticleList } from "@/widgets";
import { LoginForm, authenticate } from "@/features";
import { getArticleById, type ArticleWithDetails } from "@/entities";
import { prisma, cn, Button } from "@/shared";
```

**❌ 禁止パターン（内部構造への直接アクセス）**:

```typescript
// 内部構造への直接アクセスは禁止
import { HomePage } from "@/pages/home-page/ui/HomePage";
import { Header } from "@/widgets/header/ui/Header";
import { authenticate } from "@/features/auth/api/authenticate";
import { prisma } from "@/shared/lib/prisma";
```

#### TSConfig 設定

パスエイリアスは最小限に抑制し、公開 API を促進：

```jsonc
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"] // 唯一のエイリアス
    }
  }
}
```

#### レイヤー別の公開 API 例

**Shared 層** (`src/shared/index.ts`):

```typescript
// 明示的なエクスポートで何が利用可能かを明確化
export { prisma } from "./lib/prisma";
export { cn } from "./lib/shadcn";
export { Button, Card, Input } from "./ui/shadcn";
```

**Entities 層** (`src/entities/index.ts`):

```typescript
// 型と関数を明示的にエクスポート
export {
  getArticleById,
  type ArticleWithDetails,
  type ArticleMeta,
} from "./article";
export { getUserById, type UserPublicInfo } from "./user";
```

**インポートの利点**:

- **カプセル化**: 内部構造への不適切なアクセスを防止
- **保守性**: 内部リファクタリングが他のレイヤーに影響しない
- **可読性**: 何が公開されているかが一目で分かる
- **変更安全性**: 公開 API の契約に基づいた安全な変更

### FSD 原則

- **低結合・高凝集**: スライスは独立性を保ち、内部は密結合
- **公開 API**: 各スライスは明確な公開 API を定義
- **ビジネス志向**: レイヤーとスライスの名前はビジネス用語を使用
- **段階的導入**: 既存コードからの段階的移行を許容

## 設計原則

- 単一責任の原則を守ってください
- コンポーネントの再利用性を高めてください
- **shadcn/ui コンポーネントを中心とした一貫性のある UI 設計を心がけてください**
- Server Component と Client Component を適切に使い分けてください
- 型安全性を重視し、TypeScript の恩恵を最大限活用してください
- Prisma スキーマを中心としたデータ駆動設計を採用してください
- FSD のレイヤー構造とインポートルールに従ってください

## コード組織

- FSD のレイヤー・スライス・セグメント構造に従って配置してください
- UI コンポーネントとビジネスロジックを分離してください
- **shadcn/ui コンポーネントを積極的に活用し、統一された UI ライブラリとして使用してください**
- Server Actions と API ルートを適切に使い分けてください
- 認証状態の管理は NextAuth.js のセッションを活用してください
- 各スライスには適切な公開 API（index.ts）を作成してください

# shadcn/ui 設計・使用方針

## 基本方針

このプロジェクトでは shadcn/ui を**UI コンポーネントライブラリの中核**として使用します。すべての新規 UI 開発において、以下の優先順位で検討してください：

1. **第一選択**: shadcn/ui の既存コンポーネント
2. **第二選択**: shadcn/ui コンポーネントのカスタマイズ（variants 使用）
3. **最終手段**: 完全自作（shadcn/ui で対応不可能な場合のみ）

## コンポーネント使用ガイドライン

### 必須使用コンポーネント

以下の UI 要素は**必ず** shadcn/ui コンポーネントを使用してください：

- **フォーム系**: Button, Form, FormField, Input, Label, Textarea
- **カード系**: Card, CardContent, CardHeader, CardFooter, CardTitle
- **ナビゲーション系**: NavigationMenu, DropdownMenu
- **表示系**: Avatar, Badge, Skeleton, Alert
- **レイアウト系**: Dialog, Sheet（将来導入予定）

### variants API の積極活用

shadcn/ui コンポーネントのカスタマイズには variants API を使用し、以下のような一貫した設計を実現してください：

```typescript
// ✅ 推奨: variants を活用した統一デザイン
<Button variant="default">保存</Button>
<Button variant="destructive">削除</Button>
<Button variant="ghost">キャンセル</Button>

<Badge variant="default">公開</Badge>
<Badge variant="secondary">下書き</Badge>
<Badge variant="destructive">削除予定</Badge>
```

### 禁止パターン

```typescript
// ❌ 禁止: 自作の類似コンポーネント
const CustomButton = () => <div className="bg-blue-500 px-4 py-2">...</div>

// ❌ 禁止: shadcn/ui の直接上書き
<Button className="!bg-red-500 !text-white">危険な上書き</Button>

// ❌ 禁止: 不適切な HTML 要素の使用
<span className="inline-block bg-primary text-white px-2 py-1 rounded">
  Badge の代わり
</span>
```

## コンポーネント設定

### 現在の設定（components.json）

```json
{
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide"
}
```

### 公開 API 経由のアクセス

shadcn/ui コンポーネントは必ず `@/shared` 経由でアクセスしてください：

```typescript
// ✅ 正しい
import { Button, Card, Input, Badge } from "@/shared";

// ❌ 禁止
import { Button } from "@/shared/ui/shadcn/button";
```

## 今後の拡張予定

以下のコンポーネントの導入を予定しています：

- **Dialog**: 記事削除確認、設定ダイアログ
- **Toast**: 通知システム
- **Popover**: ヘルプテキスト、補足情報
- **Tabs**: 記事管理画面のタブ切り替え
- **Select**: フォーム選択肢（現在の select 要素を置換）

## デザインシステムの一貫性

- **色彩体系**: shadcn/ui のデザイントークンに従ったカラーパレット
- **タイポグラフィ**: 統一されたフォントサイズとライン高
- **スペーシング**: 一貫したマージン・パディング体系
- **ボーダー**: 統一された角丸とボーダー幅
- **アニメーション**: 統一されたトランジション効果

この統一された設計システムにより、保守性とユーザビリティの向上を図ります。

# ダークモード・テーマ対応

## 実装概要

このプロジェクトでは完全なダークモード対応が実装されており、ユーザーは自由にテーマを切り替えることができます。

## テーマシステムの構成要素

### 1. テーマ管理（`src/shared/lib/theme.ts`）

```typescript
export type Theme = "light" | "dark";
export function useTheme() {
  // システム設定の自動検出
  // localStorage での永続化
  // SSR対応のハイドレーション処理
}
```

### 2. テーマ切り替え UI（`src/widgets/header/ui/ThemeToggle.tsx`）

```typescript
// ヘッダーに配置されたテーマ切り替えボタン
<Button onClick={toggleTheme}>
  {theme === "dark" ? <MoonIcon /> : <SunIcon />}
</Button>
```

### 3. CSS 変数によるテーマ定義（`src/app/styles/globals.css`）

```css
/* ライトテーマ（デフォルト） */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.142 0.005 285.823);
  /* ... 全色定義 */
}

/* ダークテーマ */
.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  /* ... 全色定義 */
}
```

### 4. 初期化スクリプト（`src/shared/lib/theme-script.ts`）

```typescript
// SSR時のフラッシュ防止
// システム設定の自動検出
// localStorage からの復元
export const themeScript = `(function() {
  // テーマ初期化処理
})();`;
```

## 開発ガイドライン

### ✅ 推奨事項

- **CSS 変数の使用**: Tailwind CSS の semantic color tokens を活用
- **自動検出**: `prefers-color-scheme` でシステム設定を尊重
- **永続化**: `localStorage` でユーザー選択を保存
- **SSR 対応**: ハイドレーションエラーを防ぐ適切な実装

### 🎨 カラーシステム

```typescript
// ✅ 推奨: semantic color tokens
<div className="bg-background text-foreground">
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card text-card-foreground">

// ❌ 禁止: ハードコードされた色
<div className="bg-white text-black dark:bg-black dark:text-white">
```

### 📱 レスポンシブ対応

テーマシステムは全デバイスで一貫して動作します：

- デスクトップ: ヘッダーの切り替えボタン
- モバイル: 同一 UI、タッチ最適化
- システム連動: OS 設定の自動検出

## 注意事項

- **ハイドレーション**: クライアント側での適切なマウント処理必須
- **アクセシビリティ**: テーマ切り替えボタンに適切な aria-label 設定済み
- **パフォーマンス**: CSS 変数による効率的なテーマ切り替え
- **一貫性**: shadcn/ui コンポーネントは自動的にテーマ対応

このテーマシステムにより、現代的な Web アプリケーションの基準を満たしたユーザーエクスペリエンスを提供しています。

# テスト方針

## 使用テストフレームワーク

現在、専用のテストフレームワークは設定されていません。

## テスト記述方針（推奨）

- Jest + Testing Library または vitest の導入を検討してください
- コンポーネントの単体テストを作成してください
- Server Actions の統合テストを作成してください
- Prisma スキーマの変更時はデータベーステストを実行してください
- E2E テストとしては、Playwright + Next.js Testing Library の組み合わせを推奨します

## テスト命名規則（推奨）

- テストファイルには `.test.ts` または `.spec.ts` 接尾辞を使用してください
- テストディレクトリは `__tests__/` または各ファイルの隣に配置してください
- コンポーネントテストは対象コンポーネントと同じディレクトリに配置してください

# アンチパターン

## 禁止事項

### TypeScript/JavaScript

- default export は避けて named export を使用してください
- any 型は原則使用しないでください
- var は使用せず、let または const を使用してください
- ==ではなく===を使用してください
- console.log をプロダクションコードに残さないでください

### Next.js App Router

- useRouter を不適切に使用しないでください（Client Component でのみ使用）
- metadata オブジェクトは Server Component でのみエクスポートしてください
- 'use client'ディレクティブを不必要に使用しないでください
- App Router の規約に反するファイル配置をしないでください
- Server Component から Client Component にシリアライズ不可能なプロパティを渡さないでください

### React 19

- useState の不必要な使用を避け、Server Component を優先してください
- useEffect の依存配列を適切に設定してください
- Key の重複や index 使用を避けてください

### Prisma

- N+1 クエリ問題を避けてください（include や select を適切に使用）
- 生の SQL 文字列の結合は避けて、Prisma のクエリビルダーを使用してください
- トランザクションは prisma.$transaction を使用してください
- マイグレーションファイルを手動で編集しないでください

### NextAuth.js v5

- セッション情報を不適切にクライアントに露出しないでください
- 認証状態のチェックをクライアントサイドのみで行わないでください
- JWT シークレットや環境変数をコードに直接記述しないでください

### shadcn/ui

- **コンポーネントのカスタマイズ時は、variants API を使用してください**
- **自作 UI コンポーネントより shadcn/ui の既存コンポーネントを優先してください**
- **新規 UI 作成前に shadcn/ui での実装可能性を必ず確認してください**
- CSS クラスの直接上書きは避け、Tailwind のユーティリティを使用してください
- shadcn/ui コンポーネントを不適切に改変しないでください
- shadcn/ui の設計システムに従い、一貫性のあるデザインを保ってください

### FSD 関連

- スライス間のクロスインポートは原則禁止です（@x 表記を除く）
- 公開 API を持たないスライスからの直接インポートは避けてください
- 上位レイヤーから下位レイヤー以外のインポートは禁止です
- 同一スライス内でも公開 API を経由せずに../でインポートしないでください
- ワイルドカード（\*）による一括エクスポートは避けて明示的にエクスポートしてください
- エンティティ間の関係は@x 表記を使用して明示してください
- ビジネス用語以外のスライス名（utils、helpers、components 等）は使用しないでください

#### 公開 API 違反の禁止パターン

**❌ 内部構造への直接アクセス（禁止）**:

```typescript
// レイヤー内部への直接アクセス
import { Header } from "@/widgets/header/ui/Header";
import { authenticate } from "@/features/auth/api/authenticate";
import { prisma } from "@/shared/lib/prisma";

// 長い内部パス
import { cn } from "@/shared/lib/shadcn/utils";
import { HomePage } from "@/pages/home-page/ui/HomePage";
```

**✅ 正しい公開 API 経由のアクセス**:

```typescript
// 短縮形・公開API経由
import { Header } from "@/widgets";
import { authenticate } from "@/features";
import { prisma, cn } from "@/shared";
import { HomePage } from "@/pages";
```

## コード品質

- 未使用の変数や import は削除してください
- 重複コードは避けて関数化してください
- 適切なエラーハンドリングを実装してください（try-catch、Error Boundary）
- パフォーマンスを考慮したコードを記述してください
- コンポーネントの責務を明確に分離してください

## セキュリティ

- ユーザー入力は必ず Zod で検証してください
- 環境変数を.env ファイルで管理し、機密情報をコードに直接記述しないでください
- NextAuth.js の認証・認可を適切に実装してください
- CSRF や XSS 対策を考慮してください
- データベースクエリでは常に Prisma のパラメータ化クエリを使用してください
