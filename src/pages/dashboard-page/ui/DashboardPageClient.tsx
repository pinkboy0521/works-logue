"use client";

import Link from "next/link";
import { Button, Card, formatDistanceToNow, ja } from "@/shared";
import { getUserWithAllArticles } from "@/entities";
import { createNewArticleAction, deleteArticleAction } from "@/features";

interface DashboardPageProps {
  user: NonNullable<Awaited<ReturnType<typeof getUserWithAllArticles>>>;
}

export function DashboardPageClient({ user }: DashboardPageProps) {
  const articles = user.articles;

  const formatArticleStatus = (status: string, publishedAt: Date | null) => {
    switch (status) {
      case "PUBLISHED":
        return `公開済み • ${
          publishedAt
            ? formatDistanceToNow(publishedAt, { locale: ja, addSuffix: true })
            : ""
        }`;
      case "DRAFT":
        return "下書き";
      case "PRIVATE":
        return "非公開";
      default:
        return status;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">記事管理</h1>
          <form action={createNewArticleAction}>
            <Button type="submit" className="cursor-pointer">
              新しい記事を書く
            </Button>
          </form>
        </div>

        {articles.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">まだ記事がありません</p>
            <form action={createNewArticleAction}>
              <Button type="submit" className="cursor-pointer">
                初めての記事を書く
              </Button>
            </form>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold mb-2 truncate">
                      {article.title || "無題の記事"}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                      <span>
                        {formatArticleStatus(
                          article.status,
                          article.publishedAt,
                        )}
                      </span>
                      <span>•</span>
                      <span>
                        {article.content
                          ? `${article.content.length} 文字`
                          : "0 文字"}
                      </span>
                      <span>•</span>
                      <span>
                        最終更新:{" "}
                        {formatDistanceToNow(article.updatedAt, {
                          locale: ja,
                          addSuffix: true,
                        })}
                      </span>
                      {article.topic && (
                        <>
                          <span>•</span>
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                            {article.topic.name}
                          </span>
                        </>
                      )}
                      {!article.topic && article.status === "PUBLISHED" && (
                        <>
                          <span>•</span>
                          <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded text-xs">
                            トピック未設定
                          </span>
                        </>
                      )}
                    </div>
                    {article.content && (
                      <p className="text-muted-foreground line-clamp-2">
                        {article.content.substring(0, 200)}...
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Link href={`/articles/${article.id}/edit`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                      >
                        編集
                      </Button>
                    </Link>
                    {article.status === "PUBLISHED" && (
                      <Link href={`/${user.id}/articles/${article.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="cursor-pointer"
                        >
                          表示
                        </Button>
                      </Link>
                    )}
                    <form
                      action={deleteArticleAction.bind(null, article.id)}
                      onSubmit={(e) => {
                        if (!confirm("この記事を削除してもよろしいですか？")) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <Button
                        variant="destructive"
                        size="sm"
                        type="submit"
                        className="cursor-pointer"
                      >
                        削除
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
