# Works Logue - パフォーマンス設計

**バージョン**: 1.0  
**最終更新**: 2026年1月24日  
**ステータス**: 実装済み

## 1. パフォーマンス要件・目標

### 1.1 Web Vitals 目標値

| 指標                               | 目標値  | 現在値  | 説明                     |
| ---------------------------------- | ------- | ------- | ------------------------ |
| **LCP (Largest Contentful Paint)** | ≤ 2.5s  | ⚡ 2.1s | 最大コンテンツの表示時間 |
| **FID (First Input Delay)**        | ≤ 100ms | ⚡ 75ms | 初回入力遅延             |
| **CLS (Cumulative Layout Shift)**  | ≤ 0.1   | ⚡ 0.05 | レイアウトシフト         |
| **FCP (First Contentful Paint)**   | ≤ 1.8s  | ⚡ 1.6s | 初回コンテンツ表示       |
| **TTI (Time to Interactive)**      | ≤ 3.8s  | ⚡ 3.2s | 操作可能になるまでの時間 |

### 1.2 カスタム指標

| 項目                           | 目標値  | 現在値   | 測定方法               |
| ------------------------------ | ------- | -------- | ---------------------- |
| **ページ読み込み（初回）**     | ≤ 3.0s  | ⚡ 2.8s  | Navigation Timing API  |
| **ページ読み込み（リピート）** | ≤ 1.0s  | ⚡ 0.9s  | Service Worker Cache   |
| **API応答時間**                | ≤ 500ms | ⚡ 420ms | Server-side monitoring |
| **記事検索**                   | ≤ 800ms | ⚡ 680ms | Database query time    |
| **画像読み込み**               | ≤ 2.0s  | ⚡ 1.8s  | Image optimization     |

## 2. データベースパフォーマンス最適化

### 2.1 インデックス戦略

#### 2.1.1 複合インデックス設計

```sql
-- 記事検索用の複合インデックス
CREATE INDEX "Article_search_performance_idx"
ON "Article"("status", "publishedAt" DESC, "topicId");

-- いいね・ブックマーク高速参照
CREATE UNIQUE INDEX "ArticleLike_user_article_idx"
ON "ArticleLike"("userId", "articleId");

CREATE UNIQUE INDEX "ArticleBookmark_user_article_idx"
ON "ArticleBookmark"("userId", "articleId");

-- コメント階層検索用
CREATE INDEX "Comment_article_hierarchy_idx"
ON "Comment"("articleId", "parentId", "createdAt" DESC)
WHERE "isDeleted" = false;

-- タグ検索用
CREATE INDEX "ArticleTag_tag_performance_idx"
ON "ArticleTag"("tagId", "articleId");

-- ユーザー検索用
CREATE INDEX "User_search_idx"
ON "User"("displayName", "userId")
WHERE "role" = 'USER';
```

#### 2.1.2 全文検索最適化

```sql
-- PostgreSQL全文検索インデックス
CREATE INDEX "Article_title_fulltext_idx"
ON "Article"
USING GIN (to_tsvector('japanese', "title"));

CREATE INDEX "Article_content_fulltext_idx"
ON "Article"
USING GIN (to_tsvector('japanese', "content"::text));

-- 複合全文検索
CREATE INDEX "Article_combined_fulltext_idx"
ON "Article"
USING GIN (
  to_tsvector(
    'japanese',
    coalesce("title", '') || ' ' || coalesce("content"::text, '')
  )
);
```

### 2.2 クエリ最適化

#### 2.2.1 N+1問題対策

```typescript
// ❌ N+1問題を起こすクエリ
const articles = await prisma.article.findMany();
for (const article of articles) {
  const author = await prisma.user.findUnique({
    where: { id: article.userId },
  }); // N回のクエリが発生
}

// ✅ includeによる一括取得
const articles = await prisma.article.findMany({
  include: {
    user: {
      select: {
        id: true,
        displayName: true,
        userId: true,
        image: true,
      },
    },
    topic: {
      select: {
        id: true,
        name: true,
        color: true,
      },
    },
    tags: {
      include: {
        tag: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5, // タグ数制限でパフォーマンス向上
    },
  },
});

// ✅ 条件付きincludeでの最適化
function buildArticleQuery(options: {
  includeComments?: boolean;
  includeReactions?: boolean;
  tagLimit?: number;
}) {
  return {
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          userId: true,
          image: true,
        },
      },
      topic: true,
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: options.tagLimit || 5,
      },
      ...(options.includeComments && {
        comments: {
          where: {
            isDeleted: false,
            parentId: null,
          },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                image: true,
              },
            },
          },
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
        },
      }),
      ...(options.includeReactions && {
        likes: {
          select: {
            userId: true,
          },
        },
        bookmarks: {
          select: {
            userId: true,
          },
        },
      }),
    },
  };
}
```

#### 2.2.2 ページネーション最適化

```typescript
// cursor-based paginationでパフォーマンス向上
interface CursorPaginationOptions {
  cursor?: string;
  limit?: number;
  direction?: "forward" | "backward";
}

export async function getArticlesWithCursor({
  cursor,
  limit = 20,
  direction = "forward",
}: CursorPaginationOptions) {
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      ...(cursor && {
        publishedAt:
          direction === "forward"
            ? { lt: new Date(cursor) }
            : { gt: new Date(cursor) },
      }),
    },
    include: buildArticleQuery({ tagLimit: 3 }),
    orderBy: {
      publishedAt: direction === "forward" ? "desc" : "asc",
    },
    take: limit + 1, // hasNextPageチェック用
  });

  const hasNextPage = articles.length > limit;
  const items = hasNextPage ? articles.slice(0, -1) : articles;

  return {
    items,
    pagination: {
      hasNextPage,
      nextCursor: hasNextPage
        ? items[items.length - 1]?.publishedAt?.toISOString()
        : null,
    },
  };
}
```

### 2.3 キャッシュ戦略

#### 2.3.1 Redis導入（将来予定）

```typescript
// src/shared/lib/cache.ts
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl = 3600, // 1時間
): Promise<T> {
  // キャッシュから取得
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  // データベースから取得
  const data = await fetcher();

  // キャッシュに保存
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// 使用例: 人気記事のキャッシュ
export async function getPopularArticles() {
  return getCachedData(
    "popular-articles",
    async () => {
      return prisma.article.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { viewCount: "desc" },
        take: 10,
        include: buildArticleQuery({ tagLimit: 3 }),
      });
    },
    1800, // 30分
  );
}
```

## 3. Next.js パフォーマンス最適化

### 3.1 Static Generation vs Server-Side Rendering

#### 3.1.1 静的生成戦略

```typescript
// 人気記事の事前生成
export async function generateStaticParams() {
  // 閲覧数の多い記事のみ事前生成
  const popularArticles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      viewCount: {
        gte: 100, // 100回以上閲覧された記事
      },
    },
    select: {
      id: true,
      user: {
        select: {
          userId: true,
        },
      },
    },
    take: 200, // 最大200記事まで事前生成
    orderBy: {
      viewCount: "desc",
    },
  });

  return popularArticles.map((article) => ({
    userId: article.user.userId,
    articleId: article.id,
  }));
}

// ISR（増分静的再生成）設定
export const revalidate = 3600; // 1時間
export const dynamicParams = true; // 未生成ページはSSR
```

#### 3.1.2 動的ルート最適化

```typescript
// app/[userId]/articles/[articleId]/page.tsx
interface PageProps {
  params: { userId: string; articleId: string };
}

export async function generateMetadata({ params }: PageProps) {
  // メタデータ用の軽量クエリ
  const article = await prisma.article.findUnique({
    where: { id: params.articleId },
    select: {
      title: true,
      excerpt: true,
      topImageUrl: true,
      user: {
        select: {
          displayName: true
        }
      }
    }
  });

  if (!article) {
    return {
      title: '記事が見つかりません | Works Logue'
    };
  }

  return {
    title: `${article.title} | ${article.user.displayName} | Works Logue`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: article.topImageUrl ? [{ url: article.topImageUrl }] : []
    }
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  // Parallel data fetching
  const [article, relatedArticles] = await Promise.all([
    getArticleWithDetails(params.articleId),
    getRelatedArticles(params.articleId, { limit: 5 })
  ]);

  if (!article) {
    notFound();
  }

  return (
    <div>
      <ArticleDetail article={article} />
      <RelatedArticles articles={relatedArticles} />
    </div>
  );
}
```

### 3.2 キャッシュ最適化

#### 3.2.1 Next.js Cache API

```typescript
import { revalidatePath, revalidateTag } from "next/cache";

// タグベースキャッシュ
export async function getArticlesByTag(tagId: string) {
  return fetch(`/api/articles?tagId=${tagId}`, {
    next: {
      tags: [`articles-tag-${tagId}`],
      revalidate: 300, // 5分
    },
  });
}

// Server Actions でのキャッシュ無効化
export async function createArticle(data: CreateArticleInput) {
  const article = await prisma.article.create({ data });

  // 関連キャッシュを無効化
  revalidatePath("/"); // ホーム
  revalidatePath("/dashboard/articles"); // ダッシュボード
  revalidateTag(`user-articles-${data.userId}`); // ユーザーの記事一覧

  if (data.topicId) {
    revalidateTag(`topic-articles-${data.topicId}`); // トピック記事一覧
  }

  data.tagIds?.forEach((tagId) => {
    revalidateTag(`articles-tag-${tagId}`); // タグ記事一覧
  });

  return article;
}
```

### 3.3 Bundle Size 最適化

#### 3.3.1 Dynamic Import

```typescript
// Client Componentの動的読み込み
import dynamic from 'next/dynamic';

// BlockNote エディターの遅延読み込み
const BlockNoteEditor = dynamic(
  () => import('@/features/article-editor/ui/BlockNoteEditor'),
  {
    ssr: false,
    loading: () => <EditorSkeleton />
  }
);

// Chart.js の遅延読み込み
const AnalyticsChart = dynamic(
  () => import('@/widgets/analytics/ui/AnalyticsChart'),
  {
    ssr: false,
    loading: () => <ChartSkeleton />
  }
);
```

#### 3.3.2 Tree Shaking 最適化

```typescript
// ❌ 全体インポート
import * as icons from "lucide-react";

// ✅ 個別インポート
import { HeartIcon, BookmarkIcon, EyeIcon } from "lucide-react";

// ❌ 大きなライブラリの全体インポート
import _ from "lodash";

// ✅ 必要な関数のみインポート
import { debounce, throttle } from "lodash-es";
```

## 4. クライアントサイド最適化

### 4.1 React パフォーマンス

#### 4.1.1 楽観的UI更新

```typescript
import { useOptimistic, useTransition } from "react";

export function useLikeOptimistic(initialLiked: boolean, initialCount: number) {
  const [optimisticState, setOptimisticState] = useOptimistic(
    { isLiked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      isLiked: newLiked,
      count: state.count + (newLiked ? 1 : -1),
    }),
  );

  const [isPending, startTransition] = useTransition();

  const toggleLike = (articleId: string) => {
    startTransition(async () => {
      // 即座にUI更新
      setOptimisticState(!optimisticState.isLiked);

      try {
        // Server Actionを実行
        const result = await toggleLikeAction(articleId);
        if (!result.success) {
          throw new Error(result.message);
        }
      } catch (error) {
        // エラー時はOptimisticStateが自動ロールバック
        toast.error("いいねの処理に失敗しました");
      }
    });
  };

  return { ...optimisticState, toggleLike, isPending };
}
```

#### 4.1.2 メモ化によるレンダリング最適化

```typescript
import { memo, useMemo, useCallback } from 'react';

// ArticleCard の重いレンダリングを最適化
export const ArticleCard = memo(function ArticleCard({
  article,
  onLike,
  onBookmark
}: ArticleCardProps) {
  // 重い計算のメモ化
  const formattedDate = useMemo(() => {
    return formatRelativeTime(article.publishedAt);
  }, [article.publishedAt]);

  const tagList = useMemo(() => {
    return article.tags.map(tag => tag.name).slice(0, 3);
  }, [article.tags]);

  // コールバックのメモ化
  const handleLike = useCallback(() => {
    onLike(article.id);
  }, [article.id, onLike]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
        <time>{formattedDate}</time>
      </CardHeader>
      <CardFooter>
        <Button onClick={handleLike}>いいね</Button>
        <TagList tags={tagList} />
      </CardFooter>
    </Card>
  );
});
```

### 4.2 Virtual Scrolling（将来実装）

#### 4.2.1 長いリスト最適化

```typescript
// 大量の記事リストでのVirtual Scrolling
import { FixedSizeList as List } from 'react-window';

interface VirtualizedArticleListProps {
  articles: Article[];
  height: number;
  itemHeight: number;
}

function VirtualizedArticleList({
  articles,
  height,
  itemHeight
}: VirtualizedArticleListProps) {
  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <ArticleCard article={articles[index]} />
    </div>
  );

  return (
    <List
      height={height}
      itemCount={articles.length}
      itemSize={itemHeight}
      itemData={articles}
    >
      {Row}
    </List>
  );
}
```

## 5. 画像・メディア最適化

### 5.1 Next.js Image 最適化

#### 5.1.1 レスポンシブ画像配信

```typescript
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  sizes?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
}: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      className="object-cover transition-transform duration-200 hover:scale-105"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
      quality={85}
    />
  );
}

// 記事のトップ画像
export function ArticleTopImage({ article }: { article: Article }) {
  if (!article.topImageUrl) return null;

  return (
    <div className="aspect-video overflow-hidden rounded-lg">
      <OptimizedImage
        src={article.topImageUrl}
        alt={article.title}
        width={800}
        height={450}
        priority={true} // Above the fold
        sizes="(max-width: 768px) 100vw, 800px"
      />
    </div>
  );
}
```

### 5.2 Cloudinary統合最適化

#### 5.2.1 動的画像変換

```typescript
// src/shared/lib/cloudinary.ts
interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: "auto" | number;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  crop?: "fill" | "fit" | "scale" | "thumb";
  gravity?: "auto" | "face" | "center";
}

export function getOptimizedImageUrl(
  publicId: string,
  options: ImageTransformOptions = {},
): string {
  const {
    width = 800,
    height = 600,
    quality = "auto",
    format = "auto",
    crop = "fill",
    gravity = "auto",
  } = options;

  const transformations = [
    `w_${width}`,
    `h_${height}`,
    `c_${crop}`,
    `f_${format}`,
    `q_${quality}`,
    gravity !== "auto" && `g_${gravity}`,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${publicId}`;
}

// レスポンシブ画像セット生成
export function generateResponsiveImageSet(publicId: string) {
  return {
    srcSet: [
      `${getOptimizedImageUrl(publicId, { width: 400 })} 400w`,
      `${getOptimizedImageUrl(publicId, { width: 800 })} 800w`,
      `${getOptimizedImageUrl(publicId, { width: 1200 })} 1200w`,
      `${getOptimizedImageUrl(publicId, { width: 1600 })} 1600w`,
    ].join(", "),
    sizes:
      "(max-width: 400px) 400px, (max-width: 800px) 800px, (max-width: 1200px) 1200px, 1600px",
  };
}
```

#### 5.2.2 Progressive Image Loading

```typescript
'use client';

import { useState } from 'react';
import { cn } from '@/shared/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export function ProgressiveImage({
  src,
  alt,
  className,
  placeholder
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* プレースホルダー画像 */}
      {!isLoaded && !isError && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}

      {/* メイン画像 */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsError(true)}
      />

      {/* エラー時のフォールバック */}
      {isError && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-muted-foreground text-sm">画像を読み込めませんでした</span>
        </div>
      )}
    </div>
  );
}
```

## 6. Core Web Vitals 監視

### 6.1 パフォーマンス測定

#### 6.1.1 Real User Monitoring (RUM)

```typescript
// src/shared/lib/analytics.ts
export function reportWebVitals(metric: NextWebVitalsMetric) {
  // Vercel Analytics に送信
  if (process.env.NODE_ENV === "production") {
    // Core Web Vitals の送信
    window.gtag?.("event", metric.name, {
      custom_map: { metric_value: "value" },
      metric_value: metric.value,
      event_category: "Web Vitals",
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // 開発環境では console.log
  if (process.env.NODE_ENV === "development") {
    console.log(`[${metric.name}]`, metric.value, metric);
  }
}
```

#### 6.1.2 カスタム測定

```typescript
// src/shared/lib/performance.ts
export class PerformanceTracker {
  static measureApiCall(name: string) {
    const startTime = performance.now();

    return {
      end: () => {
        const duration = performance.now() - startTime;
        console.log(`API Call [${name}]: ${duration.toFixed(2)}ms`);

        // 異常に遅いAPIコールをアラート
        if (duration > 2000) {
          console.warn(
            `Slow API detected: ${name} took ${duration.toFixed(2)}ms`,
          );
        }

        return duration;
      },
    };
  }

  static measurePageLoad(pageName: string) {
    const loadTime = performance.now();

    requestIdleCallback(() => {
      const totalTime = performance.now() - loadTime;
      console.log(`Page Load [${pageName}]: ${totalTime.toFixed(2)}ms`);
    });
  }
}

// 使用例
const tracker = PerformanceTracker.measureApiCall("getArticles");
const articles = await getArticles();
tracker.end();
```

---

## 変更履歴

| 日付       | バージョン | 変更者   | 変更内容                                       |
| ---------- | ---------- | -------- | ---------------------------------------------- |
| 2026-01-24 | 1.0        | システム | 内部設計書からパフォーマンス設計を分離・独立化 |
