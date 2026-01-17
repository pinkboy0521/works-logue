import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Badge,
  Button,
} from "@/shared";
import {
  getUserStatsByUserId,
  getArticlesPaginated,
  AuthorCard,
  type UserWithStats,
  type PublishedArticleListItem,
} from "@/entities";
import Image from "next/image";

interface AuthorProfilePageProps {
  userId: string;
  page?: number;
}

/**
 * 著者プロフィールページ（記事一覧統合）
 */
export async function AuthorProfilePage({
  userId,
  page = 1,
}: AuthorProfilePageProps) {
  const userWithStats = await getUserStatsByUserId(userId);

  // ユーザーが見つからない場合は404
  if (!userWithStats) {
    notFound();
  }

  // 記事一覧を取得
  const articlesData = await getArticlesPaginated({
    page,
    userId: userWithStats.id,
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-8">
        {/* プロフィールヘッダー */}
        <AuthorHeader user={userWithStats} />

        {/* 統計情報 */}
        {/* <AuthorStats stats={userWithStats} /> */}

        {/* プロフィール詳細 */}
        <AuthorDetails user={userWithStats} />

        {/* 記事一覧セクション */}
        <AuthorArticlesSection
          articles={articlesData.articles}
          pagination={articlesData.pagination}
          userId={userId}
        />
      </div>
    </div>
  );
}

/**
 * 著者ヘッダー（アバター・名前・基本情報）
 */
function AuthorHeader({ user }: { user: UserWithStats }) {
  const initials = user.displayName?.slice(0, 1) || "";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.image || ""} alt={user.displayName || ""} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {user.displayName || "Anonymous"}
            </h1>
            <p className="text-muted-foreground">@{user.userId}</p>
          </div>

          {user.bio && (
            <p className="text-center max-w-2xl text-muted-foreground">
              {user.bio}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 著者詳細情報
 */
function AuthorDetails({ user }: { user: UserWithStats }) {
  const hasAdditionalInfo = user.website || user.location || user.statusMessage;

  if (!hasAdditionalInfo) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>プロフィール詳細</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {user.statusMessage && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              ひとこと
            </p>
            <p className="text-sm">{user.statusMessage}</p>
          </div>
        )}

        {user.location && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              居住地
            </p>
            <p className="text-sm">{user.location}</p>
          </div>
        )}

        {user.website && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              ウェブサイト
            </p>
            <Link
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {user.website}
            </Link>
          </div>
        )}

        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            参加日
          </p>
          <p className="text-sm">
            {user.createdAt.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 著者記事一覧セクション
 */
function AuthorArticlesSection({
  articles,
  pagination,
  userId,
}: {
  articles: PublishedArticleListItem[];
  pagination: { page: number; totalPages: number; total: number };
  userId: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>記事一覧</CardTitle>
        <p className="text-muted-foreground">全 {pagination.total} 件の記事</p>
      </CardHeader>
      <CardContent>
        {articles.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  {pagination.page > 1 && (
                    <Link href={`/${userId}?page=${pagination.page - 1}`}>
                      <Button variant="outline">前へ</Button>
                    </Link>
                  )}
                  <span className="flex items-center px-4 py-2 text-sm text-muted-foreground">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  {pagination.page < pagination.totalPages && (
                    <Link href={`/${userId}?page=${pagination.page + 1}`}>
                      <Button variant="outline">次へ</Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              まだ記事が投稿されていません。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 記事カードコンポーネント
 */
function ArticleCard({ article }: { article: PublishedArticleListItem }) {
  return (
    <Card className="h-full">
      {article.topImageUrl && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <Image
            src={article.topImageUrl}
            alt={article.title}
            width={400}
            height={225}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          {article.topic && (
            <Badge variant="secondary">{article.topic.name}</Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {article.publishedAt &&
              new Date(article.publishedAt).toLocaleDateString("ja-JP")}
          </span>
        </div>
        <CardTitle className="line-clamp-2">
          <Link
            href={`/${article.user.userId}/articles/${article.id}`}
            className="hover:underline"
          >
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <AuthorCard
            user={{
              id: article.user.id,
              displayName: article.user.displayName,
              image: article.user.image,
              userId: article.user.userId || "",
            }}
            size="small"
            clickable={false}
          />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>👀 {article.viewCount}</span>
            <span>❤️ {article.likeCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
