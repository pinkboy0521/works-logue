"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import { Badge, Card, CardContent, CardTitle } from "@/shared";
import { ArticleContent, AuthorCard } from "@/entities";
import { ArticleReactions } from "@/features";

type ArticleWithReactions = {
  id: string;
  title: string;
  content: ArticleContent; // BlockNote JSON (PartialBlock[])
  topImageUrl: string | null;
  publishedAt: Date | null;
  viewCount: number;
  likeCount: number;
  bookmarkCount: number;
  user: {
    id: string;
    displayName: string | null;
    image: string | null;
    userId: string | null;
  };
  topic: {
    id: string;
    name: string;
  };
  tags: {
    tag: {
      id: string;
      name: string;
    };
  }[];
  // リアクション情報（サーバーサイドで取得）
  reactions?: {
    isLoggedIn: boolean;
    isLikedByUser: boolean;
    isBookmarkedByUser: boolean;
  };
};

interface ArticleCardProps {
  article: ArticleWithReactions;
}

export function ArticleCard({ article }: ArticleCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "日時不明";
    return new Intl.DateTimeFormat("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  const getContentPreview = (content: ArticleContent): string => {
    if (Array.isArray(content)) {
      const text = content
        .map((block: Record<string, unknown>) => {
          if (block?.type === "paragraph" && block?.content) {
            const blockContent = Array.isArray(block.content)
              ? block.content
              : [block.content];
            return blockContent
              .map((item: Record<string, unknown>) => item?.text || "")
              .join("");
          }
          return "";
        })
        .join(" ");
      return text.length > 100
        ? text.substring(0, 100) + "..."
        : text || "内容がありません...";
    }
    return "内容がありません...";
  };

  return (
    <Link
      href={`/${article.user.userId}/articles/${article.id}`}
      className="block"
    >
      <Card className="hover:bg-muted transition-all duration-300 cursor-pointer">
        <div className="flex">
          {/* コンテンツ部分（左側） */}
          <CardContent className="flex-1 p-6">
            <div className="mb-3">
              <Badge variant="secondary" className="text-primary bg-primary/10">
                {article.topic.name}
              </Badge>
            </div>

            <CardTitle className="mb-2 line-clamp-2 leading-snug">
              {article.title}
            </CardTitle>

            <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
              {getContentPreview(article.content)}
            </p>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {article.tags.slice(0, 3).map(({ tag }) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{article.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex items-center justify-between">
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

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="whitespace-nowrap">
                  {formatDate(article.publishedAt)}
                </span>

                {/* 閲覧数 */}
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span>{article.viewCount}</span>
                </div>

                {/* リアクションボタン */}
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <ArticleReactions
                    articleId={article.id}
                    likeCount={article.likeCount}
                    bookmarkCount={article.bookmarkCount || 0}
                    isLikedByUser={article.reactions?.isLikedByUser || false}
                    isBookmarkedByUser={
                      article.reactions?.isBookmarkedByUser || false
                    }
                    isLoggedIn={article.reactions?.isLoggedIn || false}
                    size="sm"
                    layout="horizontal"
                    showCounts={true}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          {/* サムネイル画像（右側） */}
          {article.topImageUrl && (
            <div className="relative w-48 h-40 flex-shrink-0">
              <Image
                src={article.topImageUrl}
                alt={article.title}
                fill
                className="object-cover rounded-r-lg"
                sizes="192px"
                quality={90}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R/mhz8="
              />
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
