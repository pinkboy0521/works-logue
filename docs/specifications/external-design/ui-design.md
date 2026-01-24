# Works Logue - UI・画面設計

**バージョン**: 1.0  
**最終更新**: 2026年1月24日  
**ステータス**: 実装済み

## 1. 画面一覧

| 画面ID | 画面名                   | 認証   | 実装状況    |
| ------ | ------------------------ | ------ | ----------- |
| SC-001 | ホーム画面               | 不要   | ✅ 完了     |
| SC-002 | ログイン画面             | 不要   | ✅ 完了     |
| SC-003 | 新規登録画面             | 不要   | ✅ 完了     |
| SC-004 | メール認証画面           | 不要   | ✅ 完了     |
| SC-005 | プロフィール設定画面     | 必要   | ✅ 完了     |
| SC-006 | ダッシュボード画面       | 必要   | ✅ 完了     |
| SC-007 | 記事一覧画面             | 不要   | ✅ 完了     |
| SC-008 | 記事詳細画面             | 不要   | ✅ 完了     |
| SC-009 | 記事編集画面             | 必要   | ✅ 完了     |
| SC-010 | 記事投稿画面             | 必要   | ✅ 完了     |
| SC-011 | ユーザープロフィール画面 | 不要   | ✅ 完了     |
| SC-012 | 検索結果画面             | 不要   | ✅ 完了     |
| SC-013 | マイページ画面           | 必要   | ✅ 完了     |
| SC-014 | 管理画面                 | 管理者 | 🔄 部分実装 |

## 2. レイアウト構成

### 2.1 共通ヘッダー

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo] Works Logue    [検索バー]    [テーマ切替] [ユーザメニュー] │
└─────────────────────────────────────────────────────────────┘
```

**コンポーネント**: `src/widgets/header/ui/Header.tsx`

**機能**:

- ロゴ・タイトル表示
- グローバル検索機能
- ダークモード切り替えボタン
- ユーザーメニュー（ログイン/ログアウト、ダッシュボードリンク等）

### 2.2 レスポンシブ対応

- **デスクトップ**: フル機能表示
- **タブレット**: サイドバー折りたたみ
- **モバイル**: ハンバーガーメニュー

## 3. 主要画面詳細

### 3.1 ホーム画面 (SC-001)

**パス**: `/`

**レイアウト**:

```
┌─────────────────────────────────────────────────────────┐
│                     ヘッダー                               │
├─────────────────┬───────────────────────┬────────────────┤
│                │                        │                 │
│   タグサイドバー   │      記事一覧          │   その他情報    │
│                │                        │                 │
│ ・業界タグ      │  ┌──────────────────┐ │                │
│ ・技術タグ      │  │   記事カード      │ │                │
│ ・職業タグ      │  │ ・タイトル        │ │                │
│                │  │ ・著者情報       │ │                │
│                │  │ ・いいね・閲覧数  │ │                │
│                │  └──────────────────┘ │                │
└─────────────────┴───────────────────────┴────────────────┘
```

**実装ファイル**:

- ページ: `app/(public)/page.tsx`
- UI: `src/pages/home-page/ui/HomePage.tsx`
- ウィジェット: `src/widgets/article-list/ui/ArticleList.tsx`

### 3.2 記事詳細画面 (SC-008)

**パス**: `/[userId]/articles/[articleId]`

**レイアウト**:

```
┌─────────────────────────────────────────────────────────┐
│                     ヘッダー                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                記事ヘッダー                      │    │
│  │ ・タイトル                                      │    │
│  │ ・著者情報（アバター・名前・投稿日）              │    │
│  │ ・トップ画像                                    │    │
│  │ ・タグ・トピック                                │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │                記事内容                          │    │
│  │ (BlockNote レンダリング)                         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              リアクション                        │    │
│  │ [いいね 123] [ブックマーク 45]                   │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │               コメント                           │    │
│  │ ・コメント投稿フォーム                           │    │
│  │ ・コメント一覧（階層表示）                       │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**実装ファイル**:

- ページ: `app/(public)/[userId]/articles/[articleId]/page.tsx`
- UI: `src/pages/article-detail-page/ui/ArticleDetailPage.tsx`
- ウィジェット: `src/widgets/article-detail/ui/ArticleDetail.tsx`

### 3.3 記事編集画面 (SC-009)

**パス**: `/dashboard/articles/[id]/edit`

**レイアウト**:

```
┌─────────────────────────────────────────────────────────┐
│                     ヘッダー                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              記事メタデータ                      │    │
│  │ [タイトル入力フィールド]                         │    │
│  │ [トピック選択] [タグ選択]                        │    │
│  │ [トップ画像アップロード]                         │    │
│  │ [ステータス] [公開日時]                          │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │             BlockNote エディター                 │    │
│  │                                                  │    │
│  │ (リッチテキスト編集エリア)                       │    │
│  │                                                  │    │
│  │                                                  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  [下書き保存] [プレビュー] [公開]                        │
└─────────────────────────────────────────────────────────┘
```

**実装ファイル**:

- ページ: `app/(private)/dashboard/articles/[id]/edit/page.tsx`
- UI: `src/pages/article-edit-page/ui/ArticleEditPage.tsx`
- フィーチャー: `src/features/article-editor/ui/ArticleEditor.tsx`

## 4. UI/UXデザインガイドライン

### 4.1 デザインシステム

#### 4.1.1 shadcn/ui 統一戦略

Works Logueでは、**shadcn/ui**を中心とした統一されたデザインシステムを採用しています。

**設定**:

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

**使用コンポーネント**:

- **基本**: Button, Input, Label, Textarea, Card
- **フォーム**: Form, FormField, FormItem, FormLabel
- **フィードバック**: Alert, Badge, Skeleton, Toast
- **ナビゲーション**: DropdownMenu, NavigationMenu

#### 4.1.2 カラーパレット

**ライトテーマ**:

```css
:root {
  --background: oklch(1 0 0); /* 白背景 */
  --foreground: oklch(0.142 0.005 285.823); /* ダークグレー文字 */
  --primary: oklch(0.142 0.005 285.823); /* プライマリカラー */
  --primary-foreground: oklch(1 0 0); /* プライマリ上の文字 */
  --secondary: oklch(0.95 0 0); /* セカンダリ背景 */
  --card: oklch(1 0 0); /* カード背景 */
  --border: oklch(0.863 0.005 285.823); /* ボーダー */
}
```

**ダークテーマ**:

```css
.dark {
  --background: oklch(0.141 0.005 285.823); /* ダーク背景 */
  --foreground: oklch(0.985 0 0); /* ライト文字 */
  --primary: oklch(0.985 0 0); /* プライマリカラー */
  --card: oklch(0.161 0.005 285.823); /* カード背景 */
  --border: oklch(0.282 0.005 285.823); /* ボーダー */
}
```

### 4.2 コンポーネントガイドライン

#### 4.2.1 記事カード

```tsx
// 統一された記事カードデザイン
<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <CardTitle className="line-clamp-2">{title}</CardTitle>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Avatar className="w-6 h-6">
        <AvatarImage src={author.image} />
        <AvatarFallback>{author.displayName[0]}</AvatarFallback>
      </Avatar>
      <span>{author.displayName}</span>
      <span>•</span>
      <time>{formatDate(publishedAt)}</time>
    </div>
  </CardHeader>
  {topImageUrl && (
    <div className="aspect-video overflow-hidden">
      <img src={topImageUrl} className="w-full h-full object-cover" />
    </div>
  )}
  <CardFooter className="flex justify-between items-center">
    <div className="flex gap-4 text-sm text-muted-foreground">
      <span className="flex items-center gap-1">
        <HeartIcon className="w-4 h-4" />
        {likeCount}
      </span>
      <span className="flex items-center gap-1">
        <EyeIcon className="w-4 h-4" />
        {viewCount}
      </span>
    </div>
    <div className="flex gap-2">
      {tags.map((tag) => (
        <Badge key={tag.id} variant="secondary">
          {tag.name}
        </Badge>
      ))}
    </div>
  </CardFooter>
</Card>
```

#### 4.2.2 リアクションボタン

```tsx
// 統一されたリアクションボタン
<div className="flex gap-4 items-center">
  <Button
    variant={isLiked ? "default" : "outline"}
    size="sm"
    onClick={handleLike}
    className="gap-2"
  >
    <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
    {likeCount}
  </Button>
  <Button
    variant={isBookmarked ? "default" : "outline"}
    size="sm"
    onClick={handleBookmark}
    className="gap-2"
  >
    <BookmarkIcon className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
    {bookmarkCount}
  </Button>
</div>
```

### 4.3 レスポンシブデザイン

#### 4.3.1 ブレークポイント

- **Mobile**: 0-640px
- **Tablet**: 641-1024px
- **Desktop**: 1025px+

#### 4.3.2 グリッドシステム

```css
/* 記事一覧グリッド */
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 640px) {
  .articles-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
```

### 4.4 アクセシビリティ

#### 4.4.1 キーボードナビゲーション

- Tab キーでの操作可能
- フォーカス表示の明確化
- Skip to content リンク

#### 4.4.2 スクリーンリーダー対応

- 適切な aria-label 設定
- セマンティックHTML使用
- 画像の alt テキスト

#### 4.4.3 カラーコントラスト

- WCAG 2.1 AA準拠
- 最小コントラスト比 4.5:1
- ダークモード対応

---

## 変更履歴

| 日付       | バージョン | 変更者   | 変更内容                                 |
| ---------- | ---------- | -------- | ---------------------------------------- |
| 2026-01-24 | 1.0        | システム | 外部設計書からUI・画面設計を分離・独立化 |
