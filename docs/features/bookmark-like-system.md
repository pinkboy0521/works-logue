# ブックマーク・いいね機能

Works Logue のユーザーリアクション機能（ブックマーク・いいね）の完全ガイドです。

## 📋 概要

### 機能概要

- **いいね機能**: ユーザーが記事に対してリアクションを表現
- **ブックマーク機能**: 記事を後で読むために保存
- **リアクション統計**: リアルタイムでのカウント表示
- **マイページ**: ブックマーク・いいねした記事の一覧表示

### 主要な特徴

- ✅ **認証制御**: ログインユーザーのみ操作可能
- ✅ **リアルタイム更新**: Server Actions による即座の UI 更新
- ✅ **重複防止**: 同一ユーザーの重複操作を防止
- ✅ **型安全性**: TypeScript による厳密な型チェック
- ✅ **パフォーマンス**: 最適化されたデータベースクエリ

## 🏗️ アーキテクチャ

### FSD レイヤー構造

```
src/
├── entities/                     # ビジネスエンティティ
│   ├── article-like/             # いいね機能のエンティティ
│   │   ├── api.ts               # いいね操作API
│   │   ├── lib.ts               # いいね統計・バリデーション
│   │   └── model.ts             # 型定義・スキーマ
│   └── article-bookmark/         # ブックマーク機能のエンティティ
│       ├── api.ts               # ブックマーク操作API
│       ├── lib.ts               # ブックマーク統計・バリデーション
│       └── model.ts             # 型定義・スキーマ
├── features/                     # ユーザー機能
│   └── article-reaction/         # リアクション機能
│       ├── api/
│       │   └── actions.ts       # Server Actions
│       ├── lib/
│       │   ├── auth.ts          # 認証ヘルパー
│       │   └── enrichment.ts   # データ拡張
│       └── ui/
│           ├── LikeButton.tsx   # いいねボタン
│           ├── BookmarkButton.tsx # ブックマークボタン
│           └── ArticleReactions.tsx # リアクション統合UI
├── widgets/                      # UI コンポーネント
│   ├── article-list/             # 記事一覧
│   │   └── ui/
│   │       ├── ArticleList.tsx  # 記事一覧コンテナ
│   │       └── ArticleCard.tsx  # 記事カード（横長レイアウト）
│   └── article-detail/           # 記事詳細
└── pages/                        # ページコンポーネント
    ├── bookmark-list-page/       # ブックマーク一覧
    └── liked-articles-page/      # いいね一覧
```

## 📊 データベーススキーマ

### ArticleLike テーブル

```sql
model ArticleLike {
  id         String   @id @default(cuid())
  userId     String
  articleId  String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@map("article_likes")
}
```

### ArticleBookmark テーブル

```sql
model ArticleBookmark {
  id         String   @id @default(cuid())
  userId     String
  articleId  String
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  article Article @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([userId, articleId])
  @@map("article_bookmarks")
}
```

### Article テーブル（拡張）

```sql
model Article {
  // ...既存フィールド
  likeCount     Int @default(0)  # 追加
  bookmarkCount Int @default(0)  # 追加

  likes     ArticleLike[]     @relation # 追加
  bookmarks ArticleBookmark[] @relation # 追加
  // ...
}
```

## 🚀 API 仕様

### Server Actions

#### toggleArticleLike

```typescript
export async function toggleArticleLike(
  formData: FormData,
): Promise<ActionResult>;

// パラメータ
interface FormData {
  articleId: string;
}

// レスポンス
interface ActionResult {
  success: boolean;
  isLiked?: boolean;
  message?: string;
  error?: string;
  requiresAuth?: boolean;
}
```

#### toggleArticleBookmark

```typescript
export async function toggleArticleBookmark(
  formData: FormData,
): Promise<ActionResult>;

// パラメータ・レスポンス同様
```

### Entity API

#### いいね機能

```typescript
// いいね作成
await createArticleLike(articleId: string, userId: string): Promise<void>

// いいね削除
await deleteArticleLike(articleId: string, userId: string): Promise<void>

// いいね状態確認
await isArticleLikedByUser(articleId: string, userId: string): Promise<boolean>

// いいね数取得
await getArticleLikeCount(articleId: string): Promise<number>

// ユーザーのいいね一覧
await getUserArticleLikes(userId: string, page: number, limit: number): Promise<ArticleLikeWithRelations[]>
```

#### ブックマーク機能

```typescript
// 同様の API パターン
await createArticleBookmark(articleId: string, userId: string): Promise<void>
await deleteArticleBookmark(articleId: string, userId: string): Promise<void>
// ...（他も同様）
```

## 🎨 UI コンポーネント

### LikeButton

```typescript
interface LikeButtonProps {
  articleId: string;
  initialCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}
```

**特徴**:

- Optimistic Update による即座の UI 反映
- 未ログイン時のログインモーダル表示
- 3サイズ対応（sm/md/lg）
- カウント表示の切り替え可能

### BookmarkButton

```typescript
interface BookmarkButtonProps {
  articleId: string;
  initialCount: number;
  initialIsBookmarked: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}
```

**特徴**:

- LikeButton と同様の API
- ブックマーク用アイコン（Bookmark from Lucide）
- 同様の最適化機能

### ArticleReactions（統合コンポーネント）

```typescript
interface ArticleReactionsProps {
  articleId: string;
  likeCount: number;
  bookmarkCount: number;
  isLikedByUser: boolean;
  isBookmarkedByUser: boolean;
  isLoggedIn: boolean;
  size?: "sm" | "md" | "lg";
  layout?: "horizontal" | "vertical";
  showCounts?: boolean;
}
```

**特徴**:

- いいね・ブックマークの統合 UI
- レイアウト切り替え（horizontal/vertical）
- 一貫したデザインとスペーシング

## 🔧 実装の詳細

### 認証制御

```typescript
// features/article-reaction/lib/auth.ts
export async function requireAuth(action: string): Promise<{
  user: { id: string } | null;
  error?: { requiresAuth: boolean; message: string };
}> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      user: null,
      error: {
        requiresAuth: true,
        message: "ログインが必要です",
      },
    };
  }

  return { user: session.user };
}
```

### 楽観的更新（Optimistic Updates）

```typescript
// LikeButton.tsx での実装例
const handleToggle = async () => {
  if (!isLoggedIn) {
    setShowLoginModal(true);
    return;
  }

  try {
    // 1. 即座にUIを更新（楽観的更新）
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setCount((prev) => (newIsLiked ? prev + 1 : prev - 1));

    // 2. Server Action を実行
    const result = await toggleArticleLike(formData);

    // 3. エラー時は元に戻す
    if (!result.success) {
      setIsLiked(!newIsLiked);
      setCount((prev) => (newIsLiked ? prev - 1 : prev + 1));

      if (result.requiresAuth) {
        setShowLoginModal(true);
      } else {
        console.error("Like toggle failed:", result.error);
      }
    }
  } catch (error) {
    // エラー処理
  }
};
```

### データベーストランザクション

```typescript
// entities/article-like/api.ts
export async function createArticleLike(
  articleId: string,
  userId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1. いいねレコードを作成
    await tx.articleLike.create({
      data: { articleId, userId },
    });

    // 2. 記事のいいね数を更新
    await tx.article.update({
      where: { id: articleId },
      data: {
        likeCount: { increment: 1 },
      },
    });
  });
}
```

## 📱 ユーザーエクスペリエンス

### 記事一覧・詳細での表示

- **記事カード**: 横長レイアウトで統一された表示
- **記事詳細**: 読みやすい位置にリアクションボタンを配置
- **アイコン統一**: Lucide React アイコンで一貫性を保持

### マイページでの管理

- **ブックマーク一覧** (`/mypage/bookmarks`): ブックマークした記事を時系列表示
- **いいね一覧** (`/mypage/likes`): いいねした記事を時系列表示
- **同一UI**: TOPページと同じ`ArticleList`コンポーネントを使用

### ログイン管理

- **未ログイン時**: ボタンクリックでログインモーダル表示
- **ログイン済み**: 即座にリアクション実行
- **状態管理**: セッション状態による適切な UI 制御

## 🔍 閲覧数管理の改善

### 問題

従来はServer Componentで記事詳細ページを表示するたびに閲覧数がカウントされ、リアクション時の`revalidatePath()`で再レンダリングが発生し、重複カウントが発生していました。

### 解決策

```typescript
// pages/article-detail-page/ui/ViewCountTracker.tsx
"use client";

export function ViewCountTracker({ articleId }: ViewCountTrackerProps) {
  useEffect(() => {
    // sessionStorage で同一セッション中の重複を防止
    const hasIncrementedView = sessionStorage.getItem(`viewed-${articleId}`);

    if (!hasIncrementedView) {
      incrementArticleViews(articleId)
        .then(() => {
          sessionStorage.setItem(`viewed-${articleId}`, "true");
        })
        .catch(console.error);
    }
  }, [articleId]);

  return null; // UI は描画しない
}
```

**効果**:

- リアクション操作時の閲覧数重複カウントを防止
- セッション中は1回のみカウント
- Server Action による再レンダリング時の影響を排除

## 🧪 テスト観点

### 機能テスト

- [ ] ログイン後のいいね・ブックマーク操作
- [ ] 未ログイン時のモーダル表示
- [ ] 重複操作の防止（toggle動作）
- [ ] カウント数の正確性
- [ ] マイページでの一覧表示

### パフォーマンステスト

- [ ] 大量データでのクエリパフォーマンス
- [ ] 楽観的更新の応答性
- [ ] ページネーションの効率性

### セキュリティテスト

- [ ] 認証なしでのAPI実行防止
- [ ] CSRF 攻撃への対策（Next.js内蔵）
- [ ] SQLインジェクション防止（Prisma使用）

## 📈 今後の拡張予定

### 機能拡張

- [ ] **いいね通知**: ユーザーへの通知システム
- [ ] **ブックマーク分類**: フォルダ機能
- [ ] **ソーシャル機能**: いいねした記事の共有
- [ ] **統計ダッシュボード**: 記事作成者向け分析

### パフォーマンス最適化

- [ ] **Redis キャッシュ**: リアクション数のキャッシュ
- [ ] **リアルタイム更新**: WebSocket による即座の同期
- [ ] **バッチ処理**: 大量データ処理の最適化

## 🐛 既知の課題

現在、深刻な問題は報告されていませんが、以下の点で継続的な監視が必要です：

- **大量アクセス時のパフォーマンス**: 同時アクセス負荷テストが未実施
- **エラーハンドリング**: ネットワークエラー時のユーザビリティ改善の余地
- **アクセシビリティ**: スクリーンリーダー対応の検証が未完了

## 📚 関連ドキュメント

- [FSD アーキテクチャガイド](../architecture/fsd-architecture.md)
- [shadcn/ui ガイドライン](../ui-ux/design-system.md)
- [認証システム](./authentication-system.md)
- [データベース設計](../database/schema-design.md)
