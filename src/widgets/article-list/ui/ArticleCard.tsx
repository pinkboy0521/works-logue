"use client";

// import Image from "next/image";
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
    <Link href={`/${article.user.userId}/articles/${article.id}`} className="block">
  <Card className="group overflow-hidden transition-colors hover:bg-muted/60 focus-within:ring-2 focus-within:ring-primary/30">
    <CardContent className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {article.topic.name}
          </Badge>
        </div>

        <CardTitle className="mb-2 text-2xl line-clamp-2 leading-snug">
          {article.title}
        </CardTitle>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          {getContentPreview(article.content)}
        </p>

        {article.tags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
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

        <div className="flex items-center justify-between gap-3">
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

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="whitespace-nowrap">
              {formatDate(article.publishedAt)}
            </span>

            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{article.viewCount}</span>
            </div>

            {/* リアクションボタン：カード遷移と分離 */}
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="shrink-0"
            >
              <ArticleReactions
                articleId={article.id}
                likeCount={article.likeCount}
                bookmarkCount={article.bookmarkCount || 0}
                isLikedByUser={article.reactions?.isLikedByUser || false}
                isBookmarkedByUser={article.reactions?.isBookmarkedByUser || false}
                isLoggedIn={article.reactions?.isLoggedIn || false}
                size="sm"
                layout="horizontal"
                showCounts
              />
            </div>
          </div>
        </div>
      </CardContent>

      {/* サムネイル表示（コメントアウト） */}
      {/* <div
        className={[
          "hidden sm:flex items-center justify-end pr-5", // 右寄せ＆縦中央
          "h-full min-h-[160px] shrink-0",               // カードの高さに追従
          article.topImageUrl ? "" : "",                 // 見た目は後で制御
        ].join(" ")}
        aria-hidden={!article.topImageUrl}
      >
        <div
          className={[
            "relative w-[220px] aspect-video",           // ← 横長（16:9）
            article.topImageUrl
              ? "overflow-hidden rounded-md bg-muted"
              : "invisible", // 枠は確保するけど表示しない（スペースは維持）
          ].join(" ")}
        >
          {article.topImageUrl && (
            <Image
              src={article.topImageUrl}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="220px"
              quality={85}
            />
          )}
        </div>
      </div> */}
  </Card>
</Link>

  );
}
