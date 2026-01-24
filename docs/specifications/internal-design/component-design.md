# Works Logue - コンポーネント設計

**バージョン**: 1.0  
**最終更新**: 2026年1月24日  
**ステータス**: 実装済み

## 1. コンポーネントアーキテクチャ

### 1.1 FSD レイヤー別コンポーネント構成

#### 1.1.1 Shared レイヤー（`src/shared/`）

```
shared/
├── ui/           # 再利用可能なUIコンポーネント
│   ├── shadcn/   # shadcn/ui コンポーネント
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── alert.tsx
│   │   ├── badge.tsx
│   │   ├── avatar.tsx
│   │   ├── skeleton.tsx
│   │   └── index.ts
│   └── custom/   # カスタムコンポーネント
│       ├── logo.tsx
│       ├── loading-spinner.tsx
│       └── index.ts
├── lib/          # ユーティリティ・ヘルパー
│   ├── utils.ts          # cn() 等
│   ├── prisma.ts         # Prismaクライアント
│   ├── auth.ts           # 認証ヘルパー
│   ├── date.ts           # 日付フォーマット
│   ├── validation.ts     # Zodスキーマ
│   └── constants.ts      # 定数
└── config/       # 共通設定
    ├── env.ts            # 環境変数
    └── database.ts       # DB設定
```

#### 1.1.2 Entities レイヤー（`src/entities/`）

```
entities/
├── user/
│   ├── ui/               # ユーザー表示コンポーネント
│   │   ├── UserCard.tsx
│   │   ├── UserAvatar.tsx
│   │   ├── UserProfile.tsx
│   │   └── UserStats.tsx
│   ├── model/            # ユーザーデータ管理
│   │   ├── types.ts      # TypeScript型定義
│   │   └── validation.ts # Zodバリデーション
│   ├── api/              # ユーザーAPI
│   │   ├── user-queries.ts
│   │   ├── user-actions.ts
│   │   └── index.ts
│   └── index.ts          # 公開API
├── article/
│   ├── ui/
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleMeta.tsx
│   │   ├── ArticleContent.tsx
│   │   └── ArticleStats.tsx
│   ├── model/
│   │   ├── types.ts
│   │   └── validation.ts
│   ├── api/
│   │   ├── article-queries.ts
│   │   ├── article-actions.ts
│   │   └── index.ts
│   └── index.ts
└── comment/
    ├── ui/
    │   ├── CommentCard.tsx
    │   ├── CommentForm.tsx
    │   └── CommentTree.tsx
    ├── model/
    │   ├── types.ts
    │   └── validation.ts
    ├── api/
    │   ├── comment-queries.ts
    │   ├── comment-actions.ts
    │   └── index.ts
    └── index.ts
```

#### 1.1.3 Features レイヤー（`src/features/`）

```
features/
├── auth/
│   ├── ui/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── AuthGuard.tsx
│   │   └── UserMenu.tsx
│   ├── api/
│   │   ├── auth-actions.ts
│   │   └── email-verification.ts
│   ├── lib/
│   │   └── validation.ts
│   └── index.ts
├── article-editor/
│   ├── ui/
│   │   ├── ArticleEditor.tsx
│   │   ├── BlockNoteEditor.tsx
│   │   ├── ArticleMetaForm.tsx
│   │   └── PublishButton.tsx
│   ├── lib/
│   │   └── editor-schema.ts
│   ├── api/
│   │   └── editor-actions.ts
│   └── index.ts
├── article-reaction/
│   ├── ui/
│   │   ├── LikeButton.tsx
│   │   ├── BookmarkButton.tsx
│   │   └── ArticleReactions.tsx
│   ├── api/
│   │   └── reaction-actions.ts
│   └── index.ts
└── comment-system/
    ├── ui/
    │   ├── CommentSection.tsx
    │   ├── CommentForm.tsx
    │   └── CommentReplyForm.tsx
    ├── api/
    │   └── comment-actions.ts
    └── index.ts
```

### 1.2 shadcn/ui 統一コンポーネント戦略

#### 1.2.1 基本UI統一エクスポート

```typescript
// src/shared/ui/shadcn/index.ts
// 全shadcn/uiコンポーネントの統一エクスポート
export { Button } from "./button";
export { Input } from "./input";
export { Label } from "./label";
export { Textarea } from "./textarea";
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "./card";
export {
  Form,
  FormItem,
  FormField,
  FormLabel,
  FormControl,
  FormMessage,
} from "./form";
export { Alert, AlertDescription } from "./alert";
export { Badge } from "./badge";
export { Avatar, AvatarImage, AvatarFallback } from "./avatar";
export { Skeleton } from "./skeleton";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "./navigation-menu";
export {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";
export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
export { Toaster } from "./toaster";
export { toast } from "./use-toast";
```

#### 1.2.2 variants API 活用パターン

```typescript
// variants APIを活用したカスタマイズ例
import { Button } from "@/shared";

// ✅ 推奨: variantsによるカスタマイズ
<Button variant="destructive" size="sm">削除</Button>
<Button variant="ghost" size="icon">
  <EditIcon className="w-4 h-4" />
</Button>

// ❌ 禁止: 直接的なクラス上書き
<Button className="!bg-red-500 !text-white">危険</Button>
```

#### 1.2.3 shadcn/ui設定

```json
// components.json
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

## 2. コンポーネント設計原則

### 2.1 命名規則

#### 2.1.1 ファイル・コンポーネント命名

- **ファイル**: PascalCase + `.tsx` 拡張子
- **コンポーネント**: PascalCase
- **型定義**: PascalCase + `Props` サフィックス
- **定数**: UPPER_SNAKE_CASE
- **フック**: `use` プレフィックス + PascalCase

```typescript
// ✅ 推奨命名パターン
// ファイル: src/entities/article/ui/ArticleCard.tsx
interface ArticleCardProps {
  article: Article;
  showAuthor?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ArticleCard({ article, showAuthor = true, size = 'md' }: ArticleCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-md transition-shadow",
      size === 'sm' && "p-4",
      size === 'md' && "p-6",
      size === 'lg' && "p-8"
    )}>
      {/* コンポーネント内容 */}
    </Card>
  );
}
```

#### 2.1.2 CSS クラス命名（Tailwind）

```typescript
// ✅ 推奨: 意味のあるクラス構成
const cardClasses = cn(
  "rounded-lg border bg-card text-card-foreground shadow-sm",
  size === "lg" && "p-8",
  size === "md" && "p-6",
  size === "sm" && "p-4",
  isHovered && "shadow-lg",
  className,
);

// ❌ 禁止: 意味不明なクラス羅列
className =
  "p-2 m-4 bg-white border-gray-200 rounded-md shadow-sm hover:shadow-md";
```

### 2.2 Server/Client Component 分離戦略

#### 2.2.1 Server Components（デフォルト）

```typescript
// Server Component: データフェッチ、静的表示
// src/widgets/article-list/ui/ArticleList.tsx
import { getArticles } from "@/entities";

interface ArticleListProps {
  page?: number;
  limit?: number;
  topicId?: string;
}

export async function ArticleList({
  page = 1,
  limit = 20,
  topicId
}: ArticleListProps) {
  const { articles, pagination } = await getArticles({ page, limit, topicId });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
      <Pagination {...pagination} />
    </div>
  );
}
```

#### 2.2.2 Client Components（'use client'）

```typescript
// Client Component: インタラクティブ機能
// src/features/article-reaction/ui/LikeButton.tsx
'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/shared";
import { toggleLike } from "../api/reaction-actions";

interface LikeButtonProps {
  articleId: string;
  initialLiked: boolean;
  initialCount: number;
}

export function LikeButton({
  articleId,
  initialLiked,
  initialCount
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    // 楽観的UI更新
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

    // Server Action実行
    startTransition(async () => {
      try {
        const result = await toggleLike(articleId);
        if (result.success) {
          setIsLiked(result.data.isLiked);
          setLikeCount(result.data.likeCount);
        }
      } catch (error) {
        // エラー時のロールバック
        setIsLiked(initialLiked);
        setLikeCount(initialCount);
        toast.error("いいねの処理に失敗しました");
      }
    });
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleLike}
      disabled={isPending}
      className="gap-2"
    >
      <HeartIcon className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
      {likeCount}
    </Button>
  );
}
```

### 2.3 コンポーネント合成パターン

#### 2.3.1 Compound Components

```typescript
// src/entities/article/ui/ArticleCard.tsx
interface ArticleCardProps {
  children: React.ReactNode;
  className?: string;
}

function ArticleCard({ children, className }: ArticleCardProps) {
  return (
    <Card className={cn("hover:shadow-md transition-shadow", className)}>
      {children}
    </Card>
  );
}

function ArticleCardHeader({ children }: { children: React.ReactNode }) {
  return <CardHeader>{children}</CardHeader>;
}

function ArticleCardContent({ children }: { children: React.ReactNode }) {
  return <CardContent>{children}</CardContent>;
}

function ArticleCardFooter({ children }: { children: React.ReactNode }) {
  return <CardFooter className="flex justify-between items-center">{children}</CardFooter>;
}

// 合成パターン
ArticleCard.Header = ArticleCardHeader;
ArticleCard.Content = ArticleCardContent;
ArticleCard.Footer = ArticleCardFooter;

// 使用例
<ArticleCard>
  <ArticleCard.Header>
    <CardTitle>{article.title}</CardTitle>
    <UserMeta user={article.user} publishedAt={article.publishedAt} />
  </ArticleCard.Header>
  <ArticleCard.Content>
    {article.topImageUrl && (
      <img src={article.topImageUrl} alt={article.title} />
    )}
  </ArticleCard.Content>
  <ArticleCard.Footer>
    <ArticleStats {...article.stats} />
    <TagList tags={article.tags} />
  </ArticleCard.Footer>
</ArticleCard>
```

#### 2.3.2 Render Props パターン

```typescript
// src/entities/article/ui/ArticleProvider.tsx
interface ArticleProviderProps {
  articleId: string;
  children: (state: {
    article: Article | null;
    isLoading: boolean;
    error: string | null;
  }) => React.ReactNode;
}

export function ArticleProvider({ articleId, children }: ArticleProviderProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getArticleById(articleId)
      .then(setArticle)
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [articleId]);

  return children({ article, isLoading, error });
}

// 使用例
<ArticleProvider articleId={articleId}>
  {({ article, isLoading, error }) => {
    if (isLoading) return <ArticleSkeleton />;
    if (error) return <ErrorAlert message={error} />;
    if (!article) return <NotFoundAlert />;

    return <ArticleDetail article={article} />;
  }}
</ArticleProvider>
```

## 3. 主要コンポーネント実装例

### 3.1 記事コンポーネント

#### 3.1.1 ArticleCard

```typescript
// src/entities/article/ui/ArticleCard.tsx
import { Card, CardHeader, CardContent, CardFooter, CardTitle, Badge, Avatar, AvatarImage, AvatarFallback } from "@/shared";
import { formatDate } from "@/shared/lib/date";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt?: string;
    topImageUrl?: string;
    publishedAt: Date;
    stats: {
      viewCount: number;
      likeCount: number;
      commentCount: number;
    };
    user: {
      displayName: string;
      image?: string;
    };
    tags: { tag: { name: string } }[];
  };
  size?: 'sm' | 'md' | 'lg';
  showImage?: boolean;
}

export function ArticleCard({
  article,
  size = 'md',
  showImage = true
}: ArticleCardProps) {
  return (
    <Card className={cn(
      "hover:shadow-lg transition-all duration-200 cursor-pointer",
      size === 'sm' && "p-4",
      size === 'md' && "p-6",
      size === 'lg' && "p-8"
    )}>
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={article.user.image} />
            <AvatarFallback>
              {article.user.displayName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{article.user.displayName}</span>
            <span className="mx-2">•</span>
            <time>{formatDate(article.publishedAt)}</time>
          </div>
        </div>
        <CardTitle className="line-clamp-2 hover:text-primary transition-colors">
          {article.title}
        </CardTitle>
      </CardHeader>

      {showImage && article.topImageUrl && (
        <div className="aspect-video overflow-hidden rounded-md mx-6 mb-4">
          <img
            src={article.topImageUrl}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
          />
        </div>
      )}

      {article.excerpt && (
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        </CardContent>
      )}

      <CardFooter className="flex justify-between items-center">
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <EyeIcon className="w-4 h-4" />
            {article.stats.viewCount}
          </span>
          <span className="flex items-center gap-1">
            <HeartIcon className="w-4 h-4" />
            {article.stats.likeCount}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircleIcon className="w-4 h-4" />
            {article.stats.commentCount}
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {article.tags.slice(0, 3).map((articleTag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {articleTag.tag.name}
            </Badge>
          ))}
          {article.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{article.tags.length - 3}
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
```

#### 3.1.2 ArticleEditor

```typescript
// src/features/article-editor/ui/ArticleEditor.tsx
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Textarea } from "@/shared";
import { BlockNoteEditor } from './BlockNoteEditor';
import { createArticle, updateArticle } from '../api/editor-actions';
import { articleSchema } from '../lib/validation';

interface ArticleEditorProps {
  article?: Article;
  mode: 'create' | 'edit';
}

export function ArticleEditor({ article, mode }: ArticleEditorProps) {
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState(article?.content || null);

  const form = useForm({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: article?.title || '',
      excerpt: article?.excerpt || '',
      topicId: article?.topicId || '',
      tagIds: article?.tags?.map(t => t.tag.id) || [],
      status: article?.status || 'DRAFT'
    }
  });

  const onSubmit = (data: ArticleFormData) => {
    startTransition(async () => {
      try {
        const articleData = { ...data, content };

        if (mode === 'create') {
          await createArticle(articleData);
        } else {
          await updateArticle(article!.id, articleData);
        }

        toast.success(
          mode === 'create'
            ? '記事を作成しました'
            : '記事を更新しました'
        );
      } catch (error) {
        toast.error('保存に失敗しました');
      }
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* メタデータフォーム */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>タイトル</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="記事のタイトルを入力..."
                        className="text-lg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="excerpt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>抜粋</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="記事の概要を入力..."
                        className="h-20"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              {/* トピック・タグ選択 */}
              <TopicSelector
                value={form.watch('topicId')}
                onChange={(topicId) => form.setValue('topicId', topicId)}
              />
              <TagSelector
                value={form.watch('tagIds')}
                onChange={(tagIds) => form.setValue('tagIds', tagIds)}
              />
            </div>
          </div>

          {/* エディター */}
          <div className="border rounded-lg">
            <BlockNoteEditor
              initialContent={content}
              onChange={setContent}
            />
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.setValue('status', 'DRAFT')}
              disabled={isPending}
            >
              下書き保存
            </Button>
            <Button
              type="submit"
              onClick={() => form.setValue('status', 'PUBLISHED')}
              disabled={isPending}
            >
              {isPending && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
              公開
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

### 3.2 認証コンポーネント

#### 3.2.1 LoginForm

```typescript
// src/features/auth/ui/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Button, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Input, Alert, AlertDescription } from "@/shared";
import { loginSchema } from '../lib/validation';

export function LoginForm() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false
      });

      if (result?.error) {
        setError('メールアドレスまたはパスワードが正しくありません');
        return;
      }

      // 成功時はリダイレクト
      window.location.href = '/dashboard';
    } catch (error) {
      setError('ログインに失敗しました。しばらく時間をおいてから再度お試しください');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">ログイン</h1>
            <p className="text-muted-foreground mt-2">
              Works Logueにログインしてください
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircleIcon className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@works-logue.com"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="パスワードを入力"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading && <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />}
            ログイン
          </Button>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              アカウントをお持ちでない方は{' '}
              <Link href="/signup" className="underline hover:text-primary">
                こちら
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}
```

---

## 変更履歴

| 日付       | バージョン | 変更者   | 変更内容                                       |
| ---------- | ---------- | -------- | ---------------------------------------------- |
| 2026-01-24 | 1.0        | システム | 内部設計書からコンポーネント設計を分離・独立化 |
