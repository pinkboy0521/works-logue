"use client";

import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Card,
  CardContent,
} from "@/shared";
import { ArticleWithDetails, ArticleMeta, RelatedArticle } from "@/entities";
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
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-medium bg-primary/10 text-primary rounded-full">
            {article.topic.name}
          </span>
        </div>

        {/* タイトル */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
          {article.title}
        </h1>

        {/* メタ情報 */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-b border-border pb-4">
          <div className="flex items-center gap-4">
            {/* 著者情報 */}
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={article.user.image || undefined}
                  alt={article.user.name || "ユーザー"}
                />
                <AvatarFallback>
                  {article.user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-foreground">
                {article.user.name || "Anonymous"}
              </span>
            </div>

            {/* 公開日時 */}
            <div className="flex items-center gap-1">
              <time>{publishedDate}</time>
            </div>
          </div>

          {/* 統計情報 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-gray-400">👀</span>
              <span>{article.viewCount.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-400">❤️</span>
              <span>{article.likeCount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* タグ */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {article.tags.map((articleTag) => (
              <span
                key={articleTag.tag.id}
                className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded"
              >
                {articleTag.tag.name}
              </span>
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
            quality={95}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/mhz8="
          />
        </div>
      )}

      {/* 記事コンテンツ */}
      <Card>
        <CardContent className="p-6 md:p-8">
          {article.content ? (
            <div className="prose prose-lg max-w-none prose-gray">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  // カスタムコンポーネントでスタイルを調整
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mb-4 text-foreground">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mb-3 text-foreground mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mb-2 text-foreground mt-4">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-4 leading-relaxed text-muted-foreground">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-1">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-muted-foreground">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-border pl-4 mb-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="px-1 py-0.5 bg-muted text-foreground rounded text-sm font-mono">
                        {children}
                      </code>
                    ) : (
                      <code className={className}>{children}</code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="mb-4 p-4 bg-muted rounded-lg overflow-x-auto">
                      {children}
                    </pre>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      className="text-primary hover:text-primary/80 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="min-w-full border-collapse border border-border">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border px-4 py-2 bg-muted font-semibold text-left text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border px-4 py-2 text-muted-foreground">
                      {children}
                    </td>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              記事の内容がありません。
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
                alt={article.user.name || "ユーザー"}
              />
              <AvatarFallback className="text-lg">
                {article.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-muted-foreground">この記事を書いた人</p>
              <h3 className="text-lg font-semibold text-foreground">
                {article.user.name || "Anonymous"}
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
              <Card key={relatedArticle.id} className="overflow-hidden">
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
                        alt={relatedArticle.user.name || "ユーザー"}
                      />
                      <AvatarFallback className="text-xs">
                        {relatedArticle.user.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{relatedArticle.user.name}</span>
                    <span>•</span>
                    <span>{relatedArticle.topic.name}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
