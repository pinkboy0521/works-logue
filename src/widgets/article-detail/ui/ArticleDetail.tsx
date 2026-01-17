"use client";

import Link from "next/link";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
  Badge,
} from "@/shared";
import { ArticleWithDetails, ArticleMeta, RelatedArticle, AuthorCard } from "@/entities";
import { BlockNoteRenderer } from "./BlockNoteRenderer";
import Image from "next/image";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface ArticleDetailProps {
  article: ArticleWithDetails;
  relatedArticles?: RelatedArticle[];
  meta?: ArticleMeta;
}

export function ArticleDetail({
  article,
  relatedArticles = [],
  meta,
}: ArticleDetailProps) {
  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), "yyyy年M月d日", {
        locale: ja,
      })
    : "日時不明";

  return (
    <article className="space-y-8">
      {/* ヘッダー情報 */}
      <header className="space-y-6">
        {/* トピック */}
        {article.topic && (
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
              {article.topic.name}
            </span>
          </div>
        )}

        {/* タイトル */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {article.title}
        </h1>

        {/* メタ情報 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border pb-4">
          <div className="flex items-center gap-4">
            {/* 著者情報 */}
            <AuthorCard
              user={{
                id: article.user.id,
                displayName: article.user.displayName,
                image: article.user.image,
                userId: article.user.userId || "",
              }}
              size="medium"
            />

            {/* 公開日時 */}
            <div className="flex items-center gap-1">
              <time>{publishedDate}</time>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">👀</span>
              <span>{article.viewCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">❤️</span>
              <span>{article.likeCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* タグ */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((articleTag) => (
              <Badge key={articleTag.tag.id} variant="secondary">
                {articleTag.tag.name}
              </Badge>
            ))}
          </div>
        )}
      </header>

      {/* トップ画像 */}
      {article.topImageUrl && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
          <Image
            src={article.topImageUrl}
            alt={article.title}
            fill
            className="object-cover"
            priority
            quality={90}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/mhz8="
          />
        </div>
      )}

      {/* 記事コンテンツ */}
      <Card>
        <CardContent className="p-6 md:p-8">
          {article.content && article.content.length > 0 ? (
            <BlockNoteRenderer blocks={article.content} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              記事の内容がありません
            </div>
          )}
        </CardContent>
      </Card>

      {/* 著者情報 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={article.user.image || undefined}
                alt={article.user.displayName || "ユーザー"}
              />
              <AvatarFallback className="text-lg">
                {article.user.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-muted-foreground">この記事を書いた人</p>
              <h3 className="text-lg font-semibold text-foreground">
                {article.user.displayName || "Anonymous"}
              </h3>
              {/* メタ情報 */}
              {meta && (
                <p className="text-sm text-muted-foreground mt-1">
                  読了時間: 約{meta.readingTime}分 | 文字数:{" "}
                  {meta.wordCount.toLocaleString()}文字
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 関連記事 */}
      {relatedArticles.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-foreground mb-4">
            関連記事
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((relatedArticle) => (
              <Link
                key={relatedArticle.id}
                href={`/${relatedArticle.user.userId}/articles/${relatedArticle.id}`}
                className="block"
              >
                <Card className="overflow-hidden hover:bg-muted transition-colors">
                  <CardContent className="p-4">
                    {relatedArticle.topImageUrl && (
                      <div className="relative w-full h-32 mb-3 rounded overflow-hidden">
                        <Image
                          src={relatedArticle.topImageUrl}
                          alt={relatedArticle.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                      {relatedArticle.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={relatedArticle.user.image || undefined}
                          alt={relatedArticle.user.displayName || "ユーザー"}
                        />
                        <AvatarFallback className="text-xs">
                          {relatedArticle.user.displayName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span>{relatedArticle.user.displayName}</span>
                      <span>•</span>
                      <span>{relatedArticle.topic.name}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
